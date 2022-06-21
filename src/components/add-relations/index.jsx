import React, { useCallback, useEffect, useState, Suspense } from 'react';
import {
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from 'reactstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { parseReferenceLabels, parseReferenceTypes } from '../../helpers';

import AddItem from './Add.item';

const { REACT_APP_APIPATH: APIPath } = process.env;

function AddRelation(props) {
  const { item, reload, type, open, rel, relType, toggleOpen } = props;
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

  const [loadingTaxonomies, setLoadingTaxonomies] = useState(true);
  const [taxonomies, setTaxonomies] = useState([]);

  const toggleModal = useCallback(
    (modal) => {
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
      if (!modalsVisible[modal] === false) {
        toggleOpen();
      }
    },
    [modalsVisible, toggleOpen]
  );

  const loadReferenceLabelsNTypes = () => {
    const { properties } = mainEntity;
    const newReferencesLabels = parseReferenceLabels(properties);
    const newReferencesTypes = parseReferenceTypes(properties);
    setReferencesLabels(newReferencesLabels);
    setReferencesTypes(newReferencesTypes);
    setReferencesLoaded(true);
  };

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const loadTaxonomies = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}taxonomies`,
        crossDomain: true,
        params: {
          page: 1,
          limit: 100,
        },
        signal: controller.signal,
      })
        .then((response) => {
          const { data: rData = null } = response;
          return rData;
        })
        .catch((error) => {
          console.log(error);
          return { data: null };
        });
      if (!unmounted) {
        setLoadingTaxonomies(false);
        const { data = null } = responseData;
        if (data !== null) {
          setTaxonomies(data.data);
        }
      }
    };
    if (loadingTaxonomies) {
      loadTaxonomies();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loadingTaxonomies]);

  useEffect(() => {
    if (open) {
      toggleOpen(rel, relType);
      const modalType = `${relType}Modal`;
      toggleModal(modalType);
    }
  }, [open, toggleModal, toggleOpen, rel, relType]);

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
        rel={rel}
        taxonomies={taxonomies}
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
        rel={rel}
        taxonomies={taxonomies}
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
        rel={rel}
        taxonomies={taxonomies}
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
        rel={rel}
        taxonomies={taxonomies}
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
        rel={rel}
        taxonomies={taxonomies}
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
        rel={rel}
        taxonomies={taxonomies}
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
  open: false,
  rel: null,
  relType: '',
  toggleOpen: () => {},
};

AddRelation.propTypes = {
  type: PropTypes.string,
  item: PropTypes.object,
  reload: PropTypes.func,
  open: PropTypes.bool,
  rel: PropTypes.object,
  relType: PropTypes.string,
  toggleOpen: PropTypes.func,
};

export default AddRelation;
