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
import { addGenericReference, refTypesList } from '../../helpers';

const APIPath = process.env.REACT_APP_APIPATH;

export default class AddEvent extends Component {
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
      addingReferenceBtn: <span>Add</span>,
    };

    this.loadEvents = this.loadEvents.bind(this);
    this.loadMoreEvents = this.loadMoreEvents.bind(this);
    this.selectedEvent = this.selectedEvent.bind(this);
    this.searchEvents = this.searchEvents.bind(this);
    this.clearSearchEvents = this.clearSearchEvents.bind(this);
    this.clearSearchEventsTemporal = this.clearSearchEventsTemporal.bind(this);
    this.clearSearchEventsSpatial = this.clearSearchEventsSpatial.bind(this);
    this.keypress = this.keypress.bind(this);
    this.toggleAddNew = this.toggleAddNew.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.submitReferences = this.submitReferences.bind(this);
    this.addReference = this.addReference.bind(this);
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
    const { item, refTypes } = this.props;
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
    if (prevProps.refTypes !== refTypes) {
      this.loadDefaultRefType();
    }
    if (prevProps.item !== item) {
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

  async loadEvents() {
    const {
      searchTemporal,
      list,
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
    const listIds = [];
    for (let j = 0; j < list.length; j += 1) {
      listIds.push(list[j]._id);
    }
    for (let i = 0; i < events.length; i += 1) {
      const eventItem = events[i];
      if (listIds.indexOf(eventItem._id === -1)) {
        eventItem.key = eventItem._id;
        list.push(eventItem);
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

  clearSearchEvents() {
    const { searchItem } = this.state;
    if (searchItem !== '') {
      this.setState({
        searchItem: '',
        list: [],
        loadMoreVisible: true,
      });
    }
  }

  clearSearchEventsTemporal() {
    const { searchTemporal } = this.state;
    if (searchTemporal !== '') {
      this.setState({
        searchTemporal: '',
        list: [],
        loadMoreVisible: true,
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
        loadMoreVisible: true,
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
      addingReferenceBtn: <span>Add</span>,
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
    const { reload } = this.props;
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

    const addReference = await this.addReference();

    const addReferenceData = addReference.data;
    if (addReferenceData.status === false) {
      this.setState({
        addingReference: false,
        addingReferenceErrorVisible: true,
        addingReferenceErrorText: <div>{addReferenceData.error}</div>,
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
          Added successfully <i className="fa fa-check" />
        </span>
      ),
    });
    reload();
    this.toggleModal('addEventModal');

    setTimeout(() => {
      context.setState({
        addingReferenceBtn: <span>Add</span>,
      });
    }, 2000);
    return false;
  }

  addReference() {
    const { reference } = this.props;
    const { refType, selectedEvent } = this.state;
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
    const newReference = {
      items: [
        { _id: reference.ref, type: reference.type },
        { _id: selectedEvent, type: 'Event' },
      ],
      taxonomyTermLabel: refType.label,
    };
    return addGenericReference(newReference);
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
      refType: refTypesList(refTypes)[0],
    });
  }

  render() {
    const { refTypes, visible, className } = this.props;
    const {
      loadingPage,
      loadMoreVisible,
      loading,
      list: stateList,
      selectedEvent,
      refType,
      addingReferenceErrorVisible,
      addingReferenceErrorText,
      searchItem,
      searchTemporal,
      searchSpatial,
      addingReferenceBtn,
    } = this.state;
    let list = (
      <div className="text-center">
        <Spinner color="secondary" />
      </div>
    );
    const loadingMoreVisible = loadingPage ? '' : 'hidden';

    const loadingMore = (
      <Spinner color="light" size="sm" className={loadingMoreVisible} />
    );
    const loadMoreVisibleClass = loadMoreVisible ? '' : 'hidden';
    if (!loading) {
      list = [];
      const { item } = this.props;
      let itemEvents = [];
      if (
        item !== null &&
        typeof item.events !== 'undefined' &&
        item.events !== null
      ) {
        itemEvents = item.events.map((org) => ({
          ref: org.ref._id,
          term: org.term.label,
        }));
      }
      for (let i = 0; i < stateList.length; i += 1) {
        const eventItem = stateList[i];
        const active = selectedEvent === eventItem._id ? ' active' : '';
        let exists = '';
        const isRelated = itemEvents.find((org) => {
          if (
            refType !== null &&
            org.ref === eventItem._id &&
            org.term === refType.value
          ) {
            return true;
          }
          return false;
        });
        if (isRelated) {
          exists = ' exists';
        }
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
        list.push(eventListItem);
      }
    }
    const refTypesListItems = refTypesList(refTypes);

    const addingReferenceErrorVisibleClass = addingReferenceErrorVisible
      ? ''
      : 'hidden';

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
          Add Event Relation
        </ModalHeader>
        <ModalBody>
          {errorContainer}
          <FormGroup style={{ marginTop: '15px' }}>
            <Label for="refType">Reference Type</Label>
            <Select
              value={refType}
              onChange={(selectedOption) =>
                this.select2Change(selectedOption, 'refType')
              }
              options={refTypesListItems}
            />
          </FormGroup>
          <hr />
          <h4>Select Event</h4>
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchItem"
              placeholder="Search..."
              value={searchItem}
              onChange={this.handleChange}
            />
            <div
              className="close-icon"
              onClick={() => this.clearSearchEvents()}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear search"
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
              aria-label="clear search temporal"
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
              role="button"
              tabIndex={0}
              aria-label="clear search for spatial"
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
          <div className="events-list-container" ref={this.listRef}>
            {list}
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
          <Button color="info" outline onClick={() => this.submitReferences()}>
            {addingReferenceBtn}
          </Button>
          <Button
            color="secondary"
            outline
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
  refTypes: [],
  toggleModal: () => {},
  item: null,
  type: '',
  reload: () => {},
  className: '',
  reference: null,
};

AddEvent.propTypes = {
  visible: PropTypes.bool,
  refTypes: PropTypes.array,
  item: PropTypes.object,
  toggleModal: PropTypes.func,
  reload: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
  reference: PropTypes.object,
};
