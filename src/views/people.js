import React, { Component } from 'react';
import { Label, Table, Card, CardBody, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';

import axios from 'axios';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Breadcrumbs from '../components/breadcrumbs';
import PageActions from '../components/page-actions';
import { getThumbnailURL, getResourceThumbnailURL } from '../helpers';
import BatchActions from '../components/add-batch-relations';
import defaultThumbnail from '../assets/img/spcc.jpg';
import { setPaginationParams } from '../redux/actions';

const APIPath = process.env.REACT_APP_APIPATH;
const mapStateToProps = (state) => ({
  peoplePagination: state.peoplePagination,
  resourcesTypes: state.resourcesTypes,
  personTypes: state.personTypes,
});

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
  };
}

class People extends Component {
  constructor(props) {
    super(props);

    const { peoplePagination } = this.props;
    const {
      orderField,
      orderDesc,
      page,
      limit,
      status,
      searchInput,
      advancedSearchInputs,
    } = peoplePagination;

    this.state = {
      loading: true,
      tableLoading: true,
      people: [],
      orderField,
      orderDesc,
      page,
      gotoPage: page,
      limit,
      status,
      totalPages: 0,
      totalItems: 0,
      allChecked: false,

      searchInput,
      advancedSearchInputs,
      advancedSearch: false,
      classpieceSearchInput: '',
      classpieceItems: [],
      classpieceId: null,
    };
    this.load = this.load.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setActiveType = this.setActiveType.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.peopleTableRows = this.peopleTableRows.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleSelectedAll = this.toggleSelectedAll.bind(this);
    this.deleteSelected = this.deleteSelected.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.advancedSearch = this.advancedSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.classpieceClearSearch = this.classpieceClearSearch.bind(this);
    this.classpieceSearch = this.classpieceSearch.bind(this);
    this.selectClasspiece = this.selectClasspiece.bind(this);
    this.clearAdvancedSearch = this.clearAdvancedSearch.bind(this);
    this.updateAdvancedSearchInputs = this.updateAdvancedSearchInputs.bind(
      this
    );
    this.removeSelected = this.removeSelected.bind(this);

    // hack to kill load promise on unmount
    this.cancelLoad = false;
  }

  componentDidMount() {
    this.load();
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

  setActiveType(type) {
    this.updateStorePagination({ activeType: type });
    this.setState(
      {
        activeType: type,
      },
      () => {
        this.load();
      }
    );
  }

  setStatus(status = null) {
    this.updateStorePagination({ status });
    this.setState(
      {
        status,
      },
      () => {
        this.load();
      }
    );
  }

  async load() {
    const {
      page,
      limit,
      activeType,
      orderField,
      orderDesc,
      status,
      searchInput: stateSearchInput,
      advancedSearch,
      classpieceId,
      search,
      advancedSearchInputs,
    } = this.state;
    this.setState({
      tableLoading: true,
    });
    const params = {
      page,
      limit,
      orderField,
      orderDesc,
      status,
    };
    if (classpieceId !== null) {
      params.classpieceId = classpieceId;
    }
    if (stateSearchInput !== '' && !advancedSearch) {
      params.label = stateSearchInput;
    } else if (advancedSearchInputs.length > 0 && !search) {
      for (let i = 0; i < advancedSearchInputs.length; i += 1) {
        const searchInput = advancedSearchInputs[i];
        params[searchInput.select] = searchInput.input;
      }
    }
    const url = `${APIPath}people`;
    if (activeType !== null) {
      params.personType = activeType;
    }
    const responseData = await axios({
      method: 'get',
      url,
      crossDomain: true,
      params,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    if (this.cancelLoad) {
      return false;
    }
    const people = responseData.data.map((person) => {
      const personCopy = person;
      personCopy.checked = false;
      return personCopy;
    });
    let currentPage = 1;
    if (responseData.currentPage > 0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage > 1 && currentPage > responseData.totalPages) {
      this.setState(
        {
          page: responseData.totalPages,
        },
        () => {
          this.load();
        }
      );
    } else {
      this.setState({
        loading: false,
        tableLoading: false,
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        people,
      });
    }
    return false;
  }

  async simpleSearch(e) {
    e.preventDefault();
    const {
      page,
      limit,
      activeType,
      orderField,
      orderDesc,
      status,
      searchInput,
    } = this.state;
    if (searchInput < 2) {
      return false;
    }
    this.updateStorePagination({ searchInput });
    this.setState({
      tableLoading: true,
    });
    const params = {
      page,
      limit,
      orderField,
      orderDesc,
      status,
      label: searchInput,
    };
    if (activeType !== null) {
      params.personType = activeType;
    }
    const url = `${APIPath}people`;
    const responseData = await axios({
      method: 'get',
      url,
      crossDomain: true,
      params,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });

    const people = responseData.data;
    const newPeople = people.map((person) => {
      const personCopy = person;
      personCopy.checked = false;
      return personCopy;
    });
    let currentPage = 1;
    if (responseData.currentPage > 0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage > 1 && currentPage > responseData.totalPages) {
      this.setState(
        {
          page: responseData.totalPages,
        },
        () => {
          this.load();
        }
      );
    } else {
      this.setState({
        loading: false,
        tableLoading: false,
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        people: newPeople,
        advancedSearch: false,
      });
    }
    return false;
  }

  async advancedSearch(e) {
    const {
      advancedSearchInputs,
      page,
      limit,
      orderField,
      orderDesc,
      status,
    } = this.state;
    e.preventDefault();
    this.updateStorePagination({
      advancedSearchInputs,
    });
    this.setState({
      tableLoading: true,
    });
    const params = {
      page,
      limit,
      orderField,
      orderDesc,
      status,
    };
    for (let i = 0; i < advancedSearchInputs.length; i += 1) {
      const searchInput = advancedSearchInputs[i];
      params[searchInput.select] = searchInput.input;
    }
    const url = `${APIPath}people`;
    const responseData = await axios({
      method: 'get',
      url,
      crossDomain: true,
      params,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    const people = responseData.data;
    const newPeople = people.map((person) => {
      const personCopy = person;
      personCopy.checked = false;
      return personCopy;
    });
    let currentPage = 1;
    if (responseData.currentPage > 0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage > 1 && currentPage > responseData.totalPages) {
      this.setState(
        {
          page: responseData.totalPages,
        },
        () => {
          this.load();
        }
      );
    } else {
      this.setState({
        loading: false,
        tableLoading: false,
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        people: newPeople,
        advancedSearch: true,
      });
    }
    return false;
  }

  clearSearch() {
    return new Promise((resolve) => {
      this.setState({
        searchInput: '',
      });
      this.updateStorePagination({ searchInput: '' });
      resolve(true);
    }).then(() => {
      this.load();
    });
  }

  async classpieceSearch(e) {
    e.preventDefault();
    const { resourcesTypes } = this.props;
    const { classpieceSearchInput } = this.state;
    let classpieceType = '';
    if (resourcesTypes.length > 0) {
      classpieceType = resourcesTypes.find((t) => t.labelId === 'Classpiece')
        ._id;
    }
    if (classpieceSearchInput < 2) {
      return false;
    }
    const params = {
      page: 1,
      limit: 25,
      label: classpieceSearchInput,
      systemType: classpieceType,
    };
    const url = `${APIPath}resources`;
    const responseData = await axios({
      method: 'get',
      url,
      crossDomain: true,
      params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      const items = responseData.data.data.map((item) => {
        let thumbnailImage = (
          <img
            src={defaultThumbnail}
            alt={item.label}
            className="person-default-thumbnail"
          />
        );
        const thumbnailPath = getResourceThumbnailURL(item);
        if (thumbnailPath !== null) {
          thumbnailImage = <img src={thumbnailPath} alt={item.label} />;
        }
        return (
          <div
            className="classpiece-result"
            key={item._id}
            onClick={() => this.selectClasspiece(item._id)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select classpiece"
          >
            {thumbnailImage} <Label>{item.label}</Label>
          </div>
        );
      });
      this.setState({
        classpieceItems: items,
      });
    }
    return false;
  }

  selectClasspiece(classpieceId) {
    return new Promise((resolve) => {
      this.setState({
        classpieceId,
      });
      resolve(true);
    }).then(() => {
      this.load();
    });
  }

  classpieceClearSearch() {
    return new Promise((resolve) => {
      this.setState({
        classpieceSearchInput: '',
        classpieceItems: [],
        classpieceId: null,
      });
      resolve(true);
    }).then(() => {
      this.load();
    });
  }

  clearAdvancedSearch() {
    return new Promise((resolve) => {
      this.setState({
        advancedSearchInputs: [],
        advancedSearch: false,
      });
      this.updateStorePagination({ advancedSearchInputs: [] });
      resolve(true);
    }).then(() => {
      this.load();
    });
  }

  updateAdvancedSearchInputs(advancedSearchInputs) {
    this.setState({
      advancedSearchInputs,
    });
  }

  updateOrdering(orderField = '') {
    const {
      orderField: stateOrderField,
      orderDesc: stateOrderDesc,
    } = this.state;
    let orderDesc = false;
    if (orderField === stateOrderField) {
      orderDesc = !stateOrderDesc;
    }
    this.updateStorePagination({ orderField, orderDesc });
    this.setState(
      {
        orderField,
        orderDesc,
      },
      () => {
        this.load();
      }
    );
  }

  updatePage(value) {
    const { page } = this.state;
    if (value > 0 && value !== page) {
      this.updateStorePagination({ page: value });
      this.setState(
        {
          page: value,
          gotoPage: value,
        },
        () => {
          this.load();
        }
      );
    }
  }

  updateStorePagination({
    limit = null,
    page = null,
    activeType = null,
    orderField = '',
    orderDesc = false,
    status = null,
    searchInput = '',
    advancedSearchInputs = [],
  }) {
    const {
      limit: stateLimit,
      page: statePage,
      activeType: stateActiveType,
      orderField: stateOrderField,
      orderDesc: stateOrderDesc,
      status: stateStatus,
      searchInput: stateSearchInput,
      advancedSearchInputs: stateAdvancedSearchInputs,
    } = this.state;
    let limitCopy = limit;
    let pageCopy = page;
    let activeTypeCopy = activeType;
    let orderFieldCopy = orderField;
    let orderDescCopy = orderDesc;
    let statusCopy = status;
    let searchInputCopy = searchInput;
    let advancedSearchInputsCopy = stateAdvancedSearchInputs;
    if (limit === null) {
      limitCopy = stateLimit;
    }
    if (page === null) {
      pageCopy = statePage;
    }
    if (activeType === null) {
      activeTypeCopy = stateActiveType;
    }
    if (orderField === '') {
      orderFieldCopy = stateOrderField;
    }
    if (orderDesc === false) {
      orderDescCopy = stateOrderDesc;
    }
    if (status === null) {
      statusCopy = stateStatus;
    }
    if (searchInput === null) {
      searchInputCopy = stateSearchInput;
    }
    if (advancedSearchInputs.length === 0) {
      advancedSearchInputsCopy = stateAdvancedSearchInputs;
    }
    const payload = {
      limit: limitCopy,
      page: pageCopy,
      activeType: activeTypeCopy,
      orderField: orderFieldCopy,
      orderDesc: orderDescCopy,
      status: statusCopy,
      searchInput: searchInputCopy,
      advancedSearchInputs: advancedSearchInputsCopy,
    };
    const { setPaginationParams: setPaginationParamsFn } = this.props;
    setPaginationParamsFn('people', payload);
  }

  gotoPage(e) {
    e.preventDefault();
    const { page } = this.state;
    let { gotoPage } = this.state;
    gotoPage = parseInt(gotoPage, 10);
    if (gotoPage > 0 && gotoPage !== page) {
      this.updateStorePagination({ page: gotoPage });
      this.setState(
        {
          page: gotoPage,
        },
        () => {
          this.load();
        }
      );
    }
  }

  updateLimit(limit) {
    this.updateStorePagination({ limit });
    this.setState(
      {
        limit,
      },
      () => {
        this.load();
      }
    );
  }

  peopleTableRows() {
    const { people, page, limit } = this.state;
    const rows = [];
    for (let i = 0; i < people.length; i += 1) {
      const person = people[i];
      const countPage = parseInt(page, 10) - 1;
      const count = i + 1 + countPage * limit;
      let label = person.firstName;
      if (person.lastName !== '') {
        label += ` ${person.lastName}`;
      }
      let thumbnailImage = (
        <img
          src={defaultThumbnail}
          alt={label}
          className="person-default-thumbnail"
        />
      );
      const thumbnailURL = getThumbnailURL(person);
      if (thumbnailURL !== null) {
        thumbnailImage = (
          <img
            src={thumbnailURL}
            className="people-list-thumbnail img-fluid img-thumbnail"
            alt={label}
          />
        );
      }
      let affiliation = null;
      let organisation = '';
      if (
        person.affiliations.length > 0 &&
        typeof person.affiliations[0].ref !== 'undefined'
      ) {
        affiliation = person.affiliations[0].ref;
        organisation = (
          <Link
            href={`/organisation/${affiliation._id}`}
            to={`/organisation/${affiliation._id}`}
          >
            {affiliation.label}
          </Link>
        );
      }
      const createdAt = (
        <div>
          <small>{person.createdAt.split('T')[0]}</small>
          <br />
          <small>{person.createdAt.split('T')[1]}</small>
        </div>
      );
      const updatedAt = (
        <div>
          <small>{person.updatedAt.split('T')[0]}</small>
          <br />
          <small>{person.updatedAt.split('T')[1]}</small>
        </div>
      );
      const row = (
        <tr key={i}>
          <td>
            <div className="select-checkbox-container">
              <input
                type="checkbox"
                value={i}
                checked={person.checked}
                onChange={() => false}
              />
              <span
                className="select-checkbox"
                onClick={() => this.toggleSelected(i)}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle selected"
              />
            </div>
          </td>
          <td>{count}</td>
          <td>
            <Link href={`/person/${person._id}`} to={`/person/${person._id}`}>
              {thumbnailImage}
            </Link>
          </td>
          <td>
            <Link href={`/person/${person._id}`} to={`/person/${person._id}`}>
              {person.firstName}
            </Link>
          </td>
          <td>
            <Link href={`/person/${person._id}`} to={`/person/${person._id}`}>
              {person.lastName}
            </Link>
          </td>
          <td>{organisation}</td>
          <td>{createdAt}</td>
          <td>{updatedAt}</td>
          <td>
            <Link
              href={`/person/${person._id}`}
              to={`/person/${person._id}`}
              className="edit-item"
            >
              <i className="fa fa-pencil" />
            </Link>
          </td>
        </tr>
      );
      rows.push(row);
    }
    return rows;
  }

  toggleSelected(i) {
    const { people } = this.state;
    const newPersonChecked = !people[i].checked;
    people[i].checked = newPersonChecked;
    this.setState({
      people,
    });
  }

  toggleSelectedAll() {
    const { allChecked: stateAllChecked, people } = this.state;
    const allChecked = !stateAllChecked;
    const newPeople = [];
    for (let i = 0; i < people.length; i += 1) {
      const person = people[i];
      person.checked = allChecked;
      newPeople.push(person);
    }
    this.setState({
      people: newPeople,
      allChecked,
    });
  }

  async deleteSelected() {
    const { people } = this.state;
    const selectedPeople = people
      .filter((item) => item.checked)
      .map((item) => item._id);
    const data = {
      _ids: selectedPeople,
    };
    const url = `${APIPath}people`;
    const responseData = await axios({
      method: 'delete',
      url,
      crossDomain: true,
      data,
    })
      .then(() => true)
      .catch((error) => {
        console.log(error);
      });
    if (responseData) {
      this.setState({
        allChecked: false,
      });
      this.load();
    }
  }

  removeSelected(_id = null) {
    if (_id == null) {
      return false;
    }
    const { people } = this.state;
    const newPeople = people.map((item) => {
      const itemCopy = item;
      if (itemCopy._id === _id) {
        itemCopy.checked = false;
      }
      return itemCopy;
    });
    this.setState({
      people: newPeople,
    });
    return false;
  }

  render() {
    const {
      page,
      gotoPage,
      totalPages,
      limit,
      loading,
      tableLoading,
      allChecked: stateAllChecked,
      orderField,
      orderDesc,
      status,
      searchInput,
      totalItems,
      people,
      classpieceSearchInput,
      classpieceItems,
    } = this.state;
    const { personTypes } = this.props;
    const heading = 'People';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-users', active: true, path: '' },
    ];
    const searchElements = [
      { element: 'firstName', label: 'First name' },
      { element: 'lastName', label: 'Last name' },
      { element: 'fnameSoundex', label: 'First name soundex' },
      { element: 'lnameSoundex', label: 'Last name soundex' },
      { element: 'description', label: 'Description' },
    ];
    const pageActions = (
      <PageActions
        advancedSearch={this.advancedSearch}
        classpieceClearSearch={this.classpieceClearSearch}
        classpieceItems={classpieceItems}
        classpieceSearch={this.classpieceSearch}
        classpieceSearchInput={classpieceSearchInput}
        clearAdvancedSearch={this.clearAdvancedSearch}
        clearSearch={this.clearSearch}
        current_page={page}
        gotoPage={this.gotoPage}
        gotoPageValue={gotoPage}
        handleChange={this.handleChange}
        limit={limit}
        pageType="people"
        searchElements={searchElements}
        searchInput={searchInput}
        setActiveType={this.setActiveType}
        setStatus={this.setStatus}
        status={status}
        simpleSearch={this.simpleSearch}
        total_pages={totalPages}
        types={personTypes}
        updateLimit={this.updateLimit}
        updatePage={this.updatePage}
        updateAdvancedSearchInputs={this.updateAdvancedSearchInputs}
      />
    );

    let content = (
      <div>
        {pageActions}
        <div className="row">
          <div className="col-12">
            <div style={{ padding: '40pt', textAlign: 'center' }}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>
        {pageActions}
      </div>
    );
    if (!loading) {
      const addNewBtn = (
        <Link
          className="btn btn-outline-secondary add-new-item-btn"
          to="/person/new"
          href="/person/new"
        >
          <i className="fa fa-plus" />
        </Link>
      );

      const tableLoadingSpinner = (
        <tr>
          <td colSpan={8}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </td>
        </tr>
      );
      let peopleRows = [];
      if (tableLoading) {
        peopleRows = tableLoadingSpinner;
      } else {
        peopleRows = this.peopleTableRows();
      }
      const allChecked = stateAllChecked ? 'checked' : '';

      const selectedPeople = people.filter((item) => item.checked);

      const batchActions = (
        <BatchActions
          items={selectedPeople}
          removeSelected={this.removeSelected}
          type="Person"
          relationProperties={[]}
          deleteSelected={this.deleteSelected}
          selectAll={this.toggleSelectedAll}
          allChecked={stateAllChecked}
        />
      );

      // ordering
      let firstNameOrderIcon = [];
      let lastNameOrderIcon = [];
      let createdOrderIcon = [];
      let updatedOrderIcon = [];
      if (orderField === 'firstName' || orderField === '') {
        if (orderDesc) {
          firstNameOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          firstNameOrderIcon = <i className="fa fa-caret-up" />;
        }
      }
      if (orderField === 'lastName') {
        if (orderDesc) {
          lastNameOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          lastNameOrderIcon = <i className="fa fa-caret-up" />;
        }
      }
      if (orderField === 'createdAt') {
        if (orderDesc) {
          createdOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          createdOrderIcon = <i className="fa fa-caret-up" />;
        }
      }
      if (orderField === 'updatedAt') {
        if (orderDesc) {
          updatedOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          updatedOrderIcon = <i className="fa fa-caret-up" />;
        }
      }

      content = (
        <div className="people-container">
          {pageActions}
          <div className="row">
            <div className="col-12">
              <Card>
                <CardBody className="people-card">
                  <div className="pull-right">{batchActions}</div>
                  <Table hover className="people-table">
                    <thead>
                      <tr>
                        <th style={{ width: '30px' }}>
                          <div className="select-checkbox-container default">
                            <input
                              type="checkbox"
                              checked={allChecked}
                              onChange={() => false}
                            />
                            <span
                              className="select-checkbox"
                              onClick={this.toggleSelectedAll}
                              onKeyDown={() => false}
                              role="button"
                              tabIndex={0}
                              aria-label="toggle select all"
                            />
                          </div>
                        </th>
                        <th style={{ width: '40px' }}>#</th>
                        <th>Thumbnail</th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('firstName')}
                        >
                          First Name {firstNameOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('lastName')}
                        >
                          Last Name {lastNameOrderIcon}
                        </th>
                        <th>Organisation</th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('createdAt')}
                        >
                          Created {createdOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('updatedAt')}
                        >
                          Updated {updatedOrderIcon}
                        </th>
                        <th style={{ width: '30px' }} aria-label="edit" />
                      </tr>
                    </thead>
                    <tbody>{peopleRows}</tbody>
                    <tfoot>
                      <tr>
                        <th>
                          <div className="select-checkbox-container default">
                            <input
                              type="checkbox"
                              checked={allChecked}
                              onChange={() => false}
                            />
                            <span
                              className="select-checkbox"
                              onClick={this.toggleSelectedAll}
                              onKeyDown={() => false}
                              role="button"
                              tabIndex={0}
                              aria-label="toggle select all"
                            />
                          </div>
                        </th>
                        <th>#</th>
                        <th>Thumbnail</th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('firstName')}
                        >
                          First Name {firstNameOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('lastName')}
                        >
                          Last Name {lastNameOrderIcon}
                        </th>
                        <th>Organisation</th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('createdAt')}
                        >
                          Created {createdOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('updatedAt')}
                        >
                          Updated {updatedOrderIcon}
                        </th>
                        <th aria-label="edit" />
                      </tr>
                    </tfoot>
                  </Table>
                  <div className="pull-right">{batchActions}</div>
                </CardBody>
              </Card>
            </div>
          </div>
          {pageActions}
          {addNewBtn}
        </div>
      );
    }

    return (
      <div>
        <Breadcrumbs items={breadcrumbsItems} />
        <div className="row">
          <div className="col-12">
            <h2>
              {heading} <small>({totalItems})</small>
            </h2>
          </div>
        </div>
        {content}
      </div>
    );
  }
}

People.defaultProps = {
  peoplePagination: null,
  resourcesTypes: [],
  personTypes: [],
  setPaginationParams: () => {},
};
People.propTypes = {
  peoplePagination: PropTypes.object,
  resourcesTypes: PropTypes.array,
  personTypes: PropTypes.array,
  setPaginationParams: PropTypes.func,
};
export default compose(connect(mapStateToProps, mapDispatchToProps))(People);
