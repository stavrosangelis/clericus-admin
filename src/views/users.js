import React, { Component } from 'react';
import {
  Table,
  Card, CardBody
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
    usersPagination: state.usersPagination,
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params))
  }
}

class Users extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      tableLoading: true,
      users: [],
      orderField: this.props.usersPagination.orderField,
      orderDesc: this.props.usersPagination.orderDesc,
      page: this.props.usersPagination.page,
      gotoPage: this.props.usersPagination.page,
      limit: this.props.usersPagination.limit,
      totalPages: 0,
      totalItems: 0,
    }
    this.load = this.load.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.usersTableRows = this.usersTableRows.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);

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
    }
    let url = APIPath+'users';
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
      let users = responseData.data;
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
          users: users
        });
      }
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
    this.updateStorePagination(null,null,orderField,orderDesc);
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
      this.updateStorePagination(null,e);
      let context = this;
      setTimeout(function(){
        context.load();
      },100);
    }
  }

  updateStorePagination(limit=null, page=null, orderField="", orderDesc=false) {
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
    }
    this.props.setPaginationParams("users", payload);
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

  usersTableRows() {
    let users = this.state.users;
    let rows = [];
    for (let i=0;i<users.length; i++) {
      let user = users[i];
      let countPage = parseInt(this.state.page,10)-1;
      let count = (i+1) + (countPage*this.state.limit);
      let label = user.firstName;
      if (user.lastName!=="") {
        label +=" "+user.lastName;
      }
      let row = <tr key={i}>
        <td>{count}</td>
        <td><Link href={"/user/"+user._id} to={"/user/"+user._id}>{label}</Link></td>
        <td><Link href={"/user/"+user._id} to={"/user/"+user._id}>{user.email}</Link></td>
        <td><Link href={"/user/"+user._id} to={"/user/"+user._id} className="edit-item"><i className="fa fa-pencil" /></Link></td>
      </tr>
      rows.push(row);
    }
    return rows;
  }

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    this.cancelLoad=true;
  }


  render() {
    let heading = "Users";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-user", active: true, path: ""}
    ];

    let pageActions = <PageActions
      current_page={this.state.page}
      gotoPage={this.gotoPage}
      gotoPageValue={this.state.gotoPage}
      handleChange={this.handleChange}
      limit={this.state.limit}
      pageType="users"
      total_pages={this.state.totalPages}
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
      let addNewBtn = <Link className="btn btn-outline-secondary add-new-item-btn" to="/user/new" href="/user/new"><i className="fa fa-plus" /></Link>;

      let tableLoadingSpinner = <tr>
        <td colSpan={6}><Spinner type="grow" color="info" /> <i>loading...</i></td>
      </tr>;
      let usersRows = [];
      if (this.state.tableLoading) {
        usersRows = tableLoadingSpinner;
      }
      else {
        usersRows = this.usersTableRows();
      }

      // ordering
      let firstNameOrderIcon = [];
      let emailOrderIcon = [];
      if (this.state.orderField==="firstName" || this.state.orderField==="") {
        if (this.state.orderDesc) {
          firstNameOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          firstNameOrderIcon = <i className="fa fa-caret-up" />
        }
      }
      if (this.state.orderField==="email" || this.state.orderField==="") {
        if (this.state.orderDesc) {
          emailOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          emailOrderIcon = <i className="fa fa-caret-up" />
        }
      }

      content = <div className="people-container">
        {pageActions}
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                <Table hover>
                  <thead>
                    <tr>
                      <th style={{width: "40px"}}>#</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("firstName")}>User {firstNameOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("email")}>Email {emailOrderIcon}</th>
                      <th style={{width: "40px"}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersRows}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>#</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("firstName")}>User {firstNameOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("email")}>Email {emailOrderIcon}</th>
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
            <h2>{heading}</h2>
          </div>
        </div>
        {content}
      </div>
    );
  }
}
export default Users = connect(mapStateToProps, mapDispatchToProps)(Users);
