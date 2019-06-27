import React, { Component } from 'react';
import {
  Table,
  Card, CardBody
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';

import axios from 'axios';
import {APIPath} from '../static/constants';
import PageActions from '../components/page-actions';

import {connect} from "react-redux";
import {
  setPaginationParams
} from "../redux/actions/main-actions";

const mapStateToProps = state => {
  return {
    usergroupsPagination: state.usergroupsPagination,
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params))
  }
}

class Usergroups extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      tableLoading: true,
      usergroups: [],
      page: this.props.usergroupsPagination.page,
      gotoPage: this.props.usergroupsPagination.page,
      limit: this.props.usergroupsPagination.limit,
      totalPages: 0,
      totalItems: 0,
    }
    this.load = this.load.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.usergroupsTableRows = this.usergroupsTableRows.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
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
    let url = APIPath+'user-groups';
    axios({
        method: 'get',
        url: url,
        crossDomain: true,
        params: params
      })
  	  .then(function (response) {
        let responseData = response.data.data;
        let usergroups = responseData.data;
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
            usergroups: usergroups
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
      })
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
    this.props.setPaginationParams("usergroups", payload);
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

  usergroupsTableRows() {
    let usergroups = this.state.usergroups;
    let rows = [];
    for (let i=0;i<usergroups.length; i++) {
      let usergroup = usergroups[i];
      let countPage = parseInt(this.state.page,10)-1;
      let count = (i+1) + (countPage*this.state.limit);
      let label = usergroup.name;

      let isAdminIcon = [];
      let isDefaultIcon = [];
      if (usergroup.isAdmin) {
        isAdminIcon = <i className="fa fa-check-circle" />;
      }
      if (usergroup.isDefault) {
        isDefaultIcon = <i className="fa fa-check-circle" />;
      }

      let row = <tr key={i}>
        <td>{count}</td>
        <td><Link href={"/user-group/"+usergroup._id} to={"/user-group/"+usergroup._id}>{label}</Link></td>
        <td className="text-center">{isDefaultIcon}</td>
        <td className="text-center">{isAdminIcon}</td>
        <td><Link href={"/user-group/"+usergroup._id} to={"/user-group/"+usergroup._id} className="edit-item"><i className="fa fa-pencil" /></Link></td>
      </tr>
      rows.push(row);
    }
    return rows;
  }

  componentDidMount() {
    this.load();
  }

  render() {
    let heading = "Usergroups";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-user", active: true, path: ""}
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
      let addNewBtn = <Link className="btn btn-outline-secondary add-new-item-btn" to="/user-group/new" href="/user-group/new"><i className="fa fa-plus" /></Link>;

      let tableLoadingSpinner = <tr>
        <td colSpan={6}><Spinner type="grow" color="info" /> <i>loading...</i></td>
      </tr>;
      let usergroupsRows = [];
      if (this.state.tableLoading) {
        usergroupsRows = tableLoadingSpinner;
      }
      else {
        usergroupsRows = this.usergroupsTableRows();
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
                      <th>Usergroup</th>
                      <th style={{width: "80px"}}>Is default</th>
                      <th style={{width: "80px"}}>Is admin</th>
                      <th style={{width: "40px"}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {usergroupsRows}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>#</th>
                      <th>Usergroup</th>
                      <th>Is default</th>
                      <th>Is admin</th>
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
export default Usergroups = connect(mapStateToProps, mapDispatchToProps)(Usergroups);
