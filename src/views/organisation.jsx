import React, { Component, lazy, Suspense } from 'react';
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

import {
  parseReferenceLabels,
  parseReferenceTypes,
  renderLoader,
} from '../helpers';

const ViewOrganisation = lazy(() => import('../components/view-organisation'));
const AddRelation = lazy(() => import('../components/add-relations'));

const APIPath = process.env.REACT_APP_APIPATH;

const mapStateToProps = (state) => ({
  entitiesLoaded: state.entitiesLoaded,
  organisationEntity: state.organisationEntity,
  organisationTypes: state.organisationTypes,
});

class Organisation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      organisation: null,
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
    this.validateOrganisation = this.validateOrganisation.bind(this);
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
      return false;
    }

    const params = {
      _id,
    };
    const organisation = await axios({
      method: 'get',
      url: `${APIPath}organisation`,
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
      organisation,
    });
    return false;
  }

  loadReferenceLabelsNTypes() {
    const { organisationEntity } = this.props;
    const { properties } = organisationEntity;
    const referencesLabels = parseReferenceLabels(properties);
    const referencesTypes = parseReferenceTypes(properties);
    this.setState({
      referencesLabels,
      referencesTypes,
      referencesLoaded: true,
    });
  }

  uploadResponse(data) {
    const { newId, organisation } = this.state;
    if (data.status) {
      if (newId === null) {
        this.setState({
          newId: data.data._id,
          redirectReload: true,
          errorVisible: false,
          errorText: [],
        });
      }
      if (typeof organisation._id !== 'undefined') {
        this.setState({
          closeUploadModal: true,
        });
      }
    } else {
      const errorText = [];
      if (typeof data.error !== 'undefined' && data.error.length > 0) {
        for (let i = 0; i < data.error.length; i += 1) {
          errorText.push(<div key={i}>{data.error[i]}</div>);
        }
      }

      this.setState({
        errorVisible: true,
        errorText,
      });
    }
  }

  async update(newData) {
    const { updating } = this.state;
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
    const postData = { ...newData };
    const { match } = this.props;
    const { _id } = match.params;
    if (_id !== 'new') {
      postData._id = _id;
    }
    const isValid = this.validateOrganisation(postData);
    if (isValid) {
      const context = this;
      axios({
        method: 'put',
        url: `${APIPath}organisation`,
        crossDomain: true,
        data: postData,
      })
        .then((response) => {
          const responseData = response.data.data;
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
          context.setState(newState);

          setTimeout(() => {
            context.setState({
              updateBtn: (
                <span>
                  <i className="fa fa-save" /> Update
                </span>
              ),
            });
          }, 2000);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    return false;
  }

  validateOrganisation(postData) {
    if (postData.label.length < 2) {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: (
          <div>
            The organisation <b>label</b> must contain at least two (2)
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
    const responseData = await axios({
      method: 'delete',
      url: `${APIPath}organisation`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.summary.counters._stats.nodesDeleted === 1) {
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
      organisation,
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
    const { match, organisationTypes } = this.props;
    let label = '';
    if (organisation !== null && typeof organisation.label !== 'undefined') {
      label = organisation.label;
    }

    let heading = label;
    if (match.params._id === 'new') {
      heading = 'Add new organisation';
    }
    const breadcrumbsItems = [
      {
        label: 'Organisations',
        icon: 'pe-7s-culture',
        active: false,
        path: '/organisations',
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
      content = (
        <div className="items-container">
          <Suspense fallback={renderLoader()}>
            <ViewOrganisation
              closeUploadModal={closeUploadModal}
              delete={this.toggleDeleteModal}
              errorText={errorText}
              errorVisible={errorVisible}
              organisation={organisation}
              organisationTypes={organisationTypes}
              reload={this.reload}
              update={this.update}
              updateBtn={updateBtn}
              uploadResponse={this.uploadResponse}
            />
          </Suspense>
        </div>
      );

      if (redirect) {
        redirectElem = <Redirect to="/organisations" />;
      }
      if (stateRedirectReload) {
        redirectReload = <Redirect to={`/organisation/${newId}`} />;
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
            The organisation &quot;{label}&quot; will be deleted. Continue?
          </ModalBody>
          <ModalFooter className="text-right">
            <Button size="sm" color="danger" outline onClick={this.delete}>
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
    }

    const relationReference = {
      type: 'Organisation',
      ref: match.params._id,
    };
    let addRelation = [];
    if (organisation !== null) {
      addRelation = (
        <Suspense fallback={[]}>
          <AddRelation
            reload={this.reload}
            reference={relationReference}
            item={organisation}
            referencesLabels={referencesLabels}
            referencesTypes={referencesTypes}
            type="organisation"
          />
        </Suspense>
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

Organisation.defaultProps = {
  match: null,
  entitiesLoaded: false,
  organisationEntity: null,
  organisationTypes: [],
};
Organisation.propTypes = {
  match: PropTypes.object,
  entitiesLoaded: PropTypes.bool,
  organisationEntity: PropTypes.object,
  organisationTypes: PropTypes.array,
};

export default compose(connect(mapStateToProps, []))(Organisation);
