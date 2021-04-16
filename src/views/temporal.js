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
import moment from 'moment';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Breadcrumbs from '../components/breadcrumbs';
import ViewTemporal from '../components/view-temporal';
import AddRelation from '../components/add-relations';

import { parseReferenceLabels, parseReferenceTypes } from '../helpers';

const mapStateToProps = (state) => ({
  entitiesLoaded: state.entitiesLoaded,
  temporalEntity: state.temporalEntity,
});

const APIPath = process.env.REACT_APP_APIPATH;

class Temporal extends Component {
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
      deleteBtn: (
        <span>
          <i className="fa fa-trash-o" /> Delete
        </span>
      ),
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
    this.toggleRedirect = this.toggleRedirect.bind(this);
    this.toggleRedirectReload = this.toggleRedirectReload.bind(this);
    this.toggleUploadModal = this.toggleUploadModal.bind(this);
    this.load = this.load.bind(this);
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
        url: `${APIPath}temporal`,
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
    const { temporalEntity } = this.props;
    const { properties } = temporalEntity;
    const referencesLabels = parseReferenceLabels(properties);
    const referencesTypes = parseReferenceTypes(properties);
    this.setState({
      referencesLabels,
      referencesTypes,
      referencesLoaded: true,
    });
  }

  validate(postData) {
    if (postData.label === '') {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: (
          <div>
            Please enter the <b>Label</b> to continue!
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
    if (!moment(postData.startDate, 'DD-MM-YYYY', true).isValid()) {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: (
          <div>
            The <b>Start date</b> is not valid. The valid format is{' '}
            <i>DD-MM-YYYY</i>{' '}
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
      postData.endDate !== '' &&
      !moment(postData.endDate, 'DD-MM-YYYY', true).isValid()
    ) {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: (
          <div>
            The <b>End date</b> is not valid. The valid format is{' '}
            <i>DD-MM-YYYY</i>{' '}
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
      startDate: newData.startDate,
      endDate: newData.endDate,
      format: newData.format,
    };
    const { match } = this.props;
    const { _id } = match.params;
    if (_id !== 'new') {
      postData._id = _id;
    }
    const isValid = this.validate(postData);
    if (isValid) {
      const context = this;
      const responseData = await axios({
        method: 'put',
        url: `${APIPath}temporal`,
        crossDomain: true,
        data: postData,
      })
        .then((response) => response.data)
        .catch((error) => {
          console.log(error);
        });
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
        url: `${APIPath}temporal?_id=${_id}`,
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
      referencesLabels,
      referencesTypes,
      deleteBtn,
      closeUploadModal,
    } = this.state;
    const { match, className } = this.props;
    let label = '';
    if (item !== null && typeof item.label !== 'undefined') {
      label = item.label;
    }
    let heading = label;
    if (match.params._id === 'new') {
      heading = 'Add new temporal';
    }
    const breadcrumbsItems = [
      {
        label: 'Temporal',
        icon: 'pe-7s-clock',
        active: false,
        path: '/temporals',
      },
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
        <ViewTemporal
          item={item}
          delete={this.toggleDeleteModal}
          update={this.update}
          updateBtn={updateBtn}
          deleteBtn={deleteBtn}
          errorVisible={errorVisible}
          errorText={errorText}
          closeUploadModal={closeUploadModal}
          reload={this.reload}
        />
      );
      content = <div className="items-container">{viewComponent}</div>;
      if (redirect) {
        redirectElem = <Redirect to="/temporals" />;
      }
      if (stateRedirectReload) {
        redirectReload = <Redirect to={`/temporal/${newId}`} />;
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
      type: 'Temporal',
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
          type="temporal"
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

Temporal.defaultProps = {
  match: null,
  temporalEntity: null,
  entitiesLoaded: false,
  className: '',
};
Temporal.propTypes = {
  match: PropTypes.object,
  temporalEntity: PropTypes.object,
  entitiesLoaded: PropTypes.bool,
  className: PropTypes.string,
};
export default compose(connect(mapStateToProps, []))(Temporal);
