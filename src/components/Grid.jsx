import React from 'react';
import PropTypes from 'prop-types';

import GridItem from './GridItem';

function GridComponent(props) {
  const { columns, items, listIndex, type, toggleSelected } = props;

  const gridBody = items.map((item, i) => {
    const index = i + listIndex;
    return (
      <GridItem
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
    <div className="grid-container">
      <div className="row">{gridBody}</div>
    </div>
  );
}

GridComponent.defaultProps = {
  columns: [],
  items: [],
};
GridComponent.propTypes = {
  columns: PropTypes.array,
  items: PropTypes.array,
  listIndex: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  toggleSelected: PropTypes.func.isRequired,
};

export default GridComponent;
