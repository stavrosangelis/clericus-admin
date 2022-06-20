import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

function Row(props) {
  // props
  const { item, page, index, limit, toggleSelected } = props;

  // redux
  const eventTypes = useSelector((state) => state.eventTypes);

  const findEventTypeByIdRec = (_id, types) => {
    let eventType = types.find((t) => t._id === _id) || null;
    if (eventType === null) {
      const { length } = types;
      for (let c = 0; c < length; c += 1) {
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
  const { temporal: iTemporal } = item;
  const { length: itLength } = iTemporal;
  for (let t = 0; t < itLength; t += 1) {
    const temp = iTemporal[t];
    const { _id, ref } = temp;
    const { _id: rId, label: rLabel } = ref;
    const newItem = [];
    if (t > 0) {
      newItem.push(<span key={t}>, </span>);
    }
    temporal.push(
      <Link key={_id} href={`/temporal/${_id}`} to={`/temporal/${rId}`}>
        {rLabel}
      </Link>
    );
  }
  let temporalOut = temporal;
  if (itLength > 1) {
    temporalOut = `[${temporal}]`;
  }
  const spatial = [];
  const { spatial: iSpatial } = item;
  const { length: isLength } = iSpatial;
  for (let s = 0; s < isLength; s += 1) {
    const spat = iSpatial[s];
    const { _id, ref } = spat;
    const { _id: rId, label: rLabel } = ref;
    const newItem = [];
    if (s > 0) {
      newItem.push(<span key={s}>, </span>);
    }
    newItem.push(
      <Link key={_id} href={`/spatial/${_id}`} to={`/spatial/${rId}`}>
        {rLabel}
      </Link>
    );
    spatial.push(newItem);
  }
  let spatialOut = spatial;
  if (isLength > 1) {
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

  const { _id: iId, label: iLabel, checked: iChecked } = item;
  return (
    <tr key={index}>
      <td>
        <div className="select-checkbox-container">
          <input
            type="checkbox"
            value={index}
            checked={iChecked}
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
        <Link href={`/event/${iId}`} to={`/event/${iId}`}>
          {iLabel}
        </Link>
      </td>
      <td>
        <Link href={`/event/${iId}`} to={`/event/${iId}`}>
          {eventType}
        </Link>
      </td>
      <td>{temporalOut}</td>
      <td>{spatialOut}</td>
      <td>{createdAt}</td>
      <td>{updatedAt}</td>
      <td>
        <Link href={`/event/${iId}`} to={`/event/${iId}`} className="edit-item">
          <i className="fa fa-pencil" />
        </Link>
      </td>
    </tr>
  );
}

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
