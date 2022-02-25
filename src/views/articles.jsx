import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import { Card, CardBody, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getData, renderLoader } from '../helpers';
import { setPaginationParams, getArticlesCategories } from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));
const PageActions = lazy(() => import('../components/Page.actions'));
const List = lazy(() => import('../components/List'));

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
    link: { element: 'self', path: 'article' },
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
    link: { element: 'self', path: 'article' },
    order: false,
    align: 'center',
  },
];

const Articles = () => {
  // redux
  const dispatch = useDispatch();
  const articleCategories = useSelector((state) => state.articleCategories);

  const limit = useSelector((state) => state.articlesPagination.limit);
  const activeType = useSelector(
    (state) => state.articlesPagination.activeType
  );
  const page = useSelector((state) => state.articlesPagination.page);
  const orderField = useSelector(
    (state) => state.articlesPagination.orderField
  );
  const orderDesc = useSelector((state) => state.articlesPagination.orderDesc);
  const status = useSelector((state) => state.articlesPagination.status);
  const searchInput = useSelector(
    (state) => state.articlesPagination.searchInput
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
      dispatch(setPaginationParams('articles', payload));
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
    const responseData = await getData(`articles`, params);
    return responseData;
  }, [activeType, limit, page, searchInput, status, orderDesc, orderField]);

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    updateStorePagination({
      [`${name}Param`]: value,
    });
  };

  useEffect(() => {
    if (articleCategories.length === 0) {
      dispatch(getArticlesCategories());
    }
  }, [dispatch, articleCategories]);

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
    let unmount = false;
    const update = async () => {
      unmount = false;
      const responseData = await load();
      const { data: newData } = responseData;
      let currentPage = newData.currentPage > 0 ? newData.currentPage : 1;
      if (currentPage > newData.totalPages && newData.totalPages > 0) {
        currentPage = newData.totalPages;
      }
      const newItems = await prepareItems(newData.data);
      if (!unmount) {
        setLoading(false);
        setReLoading(false);
        setPrevReLoading(false);
        setTableLoading(true);
        setItems(newItems);
        setTableLoading(false);
        updateStorePagination({ pageParam: currentPage });
        setTotalPages(newData.totalPages);
        setTotalItems(newData.totalItems);
      }
    };
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
      clearSelectedAll();
      update();
    }
    if (
      !unmount &&
      (loading ||
        prevLimit !== limit ||
        prevPage !== page ||
        prevActiveType !== activeType ||
        prevStatus !== status ||
        prevOrderField !== orderField ||
        prevOrderDesc !== orderDesc ||
        (reLoading && !prevReLoading))
    ) {
      clearSelectedAll();
      update();
    }
    return () => {
      unmount = true;
    };
  }, [
    activeType,
    clearSelectedAll,
    loading,
    limit,
    load,
    orderField,
    orderDesc,
    page,
    prepareItems,
    prevLimit,
    prevPage,
    prevActiveType,
    prevStatus,
    prevOrderField,
    prevOrderDesc,
    prevReLoading,
    reLoading,
    status,
    updateStorePagination,
  ]);

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
        pageType="articles"
        reload={reload}
        searchInput={searchInput}
        setActiveType={setActiveType}
        setStatus={setStatus}
        status={status}
        totalPages={totalPages}
        types={articleCategories}
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
        to="/article/new"
        href="/article/new"
      >
        <i className="fa fa-plus" />
      </Link>
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
          type="articles"
          allChecked={allChecked}
          toggleSelectedAll={toggleSelectedAll}
          toggleSelected={toggleSelected}
        />
      </Suspense>
    );

    content = (
      <div className="articles-container">
        {pageActions}
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody className="articles-card">{table}</CardBody>
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
export default Articles;
