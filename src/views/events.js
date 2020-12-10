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
import BatchActions from '../components/add-batch-relations';

import {connect} from "react-redux";
import {
  setPaginationParams
} from "../redux/actions/main-actions";

const APIPath = process.env.REACT_APP_APIPATH;
const mapStateToProps = state => {
  return {
    eventsPagination: state.eventsPagination,
    eventTypes: state.eventTypes,
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params))
  }
}

class Events extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      tableLoading: true,
      items: [],
      activeType: this.props.eventsPagination.activeType,
      orderField: this.props.eventsPagination.orderField,
      orderDesc: this.props.eventsPagination.orderDesc,
      page: this.props.eventsPagination.page,
      gotoPage: this.props.eventsPagination.page,
      limit: this.props.eventsPagination.limit,
      status: this.props.eventsPagination.status,
      totalPages: 0,
      totalItems: 0,
      allChecked: false,
      searchInput: this.props.eventsPagination.searchInput,
    }
    this.load = this.load.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.setActiveType = this.setActiveType.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.itemsTableRows = this.itemsTableRows.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleSelectedAll = this.toggleSelectedAll.bind(this);
    this.deleteSelected = this.deleteSelected.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.removeSelected = this.removeSelected.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.findEventType = this.findEventType.bind(this);
    this.findEventTypeRec = this.findEventTypeRec.bind(this);
    this.findEventTypeById = this.findEventTypeById.bind(this);
    this.findEventTypeByIdRec = this.findEventTypeByIdRec.bind(this);

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
    let url = APIPath+'events';
    if (this.state.activeType!==null) {
      let eventType = this.findEventType();
      if (eventType!==null) {
        params.eventType = eventType._id;
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
    let items = responseData.data.map(item=>{
      item.checked = false;
      return item;
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
        items: items
      });
    }
  }

  findEventType() {
    let type = this.state.activeType;
    let eventTypes = this.props.eventTypes;
    let eventType = this.findEventTypeRec(type, eventTypes);
    return eventType;
  }

  findEventTypeRec(type, types) {
    let eventType = types.find(t=>t.label===type) || null;
    if (eventType===null) {
      for (let c in types) {
        let children = types[c].children;
        eventType = this.findEventTypeRec(type, children);
        if (eventType!==null) {
          break;
        }
      }
    }
    return eventType;
  }

  findEventTypeById(_id=null) {
    if (_id===null) {
      return null;
    }
    let eventTypes = this.props.eventTypes;
    let eventType = this.findEventTypeByIdRec(_id,eventTypes);
    return eventType;
  }

  findEventTypeByIdRec(_id, types) {
    let eventType = types.find(t=>t._id===_id) || null;
    if (eventType===null) {
      for (let c in types) {
        let children = types[c].children;
        eventType = this.findEventTypeByIdRec(_id, children);
        if (eventType!==null) {
          break;
        }
      }
    }
    return eventType;
  }

  async simpleSearch(e) {
    e.preventDefault();
    if (this.state.searchInput<2) {
      return false;
    }
    this.updateStorePagination({searchInput:this.state.searchInput});
    this.setState({
      tableLoading: true
    });
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      orderField: this.state.orderField,
      orderDesc: this.state.orderDesc,
      status: this.state.status,
      label: this.state.searchInput,
    }
    let url = APIPath+'events';
    if (this.state.activeType!==null) {
      let eventType = this.findEventType();
      if (eventType!==null) {
        params.eventType = eventType._id;
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
    let items = responseData.data.map(item=>{
      item.checked = false;
      return item;
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
        items: items
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
      });
      this.updateStorePagination({page:e});
      let context = this;
      setTimeout(function(){
        context.load();
      },100);
    }
  }

  updateStorePagination({limit=null, page=null, activeType=null, orderField="", orderDesc=false, status=null, searchInput=""}) {
    if (limit===null) {
      limit = this.state.limit;
    }
    if (page===null) {
      page = this.state.page;
    }
    if (searchInput===null) {
      searchInput = this.state.searchInput;
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
      page:page,
      activeType:activeType,
      orderField:orderField,
      orderDesc:orderDesc,
      status:status,
      searchInput:searchInput,
    }
    this.props.setPaginationParams("events", payload);
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
    });
    this.updateStorePagination({activeType:type});
    let context = this;
    setTimeout(function() {
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

  itemsTableRows() {
    let items = this.state.items;
    let rows = [];
    for (let i=0;i<items.length; i++) {
      let item = items[i];
      let countPage = parseInt(this.state.page,10)-1;
      let count = (i+1) + (countPage*this.state.limit);
      let label = item.label;
      let findEventType = this.findEventTypeById(item.eventType);
      let eventType = "";
      if (findEventType!==null) {
        eventType = findEventType.label;
      }
      let temporal = [];
      if (item.temporal.length>0) {
        let temporalData = item.temporal[0].ref;
        temporal = temporalData.label;
      }
      let spatial = [];
      if (item.spatial.length>0) {
        let spatialData = item.spatial[0].ref;
        spatial = spatialData.label;
      }
      let createdAt = <div><small>{item.createdAt.split("T")[0]}</small><br/><small>{item.createdAt.split("T")[1]}</small></div>;
      let updatedAt = <div><small>{item.updatedAt.split("T")[0]}</small><br/><small>{item.updatedAt.split("T")[1]}</small></div>;
      let row = <tr key={i}>
        <td>
          <div className="select-checkbox-container">
            <input type="checkbox" value={i} checked={items[i].checked} onChange={() => {return false}}/>
            <span className="select-checkbox" onClick={this.toggleSelected.bind(this,i)}></span>
          </div>
        </td>
        <td>{count}</td>
        <td>
          <Link href={"/event/"+item._id} to={"/event/"+item._id}>{label}</Link>
        </td>
        <td>
          <Link href={"/event/"+item._id} to={"/event/"+item._id}>{eventType}</Link>
        </td>
        <td>{temporal}</td>
        <td>{spatial}</td>
        <td>{createdAt}</td>
        <td>{updatedAt}</td>
        <td><Link href={"/event/"+item._id} to={"/event/"+item._id} className="edit-item"><i className="fa fa-pencil" /></Link></td>
      </tr>
      rows.push(row);
    }
    return rows;
  }

  toggleSelected(i) {
    let items = this.state.items;
    let newPersonChecked = !items[i].checked;
    items[i].checked = newPersonChecked;
    this.setState({
      items: items
    });
  }

  toggleSelectedAll() {
    let allChecked = !this.state.allChecked;
    let items = this.state.items;
    let newItems = [];
    for (let i=0;i<items.length; i++) {
      let item = items[i];
      item.checked = allChecked;
      newItems.push(item);
    }
    this.setState({
      items: newItems,
      allChecked: allChecked
    })
  }

  async deleteSelected() {
    let selectedEvents = this.state.items.filter(item=>{
      return item.checked;
    }).map(item=>item._id);
    let data = {
      _ids: selectedEvents,
    }
    let url = APIPath+'events';
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
    let newEvents = this.state.items.map(item=> {
      if (item._id===_id) {
        item.checked = false;
      }
      return item;
    });
    this.setState({
      items: newEvents
    });
  }

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    this.cancelLoad=true;
  }

  render() {
    let heading = "Events";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-date", active: true, path: ""}
    ];
    let pageActions = <PageActions
      clearSearch={this.clearSearch}
      current_page={this.state.page}
      gotoPage={this.gotoPage}
      gotoPageValue={this.state.gotoPage}
      handleChange={this.handleChange}
      limit={this.state.limit}
      pageType="events"
      searchInput={this.state.searchInput}
      setActiveType={this.setActiveType}
      setStatus={this.setStatus}
      status={this.state.status}
      simpleSearch={this.simpleSearch}
      total_pages={this.state.totalPages}
      types={this.props.eventTypes}
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
      let addNewBtn = <Link className="btn btn-outline-secondary add-new-item-btn" to="/event/new" href="/event/new"><i className="fa fa-plus" /></Link>;

      let tableLoadingSpinner = <tr>
        <td colSpan={8}><Spinner type="grow" color="info" /> <i>loading...</i></td>
      </tr>;
      let itemsRows = [];
      if (this.state.tableLoading) {
        itemsRows = tableLoadingSpinner;
      }
      else {
        itemsRows = this.itemsTableRows();
      }
      let allChecked = "";
      if (this.state.allChecked) {
        allChecked = "checked";
      }

      let selectedEvents = this.state.items.filter(item=>{
          return item.checked;
      });

      let batchActions = <BatchActions
        items={selectedEvents}
        removeSelected={this.removeSelected}
        type="Event"
        relationProperties={[]}
        deleteSelected={this.deleteSelected}
        selectAll={this.toggleSelectedAll}
        allChecked={this.state.allChecked}
      />
      // ordering
      let labelOrderIcon = [];
      let typeOrderIcon = [];
      let createdOrderIcon = [];
      let updatedOrderIcon = [];
      if (this.state.orderField==="label" || this.state.orderField==="") {
        if (this.state.orderDesc) {
          labelOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          labelOrderIcon = <i className="fa fa-caret-up" />
        }
      }
      if (this.state.orderField==="eventType") {
        if (this.state.orderDesc) {
          typeOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          typeOrderIcon = <i className="fa fa-caret-up" />
        }
      }
      if (this.state.orderField==="createdAt") {
        if (this.state.orderDesc) {
          createdOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          createdOrderIcon = <i className="fa fa-caret-up" />
        }
      }
      if (this.state.orderField==="updatedAt") {
        if (this.state.orderDesc) {
          updatedOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          updatedOrderIcon = <i className="fa fa-caret-up" />
        }
      }

      content = <div className="items-container">
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
                      <th style={{width: "40px"}}>#</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("label")}>Label {labelOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("eventType")}>Type {typeOrderIcon}</th>
                      <th>Temporal</th>
                      <th>Spatial</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("createdAt")}>Created {createdOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("updatedAt")}>Updated {updatedOrderIcon}</th>
                      <th style={{width: "30px"}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsRows}
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
                      <th className="ordering-label" onClick={()=>this.updateOrdering("label")}>Label {labelOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("eventType")}>Type {typeOrderIcon}</th>
                      <th>Temporal</th>
                      <th>Spatial</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("createdAt")}>Created {createdOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("updatedAt")}>Updated {updatedOrderIcon}</th>
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
export default Events = connect(mapStateToProps, mapDispatchToProps)(Events);
