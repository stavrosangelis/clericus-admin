import React from 'react';
import PropTypes from 'prop-types';

function ContextualMenu(props) {
  const {
    targetFace,
    selectionsActive,
    linkingActive,
    visible,
    position,
    addNewSelection,
    removeSelection,
    updateFaces,
    saveFacesThumbnails,
    storeLinking,
  } = props;
  let menuItems = [];
  let headerText = '';
  let addFaceClass = '';
  let removeFaceClass = 'disabled';
  if (targetFace) {
    addFaceClass = 'disabled';
    removeFaceClass = '';
  }
  if (selectionsActive) {
    headerText = 'Selections';
    menuItems = (
      <ul>
        <li className={addFaceClass}>
          <div
            onClick={addNewSelection}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select event"
          >
            <span>Add new selection</span>
          </div>
        </li>
        <li>
          <div
            className={removeFaceClass}
            onClick={removeSelection}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select event"
          >
            <span>Remove selection</span>
          </div>
        </li>
        <li>
          <div
            onClick={updateFaces}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select event"
          >
            <span>Store selections</span>
          </div>
        </li>
        <li>
          <div
            onClick={saveFacesThumbnails}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select event"
          >
            <span>Extract thumbnails</span>
          </div>
        </li>
      </ul>
    );
  }

  if (linkingActive) {
    headerText = 'Linking';
    menuItems = (
      <ul>
        <li>
          <div
            onClick={storeLinking}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select event"
          >
            <span>Store updates</span>
          </div>
        </li>
      </ul>
    );
  }
  let display = 'none';
  if (visible) {
    display = 'block';
  }
  const style = {
    top: `${position.top}px`,
    left: `${position.left}px`,
    display,
  };
  return (
    <div className="context-menu" style={style}>
      <div className="header">{headerText}</div>
      {menuItems}
    </div>
  );
}
ContextualMenu.defaultProps = {
  targetFace: false,
  selectionsActive: false,
  linkingActive: false,
  visible: false,
  position: {
    top: 0,
    left: 0,
  },
  addNewSelection: () => {},
  removeSelection: () => {},
  updateFaces: () => {},
  saveFacesThumbnails: () => {},
  storeLinking: () => {},
};

ContextualMenu.propTypes = {
  targetFace: PropTypes.bool,
  selectionsActive: PropTypes.bool,
  linkingActive: PropTypes.bool,
  visible: PropTypes.bool,
  position: PropTypes.object,
  addNewSelection: PropTypes.func,
  removeSelection: PropTypes.func,
  updateFaces: PropTypes.func,
  saveFacesThumbnails: PropTypes.func,
  storeLinking: PropTypes.func,
};
export default ContextualMenu;
