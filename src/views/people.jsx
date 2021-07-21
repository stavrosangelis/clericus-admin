import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import { Label, Card, CardBody, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteData,
  getData,
  getResourceThumbnailURL,
  renderLoader,
} from '../helpers';
import { setPaginationParams } from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));
const PageActions = lazy(() => import('../components/Page.actions'));
const BatchActions = lazy(() => import('../components/add-batch-relations'));
const List = lazy(() => import('../components/List'));

const heading = 'People';
const breadcrumbsItems = [
  { label: heading, icon: 'pe-7s-users', active: true, path: '' },
];
const columns = [
  {
    props: ['checked'],
    label: 'checked',
    link: false,
    order: false,
    align: 'center',
    width: 80,
  },
  {
    props: ['#'],
    label: '#',
    link: null,
    order: false,
    orderLabel: '',
    width: 40,
  },
  {
    props: ['thumbnail'],
    label: 'Thumbnail',
    link: { element: 'self', path: 'person' },
    order: false,
    align: 'center',
  },
  {
    props: ['firstName'],
    label: 'First Name',
    link: { element: 'self', path: 'person' },
    order: true,
    orderLabel: 'firstName',
  },
  {
    props: ['lastName'],
    label: 'Last Name',
    link: { element: 'self', path: 'person' },
    order: true,
    orderLabel: 'lastName',
  },
  {
    props: ['organisations'],
    label: 'Organisations',
    link: {
      element: 'organisations',
      key: '_id',
      path: 'organisation',
      type: 'array',
    },
    order: false,
  },
  {
    props: ['status'],
    label: 'Status',
    link: null,
    order: true,
    orderLabel: 'status',
    align: 'center',
  },
  {
    props: ['createdAt'],
    label: 'Created',
    link: null,
    order: true,
    orderLabel: 'createdAt',
  },
  {
    props: ['updatedAt'],
    label: 'Updated',
    link: null,
    order: true,
    orderLabel: 'updatedAt',
  },
  {
    props: ['edit'],
    label: 'Edit',
    link: { element: 'self', path: 'person' },
    order: false,
    align: 'center',
  },
];
const searchElements = [
  { element: 'firstName', label: 'First name' },
  { element: 'lastName', label: 'Last name' },
  { element: 'fnameSoundex', label: 'First name soundex' },
  { element: 'lnameSoundex', label: 'Last name soundex' },
  { element: 'description', label: 'Description' },
];

const People = () => {
  // redux
  const dispatch = useDispatch();
  const resourcesTypes = useSelector((state) => state.resourcesTypes);
  const personTypes = useSelector((state) => state.personTypes);
  const limit = useSelector((state) => state.peoplePagination.limit);
  const activeType = useSelector((state) => state.peoplePagination.activeType);
  const page = useSelector((state) => state.peoplePagination.page);
  const orderField = useSelector((state) => state.peoplePagination.orderField);
  const orderDesc = useSelector((state) => state.peoplePagination.orderDesc);
  const status = useSelector((state) => state.peoplePagination.status);
  const searchInput = useSelector(
    (state) => state.peoplePagination.searchInput
  );
  const advancedSearchInputs = useSelector(
    (state) => state.peoplePagination.advancedSearchInputs
  );
  const classpieceSearchInput = useSelector(
    (state) => state.peoplePagination.classpieceSearchInput
  );
  const classpieceId = useSelector(
    (state) => state.peoplePagination.classpieceId
  );

  // state
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [allChecked, setAllChecked] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [classpieceItems, setClasspieceItems] = useState([]);
  const [gotoPageVal, setGotoPage] = useState(page);

  const [prevLimit, setPrevLimit] = useState(25);
  const [prevPage, setPrevPage] = useState(1);
  const [prevActiveType, setPrevActiveType] = useState(null);
  const [prevStatus, setPrevStatus] = useState(null);
  const [prevOrderField, setPrevOrderField] = useState('firstName');
  const [prevOrderDesc, setPrevOrderDesc] = useState(false);
  const [prevClasspieceId, setPrevClasspieceId] = useState(null);
  const [reLoading, setReLoading] = useState(false);
  const [prevReLoading, setPrevReLoading] = useState(false);

  const prepareItems = useCallback((itemsParam) => {
    const newItems = [];
    for (let i = 0; i < itemsParam.length; i += 1) {
      const item = itemsParam[i];
      item.checked = false;
      item.organisations = item.affiliations;
      delete item.affiliations;
      newItems.push(item);
    }
    return newItems;
  }, []);

  const updateStorePagination = useCallback(
    ({
      limitParam = null,
      pageParam = null,
      activeTypeParam = null,
      orderFieldParam = null,
      orderDescParam = null,
      statusParam = null,
      searchInputParam = null,
      advancedSearchInputsParam = null,
      classpieceSearchInputParam = null,
      classpieceIdParam = null,
    }) => {
      const limitCopy = limitParam === null ? limit : limitParam;
      const pageCopy = pageParam === null ? page : pageParam;
      const activeTypeCopy =
        activeTypeParam === null ? activeType : activeTypeParam;
      const orderFieldCopy =
        orderFieldParam === null ? orderField : orderFieldParam;
      const orderDescCopy =
        orderDescParam === null ? orderDesc : orderDescParam;
      const statusCopy = statusParam === null ? status : statusParam;
      const searchInputCopy =
        searchInputParam === null ? searchInput : searchInputParam;
      const advancedSearchInputsCopy =
        advancedSearchInputsParam === null
          ? advancedSearchInputs
          : advancedSearchInputsParam;
      const classpieceSearchInputCopy =
        classpieceSearchInputParam === null
          ? classpieceSearchInput
          : classpieceSearchInputParam;
      const classpieceIdCopy =
        classpieceIdParam === null ? classpieceId : classpieceIdParam;
      const payload = {
        limit: limitCopy,
        activeType: activeTypeCopy,
        page: pageCopy,
        status: statusCopy,
        orderField: orderFieldCopy,
        orderDesc: orderDescCopy,
        searchInput: searchInputCopy,
        advancedSearchInputs: advancedSearchInputsCopy,
        classpieceSearchInput: classpieceSearchInputCopy,
        classpieceId: classpieceIdCopy,
      };
      dispatch(setPaginationParams('people', payload));
    },
    [
      dispatch,
      activeType,
      advancedSearchInputs,
      classpieceSearchInput,
      classpieceId,
      limit,
      orderDesc,
      orderField,
      page,
      searchInput,
      status,
    ]
  );

  const load = useCallback(async () => {
    setLoading(false);
    setReLoading(false);
    setPrevReLoading(false);
    setTableLoading(true);
    const statusParam = status !== '' ? status : null;
    const params = {
      page,
      limit,
      orderField,
      orderDesc,
      status: statusParam,
    };
    if (classpieceId !== null && classpieceId !== '') {
      params.classpieceId = classpieceId;
    }
    if (searchInput !== '' && !advancedSearch) {
      params.label = searchInput;
    } else if (advancedSearchInputs.length > 0 && advancedSearch) {
      for (let i = 0; i < advancedSearchInputs.length; i += 1) {
        const advancedSearchInput = advancedSearchInputs[i];
        params[advancedSearchInput.select] = advancedSearchInput.input;
      }
    }
    if (activeType !== null && activeType !== '') {
      params.personType = activeType;
    }
    const responseData = await getData(`people`, params);
    const { data: newData } = responseData;
    let currentPage = newData.currentPage > 0 ? newData.currentPage : 1;
    if (currentPage > newData.totalPages && newData.totalPages > 0) {
      currentPage = newData.totalPages;
    }
    const newItems = await prepareItems(newData.data);
    setItems(newItems);
    setTableLoading(false);
    updateStorePagination({ pageParam: currentPage });
    setTotalPages(newData.totalPages);
    setTotalItems(newData.totalItems);
  }, [
    activeType,
    advancedSearchInputs,
    limit,
    page,
    searchInput,
    status,
    updateStorePagination,
    advancedSearch,
    classpieceId,
    prepareItems,
    orderDesc,
    orderField,
  ]);

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    updateStorePagination({
      [`${name}Param`]: value,
    });
  };

  const updateLimit = (value) => {
    updateStorePagination({ limitParam: value });
  };

  const setActiveType = (type) => {
    updateStorePagination({ activeTypeParam: type });
  };

  const updatePage = (value) => {
    if (value > 0 && value !== page) {
      updateStorePagination({ pageParam: value });
      setGotoPage(value);
    }
  };

  const gotoPage = () => {
    if (Number(gotoPageVal) > 0 && gotoPageVal !== page) {
      updateStorePagination({ pageParam: gotoPageVal });
    }
  };

  const setStatus = (statusParam = null) => {
    updateStorePagination({ statusParam });
  };

  const clearSearch = () => {
    updateStorePagination({ searchInputParam: '' });
    setLoading(true);
  };

  const selectClasspiece = useCallback(
    (value) => {
      updateStorePagination({ classpieceIdParam: value });
    },
    [updateStorePagination]
  );

  const classpieceSearch = useCallback(
    async (e) => {
      e.preventDefault();
      const classpieceType =
        resourcesTypes.length > 0
          ? resourcesTypes.find((t) => t.labelId === 'Classpiece')._id
          : '';
      if (classpieceSearchInput < 2) {
        return false;
      }
      const params = {
        page: 1,
        limit: 25,
        label: classpieceSearchInput,
        systemType: classpieceType,
      };
      const responseData = await getData(`resources`, params);
      if (responseData.status) {
        const data = responseData.data.data.map((item) => {
          let thumbnailImage = [];
          const thumbnailPath = getResourceThumbnailURL(item);
          if (thumbnailPath !== null) {
            thumbnailImage = <img src={thumbnailPath} alt={item.label} />;
          }
          return (
            <div
              className="classpiece-result"
              key={item._id}
              onClick={() => selectClasspiece(item._id)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="select classpiece"
            >
              {thumbnailImage} <Label>{item.label}</Label>
            </div>
          );
        });
        setClasspieceItems(data);
      }
      return true;
    },
    [selectClasspiece, classpieceSearchInput, resourcesTypes]
  );

  const classpieceClearSearch = () => {
    updateStorePagination({
      classpieceSearchInputParam: '',
      classpieceIdParam: '',
    });
    setClasspieceItems([]);
    setLoading(true);
  };

  const clearAdvancedSearch = () => {
    setAdvancedSearch(false);
    updateStorePagination({ advancedSearchInputsParam: [] });
    setLoading(true);
  };

  const updateAdvancedSearchInputs = (value) => {
    updateStorePagination({ advancedSearchInputsParam: value });
  };

  const toggleSelected = (i) => {
    const index = i - (Number(page) - 1) * limit;
    const copy = [...items];
    copy[index].checked = !copy[index].checked;
    setItems(copy);
  };

  const toggleSelectedAll = () => {
    const copy = [...items];
    const newAllChecked = !allChecked;
    const newItems = [];
    for (let i = 0; i < copy.length; i += 1) {
      const item = copy[i];
      item.checked = newAllChecked;
      newItems.push(item);
    }
    setAllChecked(newAllChecked);
  };

  const clearSelectedAll = useCallback(() => {
    const copy = [...items];
    const newItems = [];
    for (let i = 0; i < copy.length; i += 1) {
      const item = copy[i];
      item.checked = false;
      newItems.push(item);
    }
    setAllChecked(false);
  }, [items]);

  const reload = () => {
    setReLoading(true);
  };

  useEffect(() => {
    if (prevLimit !== limit) {
      setPrevLimit(limit);
    }
    if (prevActiveType !== activeType) {
      setPrevActiveType(activeType);
    }
    if (prevPage !== page) {
      setPrevPage(page);
    }
    if (prevStatus !== status) {
      setPrevStatus(status);
    }
    if (prevOrderField !== orderField) {
      setPrevOrderField(orderField);
    }
    if (prevOrderDesc !== orderDesc) {
      setPrevOrderDesc(orderDesc);
    }
    if (prevClasspieceId !== classpieceId) {
      setPrevClasspieceId(classpieceId);
    }
    if (reLoading && !prevReLoading) {
      setPrevReLoading(reLoading);
    }
    if (
      loading ||
      prevLimit !== limit ||
      prevPage !== page ||
      prevActiveType !== activeType ||
      prevStatus !== status ||
      prevOrderField !== orderField ||
      prevOrderDesc !== orderDesc ||
      prevClasspieceId !== classpieceId ||
      (reLoading && !prevReLoading)
    ) {
      clearSelectedAll();
      load();
    }
  }, [
    activeType,
    limit,
    loading,
    page,
    status,
    classpieceId,
    clearSelectedAll,
    load,
    orderField,
    orderDesc,
    prevLimit,
    prevPage,
    prevActiveType,
    prevStatus,
    prevOrderField,
    prevOrderDesc,
    prevClasspieceId,
    prevReLoading,
    reLoading,
  ]);

  const deleteSelected = async () => {
    const selectedItems = items
      .filter((item) => item.checked)
      .map((item) => item._id);
    const data = {
      _ids: selectedItems,
    };
    const responseData = await deleteData(`people`, data);
    if (responseData) {
      setAllChecked(false);
      setReLoading(true);
    }
    return true;
  };

  const removeSelected = (_id = null) => {
    if (_id == null) {
      return false;
    }
    const copy = [...items];
    const newItems = copy.map((item) => {
      const itemCopy = item;
      if (itemCopy._id === _id) {
        itemCopy.checked = false;
      }
      return itemCopy;
    });
    setItems(newItems);
    return true;
  };

  const pageActions = (
    <Suspense fallback={renderLoader()}>
      <PageActions
        activeType={activeType}
        advancedSearch={advancedSearch}
        classpieceClearSearch={classpieceClearSearch}
        classpieceItems={classpieceItems}
        classpieceSearch={classpieceSearch}
        classpieceSearchInput={classpieceSearchInput}
        clearAdvancedSearch={clearAdvancedSearch}
        clearSearch={clearSearch}
        current_page={page}
        defaultLimit={25}
        gotoPage={gotoPage}
        gotoPageValue={gotoPageVal}
        handleChange={handleChange}
        limit={limit}
        page={page}
        pageType="people"
        reload={reload}
        searchElements={searchElements}
        searchInput={searchInput}
        setActiveType={setActiveType}
        setAdvancedSearch={setAdvancedSearch}
        setStatus={setStatus}
        status={status}
        totalPages={totalPages}
        types={personTypes}
        updateLimit={updateLimit}
        updatePage={updatePage}
        updateAdvancedSearchInputs={updateAdvancedSearchInputs}
      />
    </Suspense>
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
    const listIndex = (Number(page) - 1) * limit;
    const addNewBtn = (
      <Link
        className="btn btn-outline-secondary add-new-item-btn"
        to="/person/new"
        href="/person/new"
      >
        <i className="fa fa-plus" />
      </Link>
    );
    const selectedItems = items.filter((item) => item.checked);

    const batchActions = (
      <Suspense fallback={[]}>
        <BatchActions
          items={selectedItems}
          removeSelected={removeSelected}
          type="Person"
          relationProperties={[]}
          deleteSelected={deleteSelected}
          selectAll={toggleSelectedAll}
          allChecked={allChecked}
          reload={reload}
        />
      </Suspense>
    );
    const table = tableLoading ? (
      <div style={{ padding: '40pt', textAlign: 'center' }}>
        <Spinner type="grow" color="info" /> <i>loading...</i>
      </div>
    ) : (
      <Suspense fallback={renderLoader()}>
        <List
          columns={columns}
          items={items}
          listIndex={listIndex}
          type="people"
          allChecked={allChecked}
          toggleSelectedAll={toggleSelectedAll}
          toggleSelected={toggleSelected}
        />
      </Suspense>
    );

    content = (
      <div className="people-container">
        {pageActions}
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody className="people-card">
                <div className="pull-right">{batchActions}</div>
                {table}
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
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
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
};
export default People;
