import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardTitle, CardBody, Button, Collapse, Label } from 'reactstrap';
import LazyList from './lazylist';
import { getResourceThumbnailURL } from '../helpers';

const { REACT_APP_APIPATH: APIPath } = process.env;

function RelatedEntitiesBlock(props) {
  const { item, itemType, reload, toggleRel } = props;

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
    const value = !state[name];
    const newState = { ...state };
    newState[name] = value;
    setState(newState);
  };

  let eventsBlock = null;
  let organisationsBlock = null;
  let peopleBlock = null;
  let resourcesBlock = null;
  let spatialBlock = null;
  let temporalBlock = null;

  if (item?.events?.length > 0) {
    const renderEvent = (reference) => {
      const { ref = null, term = null } = reference;
      if (ref !== null) {
        const { _id = '', label = '' } = reference.ref;
        const url = `/event/${_id}`;
        const {
          role: termRole = null,
          roleLabel = '',
          label: tLabel = '',
        } = term;
        const role =
          termRole !== null
            ? [' ', <Label key="label">as {roleLabel}</Label>]
            : null;
        const row = (
          <div key={_id} className="ref-item">
            <div className="ref-label">
              <i>{tLabel}</i> <b>{label}</b>
              {role}
            </div>
            <div
              className="ref-btn"
              title="Edit reference"
              aria-label="Edit reference"
              onClick={() => toggleRel(reference, 'event')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
            >
              <i className="fa fa-pencil-square" />
            </div>
            <div
              className="ref-btn"
              title="Go to referenced entity"
              aria-label="Go to referenced entity"
            >
              <Link to={url} target="_blank">
                <i className="fa fa-external-link-square" />
              </Link>
            </div>
            <div
              className="ref-btn delete-ref"
              onClick={() => deleteRef(_id, tLabel, 'Event')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="Delete reference"
              title="Delete reference"
            >
              <i className="fa fa-times-circle" />
            </div>
          </div>
        );
        return row;
      }
      return null;
    };
    const eventsOpenActive = !state.eventsOpen ? '' : ' active';
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
      const { ref = null, term = null } = reference;
      if (ref !== null) {
        const { _id = '', label = '' } = ref;
        const url = `/organisation/${_id}`;
        const {
          role: termRole = null,
          roleLabel = '',
          label: tLabel = '',
        } = term;
        const role =
          termRole !== null
            ? [' ', <Label key="label">as {roleLabel}</Label>]
            : null;
        const row = (
          <div key={_id} className="ref-item">
            <div className="ref-label">
              <i>{tLabel}</i> <b>{label}</b>
              {role}
            </div>
            <div
              className="ref-btn"
              title="Edit reference"
              aria-label="Edit reference"
              onClick={() => toggleRel(reference, 'organisation')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
            >
              <i className="fa fa-pencil-square" />
            </div>
            <div
              className="ref-btn"
              title="Go to referenced entity"
              aria-label="Go to referenced entity"
            >
              <Link to={url} target="_blank">
                <i className="fa fa-external-link-square" />
              </Link>
            </div>
            <div
              className="ref-btn delete-ref"
              onClick={() => deleteRef(_id, tLabel, 'Organisation')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="Delete reference"
              title="Delete reference"
            >
              <i className="fa fa-times-circle" />
            </div>
          </div>
        );
        return row;
      }
      return null;
    };
    const organisationsOpenActive = !state.organisationsOpen ? '' : ' active';

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
      const { ref = null, term = null } = reference;
      if (ref !== null) {
        const { _id, label = '' } = ref;
        const {
          role: termRole = null,
          roleLabel = '',
          label: tLabel = '',
        } = term;
        const role = termRole !== null ? <Label>as {roleLabel}</Label> : null;
        const url = `/person/${_id}`;
        const row = (
          <div key={_id} className="ref-item">
            <div className="ref-label">
              <i>{tLabel}</i> <b>{label}</b>
              {role}
            </div>
            <div
              className="ref-btn"
              title="Edit reference"
              aria-label="Edit reference"
              onClick={() => toggleRel(reference, 'person')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
            >
              <i className="fa fa-pencil-square" />
            </div>
            <div
              className="ref-btn"
              title="Go to referenced entity"
              aria-label="Go to referenced entity"
            >
              <Link to={url} target="_blank">
                <i className="fa fa-external-link-square" />
              </Link>
            </div>
            <div
              className="ref-btn delete-ref"
              onClick={() => deleteRef(_id, tLabel, 'Person')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="Delete reference"
              title="Delete reference"
            >
              <i className="fa fa-times-circle" />
            </div>
          </div>
        );
        return row;
      }
      return null;
    };

    const peopleOpenActive = !state.peopleOpen ? '' : ' active';
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
      const { ref = null, term = null } = reference;
      if (ref !== null) {
        const { _id = '', label = '' } = ref;
        const thumbnailPath = getResourceThumbnailURL(ref);
        const thumbnailImage =
          thumbnailPath !== null ? (
            <img src={thumbnailPath} alt={label} className="img-fluid" />
          ) : null;
        const {
          role: termRole = null,
          roleLabel = '',
          label: tLabel = '',
        } = term;
        const role = termRole !== null ? <Label>as {roleLabel}</Label> : null;
        const url = `/resource/${_id}`;
        const row = (
          <div key={_id} className="img-thumbnail related-resource">
            <div className="ref-label">
              <i>{tLabel}</i>
              {thumbnailImage}
              <Label>{label}</Label>
              {role}
            </div>
            <div className="related-resource-btns">
              <div
                className="ref-btn"
                title="Edit reference"
                aria-label="Edit reference"
                onClick={() => toggleRel(reference, 'resource')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
              >
                <i className="fa fa-pencil-square" />
              </div>
              <div
                className="ref-btn"
                title="Go to referenced entity"
                aria-label="Go to referenced entity"
              >
                <Link to={url} target="_blank">
                  <i className="fa fa-external-link-square" />
                </Link>
              </div>
              <div
                className="ref-btn delete-ref"
                onClick={() => deleteRef(_id, tLabel, 'Resource')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="Delete reference"
                title="Delete reference"
              >
                <i className="fa fa-times-circle" />
              </div>
            </div>
          </div>
        );
        return row;
      }
      return null;
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
      const { ref = null, term = null } = reference;
      if (ref !== null) {
        const { _id = '', label = '' } = ref;
        const url = `/spatial/${_id}`;
        const {
          role: termRole = null,
          roleLabel = '',
          label: tLabel = '',
        } = term;
        const role = termRole !== null ? <Label>as {roleLabel}</Label> : null;
        const row = (
          <div key={_id} className="ref-item">
            <div className="ref-label">
              <i>{tLabel}</i> <b>{label}</b>
              {role}
            </div>
            <div
              className="ref-btn"
              title="Edit reference"
              aria-label="Edit reference"
              onClick={() => toggleRel(reference, 'spatial')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
            >
              <i className="fa fa-pencil-square" />
            </div>
            <div
              className="ref-btn"
              title="Go to referenced entity"
              aria-label="Go to referenced entity"
            >
              <Link to={url} target="_blank">
                <i className="fa fa-external-link-square" />
              </Link>
            </div>
            <div
              className="ref-btn delete-ref"
              onClick={() => deleteRef(_id, tLabel, 'Spatial')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="Delete reference"
              title="Delete reference"
            >
              <i className="fa fa-times-circle" />
            </div>
          </div>
        );
        return row;
      }
      return null;
    };
    const spatialOpenActive = !state.spatialOpen ? '' : ' active';

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
      const { ref = null, term = null } = reference;
      if (ref !== null) {
        const { _id, label = '' } = ref;
        const {
          role: termRole = null,
          roleLabel = '',
          label: tLabel = '',
        } = term;
        const role = termRole !== null ? <Label>as {roleLabel}</Label> : null;
        const url = `/temporal/${_id}`;
        const row = (
          <div key={_id} className="ref-item">
            <div className="ref-label">
              <i>{tLabel}</i> <b>{label}</b>
              {role}
            </div>
            <div
              className="ref-btn"
              title="Edit reference"
              aria-label="Edit reference"
              onClick={() => toggleRel(reference, 'temporal')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
            >
              <i className="fa fa-pencil-square" />
            </div>
            <div
              className="ref-btn"
              title="Go to referenced entity"
              aria-label="Go to referenced entity"
            >
              <Link to={url} target="_blank">
                <i className="fa fa-external-link-square" />
              </Link>
            </div>
            <div
              className="ref-btn delete-ref"
              onClick={() => deleteRef(_id, tLabel, 'Temporal')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="Delete reference"
              title="Delete reference"
            >
              <i className="fa fa-times-circle" />
            </div>
          </div>
        );
        return row;
      }
      return null;
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
    <>
      {eventsBlock}
      {organisationsBlock}
      {peopleBlock}
      {resourcesBlock}
      {spatialBlock}
      {temporalBlock}
    </>
  );
}
RelatedEntitiesBlock.defaultProps = {
  item: null,
  itemType: 'Person',
  reload: () => {},
  toggleRel: () => {},
};
RelatedEntitiesBlock.propTypes = {
  item: PropTypes.object,
  itemType: PropTypes.string,
  reload: PropTypes.func,
  toggleRel: PropTypes.func,
};

export default RelatedEntitiesBlock;
