import React, { Component } from 'react';
import { Card, CardImg, CardText, CardBody, Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import { Link } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';

import axios from 'axios';
import {loadProgressBar} from 'axios-progress-bar';
import {classPieceThumbnails, outputDir, APIPath} from '../static/constants';

export default class Resources extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      systemTypes: [],
      activeSystemType: null,
      systemTypesDropdownOpen: false,
      resources: [],
    }
    this.getSystemTypes = this.getSystemTypes.bind(this);
    this.load = this.load.bind(this);
    this.fileOutput = this.fileOutput.bind(this);
    this.toggleSystemTypesDropdownOpen = this.toggleSystemTypesDropdownOpen.bind(this);
    this.setActiveSystemType = this.setActiveSystemType.bind(this);
  }
  getSystemTypes() {
    let context = this;
    axios({
        method: 'get',
        url: APIPath+'resource-system-types',
        crossDomain: true,
      })
  	  .then(function (response) {
        let responseData = response.data;
        if (responseData.status) {
          context.setState({
            loading: false,
            systemTypes: responseData.data,
          });
        }
  	  })
  	  .catch(function (error) {
  	  });
  }

  load() {
    let context = this;
    let url = APIPath+'resources';
    if (this.state.activeSystemType!==null) {
      url = APIPath+'resources?systemType='+this.state.activeSystemType;
    }
    axios({
        method: 'get',
        url: url,
        crossDomain: true,
      })
  	  .then(function (response) {
        let responseData = response.data.data;
        let filesOutput = [];
        for (let i=0; i<responseData.data.length; i++) {
          let file = responseData.data[i];
          filesOutput.push(context.fileOutput(i, file));
        }
        context.setState({
          resources: filesOutput,
        });

  	  })
  	  .catch(function (error) {
  	  });
  }

  fileOutput(i, file) {
    let thumbnail = [];
    if (file.systemType==="classpiece") {
      thumbnail = classPieceThumbnails+file.fileName;
    }
    else if (file.systemType==="thumbnail") {
      let classPiece = null;
      for (let r=0;r<file.resources.length; r++) {
        let resource = file.resources[r];
        if (resource.refType==="isPartOf") {
          classPiece = resource.ref;
        }
      }
      if (classPiece!==null) {
        let dirName = classPiece.fileName.replace("."+classPiece.metadata[0].image.default.type, "", classPiece.fileName);
        thumbnail = outputDir+dirName+"/thumbnails/"+file.fileName;
      }
    }
    let parseUrl = "/resource/"+file._id;
    let fileOutput = <div key={i} className="col-12 col-sm-6 col-md-3">
      <Card style={{marginBottom: '15px'}}>
        <Link to={parseUrl} href={parseUrl}><CardImg src={thumbnail} alt={file.label} /></Link>
        <CardBody>
          <CardText className="text-center">
            <label><Link to={parseUrl} href={parseUrl}>{file.label}</Link></label>
          </CardText>
        </CardBody>
      </Card>
    </div>;
    return fileOutput;
  }

  toggleSystemTypesDropdownOpen() {
    this.setState({
      systemTypesDropdownOpen: !this.state.systemTypesDropdownOpen
    })
  }

  setActiveSystemType(systemType) {
    this.setState({
      activeSystemType: systemType
    })
    let context = this;
    setTimeout(function() {
      context.load();
    },100)
  }

  componentDidMount() {
    loadProgressBar();
    this.getSystemTypes();
    this.load();
  }

  render() {
    let heading = "Resources";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-photo", active: true, path: ""}
    ];

    let content = <div className="row">
      <div className="col-12">
        <div style={{padding: '40pt',textAlign: 'center'}}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
    if (!this.state.loading) {
      let systemTypesDropdownItems = [];
      let defaultActive = false;
      if (this.state.activeSystemType===null) {
        defaultActive = true;
      }
      let defaultItem = <DropdownItem active={defaultActive} onClick={this.setActiveSystemType.bind(this,null)} key={0}>All</DropdownItem>;
      systemTypesDropdownItems.push(defaultItem);
      for (let st=0;st<this.state.systemTypes.length; st++) {
        let dc=st+1;
        let systemType = this.state.systemTypes[st];
        let active = false;
        if (this.state.activeSystemType===systemType._id) {
          active = true;
        }
        let dropdownItem = <DropdownItem active={active} onClick={this.setActiveSystemType.bind(this,systemType._id )} key={dc}><span className="first-cap">{systemType._id}</span></DropdownItem>;
        systemTypesDropdownItems.push(dropdownItem);
      }
      let systemTypesDropdown = <Dropdown className="pull-right" size="sm" isOpen={this.state.systemTypesDropdownOpen} toggle={this.toggleSystemTypesDropdownOpen}>
        <DropdownToggle color="secondary" outline caret>
          Select type
        </DropdownToggle>
        <DropdownMenu right>
          {systemTypesDropdownItems}
        </DropdownMenu>
      </Dropdown>
      content = <div className="resources-container">
        <div className="row">
          <div className="col-12">
            <div className="page-actions">
              {systemTypesDropdown}
            </div>
          </div>
        </div>
        <div className="row">
          {this.state.resources}
        </div>
      </div>
    }

    return(
      <div>
      <Breadcrumbs items={breadcrumbsItems} />
        <div className="row">
          <div className="col-12">
            <h2>{heading}</h2>
          </div>
        </div>
        {content}
      </div>
    );
  }
}
