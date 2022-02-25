import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardTitle, CardBody, Button, Collapse, Label } from 'reactstrap';
import LazyList from './lazylist';
import { getResourceThumbnailURL } from '../helpers';

const APIPath = process.env.REACT_APP_APIPATH;

const RelatedEntitiesBlock = (props) => {
  const { item, itemType, reload } = props;

  const [state, setState] = useState({
    eventsOpen: false,
    organisationsOpen: false,
    peopleOpen: false,
    resourcesOpen: false,
    spatialOpen: false,
    temporalOpen: false,
  });

  const deleteRef = async (ref, refTerm, model) => {
    const reference = {
      items: [
        { _id: item._id, type: itemType },
        { _id: ref, type: model },
      ],
      taxonomyTermLabel: refTerm,
    };
    const deleteItem = await axios({
      method: 'delete',
      url: `${APIPath}reference`,
      crossDomain: true,
      data: reference,
    })
      .then((response) => response)
      .catch((error) => {
        console.log(error);
      });
    if (deleteItem.data.status) {
      reload();
    }
  };

  const toggleCollapse = (name) => {
    let value = true;
    if (state[name]) {
      value = false;
    }
    const newState = { ...state };
    newState[name] = value;
    setState(newState);
  };

  let eventsBlock = [];
  let organisationsBlock = [];
  let peopleBlock = [];
  let resourcesBlock = [];
  let spatialBlock = [];
  let temporalBlock = [];

  if (item?.events?.length > 0) {
    const renderEvent = (reference) => {
      const { label } = reference.ref;
      const { _id } = reference.ref;
      const url = `/event/${_id}`;
      const termRole = reference.term.role || null;
      const roleLabel = reference.term.roleLabel || '';
      const role =
        termRole !== null
          ? [' ', <Label key="label">as {roleLabel}</Label>]
          : [];
      const row = (
        <div key={_id} className="ref-item">
          <Link to={url} href={url}>
            <i>{reference.term.label}</i> <b>{label}</b>
            {role}
          </Link>
          <div
            className="delete-ref"
            onClick={() => deleteRef(_id, reference.term.label, 'Event')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="delete ref"
          >
            <i className="fa fa-times" />
          </div>
        </div>
      );
      return row;
    };
    let eventsOpenActive = ' active';
    if (!state.eventsOpen) {
      eventsOpenActive = '';
    }

    eventsBlock = (
      <Card>
        <CardBody>
          <CardTitle onClick={() => toggleCollapse('eventsOpen')}>
            Related events (
            <span className="related-num">{item.events.length}</span>){' '}
            <Button
              type="button"
              className="pull-right"
              color="secondary"
              outline
              size="xs"
            >
              <i
                className={`collapse-toggle fa fa-angle-left${eventsOpenActive}`}
              />
            </Button>
          </CardTitle>
          <Collapse isOpen={state.eventsOpen}>
            <LazyList
              limit={50}
              range={25}
              items={item.events}
              renderItem={renderEvent}
            />
          </Collapse>
        </CardBody>
      </Card>
    );
  }

  if (item?.organisations?.length > 0) {
    const renderOrganisation = (reference) => {
      const { label } = reference.ref;
      const { _id } = reference.ref;
      const url = `/organisation/${_id}`;
      const row = (
        <div key={_id} className="ref-item">
          <Link to={url} href={url}>
            <i>{reference.term.label}</i> <b>{label}</b>
          </Link>
          <div
            className="delete-ref"
            onClick={() => deleteRef(_id, reference.term.label, 'Organisation')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="delete ref"
          >
            <i className="fa fa-times" />
          </div>
        </div>
      );
      return row;
    };
    let organisationsOpenActive = ' active';
    if (!state.organisationsOpen) {
      organisationsOpenActive = '';
    }
    organisationsBlock = (
      <Card>
        <CardBody>
          <CardTitle onClick={() => toggleCollapse('organisationsOpen')}>
            Related Organisations (
            <span className="related-num">{item.organisations.length}</span>){' '}
            <Button
              type="button"
              className="pull-right"
              color="secondary"
              outline
              size="xs"
            >
              <i
                className={`collapse-toggle fa fa-angle-left${organisationsOpenActive}`}
              />
            </Button>
          </CardTitle>
          <Collapse isOpen={state.organisationsOpen}>
            <LazyList
              limit={50}
              range={25}
              items={item.organisations}
              renderItem={renderOrganisation}
            />
          </Collapse>
        </CardBody>
      </Card>
    );
  }

  if (item?.people?.length > 0) {
    const renderPerson = (reference) => {
      const { label } = reference.ref;
      let role = [];
      if (
        typeof reference.term.role !== 'undefined' &&
        reference.term.role !== 'null'
      ) {
        role = <Label>as {reference.term.roleLabel}</Label>;
      }
      const { _id } = reference.ref;
      const url = `/person/${_id}`;
      const row = (
        <div key={_id} className="ref-item">
          <Link to={url} href={url}>
            <i>{reference.term.label}</i> <b>{label}</b> {role}
          </Link>
          <div
            className="delete-ref"
            onClick={() => deleteRef(_id, reference.term.label, 'Person')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="delete ref"
          >
            <i className="fa fa-times" />
          </div>
        </div>
      );
      return row;
    };

    let peopleOpenActive = ' active';
    if (!state.peopleOpen) {
      peopleOpenActive = '';
    }
    peopleBlock = (
      <Card>
        <CardBody>
          <CardTitle onClick={() => toggleCollapse('peopleOpen')}>
            Related people (
            <span className="related-num">{item.people.length}</span>){' '}
            <Button
              type="button"
              className="pull-right"
              color="secondary"
              outline
              size="xs"
            >
              <i
                className={`collapse-toggle fa fa-angle-left${peopleOpenActive}`}
              />
            </Button>
          </CardTitle>
          <Collapse isOpen={state.peopleOpen}>
            <LazyList
              limit={50}
              range={25}
              items={item.people}
              renderItem={renderPerson}
            />
          </Collapse>
        </CardBody>
      </Card>
    );
  }

  if (item?.resources?.length > 0) {
    const renderResource = (reference) => {
      const thumbnailPath = getResourceThumbnailURL(reference.ref);
      let thumbnailImage = [];
      if (thumbnailPath !== null) {
        thumbnailImage = (
          <img
            src={thumbnailPath}
            alt={reference.label}
            className="img-fluid"
          />
        );
      }
      let role = [];
      if (
        typeof reference.term.role !== 'undefined' &&
        reference.term.role !== 'null'
      ) {
        role = <Label>as {reference.term.roleLabel}</Label>;
      }
      const { _id } = reference.ref;
      const url = `/resource/${_id}`;
      const newRow = (
        <div key={_id} className="img-thumbnail related-resource">
          <Link to={url} href={url}>
            <i>{reference.term.label}</i>
            {thumbnailImage}
            <Label>{reference.ref.label}</Label>
            {role}
          </Link>
          <div
            className="delete-ref"
            onClick={() => deleteRef(_id, reference.term.label, 'Resource')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="delete ref"
          >
            <i className="fa fa-times" />
          </div>
        </div>
      );
      return newRow;
    };

    let resourcesOpenActive = ' active';
    if (!state.resourcesOpen) {
      resourcesOpenActive = '';
    }

    resourcesBlock = (
      <Card>
        <CardBody>
          <CardTitle onClick={() => toggleCollapse('resourcesOpen')}>
            Related resources (
            <span className="related-num">{item.resources.length}</span>){' '}
            <Button
              type="button"
              className="pull-right"
              color="secondary"
              outline
              size="xs"
            >
              <i
                className={`collapse-toggle fa fa-angle-left${resourcesOpenActive}`}
              />
            </Button>
          </CardTitle>
          <Collapse isOpen={state.resourcesOpen}>
            <LazyList
              limit={50}
              range={25}
              items={item.resources}
              containerClass="resources"
              renderItem={renderResource}
            />
          </Collapse>
        </CardBody>
      </Card>
    );
  }

  if (item?.spatial?.length > 0) {
    const renderSpatial = (reference) => {
      const { label } = reference.ref;
      const { _id } = reference.ref;
      const url = `/spatial/${_id}`;
      const row = (
        <div key={_id} className="ref-item">
          <Link to={url} href={url}>
            <i>{reference.term.label}</i> <b>{label}</b>
          </Link>
          <div
            className="delete-ref"
            onClick={() => deleteRef(_id, reference.term.label, 'Spatial')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="delete ref"
          >
            <i className="fa fa-times" />
          </div>
        </div>
      );
      return row;
    };
    let spatialOpenActive = ' active';
    if (!state.spatialOpen) {
      spatialOpenActive = '';
    }

    spatialBlock = (
      <Card>
        <CardBody>
          <CardTitle onClick={() => toggleCollapse('spatialOpen')}>
            Related spatial (
            <span className="related-num">{item.spatial.length}</span>){' '}
            <Button
              type="button"
              className="pull-right"
              color="secondary"
              outline
              size="xs"
            >
              <i
                className={`collapse-toggle fa fa-angle-left${spatialOpenActive}`}
              />
            </Button>
          </CardTitle>
          <Collapse isOpen={state.spatialOpen}>
            <LazyList
              limit={50}
              range={25}
              items={item.spatial}
              renderItem={renderSpatial}
            />
          </Collapse>
        </CardBody>
      </Card>
    );
  }

  if (item?.temporal?.length > 0) {
    const renderTemporal = (reference) => {
      const { label } = reference.ref;
      const { _id } = reference.ref;
      const url = `/temporal/${_id}`;
      const row = (
        <div key={_id} className="ref-item">
          <Link to={url} href={url}>
            <i>{reference.term.label}</i> <b>{label}</b>
          </Link>
          <div
            className="delete-ref"
            onClick={() => deleteRef(_id, reference.term.label, 'Temporal')}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="delete ref"
          >
            <i className="fa fa-times" />
          </div>
        </div>
      );
      return row;
    };
    let temporalOpenActive = ' active';
    if (!state.temporalOpen) {
      temporalOpenActive = '';
    }
    temporalBlock = (
      <Card>
        <CardBody>
          <CardTitle onClick={() => toggleCollapse('temporalOpen')}>
            Related temporal (
            <span className="related-num">{item.temporal.length}</span>){' '}
            <Button
              type="button"
              className="pull-right"
              color="secondary"
              outline
              size="xs"
            >
              <i
                className={`collapse-toggle fa fa-angle-left${temporalOpenActive}`}
              />
            </Button>
          </CardTitle>
          <Collapse isOpen={state.temporalOpen}>
            <LazyList
              limit={50}
              range={25}
              items={item.temporal}
              renderItem={renderTemporal}
            />
          </Collapse>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      {eventsBlock}
      {organisationsBlock}
      {peopleBlock}
      {resourcesBlock}
      {spatialBlock}
      {temporalBlock}
    </div>
  );
};
RelatedEntitiesBlock.defaultProps = {
  item: null,
  itemType: 'Person',
  reload: () => {},
};
RelatedEntitiesBlock.propTypes = {
  item: PropTypes.object,
  itemType: PropTypes.string,
  reload: PropTypes.func,
};

export default RelatedEntitiesBlock;
