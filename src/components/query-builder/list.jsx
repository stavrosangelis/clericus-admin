import axios from 'axios';
import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Card, CardBody, Spinner, Table } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import {
  toggleQueryBuilderSubmit,
  setPaginationParams,
  toggleClearQueryBuildResults,
} from '../../redux/actions';

const PageActions = lazy(() => import('./page.actions'));
const BatchActions = lazy(() => import('../add-batch-relations'));

// table parts
const EventsColumns = lazy(() => import('./events/columns'));
const EventsRow = lazy(() => import('./events/row'));
const OrganisationsColumns = lazy(() => import('./organisations/columns'));
const OrganisationsRow = lazy(() => import('./organisations/row'));
const PeopleColumns = lazy(() => import('./people/columns'));
const PeopleRow = lazy(() => import('./people/row'));
const ResourcesColumns = lazy(() => import('./resources/columns'));
const ResourcesRow = lazy(() => import('./resources/row'));
const SpatialColumns = lazy(() => import('./spatial/columns'));
const SpatialRow = lazy(() => import('./spatial/row'));
const TemporalColumns = lazy(() => import('./temporal/columns'));
const TemporalRow = lazy(() => import('./temporal/row'));

const APIPath = process.env.REACT_APP_APIPATH;

const List = () => {
  // redux store
  const dispatch = useDispatch();
  const entityType = useSelector((state) => state.queryBuildType);
  const nodes = useSelector((state) => state.queryBuildResults.nodes || []);
  const queryBuilderSearching = useSelector(
    (state) => state.queryBuilderSearching
  );
  const paginationParams = useSelector((state) => state.queryBuilderPagination);
  const clearQueryBuildResults = useSelector(
    (state) => state.clearQueryBuildResults
  );

  // state
  const [items, setItems] = useState([]);
  const [allChecked, setAllChecked] = useState(false);

  // temp
  const { page: pageParam, limit } = paginationParams;
  const page = pageParam !== 0 ? pageParam : 1;

  useEffect(() => {
    if (nodes.length > 0) {
      const newItems = nodes.map((n) => {
        const newN = n;
        newN.checked = false;
        return newN;
      });
      setItems(newItems);
    }
  }, [nodes]);

  useEffect(() => {
    if (clearQueryBuildResults) {
      setItems([]);
      dispatch(toggleClearQueryBuildResults(false));
    }
  }, [clearQueryBuildResults, dispatch]);

  const removeSelected = (_id = null) => {
    if (_id == null) {
      return false;
    }
    const newItems = items.map((item) => {
      const newItem = item;
      if (newItem._id === _id) {
        newItem.checked = false;
      }
      return newItem;
    });
    setItems(newItems);
    return false;
  };

  const deleteSelected = async () => {
    const selectedItems = items
      .filter((item) => item.checked)
      .map((item) => item._id);
    const data = {
      _ids: selectedItems,
    };
    let url;
    switch (entityType) {
      case 'Event': {
        url = `${APIPath}events`;
        break;
      }
      case 'Organisation': {
        url = `${APIPath}organisations`;
        break;
      }
      case 'Person': {
        url = `${APIPath}people`;
        break;
      }
      case 'Resource': {
        url = `${APIPath}resources`;
        break;
      }
      case 'Spatial': {
        url = `${APIPath}spatials`;
        break;
      }
      case 'Temporal': {
        url = `${APIPath}temporals`;
        break;
      }
      default: {
        url = null;
      }
    }
    if (url === null) {
      return false;
    }
    const deleteItems = await axios({
      method: 'delete',
      url,
      crossDomain: true,
      data,
    })
      .then(() => true)
      .catch((error) => {
        console.log(error);
      });
    if (deleteItems) {
      setAllChecked(false);
    }
    dispatch(toggleQueryBuilderSubmit(true));
    return false;
  };

  const toggleSelectedAll = () => {
    const newItems = items.map((item) => {
      const newItem = item;
      newItem.checked = !allChecked;
      return newItem;
    });
    setItems(newItems);
    setAllChecked(!allChecked);
  };

  const toggleSelected = (i) => {
    const newItems = Object.assign([], items);
    newItems[i].checked = !newItems[i].checked;
    setItems(newItems);
  };

  const selectedItems = items.filter((item) => item.checked);

  const batchActions = (
    <Suspense fallback={[]}>
      <BatchActions
        items={selectedItems}
        removeSelected={removeSelected}
        type={entityType}
        relationProperties={[]}
        deleteSelected={deleteSelected}
        selectAll={toggleSelectedAll}
        allChecked={allChecked}
        reload={() => {}}
      />
    </Suspense>
  );

  const pageActions = (
    <Suspense fallback={[]}>
      <PageActions pageType={entityType} />
    </Suspense>
  );

  const updateOrdering = (value) => {
    const paginationParamsCopy = { ...paginationParams };
    const direction =
      paginationParamsCopy.orderField === value
        ? !paginationParamsCopy.orderDesc
        : paginationParamsCopy.orderDesc;
    paginationParamsCopy.orderField = value;
    paginationParamsCopy.orderDesc = direction;
    dispatch(setPaginationParams('queryBuilder', paginationParamsCopy));
    dispatch(toggleQueryBuilderSubmit());
  };

  let columns = [];
  let rows = [];
  if (entityType === 'Event') {
    columns = (
      <Suspense fallback={[]}>
        <EventsColumns
          allChecked={allChecked}
          toggleSelectedAll={toggleSelectedAll}
          updateOrdering={updateOrdering}
          orderField={paginationParams.orderField}
          orderDesc={paginationParams.orderDesc}
        />
      </Suspense>
    );
    rows =
      items.map((item, i) => (
        <Suspense fallback={[]} key={item._id}>
          <EventsRow
            key={item._id}
            item={item}
            page={page}
            index={i}
            limit={limit}
            toggleSelected={toggleSelected}
          />
        </Suspense>
      )) || [];
  }
  if (entityType === 'Organisation') {
    columns = (
      <Suspense fallback={[]}>
        <OrganisationsColumns
          allChecked={allChecked}
          toggleSelectedAll={toggleSelectedAll}
          updateOrdering={updateOrdering}
          orderField={paginationParams.orderField}
          orderDesc={paginationParams.orderDesc}
        />
      </Suspense>
    );
    rows =
      items.map((item, i) => (
        <Suspense fallback={[]} key={item._id}>
          <OrganisationsRow
            key={item._id}
            item={item}
            page={page}
            index={i}
            limit={limit}
            toggleSelected={toggleSelected}
          />
        </Suspense>
      )) || [];
  }
  if (entityType === 'Person') {
    columns = (
      <Suspense fallback={[]}>
        <PeopleColumns
          allChecked={allChecked}
          toggleSelectedAll={toggleSelectedAll}
          updateOrdering={updateOrdering}
          orderField={paginationParams.orderField}
          orderDesc={paginationParams.orderDesc}
        />
      </Suspense>
    );
    rows =
      items.map((item, i) => (
        <Suspense fallback={[]} key={item._id}>
          <PeopleRow
            key={item._id}
            item={item}
            page={page}
            index={i}
            limit={limit}
            toggleSelected={toggleSelected}
          />
        </Suspense>
      )) || [];
  }
  if (entityType === 'Resource') {
    columns = (
      <Suspense fallback={[]}>
        <ResourcesColumns
          allChecked={allChecked}
          toggleSelectedAll={toggleSelectedAll}
          updateOrdering={updateOrdering}
          orderField={paginationParams.orderField}
          orderDesc={paginationParams.orderDesc}
        />
      </Suspense>
    );
    rows =
      items.map((item, i) => (
        <Suspense fallback={[]} key={item._id}>
          <ResourcesRow
            key={item._id}
            item={item}
            page={page}
            index={i}
            limit={limit}
            toggleSelected={toggleSelected}
          />
        </Suspense>
      )) || [];
  }
  if (entityType === 'Spatial') {
    columns = (
      <Suspense fallback={[]}>
        <SpatialColumns
          allChecked={allChecked}
          toggleSelectedAll={toggleSelectedAll}
          updateOrdering={updateOrdering}
          orderField={paginationParams.orderField}
          orderDesc={paginationParams.orderDesc}
        />
      </Suspense>
    );
    rows =
      items.map((item, i) => (
        <Suspense fallback={[]} key={item._id}>
          <SpatialRow
            key={item._id}
            item={item}
            page={page}
            index={i}
            limit={limit}
            toggleSelected={toggleSelected}
          />
        </Suspense>
      )) || [];
  }
  if (entityType === 'Temporal') {
    columns = (
      <Suspense fallback={[]}>
        <TemporalColumns
          allChecked={allChecked}
          toggleSelectedAll={toggleSelectedAll}
          updateOrdering={updateOrdering}
          orderField={paginationParams.orderField}
          orderDesc={paginationParams.orderDesc}
        />
      </Suspense>
    );
    rows =
      items.map((item, i) => (
        <Suspense fallback={[]} key={item._id}>
          <TemporalRow
            key={item._id}
            item={item}
            page={page}
            index={i}
            limit={limit}
            toggleSelected={toggleSelected}
          />
        </Suspense>
      )) || [];
  }

  let content = [];
  let table = [];
  if (items.length > 0) {
    let searchingText = `searching...`;
    if (page > 1) {
      searchingText = `loading...`;
    }
    table = (
      <div>
        <div className="row">
          <div className="col-12">
            <div style={{ padding: '40pt', textAlign: 'center' }}>
              <Spinner type="grow" color="info" /> <i>{searchingText}</i>
            </div>
          </div>
        </div>
      </div>
    );
    if (!queryBuilderSearching) {
      table = (
        <Table hover className="items-table">
          <thead>{columns}</thead>
          <tbody>{rows}</tbody>
          <tfoot>{columns}</tfoot>
        </Table>
      );
    }
    content = (
      <div className="items-container">
        {pageActions}
        <Card>
          <CardBody className="items-card">
            <div className="pull-right">{batchActions}</div>
            <div className="table-container">{table}</div>
            <div className="pull-right">{batchActions}</div>
          </CardBody>
        </Card>
        {pageActions}
      </div>
    );
  }
  return (
    <div className="row">
      <div className="col-12">{content}</div>
    </div>
  );
};

export default List;
