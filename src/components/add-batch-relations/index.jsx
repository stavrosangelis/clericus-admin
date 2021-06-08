import React, { useState, useEffect } from 'react';
import {
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from 'reactstrap';

import { useSelector } from 'react-redux';
import axios from 'axios';
import PropTypes from 'prop-types';
import AddEventModal from './add-event';
import AddOrganisationModal from './add-organisation';
import AddPersonModal from './add-person';
import AddResourceModal from './add-resource';
import AddTemporalModal from './add-temporal';
import AddSpatialModal from './add-spatial';
import DeleteMany from './delete-many';
import { parseReferenceLabels, parseReferenceTypes } from '../../helpers';
import Notification from '../notification';

const APIPath = process.env.REACT_APP_APIPATH;

const BatchActions = (props) => {
  const {
    type,
    items,
    removeSelected,
    allChecked,
    className: extraClassName,
    selectAll,
    deleteSelected,
  } = props;

  const mainEntity = useSelector((state) => {
    if (type === 'Resource') {
      return state.resourceEntity;
    }
    if (type === 'Person') {
      return state.personEntity;
    }
    if (type === 'Organisation') {
      return state.organisationEntity;
    }
    if (type === 'Event') {
      return state.eventEntity;
    }
    if (type === 'Temporal') {
      return state.temporalEntity;
    }
    if (type === 'Spatial') {
      return state.spatialEntity;
    }
    return false;
  });
  const entitiesLoaded = useSelector((state) => state.entitiesLoaded);
  const [modalsVisible, setModalsVisible] = useState({
    eventModal: false,
    organisationModal: false,
    personModal: false,
    resourceModal: false,
    temporalModal: false,
    spatialModal: false,
  });
  const [referencesLabels, setReferencesLabels] = useState([]);
  const [referencesTypes, setReferencesTypes] = useState(null);
  const [referencesLoaded, setReferencesLoaded] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationContent, setNotificationContent] = useState([]);
  const [deleteManyVisible, setDeleteManyVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const toggleModal = (modal) => {
    if (items.length === 0) {
      setNotificationVisible(true);
      setNotificationContent(
        <div>
          <i className="fa fa-exclamation-triangle" />{' '}
          <span>Please select some items to continue</span>
        </div>
      );
      setTimeout(() => {
        setNotificationVisible(false);
      }, 2000);
      return false;
    }
    const newModalsVisible = {
      eventModal: false,
      organisationModal: false,
      personModal: false,
      resourceModal: false,
      temporalModal: false,
      spatialModal: false,
    };
    newModalsVisible[modal] = !newModalsVisible[modal];
    setModalsVisible(newModalsVisible);
    return false;
  };

  const toggleDeleteMany = () => {
    if (items.length === 0) {
      setNotificationVisible(true);
      setNotificationContent(
        <div>
          <i className="fa fa-exclamation-triangle" />{' '}
          <span>Please select some items to continue</span>
        </div>
      );
      setTimeout(() => {
        setNotificationVisible(false);
      }, 2000);
      return false;
    }
    setDeleteManyVisible(!deleteManyVisible);
    return false;
  };

  const loadReferenceLabelsNTypes = () => {
    const { properties } = mainEntity;
    const newReferencesLabels = parseReferenceLabels(properties);
    const newReferencesTypes = parseReferenceTypes(properties);
    setReferencesLabels(newReferencesLabels);
    setReferencesTypes(newReferencesTypes);
    setReferencesLoaded(true);
  };

  useEffect(() => {
    if (!referencesLoaded && entitiesLoaded) {
      loadReferenceLabelsNTypes();
    }
  });

  let eventVisible = '';
  let organisationVisible = '';
  let personVisible = '';
  let resourceVisible = '';
  let temporalVisible = '';
  let spatialVisible = '';

  let eventModalHTML = (
    <AddEventModal
      items={items}
      type={type}
      refTypes={referencesTypes}
      toggleModal={toggleModal}
      visible={modalsVisible.eventModal}
      removeSelected={removeSelected}
    />
  );

  let organisationModalHTML = (
    <AddOrganisationModal
      items={items}
      type={type}
      refTypes={referencesTypes}
      toggleModal={toggleModal}
      visible={modalsVisible.organisationModal}
      removeSelected={removeSelected}
    />
  );

  let personModalHTML = (
    <AddPersonModal
      items={items}
      type={type}
      refTypes={referencesTypes}
      toggleModal={toggleModal}
      visible={modalsVisible.personModal}
      removeSelected={removeSelected}
    />
  );

  let resourceModalHTML = (
    <AddResourceModal
      items={items}
      type={type}
      refTypes={referencesTypes}
      toggleModal={toggleModal}
      visible={modalsVisible.resourceModal}
      removeSelected={removeSelected}
    />
  );

  let temporalModalHTML = (
    <AddTemporalModal
      items={items}
      type={type}
      refTypes={referencesTypes}
      toggleModal={toggleModal}
      visible={modalsVisible.temporalModal}
      removeSelected={removeSelected}
    />
  );

  let spatialModalHTML = (
    <AddSpatialModal
      items={items}
      type={type}
      refTypes={referencesTypes}
      toggleModal={toggleModal}
      visible={modalsVisible.spatialModal}
      removeSelected={removeSelected}
    />
  );

  if (referencesLabels.indexOf('Event') === -1) {
    eventVisible = 'hidden';
    eventModalHTML = [];
  }
  if (referencesLabels.indexOf('Organisation') === -1) {
    organisationVisible = 'hidden';
    organisationModalHTML = [];
  }
  if (referencesLabels.indexOf('Person') === -1) {
    personVisible = 'hidden';
    personModalHTML = [];
  }
  if (referencesLabels.indexOf('Resource') === -1) {
    resourceVisible = 'hidden';
    resourceModalHTML = [];
  }
  if (referencesLabels.indexOf('Temporal') === -1) {
    temporalVisible = 'hidden';
    temporalModalHTML = [];
  }
  if (referencesLabels.indexOf('Spatial') === -1) {
    spatialVisible = 'hidden';
    spatialModalHTML = [];
  }
  const notification = (
    <Notification
      color="danger"
      visible={notificationVisible}
      content={notificationContent}
    />
  );

  let selectAllText = 'Select all';
  if (allChecked) {
    selectAllText = 'Deselect all';
  }

  const updateStatus = async (status) => {
    if (updatingStatus) {
      return false;
    }
    setUpdatingStatus(true);
    if (items.length === 0) {
      setNotificationVisible(true);
      setNotificationContent(
        <div>
          <i className="fa fa-exclamation-triangle" />{' '}
          <span>Please select some items to continue</span>
        </div>
      );
      setTimeout(() => {
        setNotificationVisible(false);
      }, 2000);
      return false;
    }
    let path = '';
    if (type === 'Resource') {
      path = `${APIPath}resource-update-status`;
    }
    if (type === 'Person') {
      path = `${APIPath}person-update-status`;
    }
    if (type === 'Organisation') {
      path = `${APIPath}organisation-update-status`;
    }
    if (type === 'Event') {
      path = `${APIPath}event-update-status`;
    }
    const _ids = items.map((i) => i._id);
    const postData = {
      _ids,
      status,
    };
    const update = await axios({
      method: 'post',
      url: path,
      crossDomain: true,
      data: postData,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    setUpdatingStatus(false);
    if (update.status) {
      setNotificationVisible(true);
      setNotificationContent(<div>Items status updated successfully</div>);
      setTimeout(() => {
        setNotificationVisible(false);
      }, 2000);
    }
    return false;
  };

  let updateStatusBtns = [];
  if (type !== 'Temporal' && type !== 'Spatial') {
    updateStatusBtns = [
      <DropdownItem key={0} onClick={() => updateStatus('public')}>
        Make public
      </DropdownItem>,
      <DropdownItem key={1} onClick={() => updateStatus('private')}>
        Make private
      </DropdownItem>,
      <DropdownItem key={2} divider />,
    ];
  }

  return (
    <div>
      {notification}
      <UncontrolledButtonDropdown
        direction="down"
        className={`table-actions-dropdown ${extraClassName}`}
      >
        <DropdownToggle caret color="secondary" outline size="sm">
          actions
        </DropdownToggle>
        <DropdownMenu className="right">
          <DropdownItem onClick={() => selectAll()}>
            {selectAllText}
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem header className="text-glue">
            Associate selected with:
          </DropdownItem>
          <DropdownItem
            className={eventVisible}
            onClick={() => toggleModal('eventModal')}
          >
            ... event
          </DropdownItem>
          <DropdownItem
            className={organisationVisible}
            onClick={() => toggleModal('organisationModal')}
          >
            ... organisation
          </DropdownItem>
          <DropdownItem
            className={personVisible}
            onClick={() => toggleModal('personModal')}
          >
            ... person
          </DropdownItem>
          <DropdownItem
            className={resourceVisible}
            onClick={() => toggleModal('resourceModal')}
          >
            ... resource
          </DropdownItem>
          <DropdownItem
            className={temporalVisible}
            onClick={() => toggleModal('temporalModal')}
          >
            ... temporal
          </DropdownItem>
          <DropdownItem
            className={spatialVisible}
            onClick={() => toggleModal('spatialModal')}
          >
            ... spatial
          </DropdownItem>
          <DropdownItem divider />
          {updateStatusBtns}
          <DropdownItem onClick={() => toggleDeleteMany()}>
            Delete selected
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>

      {eventModalHTML}
      {organisationModalHTML}
      {personModalHTML}
      {resourceModalHTML}
      {temporalModalHTML}
      {spatialModalHTML}

      <DeleteMany
        visible={deleteManyVisible}
        toggle={toggleDeleteMany}
        items={items}
        type={type}
        deleteSelected={deleteSelected}
        removeSelected={removeSelected}
      />
    </div>
  );
};
BatchActions.defaultProps = {
  type: '',
  items: [],
  removeSelected: () => {},
  allChecked: false,
  className: '',
  selectAll: () => {},
  deleteSelected: () => {},
};

BatchActions.propTypes = {
  type: PropTypes.string,
  items: PropTypes.array,
  removeSelected: PropTypes.func,
  allChecked: PropTypes.bool,
  className: PropTypes.string,
  selectAll: PropTypes.func,
  deleteSelected: PropTypes.func,
};
export default BatchActions;
