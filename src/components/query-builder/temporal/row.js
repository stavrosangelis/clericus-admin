import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const Row = (props) => {
  // props
  const { item, page, index, limit, toggleSelected } = props;

  const countPage = page - 1;
  const count = index + 1 + countPage * limit;
  const url = `/temporal/${item._id}`;
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
        <Link href={url} to={url}>
          {item.label}
        </Link>
      </td>
      <td>
        <Link href={url} to={url}>
          {item.startDate}
        </Link>
      </td>
      <td>
        <Link href={url} to={url}>
          {item.endDate}
        </Link>
      </td>
      <td>{createdAt}</td>
      <td>{updatedAt}</td>
      <td>
        <Link href={url} to={url} className="edit-item">
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
