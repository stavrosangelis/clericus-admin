import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import axios from 'axios';
import { Label, Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteData, getResourceThumbnailURL, renderLoader } from '../helpers';
import { setPaginationParams } from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const PageActions = lazy(() => import('../components/Page.actions'));
const BatchActions = lazy(() => import('../components/add-batch-relations'));
const List = lazy(() => import('../components/List'));

const { REACT_APP_APIPATH: APIPath } = process.env;
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
    link: { element: 'self', path: '/person' },
    order: false,
    align: 'center',
  },
  {
    props: ['firstName'],
    label: 'First Name',
    link: { element: 'self', path: '/person' },
    order: true,
    orderLabel: 'firstName',
  },
  {
    props: ['lastName'],
    label: 'Last Name',
    link: { element: 'self', path: '/person' },
    order: true,
    orderLabel: 'lastName',
  },
  {
    props: ['organisations'],
    label: 'Organisations',
    link: {
      element: 'organisations',
      key: '_id',
      path: '/organisation',
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
    link: { element: 'self', path: '/person' },
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

function People() {
  // redux
  const dispatch = useDispatch();
  const { resourcesTypes, personTypes, peoplePagination } = useSelector(
    (state) => state
  );
  const {
    activeType,
    advancedSearchInputs,
    classpieceId,
    classpieceSearchInput,
    limit,
    orderDesc,
    orderField,
    page,
    searchInput,
    status,
    totalItems,
    totalPages,
  } = peoplePagination;

  // state
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [classpieceItems, setClasspieceItems] = useState([]);
  const [gotoPage, setGotoPage] = useState(page);

  const prepareItems = useCallback((itemsParam) => {
    const newItems = [];
    const { length } = itemsParam;
    for (let i = 0; i < length; i += 1) {
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
      activeTypeParam = null,
      advancedSearchInputsParam = null,
      classpieceIdParam = null,
      classpieceSearchInputParam = null,
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
      if (activeTypeParam !== null) {
        payload.activeType = activeTypeParam;
      }
      if (advancedSearchInputsParam !== null) {
        payload.advancedSearchInputs = advancedSearchInputsParam;
      }
      if (classpieceIdParam !== null) {
        payload.classpieceId = classpieceIdParam;
      }
      if (classpieceSearchInputParam !== null) {
        payload.classpieceSearchInput = classpieceSearchInputParam;
      }
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
      if (statusParam !== null) {
        payload.status = statusParam;
      }
      if (totalItemsParam !== null) {
        payload.totalItems = totalItemsParam;
      }
      if (totalPagesParam !== null) {
        payload.totalPages = totalPagesParam;
      }
      dispatch(setPaginationParams('people', payload));
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
      case 'classpieceSearchInput':
        updateStorePagination({ classpieceSearchInputParam: value });
        break;
      default:
        break;
    }
  };

  const clearSearch = () => {
    updateStorePagination({ searchInputParam: '' });
    reload();
  };

  const selectClasspiece = useCallback(
    (value) => {
      updateStorePagination({ classpieceIdParam: value });
      reload();
    },
    [updateStorePagination]
  );

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
          const statusParam = status !== '' ? status : null;
          const params = {
            page,
            limit,
            orderField,
            orderDesc,
            status: statusParam,
          };
          const { length: advancedLength = 0 } = advancedSearchInputs;
          if (classpieceId !== null && classpieceId !== '') {
            params.classpieceId = classpieceId;
          }
          if (searchInput !== '' && !advancedSearch) {
            params.label = searchInput;
          } else if (advancedLength > 0 && advancedSearch) {
            for (let i = 0; i < advancedLength; i += 1) {
              const advancedSearchInput = advancedSearchInputs[i];
              params[advancedSearchInput.select] = advancedSearchInput.input;
            }
          }
          if (activeType !== null && activeType !== '') {
            params.personType = activeType;
          }
          const responseData = await axios({
            method: 'get',
            url: `${APIPath}people`,
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
    activeType,
    advancedSearch,
    advancedSearchInputs,
    allChecked,
    classpieceId,
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
    updatePage,
    updateStorePagination,
  ]);

  const classpieceSearch = useCallback(
    async (e) => {
      e.preventDefault();
      if (classpieceSearchInput < 2) {
        return false;
      }
      const loadData = async () => {
        const systemType =
          resourcesTypes.length > 0
            ? resourcesTypes.find((t) => t.labelId === 'Classpiece')._id
            : '';
        const params = {
          page: 1,
          limit: 25,
          label: classpieceSearchInput,
          systemType,
        };
        const responseData = await axios({
          method: 'get',
          url: `${APIPath}resources`,
          crossDomain: true,
          params,
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
      if (responseData.status) {
        const data = responseData.data.data.map((item) => {
          const thumbnailPath = getResourceThumbnailURL(item);
          const { _id = '', label = '' } = item;
          const thumbnailImage =
            thumbnailPath !== null ? (
              <img src={thumbnailPath} alt={label} />
            ) : null;
          return (
            <div
              className="classpiece-result"
              key={_id}
              onClick={() => selectClasspiece(_id)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="select classpiece"
            >
              {thumbnailImage} <Label>{label}</Label>
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

  const deleteSelected = async () => {
    const _ids = items.filter((item) => item.checked).map((item) => item._id);
    const responseData = await deleteData(`people`, { _ids });
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
        advancedSearch={advancedSearch}
        classpieceClearSearch={classpieceClearSearch}
        classpieceItems={classpieceItems}
        classpieceSearch={classpieceSearch}
        classpieceSearchInput={classpieceSearchInput}
        clearAdvancedSearch={clearAdvancedSearch}
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

  const listIndex = (Number(page) - 1) * limit;
  const selectedItems = items.filter((item) => item.checked);

  const batchActions = (
    <div className="batch-actions">
      <Suspense fallback={null}>
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
                  type="people"
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
        to="/person/new"
      >
        <i className="fa fa-plus" />
      </Link>
    </div>
  );
}
export default People;
