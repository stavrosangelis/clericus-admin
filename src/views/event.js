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
import ViewEvent from '../components/view-event';
import AddRelation from '../components/add-relations';

import { parseReferenceLabels, parseReferenceTypes } from '../helpers';

const mapStateToProps = (state) => ({
  entitiesLoaded: state.entitiesLoaded,
  eventEntity: state.eventEntity,
  eventTypes: state.eventTypes,
});

const APIPath = process.env.REACT_APP_APIPATH;

class Event extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reload: false,
      loading: true,
      item: null,
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
      referencesLoaded: false,
      referencesLabels: [],
      referencesTypes: {
        event: [],
        organisation: [],
        person: [],
        resource: [],
        temporal: [],
        spatial: [],
      },
    };
    this.load = this.load.bind(this);
    this.toggleRedirect = this.toggleRedirect.bind(this);
    this.toggleRedirectReload = this.toggleRedirectReload.bind(this);
    this.toggleUploadModal = this.toggleUploadModal.bind(this);
    this.loadReferenceLabelsNTypes = this.loadReferenceLabelsNTypes.bind(this);
    this.update = this.update.bind(this);
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
      reload,
      redirect,
      redirectReload,
      closeUploadModal,
      referencesLoaded,
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
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}event`,
        crossDomain: true,
        params,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      this.setState({
        loading: false,
        item: responseData,
        reload: false,
      });
    }
  }

  loadReferenceLabelsNTypes() {
    const { eventEntity } = this.props;
    const { properties } = eventEntity;
    const referencesLabels = parseReferenceLabels(properties);
    const referencesTypes = parseReferenceTypes(properties);
    this.setState({
      referencesLabels,
      referencesTypes,
      referencesLoaded: true,
    });
  }

  async update(newData) {
    const { updating } = this.state;
    if (updating) {
      return false;
    }
    this.setState({
      updateBtn: (
        <span>
          <i className="fa fa-save" /> <i>Saving...</i>{' '}
          <Spinner color="info" size="sm" />
        </span>
      ),
      updating: true,
    });
    const postData = {
      label: newData.label,
      description: newData.description,
      eventType: newData.eventType.value,
      status: newData.status,
    };
    const { match } = this.props;
    const { _id } = match.params;
    if (_id !== 'new') {
      postData._id = _id;
    }
    const isValid = this.validateEvent(postData);
    if (isValid) {
      const responseData = await axios({
        method: 'put',
        url: `${APIPath}event`,
        crossDomain: true,
        data: postData,
      })
        .then((response) => response.data)
        .catch((error) => {
          console.log(error);
        });
      const context = this;
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

  validateEvent(postData) {
    if (postData.label === '') {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: (
          <div>
            Please enter the event <b>Label</b> to continue!
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
    if (
      typeof postData.eventType === 'undefined' ||
      postData.eventType === ''
    ) {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: (
          <div>
            Please enter the <b>Type of event</b> to continue!
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
    if (_id === 'new') {
      this.setState({
        loading: false,
      });
    } else {
      const responseData = await axios({
        method: 'delete',
        url: `${APIPath}event?_id=${_id}`,
        crossDomain: true,
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
      item,
      loading,
      errorText,
      errorVisible,
      updateBtn,
      redirect,
      redirectReload: stateRedirectReload,
      newId,
      deleteModal: stateDeleteModal,
      className,
      referencesLabels,
      referencesTypes,
    } = this.state;
    const { match, eventTypes } = this.props;
    let label = '';
    if (item !== null && typeof item.label !== 'undefined') {
      label = item.label;
    }
    let heading = label;
    if (match.params._id === 'new') {
      heading = 'Add new event';
    }
    const breadcrumbsItems = [
      { label: 'Events', icon: 'pe-7s-date', active: false, path: '/events' },
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
      const viewComponent = (
        <ViewEvent
          delete={this.toggleDeleteModal}
          errorText={errorText}
          errorVisible={errorVisible}
          eventTypes={eventTypes}
          item={item}
          reload={this.reload}
          update={this.update}
          updateBtn={updateBtn}
        />
      );
      content = <div className="items-container">{viewComponent}</div>;
      if (redirect) {
        redirectElem = <Redirect to="/events" />;
      }
      if (stateRedirectReload) {
        redirectReload = <Redirect to={`/event/${newId}`} />;
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
            The item &quot;{label}&quot; will be deleted. Continue?
          </ModalBody>
          <ModalFooter className="text-right">
            <Button size="sm" color="danger" outline onClick={this.delete}>
              <i className="fa fa-trash-o" /> Delete
            </Button>
            <Button
              className="pull-left"
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
      type: 'Event',
      ref: match.params._id,
    };
    let addRelation = [];
    if (item !== null) {
      addRelation = (
        <AddRelation
          reload={this.reload}
          reference={relationReference}
          item={item}
          referencesLabels={referencesLabels}
          referencesTypes={referencesTypes}
          type="event"
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

Event.defaultProps = {
  match: null,
  entitiesLoaded: false,
  eventEntity: null,
  eventTypes: [],
};
Event.propTypes = {
  match: PropTypes.object,
  entitiesLoaded: PropTypes.bool,
  eventEntity: PropTypes.object,
  eventTypes: PropTypes.array,
};
export default compose(connect(mapStateToProps, []))(Event);
