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
import { refTypesList } from '../../helpers';

const APIPath = process.env.REACT_APP_APIPATH;

export default class AddOrganisation extends Component {
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
      selectedOrganisation: null,
      loadMoreVisible: false,
      loadingPage: false,
      searchItem: '',

      addingReference: false,
      addingReferenceErrorVisible: false,
      addingReferenceErrorText: [],
      addingReferenceBtn: <span>Submit</span>,
    };

    this.loadOrganisations = this.loadOrganisations.bind(this);
    this.loadMoreOrganisations = this.loadMoreOrganisations.bind(this);
    this.selectedOrganisation = this.selectedOrganisation.bind(this);
    this.search = this.search.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
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
    this.loadOrganisations();
  }

  componentDidUpdate(prevProps, prevState) {
    const { listPage, searchItem } = this.state;
    const { visible, refTypes } = this.props;
    if (prevState.listPage < listPage) {
      this.loadOrganisations();
      const context = this;
      setTimeout(() => {
        context.listRef.current.scrollTop =
          context.listRef.current.scrollHeight;
      }, 100);
    }
    if (prevState.searchItem !== searchItem) {
      this.search();
    }
    if (
      visible &&
      !prevProps.visible &&
      typeof refTypes.organisation !== 'undefined'
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

  async loadOrganisations() {
    const { list, listPage, listLimit, searchItem } = this.state;
    const params = {
      page: listPage,
      limit: listLimit,
      label: searchItem,
    };
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}organisations`,
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
    for (let j = 0; j < list.length; j += 1) {
      listIds.push(Number(list[j]._id));
    }
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const itemId = Number(item._id);
      if (listIds.indexOf(itemId) === -1) {
        item.key = item._id;
        list.push(item);
        listIds.push(itemId);
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

  loadMoreOrganisations() {
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
    const { searchItem } = this.state;
    this.setState({
      loading: true,
      list: [],
    });
    const params = {
      label: searchItem,
    };
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}organisations`,
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
      item.key = item._id;
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
    return this.setState({
      list,
      loading: false,
      loadMoreVisible,
      listTotalPages: responseData.data.totalPages,
      listPage: currentPage,
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

  selectedOrganisation(_id) {
    this.setState({
      selectedOrganisation: _id,
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
      selectedOrganisation: null,
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
    const { addingReference, selectedOrganisation } = this.state;
    if (addingReference) {
      return false;
    }
    if (selectedOrganisation === null) {
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
    this.toggleModal('addOrganisationModal');

    setTimeout(() => {
      context.setState({
        addingReferenceBtn: <span>Submit</span>,
      });
    }, 2000);
    return false;
  }

  addReferences() {
    const { refType, selectedOrganisation } = this.state;
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
          { _id: selectedOrganisation, type: 'Organisation' },
        ],
        taxonomyTermLabel: refType.value,
      };
      return newReference;
    });
    return this.constructor.postReferences(newReferences);
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
      refType: refTypesList(refTypes.organisation)[0],
    });
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
      loadingPage,
      loadMoreVisible,
      loading,
      list: stateList,
      selectedOrganisation,
      addingReferenceErrorVisible,
      addingReferenceErrorText,
      refType,
      searchItem,
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
    let list = (
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
      list = [];
      const itemOrganisations = [];
      for (let i = 0; i < stateList.length; i += 1) {
        const item = stateList[i];
        let active = '';
        let exists = '';
        if (selectedOrganisation === item._id) {
          active = ' active';
        }
        if (itemOrganisations.indexOf(item._id) > -1) {
          exists = ' exists';
        }
        const listItem = (
          <div
            className={`event-list-item${active}${exists}`}
            key={item._id}
            onClick={() => this.selectedOrganisation(item._id)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select organisation"
          >
            {item.label}
          </div>
        );
        list.push(listItem);
      }
    }

    const addingReferenceErrorVisibleClass = addingReferenceErrorVisible
      ? ''
      : 'hidden';

    let refTypesListItems = [];
    if (typeof refTypes.organisation !== 'undefined') {
      refTypesListItems = refTypesList(refTypes.organisation);
    }
    const errorContainer = (
      <Alert className={addingReferenceErrorVisibleClass} color="danger">
        {addingReferenceErrorText}
      </Alert>
    );
    return (
      <Modal
        isOpen={visible}
        toggle={() => this.toggleModal('addOrganisationModal')}
        className={className}
      >
        <ModalHeader
          toggle={() => this.toggleModal('addOrganisationModal')}
          style={{ fontSize: '14px' }}
        >
          Associate selected items with Organisation
        </ModalHeader>
        <ModalBody>
          {errorContainer}
          {selectedItemsOutput}
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
          <FormGroup>
            <Label>Select Organisation</Label>
          </FormGroup>
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
              aria-label="clear search input"
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
            onClick={() => this.loadMoreOrganisations()}
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
            onClick={() => this.toggleModal('addOrganisationModal')}
            className="pull-left"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

AddOrganisation.defaultProps = {
  visible: false,
  refTypes: null,
  toggleModal: () => {},
  items: [],
  type: '',
  removeSelected: () => {},
  className: '',
};

AddOrganisation.propTypes = {
  visible: PropTypes.bool,
  refTypes: PropTypes.object,
  items: PropTypes.array,
  toggleModal: PropTypes.func,
  removeSelected: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
};
