import React, { Component } from 'react';
import { Spinner } from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';

import axios from 'axios';
import {loadProgressBar} from 'axios-progress-bar';
import {APIPath} from '../static/constants';

import ViewClasspiece from '../components/view-classpiece';
import Viewthumbnail from '../components/view-thumbnail';

export default class Resource extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      resource: [],
      systemType: null
    }
    this.load = this.load.bind(this);
  }

  load() {
    let context = this;
    let _id = this.props.match.params._id;
    axios({
        method: 'get',
        url: APIPath+'resource?_id='+_id,
        crossDomain: true,
      })
  	  .then(function (response) {
        let responseData = response.data.data;
        context.setState({
          loading: false,
          resource: responseData,
          systemType: responseData.systemType
        });

  	  })
  	  .catch(function (error) {
  	  });
  }

  componentDidMount() {
    loadProgressBar();
    this.load();
  }

  componentDidUpdate(prevProps) {
    if(prevProps.match.params._id!==this.props.match.params._id){
      this.load();
    }
  }

  render() {
    let label = '';
    if (typeof this.state.resource.label!=="undefined") {
      label = this.state.resource.label;
    }
    let heading = "Resource \""+label+"\"";
    let breadcrumbsItems = [
      {label: "Resources", icon: "pe-7s-photo", active: false, path: "/resources"},
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
      let viewComponent =[]
      if (this.state.systemType==="classpiece") {
        viewComponent = <ViewClasspiece resource={this.state.resource} file={label}/>
      }
      if (this.state.systemType==="thumbnail") {
        viewComponent = <Viewthumbnail resource={this.state.resource} file={label}/>;
      }
      content = <div className="resources-container">
          {viewComponent}
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
