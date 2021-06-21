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
import EditModal from '../components/SlideshowModal';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));
const PageActions = lazy(() => import('../components/Page.actions'));
const List = lazy(() => import('../components/List'));
// const EditModal = lazy(() => import('../components/SlideshowModal'));

const heading = 'Slideshow';
const breadcrumbsItems = [
  { label: heading, icon: 'fa fa-image', active: true, path: '' },
];

const Slideshow = () => {
  // redux
  const dispatch = useDispatch();

  const limit = useSelector((state) => state.slideshowPagination.limit);
  const activeType = useSelector(
    (state) => state.slideshowPagination.activeType
  );
  const page = useSelector((state) => state.slideshowPagination.page);
  const orderField = useSelector(
    (state) => state.slideshowPagination.orderField
  );
  const orderDesc = useSelector((state) => state.slideshowPagination.orderDesc);
  const status = useSelector((state) => state.slideshowPagination.status);
  const searchInput = useSelector(
    (state) => state.slideshowPagination.searchInput
  );
  const mounted = useRef(true);

  // state
  const defaultState = {
    limit,
    activeType,
    page,
    gotoPage: page,
    status,
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

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [itemId, setItemId] = useState(null);

  const reload = () => {
    setReLoading(true);
  };

  const toggleModal = (_id = null) => {
    setEditModalVisible(!editModalVisible);
    setItemId(_id);
  };

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
      modal: toggleModal,
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
    {
      props: ['edit'],
      label: 'Edit',
      modal: Slideshow.toggleModal,
      order: false,
      align: 'center',
    },
  ];

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
      params.slideshowType = state.activeType;
    }
    const responseData = await getData(`slideshow-items`, params);
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
      dispatch(setPaginationParams('slideshow', payload));
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

  const setActiveType = (type) => {
    updateStorePagination({ activeType: type });
    setState({
      activeType: type,
    });
  };

  const setStatus = (statusParam = null) => {
    updateStorePagination({ status: statusParam });
    setState({
      status: statusParam,
    });
  };

  const clearSearch = () => {
    setState({ searchInput: '' });
    updateStorePagination({ searchInput: '' });
    setLoading(true);
  };

  /* const updateOrdering = (orderFieldParam = '') => {
    if (orderFieldParam !== '') {
      const orderDescending =
        orderFieldParam === state.orderField ? !state.orderDesc : false;
      updateStorePagination({
        orderField: orderFieldParam,
        orderDesc: orderDescending,
      });
    }
  }; */

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
        activeType={state.activeType}
        clearSearch={clearSearch}
        current_page={state.page}
        defaultLimit={25}
        gotoPage={gotoPage}
        gotoPageValue={state.gotoPage}
        handleChange={handleChange}
        limit={state.limit}
        page={state.page}
        pageType="slideshow"
        reload={reload}
        searchInput={state.searchInput}
        setActiveType={setActiveType}
        setStatus={setStatus}
        status={state.status}
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
          type="slideshow"
          allChecked={allChecked}
          toggleSelectedAll={toggleSelectedAll}
          toggleSelected={toggleSelected}
        />
      </Suspense>
    );

    content = (
      <div className="slideshow-container">
        {pageActions}
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody className="slideshow-card">{table}</CardBody>
            </Card>
          </div>
        </div>
        {pageActions}
        {addNewBtn}
        <EditModal
          visible={editModalVisible}
          _id={itemId}
          toggle={toggleModal}
          reload={reload}
        />
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
export default Slideshow;
