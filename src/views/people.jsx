import React, {
  useEffect,
  useState,
  useCallback,
  useReducer,
  useRef,
  Suspense,
  lazy,
} from 'react';
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
  const mounted = useRef(true);

  // state
  const defaultState = {
    limit,
    activeType,
    page,
    gotoPage: page,
    status,
    searchInput,
    advancedSearchInputs,
    classpieceSearchInput: '',
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
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [classpieceItems, setClasspieceItems] = useState([]);
  const [classpieceId, setClasspieceId] = useState(null);

  const [prevLimit, setPrevLimit] = useState(25);
  const [prevPage, setPrevPage] = useState(1);
  const [prevActiveType, setPrevActiveType] = useState(null);
  const [prevStatus, setPrevStatus] = useState(null);
  const [prevOrderField, setPrevOrderField] = useState('firstName');
  const [prevOrderDesc, setPrevOrderDesc] = useState(false);
  const [prevClasspieceId, setPrevClasspieceId] = useState(null);
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
      item.organisations = item.affiliations;
      delete item.affiliations;
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
    if (classpieceId !== null) {
      params.classpieceId = classpieceId;
    }
    if (state.searchInput !== '' && !advancedSearch) {
      params.label = state.searchInput;
    } else if (state.advancedSearchInputs.length > 0 && advancedSearch) {
      for (let i = 0; i < state.advancedSearchInputs.length; i += 1) {
        const advancedSearchInput = state.advancedSearchInputs[i];
        params[advancedSearchInput.select] = advancedSearchInput.input;
      }
    }
    if (state.activeType !== null) {
      params.personType = state.activeType;
    }
    const responseData = await getData(`people`, params);
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
  }, [
    state,
    advancedSearch,
    classpieceId,
    prepareItems,
    orderDesc,
    orderField,
    mounted,
  ]);

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
      advancedSearchInputsParam = [],
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
      const advancedSearchInputsCopy =
        advancedSearchInputsParam === null
          ? state.advancedSearchInputs
          : advancedSearchInputsParam;
      const payload = {
        limit: limitCopy,
        page: pageCopy,
        activeType: activeTypeCopy,
        orderField: orderFieldCopy,
        orderDesc: orderDescCopy,
        status: statusCopy,
        searchInput: searchInputCopy,
        advancedSearchInputs: advancedSearchInputsCopy,
      };
      dispatch(setPaginationParams('people', payload));
    },
    [
      dispatch,
      state.activeType,
      state.advancedSearchInputs,
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

  const selectClasspiece = (value) => {
    setClasspieceId(value);
  };

  const classpieceSearch = useCallback(
    async (e) => {
      e.preventDefault();
      mounted.current = true;
      const classpieceType =
        resourcesTypes.length > 0
          ? resourcesTypes.find((t) => t.labelId === 'Classpiece')._id
          : '';
      if (state.classpieceSearchInput < 2) {
        return false;
      }
      const params = {
        page: 1,
        limit: 25,
        label: state.classpieceSearchInput,
        systemType: classpieceType,
      };
      const responseData = await getData(`resources`, params);
      if (mounted.current && responseData.status) {
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
    [state.classpieceSearchInput, resourcesTypes]
  );

  const classpieceClearSearch = () => {
    setState({ classpieceSearchInput: '' });
    setClasspieceItems([]);
    setClasspieceId(null);
    setLoading(true);
  };

  const clearAdvancedSearch = () => {
    setState({ advancedSearchInputs: [] });
    setAdvancedSearch(false);
    updateStorePagination({ advancedSearchInputs: [] });
    setLoading(true);
  };

  const updateAdvancedSearchInputs = (value) => {
    setState({ advancedSearchInputs: value });
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
    if (prevClasspieceId !== classpieceId) {
      setPrevClasspieceId(classpieceId);
      clearSelectedAll();
      load();
    }
    if (reLoading && !prevReLoading) {
      setPrevReLoading(reLoading);
      clearSelectedAll();
      load();
    }
  }, [
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
        activeType={state.activeType}
        advancedSearch={advancedSearch}
        classpieceClearSearch={classpieceClearSearch}
        classpieceItems={classpieceItems}
        classpieceSearch={classpieceSearch}
        classpieceSearchInput={state.classpieceSearchInput}
        clearAdvancedSearch={clearAdvancedSearch}
        clearSearch={clearSearch}
        current_page={state.page}
        defaultLimit={25}
        gotoPage={gotoPage}
        gotoPageValue={state.gotoPage}
        handleChange={handleChange}
        limit={state.limit}
        page={state.page}
        pageType="people"
        reload={reload}
        searchElements={searchElements}
        searchInput={state.searchInput}
        setActiveType={setActiveType}
        setAdvancedSearch={setAdvancedSearch}
        setStatus={setStatus}
        status={state.status}
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
