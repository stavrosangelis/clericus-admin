import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Card, CardImg } from 'reactstrap';
import { getThumbnailURL, getResourceThumbnailURL } from '../helpers';
import spccThumbnail from '../assets/img/spcc.jpg';

const getValue = (row = null, props = []) => {
  if (row === null || props.length === 0) {
    return '';
  }
  return row[props[0]];
};

const GridItem = (props) => {
  const { row, columns, index, type, toggleSelected } = props;
  const itemContent = [];
  let documentRow = false;
  for (let i = 0; i < columns.length; i += 1) {
    const columnKey = `column-${i}`;
    const column = columns[i];
    const prop = column.props[0];
    const { link } = column;
    const propsCopy = [...column.props];
    let value = '';
    switch (prop) {
      case 'checked':
        value = (
          <div
            key={columnKey}
            className="select-resource"
            onClick={() => toggleSelected(index)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle selected"
          >
            <i className="fa circle" />
          </div>
        );
        break;
      case 'edit':
        value = <i className="fa fa-pencil" />;
        break;
      case 'label':
        value = getValue(row, propsCopy);
        break;
      case 'thumbnail':
        if (type === 'people') {
          let label = row.firstName;
          if (row.lastName !== '') {
            label += ` ${row.lastName}`;
          }
          const thumbnailURL = getThumbnailURL(row);
          if (thumbnailURL !== null) {
            value = (
              <img
                key={columnKey}
                src={thumbnailURL}
                className="people-list-thumbnail img-fluid img-thumbnail"
                alt={label}
                height={60}
              />
            );
          } else {
            value = (
              <img
                key={columnKey}
                src={spccThumbnail}
                alt={label}
                className="person-default-thumbnail"
                height={60}
              />
            );
          }
        }
        if (type === 'resources') {
          const thumbnailURL = getResourceThumbnailURL(row);
          if (thumbnailURL !== null) {
            value = (
              <CardImg src={thumbnailURL} key={columnKey} alt={row.label} />
            );
          } else if (row.resourceType === 'document') {
            documentRow = true;
            value = (
              <span key={columnKey} className="resource-document-thumbnail">
                <i className="fa fa-file-pdf-o" />
              </span>
            );
          } else {
            documentRow = true;
          }
        }
        break;
      default:
        value = (
          <div className="item" key={columnKey}>
            <small>
              <span>{column.label}</span>: {getValue(row, propsCopy)}
            </small>
          </div>
        );
    }
    if (link && link !== null) {
      if (link.element === 'self') {
        const to = `${link.path}/${row._id}`;
        if (column.label === 'Label') {
          value = (
            <div className="item item-label" key={columnKey}>
              <Link to={to} href={to}>
                {value}
              </Link>
            </div>
          );
        } else {
          value = (
            <Link to={to} href={to} key={columnKey}>
              {value}
            </Link>
          );
        }
      } else if (link.type === 'array') {
        value = row[link.element].map((item, itemKey) => {
          const linkId = item.ref[link.key];
          const to = `${link.path}/${linkId}`;
          let comma = '';
          if (itemKey + 1 < row[link.element].length) {
            comma = <span className="cell-sep">,</span>;
          }
          const organisationType =
            typeof item.ref.organisationType !== 'undefined' ? (
              <small> [{item.ref.organisationType}]</small>
            ) : (
              []
            );
          return (
            <Link href={to} to={to} key={linkId}>
              <span>
                {item.ref.label}
                {organisationType}
              </span>
              {comma}
            </Link>
          );
        });
      } else {
        value = '';
      }
    }
    itemContent.push(value);
  }
  const checked =
    typeof row.checked !== 'undefined' && row.checked ? ' checked' : '';
  const documentClass = documentRow ? ' document' : '';
  const itemOutput = (
    <div key={row._id} className="col-12 col-sm-6 col-md-3">
      <Card
        style={{ marginBottom: '15px' }}
        className={`resource-card${checked}${documentClass}`}
      >
        {itemContent}
      </Card>
    </div>
  );
  return itemOutput;
};

GridItem.defaultProps = {
  row: null,
  columns: [],
  index: -1,
};
GridItem.propTypes = {
  row: PropTypes.object,
  columns: PropTypes.array,
  index: PropTypes.number,
  type: PropTypes.string.isRequired,
  toggleSelected: PropTypes.func.isRequired,
};

export default GridItem;
