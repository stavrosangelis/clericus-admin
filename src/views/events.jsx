import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import { Card, CardBody, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteData, getData, renderLoader } from '../helpers';
import { setPaginationParams } from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));
const PageActions = lazy(() => import('../components/Page.actions'));
const BatchActions = lazy(() => import('../components/add-batch-relations'));
const List = lazy(() => import('../components/List'));

const heading = 'Events';
const breadcrumbsItems = [
  { label: heading, icon: 'pe-7s-date', active: true, path: '' },
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
    props: ['label'],
    label: 'Label',
    link: { element: 'self', path: 'event' },
    order: true,
    orderLabel: 'label',
  },
  {
    props: ['temporal'],
    label: 'Temporal',
    link: {
      element: 'temporal',
      key: '_id',
      path: 'temporal',
      type: 'array',
    },
    order: false,
  },
  {
    props: ['spatial'],
    label: 'Spatial',
    link: {
      element: 'spatial',
      key: '_id',
      path: 'spatial',
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
    link: { element: 'self', path: 'event' },
    order: false,
    align: 'center',
  },
];

const Events = () => {
  // redux
  const dispatch = useDispatch();
  const eventTypes = useSelector((state) => state.eventTypes);

  const limit = useSelector((state) => state.eventsPagination.limit);
  const activeType = useSelector((state) => state.eventsPagination.activeType);
  const page = useSelector((state) => state.eventsPagination.page);
  const orderField = useSelector((state) => state.eventsPagination.orderField);
  const orderDesc = useSelector((state) => state.eventsPagination.orderDesc);
  const status = useSelector((state) => state.eventsPagination.status);
  const searchInput = useSelector(
    (state) => state.eventsPagination.searchInput
  );

  // state
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [allChecked, setAllChecked] = useState(false);
  const [gotoPageVal, setGotoPage] = useState(page);

  const [prevLimit, setPrevLimit] = useState(25);
  const [prevPage, setPrevPage] = useState(1);
  const [prevActiveType, setPrevActiveType] = useState(null);
  const [prevStatus, setPrevStatus] = useState(null);
  const [prevOrderField, setPrevOrderField] = useState('label');
  const [prevOrderDesc, setPrevOrderDesc] = useState(false);
  const [reLoading, setReLoading] = useState(false);
  const [prevReLoading, setPrevReLoading] = useState(false);

  const prepareItems = useCallback((itemsParam) => {
    const newItems = [];
    for (let i = 0; i < itemsParam.length; i += 1) {
      const item = itemsParam[i];
      item.checked = false;
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
      const payload = {
        limit: limitCopy,
        page: pageCopy,
        activeType: activeTypeCopy,
        orderField: orderFieldCopy,
        orderDesc: orderDescCopy,
        status: statusCopy,
        searchInput: searchInputCopy,
      };
      dispatch(setPaginationParams('events', payload));
    },
    [
      dispatch,
      activeType,
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
    if (searchInput !== '') {
      params.label = searchInput;
    }
    if (activeType !== null && activeType !== '') {
      params.eventType = activeType;
    }
    const responseData = await getData(`events`, params);
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
    limit,
    page,
    searchInput,
    status,
    prepareItems,
    orderDesc,
    orderField,
    updateStorePagination,
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
    if (prevPage !== page) {
      setPrevPage(page);
    }
    if (prevActiveType !== activeType) {
      setPrevActiveType(activeType);
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
      (reLoading && !prevReLoading)
    ) {
      clearSelectedAll();
      load();
    }
  }, [
    loading,
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
    prevReLoading,
    reLoading,
    limit,
    page,
    activeType,
    status,
  ]);

  const deleteSelected = async () => {
    const selectedItems = items
      .filter((item) => item.checked)
      .map((item) => item._id);
    const data = {
      _ids: selectedItems,
    };
    const responseData = await deleteData(`events`, data);
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
        clearSearch={clearSearch}
        current_page={page}
        defaultLimit={25}
        gotoPage={gotoPage}
        gotoPageValue={gotoPageVal}
        handleChange={handleChange}
        limit={limit}
        page={page}
        pageType="events"
        reload={reload}
        searchInput={searchInput}
        setActiveType={setActiveType}
        setStatus={setStatus}
        status={status}
        totalPages={totalPages}
        types={eventTypes}
        updateLimit={updateLimit}
        updatePage={updatePage}
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
        to="/event/new"
        href="/event/new"
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
          type="Event"
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
          type="events"
          allChecked={allChecked}
          toggleSelectedAll={toggleSelectedAll}
          toggleSelected={toggleSelected}
        />
      </Suspense>
    );

    content = (
      <div className="events-container">
        {pageActions}
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody className="events-card">
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
      <Suspense fallback={renderLoader()}>
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
export default Events;
