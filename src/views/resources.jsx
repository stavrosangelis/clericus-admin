import React, { Component } from 'react';
import { Label, Card, CardImg, CardText, CardBody, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import Breadcrumbs from '../components/breadcrumbs';
import PageActions from '../components/page-actions';
import BatchActions from '../components/add-batch-relations';

import { getResourceThumbnailURL } from '../helpers';

import { setPaginationParams } from '../redux/actions';

const APIPath = process.env.REACT_APP_APIPATH;

const mapStateToProps = (state) => ({
  resourcesPagination: state.resourcesPagination,
  resourcesTypes: state.resourcesTypes,
});

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type, params) =>
      dispatch(setPaginationParams(type, params)),
  };
}

class Resources extends Component {
  constructor(props) {
    super(props);

    const { resourcesPagination } = this.props;
    const {
      activeType,
      orderField,
      orderDesc,
      page,
      limit,
      status,
      searchInput,
    } = resourcesPagination;

    this.state = {
      loading: true,
      activeType,
      page,
      gotoPage: page,
      limit,
      status,
      orderField,
      orderDesc,
      totalPages: 0,
      totalItems: 0,
      insertModalVisible: false,
      searchInput,
      allowSelections: false,
    };
    this.load = this.load.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setActiveType = this.setActiveType.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.toggleInsertModal = this.toggleInsertModal.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleSelectedAll = this.toggleSelectedAll.bind(this);
    this.deleteSelected = this.deleteSelected.bind(this);
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
      searchInput,
    } = this.state;
    const { resourcesTypes } = this.props;
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
    const url = `${APIPath}resources`;
    if (activeType !== null) {
      const systemType = resourcesTypes.find((t) => t.label === activeType);
      if (typeof systemType !== 'undefined') {
        params.systemType = systemType._id;
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

    let currentPage = 1;
    if (responseData.currentPage > 0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage > 1 && responseData.data.length === 0) {
      this.setState(
        {
          page: currentPage - 1,
        },
        () => {
          this.load();
        }
      );
    } else {
      this.setState({
        loading: false,
        page: currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        resources: responseData.data,
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
    const { resourcesTypes } = this.props;
    if (searchInput < 2) {
      return false;
    }
    this.updateStorePagination({ searchInput });
    const params = {
      page,
      limit,
      orderField,
      orderDesc,
      status,
      label: searchInput,
    };
    const url = `${APIPath}resources`;
    if (activeType !== null) {
      const systemType = resourcesTypes.find((t) => t.label === activeType);
      if (typeof systemType !== 'undefined') {
        params.systemType = systemType._id;
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
    let currentPage = 1;
    if (responseData.currentPage > 0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage > 1 && responseData.data.length === 0) {
      this.setState(
        {
          page: currentPage - 1,
        },
        () => {
          this.load();
        }
      );
    } else {
      this.setState({
        loading: false,
        page: currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        resources: responseData.data,
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
    setPaginationParamsFn('resources', payload);
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

  toggleInsertModal() {
    const { insertModalVisible } = this.state;
    this.setState({
      insertModalVisible: !insertModalVisible,
    });
  }

  toggleSelected(i) {
    const { resources } = this.state;
    const newResourceChecked = !resources[i].checked;
    resources[i].checked = newResourceChecked;
    this.setState(
      {
        resources,
      },
      () => {
        const checked = resources.find((r) => r.checked);
        if (typeof checked !== 'undefined') {
          this.setState({
            allowSelections: true,
          });
        } else {
          this.setState({
            allowSelections: false,
          });
        }
      }
    );
  }

  toggleSelectedAll() {
    const { allChecked: stateAllChecked, resources } = this.state;
    const allChecked = !stateAllChecked;
    const newResources = [];
    for (let i = 0; i < resources.length; i += 1) {
      const resource = resources[i];
      resource.checked = allChecked;
      newResources.push(resource);
    }
    this.setState(
      {
        resources: newResources,
        allChecked,
      },
      () => {
        const checked = resources.find((r) => r.checked);
        if (typeof checked !== 'undefined') {
          this.setState({
            allowSelections: true,
          });
        } else {
          this.setState({
            allowSelections: false,
          });
        }
      }
    );
  }

  async deleteSelected() {
    const { resources } = this.state;
    const selectedResources = resources
      .filter((item) => item.checked)
      .map((item) => item._id);
    const data = {
      _ids: selectedResources,
    };
    const url = `${APIPath}resources`;
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
    const { resources } = this.state;
    const newResources = resources.map((item) => {
      const itemCopy = item;
      if (itemCopy._id === _id) {
        itemCopy.checked = false;
      }
      return itemCopy;
    });
    this.setState({
      resources: newResources,
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
      allChecked,
      orderField,
      orderDesc,
      status,
      searchInput,
      totalItems,
      resources,
      allowSelections,
      activeType,
    } = this.state;
    const { resourcesTypes } = this.props;
    const heading = 'Resources';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-photo', active: true, path: '' },
    ];

    let content = (
      <div className="row">
        <div className="col-12">
          <div style={{ padding: '40pt', textAlign: 'center' }}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    );
    if (!loading) {
      const addNewBtn = (
        <Link
          className="btn btn-outline-secondary add-new-item-btn"
          to="/resource/new"
          href="/resource/new"
        >
          <i className="fa fa-plus" />
        </Link>
      );

      let linkVisible = '';
      let plainVisible = 'hidden';
      if (allowSelections) {
        linkVisible = 'hidden';
        plainVisible = '';
      }

      const resourcesOutput = resources.map((resource, i) => {
        const parseUrl = `/resource/${resource._id}`;
        let thumbnailImage = [];
        const thumbnailPath = getResourceThumbnailURL(resource);
        if (thumbnailPath !== null) {
          thumbnailImage = (
            <div>
              <Link to={parseUrl} href={parseUrl} className={linkVisible}>
                <CardImg src={thumbnailPath} alt={resource.label} />
              </Link>
              <CardImg
                src={thumbnailPath}
                alt={resource.label}
                className={plainVisible}
              />
            </div>
          );
        } else if (resource.resourceType === 'document') {
          thumbnailImage = (
            <div className="resource-list-document">
              <Link to={parseUrl} href={parseUrl} className={linkVisible}>
                <i className="fa fa-file-pdf-o" />
              </Link>
            </div>
          );
        }

        let checked = '';
        if (typeof resource.checked !== 'undefined' && resource.checked) {
          checked = ' checked';
        }
        const label = (
          <Link to={parseUrl} href={parseUrl}>
            {resource.label}
          </Link>
        );
        const resourceOutput = (
          <div key={resource._id} className="col-12 col-sm-6 col-md-3">
            <Card
              style={{ marginBottom: '15px' }}
              className={`resource-card${checked}`}
            >
              <div
                className="select-resource"
                onClick={() => this.toggleSelected(i)}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle selected"
              >
                <i className="fa circle" />
              </div>
              {thumbnailImage}
              <CardBody>
                <CardText className="text-center">
                  <Label className="resources-list-label">{label}</Label>
                </CardText>
              </CardBody>
            </Card>
          </div>
        );
        return resourceOutput;
      });

      const pageActions = (
        <PageActions
          activeType={activeType}
          clearSearch={this.clearSearch}
          current_page={page}
          gotoPageValue={gotoPage}
          gotoPage={this.gotoPage}
          handleChange={this.handleChange}
          limit={limit}
          pageType="resources"
          searchInput={searchInput}
          setActiveType={this.setActiveType}
          setStatus={this.setStatus}
          status={status}
          simpleSearch={this.simpleSearch}
          total_pages={totalPages}
          types={resourcesTypes}
          updateLimit={this.updateLimit}
          updatePage={this.updatePage}
          orderField={orderField}
          orderDesc={orderDesc}
          updateOrdering={this.updateOrdering}
        />
      );
      let selectionsClass = '';
      if (allowSelections) {
        selectionsClass = ' allow-selections';
      }

      const selectedResources = resources.filter((item) => item.checked);

      const batchActions = (
        <BatchActions
          items={selectedResources}
          removeSelected={this.removeSelected}
          type="Resource"
          relationProperties={[]}
          deleteSelected={this.deleteSelected}
          className="resources-actions"
          selectAll={this.toggleSelectedAll}
          allChecked={allChecked}
        />
      );

      content = (
        <div className="resources-container">
          {pageActions}
          <div className="row">
            <div className="col-12 text-right">{batchActions}</div>
          </div>
          <div className={`row${selectionsClass}`}>{resourcesOutput}</div>

          <div className="row">
            <div className="col-12 text-right">{batchActions}</div>
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

Resources.defaultProps = {
  resourcesPagination: null,
  resourcesTypes: [],
  setPaginationParams: () => {},
};
Resources.propTypes = {
  resourcesPagination: PropTypes.object,
  resourcesTypes: PropTypes.array,
  setPaginationParams: PropTypes.func,
};
export default compose(connect(mapStateToProps, mapDispatchToProps))(Resources);
