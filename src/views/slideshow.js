import React, { Component } from 'react';
import {
  Table,
  Card, CardBody,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input,
  Button,ButtonGroup
} from 'reactstrap';
import { Spinner } from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';

import axios from 'axios';
import PageActions from '../components/page-actions';
import ArticleImageBrowser from '../components/article-image-browser.js';

import {connect} from "react-redux";

import {
  setPaginationParams
} from "../redux/actions/main-actions";
const mapStateToProps = state => {
  return {
    slideshowPagination: state.slideshowPagination,
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params))
  }
}

const APIPath = process.env.REACT_APP_APIPATH;

class Slideshow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      items: [],
      orderField: this.props.slideshowPagination.orderField,
      orderDesc: this.props.slideshowPagination.orderDesc,
      page: this.props.slideshowPagination.page,
      gotoPage: this.props.slideshowPagination.page,
      limit: this.props.slideshowPagination.limit,
      status: this.props.slideshowPagination.status,
      totalPages: 0,
      totalItems: 0,
      modalVisible: false,
      searchInput: '',
      // form
      form: {
        _id: null,
        label: '',
        caption: '',
        order: '',
        url: '',
        status: '',
        image: '',
      },
      imageDetails: '',
      saving: false,
      updateBtn: <span><i className="fa fa-save" /> Update</span>,
      errorVisible: false,
      errorText: [],
      imageModal: false,
      deleteModalVisible: false
    }
    this.load = this.load.bind(this);
    this.loadItem = this.loadItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.setItemStatus = this.setItemStatus.bind(this);
    this.tableRows = this.tableRows.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleImage = this.toggleImage.bind(this);
    this.imageFn = this.imageFn.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);

    // hack to kill load promise on unmount
    this.cancelLoad=false;
  }

  toggleModal(item=null) {
    let update = {
      modalVisible: !this.state.modalVisible
    }
    if (item!==null) {
      this.loadItem(item._id);
    }
    else {
      update.form = {
        _id: null,
        label: '',
        caption: '',
        order: 0,
        url: '',
        status: 'private',
        image: ''
      };
      update.imageDetails = "";
    }
    this.setState(update);
  }

  toggleImage() {
    this.setState({
      imageModal: !this.state.imageModal
    })
  }

  toggleDeleteModal() {
    this.setState({
      deleteModalVisible: !this.state.deleteModalVisible
    })
  }

  imageFn(_id) {
    let form = Object.assign({},this.state.form);
    form.image = _id;
    this.setState({form:form});
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
    let url = APIPath+'slideshow-items';
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
      loading: false,
      totalItems: responseData.totalItems,
      items: responseData.data
    });

  }

  async loadItem(_id) {
    let url = APIPath+'slideshow-item';
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: {_id: _id}
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
	  });
    if (this.cancelLoad) {
      return false;
    }

    let form = {
      _id: responseData._id,
      label: responseData.label,
      caption: responseData.caption,
      order: responseData.order,
      url: responseData.url,
      status: responseData.status,
      image: responseData.image
    };
    this.setState({
      form: form,
      imageDetails: responseData.imageDetails
    });

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
    let url = APIPath+'slideshow-items';
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
    this.setState({
      loading: false,
      totalItems: responseData.totalItems,
      items: responseData.data,
      simpleSearch: true
    });
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
    this.props.setPaginationParams("slideshow", payload);
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
    });
    this.updateStorePagination({status:status});
    let context = this;
    setTimeout(function() {
      context.load();
    },100)
  }

  setItemStatus(status) {
    let newForm = Object.assign({}, this.state.form);
    newForm.status = status;
    this.setState({
      form: newForm
    })
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    let newForm = Object.assign({}, this.state.form);
    newForm[name] = value;
    this.setState({
      form: newForm
    });
  }

  handleSearch(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  async formSubmit(e) {
    e.preventDefault();
    if (this.state.saving) {
      return false;
    }
    this.setState({saving: true});
    let update = await axios({
      method: 'put',
      url: APIPath+'slideshow-item',
      crossDomain: true,
      data: this.state.form
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error)
    });
    if (update.status) {
      let formCopy = Object.assign({}, this.state.form);
      formCopy._id = update.data._id;
      this.setState({
        updateBtn: <span><i className="fa fa-save" /> Update success <i className="fa fa-check" /></span>,
        loading: true,
        form: formCopy,
        saving: false
      });
      this.loadItem(update.data._id);
    }
    else {
      let errorText = [];
      for (let i=0; i<update.errors.length; i++) {
        let error = update.errors[i];
        errorText.push(<div key={i}>{error.msg}</div>)
      }
      this.setState({
        errorVisible: true,
        errorText: errorText,
        updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>,
        saving: false
      });
    }
    let context = this;
    setTimeout(function() {
      context.setState({
        updateBtn: <span><i className="fa fa-save" /> Update</span>
      });
    },2000);
  }

  tableRows() {
    let items = this.state.items;
    let rows = items.map((item,i)=>{
      let count = i+1;
      let row = <tr key={i}>
        <td>{count}</td>
        <td><div className="link-imitation" onClick={()=>this.toggleModal(item)}>{item.label}</div></td>
        <td><div className="link-imitation edit-item" onClick={()=>this.toggleModal(item)}><i className="fa fa-pencil" /></div></td>
      </tr>;
      return row;
    });
    return rows;
  }

  async deleteItem(){
    let _id = this.state.form._id;
    let data = {_id: _id};
    let responseData = await axios({
      method: 'delete',
      url: APIPath+'slideshow-item',
      crossDomain: true,
      data: data
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
    if (responseData.status) {
      this.toggleDeleteModal();
      this.toggleModal(null);
      this.load();
    }
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.loading && this.state.loading) {
      this.load();
    }
  }

  componentWillUnmount() {
    this.cancelLoad=true;
  }

  render() {
    let heading = "Slideshow";
    let breadcrumbsItems = [
      {label: heading, icon: "fa fa-image", active: true, path: ""}
    ];

    let pageActions = <PageActions
      clearSearch={this.clearSearch}
      current_page={this.state.page}
      gotoPage={this.gotoPage}
      gotoPageValue={this.state.gotoPage}
      handleChange={this.handleSearch}
      limit={this.state.limit}
      pageType="slideshow"
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
      let addNewBtn = <div className="btn btn-outline-secondary add-new-item-btn" onClick={()=>this.toggleModal(null)}><i className="fa fa-plus" /></div>;

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
      content = <div className="people-container">
        {pageActions}
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody className="people-card">
                <Table hover className="people-table">
                  <thead>
                    <tr>
                      <th style={{width: '40px'}}>#</th>
                      <th>Label</th>
                      <th style={{width: '30px'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsRows}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>#</th>
                      <th>Label</th>
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
    let modalTitle = "Add new slideshow item";
    if (this.state.form._id!==null) {
      modalTitle = "Edit slideshow item";
    }
    let errorContainerClass = " hidden";
    if (this.state.errorVisible) {
      errorContainerClass = "";
    }
    let errorContainer = <div className={"error-container"+errorContainerClass}>{this.state.errorText}</div>

    let statusPublic = "secondary";
    let statusPrivate = "secondary";
    let publicOutline = true;
    let privateOutline = false;
    if (this.state.form.status==="public") {
      statusPublic = "success";
      publicOutline = false;
      privateOutline = true;
    }
    let imagePreview = [];
    if (this.state.imageDetails!==null && this.state.imageDetails!=="") {
      let image = this.state.imageDetails;
      let imagePath = image.paths.find(p=>p.pathType==="source").path;
      imagePreview = <img className="slideshow-preview" alt="" src={imagePath} />
    }
    let editModal = <Modal isOpen={this.state.modalVisible} toggle={()=>this.toggleModal(null)} size="lg">
        <ModalHeader toggle={()=>this.toggleModal(null)}>{modalTitle}</ModalHeader>
        <ModalBody>
          <Form onSubmit={this.formSubmit}>
            <div className="text-right">
              <ButtonGroup>
                <Button size="sm" outline={publicOutline} color={statusPublic} onClick={()=>this.setItemStatus("public")}>Public</Button>
                <Button size="sm" outline={privateOutline} color={statusPrivate} onClick={()=>this.setItemStatus("private")}>Private</Button>
              </ButtonGroup>
            </div>
            {errorContainer}
            <FormGroup>
              <Label>Label</Label>
              <Input type="text" name="label" placeholder="The label of this slideshow item..." value={this.state.form.label} onChange={this.handleChange}/>
            </FormGroup>
            <FormGroup>
              <Label>Caption</Label>
              <Input type="textarea" name="caption" placeholder="The caption of this slideshow item..." value={this.state.form.caption} onChange={this.handleChange}/>
            </FormGroup>
            <FormGroup>
              <Label>Order</Label>
              <Input type="number" style={{width: "70px"}} name="order" placeholder="0" value={this.state.form.order} onChange={this.handleChange}/>
            </FormGroup>
            <FormGroup>
              <Label>URL</Label>
              <Input type="text" name="url" placeholder="The url of this slideshow item..." value={this.state.form.url} onChange={this.handleChange}/>
            </FormGroup>
          </Form>
          <FormGroup>
            <Label>Image</Label>
            <Button type="button" onClick={()=>this.toggleImage()} size="sm">Select image</Button>
            <div className="img-preview-container">{imagePreview}</div>
          </FormGroup>
          <ArticleImageBrowser modal={this.state.imageModal} toggle={this.toggleImage} featuredImgFn={this.imageFn} />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" outline size="sm" onClick={()=>this.toggleDeleteModal()} className="pull-left"><i className="fa fa-trash" /> Delete</Button>
          <Button color="primary" outline size="sm" onClick={(e)=>this.formSubmit(e)}>{this.state.updateBtn}</Button>
        </ModalFooter>
      </Modal>

    let deleteModal = <Modal isOpen={this.state.deleteModalVisible} toggle={this.toggleDeleteModal}>
      <ModalHeader toggle={this.toggleDeleteModal}>Delete "{this.state.form.label}"</ModalHeader>
      <ModalBody>The slideshow item "{this.state.form.label}" will be deleted. Continue?</ModalBody>
      <ModalFooter className="text-left">
        <Button className="pull-right" color="danger" size="sm" outline onClick={this.deleteItem}><i className="fa fa-trash-o" /> Delete</Button>
        <Button color="secondary" size="sm" onClick={this.toggleDeleteModal}>Cancel</Button>
      </ModalFooter>
    </Modal>;

    return(
      <div>
      <Breadcrumbs items={breadcrumbsItems} />
        <div className="row">
          <div className="col-12">
            <h2>{heading} <small>({this.state.totalItems})</small></h2>
          </div>
        </div>
        {content}
        {editModal}
        {deleteModal}
      </div>
    );
  }
}
export default Slideshow = connect(mapStateToProps, mapDispatchToProps)(Slideshow);
