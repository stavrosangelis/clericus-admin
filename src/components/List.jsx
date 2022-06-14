import React from 'react';
import PropTypes from 'prop-types';
import Grid from './Grid';
import Table from './Table';

const List = (props) => {
  const {
    columns,
    items,
    listIndex,
    loading,
    type,
    allChecked,
    toggleSelectedAll,
    toggleSelected,
    grid,
  } = props;

  const output = grid ? (
    <Grid
      columns={columns}
      items={items}
      listIndex={listIndex}
      type={type}
      toggleSelected={toggleSelected}
      toggleSelectedAll={toggleSelectedAll}
      allChecked={allChecked}
    />
  ) : (
    <Table
      columns={columns}
      items={items}
      listIndex={listIndex}
      loading={loading}
      type={type}
      toggleSelected={toggleSelected}
      toggleSelectedAll={toggleSelectedAll}
      allChecked={allChecked}
    />
  );
  return output;
};

List.defaultProps = {
  columns: [],
  items: [],
  listIndex: 0,
  allChecked: false,
  grid: false,
  loading: false,
  toggleSelected: () => {},
  toggleSelectedAll: () => {},
};
List.propTypes = {
  columns: PropTypes.array,
  items: PropTypes.array,
  listIndex: PropTypes.number,
  type: PropTypes.string.isRequired,
  toggleSelected: PropTypes.func,
  toggleSelectedAll: PropTypes.func,
  allChecked: PropTypes.bool,
  grid: PropTypes.bool,
  loading: PropTypes.bool,
};

export default List;
