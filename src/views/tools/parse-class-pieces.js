import React, { Component } from 'react';
import { Card, CardImg, CardText, CardBody, Button} from 'reactstrap';
import { Link } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import {Breadcrumbs} from '../../components/breadcrumbs';

import axios from 'axios';
import {loadProgressBar} from 'axios-progress-bar';

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

  loadFiles() {
    let context = this;
    axios({
        method: 'get',
        url: APIPath+'list-class-pieces',
        crossDomain: true,
      })
  	  .then(function (response) {
        let responseData = response.data.data;
        let filesOutput = [];
        for (let i=0; i<responseData.length; i++) {
          let file = responseData[i];
          filesOutput.push(context.fileOutput(i, file));
        }
        context.setState({
          files: filesOutput,
        });

  	  })
  	  .catch(function (error) {
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

  updateThumbnails(src) {
    if (this.state.importStatus) {
      return false;
    }
    if (src===0) {
      this.setState({
        updateThumbnailsText: <span><i>Importing...</i> <Spinner color="secondary" size="sm" /></span>,
        importStatus: true
      });
    }
    if (src===1) {
      this.setState({
        updateThumbnailsText1: <span><i>Importing...</i> <Spinner color="secondary" size="md" /></span>,
        importStatus: true
      });
    }

    let context = this;
    axios({
        method: 'get',
        url: APIPath+'create-thumbnails',
        crossDomain: true,
      })
  	  .then(function (response) {
        context.loadFiles();
        if (src===0) {
          context.setState({
            updateThumbnailsText: <span>Import complete <i className="fa fa-check"></i></span>,
          });
          setTimeout(function() {
            context.setState({
              updateThumbnailsText: <span>Import files</span>,
            });
          },2000);
        }
        if (src===1) {
          context.setState({
            updateThumbnailsText1: <span>Import complete <i className="fa fa-check"></i></span>,
          });
          setTimeout(function() {
            context.setState({
              updateThumbnailsText1: <span>Import files</span>,
            });
          },2000);
        }

  	  })
  	  .catch(function (error) {
  	  });
  }

  componentDidMount() {
    loadProgressBar();
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
              <button type="button" className="btn btn-light"  onClick={this.updateThumbnails.bind(this,0)}>{this.state.updateThumbnailsText}</button>
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
