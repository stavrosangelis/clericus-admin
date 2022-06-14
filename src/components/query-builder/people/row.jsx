import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getPersonThumbnailURL } from '../../../helpers';
import defaultThumbnail from '../../../assets/img/spcc.jpg';
import icpThumbnail from '../../../assets/img/icp-logo.jpg';

function Row(props) {
  const { item, page, index, limit, toggleSelected } = props;

  const countPage = page - 1;
  const count = index + 1 + countPage * limit;
  let label = item.firstName;
  if (item.lastName !== '') {
    label += ` ${item.lastName}`;
  }
  let thumbnailImage = [];
  const thumbnailURLs = getPersonThumbnailURL(item);
  if (
    typeof thumbnailURLs.thumbnails !== 'undefined' &&
    thumbnailURLs.thumbnails.length > 0
  ) {
    thumbnailImage = (
      <img
        src={thumbnailURLs.thumbnails[0]}
        className="people-list-thumbnail img-fluid img-thumbnail"
        alt={label}
      />
    );
  } else {
    const isinICP =
      item.resources?.find((i) =>
        i.ref.label.includes('Liam Chambers and Sarah Frank')
      ) || null;
    if (isinICP) {
      thumbnailImage = (
        <img
          src={icpThumbnail}
          className="people-list-thumbnail img-fluid img-thumbnail"
          alt={label}
        />
      );
    } else {
      thumbnailImage = (
        <img
          src={defaultThumbnail}
          className="people-list-thumbnail img-fluid img-thumbnail"
          alt={label}
        />
      );
    }
  }
  let affiliation = null;
  let organisation = '';
  if (
    typeof item.affiliations !== 'undefined' &&
    item.affiliations.length > 0 &&
    typeof item.affiliations[0].ref !== 'undefined'
  ) {
    affiliation = item.affiliations[0].ref;
    organisation = (
      <Link
        href={`/organisation/${affiliation._id}`}
        to={`/organisation/${affiliation._id}`}
      >
        {affiliation.label}
      </Link>
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
      <td>
        <Link href={`/person/${item._id}`} to={`/person/${item._id}`}>
          {thumbnailImage}
        </Link>
      </td>
      <td>
        <Link href={`/person/${item._id}`} to={`/person/${item._id}`}>
          {item.firstName}
        </Link>
      </td>
      <td>
        <Link href={`/person/${item._id}`} to={`/person/${item._id}`}>
          {item.lastName}
        </Link>
      </td>
      <td>{organisation}</td>
      <td>{createdAt}</td>
      <td>{updatedAt}</td>
      <td>
        <Link
          href={`/person/${item._id}`}
          to={`/person/${item._id}`}
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
