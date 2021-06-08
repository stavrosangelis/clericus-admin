import React, { Component } from 'react';
import { UncontrolledTooltip, Progress, Button, Spinner } from 'reactstrap';
import axios from 'axios';
import PropTypes from 'prop-types';

const APIPath = process.env.REACT_APP_APIPATH;

export default class UploadFile extends Component {
  static onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  constructor(props) {
    super(props);

    this.state = {
      dragging: false,
      file: null,
      inputForm: [],
      progressVisible: false,
      progress: 0,
      uploading: false,
      uploadingBtn: (
        <span>
          <i className="fa fa-upload" /> Upload
        </span>
      ),
      errorVisible: false,
      errorText: [],
      imgSrc: null,
    };

    this.updateState = this.updateState.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.addFileUpload = this.addFileUpload.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.clearFile = this.clearFile.bind(this);

    this.inputOpenFileRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    const { openFileUpload } = this.state;
    if (prevState.openFileUpload !== openFileUpload && openFileUpload) {
      this.updateState();
    }
  }

  handleFileInput(e) {
    const { updateSystemType } = this.props;
    const { target } = e;
    const file = target.files[0];
    this.setState({
      file,
    });
    if (file.type === 'application/pdf') {
      updateSystemType('Document');
    }
  }

  onDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({ dragging: true });
    }
  }

  onDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragging: false });
  }

  onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const { updateSystemType } = this.props;
    let file = null;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > 0) {
        [file] = e.dataTransfer.files;
      }
      e.dataTransfer.clearData();
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.setState({
        imgSrc: reader.result,
      });
    };
    this.setState({
      dragging: false,
      file,
    });
    if (file.type === 'application/pdf') {
      updateSystemType('Document');
    }
  }

  updateState() {
    this.setState({
      inputForm: (
        <form encType="multipart/form-data">
          <input
            name="uploadimage"
            type="file"
            style={{ display: 'none' }}
            ref={this.inputOpenFileRef}
            onChange={this.handleFileInput}
          />
        </form>
      ),
      openFileUpload: false,
    });
    const context = this;
    setTimeout(() => {
      context.inputOpenFileRef.current.click();
    }, 50);
  }

  addFileUpload() {
    this.setState({
      openFileUpload: true,
    });
  }

  async uploadFile() {
    const { uploading, file } = this.state;
    const {
      _id,
      label,
      description,
      reference,
      reverseReference,
      systemType,
    } = this.props;
    if (uploading || file === null) {
      return false;
    }
    this.setState({
      uploading: true,
      uploadingBtn: (
        <span>
          <i className="fa fa-upload" /> <i>Uploading...</i>{' '}
          <Spinner size="sm" color="light" />
        </span>
      ),
    });
    const url = `${APIPath}upload-resource`;
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
    postData.append('systemType', JSON.stringify(systemType));
    const contentLength = postData.length;
    const context = this;
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
        context.setState({
          progressVisible: true,
          progress: percentCompleted,
        });
      },
    })
      .then((response) => response.data)
      .catch((response) => {
        console.log(response);
      });
    console.log(responseData);
    if (responseData.status) {
      this.setState({
        uploading: false,
        uploadingBtn: (
          <span>
            <i className="fa fa-upload" /> Upload success{' '}
            <i className="fa fa-check" />
          </span>
        ),
      });
      setTimeout(() => {
        context.setState({
          progressVisible: false,
          uploadingBtn: (
            <span>
              <i className="fa fa-upload" /> Upload
            </span>
          ),
        });

        context.props.uploadResponse(responseData);
      }, 1000);
    } else {
      let errorText = [];
      if (responseData.error && responseData.msg.length > 0) {
        errorText = responseData.msg.map((m, i) => {
          const key = `e${i}`;
          return <div key={key}>{m}</div>;
        });
      }
      this.setState({
        errorVisible: true,
        errorText,
        uploading: false,
        uploadingBtn: (
          <span>
            <i className="fa fa-upload" /> Upload error{' '}
            <i className="fa fa-times" />
          </span>
        ),
      });

      setTimeout(() => {
        context.setState({
          progressVisible: false,
          uploadingBtn: (
            <span>
              <i className="fa fa-upload" /> Upload
            </span>
          ),
        });
      }, 1000);
    }
    return false;
  }

  clearFile() {
    this.setState({
      file: null,
    });
  }

  render() {
    const {
      dragging,
      progressVisible,
      file,
      errorVisible,
      errorText,
      inputForm,
      uploadingBtn,
      progress,
      imgSrc,
    } = this.state;
    let dragOverClass = '';
    let button = (
      <i
        className="pe-7s-plus"
        onClick={this.addFileUpload}
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
      uploadFileDetailsClass = '';
      uploadFileDetails = (
        <div>
          <UncontrolledTooltip placement="right" target="clear-file-btn">
            Clear file
          </UncontrolledTooltip>
          <div
            className="clear-uploaded-file"
            id="clear-file-btn"
            onClick={this.clearFile}
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

    let errorContainerClass = ' hidden';
    if (errorVisible) {
      errorContainerClass = '';
    }
    const errorContainer = (
      <div className={`error-container${errorContainerClass}`}>{errorText}</div>
    );
    const imgPreview =
      imgSrc === null ? (
        []
      ) : (
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
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
          onDragOver={this.constructor.onDragOver}
          onDrop={this.onDrop}
        >
          {imgPreview}
          {button}
        </div>
        <div className={`upload-file-details${uploadFileDetailsClass}`}>
          {uploadFileDetails}
        </div>
        <Button
          color="info"
          onClick={this.uploadFile}
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
      </div>
    );
  }
}
UploadFile.defaultProps = {
  updateSystemType: () => {},
  _id: '',
  label: '',
  description: '',
  reference: '',
  reverseReference: '',
  systemType: '',
};
UploadFile.propTypes = {
  updateSystemType: PropTypes.func,
  _id: PropTypes.string,
  label: PropTypes.string,
  description: PropTypes.string,
  reference: PropTypes.string,
  reverseReference: PropTypes.string,
  systemType: PropTypes.string,
};
