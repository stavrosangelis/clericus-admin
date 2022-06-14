import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getResourceThumbnailURL } from '../../../helpers';

function Row(props) {
  // props
  const { item, page, index, limit, toggleSelected } = props;

  // redux
  const resourcesTypes = useSelector((state) => state.resourcesTypes);

  const countPage = page - 1;
  const count = index + 1 + countPage * limit;
  const url = `/resource/${item._id}`;

  let thumbnailImage = [];
  const thumbnailURL = getResourceThumbnailURL(item);
  if (thumbnailURL !== null) {
    thumbnailImage = (
      <img
        src={thumbnailURL}
        className="organisations-list-thumbnail img-fluid img-thumbnail"
        alt={item.label}
      />
    );
    if (
      typeof item.resourceType !== 'undefined' &&
      item.resourceType === 'document'
    ) {
      thumbnailImage = (
        <div className="resource-list-document">
          <i className="fa fa-file-pdf-o" />
        </div>
      );
    }
  }
  const systemType =
    resourcesTypes.find((i) => i._id === item.systemType)?.label || '';
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
          {thumbnailImage}
        </Link>
      </td>
      <td>
        <Link href={url} to={url}>
          {item.label}
        </Link>
      </td>
      <td>
        <Link href={url} to={url}>
          {systemType}
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
