import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import axios from 'axios';
import { Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { renderLoader } from '../helpers';
import { setPaginationParams, getArticlesCategories } from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const PageActions = lazy(() => import('../components/Page.actions'));
const List = lazy(() => import('../components/List'));

const { REACT_APP_APIPATH: APIPath } = process.env;
const heading = 'Articles';
const breadcrumbsItems = [
  { label: heading, icon: 'pe-7s-news-paper', active: true, path: '' },
];
const columns = [
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
    link: { element: 'self', path: '/article' },
    order: true,
    orderLabel: 'label',
  },
  {
    props: ['categories'],
    label: 'Categories',
    link: false,
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
    link: { element: 'self', path: '/article' },
    order: false,
    align: 'center',
  },
];

function Articles() {
  // redux
  const dispatch = useDispatch();
  const { articleCategories, articlesPagination } = useSelector(
    (state) => state
  );

  const {
    limit,
    page,
    activeType,
    orderField,
    orderDesc,
    status,
    searchInput,
    totalItems,
    totalPages,
  } = articlesPagination;

  // state
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [gotoPage, setGotoPage] = useState(page);

  const prepareItems = useCallback((itemsParam = []) => {
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
      activeTypeParam = null,
      limitParam = null,
      orderDescParam = null,
      orderFieldParam = null,
      pageParam = null,
      searchInputParam = null,
      statusParam = null,
      totalItemsParam = null,
      totalPagesParam = null,
    }) => {
      const payload = {};
      if (limitParam !== null) {
        payload.limit = limitParam;
      }
      if (pageParam !== null) {
        payload.page = pageParam;
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
      dispatch(setPaginationParams('articles', payload));
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

  useEffect(() => {
    if (orderField !== '') {
      reload();
    }
  }, [orderDesc, orderField]);

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
          params.categoryId = activeType;
        }
        const responseData = await axios({
          method: 'get',
          url: `${APIPath}articles`,
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
      const responseData = await loadData();
      if (!unmounted) {
        setLoading(false);
        setItems([]);
        const { data: newData = null } = responseData;
        if (newData !== null) {
          const {
            currentPage = 0,
            data: itemsData = [],
            totalItems: totalItemsResp,
            totalPages: totalPagesResp,
          } = newData;
          const cPage = currentPage > 0 ? currentPage : 1;
          if (cPage !== 1 && cPage > totalPages && totalPages > 0) {
            updatePage(totalPages);
          } else {
            updateStorePagination({
              totalItemsParam: totalItemsResp,
              totalPagesParam: totalPagesResp,
            });
            const newItems = await prepareItems(itemsData);
            setItems(newItems);
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
    limit,
    loading,
    orderDesc,
    orderField,
    page,
    prepareItems,
    searchInput,
    status,
    totalPages,
    updatePage,
    updateStorePagination,
  ]);

  useEffect(() => {
    if (loading && articleCategories.length === 0) {
      dispatch(getArticlesCategories());
    }
  }, [dispatch, articleCategories, loading]);

  const pageActions = (
    <Suspense fallback={renderLoader()}>
      <PageActions
        activeType={activeType}
        clearSearch={clearSearch}
        current_page={page}
        defaultLimit={25}
        gotoPage={gotoPageFn}
        gotoPageValue={gotoPage}
        handleChange={handleChange}
        limit={limit}
        page={page}
        pageType="articles"
        reload={reload}
        searchInput={searchInput}
        setActiveType={setActiveType}
        setStatus={setStatus}
        status={status}
        totalPages={totalPages}
        types={articleCategories}
        updateLimit={updateLimit}
        updateSort={updateSort}
        updatePage={updatePage}
      />
    </Suspense>
  );

  const listIndex = (Number(page) - 1) * limit;

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
              <Suspense fallback={renderLoader()}>
                <List
                  columns={columns}
                  items={items}
                  listIndex={listIndex}
                  loading={loading}
                  type="articles"
                />
              </Suspense>
            </CardBody>
          </Card>
          {pageActions}
        </div>
      </div>
      <Link
        className="btn btn-outline-secondary add-new-item-btn"
        to="/organisation/new"
      >
        <i className="fa fa-plus" />
      </Link>
    </div>
  );
}
export default Articles;
