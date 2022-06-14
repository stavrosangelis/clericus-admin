import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import axios from 'axios';
import { Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteData, renderLoader } from '../helpers';
import { setPaginationParams } from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const PageActions = lazy(() => import('../components/Page.actions'));
const BatchActions = lazy(() => import('../components/add-batch-relations'));
const List = lazy(() => import('../components/List'));

const { REACT_APP_APIPATH: APIPath } = process.env;
const heading = 'Spatial';
const breadcrumbsItems = [
  { label: heading, icon: 'pe-7s-map', active: true, path: '' },
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
    link: { element: 'self', path: '/spatial' },
    order: true,
    orderLabel: 'label',
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
    link: { element: 'self', path: '/spatial' },
    order: false,
    align: 'center',
  },
];

function Spatial() {
  // redux
  const dispatch = useDispatch();
  const { spatialsPagination } = useSelector((state) => state);

  const {
    limit,
    orderDesc,
    orderField,
    page,
    searchInput,
    totalItems,
    totalPages,
  } = spatialsPagination;

  // state
  const [loading, setLoading] = useState(true);
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
      orderFieldParam = null,
      orderDescParam = null,
      searchInputParam = null,
      totalItemsParam = null,
      totalPagesParam = null,
    }) => {
      const payload = {};
      if (limitParam !== null) {
        payload.limit = limitParam;
      }
      if (orderDescParam !== null) {
        payload.orderDesc = orderDescParam;
      }
      if (orderFieldParam !== null) {
        payload.orderField = orderFieldParam;
      }
      if (pageParam !== null) {
        payload.page = Number(pageParam);
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
      dispatch(setPaginationParams('spatials', payload));
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
    for (let i = 0; i < copy.length; i += 1) {
      const item = copy[i];
      item.checked = newAllChecked;
      newItems.push(item);
    }
    setAllChecked(newAllChecked);
  }, [allChecked, items]);

  useEffect(() => {
    if (orderField !== '') {
      reload();
    }
  }, [orderDesc, orderField]);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    if (loading) {
      const load = async () => {
        const loadData = async () => {
          const params = {
            page,
            limit,
            orderField,
            orderDesc,
          };
          if (searchInput !== '') {
            params.label = searchInput;
          }
          const responseData = await axios({
            method: 'get',
            url: `${APIPath}spatials`,
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
          }
        }
      };
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [
    allChecked,
    limit,
    loading,
    orderDesc,
    orderField,
    prepareItems,
    page,
    searchInput,
    toggleSelectedAll,
    totalPages,
    updatePage,
    updateStorePagination,
  ]);

  const deleteSelected = async () => {
    const _ids = items.filter((item) => item.checked).map((item) => item._id);
    const responseData = await deleteData(`spatials`, { _ids });
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
        clearSearch={clearSearch}
        current_page={page}
        defaultLimit={25}
        gotoPage={gotoPageFn}
        gotoPageValue={gotoPage}
        handleChange={handleChange}
        limit={limit}
        orderDesc={orderDesc}
        orderField={orderField}
        page={page}
        pageType="spatials"
        reload={reload}
        searchInput={searchInput}
        totalPages={totalPages}
        types={[]}
        updateLimit={updateLimit}
        updatePage={updatePage}
      />
    </Suspense>
  );

  const listIndex = (Number(page) - 1) * limit;
  const selectedItems = items.filter((item) => item.checked);

  const batchActions = (
    <div className="batch-actions">
      <Suspense fallback={null}>
        <BatchActions
          items={selectedItems}
          removeSelected={removeSelected}
          type="Temporal"
          relationProperties={[]}
          deleteSelected={deleteSelected}
          selectAll={toggleSelectedAll}
          allChecked={allChecked}
          reload={reload}
        />
      </Suspense>
    </div>
  );

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
          <Card>
            <CardBody className="people-card">
              {batchActions}
              <Suspense fallback={renderLoader()}>
                <List
                  columns={columns}
                  items={items}
                  listIndex={listIndex}
                  loading={loading}
                  type="spatials"
                  allChecked={allChecked}
                  toggleSelectedAll={toggleSelectedAll}
                  toggleSelected={toggleSelected}
                />
              </Suspense>
              {batchActions}
            </CardBody>
          </Card>
          {pageActions}
        </div>
      </div>
      <Link
        className="btn btn-outline-secondary add-new-item-btn"
        to="/spatial/new"
      >
        <i className="fa fa-plus" />
      </Link>
    </div>
  );
}
export default Spatial;
