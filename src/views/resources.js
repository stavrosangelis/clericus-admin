import React, { Component } from 'react';
import { Card, CardImg, CardText, CardBody} from 'reactstrap';
import { Link } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import PageActions from '../components/page-actions';
import BatchActions from '../components/add-batch-relations'

import axios from 'axios';
import {getResourceThumbnailURL} from '../helpers/helpers';

import {connect} from "react-redux";
import {
  setPaginationParams
} from "../redux/actions/main-actions";
const APIPath = process.env.REACT_APP_APIPATH;

const mapStateToProps = state => {
  return {
    resourcesPagination: state.resourcesPagination,
    resourcesTypes: state.resourcesTypes
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
      activeType: this.props.resourcesPagination.activeType,
      page: this.props.resourcesPagination.page,
      gotoPage: this.props.resourcesPagination.page,
      limit: this.props.resourcesPagination.limit,
      status: this.props.resourcesPagination.status,
      orderField: this.props.resourcesPagination.orderField,
      orderDesc: this.props.resourcesPagination.orderDesc,
      totalPages: 0,
      totalItems: 0,
      insertModalVisible: false,
      searchInput: this.props.resourcesPagination.searchInput,
      allowSelections: false,
    }
    this.load = this.load.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setActiveType = this.setActiveType.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.toggleInsertModal = this.toggleInsertModal.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleSelectedAll = this.toggleSelectedAll.bind(this);
    this.deleteSelected = this.deleteSelected.bind(this);
    this.removeSelected = this.removeSelected.bind(this);

    // hack to kill load promise on unmount
    this.cancelLoad=false;
  }

  async load() {
    this.setState({
      tableLoading: true
    });
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      orderField: this.state.orderField,
      orderDesc: this.state.orderDesc,
      status: this.state.status,
    }
    if (this.state.searchInput!=="") {
      params.label = this.state.searchInput;
    }
    let url = APIPath+'resources';
    if (this.state.activeType!==null) {
      let systemType = this.props.resourcesTypes.find(t=>t.label===this.state.activeType);
      if (typeof systemType!=="undefined") {
        params.systemType = systemType._id;
      }
    }
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
	  });
    if (this.cancelLoad) {
      return false;
    }

    let currentPage = 1;
    if (responseData.currentPage>0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage>1 && responseData.data.length===0) {
      this.setState({
        page: currentPage-1
      }, () => {
        this.load();
      })
    }
    else {
      this.setState({
        loading: false,
        tableLoading: false,
        page: currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        resources: responseData.data
      });
    }
  }

  async simpleSearch(e) {
    e.preventDefault();
    if (this.state.searchInput<2) {
      return false;
    }
    this.updateStorePagination({searchInput:this.state.searchInput});
    this.setState({
      tableLoading: true
    })
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      label: this.state.searchInput,
      orderField: this.state.orderField,
      orderDesc: this.state.orderDesc,
      status: this.state.status,
    }
    let url = APIPath+'resources';
    if (this.state.activeType!==null) {
      let systemType = this.props.resourcesTypes.find(t=>t.label===this.state.activeType);
      if (typeof systemType!=="undefined") {
        params.systemType = systemType._id;
      }
    }
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
	  });
    let currentPage = 1;
    if (responseData.currentPage>0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage>1 && responseData.data.length===0) {
      this.setState({
        page: currentPage-1
      },()=> {
        this.load();
      });
    }
    else {
      this.setState({
        loading: false,
        tableLoading: false,
        page: currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        resources: responseData.data
      });
    }
  }

  clearSearch() {
    return new Promise((resolve)=> {
      this.setState({
        searchInput: ''
      });
      this.updateStorePagination({searchInput:""});
      resolve(true)
    })
    .then(()=> {
      this.load();
    });
  }

  updatePage(e) {
    if (e>0 && e!==this.state.page) {
      this.setState({
        page: e,
        gotoPage: e,
      });
      this.updateStorePagination({page:e});
      let context = this;
      setTimeout(function(){
        context.load();
      },100);
    }
  }

  updateStorePagination({limit=null, activeType=null, page=null, orderField="", orderDesc=false, status=null, searchInput=""}) {
    if (limit===null) {
      limit = this.state.limit;
    }
    if (activeType===null) {
      activeType = this.state.activeType;
    }
    if (page===null) {
      page = this.state.page;
    }
    if (orderField==="") {
      orderField = this.state.orderField;
    }
    if (orderDesc===false) {
      orderDesc = this.state.orderDesc;
    }
    if (status===null) {
      status = this.state.status;
    }
    if (searchInput==="") {
      searchInput = this.state.searchInput;
    }
    let payload = {
      limit:limit,
      activeType:activeType,
      orderField:orderField,
      orderDesc:orderDesc,
      page:page,
      status:status,
      searchInput:searchInput,
    }
    this.props.setPaginationParams("resources", payload);
  }

  gotoPage(e) {
    e.preventDefault();
    let gotoPage = parseInt(this.state.gotoPage,10);
    let page = this.state.page;
    if (gotoPage>0 && gotoPage!==page) {
      this.setState({
        page: gotoPage
      })
      this.updateStorePagination({page:gotoPage});
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
    this.updateStorePagination({limit:limit});
    let context = this;
    setTimeout(function(){
      context.load();
    },100)
  }

  updateOrdering(orderField="") {
    let orderDesc = false;
    if (orderField === this.state.orderField) {
      orderDesc = !this.state.orderDesc;
    }
    this.setState({
      orderField: orderField,
      orderDesc: orderDesc
    });
    this.updateStorePagination({orderField:orderField,orderDesc:orderDesc});
    let context = this;
    setTimeout(function(){
      context.load();
    },100);
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  setActiveType(type) {
    this.setState({
      activeType: type
    })
    this.updateStorePagination({activeType:type});
    let context = this;
    setTimeout(function() {
      context.load();
    },100)
  }

  setStatus(status=null) {
    this.setState({
      status: status
    })
    this.updateStorePagination({status:status});
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

  toggleSelected(i) {
    let resources = this.state.resources;
    let newResourceChecked = !resources[i].checked;
    resources[i].checked = newResourceChecked;
    this.setState({
      resources: resources
    },()=> {
      let checked = this.state.resources.find(r=>r.checked);
      if (typeof checked!=="undefined") {
        this.setState({
          allowSelections: true
        })
      }
      else {
        this.setState({
          allowSelections: false
        })
      }
    });
  }

  toggleSelectedAll() {
    let allChecked = !this.state.allChecked;
    let resources = this.state.resources;
    let newResources = [];
    for (let i=0;i<resources.length; i++) {
      let resource = resources[i];
      resource.checked = allChecked;
      newResources.push(resource);
    }
    this.setState({
      resources: newResources,
      allChecked: allChecked
    },()=> {
      let checked = this.state.resources.find(r=>r.checked);
      if (typeof checked!=="undefined") {
        this.setState({
          allowSelections: true
        })
      }
      else {
        this.setState({
          allowSelections: false
        })
      }
    });
  }

  async deleteSelected() {
    let selectedResources = this.state.resources.filter(item=>{
      return item.checked;
    }).map(item=>item._id);
    let data = {
      _ids: selectedResources,
    }
    let url = APIPath+'resources';
    await axios({
      method: 'delete',
      url: url,
      crossDomain: true,
      data: data
    })
	  .then(function (response) {
      return true;
	  })
	  .catch(function (error) {
      console.log(error)
	  });
    this.setState({
      allChecked: false
    })
    this.load();
  }

  removeSelected(_id=null) {
    if (_id==null) {
      return false;
    }
    let newResources = this.state.resources.map(item=> {
      if (item._id===_id) {
        item.checked = false;
      }
      return item;
    });
    this.setState({
      resources: newResources
    });
  }

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    this.cancelLoad=true;
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

      let linkVisible = "";
      let plainVisible = "hidden";
      if (this.state.allowSelections) {
        linkVisible = "hidden";
        plainVisible = "";
      }

      let resourcesOutput = this.state.resources.map((resource,i)=>{
        let parseUrl = "/resource/"+resource._id;
        let thumbnailImage = [];
        let thumbnailPath = getResourceThumbnailURL(resource);
        if (thumbnailPath!==null) {
          thumbnailImage = <div>
            <Link to={parseUrl} href={parseUrl} className={linkVisible}><CardImg src={thumbnailPath} alt={resource.label} /></Link>
            <CardImg src={thumbnailPath} alt={resource.label} className={plainVisible} />
          </div>
        }
        else if (resource.resourceType==="document") {
          thumbnailImage = <div className="resource-list-document">
            <Link to={parseUrl} href={parseUrl} className={linkVisible}><i className="fa fa-file-pdf-o"/></Link>
          </div>
        }

        let checked = "";
        if (typeof resource.checked!=="undefined" && resource.checked) {
          checked = " checked";
        }
        let label = <Link to={parseUrl} href={parseUrl}>{resource.label}</Link>;
        let resourceOutput = <div key={i} className="col-12 col-sm-6 col-md-3">
          <Card style={{marginBottom: '15px'}} className={"resource-card"+checked}>
            <div className="select-resource" onClick={()=>this.toggleSelected(i)}>
              <i className="fa circle" />
            </div>
            {thumbnailImage}
            <CardBody>
              <CardText className="text-center">
                <label className="resources-list-label">{label}</label>
              </CardText>
            </CardBody>
          </Card>
        </div>;
        return resourceOutput;
      });

      let pageActions = <PageActions
        activeType={this.state.activeType}
        clearSearch={this.clearSearch}
        current_page={this.state.page}
        gotoPageValue={this.state.gotoPage}
        gotoPage={this.gotoPage}
        handleChange={this.handleChange}
        limit={this.state.limit}
        pageType="resources"
        searchInput={this.state.searchInput}
        setActiveType={this.setActiveType}
        setStatus={this.setStatus}
        status={this.state.status}
        simpleSearch={this.simpleSearch}
        total_pages={this.state.totalPages}
        types={this.props.resourcesTypes}
        updateLimit={this.updateLimit}
        updatePage={this.updatePage}
        orderField={this.state.orderField}
        orderDesc={this.state.orderDesc}
        updateOrdering={this.updateOrdering}
      />
      let selectionsClass="";
      if (this.state.allowSelections) {
        selectionsClass = " allow-selections";
      }

      let selectedResources = this.state.resources.filter(item=>{
          return item.checked;
      });

      let batchActions = <BatchActions
        items={selectedResources}
        removeSelected={this.removeSelected}
        type="Resource"
        relationProperties={[]}
        deleteSelected={this.deleteSelected}
        className="resources-actions"
        selectAll={this.toggleSelectedAll}
        allChecked={this.state.allChecked}
      />

      content = <div className="resources-container">
        {pageActions}
        <div className="row">
          <div className="col-12 text-right">
            {batchActions}
          </div>
        </div>
        <div className={"row"+selectionsClass}>
          {resourcesOutput}
        </div>

        <div className="row">
          <div className="col-12 text-right">
            {batchActions}
          </div>
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
            <h2>{heading} <small>({this.state.totalItems})</small></h2>
          </div>
        </div>
        {content}
      </div>
    );
  }
}
export default Resources = connect(mapStateToProps, mapDispatchToProps)(Resources);
