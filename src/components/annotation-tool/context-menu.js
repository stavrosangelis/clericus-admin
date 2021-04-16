import React from 'react';
import PropTypes from 'prop-types';

const ContextMenu = (props) => {
  const { top, left, visible, onClickFn } = props;

  const displayClass = visible ? 'block' : 'none';

  const contextMenuStyle = {
    top,
    left,
    display: displayClass,
  };

  return (
    <div className="context-menu" style={contextMenuStyle}>
      <ul>
        <li>
          <div
            onClick={() => onClickFn()}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="pan left"
          >
            Add annotation
          </div>
        </li>
      </ul>
    </div>
  );
};
ContextMenu.defaultProps = {
  top: 0,
  left: 0,
  visible: false,
  onClickFn: () => {},
};
ContextMenu.propTypes = {
  top: PropTypes.number,
  left: PropTypes.number,
  visible: PropTypes.bool,
  onClickFn: PropTypes.func,
};
export default ContextMenu;
