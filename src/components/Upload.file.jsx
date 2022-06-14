import React, { useCallback, useState, useEffect, useRef } from 'react';
import { UncontrolledTooltip, Progress, Button, Spinner } from 'reactstrap';
import axios from 'axios';
import PropTypes from 'prop-types';

import '../assets/scss/upload.file.scss';

const { REACT_APP_APIPATH: APIPath } = process.env;

export default function UploadFile(props) {
  // props
  const {
    _id,
    label,
    description,
    reference,
    reverseReference,
    systemType,
    uploadResponse,
  } = props;

  // state
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [imgSrc, setImgSrc] = useState('');
  const [inputForm, setInputForm] = useState(null);
  const [openFileUpload, setOpenFileUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBtn, setUploadingBtn] = useState(
    <span>
      <i className="fa fa-upload" /> Upload
    </span>
  );
  const [progressVisible, setProgressVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState({
    visible: false,
    text: null,
  });

  const inputOpenFileRef = useRef(null);

  const handleFileInput = useCallback((e) => {
    const { target } = e;
    const [newFile] = target.files;
    setFile(newFile);
  }, []);

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { dataTransfer = null } = e;
    if (dataTransfer !== null) {
      const { items = [] } = dataTransfer;
      if (items.length > 0) {
        setDragging(true);
      }
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
    const { dataTransfer = null } = e;
    if (dataTransfer !== null) {
      const { files = [] } = dataTransfer;
      if (files.length > 0) {
        const [newFile] = files;
        e.dataTransfer.clearData();
        const reader = new FileReader();
        reader.readAsDataURL(newFile);
        reader.onload = () => {
          setImgSrc(reader.result);
        };
        setDragging(false);
        setFile(newFile);
      }
    }
  };

  const updateState = useCallback(() => {
    setInputForm(
      <form encType="multipart/form-data">
        <input
          name="uploadimage"
          type="file"
          style={{ display: 'none' }}
          ref={inputOpenFileRef}
          onChange={handleFileInput}
        />
      </form>
    );
    setOpenFileUpload(false);
    setTimeout(() => {
      inputOpenFileRef.current.click();
    }, 100);
  }, [handleFileInput]);

  useEffect(() => {
    if (openFileUpload) {
      setOpenFileUpload(false);
      updateState();
    }
  }, [openFileUpload, updateState]);

  const addFileUpload = () => {
    setOpenFileUpload(true);
  };

  const uploadFile = async () => {
    if (!uploading && file !== null) {
      setUploading(false);
      setUploadingBtn(
        <span>
          <i className="fa fa-upload" /> <i>Uploading...</i>{' '}
          <Spinner size="sm" color="light" />
        </span>
      );
      const postData = new FormData();
      postData.append('file', file);
      if (_id !== '') {
        postData.append('_id', _id);
      }
      if (label !== '') {
        postData.append('label', label);
      }
      if (description !== '') {
        postData.append('description', description);
      }
      if (typeof reference !== 'undefined') {
        postData.append('reference', JSON.stringify(reference));
      }
      if (typeof reverseReference !== 'undefined') {
        postData.append('reverseReference', JSON.stringify(reverseReference));
      }
      if (file.type === 'application/pdf') {
        postData.append('resourceType', 'Document');
      }
      postData.append('systemType', JSON.stringify(systemType));
      const { length: contentLength = 0 } = postData;
      const responseData = await axios({
        method: 'post',
        url: `${APIPath}upload-resource`,
        data: postData,
        crossDomain: true,
        config: {
          headers: {
            'Content-Length': contentLength,
            'Content-Type': 'multipart/form-data',
          },
        },
        onUploadProgress(progressEvent) {
          const { loaded = 0, total = 0 } = progressEvent;
          const percentCompleted = Math.round((loaded * 100) / total);
          if (!progressVisible) {
            setProgressVisible(true);
          }
          setProgress(percentCompleted);
        },
      })
        .then((response) => response.data)
        .catch((response) => {
          console.log(response);
        });
      const { status = false, error: rError = false, msg = [] } = responseData;
      setProgressVisible(false);
      if (status) {
        setUploading(false);
        setUploadingBtn(
          <span>
            <i className="fa fa-upload" /> Upload success{' '}
            <i className="fa fa-check" />
          </span>
        );
        uploadResponse(responseData);
      } else if (rError) {
        const errorText = msg.map((m, i) => {
          const key = `e${i}`;
          return <div key={key}>{m}</div>;
        });
        setError({
          visible: true,
          text: errorText,
        });
        setUploading(false);
        setUploadingBtn(
          <span>
            <i className="fa fa-upload" /> Upload error{' '}
            <i className="fa fa-times" />
          </span>
        );
      }
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  let dragOverClass = '';
  let button = (
    <i
      className="pe-7s-plus"
      onClick={addFileUpload}
      onKeyDown={() => false}
      role="button"
      tabIndex={0}
      aria-label="add file"
    />
  );
  if (dragging) {
    dragOverClass = ' over';
    button = <span>Drop image here</span>;
  }

  const progressClass = progressVisible ? '' : 'hidden';
  let uploadFileDetails = '';
  let uploadFileDetailsClass = ' hidden';
  if (file !== null) {
    const { name = '', size = '', type = '' } = file;
    uploadFileDetailsClass = '';
    uploadFileDetails = (
      <>
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
        <div className="upload-file-details-text">
          <b>Name: </b>
          {name}
          <br />
          <b>Size: </b>
          {size}
          <br />
          <b>Type: </b>
          {type}
        </div>
      </>
    );
  }

  const { visible: eVisible, text: eText } = error;
  const errorContainerClass = eVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{eText}</div>
  );

  const imgPreview =
    imgSrc === '' ? null : (
      <div className="file-preview">
        <img src={imgSrc} alt="preview" />
      </div>
    );

  return (
    <div>
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
        {imgPreview}
        {button}
      </div>
      <div className={`upload-file-details${uploadFileDetailsClass}`}>
        {uploadFileDetails}
      </div>
      <Button color="info" onClick={uploadFile} className="resource-upload-btn">
        {uploadingBtn}
      </Button>
      <Progress
        color="info"
        value={progress}
        className={`dropzone-progress ${progressClass}`}
      >
        {progress}%
      </Progress>
    </div>
  );
}
UploadFile.defaultProps = {
  _id: '',
  label: '',
  description: '',
  reference: '',
  reverseReference: '',
  systemType: '',
  uploadResponse: () => {},
};
UploadFile.propTypes = {
  _id: PropTypes.string,
  label: PropTypes.string,
  description: PropTypes.string,
  reference: PropTypes.string,
  reverseReference: PropTypes.string,
  systemType: PropTypes.string,
  uploadResponse: PropTypes.func,
};
