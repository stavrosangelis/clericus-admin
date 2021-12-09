import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Card, CardBody, Spinner } from 'reactstrap';
// import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import EditImport from '../../components/import-data/Edit.import';
import { getData, renderLoader } from '../../helpers';
import { setPaginationParams } from '../../redux/actions';

const Breadcrumbs = lazy(() => import('../../components/breadcrumbs'));
const PageActions = lazy(() => import('../../components/Page.actions'));
const List = lazy(() => import('../../components/List'));

const heading = 'Import Data Plans';
const breadcrumbsItems = [
  { label: heading, icon: 'fa fa-database', active: true, path: '' },
];

const ImportPlans = () => {
  // redux
  const dispatch = useDispatch();

  const limit = useSelector((state) => state.importsPagination.limit);
  const page = useSelector((state) => state.importsPagination.page);
  const orderField = useSelector((state) => state.importsPagination.orderField);
  const orderDesc = useSelector((state) => state.importsPagination.orderDesc);
  const searchInput = useSelector(
    (state) => state.importsPagination.searchInput
  );

  // state
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
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

  const [editId, setEditId] = useState('new');
  const [editImportVisible, setEditImportVisible] = useState(false);

  const toggleImportVisible = (_id = null) => {
    setEditImportVisible(!editImportVisible);
    setEditId(_id);
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
      link: { element: 'self', path: 'import-plan' },
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
      props: ['details'],
      label: 'Details',
      link: { element: 'self', path: 'import-plan' },
      order: false,
      align: 'center',
    },
    {
      props: ['edit'],
      label: 'Edit',
      modal: toggleImportVisible,
      order: false,
      align: 'center',
    },
  ];

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
      dispatch(setPaginationParams('imports', payload));
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
    const responseData = await getData(`imports`, params);
    return responseData;
  }, [limit, page, searchInput, orderDesc, orderField]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    updateStorePagination({
      [`${name}Param`]: newValue,
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

  const reload = () => {
    setReLoading(true);
  };

  useEffect(() => {
    let unmount = false;
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
      !unmount &&
      (loading ||
        prevLimit !== limit ||
        prevPage !== page ||
        prevOrderDesc !== orderDesc ||
        (reLoading && !prevReLoading))
    ) {
      const update = async () => {
        const responseData = await load();
        const { data: newData } = responseData;
        const { data: itemsData } = newData || [];
        const newItems = prepareItems(itemsData);
        let currentPage = newData.currentPage > 0 ? newData.currentPage : 1;
        if (currentPage > newData.totalPages && newData.totalPages > 0) {
          currentPage = newData.totalPages;
        }
        updateStorePagination({ pageParam: currentPage });
        setItems(newItems);
        setTotalPages(newData.totalPages);
        setTotalItems(newData.totalItems);
        setTableLoading(false);
      };
      update();
    }
    return () => {
      unmount = true;
    };
  }, [
    loading,
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
    prepareItems,
    updateStorePagination,
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
        pageType="imports"
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
    const addNewBtn = (
      <div
        className="btn btn-outline-secondary add-new-item-btn"
        onClick={() => toggleImportVisible('new')}
        onKeyPress={() => toggleImportVisible('new')}
        role="button"
        tabIndex="0"
      >
        <i className="fa fa-plus" />
      </div>
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
          type="imports"
          allChecked={false}
          toggleSelectedAll={() => {}}
          toggleSelected={() => {}}
        />
      </Suspense>
    );

    content = (
      <div className="spatials-container">
        {pageActions}
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody className="spatials-card">{table}</CardBody>
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
      <EditImport
        _id={editId}
        visible={editImportVisible}
        toggle={toggleImportVisible}
        reload={reload}
        items={items}
      />
    </div>
  );
};

export default ImportPlans;
