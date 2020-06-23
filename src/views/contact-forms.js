import React, { Component } from 'react';
import {
  Table,
  Card, CardBody,
  Modal, ModalHeader, ModalBody,
} from 'reactstrap';
import { Spinner } from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';

import axios from 'axios';
import PageActions from '../components/page-actions';

import {connect} from "react-redux";
import {
  setPaginationParams,
} from "../redux/actions/main-actions";

const APIPath = process.env.REACT_APP_APIPATH;

const mapStateToProps = state => {
  return {
    contactFormsPagination: state.contactFormsPagination,
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params))
  }
}

class ContactForms extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      tableLoading: true,
      items: [],
      activeType: this.props.contactFormsPagination.activeType,
      orderField: this.props.contactFormsPagination.orderField,
      orderDesc: this.props.contactFormsPagination.orderDesc,
      page: this.props.contactFormsPagination.page,
      gotoPage: this.props.contactFormsPagination.page,
      limit: this.props.contactFormsPagination.limit,
      status: this.props.contactFormsPagination.status,
      totalPages: 0,
      totalItems: 0,
      allChecked: false,
      searchInput: this.props.contactFormsPagination.searchInput,
      modalVisible: false,
      modalDetails: {
        from: "",
        email: "",
        subject: "",
        html: "",
        createdAt: ""
      }
    }
    this.load = this.load.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.itemsTableRows = this.itemsTableRows.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.loadItem = this.loadItem.bind(this);

    // hack to kill load promise on unmount
    this.cancelLoad=false;
  }

  toggleModal() {
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  async loadItem(_id) {
    let params = {_id: _id}
    let url = APIPath+'contact-form';
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
    this.setState({
      modalVisible: true,
      modalDetails: responseData
    });
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
    }
    if (this.state.searchInput<2) {
      params.email = this.state.searchInput;
    }
    let url = APIPath+'contact-forms';
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
        items: responseData.data
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
      orderField: this.state.orderField,
      orderDesc: this.state.orderDesc,
      email: this.state.searchInput
    }
    let url = APIPath+'contact-forms';
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
        items: responseData.data
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
      })
      this.updateStorePagination({page:e});
      let context = this;
      setTimeout(function(){
        context.load();
      },100);
    }
  }

  updateStorePagination({limit=null, page=null, activeType=null, orderField="", orderDesc=false, searchInput=""} ) {
    if (limit===null) {
      limit = this.state.limit;
    }
    if (page===null) {
      page = this.state.page;
    }
    if (activeType===null) {
      activeType = this.state.activeType;
    }
    if (orderField==="") {
      orderField = this.state.orderField;
    }
    if (orderDesc===false) {
      orderDesc = this.state.orderDesc;
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
      searchInput:this.state.searchInput,
    }
    this.props.setPaginationParams("contactForms", payload);
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

  itemsTableRows() {
    let items = this.state.items;
    let rows = [];
    for (let i=0;i<items.length; i++) {
      let item = items[i];
      let countPage = parseInt(this.state.page,10)-1;
      let count = (i+1) + (countPage*this.state.limit);
      let createdAt = <div><small>{item.createdAt.split("T")[0]}</small><br/><small>{item.createdAt.split("T")[1]}</small></div>;
      let row = <tr key={i}>
        <td>{count}</td>
        <td><div className="link" onClick={()=>this.loadItem(item._id)}>{item.from}</div></td>
        <td><div className="link" onClick={()=>this.loadItem(item._id)}>{item.email}</div></td>
        <td><div className="link" onClick={()=>this.loadItem(item._id)}>{item.subject}</div></td>
        <td>{createdAt}</td>
        <td><div className="link" onClick={()=>this.loadItem(item._id)}><i className="fa fa-eye" /></div></td>
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
    let heading = "Contact forms";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-mail", active: true, path: ""}
    ];

    let pageActions = <PageActions
      clearSearch={this.clearSearch}
      current_page={this.state.page}
      gotoPageValue={this.state.gotoPage}
      gotoPage={this.gotoPage}
      handleChange={this.handleChange}
      limit={this.state.limit}
      pageType="contact-forms"
      searchInput={this.state.searchInput}
      simpleSearch={this.simpleSearch}
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
      let tableLoadingSpinner = <tr>
        <td colSpan={6}><Spinner type="grow" color="info" /> <i>loading...</i></td>
      </tr>;
      let itemsRows = [];
      if (this.state.tableLoading) {
        itemsRows = tableLoadingSpinner;
      }
      else {
        itemsRows = this.itemsTableRows();
      }

      // ordering
      let nameOrderIcon = [];
      let emailOrderIcon = [];
      let subjectOrderIcon = [];
      let createdOrderIcon = [];
      if (this.state.orderField==="name") {
        if (this.state.orderDesc) {
          nameOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          nameOrderIcon = <i className="fa fa-caret-up" />
        }
      }
      if (this.state.orderField==="email") {
        if (this.state.orderDesc) {
          emailOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          emailOrderIcon = <i className="fa fa-caret-up" />
        }
      }
      if (this.state.orderField==="subject") {
        if (this.state.orderDesc) {
          subjectOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          subjectOrderIcon = <i className="fa fa-caret-up" />
        }
      }
      if (this.state.orderField==="createdAt" || this.state.orderField==="") {
        if (this.state.orderDesc) {
          createdOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          createdOrderIcon = <i className="fa fa-caret-up" />
        }
      }
      const itemModal = <Modal isOpen={this.state.modalVisible} toggle={this.toggleModal}>
          <ModalHeader toggle={this.toggleModal}>Contact form details</ModalHeader>
          <ModalBody style={{paddingBottom: "50px"}}>
            <div><b>Name</b></div>
            {this.state.modalDetails.from}
            <div><b>Email</b></div>
            {this.state.modalDetails.email}
            <div><b>Subject</b></div>
            {this.state.modalDetails.subject}
            <div><b>Message</b></div>
            {this.state.modalDetails.html}
            <div><b>Submitted</b></div>
            {this.state.modalDetails.createdAt}
          </ModalBody>
        </Modal>;

      content = <div className="organisations-container">
        {pageActions}
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                <Table hover>
                  <thead>
                    <tr>
                      <th style={{width: '40px'}}>#</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("from")}>From {nameOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("email")}>Email {emailOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("subject")}>Subject {subjectOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("createdAt")}>Submitted {createdOrderIcon}</th>
                      <th style={{width: '30px'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsRows}
                  </tbody>
                  <tfoot>
                  <tr>
                    <th style={{width: '40px'}}>#</th>
                    <th className="ordering-label" onClick={()=>this.updateOrdering("from")}>From {nameOrderIcon}</th>
                    <th className="ordering-label" onClick={()=>this.updateOrdering("email")}>Email {emailOrderIcon}</th>
                    <th className="ordering-label" onClick={()=>this.updateOrdering("subject")}>Subject {subjectOrderIcon}</th>
                    <th className="ordering-label" onClick={()=>this.updateOrdering("createdAt")}>Submitted {createdOrderIcon}</th>
                    <th style={{width: '30px'}}></th>
                  </tr>
                  </tfoot>
                </Table>
              </CardBody>
            </Card>
          </div>
        </div>
        {pageActions}
        {itemModal}
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
export default ContactForms = connect(mapStateToProps, mapDispatchToProps)(ContactForms);
