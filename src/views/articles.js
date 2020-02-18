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

import {connect} from "react-redux";
import {
  setPaginationParams
} from "../redux/actions/main-actions";

const APIPath = process.env.REACT_APP_APIPATH;
const mapStateToProps = state => {
  return {
    articlesPagination: state.articlesPagination,
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params))
  }
}

class Articles extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      items: [],
      orderField: this.props.articlesPagination.orderField,
      orderDesc: this.props.articlesPagination.orderDesc,
      page: this.props.articlesPagination.page,
      gotoPage: this.props.articlesPagination.page,
      limit: this.props.articlesPagination.limit,
      status: this.props.articlesPagination.status,
      totalPages: 0,
      totalItems: 0,
      allChecked: false,

      searchInput: '',
    }
    this.load = this.load.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.tableRows = this.tableRows.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleSelectedAll = this.toggleSelectedAll.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);

    // hack to kill load promise on unmount
    this.cancelLoad=false;
  }

  async load() {
    this.setState({
      loading: true
    })
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      orderField: this.state.orderField,
      orderDesc: this.state.orderDesc,
      status: this.state.status,
    };
    if (this.state.searchInput!=="") {
      params.label = this.state.searchInput;
    }
    let url = APIPath+'articles';
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
    let items = responseData.data.map((item)=>{
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
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        items: items
      });
    }
  }

  async simpleSearch(e) {
    e.preventDefault();
    if (this.state.searchInput<2) {
      return false;
    }
    this.setState({
      loading: true
    });
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      label: this.state.searchInput,
      orderField: this.state.orderField,
      orderDesc: this.state.orderDesc,
      status: this.state.status,
    }
    let url = APIPath+'articles';
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

    let items = responseData.data.map((item)=>{
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
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        items: items,
        simpleSearch: true
      });
    }
  }

  clearSearch() {
    return new Promise((resolve)=> {
      this.setState({
        searchInput: '',
        simpleSearch: false,
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

  updateStorePagination({limit=null, page=null, orderField="", orderDesc=false, status=null}) {
    if (limit===null) {
      limit = this.state.limit;
    }
    if (page===null) {
      page = this.state.page;
    }
    let payload = {
      limit:limit,
      page:page,
      orderField:orderField,
      orderDesc:orderDesc,
      status:status,
    }
    this.props.setPaginationParams("articles", payload);
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

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  tableRows() {
    let items = this.state.items;
    let rows = items.map ((item,i)=>{
      let countPage = parseInt(this.state.page,10)-1;
      let count = (i+1) + (countPage*this.state.limit);
      let row = <tr key={i}>
        <td>
          <div className="select-checkbox-container">
            <input type="checkbox" value={i} checked={item.checked} onChange={() => {return false}}/>
            <span className="select-checkbox" onClick={()=>this.toggleSelected(i)}></span>
          </div>
        </td>
        <td>{count}</td>
        <td><Link href={"/article/"+item._id} to={"/article/"+item._id}>{item.label}</Link></td>
        <td><Link href={"/article/"+item._id} to={"/article/"+item._id} className="edit-item"><i className="fa fa-pencil" /></Link></td>
      </tr>;
      return row;
    });
    return rows;
  }

  toggleSelected(i) {
    let people = this.state.people;
    let newPersonChecked = !people[i].checked;
    people[i].checked = newPersonChecked;
    this.setState({
      people: people
    });
  }

  toggleSelectedAll() {
    let allChecked = !this.state.allChecked;
    let items = this.state.items;
    let newItems = items.map(item=> {
      item.checked = allChecked;
      return item;
    });
    this.setState({
      items: newItems,
      allChecked: allChecked
    })
  }

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    this.cancelLoad=true;
  }

  render() {
    let heading = "Articles";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-news-paper", active: true, path: ""}
    ];

    let pageActions = <PageActions
      clearSearch={this.clearSearch}
      current_page={this.state.page}
      gotoPage={this.gotoPage}
      gotoPageValue={this.state.gotoPage}
      handleChange={this.handleChange}
      limit={this.state.limit}
      pageType="articles"
      searchInput={this.state.searchInput}
      setStatus={this.setStatus}
      status={this.state.status}
      simpleSearch={this.simpleSearch}
      total_pages={this.state.totalPages}
      types={[]}
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
      let addNewBtn = <Link className="btn btn-outline-secondary add-new-item-btn" to="/article/new" href="/article/new"><i className="fa fa-plus" /></Link>;

      let tableLoadingSpinner = <tr>
        <td colSpan={6}><Spinner type="grow" color="info" /> <i>loading...</i></td>
      </tr>;
      let itemsRows = [];
      if (this.state.tableLoading) {
        itemsRows = tableLoadingSpinner;
      }
      else {
        itemsRows = this.tableRows();
      }
      let allChecked = "";
      if (this.state.allChecked) {
        allChecked = "checked";
      }

      /*let selectedItems = this.state.items.filter(item=>{
          return item.checked;
      });*/

      // ordering
      let labelOrderIcon = [];
      if (this.state.orderField==="label" || this.state.orderField==="") {
        if (this.state.orderDesc) {
          labelOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          labelOrderIcon = <i className="fa fa-caret-up" />
        }
      }

      content = <div className="people-container">
        {pageActions}
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody className="people-card">
                <Table hover className="people-table">
                  <thead>
                    <tr>
                      <th style={{width: "30px"}}>
                        <div className="select-checkbox-container default">
                          <input type="checkbox" checked={allChecked} onChange={() => {return false}}/>
                          <span className="select-checkbox" onClick={this.toggleSelectedAll}></span>
                        </div>
                      </th>
                      <th style={{width: '40px'}}>#</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("label")}>Label {labelOrderIcon}</th>
                      <th style={{width: '30px'}}></th>
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
                      <th></th>
                    </tr>
                  </tfoot>
                </Table>
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
export default Articles = connect(mapStateToProps, mapDispatchToProps)(Articles);
