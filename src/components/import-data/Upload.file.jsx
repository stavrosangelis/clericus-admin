import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  CardBody,
  Progress,
  Spinner,
  UncontrolledTooltip,
} from 'reactstrap';

const APIPath = process.env.REACT_APP_APIPATH;

// file types
const fileTypes = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

// text/csv
function UploadFile(props) {
  // props
  const { _id, update } = props;
  // state
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [inputForm, setInputForm] = useState([]);
  const [openFileUpload, setOpenFileUpload] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadingBtn, setUploadingBtn] = useState(
    <span>
      <i className="fa fa-upload" /> Upload
    </span>
  );
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState([]);
  const inputOpenFileRef = useRef(null);

  const handleFileInput = (e) => {
    const { target } = e;
    const inputFile = target.files[0];
    setFile(inputFile);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
    }
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let inputFile = null;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > 0) {
        [inputFile] = e.dataTransfer.files;
      }
      e.dataTransfer.clearData();
    }
    const reader = new FileReader();
    reader.readAsDataURL(inputFile);
    setDragging(false);

    if (fileTypes.length > 0 && fileTypes.indexOf(inputFile.type) === -1) {
      setErrorVisible(true);
      setErrorText(
        `The file type "${
          inputFile.type
        }" is not allowed. Allowed file types are "${fileTypes.join(', ')}"`
      );
      setFile(null);
    } else {
      setErrorVisible(false);
      setErrorText('');
      setFile(inputFile);
    }
  };

  const updateState = useCallback(() => {
    setInputForm(
      <form encType="multipart/form-data">
        <input
          name="uploadfile"
          type="file"
          style={{ display: 'none' }}
          ref={inputOpenFileRef}
          onChange={handleFileInput}
        />
      </form>
    );
    setOpenFileUpload(true);
    setTimeout(() => {
      inputOpenFileRef.current.click();
    }, 50);
  }, []);

  useEffect(() => {
    if (openFileUpload) {
      updateState();
    }
  }, [openFileUpload, updateState]);

  const addFileUpload = () => {
    setOpenFileUpload(true);
  };

  const uploadFile = async () => {
    if (uploading || file === null) {
      return false;
    }
    if (fileTypes.length > 0 && fileTypes.indexOf(file.type) === -1) {
      setErrorVisible(true);
      setErrorText(
        `The file type "${
          file.type
        }" is not allowed. Allowed file types are "${fileTypes.join(', ')}"`
      );
      return false;
    }
    setUploading(true);
    setUploadingBtn(
      <span>
        <i className="fa fa-upload" /> <i>Uploading...</i>{' '}
        <Spinner size="sm" color="light" />
      </span>
    );
    const url = `${APIPath}import-file-upload`;
    const postData = new FormData();
    postData.append('file', file);
    if (_id !== '') {
      postData.append('_id', _id);
    }
    const contentLength = postData.length;
    setProgressVisible(true);
    const responseData = await axios({
      method: 'post',
      url,
      data: postData,
      crossDomain: true,
      config: {
        headers: {
          'Content-Length': contentLength,
          'Content-Type': 'multipart/form-data',
        },
      },
      onUploadProgress(progressEvent) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percentCompleted);
      },
    })
      .then((response) => response.data)
      .catch((response) => {
        console.log(response);
      });
    if (responseData.status) {
      setUploading(false);
      setUploadingBtn(
        <span>
          <i className="fa fa-upload" /> Upload success{' '}
          <i className="fa fa-check" />
        </span>
      );
      setTimeout(() => {
        setProgressVisible(false);
        setUploadingBtn(
          <span>
            <i className="fa fa-upload" /> Upload
          </span>
        );
        update();
      }, 1000);
    } else {
      const errorOutput =
        responseData.error && responseData.msg.length > 0
          ? responseData.msg.map((m, i) => {
              const key = `e${i}`;
              return <div key={key}>{m}</div>;
            })
          : [];
      setErrorVisible(true);
      setErrorText(errorOutput);
      setUploading(false);
      setUploadingBtn(
        <span>
          <i className="fa fa-upload" /> Upload error{' '}
          <i className="fa fa-times" />
        </span>
      );

      setTimeout(() => {
        setProgressVisible(false);
        setUploadingBtn(
          <span>
            <i className="fa fa-upload" /> Upload
          </span>
        );
      }, 1000);
    }
    return false;
  };

  const clearFile = () => {
    setFile(null);
  };

  const dragOverClass = dragging ? ' over' : '';
  const button = dragging ? (
    <span className="dropzone-text">Drop file here</span>
  ) : (
    <i
      className="pe-7s-plus"
      onClick={addFileUpload}
      onKeyDown={() => false}
      role="button"
      tabIndex={0}
      aria-label="add file"
    />
  );
  const progressClass = progressVisible ? '' : 'hidden';
  let uploadFileDetails = '';
  let uploadFileDetailsClass = ' hidden';
  if (file !== null) {
    uploadFileDetailsClass = '';
    uploadFileDetails = (
      <div>
        <UncontrolledTooltip placement="right" target="clear-file-btn">
          Clear file
        </UncontrolledTooltip>
        <div
          className="clear-uploaded-file"
          id="clear-file-btn"
          onClick={clearFile}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="clear file"
        >
          <i className="fa fa-times" />
        </div>
        <b>Name: </b>
        {file.name}
        <br />
        <b>Size: </b>
        {file.size}
        <br />
        <b>Type: </b>
        {file.type}
      </div>
    );
  }
  const errorContainerClass = errorVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );
  return (
    <div className="item-details">
      <Card>
        <CardBody>
          {inputForm}
          {errorContainer}
          <UncontrolledTooltip placement="right" target="dropzoneBox">
            Click the plus icon or drop a file in the box to upload a file
          </UncontrolledTooltip>
          <div
            className={`dropzone${dragOverClass}`}
            id="dropzoneBox"
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            {button}
          </div>
          <div className={`upload-file-details${uploadFileDetailsClass}`}>
            {uploadFileDetails}
          </div>
          <Button
            color="info"
            onClick={uploadFile}
            className="resource-upload-btn"
          >
            {uploadingBtn}
          </Button>
          <Progress
            color="info"
            value={progress}
            className={`dropzone-progress ${progressClass}`}
          >
            {progress}%
          </Progress>
        </CardBody>
      </Card>
    </div>
  );
}

UploadFile.defaultProps = {
  _id: null,
  update: null,
};

UploadFile.propTypes = {
  _id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  update: PropTypes.func,
};
export default UploadFile;
