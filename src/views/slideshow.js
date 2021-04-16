import React, { Component } from 'react';
import {
  Table,
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  ButtonGroup,
  Spinner,
} from 'reactstrap';

import axios from 'axios';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Breadcrumbs from '../components/breadcrumbs';

import PageActions from '../components/page-actions';
import ArticleImageBrowser from '../components/article-image-browser';

import { setPaginationParams } from '../redux/actions';

const mapStateToProps = (state) => ({
  slideshowPagination: state.slideshowPagination,
});

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
  };
}

const APIPath = process.env.REACT_APP_APIPATH;

class Slideshow extends Component {
  constructor(props) {
    super(props);

    const { slideshowPagination } = this.props;
    const {
      orderField,
      orderDesc,
      page,
      limit,
      status,
      searchInput,
    } = slideshowPagination;

    this.state = {
      loading: true,
      items: [],
      orderField,
      orderDesc,
      page,
      gotoPage: page,
      limit,
      status,
      totalPages: 0,
      totalItems: 0,
      modalVisible: false,
      searchInput,
      // form
      form: {
        _id: null,
        label: '',
        caption: '',
        order: '',
        url: '',
        status: '',
        image: '',
      },
      imageDetails: '',
      saving: false,
      updateBtn: (
        <span>
          <i className="fa fa-save" /> Update
        </span>
      ),
      errorVisible: false,
      errorText: [],
      imageModal: false,
      deleteModalVisible: false,
    };
    this.load = this.load.bind(this);
    this.loadItem = this.loadItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.setItemStatus = this.setItemStatus.bind(this);
    this.tableRows = this.tableRows.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleImage = this.toggleImage.bind(this);
    this.imageFn = this.imageFn.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);

    // hack to kill load promise on unmount
    this.cancelLoad = false;
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps, prevState) {
    const { loading } = this.state;
    if (!prevState.loading && loading) {
      this.load();
    }
  }

  componentWillUnmount() {
    this.cancelLoad = true;
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const { form } = this.state;
    const newForm = { ...form };
    newForm[name] = value;
    this.setState({
      form: newForm,
    });
  }

  handleSearch(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  setItemStatus(status) {
    const { form } = this.state;
    const newForm = { ...form };
    newForm.status = status;
    this.setState({
      form: newForm,
    });
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

  toggleModal(item = null) {
    const { modalVisible } = this.state;
    const update = {
      modalVisible: !modalVisible,
    };
    if (item !== null) {
      this.loadItem(item._id);
    } else {
      update.form = {
        _id: null,
        label: '',
        caption: '',
        order: 0,
        url: '',
        status: 'private',
        image: '',
      };
      update.imageDetails = '';
    }
    this.setState(update);
  }

  toggleImage() {
    const { imageModal } = this.state;
    this.setState({
      imageModal: !imageModal,
    });
  }

  toggleDeleteModal() {
    const { deleteModalVisible } = this.state;
    this.setState({
      deleteModalVisible: !deleteModalVisible,
    });
  }

  imageFn(_id) {
    const { form } = this.state;
    const formCopy = { ...form };
    form.image = _id;
    this.setState({ form: formCopy });
  }

  async load() {
    const {
      page,
      limit,
      orderField,
      orderDesc,
      status,
      searchInput: stateSearchInput,
    } = this.state;
    this.setState({
      loading: true,
    });
    const params = {
      page,
      limit,
      orderField,
      orderDesc,
      status,
    };
    if (stateSearchInput !== '') {
      params.label = stateSearchInput;
    }
    const url = `${APIPath}slideshow-items`;
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
      loading: false,
      totalItems: responseData.totalItems,
      items: responseData.data,
    });
    return false;
  }

  async loadItem(_id) {
    const url = `${APIPath}slideshow-item`;
    const responseData = await axios({
      method: 'get',
      url,
      crossDomain: true,
      params: { _id },
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    if (this.cancelLoad) {
      return false;
    }

    const form = {
      _id: responseData._id,
      label: responseData.label,
      caption: responseData.caption,
      order: responseData.order,
      url: responseData.url,
      status: responseData.status,
      image: responseData.image,
    };
    this.setState({
      form,
      imageDetails: responseData.imageDetails,
    });
    return false;
  }

  async simpleSearch(e) {
    e.preventDefault();
    const {
      page,
      limit,
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
      loading: true,
    });
    const params = {
      page,
      limit,
      label: searchInput,
      orderField,
      orderDesc,
      status,
    };
    const url = `${APIPath}slideshow-items`;
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
    this.setState({
      loading: false,
      totalItems: responseData.totalItems,
      items: responseData.data,
    });
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
    status = null,
    searchInput = '',
  }) {
    const {
      limit: stateLimit,
      page: statePage,
      orderField: stateOrderField,
      orderDesc: stateOrderDesc,
      status: stateStatus,
      searchInput: stateSearchInput,
    } = this.state;
    let limitCopy = limit;
    let pageCopy = page;
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
      orderField: orderFieldCopy,
      orderDesc: orderDescCopy,
      status: statusCopy,
      searchInput: searchInputCopy,
    };
    const { setPaginationParams: setPaginationParamsFn } = this.props;
    setPaginationParamsFn('slideshow', payload);
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

  async formSubmit(e) {
    const { saving, form } = this.state;
    e.preventDefault();
    if (saving) {
      return false;
    }
    this.setState({ saving: true });
    const update = await axios({
      method: 'put',
      url: `${APIPath}slideshow-item`,
      crossDomain: true,
      data: form,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (update.status) {
      const formCopy = { ...form };
      formCopy._id = update.data._id;
      this.setState({
        updateBtn: (
          <span>
            <i className="fa fa-save" /> Update success{' '}
            <i className="fa fa-check" />
          </span>
        ),
        loading: true,
        form: formCopy,
        saving: false,
      });
      await this.loadItem(update.data._id);
    } else {
      const errorText = [];
      for (let i = 0; i < update.errors.length; i += 1) {
        const error = update.errors[i];
        errorText.push(<div key={i}>{error.msg}</div>);
      }
      this.setState({
        errorVisible: true,
        errorText,
        updateBtn: (
          <span>
            <i className="fa fa-save" /> Update error{' '}
            <i className="fa fa-times" />
          </span>
        ),
        saving: false,
      });
    }
    const context = this;
    setTimeout(() => {
      context.setState({
        updateBtn: (
          <span>
            <i className="fa fa-save" /> Update
          </span>
        ),
      });
    }, 2000);
    return false;
  }

  tableRows() {
    const { items } = this.state;
    const rows = items.map((item, i) => {
      const count = i + 1;
      const row = (
        <tr key={item._id}>
          <td>{count}</td>
          <td>
            <div
              className="link-imitation"
              onClick={() => this.toggleModal(item)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="toggle modal"
            >
              {item.label}
            </div>
          </td>
          <td>
            <div
              className="link-imitation edit-item"
              onClick={() => this.toggleModal(item)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="toggle modal"
            >
              <i className="fa fa-pencil" />
            </div>
          </td>
        </tr>
      );
      return row;
    });
    return rows;
  }

  async deleteItem() {
    const { form } = this.state;
    const { _id } = form;
    const data = { _id };
    const responseData = await axios({
      method: 'delete',
      url: `${APIPath}slideshow-item`,
      crossDomain: true,
      data,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      this.toggleDeleteModal();
      this.toggleModal(null);
      this.load();
    }
  }

  render() {
    const {
      page,
      gotoPage,
      totalPages,
      limit,
      loading,
      tableLoading,
      status,
      searchInput,
      totalItems,
      form,
      errorVisible,
      errorText,
      imageDetails,
      modalVisible,
      imageModal,
      updateBtn,
      deleteModalVisible,
    } = this.state;
    const heading = 'Slideshow';
    const breadcrumbsItems = [
      { label: heading, icon: 'fa fa-image', active: true, path: '' },
    ];

    const pageActions = (
      <PageActions
        clearSearch={this.clearSearch}
        current_page={page}
        gotoPage={this.gotoPage}
        gotoPageValue={gotoPage}
        handleChange={this.handleSearch}
        limit={limit}
        pageType="slideshow"
        searchInput={searchInput}
        setStatus={this.setStatus}
        status={status}
        simpleSearch={this.simpleSearch}
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
        <div
          className="btn btn-outline-secondary add-new-item-btn"
          onClick={() => this.toggleModal(null)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle modal"
        >
          <i className="fa fa-plus" />
        </div>
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
                        <th style={{ width: '40px' }}>#</th>
                        <th>Label</th>
                        <th style={{ width: '30px' }} aria-label="edit" />
                      </tr>
                    </thead>
                    <tbody>{itemsRows}</tbody>
                    <tfoot>
                      <tr>
                        <th>#</th>
                        <th>Label</th>
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
    const modalTitle =
      form._id !== null ? 'Edit slideshow item' : 'Add new slideshow item';
    const errorContainerClass = errorVisible ? '' : ' hidden';
    const errorContainer = (
      <div className={`error-container${errorContainerClass}`}>{errorText}</div>
    );

    let statusPublic = 'secondary';
    const statusPrivate = 'secondary';
    let publicOutline = true;
    let privateOutline = false;
    if (form.status === 'public') {
      statusPublic = 'success';
      publicOutline = false;
      privateOutline = true;
    }
    let imagePreview = [];
    if (imageDetails !== null && imageDetails !== '') {
      const image = imageDetails;
      const imagePath = image.paths.find((p) => p.pathType === 'source').path;
      imagePreview = (
        <img className="slideshow-preview" alt="" src={imagePath} />
      );
    }
    const editModal = (
      <Modal
        isOpen={modalVisible}
        toggle={() => this.toggleModal(null)}
        size="lg"
      >
        <ModalHeader toggle={() => this.toggleModal(null)}>
          {modalTitle}
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={this.formSubmit}>
            <div className="text-right">
              <ButtonGroup>
                <Button
                  size="sm"
                  outline={publicOutline}
                  color={statusPublic}
                  onClick={() => this.setItemStatus('public')}
                >
                  Public
                </Button>
                <Button
                  size="sm"
                  outline={privateOutline}
                  color={statusPrivate}
                  onClick={() => this.setItemStatus('private')}
                >
                  Private
                </Button>
              </ButtonGroup>
            </div>
            {errorContainer}
            <FormGroup>
              <Label>Label</Label>
              <Input
                type="text"
                name="label"
                placeholder="The label of this slideshow item..."
                value={form.label}
                onChange={this.handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Caption</Label>
              <Input
                type="textarea"
                name="caption"
                placeholder="The caption of this slideshow item..."
                value={form.caption}
                onChange={this.handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Order</Label>
              <Input
                type="number"
                style={{ width: '70px' }}
                name="order"
                placeholder="0"
                value={form.order}
                onChange={this.handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>URL</Label>
              <Input
                type="text"
                name="url"
                placeholder="The url of this slideshow item..."
                value={form.url}
                onChange={this.handleChange}
              />
            </FormGroup>
          </Form>
          <FormGroup>
            <Label>Image</Label>
            <Button type="button" onClick={() => this.toggleImage()} size="sm">
              Select image
            </Button>
            <div className="img-preview-container">{imagePreview}</div>
          </FormGroup>
          <ArticleImageBrowser
            modal={imageModal}
            toggle={this.toggleImage}
            featuredImgFn={this.imageFn}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            outline
            size="sm"
            onClick={() => this.toggleDeleteModal()}
            className="pull-left"
          >
            <i className="fa fa-trash" /> Delete
          </Button>
          <Button
            color="primary"
            outline
            size="sm"
            onClick={(e) => this.formSubmit(e)}
          >
            {updateBtn}
          </Button>
        </ModalFooter>
      </Modal>
    );

    const deleteModal = (
      <Modal isOpen={deleteModalVisible} toggle={this.toggleDeleteModal}>
        <ModalHeader toggle={this.toggleDeleteModal}>
          Delete &quot;{form.label}&quot;
        </ModalHeader>
        <ModalBody>
          The slideshow item &quot;{form.label}&quot; will be deleted. Continue?
        </ModalBody>
        <ModalFooter className="text-left">
          <Button
            className="pull-right"
            color="danger"
            size="sm"
            outline
            onClick={this.deleteItem}
          >
            <i className="fa fa-trash-o" /> Delete
          </Button>
          <Button color="secondary" size="sm" onClick={this.toggleDeleteModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );

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
        {editModal}
        {deleteModal}
      </div>
    );
  }
}

Slideshow.defaultProps = {
  slideshowPagination: null,
  setPaginationParams: () => {},
};
Slideshow.propTypes = {
  slideshowPagination: PropTypes.object,
  setPaginationParams: PropTypes.func,
};
export default compose(connect(mapStateToProps, mapDispatchToProps))(Slideshow);
