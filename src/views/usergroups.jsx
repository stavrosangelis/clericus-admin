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
  usergroupsPagination: state.usergroupsPagination,
});

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
  };
}

class Usergroups extends Component {
  constructor(props) {
    super(props);

    const { usergroupsPagination } = this.props;
    const { orderField, orderDesc, page, limit } = usergroupsPagination;

    this.state = {
      loading: true,
      tableLoading: true,
      usergroups: [],
      orderField,
      orderDesc,
      page,
      gotoPage: page,
      limit,
      totalPages: 0,
    };
    this.load = this.load.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.usergroupsTableRows = this.usergroupsTableRows.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);

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
    const { page, limit, orderField, orderDesc } = this.state;
    this.setState({
      tableLoading: true,
    });
    const params = {
      page,
      limit,
      orderField,
      orderDesc,
    };
    const url = `${APIPath}user-groups`;
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
    const usergroups = responseData.data;
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
        usergroups,
      });
    }
    return false;
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

  updateStorePagination(
    limit = null,
    page = null,
    orderField = '',
    orderDesc = false
  ) {
    const {
      limit: stateLimit,
      page: statePage,
      orderField: stateOrderField,
      orderDesc: stateOrderDesc,
    } = this.state;
    let limitCopy = limit;
    let pageCopy = page;
    let orderFieldCopy = orderField;
    let orderDescCopy = orderDesc;
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
    const payload = {
      limit: limitCopy,
      page: pageCopy,
      orderField: orderFieldCopy,
      orderDesc: orderDescCopy,
    };
    const { setPaginationParams: setPaginationParamsFn } = this.props;
    setPaginationParamsFn('usergroups', payload);
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

  usergroupsTableRows() {
    const { usergroups, page, limit } = this.state;
    const rows = [];
    for (let i = 0; i < usergroups.length; i += 1) {
      const usergroup = usergroups[i];
      const countPage = parseInt(page, 10) - 1;
      const count = i + 1 + countPage * limit;
      const { label } = usergroup;

      let isAdminIcon = [];
      let isDefaultIcon = [];
      if (usergroup.isAdmin) {
        isAdminIcon = <i className="fa fa-check-circle" />;
      }
      if (usergroup.isDefault) {
        isDefaultIcon = <i className="fa fa-check-circle" />;
      }

      const row = (
        <tr key={i}>
          <td>{count}</td>
          <td>
            <Link
              href={`/user-group/${usergroup._id}`}
              to={`/user-group/${usergroup._id}`}
            >
              {label}
            </Link>
          </td>
          <td className="text-center">{isDefaultIcon}</td>
          <td className="text-center">{isAdminIcon}</td>
          <td>
            <Link
              href={`/user-group/${usergroup._id}`}
              to={`/user-group/${usergroup._id}`}
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

  render() {
    const {
      page,
      gotoPage,
      limit,
      totalPages,
      loading,
      tableLoading,
      orderField,
      orderDesc,
    } = this.state;
    const heading = 'Usergroups';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-user', active: true, path: '' },
    ];

    const pageActions = (
      <PageActions
        current_page={page}
        gotoPage={this.gotoPage}
        gotoPageValue={gotoPage}
        handleChange={this.handleChange}
        limit={limit}
        pageType="usergroups"
        total_pages={totalPages}
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
          to="/user-group/new"
          href="/user-group/new"
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
      let usergroupsRows = [];
      if (tableLoading) {
        usergroupsRows = tableLoadingSpinner;
      } else {
        usergroupsRows = this.usergroupsTableRows();
      }

      // ordering
      let labelOrderIcon = [];
      let isDefaultOrderIcon = [];
      let isAdminOrderIcon = [];
      if (orderField === 'label' || orderField === '') {
        if (orderDesc) {
          labelOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          labelOrderIcon = <i className="fa fa-caret-up" />;
        }
      }
      if (orderField === 'isDefault') {
        if (orderDesc) {
          isDefaultOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          isDefaultOrderIcon = <i className="fa fa-caret-up" />;
        }
      }
      if (orderField === 'isAdmin') {
        if (orderDesc) {
          isAdminOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          isAdminOrderIcon = <i className="fa fa-caret-up" />;
        }
      }

      content = (
        <div className="people-container">
          {pageActions}
          <div className="row">
            <div className="col-12">
              <Card>
                <CardBody>
                  <Table hover>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>#</th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('label')}
                        >
                          Usergroup {labelOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('isDefault')}
                          style={{ width: '80px' }}
                        >
                          Default {isDefaultOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('isAdmin')}
                          style={{ width: '80px' }}
                        >
                          Admin {isAdminOrderIcon}
                        </th>
                        <th style={{ width: '40px' }} aria-label="edit" />
                      </tr>
                    </thead>
                    <tbody>{usergroupsRows}</tbody>
                    <tfoot>
                      <tr>
                        <th>#</th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('label')}
                        >
                          Usergroup {labelOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('isDefault')}
                          style={{ width: '80px' }}
                        >
                          Default {isDefaultOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('isAdmin')}
                          style={{ width: '80px' }}
                        >
                          Admin {isAdminOrderIcon}
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
            <h2>{heading}</h2>
          </div>
        </div>
        {content}
      </div>
    );
  }
}

Usergroups.defaultProps = {
  usergroupsPagination: null,
  setPaginationParams: () => {},
};
Usergroups.propTypes = {
  usergroupsPagination: PropTypes.object,
  setPaginationParams: PropTypes.func,
};
export default compose(connect(mapStateToProps, mapDispatchToProps))(
  Usergroups
);
