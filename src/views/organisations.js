import React, { Component } from 'react';
import { Table, Card, CardBody, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Breadcrumbs from '../components/breadcrumbs';
import PageActions from '../components/page-actions';
import { getThumbnailURL } from '../helpers';
import BatchActions from '../components/add-batch-relations';

import { setPaginationParams } from '../redux/actions';

const APIPath = process.env.REACT_APP_APIPATH;

const mapStateToProps = (state) => ({
  organisationsPagination: state.organisationsPagination,
  organisationTypes: state.organisationTypes,
});

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
  };
}

class Organisations extends Component {
  constructor(props) {
    super(props);

    const { organisationsPagination } = this.props;
    const {
      activeType,
      orderField,
      orderDesc,
      page,
      limit,
      status,
      searchInput,
    } = organisationsPagination;
    this.state = {
      loading: true,
      tableLoading: true,
      organisations: [],
      activeType,
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
    };
    this.load = this.load.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setActiveType = this.setActiveType.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.organisationsTableRows = this.organisationsTableRows.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleSelectedAll = this.toggleSelectedAll.bind(this);
    this.deleteSelected = this.deleteSelected.bind(this);
    this.removeSelected = this.removeSelected.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);

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
      searchInput,
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
    if (searchInput !== '') {
      params.label = searchInput;
    }
    const url = `${APIPath}organisations`;
    if (activeType !== null) {
      params.organisationType = activeType;
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
    const organisations = responseData.data.map((organisation) => {
      const organisationCopy = organisation;
      organisationCopy.checked = false;
      return organisationCopy;
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
        organisations,
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
    const url = `${APIPath}organisations`;
    if (activeType !== null) {
      params.organisationType = activeType;
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
    const organisations = responseData.data.map((organisation) => {
      const organisationCopy = organisation;
      organisationCopy.checked = false;
      return organisationCopy;
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
        organisations,
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
  }) {
    const {
      limit: stateLimit,
      page: statePage,
      activeType: stateActiveType,
      orderField: stateOrderField,
      orderDesc: stateOrderDesc,
      status: stateStatus,
      searchInput: stateSearchInput,
    } = this.state;
    let limitCopy = limit;
    let pageCopy = page;
    let activeTypeCopy = activeType;
    let orderFieldCopy = orderField;
    let orderDescCopy = orderDesc;
    let statusCopy = status;
    let searchInputCopy = searchInput;
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
    const payload = {
      limit: limitCopy,
      page: pageCopy,
      activeType: activeTypeCopy,
      orderField: orderFieldCopy,
      orderDesc: orderDescCopy,
      status: statusCopy,
      searchInput: searchInputCopy,
    };
    const { setPaginationParams: setPaginationParamsFn } = this.props;
    setPaginationParamsFn('organisations', payload);
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

  organisationsTableRows() {
    const { organisations, page, limit } = this.state;
    const rows = [];
    for (let i = 0; i < organisations.length; i += 1) {
      const organisation = organisations[i];
      const countPage = parseInt(page, 10) - 1;
      const count = i + 1 + countPage * limit;
      const { label } = organisation;
      let thumbnailImage = [];
      const thumbnailURL = getThumbnailURL(organisation);
      if (thumbnailURL !== null) {
        thumbnailImage = (
          <img
            src={thumbnailURL}
            className="organisations-list-thumbnail img-fluid img-thumbnail"
            alt={label}
          />
        );
      }
      const createdAt = (
        <div>
          <small>{organisation.createdAt.split('T')[0]}</small>
          <br />
          <small>{organisation.createdAt.split('T')[1]}</small>
        </div>
      );
      const updatedAt = (
        <div>
          <small>{organisation.updatedAt.split('T')[0]}</small>
          <br />
          <small>{organisation.updatedAt.split('T')[1]}</small>
        </div>
      );
      const row = (
        <tr key={organisation._id}>
          <td>
            <div className="select-checkbox-container">
              <input
                type="checkbox"
                value={i}
                checked={organisations[i].checked}
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
            <Link
              href={`/organisation/${organisation._id}`}
              to={`/organisation/${organisation._id}`}
            >
              {thumbnailImage}
            </Link>
          </td>
          <td>
            <Link
              href={`/organisation/${organisation._id}`}
              to={`/organisation/${organisation._id}`}
            >
              {organisation.label}
            </Link>
          </td>
          <td>{organisation.organisationType}</td>
          <td>{createdAt}</td>
          <td>{updatedAt}</td>
          <td>
            <Link
              href={`/organisation/${organisation._id}`}
              to={`/organisation/${organisation._id}`}
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
    const { organisations } = this.state;
    const newPersonChecked = !organisations[i].checked;
    organisations[i].checked = newPersonChecked;
    this.setState({
      organisations,
    });
  }

  toggleSelectedAll() {
    const { allChecked: stateAllChecked, organisations } = this.state;
    const allChecked = !stateAllChecked;
    const newOrganisations = organisations.map((organisation) => {
      const organisationCopy = organisation;
      organisationCopy.checked = allChecked;
      return organisationCopy;
    });
    this.setState({
      organisations: newOrganisations,
      allChecked,
    });
  }

  async deleteSelected() {
    const { organisations } = this.state;
    const selectedOrganisations = organisations
      .filter((item) => item.checked)
      .map((item) => item._id);
    const data = {
      _ids: selectedOrganisations,
    };
    const url = `${APIPath}organisations`;
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
    const { organisations } = this.state;
    const newOrganisations = organisations.map((item) => {
      const itemCopy = item;
      if (itemCopy._id === _id) {
        itemCopy.checked = false;
      }
      return item;
    });
    this.setState({
      organisations: newOrganisations,
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
      organisations,
      activeType,
    } = this.state;
    const { organisationTypes } = this.props;
    const heading = 'Organisations';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-culture', active: true, path: '' },
    ];

    const pageActions = (
      <PageActions
        activeType={activeType}
        clearSearch={this.clearSearch}
        current_page={page}
        gotoPageValue={gotoPage}
        gotoPage={this.gotoPage}
        handleChange={this.handleChange}
        limit={limit}
        pageType="organisations"
        searchInput={searchInput}
        setActiveType={this.setActiveType}
        setStatus={this.setStatus}
        status={status}
        simpleSearch={this.simpleSearch}
        total_pages={totalPages}
        types={organisationTypes}
        updateLimit={this.updateLimit}
        updatePage={this.updatePage}
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
          to="/organisation/new"
          href="/organisation/new"
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
      let organisationsRows = [];
      if (tableLoading) {
        organisationsRows = tableLoadingSpinner;
      } else {
        organisationsRows = this.organisationsTableRows();
      }
      const allChecked = stateAllChecked ? 'checked' : '';
      const selectedOrganisations = organisations.filter(
        (item) => item.checked
      );

      const batchActions = (
        <BatchActions
          items={selectedOrganisations}
          removeSelected={this.removeSelected}
          type="Organisation"
          relationProperties={[]}
          deleteSelected={this.deleteSelected}
          selectAll={this.toggleSelectedAll}
          allChecked={stateAllChecked}
        />
      );

      // ordering
      let labelOrderIcon = [];
      let typeOrderIcon = [];
      let createdOrderIcon = [];
      let updatedOrderIcon = [];
      if (orderField === 'label' || orderField === '') {
        if (orderDesc) {
          labelOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          labelOrderIcon = <i className="fa fa-caret-up" />;
        }
      }
      if (orderField === 'organisationType') {
        if (orderDesc) {
          typeOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          typeOrderIcon = <i className="fa fa-caret-up" />;
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
        <div className="organisations-container">
          {pageActions}
          <div className="row">
            <div className="col-12">
              <Card>
                <CardBody>
                  <div className="pull-right">{batchActions}</div>
                  <Table hover>
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
                          onClick={() => this.updateOrdering('label')}
                        >
                          Label {labelOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() =>
                            this.updateOrdering('organisationType')
                          }
                        >
                          Type {typeOrderIcon}
                        </th>
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
                    <tbody>{organisationsRows}</tbody>
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
                          onClick={() => this.updateOrdering('label')}
                        >
                          Label {labelOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() =>
                            this.updateOrdering('organisationType')
                          }
                        >
                          Type {typeOrderIcon}
                        </th>
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

Organisations.defaultProps = {
  organisationsPagination: null,
  organisationTypes: [],
  setPaginationParams: () => {},
};
Organisations.propTypes = {
  organisationsPagination: PropTypes.object,
  organisationTypes: PropTypes.array,
  setPaginationParams: PropTypes.func,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  Organisations
);
