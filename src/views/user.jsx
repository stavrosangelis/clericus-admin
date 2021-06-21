import React, { Component, Suspense, lazy } from 'react';
import {
  Spinner,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardTitle,
  CardBody,
  CardFooter,
  Form,
  FormGroup,
  Input,
  Label,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import Select from 'react-select';
import crypto from 'crypto-js';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));

const APIPath = process.env.REACT_APP_APIPATH;

export default class User extends Component {
  static async loadUser(_id) {
    if (_id === 'new') {
      return false;
    }
    const params = { _id };
    const userData = await axios({
      method: 'get',
      url: `${APIPath}user`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    return userData;
  }

  static async loadUsergroups() {
    const usergroupsData = await axios({
      method: 'get',
      url: `${APIPath}user-groups`,
      crossDomain: true,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    return usergroupsData;
  }

  constructor(props) {
    super(props);

    this.state = {
      reload: false,
      loading: true,
      user: null,
      redirect: false,
      redirectReload: false,
      deleteModal: false,
      updating: false,
      updateBtn: (
        <span>
          <i className="fa fa-save" /> Update
        </span>
      ),
      errorVisible: false,
      errorText: [],
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
      passwordUpdateBtn: (
        <span>
          <i className="fa fa-save" /> Update
        </span>
      ),
    };
    this.load = this.load.bind(this);
    this.toggleRedirect = this.toggleRedirect.bind(this);
    this.toggleRedirectReload = this.toggleRedirectReload.bind(this);
    this.update = this.update.bind(this);
    this.validateUser = this.validateUser.bind(this);
    this.validatePassword = this.validatePassword.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.delete = this.delete.bind(this);
    this.reload = this.reload.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.toggleEditPassword = this.toggleEditPassword.bind(this);
    this.usergroupsOptions = this.usergroupsOptions.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const { loading, reload, redirect, redirectReload } = this.state;
    if (prevProps.match.params._id !== match.params._id) {
      this.load();
    }
    if (loading) {
      this.load();
    }
    if (reload) {
      this.load();
    }
    if (redirect) {
      this.toggleRedirect(false);
    }
    if (redirectReload) {
      this.toggleRedirectReload(false);
    }
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  toggleRedirect(value = null) {
    const { redirect } = this.state;
    let valueCopy = value;
    if (valueCopy === null) {
      valueCopy = !redirect;
    }
    this.setState({
      redirect: valueCopy,
    });
  }

  toggleRedirectReload(value = null) {
    const { redirectReload } = this.state;
    let valueCopy = value;
    if (valueCopy === null) {
      valueCopy = !redirectReload;
    }
    this.setState({
      redirectReload: valueCopy,
    });
  }

  async load() {
    const { match } = this.props;
    const { _id } = match.params;
    let userData = null;
    if (_id !== 'new') {
      userData = await this.constructor.loadUser(_id);
    }
    const userGroupsData = await this.constructor.loadUsergroups();
    const stateUpdate = {
      loading: false,
    };
    let usergroups = [];
    if (userGroupsData.status) {
      usergroups = userGroupsData.data.data;
      stateUpdate.usergroups = usergroups;
      if (userData === null) {
        const defaultUsergroup = usergroups.find(
          (item) => item.isDefault === true
        );
        const defaultOption = {
          value: defaultUsergroup._id,
          label: defaultUsergroup.label,
        };
        stateUpdate.usergroup = defaultOption;
      }
    }
    if (userData !== null && userData.status) {
      const user = userData.data;
      if (user.usergroup !== null) {
        const usergroupValue = usergroups.find(
          (item) => item._id === user.usergroup._id
        );
        const usergroupOption = {
          value: usergroupValue._id,
          label: usergroupValue.label,
        };
        stateUpdate.usergroup = usergroupOption;
      }
      stateUpdate.user = user;
      stateUpdate.firstName = user.firstName;
      stateUpdate.lastName = user.lastName;
      stateUpdate.email = user.email;
      stateUpdate.reload = false;
      if (!user.hasPassword) {
        stateUpdate.errorVisible = true;
        stateUpdate.errorText = (
          <div>
            This user account will not be usable until you set a password.
          </div>
        );
      }
    }
    this.setState(stateUpdate);
  }

  async update(e) {
    e.preventDefault();
    const { updating, firstName, lastName, email, usergroup } = this.state;
    if (updating) {
      return false;
    }
    this.setState({
      updating: true,
      updateBtn: (
        <span>
          <i className="fa fa-save" /> <i>Saving...</i>{' '}
          <Spinner color="info" size="sm" />
        </span>
      ),
    });
    const postData = {
      firstName,
      lastName,
      email,
      usergroup: usergroup.value,
    };
    const { match } = this.props;
    const { _id } = match.params;
    if (_id !== 'new') {
      postData._id = _id;
    }
    const isValid = this.validateUser(postData);
    if (isValid) {
      const updateData = await axios({
        method: 'put',
        url: `${APIPath}user`,
        crossDomain: true,
        data: postData,
      })
        .then((response) => response.data)
        .catch((error) => {
          console.log(error);
        });
      let newState = {};
      if (updateData.status) {
        newState = {
          updating: false,
          updateBtn: (
            <span>
              <i className="fa fa-save" /> Update success{' '}
              <i className="fa fa-check" />
            </span>
          ),
        };
        if (_id === 'new') {
          newState.redirectReload = true;
          newState.newId = updateData.data._id;
          newState.reload = true;
        }
      } else {
        const errorText = (
          <div>
            <b>{updateData.error.name}</b>: {updateData.error.code}
          </div>
        );
        newState = {
          updating: false,
          updateBtn: (
            <span>
              <i className="fa fa-save" /> Update error{' '}
              <i className="fa fa-times" />
            </span>
          ),
          errorVisible: true,
          errorText,
        };
      }

      this.setState(newState);
      const context = this;
      setTimeout(() => {
        context.setState({
          updateBtn: (
            <span>
              <i className="fa fa-save" /> Update
            </span>
          ),
        });
      }, 2000);
    }
    return false;
  }

  async updatePassword() {
    const { passwordUpdating, password, passwordRepeat } = this.state;
    if (passwordUpdating) {
      return false;
    }
    this.setState({
      passwordUpdating: true,
      passwordUpdateBtn: (
        <span>
          <i className="fa fa-save" /> <i>Saving...</i>{' '}
          <Spinner color="info" size="sm" />
        </span>
      ),
    });
    const { match } = this.props;
    const { _id } = match.params;
    const isValid = this.validatePassword(password, passwordRepeat);
    if (isValid) {
      const cryptoPass = crypto.SHA1(password).toString();
      const cryptoPassRepeat = crypto.SHA1(passwordRepeat).toString();
      const postData = {
        _id,
        password: cryptoPass,
        passwordRepeat: cryptoPassRepeat,
      };
      const context = this;
      const responseData = await axios({
        method: 'post',
        url: `${APIPath}user-password`,
        crossDomain: true,
        data: postData,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      if (responseData.status) {
        const newState = {
          passwordUpdating: false,
          passwordUpdateBtn: (
            <span>
              <i className="fa fa-save" /> Update success{' '}
              <i className="fa fa-check" />
            </span>
          ),
          reload: true,
          editPasswordVisible: false,
          loading: true,
        };
        context.setState(newState);
        setTimeout(() => {
          context.setState({
            passwordUpdateBtn: (
              <span>
                <i className="fa fa-save" /> Update
              </span>
            ),
          });
        }, 2000);
      } else {
        const newState = {
          passwordUpdating: false,
          passwordErrorVisible: true,
          passwordErrorText: responseData.error,
          passwordUpdateBtn: (
            <span>
              <i className="fa fa-save" /> Update error{' '}
              <i className="fa fa-times" />
            </span>
          ),
        };
        context.setState(newState);
      }
    }
    return false;
  }

  validateUser(postData) {
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(String(postData.email).toLowerCase())) {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: <div>Please provide a valid email</div>,
        updateBtn: (
          <span>
            <i className="fa fa-save" /> Update error{' '}
            <i className="fa fa-times" />
          </span>
        ),
      });
      return false;
    }
    this.setState({
      updating: false,
      errorVisible: false,
      errorText: [],
    });
    return true;
  }

  validatePassword(password, passwordRepeat) {
    if (password.length < 6) {
      this.setState({
        passwordUpdating: false,
        passwordErrorVisible: true,
        passwordErrorText: (
          <div>The user password must contain at least 6 characters</div>
        ),
        passwordUpdateBtn: (
          <span>
            <i className="fa fa-save" /> Update error{' '}
            <i className="fa fa-times" />
          </span>
        ),
      });
      return false;
    }
    if (password !== passwordRepeat) {
      this.setState({
        passwordUpdating: false,
        passwordErrorVisible: true,
        passwordErrorText: (
          <div>The user password and password repeat don&apos;t match.</div>
        ),
        passwordUpdateBtn: (
          <span>
            <i className="fa fa-save" /> Update error{' '}
            <i className="fa fa-times" />
          </span>
        ),
      });
      return false;
    }
    this.setState({
      passwordUpdating: false,
      passwordErrorVisible: false,
      passwordErrorText: [],
    });
    return true;
  }

  toggleDeleteModal() {
    const { deleteModal } = this.state;
    this.setState({
      deleteModal: !deleteModal,
    });
  }

  async delete() {
    const { match } = this.props;
    const { _id } = match.params;
    const params = { _id };
    const deleteUser = await axios({
      method: 'delete',
      url: `${APIPath}user`,
      crossDomain: true,
      data: params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (deleteUser.status) {
      this.setState({
        redirect: true,
      });
    } else {
      this.setState({
        deleteErrorVisible: true,
        deleteErrorText: deleteUser.error[0],
      });
    }
  }

  toggleEditPassword() {
    const { editPasswordVisible } = this.state;
    this.setState({
      editPasswordVisible: !editPasswordVisible,
    });
  }

  reload() {
    this.setState({
      reload: true,
    });
  }

  select2Change(selectedOption, element = null) {
    if (element === null) {
      return false;
    }
    this.setState({
      [element]: selectedOption,
    });
    return false;
  }

  usergroupsOptions() {
    const options = [];
    const { usergroups } = this.state;
    for (let i = 0; i < usergroups.length; i += 1) {
      const usergroup = usergroups[i];
      const option = { value: usergroup._id, label: usergroup.label };
      options.push(option);
    }
    return options;
  }

  render() {
    const {
      user,
      loading,
      errorVisible,
      deleteErrorVisible,
      errorText,
      deleteErrorText,
      firstName,
      lastName,
      email,
      usergroup,
      updateBtn,
      redirect,
      redirectReload: stateRedirectReload,
      newId,
      deleteModal: stateDeleteModal,
      passwordErrorVisible,
      passwordErrorText,
      editPasswordVisible,
      password,
      passwordRepeat,
      passwordUpdateBtn,
    } = this.state;
    const { match } = this.props;
    let label = '';
    if (user !== null && typeof user.firstName !== 'undefined') {
      label = user.firstName;
      if (user.lastName !== '') {
        label += ` ${user.lastName}`;
      }
    } else if (user !== null && typeof user.email !== 'undefined') {
      label = user.email;
    }

    let heading = `User "${label}"`;
    if (match.params._id === 'new') {
      heading = 'Add new user';
    }
    const breadcrumbsItems = [
      { label: 'Users', icon: 'pe-7s-user', active: false, path: '/users' },
      { label: heading, icon: 'pe-7s-user', active: true, path: '' },
    ];

    let redirectElem = [];
    let redirectReload = [];
    let deleteModal = [];
    let editPasswordModal = [];

    let content = (
      <div className="row">
        <div className="col-12">
          <div style={{ padding: '40pt', textAlign: 'center' }}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    );

    if (!loading) {
      const errorContainerClass = errorVisible ? '' : ' hidden';
      const deleteErrorContainerClass = deleteErrorVisible ? '' : ' hidden';
      const usergroupsOptions = this.usergroupsOptions();

      const errorContainer = (
        <div className={`error-container${errorContainerClass}`}>
          {errorText}
        </div>
      );

      const deleteErrorContainer = (
        <div className={`error-container${deleteErrorContainerClass}`}>
          {deleteErrorText}
        </div>
      );

      let editPasswordToggle = [];
      let deleteBtn = [];
      if (user !== null) {
        editPasswordToggle = (
          <div className="pull-right">
            <UncontrolledDropdown direction="right">
              <DropdownToggle className="more-toggle" outline>
                <i className="fa fa-ellipsis-v" />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={() => this.toggleEditPassword()}>
                  Edit password
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
        );

        deleteBtn = (
          <Button
            color="danger"
            size="sm"
            outline
            onClick={() => this.toggleDeleteModal()}
          >
            <i className="fa fa-trash-o" /> Delete
          </Button>
        );
      }
      content = (
        <div className="row">
          <div className="col">
            <div className="item-details">
              <Card>
                <CardBody>
                  <CardTitle>
                    Edit User
                    {editPasswordToggle}
                  </CardTitle>

                  {errorContainer}
                  <Form onSubmit={this.update}>
                    <FormGroup>
                      <Label for="firstName">First Name</Label>
                      <Input
                        type="text"
                        name="firstName"
                        id="firstName"
                        placeholder="First Name..."
                        value={firstName}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="lastName">Last Name</Label>
                      <Input
                        type="text"
                        name="lastName"
                        id="lastName"
                        placeholder="Last Name..."
                        value={lastName}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="email">Email</Label>
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Email..."
                        value={email}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>User group</Label>
                      <Select
                        value={usergroup}
                        onChange={(selectedOption) =>
                          this.select2Change(selectedOption, 'usergroup')
                        }
                        options={usergroupsOptions}
                      />
                    </FormGroup>
                  </Form>
                </CardBody>
                <CardFooter>
                  {deleteBtn}
                  <Button
                    color="info"
                    className="pull-right"
                    size="sm"
                    outline
                    onClick={(e) => this.update(e)}
                  >
                    {updateBtn}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      );

      if (redirect) {
        redirectElem = <Redirect to="/users" />;
      }
      if (stateRedirectReload) {
        redirectReload = <Redirect to={`/user/${newId}`} />;
      }

      deleteModal = (
        <Modal isOpen={stateDeleteModal} toggle={this.toggleDeleteModal}>
          <ModalHeader toggle={this.toggleDeleteModal}>
            Delete &quot;{label}&quot;
          </ModalHeader>
          <ModalBody>
            {deleteErrorContainer}
            <p>The user &quot;{label}&quot; will be deleted. Continue?</p>
          </ModalBody>
          <ModalFooter className="text-right">
            <Button
              size="sm"
              color="danger"
              outline
              onClick={() => this.delete()}
            >
              <i className="fa fa-trash-o" /> Delete
            </Button>
            <Button
              size="sm"
              className="pull-left"
              color="secondary"
              onClick={this.toggleDeleteModal}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      );

      const passwordErrorContainerClass = passwordErrorVisible ? '' : ' hidden';

      const passwordErrorContainer = (
        <div className={`error-container${passwordErrorContainerClass}`}>
          {passwordErrorText}
        </div>
      );

      editPasswordModal = (
        <Modal isOpen={editPasswordVisible} toggle={this.toggleEditPassword}>
          <ModalHeader toggle={this.toggleEditPassword}>
            Update password
          </ModalHeader>
          <ModalBody>
            {passwordErrorContainer}
            <Form onSubmit={() => this.updatePassword()}>
              <FormGroup>
                <Label for="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password..."
                  value={password}
                  onChange={this.handleChange}
                />
              </FormGroup>

              <FormGroup>
                <Label for="passwordRepeat">Password repeat</Label>
                <Input
                  type="password"
                  name="passwordRepeat"
                  id="passwordRepeat"
                  placeholder="Password repeat..."
                  value={passwordRepeat}
                  onChange={this.handleChange}
                />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter className="text-right">
            <Button
              color="secondary"
              size="sm"
              onClick={() => this.updatePassword()}
            >
              {passwordUpdateBtn}
            </Button>
          </ModalFooter>
        </Modal>
      );
    }
    return (
      <div>
        {redirectElem}
        {redirectReload}
        <Suspense fallback={[]}>
          <Breadcrumbs items={breadcrumbsItems} />
        </Suspense>
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

User.defaultProps = {
  match: null,
};
User.propTypes = {
  match: PropTypes.object,
};
