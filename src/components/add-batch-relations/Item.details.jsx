import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import '../../assets/scss/add.relations.scss';
import { useSelector } from 'react-redux';
import {
  getData,
  eventBlock,
  organisationBlock,
  peopleBlock,
  resourcesBlock,
  spatialBlock,
  temporalBlock,
  getResourceThumbnailURL,
} from '../../helpers';

function ItemDetails(props) {
  const { itemsType, visible, toggle, selectedItem, parentHeight } = props;
  const [stateVisible, setStateVisible] = useState(false);
  const [item, setItem] = useState(null);
  const eventTypes = useSelector((state) => state.eventTypes);

  const load = useCallback(async () => {
    let url = '';
    switch (itemsType) {
      case 'events':
        url = `event`;
        break;
      case 'organisations':
        url = `organisation`;
        break;
      case 'people':
        url = `person`;
        break;
      case 'resources':
        url = `resource`;
        break;
      case 'temporal':
        url = `temporal`;
        break;
      case 'spatial':
        url = `spatial`;
        break;
      default:
        url = ``;
        break;
    }
    const data = await getData(url, { _id: selectedItem });
    setItem(data.data);
  }, [itemsType, selectedItem]);

  useEffect(() => {
    if (visible !== stateVisible) {
      setStateVisible(visible);
      if (visible) {
        load();
      } else {
        setTimeout(() => {
          setItem(null);
        }, 400);
      }
    }
  }, [visible, itemsType, stateVisible, load]);

  const visibleClass = visible ? ' visible' : '';

  let content = [];
  if (item !== null) {
    const itemId =
      typeof item._id !== 'undefined' && item._id !== '' ? item._id : '';
    const label =
      typeof item.label !== 'undefined' && item.label !== '' ? item.label : '';
    const status =
      typeof item.status !== 'undefined' && item.status !== ''
        ? item.status
        : '';
    const createdAt =
      typeof item.createdAt !== 'undefined' && item.createdAt !== ''
        ? item.createdAt
        : '';
    const updatedAt =
      typeof item.updatedAt !== 'undefined' && item.updatedAt !== ''
        ? item.updatedAt
        : '';
    const description =
      typeof item.description !== 'undefined' && item.description !== ''
        ? item.description
        : '';
    const events =
      typeof item.events !== 'undefined'
        ? item.events.map((e) => eventBlock(e)) || []
        : [];
    const organisations =
      typeof item.organisations !== 'undefined'
        ? item.organisations.map((o) => organisationBlock(o)) || []
        : [];
    const people =
      typeof item.people !== 'undefined'
        ? item.people.map((o) => peopleBlock(o)) || []
        : [];
    const resources =
      typeof item.resources !== 'undefined'
        ? item.resources.map((o) => resourcesBlock(o)) || []
        : [];
    const spatial =
      typeof item.spatial !== 'undefined'
        ? item.spatial.map((o) => spatialBlock(o)) || []
        : [];
    const temporal =
      typeof item.temporal !== 'undefined'
        ? item.temporal.map((o) => temporalBlock(o)) || []
        : [];
    const startDate =
      typeof item.startDate !== 'undefined' && item.startDate !== ''
        ? item.startDate
        : '';
    const endDate =
      typeof item.endDate !== 'undefined' && item.endDate !== ''
        ? item.endDate
        : '';
    const thumbnail =
      typeof item.paths !== 'undefined' ? getResourceThumbnailURL(item) : null;
    // types
    const eventType =
      typeof item.eventType !== 'undefined' && item.eventType !== ''
        ? eventTypes.find((e) => e._id === item.eventType).label || ''
        : '';
    const organisationType =
      typeof item.organisationType !== 'undefined' &&
      item.organisationType !== ''
        ? item.organisationType
        : '';
    const personType =
      typeof item.personType !== 'undefined' && item.personType !== ''
        ? item.personType
        : '';
    const itemIdOutput =
      itemId !== '' ? (
        <div>
          <h6>
            ID: <span>{itemId}</span>
          </h6>
        </div>
      ) : (
        []
      );
    const labelOutput =
      label !== '' ? (
        <div>
          <h6>
            Label: <span>{label}</span>
          </h6>
        </div>
      ) : (
        []
      );
    const statusOutput =
      status !== '' ? (
        <div>
          <h6>
            Status: <span>{status}</span>
          </h6>
        </div>
      ) : (
        []
      );
    const createdAtOutput =
      createdAt !== '' ? (
        <div>
          <h6>
            Created: <small>{createdAt}</small>
          </h6>
        </div>
      ) : (
        []
      );
    const updatedAtOutput =
      updatedAt !== '' ? (
        <div>
          <h6>
            Updated: <small>{updatedAt}</small>
          </h6>
        </div>
      ) : (
        []
      );
    const descriptionOutput =
      description !== '' && description !== null ? (
        <div>
          <h6>Description:</h6>
          <p>{item.description}</p>
        </div>
      ) : (
        []
      );
    const startDateOutput =
      startDate !== '' ? (
        <div>
          <h6>
            Start date: <span>{startDate}</span>
          </h6>
        </div>
      ) : (
        []
      );
    const endDateOutput =
      endDate !== '' ? (
        <div>
          <h6>
            End date: <span>{endDate}</span>
          </h6>
        </div>
      ) : (
        []
      );
    const eventsOutput =
      events.length > 0 ? (
        <div>
          <h6>Events:</h6>
          <ul className="tag-list">{events}</ul>
        </div>
      ) : (
        []
      );
    const organisationsOutput =
      organisations.length > 0 ? (
        <div>
          <h6>Organisations:</h6>
          <ul className="tag-list">{organisations}</ul>
        </div>
      ) : (
        []
      );
    const peopleOutput =
      people.length > 0 ? (
        <div>
          <h6>People:</h6>
          <ul className="tag-list">{people}</ul>
        </div>
      ) : (
        []
      );
    const resourcesOutput =
      resources.length > 0 ? (
        <div>
          <h6>Resources:</h6>
          <ul className="tag-list">{resources}</ul>
        </div>
      ) : (
        []
      );
    const spatialOutput =
      spatial.length > 0 ? (
        <div>
          <h6>Spatial:</h6>
          <ul className="tag-list">{spatial}</ul>
        </div>
      ) : (
        []
      );
    const temporalOutput =
      temporal.length > 0 ? (
        <div>
          <h6>Temporal:</h6>
          <ul className="tag-list">{temporal}</ul>
        </div>
      ) : (
        []
      );
    const thumbnailOutput =
      thumbnail !== null ? (
        <div className="item-details">
          <img
            className="img-responsive img-thumbnail"
            src={getResourceThumbnailURL(item)}
            alt={label}
          />
        </div>
      ) : (
        []
      );
    const eventTypeOutput =
      eventType !== '' ? (
        <div>
          <h6>
            Type: <span>{eventType}</span>
          </h6>
        </div>
      ) : (
        []
      );
    const organisationTypeOutput =
      organisationType !== '' ? (
        <div>
          <h6>
            Type: <span>{organisationType}</span>
          </h6>
        </div>
      ) : (
        []
      );
    const personTypeOutput =
      personType !== '' ? (
        <div>
          <h6>
            Type: <span>{personType}</span>
          </h6>
        </div>
      ) : (
        []
      );
    content = (
      <div>
        {thumbnailOutput}
        {itemIdOutput}
        {labelOutput}
        {statusOutput}
        {startDateOutput}
        {endDateOutput}
        {createdAtOutput}
        {updatedAtOutput}
        {eventTypeOutput}
        {organisationTypeOutput}
        {personTypeOutput}
        {descriptionOutput}
        {eventsOutput}
        {organisationsOutput}
        {peopleOutput}
        {resourcesOutput}
        {spatialOutput}
        {temporalOutput}
      </div>
    );
  }
  const percHeight = (parentHeight / 100) * 75;
  const height = percHeight - 50;
  const style = {
    height,
  };
  return (
    <div className={`add-relations-details${visibleClass}`} style={style}>
      <div className="modal-header">
        <h5 className="modal-title">Item details</h5>
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={() => toggle()}
        >
          <i className="fa fa-angle-down" />
        </button>
      </div>
      <div className="add-relations-details-inner">{content}</div>
    </div>
  );
}

ItemDetails.defaultProps = {
  selectedItem: null,
  parentHeight: 0,
};

ItemDetails.propTypes = {
  itemsType: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  selectedItem: PropTypes.string,
  parentHeight: PropTypes.number,
};

export default ItemDetails;
