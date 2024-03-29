import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Draggable from './Draggable';

const AnnotationsLayer = (props) => {
  const {
    width,
    height,
    container: propsContainer,
    itemContextMenuShow,
    returnValues,
  } = props;
  const parentDimensions = { width, height };
  const [contextMenuState, setContextMenuState] = useState({});

  const contextMenuShow = (e, _id, i) => {
    e.preventDefault();
    const wrapper = document.getElementById('main-wrapper');
    let top = e.clientY;
    let left = e.clientX;
    if (wrapper.classList.contains('nav-open')) {
      left -= 260;
      const container = propsContainer.current;
      const rect = container.getBoundingClientRect();
      const rectTop = rect.top;
      const { offsetTop } = container;
      if (rectTop < 0) {
        top += Math.abs(rect.top);
      } else {
        top -= Math.abs(rect.top);
      }
      top += offsetTop;
    }
    const state = {
      visible: true,
      top,
      left,
      itemId: Number(_id),
      index: i,
    };
    itemContextMenuShow(state);
    setContextMenuState(state);
  };

  const contextMenuHide = () => {
    const stateCopy = contextMenuState;
    contextMenuState.visible = false;
    itemContextMenuShow(contextMenuState);
    setContextMenuState(stateCopy);
  };

  let annotationsLayer = [];
  const { items } = props;
  if (typeof items !== 'undefined') {
    const annotationItems = items.map((r, i) => {
      const item = r.ref;
      let { metadata } = item;
      if (typeof metadata !== 'undefined' && typeof metadata === 'string') {
        metadata = JSON.parse(metadata);
        if (typeof metadata === 'string') {
          metadata = JSON.parse(metadata);
        }
      }
      let layer = [];
      if (typeof metadata.image !== 'undefined') {
        const { default: defaultMeta } = metadata.image;
        const {
          width: dWidth = 100,
          height: dHeight = 100,
          x = 0,
          y = 0,
          rotate = 0,
        } = defaultMeta;
        layer = (
          <Draggable
            key={item._id}
            index={i}
            className="annotation-item"
            item={item}
            draggable
            resizable
            rotate
            width={dWidth}
            height={dHeight}
            x={x}
            y={y}
            degree={rotate}
            parentConstrain
            parentRef={propsContainer}
            parentDimensions={parentDimensions}
            contextMenu={contextMenuShow}
            contextMenuHide={contextMenuHide}
            onInteractionStop={returnValues}
          />
        );
      }

      return layer;
    });
    annotationsLayer = (
      <div className="annotation-items">{annotationItems}</div>
    );
  }

  return annotationsLayer;
};

AnnotationsLayer.defaultProps = {
  width: 100,
  height: 100,
  container: null,
  itemContextMenuShow: () => {},
  returnValues: () => {},
};
AnnotationsLayer.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  container: PropTypes.object,
  itemContextMenuShow: PropTypes.func,
  returnValues: PropTypes.func,
};
export default AnnotationsLayer;
