import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, CardBody, Collapse, Label, Popover } from 'reactstrap';
import QueryModal from './query.modal';
import QueryModalRelated from './query.modal.related';
import 'react-datepicker/dist/react-datepicker.css';

import {
  queryBuildRelatedClear,
  setQueryBuildResults,
  toggleQueryBuilderSubmit,
  toggleQueryBuilderSearching,
  toggleClearQueryBuildResults,
  setPaginationParams,
} from '../../redux/actions';

import { outputDate, queryDate } from '../../helpers';

const APIPath = process.env.REACT_APP_APIPATH;

const QueryBlock = () => {
  // redux store
  const dispatch = useDispatch();
  const open = useSelector((rstate) => rstate.queryBlockOpen);
  const entityType = useSelector((rstate) => rstate.queryBuildType);
  const queryBlocks = useSelector((rstate) => rstate.queryBlocksMain);
  const queryBlocksEvent = useSelector((rstate) => rstate.queryBlocksEvent);
  const queryBlocksOrganisation = useSelector(
    (rstate) => rstate.queryBlocksOrganisation
  );
  const queryBlocksResource = useSelector(
    (rstate) => rstate.queryBlocksResource
  );
  const queryBlocksPerson = useSelector((rstate) => rstate.queryBlocksPerson);
  const queryBlocksSpatial = useSelector((rstate) => rstate.queryBlocksSpatial);
  const queryBlocksTemporal = useSelector(
    (rstate) => rstate.queryBlocksTemporal
  );
  const queryBuilderSubmit = useSelector((rstate) => rstate.queryBuilderSubmit);
  const queryBuildResults = useSelector((rstate) => rstate.queryBuildResults);
  const paginationParams = useSelector(
    (rstate) => rstate.queryBuilderPagination
  );
  const eventTypes = useSelector((rstate) => rstate.eventTypes);

  // state
  const [blocks, setBlocks] = useState([]);
  const [entities, setEntities] = useState([]);
  const [filterBlockOpen, setFilterBlockOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalMainOpen, setModalMainOpen] = useState(false);
  const [modalRelatedOpen, setModalRelatedOpen] = useState(false);
  const [removingBlock, setRemovingBlock] = useState(false);
  const [removingBlockType, setRemovingBlockType] = useState('');
  const [update, setUpdate] = useState(false);
  const [users, setUsers] = useState([]);
  const [type, setType] = useState('Event');

  const toggleFilterBlock = () => setFilterBlockOpen(!filterBlockOpen);

  useEffect(() => {
    const load = async () => {
      setUpdate(true);
      const entitiesResponseData = await axios({
        method: 'get',
        url: `${APIPath}entities`,
        crossDomain: true,
      })
        .then((response) => response.data)
        .catch((error) => {
          console.log(error);
        });
      setEntities(entitiesResponseData.data.data);

      const usersResponseData = await axios({
        method: 'get',
        url: `${APIPath}users`,
        crossDomain: true,
        params: {
          usergroup: 'Administrator',
        },
      })
        .then((response) => response.data)
        .catch((error) => {
          console.log(error);
        });
      const userList = usersResponseData.data.data.map((u) => {
        const user = u;
        let label = user.lastName;
        if (user.firstName !== '') {
          if (label !== '') {
            label += ' ';
          }
          label += user.firstName;
        }
        user.label = label;
        return { value: user._id, label };
      });
      setUsers(userList);
      setLoading(false);
      // setUpdate(true);
    };
    if (loading) {
      load();
    }
  }, [loading]);

  useEffect(() => {
    if (removingBlock && removingBlockType !== '') {
      const blocksCopy = [...blocks];
      const index = blocksCopy.findIndex((b) => b.key === removingBlockType);
      if (index > -1) {
        blocksCopy.splice(index, 1);
        setBlocks(blocksCopy);
      }
      setRemovingBlock(false);
      setRemovingBlockType('');
    }
  }, [removingBlock, removingBlockType, blocks]);

  const removeBlock = useCallback(
    (key) => {
      let name;
      switch (type) {
        case 'Main': {
          name = 'queryBlocksMain';
          break;
        }
        case 'Event': {
          name = 'queryBlocksEvent';
          break;
        }
        case 'Organisation': {
          name = 'queryBlocksOrganisation';
          break;
        }
        case 'Resource': {
          name = 'queryBlocksResource';
          break;
        }
        case 'Person': {
          name = 'queryBlocksPerson';
          break;
        }
        case 'Spatial': {
          name = 'queryBlocksSpatial';
          break;
        }
        case 'Temporal': {
          name = 'queryBlocksTemporal';
          break;
        }
        default: {
          name = 'queryBlocksMain';
          break;
        }
      }
      dispatch(queryBuildRelatedClear(name));
      setRemovingBlock(true);
      setRemovingBlockType(key);
      return false;
    },
    [dispatch, type]
  );

  const toggleModalRelatedOpen = useCallback(
    (newType) => {
      setModalRelatedOpen(!modalRelatedOpen);
      setFilterBlockOpen(false);
      setType(newType);
    },
    [modalRelatedOpen]
  );

  const toggleModalMainOpen = useCallback(() => {
    setModalMainOpen(!modalMainOpen);
    setFilterBlockOpen(false);
  }, [modalMainOpen]);

  const parseDates = (data) => {
    for (let i = 0; i < data.length; i += 1) {
      const block = data[i];
      if (block.elementStartValue !== '') {
        block.elementStartValue = queryDate(block.elementStartValue);
      }
      if (block.elementEndValue !== '') {
        block.elementEndValue = queryDate(block.elementEndValue);
      }
    }
    return data;
  };

  const submit = useCallback(async () => {
    dispatch(toggleClearQueryBuildResults(true));
    dispatch(setQueryBuildResults([]));
    dispatch(toggleQueryBuilderSearching(true));

    const orderDirection = !paginationParams.orderDesc ? 'ASC' : 'DESC';
    const params = {
      entityType,
      main: parseDates(queryBlocks),
      events: queryBlocksEvent,
      organisations: queryBlocksOrganisation,
      resources: queryBlocksResource,
      people: queryBlocksPerson,
      spatials: queryBlocksSpatial,
      temporals: queryBlocksTemporal,
      activeType: paginationParams.activeType,
      page: paginationParams.page,
      limit: paginationParams.limit,
      status: paginationParams.status,
      orderField: paginationParams.orderField,
      orderDirection,
    };

    const responseData = await axios({
      method: 'post',
      url: `${APIPath}query-builder`,
      crossDomain: true,
      data: params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    dispatch(setQueryBuildResults(responseData.data));
    dispatch(toggleQueryBuilderSearching(false));
    if (
      responseData.data.currentPage > responseData.data.totalPages ||
      paginationParams.page > responseData.data.totalPages
    ) {
      const paginationParamsCopy = { ...paginationParams };
      paginationParamsCopy.page = responseData.data.totalPages;
      dispatch(setPaginationParams('queryBuilder', paginationParamsCopy));
    }

    return false;
  }, [
    dispatch,
    queryBlocks,
    queryBlocksEvent,
    queryBlocksOrganisation,
    queryBlocksResource,
    queryBlocksPerson,
    queryBlocksSpatial,
    queryBlocksTemporal,
    entityType,
    paginationParams,
  ]);

  useEffect(() => {
    if (queryBuilderSubmit) {
      submit();
      dispatch(toggleQueryBuilderSubmit(false));
    }
  }, [queryBuilderSubmit, dispatch, submit]);

  useEffect(() => {
    if (update) {
      setUpdate(false);
      const blockContents = queryBlocks.map((b, i) => {
        let value = b.elementValue;
        if (value === '' && b.elementStartValue !== '') {
          value = outputDate(b.elementStartValue);
        }
        if (b.qualifier === 'range') {
          if (value !== '') {
            value += ' - ';
          }
          value += outputDate(b.elementEndValue);
        }
        const nextKey = i + 1;
        let { boolean } = b;
        if (typeof queryBlocks[nextKey] === 'undefined') {
          boolean = '';
        }
        let qualifierText = b.qualifier;
        if (qualifierText === 'exact') {
          qualifierText = 'is exact match';
        }
        if (qualifierText === 'not_contains') {
          qualifierText = "doesn't contain";
        }
        if (qualifierText === 'not_exact') {
          qualifierText = 'is not exact match';
        }
        let valueOutput = value;
        if (b.elementLabel === 'eventType') {
          valueOutput = eventTypes.find((e) => e._id === value)?.label || '';
        }
        if (b.elementLabel === 'createdBy' || b.elementLabel === 'updatedBy') {
          valueOutput = users.find((u) => u.value === value)?.label || '';
        }
        const key = `b${i}`;
        return (
          <div key={key}>
            <b>{b.elementLabel}</b> <i>{qualifierText}</i> &#34;{valueOutput}
            &#34;
            <i>{boolean}</i>
          </div>
        );
      });
      const eventBlockContents = queryBlocksEvent.map((b, i) => {
        let value = b.elementValue;
        if (value === '' && b.elementStartValue !== '') {
          value = outputDate(b.elementStartValue);
        }
        if (b.qualifier === 'range') {
          if (value !== '') {
            value += ' - ';
          }
          value += outputDate(b.elementEndValue);
        }
        const nextKey = i + 1;
        let { boolean } = b;
        if (typeof queryBlocks[nextKey] === 'undefined') {
          boolean = '';
        }
        let qualifierText = b.qualifier;
        if (qualifierText === 'exact') {
          qualifierText = 'is exact match';
        }
        if (qualifierText === 'not_contains') {
          qualifierText = "doesn't contain";
        }
        if (qualifierText === 'not_exact') {
          qualifierText = 'is not exact match';
        }
        let valueOutput = value;
        if (b.elementLabel === 'eventType') {
          valueOutput = eventTypes.find((e) => e._id === value)?.label || '';
        }
        if (b.elementLabel === 'createdBy' || b.elementLabel === 'updatedBy') {
          valueOutput = users.find((u) => u.value === value)?.label || '';
        }
        const key = `b${i}`;
        return (
          <div key={key}>
            <b>{b.elementLabel}</b> <i>{qualifierText}</i> &#34;{valueOutput}
            &#34;
            <i>{boolean}</i>
          </div>
        );
      });
      const organisationBlockContents = queryBlocksOrganisation.map((b, i) => {
        let value = b.elementValue;
        if (value === '' && b.elementStartValue !== '') {
          value = outputDate(b.elementStartValue);
        }
        if (b.qualifier === 'range') {
          if (value !== '') {
            value += ' - ';
          }
          value += outputDate(b.elementEndValue);
        }
        const nextKey = i + 1;
        let { boolean } = b;
        if (typeof queryBlocks[nextKey] === 'undefined') {
          boolean = '';
        }
        let qualifierText = b.qualifier;
        if (qualifierText === 'exact') {
          qualifierText = 'is exact match';
        }
        if (qualifierText === 'not_contains') {
          qualifierText = "doesn't contain";
        }
        if (qualifierText === 'not_exact') {
          qualifierText = 'is not exact match';
        }
        let valueOutput = value;
        if (b.elementLabel === 'eventType') {
          valueOutput = eventTypes.find((e) => e._id === value)?.label || '';
        }
        if (b.elementLabel === 'createdBy' || b.elementLabel === 'updatedBy') {
          valueOutput = users.find((u) => u.value === value)?.label || '';
        }
        const key = `b${i}`;
        return (
          <div key={key}>
            <b>{b.elementLabel}</b> <i>{qualifierText}</i> &#34;{valueOutput}
            &#34;
            <i>{boolean}</i>
          </div>
        );
      });
      const resourceBlockContents = queryBlocksResource.map((b, i) => {
        let value = b.elementValue;
        if (value === '' && b.elementStartValue !== '') {
          value = outputDate(b.elementStartValue);
        }
        if (b.qualifier === 'range') {
          if (value !== '') {
            value += ' - ';
          }
          value += outputDate(b.elementEndValue);
        }
        const nextKey = i + 1;
        let { boolean } = b;
        if (typeof queryBlocks[nextKey] === 'undefined') {
          boolean = '';
        }
        let qualifierText = b.qualifier;
        if (qualifierText === 'exact') {
          qualifierText = 'is exact match';
        }
        if (qualifierText === 'not_contains') {
          qualifierText = "doesn't contain";
        }
        if (qualifierText === 'not_exact') {
          qualifierText = 'is not exact match';
        }
        let valueOutput = value;
        if (b.elementLabel === 'eventType') {
          valueOutput = eventTypes.find((e) => e._id === value)?.label || '';
        }
        if (b.elementLabel === 'createdBy' || b.elementLabel === 'updatedBy') {
          valueOutput = users.find((u) => u.value === value)?.label || '';
        }
        const key = `b${i}`;
        return (
          <div key={key}>
            <b>{b.elementLabel}</b> <i>{qualifierText}</i> &#34;{valueOutput}
            &#34;
            <i>{boolean}</i>
          </div>
        );
      });
      const personBlockContents = queryBlocksPerson.map((b, i) => {
        let value = b.elementValue;
        if (value === '' && b.elementStartValue !== '') {
          value = outputDate(b.elementStartValue);
        }
        if (b.qualifier === 'range') {
          if (value !== '') {
            value += ' - ';
          }
          value += outputDate(b.elementEndValue);
        }
        const nextKey = i + 1;
        let { boolean } = b;
        if (typeof queryBlocks[nextKey] === 'undefined') {
          boolean = '';
        }
        let qualifierText = b.qualifier;
        if (qualifierText === 'exact') {
          qualifierText = 'is exact match';
        }
        if (qualifierText === 'not_contains') {
          qualifierText = "doesn't contain";
        }
        if (qualifierText === 'not_exact') {
          qualifierText = 'is not exact match';
        }
        let valueOutput = value;
        if (b.elementLabel === 'eventType') {
          valueOutput = eventTypes.find((e) => e._id === value)?.label || '';
        }
        if (b.elementLabel === 'createdBy' || b.elementLabel === 'updatedBy') {
          valueOutput = users.find((u) => u.value === value)?.label || '';
        }
        const key = `b${i}`;
        return (
          <div key={key}>
            <b>{b.elementLabel}</b> <i>{qualifierText}</i> &#34;{valueOutput}
            &#34;
            <i>{boolean}</i>
          </div>
        );
      });
      const spatialBlockContents = queryBlocksSpatial.map((b, i) => {
        let value = b.elementValue;
        if (value === '' && b.elementStartValue !== '') {
          value = outputDate(b.elementStartValue);
        }
        if (b.qualifier === 'range') {
          if (value !== '') {
            value += ' - ';
          }
          value += outputDate(b.elementEndValue);
        }
        const nextKey = i + 1;
        let { boolean } = b;
        if (typeof queryBlocks[nextKey] === 'undefined') {
          boolean = '';
        }
        let qualifierText = b.qualifier;
        if (qualifierText === 'exact') {
          qualifierText = 'is exact match';
        }
        if (qualifierText === 'not_contains') {
          qualifierText = "doesn't contain";
        }
        if (qualifierText === 'not_exact') {
          qualifierText = 'is not exact match';
        }
        let valueOutput = value;
        if (b.elementLabel === 'eventType') {
          valueOutput = eventTypes.find((e) => e._id === value)?.label || '';
        }
        if (b.elementLabel === 'createdBy' || b.elementLabel === 'updatedBy') {
          valueOutput = users.find((u) => u.value === value)?.label || '';
        }
        const key = `b${i}`;
        return (
          <div key={key}>
            <b>{b.elementLabel}</b> <i>{qualifierText}</i> &#34;{valueOutput}
            &#34;
            <i>{boolean}</i>
          </div>
        );
      });
      const temporalBlockContents = queryBlocksTemporal.map((b, i) => {
        let value = b.elementValue;
        if (value === '' && b.elementStartValue !== '') {
          value = outputDate(b.elementStartValue);
        }
        if (b.qualifier === 'range') {
          if (value !== '') {
            value += ' - ';
          }
          value += outputDate(b.elementEndValue);
        }
        const nextKey = i + 1;
        let { boolean } = b;
        if (typeof queryBlocks[nextKey] === 'undefined') {
          boolean = '';
        }
        let qualifierText = b.qualifier;
        if (qualifierText === 'exact') {
          qualifierText = 'is exact match';
        }
        if (qualifierText === 'not_contains') {
          qualifierText = "doesn't contain";
        }
        if (qualifierText === 'not_exact') {
          qualifierText = 'is not exact match';
        }
        let valueOutput = value;
        if (b.elementLabel === 'eventType') {
          valueOutput = eventTypes.find((e) => e._id === value)?.label || '';
        }
        if (b.elementLabel === 'createdBy' || b.elementLabel === 'updatedBy') {
          valueOutput = users.find((u) => u.value === value)?.label || '';
        }
        const key = `b${i}`;
        return (
          <div key={key}>
            <b>{b.elementLabel}</b> <i>{qualifierText}</i> &#34;{valueOutput}
            &#34;
            <i>{boolean}</i>
          </div>
        );
      });
      const block = (
        <div className="filter-block" key="Main">
          <div className="head">
            <Label>Main query</Label>
            <div
              className="filter-edit"
              onClick={() => toggleModalMainOpen()}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="open edit modal"
            >
              <i className="fa fa-pencil" />
            </div>
          </div>
          <div>
            <Label>Entity type</Label> : {entityType}
          </div>
          {blockContents}
        </div>
      );
      const eventsBlock =
        eventBlockContents.length > 0 ? (
          <div className="filter-block" key="Event">
            <div className="head">
              <Label>Related events query</Label>
              <div
                className="filter-edit"
                onClick={() => toggleModalRelatedOpen('Event')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="open edit modal"
              >
                <i className="fa fa-pencil" />
              </div>
              <div
                className="filter-remove"
                onClick={() => removeBlock('Event')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="remove block"
              >
                <i className="fa fa-times" />
              </div>
            </div>
            {eventBlockContents}
          </div>
        ) : (
          []
        );
      const organisationsBlock =
        organisationBlockContents.length > 0 ? (
          <div className="filter-block" key="Organisation">
            <div className="head">
              <Label>Related organisations query</Label>
              <div
                className="filter-edit"
                onClick={() => toggleModalRelatedOpen('Organisation')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="open edit modal"
              >
                <i className="fa fa-pencil" />
              </div>
              <div
                className="filter-remove"
                onClick={() => removeBlock('Organisation')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="remove block"
              >
                <i className="fa fa-times" />
              </div>
            </div>
            {organisationBlockContents}
          </div>
        ) : (
          []
        );
      const resourcesBlock =
        resourceBlockContents.length > 0 ? (
          <div className="filter-block" key="Resource">
            <div className="head">
              <Label>Related resources query</Label>
              <div
                className="filter-edit"
                onClick={() => toggleModalRelatedOpen('Resource')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="open edit modal"
              >
                <i className="fa fa-pencil" />
              </div>
              <div
                className="filter-remove"
                onClick={() => removeBlock('Resource')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="remove block"
              >
                <i className="fa fa-times" />
              </div>
            </div>
            {resourceBlockContents}
          </div>
        ) : (
          []
        );
      const peopleBlock =
        personBlockContents.length > 0 ? (
          <div className="filter-block" key="Person">
            <div className="head">
              <Label>Related people query</Label>
              <div
                className="filter-edit"
                onClick={() => toggleModalRelatedOpen('Person')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="open edit modal"
              >
                <i className="fa fa-pencil" />
              </div>
              <div
                className="filter-remove"
                onClick={() => removeBlock('Person')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="remove block"
              >
                <i className="fa fa-times" />
              </div>
            </div>
            {personBlockContents}
          </div>
        ) : (
          []
        );
      const spatialsBlock =
        spatialBlockContents.length > 0 ? (
          <div className="filter-block" key="Spatial">
            <div className="head">
              <Label>Related spatials query</Label>
              <div
                className="filter-edit"
                onClick={() => toggleModalRelatedOpen('Spatial')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="open edit modal"
              >
                <i className="fa fa-pencil" />
              </div>
              <div
                className="filter-remove"
                onClick={() => removeBlock('Spatial')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="remove block"
              >
                <i className="fa fa-times" />
              </div>
            </div>
            {spatialBlockContents}
          </div>
        ) : (
          []
        );
      const temporalsBlock =
        temporalBlockContents.length > 0 ? (
          <div className="filter-block" key="Temporal">
            <div className="head">
              <Label>Related temporals query</Label>
              <div
                className="filter-edit"
                onClick={() => toggleModalRelatedOpen('Temporal')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="open edit modal"
              >
                <i className="fa fa-pencil" />
              </div>
              <div
                className="filter-remove"
                onClick={() => removeBlock('Temporal')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="remove block"
              >
                <i className="fa fa-times" />
              </div>
            </div>
            {temporalBlockContents}
          </div>
        ) : (
          []
        );
      const blocksCopy = [];
      const index = blocksCopy.findIndex((b) => b.key === 'Main');
      if (index > -1) {
        blocksCopy.splice(index, 1);
      }
      const eventIndex = blocksCopy.findIndex((b) => b.key === 'Event');
      if (eventIndex > -1) {
        blocksCopy.splice(eventIndex, 1);
      }
      const organisationIndex = blocksCopy.findIndex(
        (b) => b.key === 'Organisation'
      );
      if (organisationIndex > -1) {
        blocksCopy.splice(organisationIndex, 1);
      }
      const resourceIndex = blocksCopy.findIndex((b) => b.key === 'Resource');
      if (resourceIndex > -1) {
        blocksCopy.splice(resourceIndex, 1);
      }
      const personIndex = blocksCopy.findIndex((b) => b.key === 'Person');
      if (personIndex > -1) {
        blocksCopy.splice(personIndex, 1);
      }
      const spatialIndex = blocksCopy.findIndex((b) => b.key === 'Spatial');
      if (spatialIndex > -1) {
        blocksCopy.splice(spatialIndex, 1);
      }
      const temporalIndex = blocksCopy.findIndex((b) => b.key === 'Temporal');
      if (temporalIndex > -1) {
        blocksCopy.splice(temporalIndex, 1);
      }
      blocksCopy.push(block);
      blocksCopy.push(eventsBlock);
      blocksCopy.push(organisationsBlock);
      blocksCopy.push(resourcesBlock);
      blocksCopy.push(peopleBlock);
      blocksCopy.push(spatialsBlock);
      blocksCopy.push(temporalsBlock);
      setBlocks(blocksCopy);
    }
  }, [
    update,
    queryBlocks,
    queryBlocksEvent,
    queryBlocksOrganisation,
    queryBlocksResource,
    queryBlocksPerson,
    queryBlocksSpatial,
    queryBlocksTemporal,
    blocks,
    removeBlock,
    toggleModalMainOpen,
    toggleModalRelatedOpen,
    entityType,
    eventTypes,
    users,
  ]);

  const addFilterBlock = (
    <div className="filter-block button">
      <Popover
        isOpen={filterBlockOpen}
        className="filter-block-card"
        placement="left"
        toggle={toggleFilterBlock}
        target="Popover1"
      >
        <div className="filter-block-options">
          <div
            onClick={() => toggleModalMainOpen('Main')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="open main query modal"
          >
            Main query
          </div>
          <div
            onClick={() => toggleModalRelatedOpen('Event')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="open query event modal"
          >
            Related Events
          </div>
          <div
            onClick={() => toggleModalRelatedOpen('Resource')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="open query resource modal"
          >
            Related Resources
          </div>
          <div
            onClick={() => toggleModalRelatedOpen('Person')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="open query person modal"
          >
            Related People
          </div>
          <div
            onClick={() => toggleModalRelatedOpen('Organisation')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="open query organisations modal"
          >
            Related Organisations
          </div>
          <div
            onClick={() => toggleModalRelatedOpen('Temporal')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="open query temporals modal"
          >
            Related Temporal
          </div>
          <div
            onClick={() => toggleModalRelatedOpen('Spatial')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="open query event modal"
          >
            Related Spatial
          </div>
        </div>
      </Popover>
      <Button
        size="sm"
        onClick={() => toggleFilterBlock()}
        className="filter-block-button"
        id="Popover1"
      >
        Add/Edit filter <i className="fa fa-plus-circle" />
      </Button>
    </div>
  );

  let queryStats = [];
  if (typeof queryBuildResults.count !== 'undefined') {
    const count = Number(queryBuildResults.count);
    const itemsText = count > 1 ? 'items' : 'item';
    queryStats = (
      <div>
        <i>
          Found <b>{count}</b> {itemsText}
        </i>
      </div>
    );
  }

  let relatedQueryBlocks;
  switch (type) {
    case 'Event': {
      relatedQueryBlocks = queryBlocksEvent;
      break;
    }
    case 'Organisation': {
      relatedQueryBlocks = queryBlocksOrganisation;
      break;
    }
    case 'Resource': {
      relatedQueryBlocks = queryBlocksResource;
      break;
    }
    case 'Person': {
      relatedQueryBlocks = queryBlocksPerson;
      break;
    }
    case 'Spatial': {
      relatedQueryBlocks = queryBlocksSpatial;
      break;
    }
    case 'Temporal': {
      relatedQueryBlocks = queryBlocksTemporal;
      break;
    }
    default: {
      relatedQueryBlocks = queryBlocksEvent;
      break;
    }
  }

  return (
    <div>
      <Collapse isOpen={open}>
        <div className="row">
          <div className="col-12">
            <div className="items-container">
              <Card>
                <CardBody>
                  <div className="filters-container">
                    {blocks}
                    {addFilterBlock}
                  </div>
                  <div className="query-builder-submit">
                    <Button
                      size="sm"
                      color="secondary"
                      outline
                      onClick={() => submit()}
                    >
                      Submit search
                    </Button>
                  </div>
                  {queryStats}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </Collapse>
      <QueryModal
        open={modalMainOpen}
        toggleModalOpen={toggleModalMainOpen}
        queryBlocks={queryBlocks}
        entities={entities}
        update={setUpdate}
        users={users}
      />
      <QueryModalRelated
        open={modalRelatedOpen}
        toggleModalOpen={toggleModalRelatedOpen}
        queryBlocks={relatedQueryBlocks}
        entities={entities}
        update={setUpdate}
        users={users}
        type={type}
      />
    </div>
  );
};

export default QueryBlock;
