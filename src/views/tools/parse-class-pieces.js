import React, { Component } from 'react';
import { Card, CardImg, CardText, CardBody, Button} from 'reactstrap';
import { Link } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import {Breadcrumbs} from '../../components/breadcrumbs';

import axios from 'axios';

const APIPath = process.env.REACT_APP_APIPATH;

export default class ParseClassPieces extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      importSource: 0,
      updateThumbnailsText: <span>Import files</span>,
      updateThumbnailsText1: <span>Import</span>,
      importStatus: false,
    }
    this.loadFiles = this.loadFiles.bind(this);
    this.fileOutput = this.fileOutput.bind(this);
    this.selectedClassPiece = this.selectedClassPiece.bind(this);
    this.updateThumbnails = this.updateThumbnails.bind(this);
  }

  async loadFiles() {
    let data = await axios({
      method: 'get',
      url: APIPath+'list-class-pieces',
      crossDomain: true,
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
	  });

    let filesOutput = data.map((file,i)=>{
      return this.fileOutput(i, file);
    });
    this.setState({
      files: filesOutput,
    });
  }

  fileOutput(i, file) {
    let parseUrl = "/parse-class-piece/"+file.name;
    let fileOutput = <div key={i} className="col-12 col-sm-6 col-md-3">
      <Card style={{marginBottom: '15px'}}>
        <Link to={parseUrl} href={parseUrl} onClick={this.selectedClassPiece.bind(this, file)}><CardImg src={file.thumbnail} alt={file.name} /></Link>
        <CardBody>
          <CardText className="text-center">
            <label><Link to={parseUrl} href={parseUrl} onClick={this.selectedClassPiece.bind(this, file)}>{file.name}</Link></label>
          </CardText>
        </CardBody>
      </Card>
    </div>;
    return fileOutput;
  }

  selectedClassPiece(file) {
    this.setState({selectedClassPiece:file});
  }

  async updateThumbnails(src) {
    if (this.state.importStatus) {
      return false;
    }
    this.setState({
      updateThumbnailsText: <span><i>Importing...</i> <Spinner color="secondary" size="sm" /></span>,
      importStatus: true
    });

    let updateThumbs = await axios({
        method: 'get',
        url: APIPath+'create-thumbnails',
        crossDomain: true,
      })
	  .then(function (response) {
      return response;
	  })
	  .catch(function (error) {
	  });
    if(updateThumbs.data.status) {
      this.loadFiles();
      this.setState({
        updateThumbnailsText: <span>Import complete <i className="fa fa-check"></i></span>,
        importStatus: false
      });
      let context = this;
      setTimeout(function() {
        context.setState({
          updateThumbnailsText: <span>Import files</span>,
        });
      },2000);
    }
    else {
      this.setState({
        updateThumbnailsText: <span>Import error <i className="fa fa-times"></i></span>,
        importStatus: false
      });
      let context = this;
      setTimeout(function() {
        context.setState({
          updateThumbnailsText: <span>Import files</span>,
        });
      },2000);
    }
  }

  componentDidMount() {
    this.loadFiles();
  }

  render() {
    let importFilesBtn = <div className="col-12">
      <div className="text-center">
        <div style={{fontSize: "15pt"}}>Import files to begin</div>
        <div style={{padding: "15px"}}>
          <Button outline color="secondary" size="lg" onClick={this.updateThumbnails.bind(this,1)}>{this.state.updateThumbnailsText1}</Button>
        </div>
      </div>
    </div>;
    if (this.state.files.length>0) {
      importFilesBtn = [];
    }
    let heading = "Parse Class Pieces";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-tools", active: true, path: ""}
    ];
    return(
      <div>
      <Breadcrumbs items={breadcrumbsItems} />
        <div className="row">
          <div className="col-12">
            <h2>{heading}</h2>
          </div>
        </div>
        <div className="box-tools text-right">
          <div className="row">
            <div className="col-xs-12 col-sm-8"></div>
            <div className="col-xs-12 col-sm-4">
              <button type="button" className="btn btn-light"  onClick={()=>this.updateThumbnails()}>{this.state.updateThumbnailsText}</button>
            </div>
          </div>
        </div>
        <div className="classpieces-container">
          <div className="row">
            {this.state.files}
            {importFilesBtn}
          </div>
        </div>
      </div>
    );
  }
}
