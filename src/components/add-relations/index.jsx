import React, { useEffect, useState, Suspense } from 'react';
import {
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from 'reactstrap';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { parseReferenceLabels, parseReferenceTypes } from '../../helpers';

import AddItem from './Add.item';

function AddRelation(props) {
  const { item, reload, type } = props;
  // redux
  const {
    entitiesLoaded,
    relationsEvents: events,
    relationsEventsLoading: eventsLoading,
    relationsOrganisations: organisations,
    relationsOrganisationsLoading: organisationsLoading,
    relationsPeople: people,
    relationsPeopleLoading: peopleLoading,
    relationsResources: resources,
    relationsResourcesLoading: resourcesLoading,
    relationsSpatial: spatial,
    relationsSpatialLoading: spatialLoading,
    relationsTemporal: temporal,
    relationsTemporalLoading: temporalLoading,
  } = useSelector((state) => state);

  const mainEntity = useSelector((state) => {
    let entity = null;
    switch (type) {
      case 'event':
        entity = state.eventEntity;
        break;
      case 'organisation':
        entity = state.organisationEntity;
        break;
      case 'person':
        entity = state.personEntity;
        break;
      case 'resource':
        entity = state.resourceEntity;
        break;
      case 'spatial':
        entity = state.spatialEntity;
        break;
      case 'temporal':
        entity = state.temporalEntity;
        break;
      default:
        entity = null;
        break;
    }
    return entity;
  });

  // state
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

  const toggleModal = (modal) => {
    const newModalsVisible = {
      eventModal: false,
      organisationModal: false,
      personModal: false,
      resourceModal: false,
      temporalModal: false,
      spatialModal: false,
    };
    newModalsVisible[modal] = !modalsVisible[modal];
    setModalsVisible(newModalsVisible);
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

  const {
    eventModal,
    organisationModal,
    personModal,
    resourceModal,
    temporalModal,
    spatialModal,
  } = modalsVisible;
  let eventModalHTML = (
    <Suspense fallback={null}>
      <AddItem
        item={item}
        blockType="event"
        loading={eventsLoading}
        modalItems={events}
        type={type}
        refTypes={referencesTypes}
        reload={reload}
        toggleModal={toggleModal}
        modalType="eventModal"
        visible={eventModal}
      />
    </Suspense>
  );

  let organisationModalHTML = (
    <Suspense fallback={null}>
      <AddItem
        item={item}
        blockType="organisation"
        loading={organisationsLoading}
        modalItems={organisations}
        type={type}
        refTypes={referencesTypes}
        reload={reload}
        toggleModal={toggleModal}
        modalType="organisationModal"
        visible={organisationModal}
      />
    </Suspense>
  );

  let personModalHTML = (
    <Suspense fallback={null}>
      <AddItem
        item={item}
        blockType="person"
        loading={peopleLoading}
        modalItems={people}
        type={type}
        refTypes={referencesTypes}
        reload={reload}
        toggleModal={toggleModal}
        modalType="personModal"
        visible={personModal}
      />
    </Suspense>
  );

  let resourceModalHTML = (
    <Suspense fallback={null}>
      <AddItem
        item={item}
        blockType="resource"
        loading={resourcesLoading}
        modalItems={resources}
        type={type}
        refTypes={referencesTypes}
        reload={reload}
        toggleModal={toggleModal}
        modalType="resourceModal"
        visible={resourceModal}
      />
    </Suspense>
  );

  let spatialModalHTML = (
    <Suspense fallback={null}>
      <AddItem
        item={item}
        blockType="spatial"
        loading={spatialLoading}
        modalItems={spatial}
        type={type}
        refTypes={referencesTypes}
        reload={reload}
        toggleModal={toggleModal}
        modalType="spatialModal"
        visible={spatialModal}
      />
    </Suspense>
  );

  let temporalModalHTML = (
    <Suspense fallback={null}>
      <AddItem
        item={item}
        blockType="temporal"
        loading={temporalLoading}
        modalItems={temporal}
        type={type}
        refTypes={referencesTypes}
        reload={reload}
        toggleModal={toggleModal}
        modalType="temporalModal"
        visible={temporalModal}
      />
    </Suspense>
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

  return (
    <div className="add-references-container">
      <UncontrolledButtonDropdown className="add-reference-group">
        <DropdownToggle className="add-reference-btn" outline color="secondary">
          <i className="fa fa-plus" />
        </DropdownToggle>
        <DropdownMenu>
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
        </DropdownMenu>
      </UncontrolledButtonDropdown>
      {eventModalHTML}
      {organisationModalHTML}
      {personModalHTML}
      {resourceModalHTML}
      {temporalModalHTML}
      {spatialModalHTML}
    </div>
  );
}

AddRelation.defaultProps = {
  type: '',
  item: null,
  reload: () => {},
};

AddRelation.propTypes = {
  type: PropTypes.string,
  item: PropTypes.object,
  reload: PropTypes.func,
};

export default AddRelation;
