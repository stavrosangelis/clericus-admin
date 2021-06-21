import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getThumbnailURL } from '../helpers';
import spccThumbnail from '../assets/img/spcc.jpg';

const getValue = (row = null, props = []) => {
  if (row === null || props.length === 0) {
    return '';
  }
  return row[props[0]];
};

const TableRow = (props) => {
  const { row, columns, index, type, toggleSelected } = props;
  const rowOutput = [];
  for (let i = 0; i < columns.length; i += 1) {
    const column = columns[i];
    const prop = column.props[0];
    const { link, align, modal } = column;
    const propsCopy = [...column.props];
    let value = '';
    switch (prop) {
      case 'checked':
        value = (
          <div className="select-checkbox-container">
            <input
              type="checkbox"
              value={i}
              checked={getValue(row, propsCopy)}
              onChange={() => false}
            />
            <span
              className="select-checkbox"
              onClick={() => toggleSelected(index)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="toggle selected"
            />
          </div>
        );
        break;
      case '#':
        value = index + 1;
        break;
      case 'edit':
        value = <i className="fa fa-pencil" />;
        break;
      case 'isDefault':
        value = getValue(row, propsCopy) ? (
          <i className="fa fa-check-circle-o success" />
        ) : (
          []
        );
        break;
      case 'status':
        value =
          getValue(row, propsCopy) === 'public' ? (
            <i className="fa fa-check-circle-o success" />
          ) : (
            <i className="fa fa-circle-o failure" />
          );
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
                src={thumbnailURL}
                className="people-list-thumbnail img-fluid img-thumbnail"
                alt={label}
                height={60}
              />
            );
          } else {
            value = (
              <img
                src={spccThumbnail}
                alt={label}
                className="person-default-thumbnail"
                height={60}
              />
            );
          }
        }
        break;
      case 'createdAt':
        value = <small>{getValue(row, propsCopy)}</small>;
        break;
      case 'updatedAt':
        value = <small>{getValue(row, propsCopy)}</small>;
        break;
      default:
        value = getValue(row, propsCopy);
    }
    if (typeof value === 'object' && value.length > 0) {
      value = value.map((v) => v.label).join(', ');
    }
    if (typeof modal !== 'undefined' && modal !== null) {
      value = (
        <div
          className="link-imitation"
          onClick={() => modal(row._id)}
          role="button"
          tabIndex="0"
          aria-label="toggle modal"
          onKeyDown={() => modal(row._id)}
        >
          {value}
        </div>
      );
    }
    if (link && link !== null) {
      if (link.element === 'self') {
        const to = `${link.path}/${row._id}`;
        value = (
          <Link to={to} href={to}>
            {value}
          </Link>
        );
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
    const style =
      typeof align !== 'undefined' && align === 'center'
        ? { textAlign: 'center' }
        : {};
    const key = `cell-${i}`;
    rowOutput.push(
      <td key={key} style={style}>
        {value}
      </td>
    );
  }
  return <tr>{rowOutput}</tr>;
};

TableRow.defaultProps = {
  row: null,
  columns: [],
  index: -1,
};
TableRow.propTypes = {
  row: PropTypes.object,
  columns: PropTypes.array,
  index: PropTypes.number,
  type: PropTypes.string.isRequired,
  toggleSelected: PropTypes.func.isRequired,
};

export default TableRow;
