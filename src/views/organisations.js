import React, { Component } from 'react';
import {
  Table,
  Card, CardBody,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';

import axios from 'axios';
import PageActions from '../components/page-actions';
import {getThumbnailURL} from '../helpers/helpers';
import BatchActions from '../components/add-batch-relations';

import {connect} from "react-redux";
import {
  setPaginationParams,
} from "../redux/actions/main-actions";

const APIPath = process.env.REACT_APP_APIPATH;

const mapStateToProps = state => {
  return {
    organisationsPagination: state.organisationsPagination,
    organisationTypes: state.organisationTypes,
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params))
  }
}

class Organisations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      tableLoading: true,
      organisations: [],
      activeType: this.props.organisationsPagination.activeType,
      orderField: this.props.organisationsPagination.orderField,
      orderDesc: this.props.organisationsPagination.orderDesc,
      page: this.props.organisationsPagination.page,
      gotoPage: this.props.organisationsPagination.page,
      limit: this.props.organisationsPagination.limit,
      status: this.props.organisationsPagination.status,
      totalPages: 0,
      totalItems: 0,
      allChecked: false,
      searchInput: ''
    }
    this.load = this.load.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setActiveType = this.setActiveType.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.organisationsTableRows = this.organisationsTableRows.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleSelectedAll = this.toggleSelectedAll.bind(this);
    this.deleteSelected = this.deleteSelected.bind(this);
    this.removeSelected = this.removeSelected.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);

    // hack to kill load promise on unmount
    this.cancelLoad=false;
  }

  async load() {
    this.setState({
      tableLoading: true
    })
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      orderField: this.state.orderField,
      orderDesc: this.state.orderDesc,
      status: this.state.status,
    }
    let url = APIPath+'organisations';
    if (this.state.activeType!==null) {
      params.organisationType = this.state.activeType;
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
    let organisations = responseData.data.map(organisation=>{
      organisation.checked = false;
      return organisation;
    });
    let currentPage = 1;
    if (responseData.currentPage>0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage>1 && currentPage>responseData.totalPages) {
      this.setState({
        page: responseData.totalPages
      },()=> {
        this.load();
      });
    }
    else {
      this.setState({
        loading: false,
        tableLoading: false,
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        organisations: organisations
      });
    }
  }

  async simpleSearch(e) {
    e.preventDefault();
    if (this.state.searchInput<2) {
      return false;
    }
    this.setState({
      tableLoading: true
    })
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      orderField: this.state.orderField,
      orderDesc: this.state.orderDesc,
      status: this.state.status,
      label: this.state.searchInput
    }
    let url = APIPath+'organisations';
    if (this.state.activeType!==null) {
      params.organisationType = this.state.activeType;
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
    let organisations = responseData.data.map(organisation=>{
      organisation.checked = false;
      return organisation;
    });
    let currentPage = 1;
    if (responseData.currentPage>0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage>1 && currentPage>responseData.totalPages) {
      this.setState({
        page: responseData.totalPages
      },()=> {
        this.load();
      });
    }
    else {
      this.setState({
        loading: false,
        tableLoading: false,
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        organisations: organisations
      });
    }
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

  updatePage(e) {
    if (e>0 && e!==this.state.page) {
      this.setState({
        page: e,
        gotoPage: e,
      })
      this.updateStorePagination({page:e});
      let context = this;
      setTimeout(function(){
        context.load();
      },100);
    }
  }

  updateStorePagination({limit=null, page=null, activeType=null, orderField="", orderDesc=false, status=null} ) {
    if (limit===null) {
      limit = this.state.limit;
    }
    if (page===null) {
      page = this.state.page;
    }
    if (activeType===null) {
      activeType = this.state.activeType;
    }
    let payload = {
      limit:limit,
      page:page,
      activeType:activeType,
      orderField:orderField,
      orderDesc:orderDesc,
      status:status,
    }
    this.props.setPaginationParams("organisations", payload);
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
    })
    this.updateStorePagination({limit:limit});
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

  organisationsTableRows() {
    let organisations = this.state.organisations;
    let rows = [];
    for (let i=0;i<organisations.length; i++) {
      let organisation = organisations[i];
      let countPage = parseInt(this.state.page,10)-1;
      let count = (i+1) + (countPage*this.state.limit);
      let label = organisation.label;
      let thumbnailImage = [];
      let thumbnailURL = getThumbnailURL(organisation);
      if (thumbnailURL!==null) {
        thumbnailImage = <img src={thumbnailURL} className="organisations-list-thumbnail img-fluid img-thumbnail" alt={label} />
      }
      let row = <tr key={i}>
        <td>
          <div className="select-checkbox-container">
            <input type="checkbox" value={i} checked={organisations[i].checked} onChange={() => {return false}}/>
            <span className="select-checkbox" onClick={()=>this.toggleSelected(i)}></span>
          </div>
        </td>
        <td>{count}</td>
        <td><Link href={"/organisation/"+organisation._id} to={"/organisation/"+organisation._id}>{thumbnailImage}</Link></td>
        <td><Link href={"/organisation/"+organisation._id} to={"/organisation/"+organisation._id}>{organisation.label}</Link></td>
        <td>{organisation.organisationType}</td>
        <td><Link href={"/organisation/"+organisation._id} to={"/organisation/"+organisation._id} className="edit-item"><i className="fa fa-pencil" /></Link></td>
      </tr>
      rows.push(row);
    }
    return rows;
  }

  toggleSelected(i) {
    let organisations = this.state.organisations;
    let newPersonChecked = !organisations[i].checked;
    organisations[i].checked = newPersonChecked;
    this.setState({
      organisations: organisations
    });
  }

  toggleSelectedAll() {
    let allChecked = !this.state.allChecked;
    let organisations = this.state.organisations;
    let newOrganisations = [];
    for (let i=0;i<organisations.length; i++) {
      let organisation = organisations[i];
      organisation.checked = allChecked;
      newOrganisations.push(organisation);
    }
    this.setState({
      organisations: newOrganisations,
      allChecked: allChecked
    })
  }

  async deleteSelected() {
    let selectedOrganisations = this.state.organisations.filter(item=>{
      return item.checked;
    }).map(item=>item._id);
    let data = {
      _ids: selectedOrganisations,
    }
    let url = APIPath+'organisations';
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
	  });

    this.setState({
      allChecked: false,
      deleteModalOpen: false,
    })
    this.load();
  }

  removeSelected(_id=null) {
    if (_id==null) {
      return false;
    }
    let newOrganisations = this.state.organisations.map(item=> {
      if (item._id===_id) {
        item.checked = false;
      }
      return item;
    });
    this.setState({
      organisations: newOrganisations
    });
  }

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    this.cancelLoad=true;
  }

  render() {
    let heading = "Organisations";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-culture", active: true, path: ""}
    ];

    let pageActions = <PageActions
      activeType={this.state.activeType}
      clearSearch={this.clearSearch}
      current_page={this.state.page}
      gotoPageValue={this.state.gotoPage}
      gotoPage={this.gotoPage}
      handleChange={this.handleChange}
      limit={this.state.limit}
      pageType="organisations"
      searchInput={this.state.searchInput}
      setActiveType={this.setActiveType}
      setStatus={this.setStatus}
      status={this.state.status}
      simpleSearch={this.simpleSearch}
      total_pages={this.state.totalPages}
      types={this.props.organisationTypes}
      updateLimit={this.updateLimit}
      updatePage={this.updatePage}
    />

    let content = <div>
      {pageActions}
      <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
      {pageActions}
    </div>
    if (!this.state.loading) {
      let addNewBtn = <Link className="btn btn-outline-secondary add-new-item-btn" to="/organisation/new" href="/organisation/new"><i className="fa fa-plus" /></Link>;

      let tableLoadingSpinner = <tr>
        <td colSpan={6}><Spinner type="grow" color="info" /> <i>loading...</i></td>
      </tr>;
      let organisationsRows = [];
      if (this.state.tableLoading) {
        organisationsRows = tableLoadingSpinner;
      }
      else {
        organisationsRows = this.organisationsTableRows();
      }
      let allChecked = "";
      if (this.state.allChecked) {
        allChecked = "checked";
      }
      let selectedOrganisations = this.state.organisations.filter(item=>{
          return item.checked;
      });

      let batchActions = <BatchActions
        items={selectedOrganisations}
        removeSelected={this.removeSelected}
        type="Organisation"
        relationProperties={[]}
        deleteSelected={this.deleteSelected}
        selectAll={this.toggleSelectedAll}
        allChecked={this.state.allChecked}
      />

      // ordering
      let labelOrderIcon = [];
      let typeOrderIcon = [];
      if (this.state.orderField==="label" || this.state.orderField==="") {
        if (this.state.orderDesc) {
          labelOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          labelOrderIcon = <i className="fa fa-caret-up" />
        }
      }
      if (this.state.orderField==="organisationType") {
        if (this.state.orderDesc) {
          typeOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          typeOrderIcon = <i className="fa fa-caret-up" />
        }
      }

      content = <div className="organisations-container">
        {pageActions}
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                <div className="pull-right">
                  {batchActions}
                </div>
                <Table hover>
                  <thead>
                    <tr>
                      <th style={{width: "30px"}}>
                        <div className="select-checkbox-container default">
                          <input type="checkbox" checked={allChecked} onChange={() => {return false}}/>
                          <span className="select-checkbox" onClick={this.toggleSelectedAll}></span>
                        </div>
                      </th>
                      <th style={{width: '40px'}}>#</th>
                      <th>Thumbnail</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("label")}>Label {labelOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("organisationType")}>Type {typeOrderIcon}</th>
                      <th style={{width: '30px'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {organisationsRows}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>
                        <div className="select-checkbox-container default">
                          <input type="checkbox" checked={allChecked} onChange={() => {return false}}/>
                          <span className="select-checkbox" onClick={this.toggleSelectedAll}></span>
                        </div>
                      </th>
                      <th>#</th>
                      <th>Thumbnail</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("label")}>Label {labelOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("organisationType")}>Type {typeOrderIcon}</th>
                      <th></th>
                    </tr>
                  </tfoot>
                </Table>
                <div className="pull-right">
                  {batchActions}
                </div>
              </CardBody>
            </Card>
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
export default Organisations = connect(mapStateToProps, mapDispatchToProps)(Organisations);
