import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function ItemContextMenu(props) {
  const { top, left, visible, itemId, toggleDeleteModalFn, onClickFn } = props;

  const displayClass = visible ? 'block' : 'none';
  const gotoLink = (
    <li>
      <Link
        href={`/resource/${itemId}`}
        to={`/resource/${itemId}`}
        target="_blank"
      >
        Go to item
      </Link>
    </li>
  );
  const deleteItemLink = (
    <li>
      <div
        onClick={() => toggleDeleteModalFn()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle delete modal"
      >
        Delete item
      </div>
    </li>
  );

  const contextMenuStyle = {
    top,
    left,
    display: displayClass,
  };

  return (
    <div className="context-menu" style={contextMenuStyle}>
      <ul>
        {gotoLink}
        <li>
          <div
            onClick={() => {
              onClickFn();
            }}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="edit item"
          >
            Edit item
          </div>
        </li>
        {deleteItemLink}
      </ul>
    </div>
  );
}
ItemContextMenu.defaultProps = {
  top: 0,
  left: 0,
  visible: false,
  onClickFn: () => {},
  itemId: null,
  toggleDeleteModalFn: () => {},
};
ItemContextMenu.propTypes = {
  top: PropTypes.number,
  left: PropTypes.number,
  visible: PropTypes.bool,
  onClickFn: PropTypes.func,
  itemId: PropTypes.number,
  toggleDeleteModalFn: PropTypes.func,
};
export default ItemContextMenu;
