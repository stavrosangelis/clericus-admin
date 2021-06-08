import React, { Component } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Alert,
  Spinner,
} from 'reactstrap';
import axios from 'axios';
import Select from 'react-select';
import InputMask from 'react-input-mask';
import PropTypes from 'prop-types';
import { refTypesList } from '../../helpers';

const APIPath = process.env.REACT_APP_APIPATH;

export default class AddEvent extends Component {
  static async postReferences(references) {
    const data = await axios({
      method: 'put',
      url: `${APIPath}references`,
      crossDomain: true,
      data: references,
    })
      .then((response) => response)
      .catch((error) => {
        console.log(error);
      });
    return data;
  }

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      refType: null,
      listVisible: true,
      addNewVisible: false,
      list: [],
      listPage: 1,
      listLimit: 25,
      listTotalPages: 0,
      selectedEvent: null,
      loadMoreVisible: false,
      loadingPage: false,
      searchItem: '',
      searchTemporal: '',
      searchSpatial: '',

      addingReference: false,
      addingReferenceErrorVisible: false,
      addingReferenceErrorText: [],
      addingReferenceBtn: <span>Submit</span>,
    };

    this.loadEvents = this.loadEvents.bind(this);
    this.loadMoreEvents = this.loadMoreEvents.bind(this);
    this.selectedEvent = this.selectedEvent.bind(this);
    this.searchEvents = this.searchEvents.bind(this);
    this.clearSearchEventsInput = this.clearSearchEventsInput.bind(this);
    this.clearSearchEventsTemporal = this.clearSearchEventsTemporal.bind(this);
    this.clearSearchEventsSpatial = this.clearSearchEventsSpatial.bind(this);
    this.keypress = this.keypress.bind(this);
    this.toggleAddNew = this.toggleAddNew.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.submitReferences = this.submitReferences.bind(this);
    this.addReferences = this.addReferences.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.loadDefaultRefType = this.loadDefaultRefType.bind(this);

    this.listRef = React.createRef();

    // hack to kill load promise on unmount
    this.cancelLoad = false;
  }

  componentDidMount() {
    this.loadEvents();
  }

  componentDidUpdate(prevProps, prevState) {
    const { listPage, searchItem } = this.state;
    const { visible, refTypes } = this.props;
    if (prevState.listPage < listPage) {
      this.loadEvents();
      const context = this;
      setTimeout(() => {
        context.listRef.current.scrollTop =
          context.listRef.current.scrollHeight;
      }, 100);
    }
    if (prevState.searchItem !== searchItem) {
      this.searchEvents();
    }
    if (
      visible &&
      !prevProps.visible &&
      typeof refTypes?.event !== 'undefined'
    ) {
      this.loadDefaultRefType();
    }
  }

  componentWillUnmount() {
    this.cancelLoad = true;
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  async searchEvents() {
    const { searchTemporal, searchItem, searchSpatial } = this.state;
    const temporal = searchTemporal.replace(/_/g, '.');
    this.setState({
      loading: true,
      list: [],
    });
    const params = {
      label: searchItem,
      temporal,
      spatial: searchSpatial,
    };
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}events`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });

    const events = responseData.data.data;
    const list = [];
    for (let i = 0; i < events.length; i += 1) {
      const eventItem = events[i];
      eventItem.key = eventItem._id;
      list.push(eventItem);
    }
    let currentPage = 1;
    if (responseData.data.currentPage > 1) {
      currentPage = responseData.data.currentPage;
    }
    let loadMoreVisible = false;
    if (currentPage < responseData.data.totalPages) {
      loadMoreVisible = true;
    }
    this.setState({
      list,
      loading: false,
      loadMoreVisible,
      listTotalPages: responseData.data.totalPages,
      listPage: currentPage,
      loadingPage: false,
    });
  }

  keypress(e) {
    if (e.which === 13) {
      this.searchEvents();
    }
  }

  clearSearchEventsInput() {
    const { searchItem } = this.state;
    if (searchItem !== '') {
      this.setState({
        searchItem: '',
        list: [],
      });
    }
  }

  clearSearchEventsTemporal() {
    const { searchTemporal } = this.state;
    if (searchTemporal !== '') {
      this.setState({
        searchTemporal: '',
        list: [],
      });
      const context = this;
      setTimeout(() => context.loadEvents(), 250);
    }
  }

  clearSearchEventsSpatial() {
    const { searchSpatial } = this.state;
    if (searchSpatial !== '') {
      this.setState({
        searchSpatial: '',
        list: [],
      });
      const context = this;
      setTimeout(() => context.loadEvents(), 250);
    }
  }

  selectedEvent(_id) {
    this.setState({
      selectedEvent: _id,
    });
  }

  toggleAddNew() {
    const { listVisible, addNewVisible } = this.state;
    this.setState({
      listVisible: !listVisible,
      addNewVisible: !addNewVisible,
    });
  }

  toggleModal(modal) {
    const { toggleModal } = this.props;
    this.setState({
      selectedEvent: null,
      addingReferenceErrorVisible: false,
      addingReferenceErrorText: [],
      addingReferenceBtn: <span>Submit</span>,
    });
    toggleModal(modal);
  }

  select2Change(selectedOption, element = null) {
    if (element === null) {
      return false;
    }
    return this.setState({
      [element]: selectedOption,
    });
  }

  async submitReferences() {
    const { addingReference, selectedEvent } = this.state;
    if (addingReference) {
      return false;
    }
    if (selectedEvent === null) {
      this.setState({
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
    this.setState({
      addingReference: true,
      addingReferenceErrorVisible: false,
      addingReferenceErrorText: [],
      addingReferenceBtn: (
        <span>
          <i>Adding...</i> <Spinner color="info" size="sm" />
        </span>
      ),
    });

    const addReferences = await this.addReferences();

    const addReferencesData = addReferences.data;
    if (addReferencesData.status === false) {
      this.setState({
        addingReference: false,
        addingReferenceErrorVisible: true,
        addingReferenceErrorText: <div>{addReferencesData.error}</div>,
        addingReferenceBtn: (
          <span>
            Error... <i className="fa fa-times" />
          </span>
        ),
      });
      return false;
    }

    const context = this;
    this.setState({
      addingReference: false,
      addingReferenceBtn: (
        <span>
          Submitted successfully <i className="fa fa-check" />
        </span>
      ),
    });
    this.toggleModal('addEventModal');

    setTimeout(() => {
      context.setState({
        addingReferenceBtn: <span>Submit</span>,
      });
    }, 2000);
    return false;
  }

  addReferences() {
    const { refType, selectedEvent } = this.state;
    const { items, type } = this.props;
    if (typeof refType === 'undefined' || refType === null) {
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

    const newReferences = items.map((item) => {
      const newReference = {
        items: [
          { _id: item._id, type },
          { _id: selectedEvent, type: 'Event' },
        ],
        taxonomyTermLabel: refType.value,
      };
      return newReference;
    });
    return this.constructor.postReferences(newReferences);
  }

  async loadEvents() {
    const {
      searchTemporal,
      listPage,
      listLimit,
      searchItem,
      searchSpatial,
    } = this.state;
    const temporal = searchTemporal.replace(/_/g, '.');
    const params = {
      page: listPage,
      limit: listLimit,
      label: searchItem,
      temporal,
      spatial: searchSpatial,
    };
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}events`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (this.cancelLoad) {
      return false;
    }
    const events = responseData.data.data;
    const { list } = this.state;
    const listIds = [];
    for (let j = 0; j < list.length; j += 1) {
      listIds.push(Number(list[j]._id));
    }
    for (let i = 0; i < events.length; i += 1) {
      const eventItem = events[i];
      const eventItemId = Number(eventItem._id);
      if (listIds.indexOf(eventItemId) === -1) {
        eventItem.key = eventItem._id;
        list.push(eventItem);
        listIds.push(eventItemId);
      }
    }
    let currentPage = 1;
    if (responseData.data.currentPage > 1) {
      currentPage = responseData.data.currentPage;
    }
    let loadMoreVisible = false;
    if (currentPage < responseData.data.totalPages) {
      loadMoreVisible = true;
    }
    return this.setState({
      list,
      loading: false,
      loadMoreVisible,
      listTotalPages: responseData.data.totalPages,
      listPage: currentPage,
      loadingPage: false,
    });
  }

  toggleCollapse(collapseName) {
    const { [collapseName]: value } = this.state;
    this.setState({
      [collapseName]: !value,
    });
  }

  loadDefaultRefType() {
    const { refTypes } = this.props;
    this.setState({
      refType: refTypesList(refTypes.event)[0],
    });
  }

  loadMoreEvents() {
    const { listPage: currentPage, listTotalPages: lastPage } = this.state;
    if (currentPage < lastPage) {
      const newPage = currentPage + 1;
      this.setState({
        listPage: newPage,
        loadingPage: true,
      });
    }
  }

  render() {
    const {
      type,
      items,
      removeSelected,
      refTypes,
      visible,
      className,
    } = this.props;
    const {
      loadMoreVisible,
      loading,
      list: stateList,
      selectedEvent,
      loadingPage,
      addingReferenceErrorVisible,
      addingReferenceErrorText,
      refType,
      searchItem,
      searchTemporal,
      searchSpatial,
      addingReferenceBtn,
    } = this.state;
    let selectedItems = [];
    if (type === 'Person') {
      selectedItems = items.map((item) => {
        let name = '';
        if (
          typeof item.honorificPrefix !== 'undefined' &&
          item.honorificPrefix !== ''
        ) {
          name += `${item.honorificPrefix} `;
        }
        if (typeof item.firstName !== 'undefined' && item.firstName !== '') {
          name += `${item.firstName} `;
        }
        if (typeof item.middleName !== 'undefined' && item.middleName !== '') {
          name += `${item.middleName} `;
        }
        if (typeof item.lastName !== 'undefined' && item.lastName !== '') {
          name += `${item.lastName} `;
        }
        const label = (
          <span>
            {name} <small>[{item._id}]</small>
          </span>
        );
        return (
          <li key={item._id}>
            {label}
            <span
              className="remove-item-from-list"
              onClick={() => removeSelected(item._id)}
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
    } else {
      selectedItems = items.map((item) => {
        const label = (
          <span>
            {item.label} <small>[{item._id}]</small>
          </span>
        );
        return (
          <li key={item._id}>
            {label}
            <span
              className="remove-item-from-list"
              onClick={() => removeSelected(item._id)}
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
    }
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
      <div className="text-center">
        <Spinner color="secondary" />
      </div>
    );
    let loadingMoreVisible = 'hidden';
    if (loadingPage) {
      loadingMoreVisible = '';
    }

    const loadingMore = (
      <Spinner color="light" size="sm" className={loadingMoreVisible} />
    );
    let loadMoreVisibleClass = 'hidden';
    if (loadMoreVisible) {
      loadMoreVisibleClass = '';
    }
    if (!loading) {
      newList = [];

      for (let i = 0; i < stateList.length; i += 1) {
        const eventItem = stateList[i];
        const active = selectedEvent === eventItem._id ? ' active' : '';
        const exists = '';
        let temporal = [];
        if (eventItem.temporal.length > 0) {
          const temporalData = eventItem.temporal[0].ref;
          temporal = temporalData.label;
        }
        let spatial = [];
        if (eventItem.spatial.length > 0) {
          const spatialData = eventItem.spatial[0].ref;
          spatial = spatialData.label;
          if (temporal.length > 0) {
            spatial = `| ${spatial}`;
          }
        }
        const eventListItem = (
          <div
            className={`event-list-item${active}${exists}`}
            key={eventItem._id}
            onClick={() => this.selectedEvent(eventItem._id)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select event"
          >
            {eventItem.label}{' '}
            <small>
              ({temporal} {spatial})
            </small>
          </div>
        );
        newList.push(eventListItem);
      }
    }

    const addingReferenceErrorVisibleClass = addingReferenceErrorVisible
      ? ''
      : 'hidden';

    let refTypesListItems = [];
    if (typeof refTypes.event !== 'undefined') {
      refTypesListItems = refTypesList(refTypes.event);
    }
    const errorContainer = (
      <Alert className={addingReferenceErrorVisibleClass} color="danger">
        {addingReferenceErrorText}
      </Alert>
    );
    return (
      <Modal
        isOpen={visible}
        toggle={() => this.toggleModal('addEventModal')}
        className={className}
      >
        <ModalHeader toggle={() => this.toggleModal('addEventModal')}>
          Associate selected items with Event
        </ModalHeader>
        <ModalBody>
          {errorContainer}
          {selectedItemsOutput}
          <FormGroup style={{ marginTop: '15px' }}>
            <Label>Reference Type</Label>
            <Select
              value={refType}
              onChange={(selectedOption) =>
                this.select2Change(selectedOption, 'refType')
              }
              options={refTypesListItems}
            />
          </FormGroup>

          <FormGroup>
            <Label>Select Event</Label>
          </FormGroup>
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchItem"
              placeholder="Search event label..."
              value={searchItem}
              onChange={this.handleChange}
            />
            <div
              className="close-icon"
              onClick={() => this.clearSearchEventsInput()}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear search events input"
            >
              <i className="fa fa-times" />
            </div>
          </FormGroup>
          <FormGroup className="autocomplete-search">
            <InputMask
              className="input-mask"
              placeholder="dd-mm-yyyy"
              mask="99-99-9999"
              name="searchTemporal"
              value={searchTemporal}
              onChange={this.handleChange}
              onKeyPress={this.keypress}
            />
            <div
              className="close-icon"
              onClick={() => this.clearSearchEventsTemporal()}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear search events temporal input"
            >
              <i className="fa fa-times" />
            </div>
            <div
              className="submit-icon"
              onClick={() => this.searchEvents()}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="search events"
            >
              <i className="fa fa-search" />
            </div>
          </FormGroup>
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchSpatial"
              placeholder="Search spatial..."
              value={searchSpatial}
              onChange={this.handleChange}
              onKeyPress={this.keypress}
            />
            <div
              className="close-icon"
              onClick={() => this.clearSearchEventsSpatial()}
              onKeyDown={() => false}
              role="textbox"
              tabIndex={0}
              aria-label="clear search spatial"
            >
              <i className="fa fa-times" />
            </div>
            <div
              className="submit-icon"
              onClick={() => this.searchEvents()}
              onKeyDown={() => false}
              role="textbox"
              tabIndex={0}
              aria-label="submit search"
            >
              <i className="fa fa-search" />
            </div>
          </FormGroup>
          <div className="events-list-container" ref={this.listRef}>
            {newList}
          </div>
          <Button
            className={loadMoreVisibleClass}
            color="secondary"
            outline
            size="sm"
            block
            onClick={() => this.loadMoreEvents()}
          >
            Load more {loadingMore}
          </Button>
        </ModalBody>
        <ModalFooter className="modal-footer">
          <Button
            color="info"
            outline
            size="sm"
            onClick={() => this.submitReferences()}
          >
            {addingReferenceBtn}
          </Button>
          <Button
            color="secondary"
            outline
            size="sm"
            onClick={() => this.toggleModal('addEventModal')}
            className="pull-left"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

AddEvent.defaultProps = {
  visible: false,
  refTypes: null,
  toggleModal: () => {},
  items: [],
  type: '',
  removeSelected: () => {},
  className: '',
};

AddEvent.propTypes = {
  visible: PropTypes.bool,
  refTypes: PropTypes.object,
  items: PropTypes.array,
  toggleModal: PropTypes.func,
  removeSelected: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
};
