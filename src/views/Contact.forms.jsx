import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import axios from 'axios';
import { Card, CardBody } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { renderLoader } from '../helpers';
import { setPaginationParams } from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const PageActions = lazy(() => import('../components/Page.actions'));
const List = lazy(() => import('../components/List'));

const { REACT_APP_APIPATH: APIPath } = process.env;
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
    link: { element: 'self', path: '/contact-form' },
    order: true,
    orderLabel: 'firstName',
  },
  {
    props: ['email'],
    label: 'Email',
    link: { element: 'self', path: '/contact-form' },
    order: true,
    orderLabel: 'email',
  },
  {
    props: ['subject'],
    label: 'Subject',
    link: { element: 'self', path: '/contact-form' },
    order: true,
    orderLabel: 'subject',
  },
  {
    props: ['message'],
    label: 'Message',
    link: { element: 'self', path: '/contact-form' },
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

function ContactForms() {
  // redux
  const dispatch = useDispatch();
  const { contactFormsPagination } = useSelector((state) => state);

  const {
    limit,
    orderDesc,
    orderField,
    page,
    searchInput,
    totalItems,
    totalPages,
  } = contactFormsPagination;

  // state
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [gotoPage, setGotoPage] = useState(page);

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
      dispatch(setPaginationParams('users', payload));
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
            url: `${APIPath}contact-forms`,
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
            setItems(newData);
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
    limit,
    loading,
    orderField,
    orderDesc,
    page,
    searchInput,
    totalPages,
    updatePage,
    updateStorePagination,
  ]);

  const pageActions = (
    <Suspense fallback={renderLoader()}>
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
                  type="usergroups"
                />
              </Suspense>
            </CardBody>
          </Card>
          {pageActions}
        </div>
      </div>
    </div>
  );
}
export default ContactForms;
