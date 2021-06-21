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
} from 'reactstrap';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));

const APIPath = process.env.REACT_APP_APIPATH;

export default class Usergroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reload: false,
      loading: true,
      usergroup: null,
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

      isAdmin: false,
      isDefault: false,
      label: '',
      description: '',

      deleteErrorVisible: false,
      deleteErrorText: [],
    };
    this.toggleRedirect = this.toggleRedirect.bind(this);
    this.toggleRedirectReload = this.toggleRedirectReload.bind(this);
    this.load = this.load.bind(this);
    this.update = this.update.bind(this);
    this.validateUsergroup = this.validateUsergroup.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.delete = this.delete.bind(this);
    this.reload = this.reload.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
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

  handleCheckbox(value, name) {
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
    if (_id === 'new') {
      this.setState({
        loading: false,
      });
    } else {
      const params = { _id };
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}user-group`,
        crossDomain: true,
        params,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      this.setState({
        loading: false,
        reload: false,
        usergroup: responseData,
        isAdmin: responseData.isAdmin,
        isDefault: responseData.isDefault,
        label: responseData.label,
        description: responseData.description,
      });
    }
  }

  async update(e) {
    e.preventDefault();
    const { updating, isAdmin, isDefault, label, description } = this.state;
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
      isAdmin,
      isDefault,
      label,
      description,
    };
    const { match } = this.props;
    const { _id } = match.params;
    if (_id !== 'new') {
      postData._id = _id;
    }
    const isValid = this.validateUsergroup(postData);
    if (isValid) {
      const updateData = await axios({
        method: 'put',
        url: `${APIPath}user-group`,
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
        const errorText = updateData.error.map((error) => (
          <div key={error}>{error}</div>
        ));
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

  validateUsergroup() {
    const { label } = this.state;
    if (label.length < 2) {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: (
          <div>
            The User group label must contain at least two (2) characters
          </div>
        ),
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
    const deleteUsergroup = await axios({
      method: 'delete',
      url: `${APIPath}user-group`,
      crossDomain: true,
      data: params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (!deleteUsergroup.status) {
      this.setState({
        deleteErrorVisible: true,
        deleteErrorText: deleteUsergroup.error,
      });
    } else {
      this.setState({
        deleteErrorVisible: false,
        deleteErrorText: '',
        redirect: true,
      });
    }
  }

  reload() {
    this.setState({
      reload: true,
    });
  }

  render() {
    const {
      usergroup,
      loading,
      errorVisible,
      errorText,
      deleteErrorVisible,
      deleteErrorText,
      isDefault,
      isAdmin,
      label: stateLabel,
      description,
      updateBtn,
      redirect,
      redirectReload: stateRedirectReload,
      newId,
      deleteModal: stateDeleteModal,
    } = this.state;
    const { match } = this.props;
    let label = '';
    if (usergroup !== null && typeof usergroup.label !== 'undefined') {
      label = usergroup.label;
    }
    let heading = `User group "${label}"`;
    if (match.params._id === 'new') {
      heading = 'Add new user group';
    }
    const breadcrumbsItems = [
      {
        label: 'Usergroups',
        icon: 'pe-7s-user',
        active: false,
        path: '/user-groups',
      },
      { label: heading, icon: 'pe-7s-user', active: true, path: '' },
    ];

    let redirectElem = [];
    let redirectReload = [];
    let deleteModal = [];

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
      const errorContainer = (
        <div className={`error-container${errorContainerClass}`}>
          {errorText}
        </div>
      );

      let deleteBtn = [];
      if (usergroup !== null) {
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

      const deleteErrorContainerClass = deleteErrorVisible ? '' : ' hidden';
      const deleteErrorContainer = (
        <div className={`error-container${deleteErrorContainerClass}`}>
          {deleteErrorText}
        </div>
      );

      let isDefaultChecked1 = '';
      let isDefaultChecked2 = 'checked';
      if (isDefault) {
        isDefaultChecked1 = 'checked';
        isDefaultChecked2 = '';
      }
      let isAdminChecked1 = '';
      let isAdminChecked2 = 'checked';
      if (isAdmin) {
        isAdminChecked1 = 'checked';
        isAdminChecked2 = '';
      }
      content = (
        <div className="row">
          <div className="col">
            <div className="item-details">
              <Card>
                <CardBody>
                  <CardTitle>Edit Usergroup</CardTitle>
                  {errorContainer}
                  <Form onSubmit={this.update}>
                    <FormGroup>
                      <Label for="name">Label</Label>
                      <Input
                        type="text"
                        name="label"
                        id="label"
                        placeholder="Name..."
                        value={stateLabel}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="description">Description</Label>
                      <Input
                        type="textarea"
                        name="description"
                        id="description"
                        placeholder="Description..."
                        value={description}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    <FormGroup tag="fieldset">
                      <Label>Is default</Label>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="radio"
                            name="isDefault"
                            checked={isDefaultChecked1}
                            onChange={() =>
                              this.handleCheckbox(true, 'isDefault')
                            }
                          />{' '}
                          Yes
                        </Label>
                        <Label check>
                          <Input
                            type="radio"
                            name="isDefault"
                            checked={isDefaultChecked2}
                            onChange={() =>
                              this.handleCheckbox(false, 'isDefault')
                            }
                          />{' '}
                          No
                        </Label>
                      </FormGroup>
                    </FormGroup>
                    <FormGroup tag="fieldset">
                      <Label>Is admin</Label>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="radio"
                            name="isAdmin"
                            checked={isAdminChecked1}
                            onChange={() =>
                              this.handleCheckbox(true, 'isAdmin')
                            }
                          />{' '}
                          Yes
                        </Label>
                        <Label check>
                          <Input
                            type="radio"
                            name="isAdmin"
                            checked={isAdminChecked2}
                            onChange={() =>
                              this.handleCheckbox(true, 'isAdmin')
                            }
                          />{' '}
                          No
                        </Label>
                      </FormGroup>
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
        redirectElem = <Redirect to="/user-groups" />;
      }
      if (stateRedirectReload) {
        redirectReload = <Redirect to={`/user-group/${newId}`} />;
      }

      deleteModal = (
        <Modal isOpen={stateDeleteModal} toggle={this.toggleDeleteModal}>
          <ModalHeader toggle={this.toggleDeleteModal}>
            Delete &quot;{label}&quot;
          </ModalHeader>
          <ModalBody>
            {deleteErrorContainer}The user group &quot;{label}&quot; will be
            deleted. Continue?
          </ModalBody>
          <ModalFooter className="text-right">
            <Button
              color="danger"
              outline
              size="sm"
              onClick={() => this.delete()}
            >
              <i className="fa fa-trash-o" /> Delete
            </Button>
            <Button
              className="pull-left"
              size="sm"
              color="secondary"
              onClick={this.toggleDeleteModal}
            >
              Cancel
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
      </div>
    );
  }
}

Usergroup.defaultProps = {
  match: null,
};
Usergroup.propTypes = {
  match: PropTypes.object,
};
