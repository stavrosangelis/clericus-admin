import React, {
  useEffect,
  useState,
  useCallback,
  useReducer,
  useRef,
  Suspense,
  lazy,
} from 'react';
import { Card, CardBody, Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getData, renderLoader } from '../helpers';
import { setPaginationParams } from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));
const PageActions = lazy(() => import('../components/Page.actions'));
const List = lazy(() => import('../components/List'));

const heading = 'Users';
const breadcrumbsItems = [
  { label: heading, icon: 'fa fa-user', active: true, path: '' },
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
    label: 'User',
    link: { element: 'self', path: 'user' },
    order: true,
    orderLabel: 'firstName',
  },
  {
    props: ['email'],
    label: 'Email',
    link: { element: 'self', path: 'user' },
    order: true,
    orderLabel: 'email',
  },
  {
    props: ['edit'],
    label: 'Edit',
    link: { element: 'self', path: 'user' },
    order: false,
    align: 'center',
  },
];

const Users = () => {
  // redux
  const dispatch = useDispatch();

  const limit = useSelector((state) => state.usersPagination.limit);
  const page = useSelector((state) => state.usersPagination.page);
  const orderField = useSelector((state) => state.usersPagination.orderField);
  const orderDesc = useSelector((state) => state.usersPagination.orderDesc);
  const searchInput = useSelector((state) => state.usersPagination.searchInput);
  const mounted = useRef(true);

  // state
  const defaultState = {
    limit,
    page,
    gotoPage: page,
    searchInput,
  };
  const [state, setState] = useReducer(
    (curState, newState) => ({ ...curState, ...newState }),
    defaultState
  );
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [allChecked, setAllChecked] = useState(false);
  const [prevLimit, setPrevLimit] = useState(25);
  const [prevPage, setPrevPage] = useState(1);
  const [prevActiveType, setPrevActiveType] = useState(null);
  const [prevStatus, setPrevStatus] = useState(null);
  const [prevOrderField, setPrevOrderField] = useState('label');
  const [prevOrderDesc, setPrevOrderDesc] = useState(false);
  const [reLoading, setReLoading] = useState(false);
  const [prevReLoading, setPrevReLoading] = useState(false);

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    setState({
      [name]: value,
    });
  };

  const prepareItems = useCallback((itemsParam) => {
    const newItems = [];
    for (let i = 0; i < itemsParam.length; i += 1) {
      const item = itemsParam[i];
      item.checked = false;
      newItems.push(item);
    }
    return newItems;
  }, []);

  const load = useCallback(async () => {
    setLoading(false);
    setReLoading(false);
    setPrevReLoading(false);
    setTableLoading(true);
    const params = {
      page: state.page,
      limit: state.limit,
      orderField,
      orderDesc,
      status: state.status,
    };
    if (state.searchInput !== '') {
      params.label = state.searchInput;
    }
    const responseData = await getData(`users`, params);
    if (mounted.current) {
      const { data: newData } = responseData;
      const currentPage = newData.currentPage > 0 ? newData.currentPage : 1;
      const newItems = await prepareItems(newData.data);
      setItems(newItems);
      setTableLoading(false);
      setState({ page: currentPage });
      setTotalPages(newData.totalPages);
      setTotalItems(newData.totalItems);
    }

    return true;
  }, [state, prepareItems, orderDesc, orderField, mounted]);

  useEffect(() => {
    load();
    return () => {
      mounted.current = false;
    };
  }, []);

  const updateStorePagination = useCallback(
    ({
      limitParam = null,
      pageParam = null,
      activeTypeParam = null,
      orderFieldParam = '',
      orderDescParam = false,
      statusParam = null,
      searchInputParam = '',
    }) => {
      const limitCopy = limitParam === null ? state.limit : limitParam;
      const pageCopy = pageParam === null ? state.page : pageParam;
      const activeTypeCopy =
        activeTypeParam === null ? state.activeType : activeTypeParam;
      const orderFieldCopy =
        orderFieldParam === null ? state.orderField : orderFieldParam;
      const orderDescCopy =
        orderDescParam === null ? state.orderDesc : orderDescParam;
      const statusCopy = statusParam === null ? state.status : statusParam;
      const searchInputCopy =
        searchInputParam === null ? state.searchInput : searchInputParam;
      const payload = {
        limit: limitCopy,
        page: pageCopy,
        activeType: activeTypeCopy,
        orderField: orderFieldCopy,
        orderDesc: orderDescCopy,
        status: statusCopy,
        searchInput: searchInputCopy,
      };
      dispatch(setPaginationParams('users', payload));
    },
    [
      dispatch,
      state.activeType,
      state.limit,
      state.orderDesc,
      state.orderField,
      state.page,
      state.searchInput,
      state.status,
    ]
  );

  const clearSearch = () => {
    setState({ searchInput: '' });
    updateStorePagination({ searchInput: '' });
    setLoading(true);
  };

  const updatePage = (value) => {
    if (value > 0 && value !== state.page) {
      updateStorePagination({ page: value });
      setState({
        page: value,
        gotoPage: value,
      });
    }
  };

  const gotoPage = () => {
    if (Number(state.gotoPage) > 0 && state.gotoPage !== state.page) {
      updateStorePagination({ page: state.gotoPage });
      setState({ page: Number(state.gotoPage) });
    }
  };

  const updateLimit = (value) => {
    updateStorePagination({ limit: value });
    setState({ limit: value });
  };

  const toggleSelected = (i) => {
    const index = i - (Number(state.page) - 1) * limit;
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
    if (prevLimit !== state.limit) {
      setPrevLimit(state.limit);
      clearSelectedAll();
      load();
    }
    if (prevPage !== state.page) {
      setPrevPage(state.page);
      clearSelectedAll();
      load();
    }
    if (prevActiveType !== state.activeType) {
      setPrevActiveType(state.activeType);
      clearSelectedAll();
      load();
    }
    if (prevStatus !== state.status) {
      setPrevStatus(state.status);
      clearSelectedAll();
      load();
    }
    if (prevOrderField !== orderField) {
      setPrevOrderField(orderField);
      clearSelectedAll();
      load();
    }
    if (prevOrderDesc !== orderDesc) {
      setPrevOrderDesc(orderDesc);
      clearSelectedAll();
      load();
    }
    if (reLoading && !prevReLoading) {
      setPrevReLoading(reLoading);
      clearSelectedAll();
      load();
    }
  }, [
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
    state.limit,
    state.page,
    state.activeType,
    state.status,
  ]);

  const pageActions = (
    <Suspense fallback={renderLoader()}>
      <PageActions
        clearSearch={clearSearch}
        current_page={state.page}
        defaultLimit={25}
        gotoPage={gotoPage}
        gotoPageValue={state.gotoPage}
        handleChange={handleChange}
        limit={state.limit}
        page={state.page}
        pageType="users"
        reload={reload}
        searchInput={state.searchInput}
        totalPages={totalPages}
        types={[]}
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
    const listIndex = (Number(state.page) - 1) * limit;
    const addNewBtn = (
      <Link
        className="btn btn-outline-secondary add-new-item-btn"
        to="/user/new"
        href="/user/new"
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
          type="users"
          allChecked={allChecked}
          toggleSelectedAll={toggleSelectedAll}
          toggleSelected={toggleSelected}
        />
      </Suspense>
    );

    content = (
      <div className="users-container">
        {pageActions}
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody className="users-card">{table}</CardBody>
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
export default Users;
