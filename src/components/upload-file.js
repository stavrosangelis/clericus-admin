import React, { Component } from 'react';
import { UncontrolledTooltip, Progress, Button, Spinner } from 'reactstrap';
import axios from 'axios';
const APIPath = process.env.REACT_APP_APIPATH;

export default class UploadFile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dragging: false,
      file: null,
      openFileUpload: false,
      inputForm: [],
      progressVisible: false,
      progress: 0,
      uploading: false,
      uploadingBtn: <span><i className="fa fa-upload" /> Upload</span>,
      errorVisible: false,
      errorText: [],
    }

    this.onDragOver = this.onDragOver.bind(this);
    this.onDragEnter = this.onDragEnter.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.addFileUpload = this.addFileUpload.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.clearFile = this.clearFile.bind(this);

    this.inputOpenFileRef = React.createRef();
  }

  onDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  onDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({dragging: true})
    }
  }

  onDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({dragging: false})
  }

  onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    let file = null;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length>0) {
        file = e.dataTransfer.files[0];
      }
      e.dataTransfer.clearData()
    }
    this.setState({
      dragging: false,
      file: file
    });
    if (file.type==="application/pdf") {
      this.props.updateSystemType("Document");
    }
  }

  addFileUpload() {
    this.setState({
      openFileUpload: true
    })
  }

  handleFileInput(e) {
    let target = e.target;
    let file = target.files[0];
    this.setState({
      file: file
    });    
    if (file.type==="application/pdf") {
      this.props.updateSystemType("Document");
    }
  }

  async uploadFile() {
    if (this.state.uploading || this.state.file===null) {
      return false;
    }
    this.setState({
      uploading: true,
      uploadingBtn: <span><i className="fa fa-upload" /> <i>Uploading...</i> <Spinner size="sm" color="light" /></span>
    });
    let url = APIPath+"upload-resource";
    let postData = new FormData();
    postData.append("file",this.state.file);
    if (typeof this.props.resource!=="undefined" && this.props.resource!==null) {
      if (typeof this.props.resource._id!=="undefined") {
        postData.append("_id", this.props.resource._id);
      }
    }
    if (this.props.label!=="") {
      postData.append("label", this.props.label);
    }
    if (this.props.description!=="") {
      postData.append("description", this.props.description);
    }
    if (typeof this.props.reference!=="undefined") {
      postData.append("reference", JSON.stringify(this.props.reference));
    }
    if (typeof this.props.reverseReference!=="undefined") {
      postData.append("reverseReference", JSON.stringify(this.props.reverseReference));
    }
    postData.append("systemType", JSON.stringify(this.props.systemType));
    var contentLength = postData.length;
    let context = this;
    let responseData = await axios({
      method: "post",
      url: url,
      data: postData,
      crossDomain: true,
      config: {
        headers: {
          'Content-Length': contentLength,
          'Content-Type': 'multipart/form-data'
        }
      },
      onUploadProgress: function (progressEvent){
        let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
        context.setState({
          progressVisible:true,
          progress: percentCompleted
        });
      }
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (response) {
        console.log(response);
    });
    if (responseData.status) {
      this.setState({
        uploading: false,
        uploadingBtn: <span><i className="fa fa-upload" /> Upload success <i className="fa fa-check" /></span>
      });
      setTimeout(function() {
        context.setState({
          progressVisible: false,
          uploadingBtn: <span><i className="fa fa-upload" /> Upload</span>
        });

        context.props.uploadResponse(responseData);
      },1000);
    }
    else {
      let errorText = [];
      if (responseData.error && responseData.msg.length>0) {
        errorText = responseData.msg.map((m,i)=>{
          return <div key={i}>{m}</div>
        });
      }
      this.setState({
        errorVisible: true,
        errorText: errorText,
        uploading: false,
        uploadingBtn: <span><i className="fa fa-upload" /> Upload error <i className="fa fa-times" /></span>
      });

      setTimeout(function() {
        context.setState({
          progressVisible: false,
          uploadingBtn: <span><i className="fa fa-upload" /> Upload</span>
        });
      },1000);
    }
  }

  clearFile() {
    this.setState({
      file: null
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.openFileUpload!==this.state.openFileUpload && this.state.openFileUpload) {
      this.setState({
        inputForm: <form encType="multipart/form-data">
          <input name="uploadimage" type="file" style={{display: "none"}} ref={this.inputOpenFileRef} onChange={this.handleFileInput} />
        </form>,
        openFileUpload: false
      });
      let context = this;
      setTimeout(function() {
        context.inputOpenFileRef.current.click();
      },50);
    }
  }

  render() {
    let dragOverClass = "";
    let button = <i className="pe-7s-plus" onClick={this.addFileUpload}/>;
    if (this.state.dragging) {
      dragOverClass = " over";
      button = <span>Drop image here</span>
    }
    let progressClass = "hidden";
    if (this.state.progressVisible) {
      progressClass = "";
    }
    let uploadFileDetails = "";
    let uploadFileDetailsClass = " hidden";
    if (this.state.file!==null) {
      uploadFileDetailsClass = "";
      uploadFileDetails = <div>
        <UncontrolledTooltip placement="right" target="clear-file-btn">
          Clear file
        </UncontrolledTooltip>
        <div className="clear-uploaded-file" id="clear-file-btn" onClick={this.clearFile}>
          <i className="fa fa-times" />
        </div>
        <b>Name: </b>{this.state.file.name}<br/>
        <b>Size: </b>{this.state.file.size}<br/>
        <b>Type: </b>{this.state.file.type}
      </div>

    }

    let errorContainerClass = " hidden";
    if (this.state.errorVisible) {
      errorContainerClass = "";
    }
    let errorContainer = <div className={"error-container"+errorContainerClass}>{this.state.errorText}</div>
    return (
      <div>
        {this.state.inputForm}
        {errorContainer}
        <UncontrolledTooltip placement="right" target="dropzoneBox">
          Click the plus icon or drop a file in the box to upload a file
        </UncontrolledTooltip>
        <div
          className={"dropzone"+dragOverClass}
          id="dropzoneBox"
          onDragEnter={this.onDragEnter}
          onDragLeave={this.onDragLeave}
          onDragOver={this.onDragOver}
          onDrop={this.onDrop}
          > 
          {button}
        </div>
        <div className={"upload-file-details"+uploadFileDetailsClass}>{uploadFileDetails}</div>
        <Button color="info" onClick={this.uploadFile} className="resource-upload-btn">{this.state.uploadingBtn}</Button>
        <Progress color="info" value={this.state.progress} className={"dropzone-progress "+progressClass}>{this.state.progress}%</Progress>
      </div>
    )
  }
}
