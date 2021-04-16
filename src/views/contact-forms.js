import React, { Component } from 'react';
import {
  Table,
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  Spinner,
} from 'reactstrap';

import axios from 'axios';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Breadcrumbs from '../components/breadcrumbs';
import PageActions from '../components/page-actions';
import { setPaginationParams } from '../redux/actions';

const APIPath = process.env.REACT_APP_APIPATH;

const mapStateToProps = (state) => ({
  contactFormsPagination: state.contactFormsPagination,
});

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
  };
}

class ContactForms extends Component {
  constructor(props) {
    super(props);
    const { contactFormsPagination } = this.props;
    const {
      activeType,
      orderField,
      orderDesc,
      page,
      limit,
      searchInput,
    } = contactFormsPagination;
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
      totalPages: 0,
      totalItems: 0,
      searchInput,
      modalVisible: false,
      modalDetails: {
        from: '',
        email: '',
        subject: '',
        html: '',
        createdAt: '',
      },
    };
    this.load = this.load.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.itemsTableRows = this.itemsTableRows.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.loadItem = this.loadItem.bind(this);

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

  toggleModal() {
    const { modalVisible } = this.state;
    this.setState({
      modalVisible: !modalVisible,
    });
  }

  async loadItem(_id) {
    const params = { _id };
    const url = `${APIPath}contact-form`;
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
    this.setState({
      modalVisible: true,
      modalDetails: responseData,
    });
    return false;
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
    if (searchInput < 2) {
      params.email = searchInput;
    }
    const url = `${APIPath}contact-forms`;
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
        items: responseData.data,
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
      orderField,
      orderDesc,
      email: searchInput,
    };
    const url = `${APIPath}contact-forms`;
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
        items: responseData.data,
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
    searchInput = '',
  }) {
    const {
      limit: stateLimit,
      page: statePage,
      activeType: stateActiveType,
      orderField: stateOrderField,
      orderDesc: stateOrderDesc,
      searchInput: stateSearchInput,
    } = this.state;
    let limitCopy = limit;
    let pageCopy = page;
    let activeTypeCopy = activeType;
    let orderFieldCopy = orderField;
    let orderDescCopy = orderDesc;
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
    if (searchInput === null) {
      searchInputCopy = stateSearchInput;
    }
    const payload = {
      limit: limitCopy,
      page: pageCopy,
      activeType: activeTypeCopy,
      orderField: orderFieldCopy,
      orderDesc: orderDescCopy,
      searchInput: searchInputCopy,
    };
    const { setPaginationParams: setPaginationParamsFn } = this.props;
    setPaginationParamsFn('contactForms', payload);
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
      const createdAt = (
        <div>
          <small>{item.createdAt.split('T')[0]}</small>
          <br />
          <small>{item.createdAt.split('T')[1]}</small>
        </div>
      );
      const row = (
        <tr key={i}>
          <td>{count}</td>
          <td>
            <div
              className="link"
              onClick={() => this.loadItem(item._id)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="load item"
            >
              {item.from}
            </div>
          </td>
          <td>
            <div
              className="link"
              onClick={() => this.loadItem(item._id)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="load item"
            >
              {item.email}
            </div>
          </td>
          <td>
            <div
              className="link"
              onClick={() => this.loadItem(item._id)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="load item"
            >
              {item.subject}
            </div>
          </td>
          <td>{createdAt}</td>
          <td>
            <div
              className="link"
              onClick={() => this.loadItem(item._id)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="load item"
            >
              <i className="fa fa-eye" />
            </div>
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
      totalPages,
      modalVisible,
      limit,
      modalDetails,
      loading,
      tableLoading,
      orderField,
      orderDesc,
      searchInput,
      totalItems,
    } = this.state;
    const heading = 'Contact forms';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-mail', active: true, path: '' },
    ];

    const pageActions = (
      <PageActions
        clearSearch={this.clearSearch}
        current_page={page}
        gotoPageValue={gotoPage}
        gotoPage={this.gotoPage}
        handleChange={this.handleChange}
        limit={limit}
        pageType="contact-forms"
        searchInput={searchInput}
        simpleSearch={this.simpleSearch}
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
        itemsRows = this.itemsTableRows();
      }

      // ordering
      let nameOrderIcon = [];
      let emailOrderIcon = [];
      let subjectOrderIcon = [];
      let createdOrderIcon = [];
      if (orderField === 'name') {
        if (orderDesc) {
          nameOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          nameOrderIcon = <i className="fa fa-caret-up" />;
        }
      }
      if (orderField === 'email') {
        if (orderDesc) {
          emailOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          emailOrderIcon = <i className="fa fa-caret-up" />;
        }
      }
      if (orderField === 'subject') {
        if (orderDesc) {
          subjectOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          subjectOrderIcon = <i className="fa fa-caret-up" />;
        }
      }
      if (orderField === 'createdAt' || orderField === '') {
        if (orderDesc) {
          createdOrderIcon = <i className="fa fa-caret-down" />;
        } else {
          createdOrderIcon = <i className="fa fa-caret-up" />;
        }
      }
      const itemModal = (
        <Modal isOpen={modalVisible} toggle={this.toggleModal}>
          <ModalHeader toggle={this.toggleModal}>
            Contact form details
          </ModalHeader>
          <ModalBody style={{ paddingBottom: '50px' }}>
            <div>
              <b>Name</b>
            </div>
            {modalDetails.from}
            <div>
              <b>Email</b>
            </div>
            {modalDetails.email}
            <div>
              <b>Subject</b>
            </div>
            {modalDetails.subject}
            <div>
              <b>Message</b>
            </div>
            {modalDetails.html}
            <div>
              <b>Submitted</b>
            </div>
            {modalDetails.createdAt}
          </ModalBody>
        </Modal>
      );

      content = (
        <div className="organisations-container">
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
                          onClick={() => this.updateOrdering('from')}
                        >
                          From {nameOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('email')}
                        >
                          Email {emailOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('subject')}
                        >
                          Subject {subjectOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('createdAt')}
                        >
                          Submitted {createdOrderIcon}
                        </th>
                        <th style={{ width: '30px' }} aria-label="edit" />
                      </tr>
                    </thead>
                    <tbody>{itemsRows}</tbody>
                    <tfoot>
                      <tr>
                        <th style={{ width: '40px' }}>#</th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('from')}
                        >
                          From {nameOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('email')}
                        >
                          Email {emailOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('subject')}
                        >
                          Subject {subjectOrderIcon}
                        </th>
                        <th
                          className="ordering-label"
                          onClick={() => this.updateOrdering('createdAt')}
                        >
                          Submitted {createdOrderIcon}
                        </th>
                        <th style={{ width: '30px' }} aria-label="edit" />
                      </tr>
                    </tfoot>
                  </Table>
                </CardBody>
              </Card>
            </div>
          </div>
          {pageActions}
          {itemModal}
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

ContactForms.defaultProps = {
  contactFormsPagination: null,
  setPaginationParams: () => {},
};
ContactForms.propTypes = {
  contactFormsPagination: PropTypes.object,
  setPaginationParams: PropTypes.func,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  ContactForms
);
