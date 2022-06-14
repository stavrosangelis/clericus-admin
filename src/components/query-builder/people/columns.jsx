import React from 'react';
import PropTypes from 'prop-types';

function Columns(props) {
  const { allChecked, toggleSelectedAll, updateSort, orderField, orderDesc } =
    props;

  let firstNameOrderIcon = [];
  let lastNameOrderIcon = [];
  let createdOrderIcon = [];
  let updatedOrderIcon = [];
  if (orderField === 'firstName' || orderField === '') {
    if (orderDesc) {
      firstNameOrderIcon = <i className="fa fa-caret-down" />;
    } else {
      firstNameOrderIcon = <i className="fa fa-caret-up" />;
    }
  }
  if (orderField === 'lastName') {
    if (orderDesc) {
      lastNameOrderIcon = <i className="fa fa-caret-down" />;
    } else {
      lastNameOrderIcon = <i className="fa fa-caret-up" />;
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
      <th>Thumbnail</th>
      <th className="ordering-label" onClick={() => updateSort('firstName')}>
        First Name {firstNameOrderIcon}
      </th>
      <th className="ordering-label" onClick={() => updateSort('lastName')}>
        Last Name {lastNameOrderIcon}
      </th>
      <th>Organisation</th>
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
