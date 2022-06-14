import React from 'react';
import { Table, Spinner } from 'reactstrap';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { setPaginationOrder } from '../redux/actions';
import TableRow from './TableRow';

function TableComponent(props) {
  const dispatch = useDispatch();
  const {
    columns,
    items,
    listIndex,
    loading,
    type,
    allChecked,
    toggleSelectedAll,
    toggleSelected,
  } = props;

  const { [`${type}Pagination`]: pagination } = useSelector((state) => state);

  const { orderDir, orderField } = pagination;

  const columnsOutput = columns.map((c, i) => {
    const key = `heading-${i}`;
    let output = null;
    const { label, order = false, orderLabel = '', width = '' } = c;
    const style = {};
    if (width !== '') {
      style.width = width;
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
      let icon = null;
      const className = order ? 're-order' : '';
      if (orderField === orderLabel) {
        if (orderDir === 'asc') {
          icon = <i className="fa fa-caret-up" />;
        }
        if (orderDir === 'desc') {
          icon = <i className="fa fa-caret-down" />;
        }
      }
      const fn = order
        ? () => {
            dispatch(setPaginationOrder(type, orderLabel));
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

  const tBody = loading ? (
    <tr>
      <td colSpan={columns.length}>
        <div style={{ padding: '40pt', textAlign: 'center' }}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </td>
    </tr>
  ) : (
    items.map((item, i) => {
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
    })
  );

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
}

TableComponent.defaultProps = {
  columns: [],
  items: [],
  allChecked: false,
  loading: false,
};
TableComponent.propTypes = {
  columns: PropTypes.array,
  items: PropTypes.array,
  listIndex: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  allChecked: PropTypes.bool,
  toggleSelectedAll: PropTypes.func.isRequired,
  toggleSelected: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default TableComponent;
