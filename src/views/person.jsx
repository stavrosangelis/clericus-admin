import React, { Component } from 'react';
import {
  Spinner,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Breadcrumbs from '../components/breadcrumbs';
import ViewPerson from '../components/view-person';
import AddRelation from '../components/add-relations';

import { parseReferenceLabels, parseReferenceTypes } from '../helpers';

const APIPath = process.env.REACT_APP_APIPATH;

const mapStateToProps = (state) => ({
  entitiesLoaded: state.entitiesLoaded,
  personEntity: state.personEntity,
});

class Person extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reload: false,
      loading: true,
      person: null,
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
      closeUploadModal: false,
      referencesLoaded: false,
      referencesLabels: [],
      referencesTypes: {
        event: [],
        organisation: [],
        person: [],
        resource: [],
      },
    };
    this.load = this.load.bind(this);
    this.toggleRedirect = this.toggleRedirect.bind(this);
    this.toggleRedirectReload = this.toggleRedirectReload.bind(this);
    this.toggleUploadModal = this.toggleUploadModal.bind(this);
    this.loadReferenceLabelsNTypes = this.loadReferenceLabelsNTypes.bind(this);
    this.uploadResponse = this.uploadResponse.bind(this);
    this.update = this.update.bind(this);
    this.validatePerson = this.validatePerson.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.delete = this.delete.bind(this);
    this.reload = this.reload.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    const { match, entitiesLoaded } = this.props;
    const {
      loading,
      reload,
      redirect,
      redirectReload,
      closeUploadModal,
      referencesLoaded,
    } = this.state;
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
    if (closeUploadModal) {
      this.toggleUploadModal(false);
    }
    if (entitiesLoaded && !referencesLoaded) {
      this.loadReferenceLabelsNTypes();
    }
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

  toggleUploadModal(value = null) {
    const { closeUploadModal } = this.state;
    let valueCopy = value;
    if (valueCopy === null) {
      valueCopy = !closeUploadModal;
    }
    this.setState({
      closeUploadModal: valueCopy,
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
      const personData = await axios({
        method: 'get',
        url: `${APIPath}person`,
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
        person: personData,
      });
    }
  }

  loadReferenceLabelsNTypes() {
    const { personEntity } = this.props;
    const referencesLabels = parseReferenceLabels(personEntity.properties);
    const referencesTypes = parseReferenceTypes(personEntity.properties);
    this.setState({
      referencesLabels,
      referencesTypes,
      referencesLoaded: true,
    });
  }

  uploadResponse(data) {
    if (data.status) {
      const { newId, person } = this.state;
      if (newId === null) {
        this.setState({
          newId: data.data._id,
          redirectReload: true,
          errorVisible: false,
          errorText: [],
        });
      }
      if (typeof person._id !== 'undefined') {
        this.setState({
          closeUploadModal: true,
        });
      }
    } else {
      const errorText = [];
      if (typeof data.error !== 'undefined' && data.error.length > 0) {
        let i = 0;
        for (let k = 0; k < data.error.length; k += 1) {
          errorText.push(<div key={i}>{data.error[k]}</div>);
          i += 1;
        }
      }

      this.setState({
        errorVisible: true,
        errorText,
      });
    }
  }

  validatePerson(postData) {
    if (postData.firstName.length < 2) {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: (
          <div>
            The person&apos;s <b>firstName</b> must contain at least two (2)
            characters
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
    /* if (postData.lastName.length<2) {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: <div>The person's <b>lastName</b> must contain at least two (2) characters</div>,
        updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
      });
      return false;
    } */
    this.setState({
      updating: false,
      errorVisible: false,
      errorText: [],
    });
    return true;
  }

  async update(newData) {
    const { updating, person } = this.state;
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
    let postData = person;
    if (person === null) {
      postData = {};
    }
    postData.honorificPrefix = newData.honorificPrefix;
    postData.firstName = newData.firstName;
    postData.middleName = newData.middleName;
    postData.lastName = newData.lastName;
    postData.alternateAppelations = newData.alternateAppelations;
    postData.description = newData.description;
    postData.status = newData.status;
    const { match } = this.props;
    const { _id } = match.params;
    if (_id !== 'new') {
      postData._id = _id;
    } else {
      delete postData._id;
    }
    const isValid = this.validatePerson(postData);
    if (isValid) {
      const context = this;
      const responseData = await axios({
        method: 'put',
        url: `${APIPath}person`,
        crossDomain: true,
        data: postData,
      })
        .then((response) => response.data)
        .catch((error) => {
          console.log(error);
        });

      if (responseData.status) {
        const newState = {
          updating: false,
          updateBtn: (
            <span>
              <i className="fa fa-save" /> Update success{' '}
              <i className="fa fa-check" />
            </span>
          ),
          reload: true,
        };
        if (_id === 'new') {
          newState.redirectReload = true;
          newState.newId = responseData.data._id;
        }
        this.setState(newState);
      } else {
        const errorText = [];
        for (let i = 0; i < responseData.errors.length; i += 1) {
          const error = responseData.errors[i];
          errorText.push(<div key={i}>{error.msg}</div>);
        }
        this.setState({
          errorVisible: true,
          errorText,
          updateBtn: (
            <span>
              <i className="fa fa-save" /> Update error{' '}
              <i className="fa fa-times" />
            </span>
          ),
        });
      }
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

  toggleDeleteModal() {
    const { deleteModal } = this.state;
    this.setState({
      deleteModal: !deleteModal,
    });
  }

  async delete() {
    const { match } = this.props;
    const { _id } = match.params;
    if (_id === 'new') {
      this.setState({
        loading: false,
      });
    } else {
      const params = { _id };
      const responseData = await axios({
        method: 'delete',
        url: `${APIPath}person`,
        crossDomain: true,
        params,
      })
        .then((response) => response.data)
        .catch((error) => {
          console.log(error);
        });
      if (responseData.status) {
        this.setState({
          redirect: true,
        });
      }
    }
  }

  reload() {
    this.setState({
      reload: true,
    });
  }

  render() {
    const {
      person,
      loading,
      errorText,
      errorVisible,
      updateBtn,
      redirect,
      newId,
      className,
      referencesLabels,
      referencesTypes,
      closeUploadModal,
      deleteModal: stateDeleteModal,
      redirectReload: stateRedirectReload,
    } = this.state;
    const { match } = this.props;
    let label = '';
    if (person !== null && typeof person.firstName !== 'undefined') {
      label = person.firstName;
      if (person.lastName !== '') {
        label += ` ${person.lastName}`;
      }
    }

    let heading = label;
    if (match.params._id === 'new') {
      heading = 'Add new person';
    }
    const breadcrumbsItems = [
      { label: 'People', icon: 'pe-7s-users', active: false, path: '/people' },
      { label: heading, icon: '', active: true, path: '' },
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
      content = (
        <div className="items-container">
          <ViewPerson
            person={person}
            label={label}
            delete={this.toggleDeleteModal}
            uploadResponse={this.uploadResponse}
            update={this.update}
            updateBtn={updateBtn}
            errorVisible={errorVisible}
            errorText={errorText}
            closeUploadModal={closeUploadModal}
            reload={this.reload}
          />
        </div>
      );

      if (redirect) {
        redirectElem = <Redirect to="/people" />;
      }
      if (stateRedirectReload) {
        redirectReload = <Redirect to={`/person/${newId}`} />;
      }

      deleteModal = (
        <Modal
          isOpen={stateDeleteModal}
          toggle={this.toggleDeleteModal}
          className={className}
        >
          <ModalHeader toggle={this.toggleDeleteModal}>
            Delete &quot;{label}&quot;
          </ModalHeader>
          <ModalBody>
            The person &quot;{label}&quot; will be deleted. Continue?
          </ModalBody>
          <ModalFooter className="text-left">
            <Button
              className="pull-right"
              color="danger"
              size="sm"
              outline
              onClick={this.delete}
            >
              <i className="fa fa-trash-o" /> Delete
            </Button>
            <Button
              color="secondary"
              size="sm"
              onClick={this.toggleDeleteModal}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      );
    }

    const relationReference = {
      type: 'Person',
      ref: match.params._id,
    };

    let addRelation = [];
    if (person !== null) {
      addRelation = (
        <AddRelation
          reload={this.reload}
          reference={relationReference}
          item={person}
          referencesLabels={referencesLabels}
          referencesTypes={referencesTypes}
          type="person"
        />
      );
    }
    return (
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
        {addRelation}
        {deleteModal}
      </div>
    );
  }
}

Person.defaultProps = {
  match: null,
  entitiesLoaded: false,
  personEntity: null,
};
Person.propTypes = {
  match: PropTypes.object,
  entitiesLoaded: PropTypes.bool,
  personEntity: PropTypes.object,
};

export default compose(connect(mapStateToProps, []))(Person);
