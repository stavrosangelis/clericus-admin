import React from 'react';
import PropTypes from 'prop-types';

function Columns(props) {
  const { allChecked, toggleSelectedAll, updateSort, orderField, orderDesc } =
    props;

  let labelOrderIcon = [];
  let regionOrderIcon = [];
  let countryOrderIcon = [];
  let typeOrderIcon = [];
  let createdOrderIcon = [];
  let updatedOrderIcon = [];
  if (orderField === 'label' || orderField === '') {
    if (orderDesc) {
      labelOrderIcon = <i className="fa fa-caret-down" />;
    } else {
      labelOrderIcon = <i className="fa fa-caret-up" />;
    }
  }
  if (orderField === 'region') {
    if (orderDesc) {
      regionOrderIcon = <i className="fa fa-caret-down" />;
    } else {
      regionOrderIcon = <i className="fa fa-caret-up" />;
    }
  }
  if (orderField === 'country') {
    if (orderDesc) {
      countryOrderIcon = <i className="fa fa-caret-down" />;
    } else {
      countryOrderIcon = <i className="fa fa-caret-up" />;
    }
  }
  if (orderField === 'locationType') {
    if (orderDesc) {
      typeOrderIcon = <i className="fa fa-caret-down" />;
    } else {
      typeOrderIcon = <i className="fa fa-caret-up" />;
    }
  }
  if (orderField === 'createdAt') {
    if (orderDesc) {
      createdOrderIcon = <i className="fa fa-caret-down" />;
    } else {
      createdOrderIcon = <i className="fa fa-caret-up" />;
    }
  }
  if (orderField === 'updatedAt') {
    if (orderDesc) {
      updatedOrderIcon = <i className="fa fa-caret-down" />;
    } else {
      updatedOrderIcon = <i className="fa fa-caret-up" />;
    }
  }
  return (
    <tr>
      <th style={{ width: '30px' }}>
        <div className="select-checkbox-container default">
          <input type="checkbox" checked={allChecked} onChange={() => false} />
          <span
            className="select-checkbox"
            onClick={toggleSelectedAll}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle select all"
          />
        </div>
      </th>
      <th style={{ width: '40px' }}>#</th>
      <th className="ordering-label" onClick={() => updateSort('label')}>
        Label {labelOrderIcon}
      </th>
      <th className="ordering-label" onClick={() => updateSort('region')}>
        Region {regionOrderIcon}
      </th>
      <th className="ordering-label" onClick={() => updateSort('country')}>
        Country {countryOrderIcon}
      </th>
      <th className="ordering-label" onClick={() => updateSort('locationType')}>
        Type {typeOrderIcon}
      </th>
      <th className="ordering-label" onClick={() => updateSort('createdAt')}>
        Created {createdOrderIcon}
      </th>
      <th className="ordering-label" onClick={() => updateSort('updatedAt')}>
        Updated {updatedOrderIcon}
      </th>
      <th style={{ width: '30px' }} aria-label="edit" />
    </tr>
  );
}
Columns.defaultProps = {
  allChecked: false,
  toggleSelectedAll: () => {},
  updateSort: () => {},
  orderField: '',
  orderDesc: false,
};

Columns.propTypes = {
  allChecked: PropTypes.bool,
  toggleSelectedAll: PropTypes.func,
  updateSort: PropTypes.func,
  orderField: PropTypes.string,
  orderDesc: PropTypes.bool,
};
export default Columns;
