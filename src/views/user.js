import React, { Component } from 'react';
import {
  Spinner,
  Button,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Card, CardTitle,CardBody, CardFooter,
  Form, FormGroup, Input, Label,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';
import Select from 'react-select';
import {Breadcrumbs} from '../components/breadcrumbs';
import crypto from 'crypto-js';

import axios from 'axios';

import {Redirect} from 'react-router-dom';

import {connect} from "react-redux";
const APIPath = process.env.REACT_APP_APIPATH;

class User extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reload: false,
      loading: true,
      user:null,
      redirect: false,
      redirectReload: false,
      deleteModal: false,
      updating: false,
      updateBtn: <span><i className="fa fa-save" /> Update</span>,
      errorVisible: false,
      errorText: [],
      closeUploadModal: false,
      deleteErrorVisible: false,
      deleteErrorText: [],

      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordRepeat: '',
      usergroup: null,

      usergroups: [],

      editPasswordVisible: false,
      passwordErrorVisible: false,
      passwordErrorText: [],
      passwordUpdating: false,
      passwordUpdateBtn: <span><i className="fa fa-save" /> Update</span>,
    }
    this.load = this.load.bind(this);
    this.loadUser = this.loadUser.bind(this);
    this.update = this.update.bind(this);
    this.validateUser = this.validateUser.bind(this);
    this.validatePassword = this.validatePassword.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.delete = this.delete.bind(this);
    this.reload = this.reload.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.toggleEditPassword = this.toggleEditPassword.bind(this);
    this.loadUsergroups = this.loadUsergroups.bind(this);
    this.usergroupsOptions = this.usergroupsOptions.bind(this);
  }

  async load() {
    let _id = this.props.match.params._id;
    let userData = null;
    if (_id!=="new") {
      userData = await this.loadUser(_id);
    }
    let userGroupsData = await this.loadUsergroups();
    let stateUpdate = {
      loading: false
    };
    let usergroups = [];
    if (userGroupsData.status) {
      usergroups = userGroupsData.data.data;
      stateUpdate.usergroups = usergroups;
      if (userData===null) {
        let defaultUsergroup = usergroups.find(item=>item.isDefault===true);
        let defaultOption = {value: defaultUsergroup._id, label: defaultUsergroup.label};
        stateUpdate.usergroup = defaultOption;
      }
    }
    if (userData!==null && userData.status) {
      let user = userData.data;
      let usergroupValue = usergroups.find(item=>item._id===user.usergroup._id);
      let usergroupOption = {value: usergroupValue._id, label: usergroupValue.label};
      stateUpdate.user = user;
      stateUpdate.firstName = user.firstName;
      stateUpdate.lastName = user.lastName;
      stateUpdate.email = user.email;
      stateUpdate.usergroup = usergroupOption;
      stateUpdate.reload = false;
      if (!user.hasPassword) {
        stateUpdate.errorVisible = true;
        stateUpdate.errorText = <div>This user account will not be usable until you set a password.</div>;
      }
    }
    this.setState(stateUpdate);
  }

  async loadUser(_id) {
    let params = {_id: _id};
    let userData = await axios({
      method: 'get',
      url: APIPath+'user',
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
	  });
    return userData;
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
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      usergroup: this.state.usergroup.value,
    }
    let _id = this.props.match.params._id;
    if (_id!=="new") {
      postData._id = _id;
    }
    let isValid = this.validateUser(postData);
    if (isValid) {
      let updateData = await axios({
        method: 'put',
        url: APIPath+'user',
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
        let errorText = <div><b>{updateData.error.name}</b>: {updateData.error.code}</div>;
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

  updatePassword() {
    if (this.state.passwordUpdating) {
      return false;
    }
    this.setState({
      passwordUpdating: true,
      passwordUpdateBtn: <span><i className="fa fa-save" /> <i>Saving...</i> <Spinner color="info" size="sm"/></span>
    });
    let _id = this.props.match.params._id;
    let isValid = this.validatePassword(this.state.password, this.state.passwordRepeat);
    if (isValid) {
      let cryptoPass = crypto.SHA1(this.state.password).toString();
      let cryptoPassRepeat = crypto.SHA1(this.state.passwordRepeat).toString();
      let postData = {
        _id: _id,
        password: cryptoPass,
        passwordRepeat: cryptoPassRepeat,
      }
      let context = this;
      axios({
        method: 'post',
        url: APIPath+'user-password',
        crossDomain: true,
        data: postData,
      })
      .then(function (response) {
        let responseData = response.data.data;
        if(response.data.status) {
          let newState = {
            passwordUpdating: false,
            passwordUpdateBtn: <span><i className="fa fa-save" /> Update success <i className="fa fa-check" /></span>,
            reload: true,
            editPasswordVisible: false,
          };
          context.setState(newState);
          setTimeout(function() {
            context.setState({
              passwordUpdateBtn: <span><i className="fa fa-save" /> Update</span>
            });
          },2000);
        }
        else {
          let newState = {
            passwordUpdating: false,
            passwordErrorVisible: true,
            passwordErrorText: responseData.error,
            passwordUpdateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
          }
          context.setState(newState);
        }

      })
      .catch(function (error) {
      });
    }
  }

  validateUser(postData) {
    let emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(String(postData.email).toLowerCase())) {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: <div>Please provide a valid email</div>,
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

  validatePassword(password, passwordRepeat) {
    if (password.length<6) {
      this.setState({
        passwordUpdating: false,
        passwordErrorVisible: true,
        passwordErrorText: <div>The user password must contain at least 6 characters</div>,
        passwordUpdateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
      });
      return false;
    }
    if (password!==passwordRepeat) {
      this.setState({
        passwordUpdating: false,
        passwordErrorVisible: true,
        passwordErrorText: <div>The user password and password repeat don't match.</div>,
        passwordUpdateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
      });
      return false;
    }
    this.setState({
      passwordUpdating: false,
      passwordErrorVisible: false,
      passwordErrorText: []
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
    let deleteUser = await axios({
      method: 'delete',
      url: APIPath+'user',
      crossDomain: true,
      data: params
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
	  });
    if (deleteUser.status) {
      this.setState({
        redirect: true
      });
    }
    else {
      this.setState({
        deleteErrorVisible: true,
        deleteErrorText: deleteUser.error[0],
      });
    }
  }

  toggleEditPassword() {
    this.setState({
      editPasswordVisible: !this.state.editPasswordVisible
    })
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

  select2Change(selectedOption, element=null) {
    if (element===null) {
      return false;
    }
    this.setState({
      [element]: selectedOption
    });
  }

  async loadUsergroups() {
    let usergroupsData = await axios({
      method: 'get',
      url: APIPath+'user-groups',
      crossDomain: true,
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
      console.log(error)
	  });
    return usergroupsData;
  }

  usergroupsOptions() {
    let options = [];
    let usergroups = this.state.usergroups;
    for (let i=0; i<usergroups.length; i++) {
      let usergroup = usergroups[i];
      let option = {value: usergroup._id, label: usergroup.label};
      options.push(option);
    }
    return options;
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
      this.loadUser(this.props.match.params._id);
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
    if (this.state.user!==null && typeof this.state.user.firstName!=="undefined") {
      label = this.state.user.firstName;
      if (this.state.user.lastName!=="") {
        label += " "+this.state.user.lastName;
      }
    }
    else if (this.state.user!==null && typeof this.state.user.email!=="undefined") {
      label = this.state.user.email;
    }

    let heading = "User \""+label+"\"";
    if (this.props.match.params._id==="new") {
      heading = "Add new user";
    }
    let breadcrumbsItems = [
      {label: "Users", icon: "pe-7s-user", active: false, path: "/users"},
      {label: heading, icon: "pe-7s-user", active: true, path: ""}
    ];

    let redirectElem = [];
    let redirectReload = [];
    let deleteModal = [];
    let editPasswordModal = [];

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
      let deleteErrorContainerClass = " hidden";
      if (this.state.deleteErrorVisible) {
        deleteErrorContainerClass = "";
      }
      let usergroupsOptions = this.usergroupsOptions();

      let errorContainer = <div className={"error-container"+errorContainerClass}>{this.state.errorText}</div>

      let deleteErrorContainer = <div className={"error-container"+deleteErrorContainerClass}>{this.state.deleteErrorText}</div>

      let editPasswordToggle = [];
      let deleteBtn = [];
      if (this.state.user!==null) {
        editPasswordToggle = <div className="pull-right">
          <UncontrolledDropdown direction="right">
            <DropdownToggle className="more-toggle" outline>
              <i className="fa fa-ellipsis-v" />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={()=>this.toggleEditPassword()}>Edit password</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>;

        deleteBtn = <Button color="danger" size="sm" outline onClick={()=>this.toggleDeleteModal()}><i className="fa fa-trash-o" /> Delete</Button>;
      }
      content = <div className="row">
        <div className="col">
          <div className="item-details">
            <Card>
              <CardBody>
                <CardTitle>Edit User
                  {editPasswordToggle}
                </CardTitle>

                {errorContainer}
                <Form onSubmit={this.update}>
                  <FormGroup>
                    <Label for="firstName">First Name</Label>
                    <Input type="text" name="firstName" id="firstName" placeholder="First Name..." value={this.state.firstName} onChange={this.handleChange}/>
                  </FormGroup>
                  <FormGroup>
                    <Label for="lastName">Last Name</Label>
                    <Input type="text" name="lastName" id="lastName" placeholder="Last Name..." value={this.state.lastName} onChange={this.handleChange}/>
                  </FormGroup>
                  <FormGroup>
                    <Label for="email">Email</Label>
                    <Input type="email" name="email" id="email" placeholder="Email..." value={this.state.email} onChange={this.handleChange}/>
                  </FormGroup>
                  <FormGroup>
                    <Label>User group</Label>
                    <Select
                      value={this.state.usergroup}
                      onChange={(selectedOption)=>this.select2Change(selectedOption, "usergroup")}
                      options={usergroupsOptions}
                    />
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
        redirectElem = <Redirect to="/users" />;
      }
      if (this.state.redirectReload) {
        redirectReload = <Redirect to={"/user/"+this.state.newId} />;
      }

      deleteModal = <Modal isOpen={this.state.deleteModal} toggle={this.toggleDeleteModal}>
          <ModalHeader toggle={this.toggleDeleteModal}>Delete "{label}"</ModalHeader>
          <ModalBody>
            {deleteErrorContainer}
            <p>The user "{label}" will be deleted. Continue?</p>
          </ModalBody>
          <ModalFooter className="text-right">
            <Button size="sm" color="danger" outline onClick={()=>this.delete()}><i className="fa fa-trash-o" /> Delete</Button>
            <Button size="sm" className="pull-left" color="secondary" onClick={this.toggleDeleteModal}>Cancel</Button>
          </ModalFooter>
        </Modal>;

      let passwordErrorContainerClass = " hidden";
      if (this.state.passwordErrorVisible) {
        passwordErrorContainerClass = "";
      }

      let passwordErrorContainer = <div className={"error-container"+passwordErrorContainerClass}>{this.state.passwordErrorText}</div>

      editPasswordModal = <Modal isOpen={this.state.editPasswordVisible} toggle={this.toggleEditPassword}>
          <ModalHeader toggle={this.toggleEditPassword}>Update password</ModalHeader>
          <ModalBody>
            {passwordErrorContainer}
            <Form onSubmit={()=>this.updatePassword()}>
              <FormGroup>
                <Label for="password">Password</Label>
                <Input type="password" name="password" id="password" placeholder="Password..." value={this.state.password} onChange={this.handleChange}/>
              </FormGroup>

              <FormGroup>
                <Label for="passwordRepeat">Password repeat</Label>
                <Input type="password" name="passwordRepeat" id="passwordRepeat" placeholder="Password repeat..." value={this.state.passwordRepeat} onChange={this.handleChange}/>
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter className="text-right">
            <Button color="secondary" size="sm" onClick={()=>this.updatePassword()}>{this.state.passwordUpdateBtn}</Button>
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
        {editPasswordModal}
      </div>
    );
  }
}
export default User = connect(null, [])(User);
