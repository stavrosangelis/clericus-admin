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
import AddItem from './add-item';

const AddRelation = (props) => {
  const { item, reload, type } = props;
  // redux
  const events = useSelector((state) => state.relationsEvents);
  const eventsLoading = useSelector((state) => state.relationsEventsLoading);

  const organisations = useSelector((state) => state.relationsOrganisations);
  const organisationsLoading = useSelector(
    (state) => state.relationsOrganisationsLoading
  );

  const people = useSelector((state) => state.relationsPeople);
  const peopleLoading = useSelector((state) => state.relationsPeopleLoading);

  const resources = useSelector((state) => state.relationsResources);
  const resourcesLoading = useSelector(
    (state) => state.relationsResourcesLoading
  );

  const spatial = useSelector((state) => state.relationsSpatial);
  const spatialLoading = useSelector((state) => state.relationsSpatialLoading);
  const temporal = useSelector((state) => state.relationsTemporal);
  const temporalLoading = useSelector(
    (state) => state.relationsTemporalLoading
  );
  const mainEntity = useSelector((state) => {
    if (type === 'resource') {
      return state.resourceEntity;
    }
    if (type === 'person') {
      return state.personEntity;
    }
    if (type === 'organisation') {
      return state.organisationEntity;
    }
    if (type === 'event') {
      return state.eventEntity;
    }
    if (type === 'temporal') {
      return state.temporalEntity;
    }
    if (type === 'spatial') {
      return state.spatialEntity;
    }
    return false;
  });
  const entitiesLoaded = useSelector((state) => state.entitiesLoaded);

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
  let eventModalHTML = (
    <Suspense fallback={[]}>
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
        visible={modalsVisible.eventModal}
      />
    </Suspense>
  );

  let organisationModalHTML = (
    <Suspense fallback={[]}>
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
        visible={modalsVisible.organisationModal}
      />
    </Suspense>
  );

  let personModalHTML = (
    <Suspense fallback={[]}>
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
        visible={modalsVisible.personModal}
      />
    </Suspense>
  );

  let resourceModalHTML = (
    <Suspense fallback={[]}>
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
        visible={modalsVisible.resourceModal}
      />
    </Suspense>
  );

  let temporalModalHTML = (
    <Suspense fallback={[]}>
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
        visible={modalsVisible.temporalModal}
      />
    </Suspense>
  );

  let spatialModalHTML = (
    <Suspense fallback={[]}>
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
        visible={modalsVisible.spatialModal}
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
    <div>
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
};

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
