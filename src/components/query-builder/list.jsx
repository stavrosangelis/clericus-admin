import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Card, CardBody, Spinner, Table } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import BatchActions from '../add-batch-relations';
import {
  toggleQueryBuilderSubmit,
  setPaginationParams,
  toggleClearQueryBuildResults,
} from '../../redux/actions';
import PageActions from './page.actions';

// table parts
import EventsColumns from './events/columns';
import EventsRow from './events/row';
import OrganisationsColumns from './organisations/columns';
import OrganisationsRow from './organisations/row';
import PeopleColumns from './people/columns';
import PeopleRow from './people/row';
import ResourcesColumns from './resources/columns';
import ResourcesRow from './resources/row';
import SpatialColumns from './spatial/columns';
import SpatialRow from './spatial/row';
import TemporalColumns from './temporal/columns';
import TemporalRow from './temporal/row';

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
    <BatchActions
      items={selectedItems}
      removeSelected={removeSelected}
      type={entityType}
      relationProperties={[]}
      deleteSelected={deleteSelected}
      selectAll={toggleSelectedAll}
      allChecked={allChecked}
    />
  );

  const pageActions = <PageActions pageType={entityType} />;

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
      <EventsColumns
        allChecked={allChecked}
        toggleSelectedAll={toggleSelectedAll}
        updateOrdering={updateOrdering}
        orderField={paginationParams.orderField}
        orderDesc={paginationParams.orderDesc}
      />
    );
    rows =
      items.map((item, i) => (
        <EventsRow
          key={item._id}
          item={item}
          page={page}
          index={i}
          limit={limit}
          toggleSelected={toggleSelected}
        />
      )) || [];
  }
  if (entityType === 'Organisation') {
    columns = (
      <OrganisationsColumns
        allChecked={allChecked}
        toggleSelectedAll={toggleSelectedAll}
        updateOrdering={updateOrdering}
        orderField={paginationParams.orderField}
        orderDesc={paginationParams.orderDesc}
      />
    );
    rows =
      items.map((item, i) => (
        <OrganisationsRow
          key={item._id}
          item={item}
          page={page}
          index={i}
          limit={limit}
          toggleSelected={toggleSelected}
        />
      )) || [];
  }
  if (entityType === 'Person') {
    columns = (
      <PeopleColumns
        allChecked={allChecked}
        toggleSelectedAll={toggleSelectedAll}
        updateOrdering={updateOrdering}
        orderField={paginationParams.orderField}
        orderDesc={paginationParams.orderDesc}
      />
    );
    rows =
      items.map((item, i) => (
        <PeopleRow
          key={item._id}
          item={item}
          page={page}
          index={i}
          limit={limit}
          toggleSelected={toggleSelected}
        />
      )) || [];
  }
  if (entityType === 'Resource') {
    columns = (
      <ResourcesColumns
        allChecked={allChecked}
        toggleSelectedAll={toggleSelectedAll}
        updateOrdering={updateOrdering}
        orderField={paginationParams.orderField}
        orderDesc={paginationParams.orderDesc}
      />
    );
    rows =
      items.map((item, i) => (
        <ResourcesRow
          key={item._id}
          item={item}
          page={page}
          index={i}
          limit={limit}
          toggleSelected={toggleSelected}
        />
      )) || [];
  }
  if (entityType === 'Spatial') {
    columns = (
      <SpatialColumns
        allChecked={allChecked}
        toggleSelectedAll={toggleSelectedAll}
        updateOrdering={updateOrdering}
        orderField={paginationParams.orderField}
        orderDesc={paginationParams.orderDesc}
      />
    );
    rows =
      items.map((item, i) => (
        <SpatialRow
          key={item._id}
          item={item}
          page={page}
          index={i}
          limit={limit}
          toggleSelected={toggleSelected}
        />
      )) || [];
  }
  if (entityType === 'Temporal') {
    columns = (
      <TemporalColumns
        allChecked={allChecked}
        toggleSelectedAll={toggleSelectedAll}
        updateOrdering={updateOrdering}
        orderField={paginationParams.orderField}
        orderDesc={paginationParams.orderDesc}
      />
    );
    rows =
      items.map((item, i) => (
        <TemporalRow
          key={item._id}
          item={item}
          page={page}
          index={i}
          limit={limit}
          toggleSelected={toggleSelected}
        />
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
