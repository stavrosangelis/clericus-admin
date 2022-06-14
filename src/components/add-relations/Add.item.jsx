import React, { useEffect, useReducer, useRef, useState } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Alert,
  Spinner,
} from 'reactstrap';
import Select from 'react-select';
import PropTypes from 'prop-types';
import {
  eventLabelDetails,
  putData,
  refTypesList,
  getResourceThumbnailURL,
  capitalizeOnlyFirst,
} from '../../helpers';
import 'react-datepicker/dist/react-datepicker.css';

import ItemDetails from './Item.details';
import EventsForm from './Events.form';
import OrganisationsForm from './Organisations.form';
import PeopleForm from './People.form';
import ResourcesForm from './Resources.form';
import SpatialForm from './Spatial.form';
import TemporalForm from './Temporal.form';

function AddItem(props) {
  // props
  const {
    blockType,
    className,
    item,
    loading,
    modalType,
    toggleModal: toggleModalFn,
    type,
    refTypes,
    reload,
    visible,
    modalItems,
  } = props;

  // state
  const defaultState = {
    refType: null,
    selectedItem: null,
    addingReference: false,
    addingReferenceErrorVisible: false,
    addingReferenceErrorText: [],
    addingReferenceBtn: <span>Add</span>,
  };
  const [state, setState] = useReducer(
    (curState, newState) => ({ ...curState, ...newState }),
    defaultState
  );
  const [itemDetailsVisible, setItemDetailsVisible] = useState(false);
  const [searchBool, setSearchBool] = useState(false);
  const [clearSearchBool, setClearSearchBool] = useState(false);

  let heading = '';
  switch (type) {
    case 'event':
      heading = 'Event';
      break;
    case 'organisation':
      heading = 'Organisation';
      break;
    case 'person':
      heading = 'Person';
      break;
    case 'resource':
      heading = 'Resource';
      break;
    case 'temporal':
      heading = 'Temporal';
      break;
    case 'spatial':
      heading = 'Spatial';
      break;
    default:
      break;
  }
  const modalRef = useRef(null);
  let height = 0;

  if (modalRef.current !== null) {
    const modalContent = modalRef.current.childNodes[0].childNodes[0];
    height = modalContent.getBoundingClientRect().height;
  }

  const selectItem = (_id) => {
    setState({
      selectedItem: _id,
    });
  };

  const itemDetailsToggle = (_id = null) => {
    if (_id !== null) {
      selectItem(_id);
    }
    setItemDetailsVisible(!itemDetailsVisible);
  };

  const toggleModal = (modal) => {
    setState({
      selectedItem: null,
      addingReferenceErrorVisible: false,
      addingReferenceErrorText: [],
      addingReferenceBtn: <span>Submit</span>,
    });
    toggleModalFn(modal);
  };

  const select2Change = (selectedOption, element = null) => {
    if (element !== null) {
      setState({
        [element]: selectedOption,
      });
    }
  };

  const submitSearch = () => {
    setSearchBool(true);
  };

  const clearSearch = () => {
    setClearSearchBool(true);
  };

  useEffect(() => {
    if (searchBool) {
      setSearchBool(false);
    }
  }, [searchBool]);

  useEffect(() => {
    if (clearSearchBool) {
      setClearSearchBool(false);
    }
  }, [clearSearchBool]);

  const addReferences = async () => {
    const { refType: sReftype = null, selectedItem: sSelectedItem } = state;
    if (sReftype === null) {
      const response = {
        data: {
          status: false,
          error: (
            <div>
              Please select a valid <b>Reference Type</b> to continue
            </div>
          ),
        },
      };
      return response;
    }
    const refType = capitalizeOnlyFirst(type);
    const targetRefType = capitalizeOnlyFirst(blockType);

    const newReference = {
      items: [
        { _id: item._id, type: refType },
        { _id: sSelectedItem, type: targetRefType },
      ],
      taxonomyTermLabel: sReftype.value,
    };
    const data = await putData(`reference`, newReference);
    return data;
  };

  const submitReferences = async () => {
    const {
      addingReference: sAddingReference = null,
      selectedItem: sSelectedItem,
    } = state;
    if (sAddingReference) {
      return false;
    }
    if (sSelectedItem === null) {
      setState({
        addingReference: false,
        addingReferenceErrorVisible: true,
        addingReferenceErrorText: <div>Please select an event to continue</div>,
        addingReferenceBtn: (
          <span>
            Error... <i className="fa fa-times" />
          </span>
        ),
      });
      return false;
    }
    setState({
      addingReference: true,
      addingReferenceErrorVisible: false,
      addingReferenceErrorText: [],
      addingReferenceBtn: (
        <span>
          <i>Adding...</i> <Spinner color="info" size="sm" />
        </span>
      ),
    });

    const references = await addReferences();

    const { data: referencesData, status = false } = references;

    if (!status) {
      setState({
        addingReference: false,
        addingReferenceErrorVisible: true,
        addingReferenceErrorText: <div>{referencesData.error}</div>,
        addingReferenceBtn: (
          <span>
            Error... <i className="fa fa-times" />
          </span>
        ),
      });
      return false;
    }

    setState({
      addingReference: false,
      addingReferenceBtn: (
        <span>
          Submitted successfully <i className="fa fa-check" />
        </span>
      ),
    });
    toggleModal(modalType);
    reload();
    return true;
  };
  let newList = (
    <div className="text-center" style={{ flex: 1 }}>
      <Spinner color="secondary" />
    </div>
  );
  if (!loading) {
    let relations = [];
    if (blockType === 'event') {
      relations = item.events || [];
    }
    if (blockType === 'organisation') {
      relations = item.organisations || [];
    }
    if (blockType === 'person') {
      relations = item.people || [];
    }
    if (blockType === 'resource') {
      relations = item.resources || [];
    }
    if (blockType === 'temporal') {
      relations = item.temporals || [];
    }
    if (blockType === 'spatial') {
      relations = item.spatials || [];
    }
    const relationsIds = relations.map((r) => r.ref._id);
    if (blockType !== 'resource') {
      newList = modalItems.map((i) => {
        const itemId = i._id;
        const active = state.selectedItem === itemId ? ' active' : '';
        const existing = relationsIds.indexOf(itemId) > -1 ? ' exists' : '';
        let labelDetails = '';
        if (type === 'event') {
          labelDetails = eventLabelDetails(item);
        }
        const labelDetailsText =
          labelDetails !== '' ? (
            <span>
              {' '}
              <small>({labelDetails})</small>
            </span>
          ) : (
            []
          );
        return (
          <div
            className={`event-list-item${active}${existing}`}
            key={itemId}
            onClick={() => selectItem(itemId)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select event"
          >
            <div className="event-list-item-details">
              {i.label}
              {labelDetailsText}
            </div>
            <Button
              type="button"
              size="sm"
              color="secondary"
              outline
              onClick={() => itemDetailsToggle(itemId)}
            >
              Details
            </Button>
          </div>
        );
      });
    } else {
      newList = modalItems.map((i) => {
        const itemId = i._id;
        const active = state.selectedItem === itemId ? ' active' : '';
        const existing = relationsIds.indexOf(itemId) > -1 ? ' exists' : '';
        const thumbnail =
          getResourceThumbnailURL(item) !== null ? (
            <div>
              <img
                className="img-responsive img-thumbnail"
                src={getResourceThumbnailURL(i)}
                alt={i.label}
              />
            </div>
          ) : (
            []
          );
        return (
          <div
            className={`event-list-item event-list-resource-item${active}${existing}`}
            key={itemId}
            onClick={() => selectItem(itemId)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select event"
          >
            <div className="resource-container">
              {thumbnail}
              <div className="label">{i.label}</div>
            </div>
            <div className="text-center">
              <Button
                type="button"
                size="sm"
                color="secondary"
                outline
                onClick={() => itemDetailsToggle(itemId)}
              >
                Details
              </Button>
            </div>
          </div>
        );
      });
    }
  }
  const addingReferenceErrorVisibleClass = state.addingReferenceErrorVisible
    ? ''
    : 'hidden';
  let refTypesListItems = [];
  if (blockType === 'event' && typeof refTypes.event !== 'undefined') {
    refTypesListItems = refTypesList(refTypes.event);
  }
  if (
    blockType === 'organisation' &&
    typeof refTypes.organisation !== 'undefined'
  ) {
    refTypesListItems = refTypesList(refTypes.organisation);
  }
  if (blockType === 'person' && typeof refTypes.person !== 'undefined') {
    refTypesListItems = refTypesList(refTypes.person);
  }
  if (blockType === 'resource' && typeof refTypes.resource !== 'undefined') {
    refTypesListItems = refTypesList(refTypes.resource);
  }
  if (blockType === 'spatial' && typeof refTypes.spatial !== 'undefined') {
    refTypesListItems = refTypesList(refTypes.spatial);
  }
  if (blockType === 'temporal' && typeof refTypes.temporal !== 'undefined') {
    refTypesListItems = refTypesList(refTypes.temporal);
  }
  const errorContainer = (
    <Alert className={addingReferenceErrorVisibleClass} color="danger">
      {state.addingReferenceErrorText}
    </Alert>
  );

  let searchForm = [];
  if (blockType === 'event') {
    searchForm = <EventsForm submit={searchBool} clear={clearSearchBool} />;
  }
  if (blockType === 'organisation') {
    searchForm = (
      <OrganisationsForm submit={searchBool} clear={clearSearchBool} />
    );
  }
  if (blockType === 'person') {
    searchForm = <PeopleForm submit={searchBool} clear={clearSearchBool} />;
  }
  if (blockType === 'resource') {
    searchForm = <ResourcesForm submit={searchBool} clear={clearSearchBool} />;
  }
  if (blockType === 'spatial') {
    searchForm = <SpatialForm submit={searchBool} clear={clearSearchBool} />;
  }
  if (blockType === 'temporal') {
    searchForm = <TemporalForm submit={searchBool} clear={clearSearchBool} />;
  }

  const eventListClass =
    blockType !== 'resource'
      ? 'events-list-container'
      : 'events-list-resources-container';
  const itemLabel =
    typeof item.label !== 'undefined' && item.label !== ''
      ? `"${item.label}"`
      : 'selected item';

  return (
    <Modal
      isOpen={visible}
      toggle={() => toggleModal(modalType)}
      className={className}
      innerRef={modalRef}
    >
      <ModalHeader toggle={() => toggleModal(modalType)}>
        Associate {itemLabel} with {heading}
      </ModalHeader>
      <ModalBody>
        <div className="item-form">
          {errorContainer}
          <FormGroup style={{ marginTop: '15px' }}>
            <Label>Reference Type</Label>
            <Select
              value={state.refType}
              onChange={(selectedOption) =>
                select2Change(selectedOption, 'refType')
              }
              options={refTypesListItems}
            />
          </FormGroup>

          {searchForm}

          <div
            className="flex justify-content-between"
            style={{ padding: '10px 0' }}
          >
            <Button
              color="secondary"
              type="button"
              onClick={() => clearSearch()}
              size="sm"
            >
              <i className="fa fa-times" /> Clear Search
            </Button>
            <Button
              color="info"
              type="button"
              onClick={() => submitSearch()}
              size="sm"
            >
              <i className="fa fa-search" /> Search
            </Button>
          </div>
          <div className={eventListClass}>{newList}</div>
        </div>
        <ItemDetails
          itemsType={blockType}
          visible={itemDetailsVisible}
          toggle={itemDetailsToggle}
          selectedItem={state.selectedItem}
          parentHeight={height}
        />
      </ModalBody>
      <ModalFooter className="modal-footer flex justify-content-between">
        <Button
          color="secondary"
          outline
          size="sm"
          onClick={() => toggleModal(modalType)}
        >
          Cancel
        </Button>
        <Button
          color="info"
          outline
          size="sm"
          onClick={() => submitReferences()}
        >
          {state.addingReferenceBtn}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

AddItem.defaultProps = {
  className: '',
  item: null,
  toggleModal: () => {},
  type: '',
  refTypes: null,
  visible: false,
};

AddItem.propTypes = {
  blockType: PropTypes.string.isRequired,
  className: PropTypes.string,
  item: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  modalItems: PropTypes.array.isRequired,
  modalType: PropTypes.string.isRequired,
  toggleModal: PropTypes.func,
  type: PropTypes.string,
  refTypes: PropTypes.object,
  reload: PropTypes.func.isRequired,
  visible: PropTypes.bool,
};

export default AddItem;
