import React, { Component } from 'react';
import { Table, Card, CardBody, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Breadcrumbs from '../components/breadcrumbs';
import PageActions from '../components/page-actions';
import BatchActions from '../components/add-batch-relations';

import { setPaginationParams } from '../redux/actions';

const APIPath = process.env.REACT_APP_APIPATH;
const mapStateToProps = (state) => ({
  eventsPagination: state.eventsPagination,
  eventTypes: state.eventTypes,
});

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
  };
}

class Events extends Component {
  constructor(props) {
    super(props);

    const { eventsPagination } = this.props;
    const {
      activeType,
      orderField,
      orderDesc,
      page,
      limit,
      status,
      searchInput,
    } = eventsPagination;

    this.state = {
      loading: true,
      tableLoading: true,
      items: [],
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
    this.setStatus = this.setStatus.bind(this);
    this.setActiveType = this.setActiveType.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.itemsTableRows = this.itemsTableRows.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleSelectedAll = this.toggleSelectedAll.bind(this);
    this.deleteSelected = this.deleteSelected.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.removeSelected = this.removeSelected.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.findEventType = this.findEventType.bind(this);
    this.findEventTypeRec = this.findEventTypeRec.bind(this);
    this.findEventTypeById = this.findEventTypeById.bind(this);
    this.findEventTypeByIdRec = this.findEventTypeByIdRec.bind(this);

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
    const url = `${APIPath}events`;
    if (activeType !== null) {
      const eventType = this.findEventType();
      if (eventType !== null) {
        params.eventType = eventType._id;
      }
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
    const items = responseData.data.map((item) => {
      const itemCopy = item;
      itemCopy.checked = false;
      return itemCopy;
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
        items,
      });
    }
    return false;
  }

  findEventType() {
    const { activeType: type } = this.state;
    const { eventTypes } = this.props;
    const eventType = this.findEventTypeRec(type, eventTypes);
    return eventType;
  }

  findEventTypeRec(type, types) {
    let eventType = types.find((t) => t.label === type) || null;
    if (eventType === null) {
      for (let c = 0; c < types.length; c += 1) {
        const { children } = types[c];
        eventType = this.findEventTypeRec(type, children);
        if (eventType !== null) {
          break;
        }
      }
    }
    return eventType;
  }

  findEventTypeById(_id = null) {
    if (_id === null) {
      return null;
    }
    const { eventTypes } = this.props;
    const eventType = this.findEventTypeByIdRec(_id, eventTypes);
    return eventType;
  }

  findEventTypeByIdRec(_id, types) {
    let eventType = types.find((t) => t._id === _id) || null;
    if (eventType === null) {
      for (let c = 0; c < types.length; c += 1) {
        const { children } = types[c];
        eventType = this.findEventTypeByIdRec(_id, children);
        if (eventType !== null) {
          break;
        }
      }
    }
    return eventType;
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
    const url = `${APIPath}events`;
    if (activeType !== null) {
      const eventType = this.findEventType();
      if (eventType !== null) {
        params.eventType = eventType._id;
      }
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
    const items = responseData.data.map((item) => {
      const itemCopy = item;
      itemCopy.checked = false;
      return itemCopy;
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
        items,
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
    setPaginationParamsFn('events', payload);
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

  itemsTableRows() {
    const { items, page, limit } = this.state;
    const rows = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const countPage = parseInt(page, 10) - 1;
      const count = i + 1 + countPage * limit;
      const { label } = item;
      const findEventType = this.findEventTypeById(item.eventType);
      let eventType = '';
      if (findEventType !== null) {
        eventType = findEventType.label;
      }
      let temporal = [];
      if (item.temporal.length > 0) {
        const temporalData = item.temporal[0].ref;
        temporal = temporalData.label;
      }
      let spatial = [];
      if (item.spatial.length > 0) {
        const spatialData = item.spatial[0].ref;
        spatial = spatialData.label;
      }
      const createdAt = (
        <div>
          <small>{item.createdAt.split('T')[0]}</small>
          <br />
          <small>{item.createdAt.split('T')[1]}</small>
        </div>
      );
      const updatedAt = (
        <div>
          <small>{item.updatedAt.split('T')[0]}</small>
          <br />
          <small>{item.updatedAt.split('T')[1]}</small>
        </div>
      );
      const row = (
        <tr key={i}>
          <td>
            <div className="select-checkbox-container">
              <input
                type="checkbox"
                value={i}
                checked={items[i].checked}
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
            <Link href={`/event/${item._id}`} to={`/event/${item._id}`}>
              {label}
            </Link>
          </td>
          <td>
            <Link href={`/event/${item._id}`} to={`/event/${item._id}`}>
              {eventType}
            </Link>
          </td>
          <td>{temporal}</td>
          <td>{spatial}</td>
          <td>{createdAt}</td>
          <td>{updatedAt}</td>
          <td>
            <Link
              href={`/event/${item._id}`}
              to={`/event/${item._id}`}
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
    const { items } = this.state;
    const newPersonChecked = !items[i].checked;
    items[i].checked = newPersonChecked;
    this.setState({
      items,
    });
  }

  toggleSelectedAll() {
    const { allChecked: stateAllChecked, items } = this.state;
    const allChecked = !stateAllChecked;
    const newItems = items.map((item) => {
      const itemCopy = item;
      itemCopy.checked = allChecked;
      return itemCopy;
    });
    this.setState({
      items: newItems,
      allChecked,
    });
  }

  async deleteSelected() {
    const { items } = this.state;
    const selectedEvents = items
      .filter((item) => item.checked)
      .map((item) => item._id);
    const data = {
      _ids: selectedEvents,
    };
    const url = `${APIPath}events`;
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
    const { items } = this.state;
    const newEvents = items.map((item) => {
      const itemCopy = item;
      if (itemCopy._id === _id) {
        itemCopy.checked = false;
      }
      return itemCopy;
    });
    this.setState({
      items: newEvents,
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
      items,
    } = this.state;
    const { eventTypes } = this.props;
    const heading = 'Events';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-date', active: true, path: '' },
    ];
    const pageActions = (
      <PageActions
        clearSearch={this.clearSearch}
        current_page={page}
        gotoPage={this.gotoPage}
        gotoPageValue={gotoPage}
        handleChange={this.handleChange}
        limit={limit}
        pageType="events"
        searchInput={searchInput}
        setActiveType={this.setActiveType}
        setStatus={this.setStatus}
        status={status}
        simpleSearch={this.simpleSearch}
        total_pages={totalPages}
        types={eventTypes}
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
          to="/event/new"
          href="/event/new"
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
      let itemsRows = [];
      if (tableLoading) {
        itemsRows = tableLoadingSpinner;
      } else {
        itemsRows = this.itemsTableRows();
      }
      let allChecked = '';
      if (stateAllChecked) {
        allChecked = 'checked';
      }

      const selectedEvents = items.filter((item) => item.checked);

      const batchActions = (
        <BatchActions
          items={selectedEvents}
          removeSelected={this.removeSelected}
          type="Event"
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
      if (orderField === 'eventType') {
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
        <div className="items-container">
          {pageActions}
          <div className="row">
            <div className="col-12">
              <Card>
                <CardBody className="table-container">
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
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('label')}
                        >
                          Label {labelOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('eventType')}
                        >
                          Type {typeOrderIcon}
                        </th>
                        <th>Temporal</th>
                        <th>Spatial</th>
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
                    <tbody>{itemsRows}</tbody>
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
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('label')}
                        >
                          Label {labelOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('eventType')}
                        >
                          Type {typeOrderIcon}
                        </th>
                        <th>Temporal</th>
                        <th>Spatial</th>
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

Events.defaultProps = {
  eventsPagination: null,
  eventTypes: [],
  setPaginationParams: () => {},
};
Events.propTypes = {
  eventsPagination: PropTypes.object,
  eventTypes: PropTypes.array,
  setPaginationParams: PropTypes.func,
};
export default compose(connect(mapStateToProps, mapDispatchToProps))(Events);
