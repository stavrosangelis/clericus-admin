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
  personLabel,
  refTypesList,
  getResourceThumbnailURL,
} from '../../helpers';
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
    className,
    items,
    itemsType,
    loading,
    modalType,
    toggleModal: toggleModalFn,
    type,
    refTypes,
    reload,
    removeSelected,
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

  let heading;
  switch (itemsType) {
    case 'events':
      heading = 'an Event';
      break;
    case 'organisations':
      heading = 'an Organisation';
      break;
    case 'people':
      heading = 'a Person';
      break;
    case 'resources':
      heading = 'a Resource';
      break;
    case 'temporal':
      heading = 'a Temporal';
      break;
    case 'spatial':
      heading = 'a Spatial';
      break;
    default:
      heading = '';
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
    if (element === null) {
      return false;
    }
    return setState({
      [element]: selectedOption,
    });
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
    if (typeof state.refType === 'undefined' || state.refType === null) {
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
    const references = items.map((item) => {
      const newReference = {
        items: [
          { _id: item._id, type },
          { _id: state.selectedItem, type: heading },
        ],
        taxonomyTermLabel: state.refType.value,
      };
      return newReference;
    });
    const data = await putData(`references`, references);
    reload(true);
    return data;
  };

  const submitReferences = async () => {
    if (state.addingReference) {
      return false;
    }
    if (state.selectedItem === null) {
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

    const referencesData = references.data;

    if (!references.status) {
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
    return true;
  };

  const selectedItems = items.map((item) => {
    const name = type === 'Person' ? personLabel(item) : item.label;
    const itemId = item._id;
    const label = (
      <span>
        {name} <small>[{itemId}]</small>
      </span>
    );
    return (
      <li key={itemId}>
        {label}
        <span
          className="remove-item-from-list"
          onClick={() => removeSelected(itemId)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="remove item from list"
        >
          <i className="fa fa-times-circle" />
        </span>
      </li>
    );
  });

  const selectedItemsOutput =
    selectedItems.length > 0 ? (
      <div className="form-group">
        <Label>Selected items</Label>
        <ul className="selected-items-list">{selectedItems}</ul>
      </div>
    ) : (
      []
    );
  let newList = (
    <div className="text-center" style={{ flex: 1 }}>
      <Spinner color="secondary" />
    </div>
  );
  if (!loading) {
    if (itemsType !== 'resources') {
      newList = modalItems.map((item) => {
        const itemId = item._id;
        const active = state.selectedItem === itemId ? ' active' : '';
        let labelDetails = '';
        if (itemsType === 'events') {
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
            className={`event-list-item${active}`}
            key={itemId}
            onClick={() => selectItem(itemId)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select event"
          >
            <div className="event-list-item-details">
              {item.label}
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
      newList = modalItems.map((item) => {
        const itemId = item._id;
        const active = state.selectedItem === itemId ? ' active' : '';
        const thumbnail =
          getResourceThumbnailURL(item) !== null ? (
            <div>
              <img
                className="img-responsive img-thumbnail"
                src={getResourceThumbnailURL(item)}
                alt={item.label}
              />
            </div>
          ) : (
            []
          );
        return (
          <div
            className={`event-list-item event-list-resource-item${active}`}
            key={itemId}
            onClick={() => selectItem(itemId)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select event"
          >
            <div className="resource-container">
              {thumbnail}
              <div className="label">{item.label}</div>
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
  if (itemsType === 'events' && typeof refTypes.event !== 'undefined') {
    refTypesListItems = refTypesList(refTypes.event);
  }
  if (
    itemsType === 'organisations' &&
    typeof refTypes.organisation !== 'undefined'
  ) {
    refTypesListItems = refTypesList(refTypes.organisation);
  }
  if (itemsType === 'people' && typeof refTypes.person !== 'undefined') {
    refTypesListItems = refTypesList(refTypes.person);
  }
  if (itemsType === 'resources' && typeof refTypes.resource !== 'undefined') {
    refTypesListItems = refTypesList(refTypes.resource);
  }
  if (itemsType === 'spatial' && typeof refTypes.spatial !== 'undefined') {
    refTypesListItems = refTypesList(refTypes.spatial);
  }
  if (itemsType === 'temporal' && typeof refTypes.temporal !== 'undefined') {
    refTypesListItems = refTypesList(refTypes.temporal);
  }
  const errorContainer = (
    <Alert className={addingReferenceErrorVisibleClass} color="danger">
      {state.addingReferenceErrorText}
    </Alert>
  );

  let searchForm = [];
  if (itemsType === 'events') {
    searchForm = <EventsForm submit={searchBool} clear={clearSearchBool} />;
  }
  if (itemsType === 'organisations') {
    searchForm = (
      <OrganisationsForm submit={searchBool} clear={clearSearchBool} />
    );
  }
  if (itemsType === 'people') {
    searchForm = <PeopleForm submit={searchBool} clear={clearSearchBool} />;
  }
  if (itemsType === 'resources') {
    searchForm = <ResourcesForm submit={searchBool} clear={clearSearchBool} />;
  }
  if (itemsType === 'spatial') {
    searchForm = <SpatialForm submit={searchBool} clear={clearSearchBool} />;
  }
  if (itemsType === 'temporal') {
    searchForm = <TemporalForm submit={searchBool} clear={clearSearchBool} />;
  }

  const eventListClass =
    itemsType !== 'resources'
      ? 'events-list-container'
      : 'events-list-resources-container';
  return (
    <Modal
      isOpen={visible}
      toggle={() => toggleModal(modalType)}
      className={className}
      innerRef={modalRef}
    >
      <ModalHeader toggle={() => toggleModal(modalType)}>
        Associate selected items with {heading}
      </ModalHeader>
      <ModalBody>
        <div className="item-form">
          {errorContainer}
          {selectedItemsOutput}
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

          <div className="add-item-search-btn" style={{ paddingTop: 5 }}>
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
              className="pull-right"
            >
              <i className="fa fa-search" /> Search
            </Button>
          </div>
          <div className={eventListClass}>{newList}</div>
        </div>
        <ItemDetails
          itemsType={itemsType}
          visible={itemDetailsVisible}
          toggle={itemDetailsToggle}
          selectedItem={state.selectedItem}
          parentHeight={height}
        />
      </ModalBody>
      <ModalFooter className="modal-footer">
        <Button
          color="info"
          outline
          size="sm"
          onClick={() => submitReferences()}
        >
          {state.addingReferenceBtn}
        </Button>
        <Button
          color="secondary"
          outline
          size="sm"
          onClick={() => toggleModal(modalType)}
          className="pull-left"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

AddItem.defaultProps = {
  className: '',
  items: [],
  toggleModal: () => {},
  type: '',
  refTypes: null,
  removeSelected: () => {},
  visible: false,
};

AddItem.propTypes = {
  className: PropTypes.string,
  items: PropTypes.array,
  itemsType: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  modalItems: PropTypes.array.isRequired,
  modalType: PropTypes.string.isRequired,
  toggleModal: PropTypes.func,
  type: PropTypes.string,
  refTypes: PropTypes.object,
  reload: PropTypes.func.isRequired,
  removeSelected: PropTypes.func,
  visible: PropTypes.bool,
};

export default AddItem;
