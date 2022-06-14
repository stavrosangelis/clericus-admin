import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';

function Dropfile(props) {
  // props
  const { fileTypes, returnValues, text } = props;
  // state
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [inputForm, setInputForm] = useState([]);
  const [openFileUpload, setOpenFileUpload] = useState(false);
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
    setFile(inputFile);
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

  const clearFile = () => {
    setFile(null);
    returnValues(null);
  };

  useEffect(() => {
    if (file !== null) {
      if (fileTypes.length > 0 && fileTypes.indexOf(file.type) === -1) {
        setErrorVisible(true);
        setErrorText(
          `The file type "${
            file.type
          }" is not allowed. Allowed file types are "${fileTypes.join(', ')}"`
        );
      } else {
        setErrorVisible(false);
        setErrorText('');
        returnValues(file);
        setFile(null);
      }
    }
  }, [file, fileTypes, returnValues]);

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
  let uploadFileDetails = '';
  let uploadFileDetailsClass = ' hidden';
  if (file !== null && !errorVisible) {
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
  const textOutput = text !== null ? text : '';
  return (
    <div className="dropzone-component">
      {inputForm}
      {errorContainer}
      <UncontrolledTooltip placement="right" target="dropzoneBox">
        Click the plus icon or drop a file in the box to upload a file
      </UncontrolledTooltip>
      <div
        className={`dropzone-target dropzone${dragOverClass}`}
        id="dropzoneBox"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {textOutput}
        {button}
      </div>
      <div className={`upload-file-details${uploadFileDetailsClass}`}>
        {uploadFileDetails}
      </div>
    </div>
  );
}

Dropfile.defaultProps = {
  text: null,
  fileTypes: [],
};

Dropfile.propTypes = {
  returnValues: PropTypes.func.isRequired,
  text: PropTypes.object,
  fileTypes: PropTypes.array,
};
export default Dropfile;
