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
  spatialsPagination: state.spatialsPagination,
});

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
  };
}

class Spatials extends Component {
  constructor(props) {
    super(props);

    const { spatialsPagination } = this.props;
    const {
      orderField,
      orderDesc,
      page,
      limit,
      searchInput,
    } = spatialsPagination;

    this.state = {
      loading: true,
      tableLoading: true,
      items: [],
      orderField,
      orderDesc,
      page,
      gotoPage: page,
      limit,
      totalPages: 0,
      totalItems: 0,
      allChecked: false,
      searchInput,
    };
    this.load = this.load.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.itemsTableRows = this.itemsTableRows.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleSelectedAll = this.toggleSelectedAll.bind(this);
    this.deleteSelected = this.deleteSelected.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
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

  async load() {
    const { page, limit, orderField, orderDesc, searchInput } = this.state;
    this.setState({
      tableLoading: true,
    });
    const params = {
      page,
      limit,
      orderField,
      orderDesc,
    };
    if (searchInput !== '') {
      params.label = searchInput;
    }
    const url = `${APIPath}spatials`;
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
    const items = responseData.data;
    const newItems = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      item.checked = false;
      newItems.push(item);
    }
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
        items: newItems,
      });
    }
    return false;
  }

  async simpleSearch(e) {
    e.preventDefault();
    const { page, limit, orderField, orderDesc, searchInput } = this.state;
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
      label: searchInput,
      orderField,
      orderDesc,
    };
    const url = `${APIPath}spatials`;
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
    orderField = '',
    orderDesc = false,
    searchInput = '',
  }) {
    const {
      limit: stateLimit,
      page: statePage,
      orderField: stateOrderField,
      orderDesc: stateOrderDesc,
      searchInput: stateSearchInput,
    } = this.state;
    let limitCopy = limit;
    let pageCopy = page;
    let orderFieldCopy = orderField;
    let orderDescCopy = orderDesc;
    let searchInputCopy = searchInput;
    if (limit === null) {
      limitCopy = stateLimit;
    }
    if (page === null) {
      pageCopy = statePage;
    }
    if (orderField === '') {
      orderFieldCopy = stateOrderField;
    }
    if (orderDesc === false) {
      orderDescCopy = stateOrderDesc;
    }
    if (searchInput === '') {
      searchInputCopy = stateSearchInput;
    }
    const payload = {
      limit: limitCopy,
      page: pageCopy,
      orderField: orderFieldCopy,
      orderDesc: orderDescCopy,
      searchInput: searchInputCopy,
    };
    const { setPaginationParams: setPaginationParamsFn } = this.props;
    setPaginationParamsFn('spatials', payload);
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
                onClick={this.toggleSelected.bind(this, i)}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle selected"
              />
            </div>
          </td>
          <td>{count}</td>
          <td>
            <Link href={`/spatial/${item._id}`} to={`/spatial/${item._id}`}>
              {label}
            </Link>
          </td>
          <td>{createdAt}</td>
          <td>{updatedAt}</td>
          <td>
            <Link
              href={`/spatial/${item._id}`}
              to={`/spatial/${item._id}`}
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
    const newItems = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      item.checked = allChecked;
      newItems.push(item);
    }
    this.setState({
      items: newItems,
      allChecked,
    });
  }

  async deleteSelected() {
    const { items } = this.state;
    const selectedSpatials = items
      .filter((item) => item.checked)
      .map((item) => item._id);
    const data = {
      _ids: selectedSpatials,
    };
    const url = `${APIPath}spatials`;
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
    const newSpatials = items.map((item) => {
      const itemCopy = item;
      if (itemCopy._id === _id) {
        itemCopy.checked = false;
      }
      return item;
    });
    this.setState({
      items: newSpatials,
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
      searchInput,
      totalItems,
      items,
    } = this.state;
    const heading = 'Spatials';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-map', active: true, path: '' },
    ];

    const pageActions = (
      <PageActions
        clearSearch={this.clearSearch}
        current_page={page}
        gotoPage={this.gotoPage}
        gotoPageValue={gotoPage}
        handleChange={this.handleChange}
        limit={limit}
        pageType="spatials"
        simpleSearch={this.simpleSearch}
        searchInput={searchInput}
        total_pages={totalPages}
        types={[]}
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
          to="/spatial/new"
          href="/spatial/new"
        >
          <i className="fa fa-plus" />
        </Link>
      );

      const tableLoadingSpinner = (
        <tr>
          <td colSpan={5}>
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
      const allChecked = stateAllChecked ? 'checked' : '';

      const selectedSpatials = items.filter((item) => item.checked);

      const batchActions = (
        <BatchActions
          items={selectedSpatials}
          removeSelected={this.removeSelected}
          type="Spatial"
          relationProperties={[]}
          deleteSelected={this.deleteSelected}
          selectAll={this.toggleSelectedAll}
          allChecked={stateAllChecked}
        />
      );

      // ordering
      let labelOrderIcon = [];
      let createdOrderIcon = [];
      let updatedOrderIcon = [];
      if (orderField === 'label' || orderField === '') {
        if (orderDesc) {
          labelOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          labelOrderIcon = <i className="fa fa-caret-up" />;
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
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('label')}
                        >
                          Label {labelOrderIcon}
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

Spatials.defaultProps = {
  spatialsPagination: null,
  setPaginationParams: () => {},
};
Spatials.propTypes = {
  spatialsPagination: PropTypes.object,
  setPaginationParams: PropTypes.func,
};
export default compose(connect(mapStateToProps, mapDispatchToProps))(Spatials);
