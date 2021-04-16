import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

const Row = (props) => {
  // props
  const { item, page, index, limit, toggleSelected } = props;

  // redux
  const eventTypes = useSelector((state) => state.eventTypes);

  const findEventTypeByIdRec = (_id, types) => {
    let eventType = types.find((t) => t._id === _id) || null;
    if (eventType === null) {
      for (let c = 0; c < types.length; c += 1) {
        const { children } = types[c];
        eventType = findEventTypeByIdRec(_id, children);
        if (eventType !== null) {
          break;
        }
      }
    }
    return eventType?.label;
  };

  const findEventTypeById = (_id = null) => {
    if (_id === null) {
      return null;
    }
    return findEventTypeByIdRec(_id, eventTypes);
  };

  const countPage = page - 1;
  const count = index + 1 + countPage * limit;
  const eventType = findEventTypeById(item.eventType);
  const temporal = [];
  for (let t = 0; t < item.temporal.length; t += 1) {
    const temp = item.temporal[t];
    const newItem = [];
    if (t > 0) {
      newItem.push(<span key={t}>, </span>);
    }
    temporal.push(
      <Link
        key={temp._id}
        href={`/temporal/${temp._id}`}
        to={`/temporal/${temp.ref._id}`}
      >
        {temp.ref.label}
      </Link>
    );
  }
  let temporalOut = temporal;
  if (temporal.length > 1) {
    temporalOut = `[${temporal}]`;
  }
  const spatial = [];
  for (let s = 0; s < item.spatial.length; s += 1) {
    const spat = item.spatial[s];
    const newItem = [];
    if (s > 0) {
      newItem.push(<span key={s}>, </span>);
    }
    newItem.push(
      <Link
        key={spat._is}
        href={`/spatial/${spat._id}`}
        to={`/spatial/${spat.ref._id}`}
      >
        {spat.ref.label}
      </Link>
    );
    spatial.push(newItem);
  }
  let spatialOut = spatial;
  if (spatial.length > 1) {
    spatialOut = `[${spatial}]`;
  }
  const createdAt = (
    <div>
      <small>{item.createdAt.split('T')[0]}</small>
      <br />
      <small>{item.createdAt.split('T')[1]}</small>
    </div>
  );
  const updatedAt = (
    <div>
      <small>{item.updatedAt.split('T')[0]}</small>
      <br />
      <small>{item.updatedAt.split('T')[1]}</small>
    </div>
  );

  return (
    <tr key={index}>
      <td>
        <div className="select-checkbox-container">
          <input
            type="checkbox"
            value={index}
            checked={item.checked}
            onChange={() => false}
          />
          <span
            className="select-checkbox"
            onClick={() => toggleSelected(index)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle select"
          />
        </div>
      </td>
      <td>{count}</td>
      <td>
        <Link href={`/event/${item._id}`} to={`/event/${item._id}`}>
          {item.label}
        </Link>
      </td>
      <td>
        <Link href={`/event/${item._id}`} to={`/event/${item._id}`}>
          {eventType}
        </Link>
      </td>
      <td>{temporalOut}</td>
      <td>{spatialOut}</td>
      <td>{createdAt}</td>
      <td>{updatedAt}</td>
      <td>
        <Link
          href={`/event/${item._id}`}
          to={`/event/${item._id}`}
          className="edit-item"
        >
          <i className="fa fa-pencil" />
        </Link>
      </td>
    </tr>
  );
};

Row.defaultProps = {
  item: {},
  page: 1,
  index: -1,
  limit: 25,
  toggleSelected: () => {},
};

Row.propTypes = {
  item: PropTypes.object,
  page: PropTypes.number,
  index: PropTypes.number,
  limit: PropTypes.number,
  toggleSelected: PropTypes.func,
};
export default Row;
