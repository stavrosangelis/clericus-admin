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
      page: this.props.eventsPagination.page,
      gotoPage: this.props.eventsPagination.page,
      limit: this.props.eventsPagination.limit,
      totalPages: 0,
      totalItems: 0,
      allChecked: false,
    }
    this.load = this.load.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.itemsTableRows = this.itemsTableRows.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleSelectedAll = this.toggleSelectedAll.bind(this);
    this.deleteSelected = this.deleteSelected.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.removeSelected = this.removeSelected.bind(this);
  }

  load() {
    this.setState({
      tableLoading: true
    })
    let context = this;
    let params = {
      page: this.state.page,
      limit: this.state.limit
    }
    let url = APIPath+'events';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
      let items = responseData.data;
      let newItems = [];
      for (let i=0;i<items.length; i++) {
        let item = items[i];
        item.checked = false;
        newItems.push(item);
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
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          items: newItems
        });
      }
	  })
	  .catch(function (error) {
	  });
  }

  updatePage(e) {
    if (e>0 && e!==this.state.page) {
      this.setState({
        page: e,
        gotoPage: e,
      });
      this.updateStorePagination(null,e);
      let context = this;
      setTimeout(function(){
        context.load();
      },100);
    }
  }

  updateStorePagination(limit=null, page=null) {
    if (limit===null) {
      limit = this.state.limit;
    }
    if (page===null) {
      page = this.state.page;
    }
    let payload = {
      limit:limit,
      page:page,
    }
    this.props.setPaginationParams("events", payload);
  }

  gotoPage(e) {
    e.preventDefault();
    let gotoPage = this.state.gotoPage;
    let page = this.state.page;
    if (gotoPage>0 && gotoPage!==page) {
      this.setState({
        page: gotoPage
      })
      this.updateStorePagination(null,gotoPage);
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
    this.updateStorePagination(limit,null);
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

  itemsTableRows() {
    let items = this.state.items;
    let rows = [];
    for (let i=0;i<items.length; i++) {
      let item = items[i];
      let countPage = parseInt(this.state.page,10)-1;
      let count = (i+1) + (countPage*this.state.limit);
      let label = item.label;
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

  render() {
    let heading = "Events";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-date", active: true, path: ""}
    ];

    let pageActions = <PageActions
      limit={this.state.limit}
      current_page={this.state.page}
      gotoPageValue={this.state.gotoPage}
      total_pages={this.state.totalPages}
      updatePage={this.updatePage}
      gotoPage={this.gotoPage}
      handleChange={this.handleChange}
      updateLimit={this.updateLimit}
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
        <td colSpan={4}><Spinner type="grow" color="info" /> <i>loading...</i></td>
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
                      <th>Label</th>
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
                      <th>Label</th>
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
            <h2>{heading}</h2>
          </div>
        </div>
        {content}
      </div>
    );
  }
}
export default Events = connect(mapStateToProps, mapDispatchToProps)(Events);
