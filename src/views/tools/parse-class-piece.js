import React, { Component } from 'react';
import {Spinner, Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import {Link} from 'react-router-dom';
import { Redirect } from 'react-router';
import {Breadcrumbs} from '../../components/breadcrumbs';

import axios from 'axios';
const APIPath = process.env.REACT_APP_APIPATH;

export class ParseClassPiece extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      file: [],
      analyzeBtnText: <span>Analyze image</span>,
      analyzeBtnStatus: true,
      analyzeStatus: false,
      analyzeStep: 0,
      createThumbnailsBtnText: <span>Identify people</span>,
      createThumbnailsBtnStatus: false,
      identifyStep: 0,
      importDataBtnText: <span>Import data to database</span>,
      importDataBtnStatus: false,
      importDataStep: 0,
      faceBoxes: [],
      textBoxes: [],
      zoomSliderValue: 100,
      confirmModal: false,
      confirmModalTitle: '',
      confirmModalContent: [],
      confirmModalAction: this.confirmModalToggle,
      confirmModalBtn: [],
      redirect: false
    }
    this.loadFile = this.loadFile.bind(this);
    this.loadFaces = this.loadFaces.bind(this);
    this.analyzeFile = this.analyzeFile.bind(this);
    this.confirmReidentify = this.confirmReidentify.bind(this);
    this.redirectToIdentify = this.redirectToIdentify.bind(this);
    this.confirmModalToggle = this.confirmModalToggle.bind(this);
  }

  loadFile = () => {
    let fileName = this.props.match.params.fileName;
    let context = this;
    axios({
        method: 'get',
        url: APIPath+'list-class-piece?file='+fileName,
        crossDomain: true,
      })
  	  .then(function (response) {
        let responseData = response.data.data;
        let file = responseData[0];
        let analyzeBtnText = <span>Analyze image</span>;
        let createThumbnailsBtnStatus = false;
        let importDataBtnStatus = false;
        let analyzeStep = 0;
        if (file.faces!==null) {
          analyzeBtnText = <span>Re-analyze image</span>;
          createThumbnailsBtnStatus = true;
          analyzeStep = 1;
        }
        if (file.facesThumbnails && file.text!==null) {
          importDataBtnStatus = true;
        }
        context.setState({
          file: file,
          loading: false,
          analyzeBtnText: analyzeBtnText,
          analyzeStep: analyzeStep,
          createThumbnailsBtnStatus: createThumbnailsBtnStatus,
          importDataBtnStatus: importDataBtnStatus
        });
        context.loadFaces();
  	  })
  	  .catch(function (error) {
  	  });
  }

  loadFaces = () => {
    let facesFile = this.state.file.faces;
    let context = this;
    axios({
        method: 'get',
        url: facesFile,
        crossDomain: true,
      })
  	  .then(function (response) {
        let responseData = response.data;
        let thumbnailCount = 0;
        let dataCount = 0;
        for (let i=0;i<responseData.length; i++) {
          let face = responseData[i];
          if (typeof face.thumbnail!=="undefined") {
            thumbnailCount++;
          }
          if (typeof face.firstName!=="undefined") {
            dataCount++;
          }
        }
        if (responseData.length===thumbnailCount && responseData.length===dataCount) {
          context.setState({
            createThumbnailsBtnText: <span>Re-identify people</span>,
            identifyStep: 1
          })
        }
  	  })
  	  .catch(function (error) {
  	  });
  }

  analyzeFile = () => {
    if (this.state.analyzeStatus) {
      return false;
    }
    // confirm re-analysis
    if (this.state.analyzeStep===1 && !this.state.confirmModal) {
      this.setState({
        confirmModal: true,
        confirmModalTitle: 'Confirm image re-analysis',
        confirmModalContent: <p>This image will be submitted to google vision to be analyzed again.<br/> Continue?</p>,
        confirmModalAction: this.analyzeFile,
        confirmModalBtn: <span>Re-analyze image</span>
      });
      return false;
    }
    this.setState({
      analyzeBtnText: <span>Analyzing image... <Spinner size="sm" color="secondary" /></span>,
      analyzeStatus: true
    })
    let fileName = this.props.match.params.fileName;
    let context = this;
    axios({
        method: 'get',
        url: APIPath+'parse-class-piece?file='+fileName,
        crossDomain: true,
      })
  	  .then(function (response) {
        let responseData = response.data.data;
        let file = responseData[0];
        context.setState({
          analyzeBtnText:<span>Analysis complete</span>,
          file: file,
          loading: false
        });
        context.loadFile();
        setTimeout(function() {
          context.setState({
            analyzeBtnText: <span>Analyze image</span>,
          });
        },2000);

  	  })
  	  .catch(function (error) {
  	  });
  }

  confirmReidentify = () => {
    // confirm re-identification
    if (this.state.identifyStep===1 && !this.state.confirmModal) {
      this.setState({
        confirmModal: true,
        confirmModalTitle: 'Confirm people re-identification',
        confirmModalContent: <p>You are about to edit the people identified in this class piece.<br/> Continue?</p>,
        confirmModalAction: this.redirectToIdentify,
        confirmModalBtn: <span>Re-identify people</span>
      });
      return false;
    }
  }

  redirectToIdentify = () => {
    this.setState({
      redirect: true
    })
  }

  confirmModalToggle = () => {
    this.setState({
      confirmModal: !this.state.confirmModal
    });
  }

  componentDidMount() {
    this.loadFile();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.redirect) {
      this.setState({
        redirect: false
      });
    }
  }

  render() {
    let redirectElem = [];
    if (this.state.redirect) {
      redirectElem = <Redirect
        to={{
          pathname: "/parse-class-piece-thumbnails/"+this.props.match.params.fileName,
          state: {from: this.props.location}
        }} />;
    }
    let content = <div className="row">
      <div className="col-12">
        <div style={{padding: '40pt',textAlign: 'center'}}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>

    if (!this.state.loading) {
      let thumbnail = <img src={this.state.file.thumbnail} alt={this.state.file.name} className="img-thumbnail img-responsive" />;
      let analyzeBtn = [];
      if (this.state.analyzeBtnStatus) {
        analyzeBtn = <div><Button outline color="secondary" onClick={this.analyzeFile}>{this.state.analyzeBtnText}</Button></div>
      }
      let createThumbnailsBtn = [];
      if (this.state.createThumbnailsBtnStatus) {
        if (this.state.identifyStep===0) {
          createThumbnailsBtn = <div><Link className="btn btn-outline-secondary" href={"/parse-class-piece-thumbnails/"+this.props.match.params.fileName} to={"/parse-class-piece-thumbnails/"+this.props.match.params.fileName}>{this.state.createThumbnailsBtnText}</Link></div>
        }
        if (this.state.identifyStep===1) {
          createThumbnailsBtn = <div><button type="button" className="btn btn-outline-secondary" onClick={this.confirmReidentify} >{this.state.createThumbnailsBtnText}</button></div>
        }
      }
      let importDataBtn = [];
      if (this.state.importDataBtnStatus) {
        importDataBtn = <div><Link className="btn btn-outline-secondary" href={"/import-class-piece-to-db/"+this.props.match.params.fileName} to={"/import-class-piece-to-db/"+this.props.match.params.fileName}>{this.state.importDataBtnText}</Link></div>
      }
      content = <div className="row">
        <div className="col-xs-12 col-sm-6 col-md-4">{thumbnail}</div>
        <div className="col-xs-12 col-sm-6 col-md-8">
          <div className="classpiece-actions">
          {analyzeBtn}
          {createThumbnailsBtn}
          {importDataBtn}
          </div>
        </div>
      </div>
    }


    let fileName = this.props.match.params.fileName;
    let heading = "Class Piece \""+fileName+"\"";
    let breadcrumbsItems = [
      {label: "Parse Class Pieces", icon: "pe-7s-tools", active: false, path: "/parse-class-pieces"},
      {label: heading, icon: "", active: true, path: ""}
    ];
    return(
      <div>
        <Breadcrumbs items={breadcrumbsItems} />
        <div className="row">
          <div className="col-12">
            <h2>{heading}</h2>
          </div>
        </div>
        {redirectElem}
        {content}
        <Modal isOpen={this.state.confirmModal} toggle={this.confirmModalToggle}>
          <ModalHeader toggle={this.confirmModalToggle}>{this.state.confirmModalTitle}</ModalHeader>
          <ModalBody>{this.state.confirmModalContent}</ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.state.confirmModalAction}>{this.state.confirmModalBtn}</Button>{' '}
            <Button color="secondary" onClick={this.confirmModalToggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}
