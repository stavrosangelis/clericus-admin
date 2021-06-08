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
import ViewResource from '../components/view-resource';
import AddRelation from '../components/add-relations';
import { parseReferenceLabels, parseReferenceTypes } from '../helpers';

const APIPath = process.env.REACT_APP_APIPATH;
const mapStateToProps = (state) => ({
  entitiesLoaded: state.entitiesLoaded,
  resourceEntity: state.resourceEntity,
  resourcesTypes: state.resourcesTypes,
});

class Resource extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reload: false,
      loading: true,
      resource: null,
      systemType: null,
      newId: null,
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
    this.updateSystemType = this.updateSystemType.bind(this);
    this.loadReferenceLabelsNTypes = this.loadReferenceLabelsNTypes.bind(this);
    this.uploadResponse = this.uploadResponse.bind(this);
    this.update = this.update.bind(this);
    this.setRedirect = this.setRedirect.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.delete = this.delete.bind(this);
    this.reload = this.reload.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    const { match, entitiesLoaded, resourcesTypes } = this.props;
    const {
      reload,
      redirect,
      redirectReload,
      closeUploadModal,
      referencesLoaded,
      systemType,
    } = this.state;
    if (prevProps.match.params._id !== match.params._id) {
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
    if (
      match.params._id === 'new' &&
      systemType === null &&
      resourcesTypes.length > 0
    ) {
      const defaultSystemType = resourcesTypes.find(
        (item) => item.labelId === 'Thumbnail'
      );
      this.updateSystemType(defaultSystemType._id);
    }
  }

  setRedirect() {
    this.setState({
      redirect: true,
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
    } else if (_id !== 'null') {
      const params = { _id };
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}resource`,
        crossDomain: true,
        params,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      this.setState({
        loading: false,
        resource: responseData,
        systemType: responseData.systemType,
        reload: false,
      });
    }
  }

  loadReferenceLabelsNTypes() {
    const { resourceEntity } = this.props;
    const referencesLabels = parseReferenceLabels(resourceEntity.properties);
    const referencesTypes = parseReferenceTypes(resourceEntity.properties);
    this.setState({
      referencesLabels,
      referencesTypes,
      referencesLoaded: true,
    });
  }

  uploadResponse(data) {
    console.log(data);
    if (data.status) {
      const { newId, resource } = this.state;
      if (newId === null) {
        this.setState({
          newId: data.data._id,
          redirectReload: true,
          errorVisible: false,
          errorText: [],
        });
      }
      if (resource !== null && typeof resource._id !== 'undefined') {
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

  async update(newData) {
    const { updating, resource: stateResource } = this.state;
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
    let resource = { ...stateResource };
    if (resource === null) {
      resource = {};
    }
    resource.label = newData.label;
    resource.alternateLabels = newData.alternateLabels;
    resource.originalLocation = newData.originalLocation;
    resource.systemType = newData.systemType;
    resource.description = newData.description;
    resource.status = newData.status;
    delete resource.events;
    delete resource.people;
    delete resource.organisations;
    delete resource.resources;

    const postData = { resource };
    const responseData = await axios({
      method: 'put',
      url: `${APIPath}resource`,
      crossDomain: true,
      data: postData,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.data.status) {
      this.setState({
        updating: false,
        updateBtn: (
          <span>
            <i className="fa fa-save" /> Update success{' '}
            <i className="fa fa-check" />
          </span>
        ),
        newId: responseData.data.data._id,
        redirectReload: true,
      });
      if (typeof resource._id !== 'undefined') {
        this.setState({
          errorVisible: false,
          errorText: [],
        });
        this.load();
      }
    } else {
      const errorText = [];
      errorText.push(<div key="main">{responseData.data.msg}</div>);
      for (let i = 0; i < responseData.data.errors.length; i += 1) {
        const error = responseData.data.errors[i];
        const output = (
          <div key={i}>
            [{error.field}]: {error.msg}
          </div>
        );
        errorText.push(output);
      }
      this.setState({
        updating: false,
        updateBtn: (
          <span>
            <i className="fa fa-save" /> Update error{' '}
            <i className="fa fa-times" />
          </span>
        ),
        errorVisible: true,
        errorText,
      });
    }
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
    return false;
  }

  updateSystemType(value) {
    const update = typeof value === 'string' ? value : { ref: value };
    this.setState({
      systemType: update,
    });
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
    const responseData = await axios({
      method: 'delete',
      url: `${APIPath}resource`,
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

  reload() {
    this.setState({
      reload: true,
    });
  }

  render() {
    const {
      resource,
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
      systemType,
      deleteModal: stateDeleteModal,
      redirectReload: stateRedirectReload,
    } = this.state;
    const { match } = this.props;
    let label = '';
    if (resource !== null && typeof resource.label !== 'undefined') {
      label = resource.label;
    }
    let heading = label;
    if (match.params._id === 'new') {
      heading = 'Add new resource';
    }
    const breadcrumbsItems = [
      {
        label: 'Resources',
        icon: 'pe-7s-photo',
        active: false,
        path: '/resources',
      },
      { label: heading, icon: 'pe-7s-photo', active: true, path: '' },
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
      const viewComponent = (
        <ViewResource
          closeUploadModal={closeUploadModal}
          delete={this.toggleDeleteModal}
          errorText={errorText}
          errorVisible={errorVisible}
          reload={this.reload}
          resource={resource}
          systemType={systemType}
          update={this.update}
          updateBtn={updateBtn}
          uploadResponse={this.uploadResponse}
          setRedirect={this.setRedirect}
        />
      );
      content = <div className="resources-container">{viewComponent}</div>;
      if (redirect) {
        redirectElem = <Redirect to="/resources" />;
      }
      if (stateRedirectReload) {
        redirectReload = <Redirect to={`/resource/${newId}`} />;
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
            The resource &quot;{label}&quot; will be deleted. Continue?
          </ModalBody>
          <ModalFooter className="text-left">
            <Button
              size="sm"
              className="pull-right"
              color="danger"
              outline
              onClick={this.delete}
            >
              <i className="fa fa-trash-o" /> Delete
            </Button>
            <Button
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
    const relationReference = {
      type: 'Resource',
      ref: match.params._id,
    };
    let addRelation = [];
    if (resource !== null) {
      addRelation = (
        <AddRelation
          reload={this.reload}
          reference={relationReference}
          item={resource}
          referencesLabels={referencesLabels}
          referencesTypes={referencesTypes}
          type="resource"
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
            <h2>Resource &quot;{heading}&quot;</h2>
          </div>
        </div>
        {content}
        {addRelation}
        {deleteModal}
      </div>
    );
  }
}

Resource.defaultProps = {
  match: null,
  entitiesLoaded: false,
  resourcesTypes: [],
  resourceEntity: null,
};
Resource.propTypes = {
  match: PropTypes.object,
  entitiesLoaded: PropTypes.bool,
  resourcesTypes: PropTypes.array,
  resourceEntity: PropTypes.object,
};

export default compose(connect(mapStateToProps, []))(Resource);
