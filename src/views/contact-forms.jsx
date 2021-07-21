import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import { Card, CardBody, Spinner } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getData, renderLoader } from '../helpers';
import { setPaginationParams } from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));
const PageActions = lazy(() => import('../components/Page.actions'));
const List = lazy(() => import('../components/List'));

const heading = 'Contact Forms';
const breadcrumbsItems = [
  { label: heading, icon: 'pe-7s-mail', active: true, path: '' },
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
    props: ['name'],
    label: 'Name',
    link: { element: 'self', path: 'contact-form' },
    order: true,
    orderLabel: 'firstName',
  },
  {
    props: ['email'],
    label: 'Email',
    link: { element: 'self', path: 'contact-form' },
    order: true,
    orderLabel: 'email',
  },
  {
    props: ['subject'],
    label: 'Subject',
    link: { element: 'self', path: 'contact-form' },
    order: true,
    orderLabel: 'subject',
  },
  {
    props: ['message'],
    label: 'Message',
    link: { element: 'self', path: 'contact-form' },
    order: true,
    orderLabel: 'message',
  },
  {
    props: ['edit'],
    label: 'Edit',
    link: { element: 'self', path: 'user' },
    order: false,
    align: 'center',
  },
];

const ContactForms = () => {
  // redux
  const dispatch = useDispatch();

  const limit = useSelector((state) => state.contactFormsPagination.limit);
  const page = useSelector((state) => state.contactFormsPagination.page);
  const orderField = useSelector(
    (state) => state.contactFormsPagination.orderField
  );
  const orderDesc = useSelector(
    (state) => state.contactFormsPagination.orderDesc
  );
  const searchInput = useSelector(
    (state) => state.contactFormsPagination.searchInput
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
      orderFieldParam = null,
      orderDescParam = null,
      searchInputParam = null,
    }) => {
      const limitCopy = limitParam === null ? limit : limitParam;
      const pageCopy = pageParam === null ? page : pageParam;
      const orderFieldCopy =
        orderFieldParam === null ? orderField : orderFieldParam;
      const orderDescCopy =
        orderDescParam === null ? orderDesc : orderDescParam;
      const searchInputCopy =
        searchInputParam === null ? searchInput : searchInputParam;
      const payload = {
        limit: limitCopy,
        page: pageCopy,
        orderField: orderFieldCopy,
        orderDesc: orderDescCopy,
        searchInput: searchInputCopy,
      };
      dispatch(setPaginationParams('users', payload));
    },
    [dispatch, limit, orderDesc, orderField, page, searchInput]
  );

  const load = useCallback(async () => {
    setLoading(false);
    setReLoading(false);
    setPrevReLoading(false);
    setTableLoading(true);
    const params = {
      page,
      limit,
      orderField,
      orderDesc,
    };
    if (searchInput !== '') {
      params.label = searchInput;
    }
    const responseData = await getData(`contact-forms`, params);
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
    limit,
    page,
    searchInput,
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
    prevOrderField,
    prevOrderDesc,
    prevReLoading,
    reLoading,
    limit,
    page,
  ]);

  const pageActions = (
    <Suspense fallback={renderLoader()}>
      <PageActions
        clearSearch={clearSearch}
        current_page={page}
        defaultLimit={25}
        gotoPage={gotoPage}
        gotoPageValue={gotoPageVal}
        handleChange={handleChange}
        limit={limit}
        page={page}
        pageType="contact-forms"
        reload={reload}
        searchInput={searchInput}
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
    const listIndex = (Number(page) - 1) * limit;
    const addNewBtn = [];

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
export default ContactForms;
