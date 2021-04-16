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

export default class AddTemporal extends Component {
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
      selectedTemporal: null,
      loadMoreVisible: false,
      loadingPage: false,
      searchItem: '',
      addingReference: false,
      addingReferenceErrorVisible: false,
      addingReferenceErrorText: [],
      addingReferenceBtn: <span>Add</span>,
    };

    this.loadTemporals = this.loadTemporals.bind(this);
    this.loadMoreTemporals = this.loadMoreTemporals.bind(this);
    this.selectedTemporal = this.selectedTemporal.bind(this);
    this.searchTemporals = this.searchTemporals.bind(this);
    this.clearSearchTemporals = this.clearSearchTemporals.bind(this);
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
    this.loadTemporals();
  }

  componentDidUpdate(prevProps, prevState) {
    const { listPage, searchItem } = this.state;
    const { item, refTypes } = this.props;
    if (prevState.listPage < listPage) {
      this.loadTemporals();
      const context = this;
      setTimeout(() => {
        context.listRef.current.scrollTop =
          context.listRef.current.scrollHeight;
      }, 100);
    }
    if (prevState.searchItem !== searchItem) {
      this.searchTemporals();
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

  async loadTemporals() {
    const { list, listPage, listLimit, searchItem } = this.state;
    const params = {
      page: listPage,
      limit: listLimit,
      label: searchItem,
    };
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}temporals`,
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
    const temporals = responseData.data.data;
    const listIds = [];
    for (let j = 0; j < list.length; j += 1) {
      listIds.push(list[j]._id);
    }
    for (let i = 0; i < temporals.length; i += 1) {
      const temporalItem = temporals[i];
      if (listIds.indexOf(temporalItem._id === -1)) {
        temporalItem.key = temporalItem._id;
        list.push(temporalItem);
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

  loadMoreTemporals() {
    const { listPage: currentPage, listTotalPages: lastPage } = this.state;
    if (currentPage < lastPage) {
      const newPage = currentPage + 1;
      this.setState({
        listPage: newPage,
        loadingPage: true,
      });
    }
  }

  async searchTemporals() {
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
      url: `${APIPath}temporals`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    const temporals = responseData.data.data;
    const list = [];
    for (let i = 0; i < temporals.length; i += 1) {
      const temporalItem = temporals[i];
      temporalItem.key = temporalItem._id;
      list.push(temporalItem);
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

  clearSearchTemporals() {
    const { searchItem } = this.state;
    if (searchItem !== '') {
      this.setState({
        searchItem: '',
        list: [],
      });
    }
  }

  selectedTemporal(_id) {
    this.setState({
      selectedTemporal: _id,
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
      selectedTemporal: null,
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
    const { addingReference, selectedTemporal } = this.state;
    if (addingReference) {
      return false;
    }
    if (selectedTemporal === null) {
      this.setState({
        addingReference: false,
        addingReferenceErrorVisible: true,
        addingReferenceErrorText: (
          <div>Please select an temporal to continue</div>
        ),
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
    this.toggleModal('addTemporalModal');

    setTimeout(() => {
      context.setState({
        addingReferenceBtn: <span>Add</span>,
      });
    }, 2000);
    return false;
  }

  addReference() {
    const { reference } = this.props;
    const { refType, selectedTemporal } = this.state;
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
        { _id: selectedTemporal, type: 'Temporal' },
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
      selectedTemporal,
      refType,
      addingReferenceErrorVisible,
      addingReferenceErrorText,
      searchItem,
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
      let itemTemporals = [];
      if (
        item !== null &&
        typeof item.temporals !== 'undefined' &&
        item.temporals !== null
      ) {
        itemTemporals = item.temporals.map((org) => ({
          ref: org.ref._id,
          term: org.term.label,
        }));
      }
      for (let i = 0; i < stateList.length; i += 1) {
        const temporalItem = stateList[i];
        let active = '';
        let exists = '';
        if (selectedTemporal === temporalItem._id) {
          active = ' active';
        }
        const isRelated = itemTemporals.find((org) => {
          if (
            refType !== null &&
            org.ref === temporalItem._id &&
            org.term === refType.value
          ) {
            return true;
          }
          return false;
        });
        if (isRelated) {
          exists = ' exists';
        }
        const temporalListItem = (
          <div
            className={`event-list-item${active}${exists}`}
            key={temporalItem._id}
            onClick={() => this.selectedTemporal(temporalItem._id)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select temporal"
          >
            {temporalItem.label}
          </div>
        );
        list.push(temporalListItem);
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
        toggle={() => this.toggleModal('addTemporalModal')}
        className={className}
      >
        <ModalHeader toggle={() => this.toggleModal('addTemporalModal')}>
          Add Temporal Relation
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
          <h4>Select Temporal</h4>
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
              onClick={() => this.clearSearchTemporals()}
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
            onClick={() => this.loadMoreTemporals()}
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
            onClick={() => this.toggleModal('addTemporalModal')}
            className="pull-left"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
AddTemporal.defaultProps = {
  visible: false,
  refTypes: [],
  toggleModal: () => {},
  item: null,
  type: '',
  reload: () => {},
  className: '',
  reference: null,
};

AddTemporal.propTypes = {
  visible: PropTypes.bool,
  refTypes: PropTypes.array,
  item: PropTypes.object,
  toggleModal: PropTypes.func,
  reload: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
  reference: PropTypes.object,
};
