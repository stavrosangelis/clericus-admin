import React from 'react';
import { Table } from 'reactstrap';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { setPaginationOrder } from '../redux/actions';
import TableRow from './TableRow';

const TableComponent = (props) => {
  const dispatch = useDispatch();
  const {
    columns,
    items,
    listIndex,
    type,
    allChecked,
    toggleSelectedAll,
    toggleSelected,
  } = props;

  const orderField = useSelector(
    (state) => state[`${type}Pagination`].orderField
  );
  const orderDir = useSelector((state) => state[`${type}Pagination`].orderDir);

  const columnsOutput = columns.map((c, i) => {
    const key = `heading-${i}`;
    let output = null;
    const { label } = c;
    const style = {};
    if (typeof c.width !== 'undefined' && c.width !== '') {
      style.width = c.width;
    }
    if (label === 'checked') {
      output = (
        <th style={style} key={key}>
          <div className="select-checkbox-container default">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={() => false}
            />
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
      );
    } else {
      let icon = [];
      let className = '';
      if (c.order) {
        className = 're-order';
      }
      if (orderField === c.orderLabel) {
        if (orderDir === 'asc') {
          icon = <i className="fa fa-caret-up" />;
        }
        if (orderDir === 'desc') {
          icon = <i className="fa fa-caret-down" />;
        }
      }
      const fn = c.order
        ? () => {
            dispatch(setPaginationOrder(type, c.orderLabel));
          }
        : () => false;
      output = (
        <th style={style} key={key} onClick={() => fn()} className={className}>
          {label} {icon}
        </th>
      );
    }
    return output;
  });

  const tBody = items.map((item, i) => {
    const index = i + listIndex;
    return (
      <TableRow
        key={item._id}
        row={item}
        columns={columns}
        index={index}
        type={type}
        toggleSelected={toggleSelected}
      />
    );
  });

  return (
    <Table hover responsive>
      <thead>
        <tr>{columnsOutput}</tr>
      </thead>
      <tbody>{tBody}</tbody>
      <tfoot>
        <tr>{columnsOutput}</tr>
      </tfoot>
    </Table>
  );
};

TableComponent.defaultProps = {
  columns: [],
  items: [],
  allChecked: false,
};
TableComponent.propTypes = {
  columns: PropTypes.array,
  items: PropTypes.array,
  listIndex: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  allChecked: PropTypes.bool,
  toggleSelectedAll: PropTypes.func.isRequired,
  toggleSelected: PropTypes.func.isRequired,
};

export default TableComponent;
