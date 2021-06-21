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
import { deleteData, getData, renderLoader } from '../helpers';
import { setPaginationParams } from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));
const PageActions = lazy(() => import('../components/Page.actions'));
const BatchActions = lazy(() => import('../components/add-batch-relations'));
const List = lazy(() => import('../components/List'));

const heading = 'Temporal';
const breadcrumbsItems = [
  { label: heading, icon: 'pe-7s-clock', active: true, path: '' },
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
    link: { element: 'self', path: 'temporal' },
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
    link: { element: 'self', path: 'temporal' },
    order: false,
    align: 'center',
  },
];

const Temporal = () => {
  // redux
  const dispatch = useDispatch();

  const limit = useSelector((state) => state.temporalsPagination.limit);
  const page = useSelector((state) => state.temporalsPagination.page);
  const orderField = useSelector(
    (state) => state.temporalsPagination.orderField
  );
  const orderDesc = useSelector((state) => state.temporalsPagination.orderDesc);
  const searchInput = useSelector(
    (state) => state.temporalsPagination.searchInput
  );
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
    if (state.activeType !== null) {
      params.temporalType = state.activeType;
    }
    const responseData = await getData(`temporals`, params);
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
      dispatch(setPaginationParams('temporals', payload));
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

  const deleteSelected = async () => {
    const selectedItems = items
      .filter((item) => item.checked)
      .map((item) => item._id);
    const data = {
      _ids: selectedItems,
    };
    const responseData = await deleteData(`temporals`, data);
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
        clearSearch={clearSearch}
        current_page={state.page}
        defaultLimit={25}
        gotoPage={gotoPage}
        gotoPageValue={state.gotoPage}
        handleChange={handleChange}
        limit={state.limit}
        page={state.page}
        pageType="temporals"
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
          type="temporals"
          allChecked={allChecked}
          toggleSelectedAll={toggleSelectedAll}
          toggleSelected={toggleSelected}
        />
      </Suspense>
    );

    content = (
      <div className="temporals-container">
        {pageActions}
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody className="temporals-card">
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
export default Temporal;
