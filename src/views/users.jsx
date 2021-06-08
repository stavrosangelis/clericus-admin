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
  usersPagination: state.usersPagination,
});

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
  };
}

class Users extends Component {
  constructor(props) {
    super(props);

    const { usersPagination } = this.props;
    const { orderField, orderDesc, page, limit } = usersPagination;

    this.state = {
      loading: true,
      tableLoading: true,
      users: [],
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
    this.usersTableRows = this.usersTableRows.bind(this);
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
    const url = `${APIPath}users`;
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
    const users = responseData.data;
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
        users,
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
    setPaginationParamsFn('users', payload);
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

  usersTableRows() {
    const { users, page, limit } = this.state;
    const rows = [];
    for (let i = 0; i < users.length; i += 1) {
      const user = users[i];
      const countPage = parseInt(page, 10) - 1;
      const count = i + 1 + countPage * limit;
      let label = user.firstName;
      if (user.lastName !== '') {
        label += ` ${user.lastName}`;
      }
      const row = (
        <tr key={i}>
          <td>{count}</td>
          <td>
            <Link href={`/user/${user._id}`} to={`/user/${user._id}`}>
              {label}
            </Link>
          </td>
          <td>
            <Link href={`/user/${user._id}`} to={`/user/${user._id}`}>
              {user.email}
            </Link>
          </td>
          <td>
            <Link
              href={`/user/${user._id}`}
              to={`/user/${user._id}`}
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
    const heading = 'Users';
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
        pageType="users"
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
          to="/user/new"
          href="/user/new"
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
      let usersRows = [];
      if (tableLoading) {
        usersRows = tableLoadingSpinner;
      } else {
        usersRows = this.usersTableRows();
      }

      // ordering
      let firstNameOrderIcon = [];
      let emailOrderIcon = [];
      if (orderField === 'firstName' || orderField === '') {
        if (orderDesc) {
          firstNameOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          firstNameOrderIcon = <i className="fa fa-caret-up" />;
        }
      }
      if (orderField === 'email' || orderField === '') {
        if (orderDesc) {
          emailOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          emailOrderIcon = <i className="fa fa-caret-up" />;
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
                          onClick={() => this.updateOrdering('firstName')}
                        >
                          User {firstNameOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('email')}
                        >
                          Email {emailOrderIcon}
                        </th>
                        <th style={{ width: '40px' }} aria-label="edit" />
                      </tr>
                    </thead>
                    <tbody>{usersRows}</tbody>
                    <tfoot>
                      <tr>
                        <th>#</th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('firstName')}
                        >
                          User {firstNameOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('email')}
                        >
                          Email {emailOrderIcon}
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

Users.defaultProps = {
  usersPagination: null,
  setPaginationParams: () => {},
};
Users.propTypes = {
  usersPagination: PropTypes.object,
  setPaginationParams: PropTypes.func,
};
export default compose(connect(mapStateToProps, mapDispatchToProps))(Users);
