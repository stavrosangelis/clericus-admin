import React, { Component } from 'react';
import { Table, Card, CardBody, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Breadcrumbs from '../components/breadcrumbs';

import PageActions from '../components/page-actions';

import { setPaginationParams } from '../redux/actions';

const APIPath = process.env.REACT_APP_APIPATH;
const mapStateToProps = (state) => ({
  articlesPagination: state.articlesPagination,
});

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
  };
}

class Articles extends Component {
  constructor(props) {
    super(props);

    const { articlesPagination } = this.props;
    const {
      activeType,
      orderField,
      orderDesc,
      page,
      limit,
      status,
      searchInput,
    } = articlesPagination;
    this.state = {
      loading: true,
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
      articleCategories: [],
      searchInput,
    };
    this.load = this.load.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.loadTypes = this.loadTypes.bind(this);
    this.setActiveType = this.setActiveType.bind(this);
    this.tableRows = this.tableRows.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleSelectedAll = this.toggleSelectedAll.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);

    // hack to kill load promise on unmount
    this.cancelLoad = false;
  }

  componentDidMount() {
    this.load();
    this.loadTypes();
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
      loading: true,
    });
    const params = {
      page,
      limit,
      categoryName: activeType,
      orderField,
      orderDesc,
      status,
    };
    if (searchInput !== '') {
      params.label = searchInput;
    }
    const url = `${APIPath}articles`;
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
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        items,
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
    this.setState({
      loading: true,
    });
    const params = {
      page,
      limit,
      categoryName: activeType,
      label: searchInput,
      orderField,
      orderDesc,
      status,
    };
    this.updateStorePagination({ searchInput });
    const url = `${APIPath}articles`;
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
    setPaginationParamsFn('articles', payload);
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

  async loadTypes() {
    const url = `${APIPath}article-categories`;
    const articleCategories = await axios({
      method: 'get',
      url,
      crossDomain: true,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    this.setState({
      articleCategories,
    });
  }

  tableRows() {
    const { items, page, limit } = this.state;
    const rows = items.map((item, i) => {
      const countPage = parseInt(page, 10) - 1;
      const count = i + 1 + countPage * limit;
      let icon = <i className="pe-7s-close-circle" />;
      if (item.status === 'public') {
        icon = <i className="pe-7s-check" />;
      }
      const key = `a${i}`;
      const row = (
        <tr key={key}>
          <td>
            <div className="select-checkbox-container">
              <input
                type="checkbox"
                value={i}
                checked={item.checked}
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
            <Link href={`/article/${item._id}`} to={`/article/${item._id}`}>
              {item.label}
            </Link>
          </td>
          <td className="text-center">{icon}</td>
          <td>
            <Link
              href={`/article/${item._id}`}
              to={`/article/${item._id}`}
              className="edit-item"
            >
              <i className="fa fa-pencil" />
            </Link>
          </td>
        </tr>
      );
      return row;
    });
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

  render() {
    const {
      page,
      gotoPage,
      totalPages,
      articleCategories,
      limit,
      activeType,
      loading,
      tableLoading,
      allChecked: stateAllChecked,
      orderField,
      orderDesc,
      status,
      searchInput,
      totalItems,
    } = this.state;
    const heading = 'Articles';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-news-paper', active: true, path: '' },
    ];

    const pageActions = (
      <PageActions
        activeType={activeType}
        clearSearch={this.clearSearch}
        current_page={page}
        gotoPage={this.gotoPage}
        gotoPageValue={gotoPage}
        handleChange={this.handleChange}
        limit={limit}
        pageType="articles"
        searchInput={searchInput}
        setActiveType={this.setActiveType}
        setStatus={this.setStatus}
        status={status}
        simpleSearch={this.simpleSearch}
        total_pages={totalPages}
        types={articleCategories}
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
          to="/article/new"
          href="/article/new"
        >
          <i className="fa fa-plus" />
        </Link>
      );

      const tableLoadingSpinner = (
        <tr>
          <td colSpan={6}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </td>
        </tr>
      );
      let itemsRows = [];
      if (tableLoading) {
        itemsRows = tableLoadingSpinner;
      } else {
        itemsRows = this.tableRows();
      }
      let allChecked = '';
      if (stateAllChecked) {
        allChecked = 'checked';
      }

      /* let selectedItems = this.state.items.filter(item=>{
          return item.checked;
      }); */

      // ordering
      let labelOrderIcon = [];
      let labelPublishedIcon = [];
      if (orderField === 'label' || orderField === '') {
        if (orderDesc) {
          labelOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          labelOrderIcon = <i className="fa fa-caret-up" />;
        }
      }
      if (orderField === 'status') {
        if (orderDesc) {
          labelPublishedIcon = <i className="fa fa-caret-down" />;
        } else {
          labelPublishedIcon = <i className="fa fa-caret-up" />;
        }
      }

      content = (
        <div className="people-container">
          {pageActions}
          <div className="row">
            <div className="col-12">
              <Card>
                <CardBody className="people-card">
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
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('label')}
                        >
                          Label {labelOrderIcon}
                        </th>
                        <th
                          style={{ width: '100px' }}
                          className="ordering-label"
                          onClick={() => this.updateOrdering('status')}
                        >
                          Published {labelPublishedIcon}
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
                          onClick={() => this.updateOrdering('published')}
                        >
                          Published {labelPublishedIcon}
                        </th>
                        <th aria-label="edit" />
                      </tr>
                    </tfoot>
                  </Table>
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

Articles.defaultProps = {
  articlesPagination: null,
  setPaginationParams: () => {},
};
Articles.propTypes = {
  articlesPagination: PropTypes.object,
  setPaginationParams: PropTypes.func,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(Articles);
