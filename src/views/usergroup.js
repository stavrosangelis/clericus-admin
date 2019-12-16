import React, { Component } from 'react';
import {
  Spinner,
  Button,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Card, CardTitle,CardBody, CardFooter,
  Form, FormGroup, Input, Label,
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import axios from 'axios';

import {Redirect} from 'react-router-dom';

import {connect} from "react-redux";
const APIPath = process.env.REACT_APP_APIPATH;

class Usergroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reload: false,
      loading: true,
      usergroup:null,
      redirect: false,
      redirectReload: false,
      deleteModal: false,
      updating: false,
      updateBtn: <span><i className="fa fa-save" /> Update</span>,
      errorVisible: false,
      errorText: [],
      closeUploadModal: false,

      isAdmin: false,
      isDefault: false,
      label: '',
      description: '',

      deleteErrorVisible: false,
      deleteErrorText: [],
    }
    this.load = this.load.bind(this);
    this.update = this.update.bind(this);
    this.validateUsergroup = this.validateUsergroup.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.delete = this.delete.bind(this);
    this.reload = this.reload.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
  }

  load() {
    let context = this;
    let _id = this.props.match.params._id;
    if (_id==="new") {
      this.setState({
        loading: false
      })
    }
    else {
    let params = {_id: _id};
      axios({
        method: 'get',
        url: APIPath+'user-group',
        crossDomain: true,
        params: params
      })
  	  .then(function (response) {
        let responseData = response.data.data;
        context.setState({
          loading: false,
          reload: false,
          usergroup: responseData,
          isAdmin: responseData.isAdmin,
          isDefault: responseData.isDefault,
          label: responseData.label,
          description: responseData.description,
        });
  	  })
  	  .catch(function (error) {
  	  });
    }
  }

  async update(e) {
    e.preventDefault();
    if (this.state.updating) {
      return false;
    }
    this.setState({
      updating: true,
      updateBtn: <span><i className="fa fa-save" /> <i>Saving...</i> <Spinner color="info" size="sm"/></span>
    });
    let postData = {
      isAdmin: this.state.isAdmin,
      isDefault: this.state.isDefault,
      label: this.state.label,
      description: this.state.description,
    }
    let _id = this.props.match.params._id;
    if (_id!=="new") {
      postData._id = _id;
    }
    let isValid = this.validateUsergroup(postData);
    if (isValid) {
      let updateData = await axios({
        method: 'put',
        url: APIPath+'user-group',
        crossDomain: true,
        data: postData
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
      });
      let newState = {};
      if (updateData.status) {
        newState = {
          updating: false,
          updateBtn: <span><i className="fa fa-save" /> Update success <i className="fa fa-check" /></span>,
        };
        if (_id==="new") {
          newState.redirectReload = true;
          newState.newId = updateData.data._id;
          newState.reload = true;
        }
      }
      else {
        let errorText = updateData.error.map(error=> {
          return <div key={error}>{error}</div>;
        })
        newState = {
          updating: false,
          updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>,
          errorVisible: true,
          errorText: errorText,
        };
      }

      this.setState(newState);
      let context = this;
      setTimeout(function() {
        context.setState({
          updateBtn: <span><i className="fa fa-save" /> Update</span>
        });
      },2000);
    }
  }

  validateUsergroup() {
    if (this.state.label.length<2) {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: <div>The User group label must contain at least two (2) characters</div>,
        updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
      });
      return false;
    }
    this.setState({
      updating: false,
      errorVisible: false,
      errorText: []
    })
    return true;
  }

  toggleDeleteModal() {
    this.setState({
      deleteModal: !this.state.deleteModal
    })
  }

  async delete() {
    let _id = this.props.match.params._id;
    let params = {_id: _id};
    let deleteUsergroup = await axios({
      method: 'delete',
      url: APIPath+'user-group',
      crossDomain: true,
      data: params
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
	  });
    if (!deleteUsergroup.status) {
      this.setState({
        deleteErrorVisible: true,
        deleteErrorText: deleteUsergroup.error
      });
    }
    else {
      this.setState({
        deleteErrorVisible: false,
        deleteErrorText: '',
        redirect: true
      });
    }
  }

  reload() {
    this.setState({
      reload: true
    })
  }

  handleChange(e){
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]:value
    });
  }

  handleCheckbox(value, name) {
    this.setState({
      [name]:value
    });
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.match.params._id!==this.props.match.params._id){
      this.load();
    }
    if (this.state.loading) {
      this.load();
    }
    if (this.state.reload) {
      this.load();
    }
    if (this.state.redirect) {
      this.setState({
        redirect: false
      })
    }
    if (this.state.redirectReload) {
      this.setState({
        redirectReload: false
      })
    }
  }

  render() {
    let label = '';
    if (this.state.usergroup!==null && typeof this.state.usergroup.label!=="undefined") {
      label = this.state.usergroup.label;
    }
    let heading = "User group \""+label+"\"";
    if (this.props.match.params._id==="new") {
      heading = "Add new user group";
    }
    let breadcrumbsItems = [
      {label: "Usergroups", icon: "pe-7s-user", active: false, path: "/user-groups"},
      {label: heading, icon: "pe-7s-user", active: true, path: ""}
    ];

    let redirectElem = [];
    let redirectReload = [];
    let deleteModal = [];

    let content = <div className="row">
      <div className="col-12">
        <div style={{padding: '40pt',textAlign: 'center'}}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>

    if (!this.state.loading) {

      let errorContainerClass = " hidden";
      if (this.state.errorVisible) {
        errorContainerClass = "";
      }
      let errorContainer = <div className={"error-container"+errorContainerClass}>{this.state.errorText}</div>

      let deleteBtn = [];
      if (this.state.usergroup!==null) {
        deleteBtn = <Button color="danger" size="sm" outline onClick={()=>this.toggleDeleteModal()}><i className="fa fa-trash-o" /> Delete</Button>;
      }

      let deleteErrorContainerClass = " hidden";
      if (this.state.deleteErrorVisible) {
        deleteErrorContainerClass = "";
      }
      let deleteErrorContainer = <div className={"error-container"+deleteErrorContainerClass}>{this.state.deleteErrorText}</div>

      let isDefaultChecked1 = "";
      let isDefaultChecked2 = "checked";
      if (this.state.isDefault) {
        isDefaultChecked1 = "checked";
        isDefaultChecked2 = "";
      }
      let isAdminChecked1 = "";
      let isAdminChecked2 = "checked";
      if (this.state.isAdmin) {
        isAdminChecked1 = "checked";
        isAdminChecked2 = "";
      }
      content = <div className="row">
        <div className="col">
          <div className="item-details">
            <Card>
              <CardBody>
                <CardTitle>Edit Usergroup
                </CardTitle>
                {errorContainer}
                <Form onSubmit={this.update}>
                  <FormGroup>
                    <Label for="name">Label</Label>
                    <Input type="text" name="label" id="label" placeholder="Name..." value={this.state.label} onChange={this.handleChange}/>
                  </FormGroup>
                  <FormGroup>
                    <Label for="description">Description</Label>
                    <Input type="textarea" name="description" id="description" placeholder="Description..." value={this.state.description} onChange={this.handleChange}/>
                  </FormGroup>
                  <FormGroup tag="fieldset">
                    <Label>Is default</Label>
                    <FormGroup check>
                      <Label check>
                        <Input type="radio" name="isDefault" checked={isDefaultChecked1} onChange={()=>this.handleCheckbox(true,"isDefault")} /> Yes
                      </Label>
                      <Label check>
                        <Input type="radio" name="isDefault" checked={isDefaultChecked2} onChange={()=>this.handleCheckbox(false,"isDefault")}  /> No
                      </Label>
                    </FormGroup>
                  </FormGroup>
                  <FormGroup tag="fieldset">
                    <Label>Is admin</Label>
                    <FormGroup check>
                      <Label check>
                        <Input type="radio" name="isAdmin" checked={isAdminChecked1} onChange={()=>this.handleCheckbox(true,"isAdmin")} /> Yes
                      </Label>
                      <Label check>
                        <Input type="radio" name="isAdmin" checked={isAdminChecked2} onChange={()=>this.handleCheckbox(true,"isAdmin")} /> No
                      </Label>
                    </FormGroup>
                  </FormGroup>

                </Form>
              </CardBody>
              <CardFooter>
                {deleteBtn}
                <Button color="info" className="pull-right" size="sm" outline onClick={(e)=>this.update(e)}>{this.state.updateBtn}</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      if (this.state.redirect) {
        redirectElem = <Redirect to="/user-groups" />;
      }
      if (this.state.redirectReload) {
        redirectReload = <Redirect to={"/user-group/"+this.state.newId} />;
      }

      deleteModal = <Modal isOpen={this.state.deleteModal} toggle={this.toggleDeleteModal}>
          <ModalHeader toggle={this.toggleDeleteModal}>Delete "{label}"</ModalHeader>
          <ModalBody>{deleteErrorContainer}The user group "{label}" will be deleted. Continue?</ModalBody>
          <ModalFooter className="text-right">
            <Button color="danger" outline size="sm" onClick={()=>this.delete()}><i className="fa fa-trash-o" /> Delete</Button>
            <Button className="pull-left" size="sm" color="secondary" onClick={this.toggleDeleteModal}>Cancel</Button>
          </ModalFooter>
        </Modal>;
    }
    return(
      <div>
      {redirectElem}
      {redirectReload}
      <Breadcrumbs items={breadcrumbsItems} />
        <div className="row">
          <div className="col-12">
            <h2>{heading}</h2>
          </div>
        </div>
        {content}
        {deleteModal}
      </div>
    );
  }
}
export default Usergroup = connect(null, [])(Usergroup);
