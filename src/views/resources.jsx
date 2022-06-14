import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import axios from 'axios';
import { Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteData, renderLoader } from '../helpers';
import { setPaginationParams } from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const PageActions = lazy(() => import('../components/Page.actions'));
const BatchActions = lazy(() => import('../components/add-batch-relations'));
const List = lazy(() => import('../components/List'));

const { REACT_APP_APIPATH: APIPath } = process.env;
const heading = 'Resources';
const breadcrumbsItems = [
  { label: heading, icon: 'pe-7s-photo', active: true, path: '' },
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
    props: ['thumbnail'],
    label: 'Thumbnail',
    link: { element: 'self', path: '/resource' },
    order: true,
    orderLabel: 'thumbnail',
  },
  {
    props: ['label'],
    label: 'Label',
    link: { element: 'self', path: '/resource' },
    order: true,
    orderLabel: 'label',
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
];

function Resources() {
  // redux
  const dispatch = useDispatch();
  const { resourcesTypes, resourcesPagination } = useSelector((state) => state);

  const {
    activeType,
    limit,
    page,
    orderField,
    orderDesc,
    status,
    searchInput,
    totalItems,
    totalPages,
  } = resourcesPagination;

  // state
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [gotoPage, setGotoPage] = useState(page);

  const prepareItems = useCallback((itemsParam) => {
    const newItems = [];
    const { length } = itemsParam;
    for (let i = 0; i < length; i += 1) {
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
      totalItemsParam = null,
      totalPagesParam = null,
    }) => {
      const payload = {};
      if (limitParam !== null) {
        payload.limit = limitParam;
      }
      if (pageParam !== null) {
        payload.page = Number(pageParam);
      }
      if (activeTypeParam !== null) {
        payload.activeType = activeTypeParam;
      }
      if (orderFieldParam !== null) {
        payload.orderField = orderFieldParam;
      }
      if (orderDescParam !== null) {
        payload.orderDesc = orderDescParam;
      }
      if (statusParam !== null) {
        payload.status = statusParam;
      }
      if (searchInputParam !== null) {
        payload.searchInput = searchInputParam;
      }
      if (totalItemsParam !== null) {
        payload.totalItems = totalItemsParam;
      }
      if (totalPagesParam !== null) {
        payload.totalPages = totalPagesParam;
      }
      dispatch(setPaginationParams('resources', payload));
    },
    [dispatch]
  );

  const reload = (e = null) => {
    if (e !== null) {
      e.preventDefault();
    }
    setLoading(true);
  };

  const updatePage = useCallback(
    (value) => {
      if (value > 0 && value !== page) {
        updateStorePagination({ pageParam: value });
        reload();
      }
    },
    [page, updateStorePagination]
  );

  const gotoPageFn = (e) => {
    e.preventDefault();
    if (gotoPage > 0 && gotoPage !== page) {
      updateStorePagination({ pageParam: gotoPage });
      reload();
    }
  };

  const updateLimit = (value) => {
    updateStorePagination({ limitParam: value });
    reload();
  };

  const updateSort = (orderFieldParam) => {
    const orderDescParam = orderField === orderFieldParam ? !orderDesc : false;
    updateStorePagination({ orderFieldParam, orderDescParam });
    reload();
  };

  const setActiveType = (type) => {
    updateStorePagination({ activeTypeParam: type });
    reload();
  };

  const setStatus = (statusParam = null) => {
    updateStorePagination({ statusParam });
    reload();
  };

  const handleChange = (e) => {
    const { name, value = '' } = e.target;
    switch (name) {
      case 'gotoPage':
        setGotoPage(value);
        break;
      case 'searchInput':
        updateStorePagination({ searchInputParam: value });
        break;
      default:
        break;
    }
  };

  const clearSearch = () => {
    updateStorePagination({ searchInputParam: '' });
    reload();
  };

  const toggleSelected = (i) => {
    const index = i - (Number(page) - 1) * limit;
    const copy = [...items];
    copy[index].checked = !copy[index].checked;
    setItems(copy);
  };

  const toggleSelectedAll = useCallback(() => {
    const copy = [...items];
    const newAllChecked = !allChecked;
    const newItems = [];
    const { length } = copy;
    for (let i = 0; i < length; i += 1) {
      const item = copy[i];
      item.checked = newAllChecked;
      newItems.push(item);
    }
    setAllChecked(newAllChecked);
  }, [allChecked, items]);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      const loadData = async () => {
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
          params.systemType = activeType;
        }
        const responseData = await axios({
          method: 'get',
          url: `${APIPath}resources`,
          crossDomain: true,
          params,
          signal: controller.signal,
        })
          .then((response) => {
            const { data: rData = null } = response;
            return rData;
          })
          .catch((error) => {
            console.log(error);
            return { data: null };
          });
        return responseData;
      };
      if (allChecked) {
        toggleSelectedAll();
      }
      const responseData = await loadData();
      if (!unmounted) {
        setLoading(false);
        setItems([]);
        setTableLoading(true);
        if (responseData !== null) {
          const { data } = responseData;
          const {
            currentPage = 0,
            data: newData = [],
            totalItems: totalItemsResp,
            totalPages: totalPagesResp,
          } = data;
          const cPage = currentPage > 0 ? currentPage : 1;
          if (cPage !== 1 && cPage > totalPagesResp && totalPagesResp > 0) {
            updatePage(totalPagesResp);
          } else {
            updateStorePagination({
              totalItemsParam: totalItemsResp,
              totalPagesParam: totalPagesResp,
            });
            const newItems = await prepareItems(newData);
            setItems(newItems);
            setTableLoading(false);
          }
        }
      }
    };
    if (loading) {
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [
    activeType,
    allChecked,
    limit,
    loading,
    orderDesc,
    orderField,
    page,
    prepareItems,
    searchInput,
    status,
    toggleSelectedAll,
    totalPages,
    updateStorePagination,
    updatePage,
  ]);

  const deleteSelected = async () => {
    const _ids = items.filter((item) => item.checked).map((item) => item._id);
    const responseData = await deleteData(`resources`, { _ids });
    if (responseData) {
      setAllChecked(false);
      reload();
    }
  };

  const removeSelected = (_id = null) => {
    if (_id !== null) {
      const copy = [...items];
      const newItems = copy.map((item) => {
        const itemCopy = item;
        if (itemCopy._id === _id) {
          itemCopy.checked = false;
        }
        return itemCopy;
      });
      setItems(newItems);
    }
  };

  const pageActions = (
    <Suspense fallback={null}>
      <PageActions
        activeType={activeType}
        clearSearch={clearSearch}
        current_page={page}
        defaultLimit={24}
        gotoPage={gotoPageFn}
        gotoPageValue={gotoPage}
        handleChange={handleChange}
        limit={limit}
        orderDesc={orderDesc}
        orderField={orderField}
        page={page}
        pageType="resources"
        reload={reload}
        searchInput={searchInput}
        setActiveType={setActiveType}
        setStatus={setStatus}
        status={status}
        totalPages={totalPages}
        types={resourcesTypes}
        updateLimit={updateLimit}
        updateSort={updateSort}
        updatePage={updatePage}
      />
    </Suspense>
  );

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
    const listIndex = (Number(page) - 1) * limit;
    const selectedItems = items.filter((item) => item.checked);

    const batchActions = (
      <div className="batch-actions">
        <Suspense fallback={null}>
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
      </div>
    );
    const resourcesOutput = tableLoading ? (
      <div style={{ padding: '40pt', textAlign: 'center' }}>
        <Spinner type="grow" color="info" /> <i>loading...</i>
      </div>
    ) : (
      <Suspense fallback={renderLoader()}>
        <List
          columns={columns}
          items={items}
          listIndex={listIndex}
          type="resources"
          allChecked={allChecked}
          toggleSelectedAll={toggleSelectedAll}
          toggleSelected={toggleSelected}
          grid
        />
      </Suspense>
    );

    content = (
      <>
        {batchActions}
        <div className="row">
          <div className="col-12">{resourcesOutput}</div>
        </div>
        {batchActions}
      </>
    );
  }

  return (
    <div className="container-fluid">
      <Suspense fallback={null}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <div className="row">
        <div className="col-12">
          <h2>
            {heading} <small>({totalItems})</small>
          </h2>
          {pageActions}
          {content}
          {pageActions}
        </div>
      </div>

      <Link
        className="btn btn-outline-secondary add-new-item-btn"
        to="/resource/new"
      >
        <i className="fa fa-plus" />
      </Link>
    </div>
  );
}
export default Resources;
