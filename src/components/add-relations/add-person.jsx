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
import PropTypes from 'prop-types';
import { addGenericReference, refTypesList } from '../../helpers';

const APIPath = process.env.REACT_APP_APIPATH;

export default class AddPerson extends Component {
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
      totalItems: 0,
      selectedPerson: null,
      loadMoreVisible: false,
      loadingPage: false,
      searchItem: '',
      addingReference: false,
      addingReferenceErrorVisible: false,
      addingReferenceErrorText: [],
      addingReferenceBtn: <span>Add</span>,
    };

    this.loadPeople = this.loadPeople.bind(this);
    this.loadMorePeople = this.loadMorePeople.bind(this);
    this.selectedPerson = this.selectedPerson.bind(this);
    this.search = this.search.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
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
    this.loadPeople();
  }

  componentDidUpdate(prevProps, prevState) {
    const { listPage, searchItem } = this.state;
    const { item, refTypes } = this.props;
    if (prevState.listPage < listPage) {
      this.loadPeople();
      const context = this;
      setTimeout(() => {
        context.listRef.current.scrollTop =
          context.listRef.current.scrollHeight;
      }, 100);
    }
    if (prevState.searchItem !== searchItem) {
      this.search();
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

  async loadPeople() {
    const { list, listPage, listLimit, searchItem } = this.state;
    const params = {
      page: listPage,
      limit: listLimit,
      label: searchItem,
    };
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}people`,
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
    const items = responseData.data.data;
    const listIds = [];
    for (let j = 0; j < listIds.length; j += 1) {
      listIds.push(list[j]._id);
    }
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (listIds.indexOf(item._id === -1)) {
        let label = item.firstName;
        if (item.lastName !== '') {
          label += ` ${item.lastName}`;
        }
        item.key = item._id;
        item.label = label;
        list.push(item);
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
    let showingItems = parseInt(listLimit, 10) * parseInt(currentPage, 10);
    if (showingItems > parseInt(responseData.data.totalItems, 10)) {
      showingItems = responseData.data.totalItems;
    }
    return this.setState({
      list,
      loading: false,
      loadMoreVisible,
      listTotalPages: responseData.data.totalPages,
      listPage: currentPage,
      showingItems,
      totalItems: responseData.data.totalItems,
      loadingPage: false,
    });
  }

  loadMorePeople() {
    const { listPage: currentPage, listTotalPages: lastPage } = this.state;
    if (currentPage < lastPage) {
      const newPage = currentPage + 1;
      this.setState({
        listPage: newPage,
        loadingPage: true,
      });
    }
  }

  async search() {
    const { searchItem, listLimit } = this.state;
    this.setState({
      loading: true,
      list: [],
    });
    const params = {
      label: searchItem,
    };
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}people`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });

    const items = responseData.data.data;
    const list = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      let label = item.firstName;
      if (item.lastName !== '') {
        label += ` ${item.lastName}`;
      }
      item.key = item._id;
      item.label = label;
      list.push(item);
    }
    let currentPage = 1;
    if (responseData.data.currentPage > 1) {
      currentPage = responseData.data.currentPage;
    }
    let loadMoreVisible = false;
    if (currentPage < responseData.data.totalPages) {
      loadMoreVisible = true;
    }
    let showingItems = parseInt(listLimit, 10) * parseInt(currentPage, 10);
    if (showingItems > parseInt(responseData.data.totalItems, 10)) {
      showingItems = responseData.data.totalItems;
    }
    this.setState({
      list,
      loading: false,
      loadMoreVisible,
      listTotalPages: responseData.data.totalPages,
      listPage: currentPage,
      showingItems,
      totalItems: responseData.data.totalItems,
      loadingPage: false,
    });
  }

  clearSearch() {
    const { searchItem } = this.state;
    if (searchItem !== '') {
      this.setState({
        searchItem: '',
        list: [],
      });
    }
  }

  selectedPerson(_id) {
    this.setState({
      selectedPerson: _id,
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
      selectedPerson: null,
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
    const { addingReference, selectedPerson } = this.state;
    if (addingReference) {
      return false;
    }
    if (selectedPerson === null) {
      this.setState({
        addingReference: false,
        addingReferenceErrorVisible: true,
        addingReferenceErrorText: <div>Please select a person to continue</div>,
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
    this.toggleModal('addPersonModal');

    setTimeout(() => {
      context.setState({
        addingReferenceBtn: <span>Add</span>,
      });
    }, 2000);
    return false;
  }

  addReference() {
    const { reference } = this.props;
    const { refType, selectedPerson } = this.state;
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
        { _id: selectedPerson, type: 'Person' },
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
      selectedPerson,
      refType,
      addingReferenceErrorVisible,
      addingReferenceErrorText,
      searchItem,
      addingReferenceBtn,
      showingItems,
      totalItems,
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
      let itemPeople = [];
      if (
        item !== null &&
        typeof item.people !== 'undefined' &&
        item.people !== null
      ) {
        itemPeople = item.people.map((org) => ({
          ref: org.ref._id,
          term: org.term.label,
        }));
      }
      for (let i = 0; i < stateList.length; i += 1) {
        const lItem = stateList[i];
        const active = selectedPerson === lItem._id ? ' active' : '';
        let exists = '';
        const isRelated = itemPeople.find((org) => {
          if (
            typeof refType !== 'undefined' &&
            refType !== null &&
            org.ref === lItem._id &&
            org.term === refType.value
          ) {
            return true;
          }
          return false;
        });
        if (isRelated) {
          exists = ' exists';
        }
        const listItem = (
          <div
            className={`event-list-item${active}${exists}`}
            key={lItem._id}
            onClick={() => this.selectedPerson(lItem._id)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select person"
          >
            {lItem.label}
          </div>
        );
        list.push(listItem);
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
        toggle={() => this.toggleModal('addPersonModal')}
        className={className}
      >
        <ModalHeader toggle={() => this.toggleModal('addPersonModal')}>
          Add Person Relation
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
          <h4>Select Person</h4>
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
              onClick={() => this.clearSearch()}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear search"
            >
              <i className="fa fa-times" />
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
            onClick={() => this.loadMorePeople()}
          >
            Load more {loadingMore}
          </Button>
          <div className="list-legend">
            <span className="heading">Showing:</span>
            <span className="text">
              {showingItems}/{totalItems}
            </span>
          </div>
        </ModalBody>
        <ModalFooter className="modal-footer">
          <Button color="info" outline onClick={() => this.submitReferences()}>
            {addingReferenceBtn}
          </Button>
          <Button
            color="secondary"
            outline
            onClick={() => this.toggleModal('addPersonModal')}
            className="pull-left"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
AddPerson.defaultProps = {
  visible: false,
  refTypes: [],
  toggleModal: () => {},
  item: null,
  type: '',
  reload: () => {},
  className: '',
  reference: null,
};

AddPerson.propTypes = {
  visible: PropTypes.bool,
  refTypes: PropTypes.array,
  item: PropTypes.object,
  toggleModal: PropTypes.func,
  reload: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
  reference: PropTypes.object,
};
