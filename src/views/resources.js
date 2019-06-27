import React, { Component } from 'react';
import { Card, CardImg, CardText, CardBody} from 'reactstrap';
import { Link } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import PageActions from '../components/resources-page-actions';

import axios from 'axios';
import {APIPath} from '../static/constants';
import {getResourceThumbnailURL} from '../helpers/helpers';

import {connect} from "react-redux";
import {
  setPaginationParams
} from "../redux/actions/main-actions";

const mapStateToProps = state => {
  return {
    resourcesPagination: state.resourcesPagination,
    systemTypes: state.systemTypes
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params))
  }
}

class Resources extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      tableLoading: true,
      systemTypes: this.props.systemTypes,
      activeSystemType: this.props.resourcesPagination.activeSystemType,
      resources: [],
      page: this.props.resourcesPagination.page,
      gotoPage: this.props.resourcesPagination.page,
      limit: this.props.resourcesPagination.limit,
      totalPages: 0,
      totalItems: 0,
      insertModalVisible: false,
      searchInput: ''
    }
    this.getSystemTypes = this.getSystemTypes.bind(this);
    this.load = this.load.bind(this);
    this.fileOutput = this.fileOutput.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setActiveSystemType = this.setActiveSystemType.bind(this);
    this.toggleInsertModal = this.toggleInsertModal.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.search = this.search.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
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
            systemTypes: responseData.data,
          });
        }
  	  })
  	  .catch(function (error) {
  	  });
  }

  load() {
    this.setState({
      tableLoading: true
    })
    let context = this;
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      label: this.state.searchInput
    }
    let url = APIPath+'resources';
    if (this.state.activeSystemType!==null) {
      params.systemType = this.state.activeSystemType;
    }
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
      let filesOutput = [];
      for (let i=0; i<responseData.data.length; i++) {
        let file = responseData.data[i];
        filesOutput.push(context.fileOutput(i, file));
      }
      let currentPage = 1;
      if (responseData.currentPage>0) {
        currentPage = responseData.currentPage;
      }
      // normalize the page number when the selected page is empty for the selected number of items per page
      if (currentPage>1 && responseData.data.length===0) {
        context.setState({
          page: currentPage-1
        });
        setTimeout(function() {
          context.load();
        },10)
      }
      else {
        context.setState({
          loading: false,
          tableLoading: false,
          page: currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          resources: filesOutput,
        });
      }


	  })
	  .catch(function (error) {
	  });
  }

  search(e) {
    e.preventDefault();
    if (this.state.searchInput<2) {
      return false;
    }

    this.setState({
      tableLoading: true
    })
    let context = this;
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      label: this.state.searchInput
    }
    let url = APIPath+'resources';
    if (this.state.activeSystemType!==null) {
      params.systemType = this.state.activeSystemType;
    }
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
      let filesOutput = [];
      for (let i=0; i<responseData.data.length; i++) {
        let file = responseData.data[i];
        filesOutput.push(context.fileOutput(i, file));
      }
      let currentPage = 1;
      if (responseData.currentPage>0) {
        currentPage = responseData.currentPage;
      }
      // normalize the page number when the selected page is empty for the selected number of items per page
      if (currentPage>1 && responseData.data.length===0) {
        context.setState({
          page: currentPage-1
        });
        setTimeout(function() {
          context.load();
        },10)
      }
      else {
        context.setState({
          loading: false,
          tableLoading: false,
          page: currentPage,
          totalPages: responseData.totalPages,
          totalItems: responseData.totalItems,
          resources: filesOutput,
        });
      }


	  })
	  .catch(function (error) {
	  });
  }

  clearSearch() {
    return new Promise((resolve)=> {
      this.setState({
        searchInput: ''
      })
      resolve(true)
    })
    .then(()=> {
      this.load();
    });
  }

  fileOutput(i, file) {
    let parseUrl = "/resource/"+file._id;
    let thumbnailImage = [];
    let thumbnailPath = getResourceThumbnailURL(file);
    if (thumbnailPath!==null) {
      thumbnailImage = <Link to={parseUrl} href={parseUrl}><CardImg src={thumbnailPath} alt={file.label} /></Link>
    }

    let fileOutput = <div key={i} className="col-12 col-sm-6 col-md-3">
      <Card style={{marginBottom: '15px'}}>
        {thumbnailImage}
        <CardBody>
          <CardText className="text-center">
            <label><Link to={parseUrl} href={parseUrl}>{file.label}</Link></label>
          </CardText>
        </CardBody>
      </Card>
    </div>;
    return fileOutput;
  }

  updatePage(e) {
    if (e>0 && e!==this.state.page) {
      this.setState({
        page: e,
        gotoPage: e,
      });
      this.updateStorePagination(null,null,e);
      let context = this;
      setTimeout(function(){
        context.load();
      },100);
    }
  }

  updateStorePagination(limit=null, activeSystemType=null, page=null) {
    if (limit===null) {
      limit = this.state.limit;
    }
    if (activeSystemType===null) {
      activeSystemType = this.state.activeSystemType;
    }
    if (page===null) {
      page = this.state.page;
    }
    let payload = {
      limit:limit,
      activeSystemType:activeSystemType,
      page:page,
    }
    this.props.setPaginationParams("resources", payload);
  }

  gotoPage(e) {
    e.preventDefault();
    let gotoPage = this.state.gotoPage;
    let page = this.state.page;
    if (gotoPage>0 && gotoPage!==page) {
      this.setState({
        page: gotoPage
      })
      this.updateStorePagination(null,null,gotoPage);
      let context = this;
      setTimeout(function(){
        context.load();
      },100);
    }
  }

  updateLimit(limit) {
    this.setState({
      limit: limit
    });
    this.updateStorePagination(limit,null,null);
    let context = this;
    setTimeout(function(){
      context.load();
    },100)
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  setActiveSystemType(systemType) {
    this.setState({
      activeSystemType: systemType
    })
    this.updateStorePagination(null,systemType,null);
    let context = this;
    setTimeout(function() {
      context.load();
    },100)
  }

  toggleInsertModal() {
    this.setState({
      insertModalVisible: !this.state.insertModalVisible
    })
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    if(prevProps.systemTypes!==this.props.systemTypes) {
      this.setState({
        systemTypes: this.props.systemTypes
      })
    }
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
      let addNewBtn = <Link className="btn btn-outline-secondary add-new-item-btn" to="/resource/new" href="/resource/new"><i className="fa fa-plus" /></Link>;

      let pageActions = <PageActions
        limit={this.state.limit}
        current_page={this.state.page}
        gotoPageValue={this.state.gotoPage}
        total_pages={this.state.totalPages}
        systemTypes={this.state.systemTypes}
        activeSystemType={this.state.activeSystemType}
        updatePage={this.updatePage}
        gotoPage={this.gotoPage}
        handleChange={this.handleChange}
        updateLimit={this.updateLimit}
        setActiveSystemType={this.setActiveSystemType}
        search={this.search}
        clearSearch={this.clearSearch}
        searchInput={this.state.searchInput}
      />
      content = <div className="resources-container">
        {pageActions}
        <div className="row">
          {this.state.resources}
        </div>
        {pageActions}
        {addNewBtn}
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
export default Resources = connect(mapStateToProps, mapDispatchToProps)(Resources);
