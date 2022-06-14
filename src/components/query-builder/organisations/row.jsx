import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getThumbnailURL } from '../../../helpers';

function Row(props) {
  // props
  const { item, page, index, limit, toggleSelected } = props;

  const countPage = page - 1;
  const count = index + 1 + countPage * limit;
  let thumbnailImage = [];
  const thumbnailURL = getThumbnailURL(item);
  if (thumbnailURL !== null) {
    thumbnailImage = (
      <img
        src={thumbnailURL}
        className="organisations-list-thumbnail img-fluid img-thumbnail"
        alt={item.label}
      />
    );
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
      <td>{thumbnailImage}</td>
      <td>
        <Link
          href={`/organisation/${item._id}`}
          to={`/organisation/${item._id}`}
        >
          {item.label}
        </Link>
      </td>
      <td>
        <Link
          href={`/organisation/${item._id}`}
          to={`/organisation/${item._id}`}
        >
          {item.organisationType}
        </Link>
      </td>
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
