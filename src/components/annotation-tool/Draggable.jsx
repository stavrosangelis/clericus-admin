import React, { useEffect, useRef, useReducer } from 'react';
import PropTypes from 'prop-types';

function Draggable(props) {
  const {
    y: top,
    x: left,
    width,
    height,
    degree,
    item: propsItem,
    resizable,
    rotate: propsRotate,
    className: propsClassName,
    children: propsChildren,
    parentConstrain,
    parentRef,
    parentDimensions,
    contextMenuHide,
    onInteractionStop,
    contextMenu,
    index,
    rightClick: rightClickFn,
  } = props;
  const defaultState = {
    dragging: false,
    resizing: false,
    rotating: false,
    resizeDirection: null,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    top,
    left,
    width,
    height,
    rotateDegree: degree || 0,
    rightClick: false,
  };
  const [state, setState] = useReducer(
    (curState, newState) => ({ ...curState, ...newState }),
    defaultState
  );
  const itemRef = useRef(null);

  const dragStart = (e) => {
    contextMenuHide();
    if (state.resizing || state.rotating || state.richtClick) {
      return false;
    }
    if ((e.type === 'mousedown' || e.type === 'click') && e.button === 0) {
      setState({
        dragging: true,
        startX: e.pageX,
        startY: e.pageY,
        x: e.pageX,
        y: e.pageY,
      });
    }
    return false;
  };

  const resizeStart = (e, direction = null) => {
    contextMenuHide();
    if (!resizable || state.dragging || state.rotating || state.richtClick) {
      return false;
    }
    if (e.type === 'mousedown' && e.button === 0) {
      setState({
        resizing: true,
        resizeDirection: direction,
        x: e.pageX,
        y: e.pageY,
      });
    }
    return false;
  };

  const rotateStart = (e) => {
    contextMenuHide();
    if (!propsRotate || state.dragging || state.resizing || state.richtClick) {
      return false;
    }
    if ((e.type === 'mousedown' || e.type === 'click') && e.button === 0) {
      setState({
        rotating: true,
        x: e.pageX,
        y: e.pageY,
      });
    }
    return false;
  };

  // remove oninteraction stop form right click, replace with update item details
  const rightClick = (e) => {
    setState({ rightClick: true });
    const update = {
      height: state.height,
      width: state.width,
      y: state.top,
      x: state.left,
      rotate: state.rotateDegree,
    };
    rightClickFn(update);
    contextMenu(e, propsItem._id, index);
  };

  // item interactions effect
  useEffect(() => {
    const drag = (e) => {
      if (!state.dragging) {
        return false;
      }
      const item = itemRef.current;
      const newX = e.pageX - state.x;
      const newY = e.pageY - state.y;
      const translateX = state.left;
      const translateY = state.top;

      let newTranslateX = translateX + newX;
      let newTranslateY = translateY + newY;

      if (newTranslateX < 0) {
        newTranslateX = 0;
      }
      if (newTranslateY < 0) {
        newTranslateY = 0;
      }
      if (parentConstrain && parentRef !== null) {
        const windowWidth = window.innerWidth;
        const containerWidth = parentDimensions.width;
        const containerHeight = parentDimensions.height;
        const itemWidth = parseFloat(item.style.width.replace('px', ''), 10);
        const itemHeight = parseFloat(item.style.height.replace('px', ''), 10);
        const rightX = translateX + itemWidth;
        const bottomY = newTranslateY + itemHeight;

        if (
          newTranslateX === 0 ||
          rightX > containerWidth ||
          e.pageX > windowWidth ||
          newTranslateY === 0 ||
          bottomY > containerHeight
        ) {
          const update = {
            dragging: false,
            x: 0,
            y: 0,
          };
          if (rightX >= containerWidth) {
            newTranslateX = containerWidth - (itemWidth + 1);
            update.left = newTranslateX;
          }
          if (bottomY >= containerHeight) {
            newTranslateY = containerHeight - (itemHeight + 1);
            update.top = newTranslateY;
          }

          setState(update);
          return false;
        }
      }
      const update = {
        x: e.pageX,
        y: e.pageY,
        top: newTranslateY,
        left: newTranslateX,
      };
      setState(update);
      return false;
    };

    const resize = (e) => {
      if (!state.resizing) {
        return false;
      }
      const item = itemRef.current;
      const newX = e.pageX - state.x;
      const newY = e.pageY - state.y;
      let newHeight = state.height;
      let newWidth = state.width;
      const heightDirections = ['tl', 't', 'tr'];
      const reverseHeightDirections = ['bl', 'b', 'br'];
      if (heightDirections.indexOf(state.resizeDirection) > -1) {
        newHeight = state.height - newY;
      }
      if (reverseHeightDirections.indexOf(state.resizeDirection) > -1) {
        newHeight = state.height + newY;
      }
      const widthDirections = ['tr', 'r', 'br'];
      const reverseWidthDirections = ['tl', 'l', 'bl'];
      if (widthDirections.indexOf(state.resizeDirection) > -1) {
        newWidth = state.width + newX;
      }
      if (reverseWidthDirections.indexOf(state.resizeDirection) > -1) {
        newWidth = state.width - newX;
      }
      const translateX = state.left;
      const translateY = state.top;

      let newTranslateX = translateX + newX;
      let newTranslateY = translateY + newY;
      if (state.resizeDirection === 't') {
        newTranslateX = translateX;
      }
      if (state.resizeDirection === 'tr') {
        newTranslateX = translateX;
      }
      if (state.resizeDirection === 'r') {
        newTranslateX = translateX;
        newTranslateY = translateY;
      }
      if (state.resizeDirection === 'br') {
        newTranslateX = translateX;
        newTranslateY = translateY;
      }
      if (state.resizeDirection === 'b') {
        newTranslateX = translateX;
        newTranslateY = translateY;
      }
      if (state.resizeDirection === 'bl') {
        newTranslateY = translateY;
      }
      if (state.resizeDirection === 'l') {
        newTranslateY = translateY;
      }

      if (parentConstrain && parentRef !== null) {
        const windowWidth = window.innerWidth;
        const containerWidth = parentDimensions.width;
        const containerHeight = parentDimensions.height;
        const itemWidth = parseFloat(item.style.width.replace('px', ''), 10);
        const itemHeight = parseFloat(item.style.height.replace('px', ''), 10);
        const rightX = translateX + itemWidth;
        const bottomY = newTranslateY + itemHeight;

        if (
          newTranslateX === 0 ||
          rightX > containerWidth ||
          e.pageX > windowWidth ||
          newTranslateY === 0 ||
          bottomY > containerHeight
        ) {
          const update = {
            resizing: false,
            x: 0,
            y: 0,
          };
          if (rightX >= containerWidth) {
            newTranslateX = containerWidth - (itemWidth + 1);
            update.left = newTranslateX;
          }
          if (bottomY >= containerHeight) {
            newTranslateY = containerHeight - (itemHeight + 1);
            update.top = newTranslateY;
          }
          setState(update);
          return false;
        }
      }
      const update = {
        x: e.pageX,
        y: e.pageY,
        top: newTranslateY,
        left: newTranslateX,
        width: newWidth,
        height: newHeight,
      };
      setState(update);
      return false;
    };

    const rotate = (e) => {
      const item = itemRef.current;
      const rect = item.getBoundingClientRect();
      const centerX = (rect.left + rect.right) / 2;
      const centerY = (rect.top + rect.bottom) / 2;
      const radians = Math.atan2(e.clientX - centerX, e.clientY - centerY);
      const newDegree = Math.round(radians * (180 / Math.PI) * -1 + 100) + 80;
      setState({ rotateDegree: newDegree });
      return false;
    };

    const interact = (e) => {
      if (!state.dragging && !state.resizing && !state.rotating) {
        return false;
      }
      if (state.dragging) {
        drag(e);
        return false;
      }
      if (state.resizing) {
        resize(e);
        return false;
      }
      if (state.rotating) {
        rotate(e);
        return false;
      }
      return false;
    };

    const interactionEnd = () => {
      if (!state.dragging && !state.resizing && !state.rotating) {
        return false;
      }
      if (
        state.dragging &&
        state.x === state.startX &&
        state.y === state.startY
      ) {
        setState({
          dragging: false,
          x: 0,
          y: 0,
        });
        return false;
      }
      setState({
        resizing: false,
        dragging: false,
        rotating: false,
        x: 0,
        y: 0,
      });
      const halfWidth = state.width / 2;
      const halfHeight = state.height / 2;
      const newX = state.x - halfWidth;
      const newY = state.y - halfHeight;
      onInteractionStop({
        _id: propsItem._id,
        height: state.height,
        width: state.width,
        x: newX,
        y: newY,
        top: state.top,
        left: state.left,
        rotate: state.rotateDegree,
      });
      return false;
    };

    document.addEventListener('contextmenu', interactionEnd);
    document.addEventListener('dragstart', interact);
    document.addEventListener('mousemove', interact);
    document.addEventListener('touchmove', interact);
    document.addEventListener('mouseup', interactionEnd);
    document.addEventListener('touchend', interactionEnd);
    document.addEventListener('dragend', interactionEnd);

    return () => {
      document.removeEventListener('contextmenu', interactionEnd);
      document.removeEventListener('dragstart', interact);
      document.removeEventListener('mousemove', interact);
      document.removeEventListener('touchmove', interact);
      document.removeEventListener('mouseup', interactionEnd);
      document.removeEventListener('touchend', interactionEnd);
      document.removeEventListener('dragend', interactionEnd);
    };
  }, [
    state.dragging,
    state.height,
    state.resizeDirection,
    state.resizing,
    state.rotating,
    state.width,
    state.startX,
    state.startY,
    state.x,
    state.y,
    state.left,
    state.top,
    state.rightClick,
    state.rotateDegree,
    parentConstrain,
    parentDimensions,
    parentRef,
    onInteractionStop,
    propsItem,
  ]);

  let className = 'sa-dnd-draggable';
  let rotateAnchor = [];
  let resizableAnchors = [];

  if (resizable) {
    resizableAnchors = [
      <div
        className="sa-dnd-resizable-anchor tl"
        key="tl"
        onMouseDown={(e) => resizeStart(e, 'tl')}
        onDragStart={(e) => {
          e.preventDefault();
        }}
        role="button"
        tabIndex={0}
        aria-label="drag anchor"
      />,
      <div
        className="sa-dnd-resizable-anchor t"
        key="t"
        onMouseDown={(e) => resizeStart(e, 't')}
        onDragStart={(e) => {
          e.preventDefault();
        }}
        role="button"
        tabIndex={0}
        aria-label="drag anchor"
      />,
      <div
        className="sa-dnd-resizable-anchor tr"
        key="tr"
        onMouseDown={(e) => resizeStart(e, 'tr')}
        onDragStart={(e) => {
          e.preventDefault();
        }}
        role="button"
        tabIndex={0}
        aria-label="drag anchor"
      />,
      <div
        className="sa-dnd-resizable-anchor r"
        key="r"
        onMouseDown={(e) => resizeStart(e, 'r')}
        onDragStart={(e) => {
          e.preventDefault();
        }}
        role="button"
        tabIndex={0}
        aria-label="drag anchor"
      />,
      <div
        className="sa-dnd-resizable-anchor br"
        key="br"
        onMouseDown={(e) => resizeStart(e, 'br')}
        onDragStart={(e) => {
          e.preventDefault();
        }}
        role="button"
        tabIndex={0}
        aria-label="drag anchor"
      />,
      <div
        className="sa-dnd-resizable-anchor b"
        key="b"
        onMouseDown={(e) => resizeStart(e, 'b')}
        onDragStart={(e) => {
          e.preventDefault();
        }}
        role="button"
        tabIndex={0}
        aria-label="drag anchor"
      />,
      <div
        className="sa-dnd-resizable-anchor bl"
        key="bl"
        onMouseDown={(e) => resizeStart(e, 'bl')}
        onDragStart={(e) => {
          e.preventDefault();
        }}
        role="button"
        tabIndex={0}
        aria-label="drag anchor"
      />,
      <div
        className="sa-dnd-resizable-anchor l"
        key="l"
        onMouseDown={(e) => resizeStart(e, 'l')}
        onDragStart={(e) => {
          e.preventDefault();
        }}
        role="button"
        tabIndex={0}
        aria-label="drag anchor"
      />,
    ];
    className += ' sa-dnd-resizable';
  }
  if (propsRotate) {
    rotateAnchor = (
      <div
        className="sa-dnd-rotate-anchor"
        key="rotate"
        onMouseDown={(e) => rotateStart(e)}
        onDragStart={(e) => {
          e.preventDefault();
        }}
        role="button"
        tabIndex={0}
        aria-label="rotate anchor"
      />
    );
  }

  if (propsClassName !== '') {
    className += ` ${propsClassName}`;
  }
  const style = {
    transform: `translateX(${state.left}px) translateY(${state.top}px) rotate(${state.rotateDegree}deg)`,
    width: `${state.width}px`,
    height: `${state.height}px`,
  };
  let activeClass = '';
  if (state.dragging || state.resizing || state.rotating || state.rightClick) {
    activeClass = ' active;';
  }
  className += activeClass;
  return (
    <div
      ref={itemRef}
      style={style}
      className={className}
      onContextMenu={(e) => rightClick(e)}
    >
      {rotateAnchor}
      {resizableAnchors}
      <div
        className="sa-dnd-draggable-item"
        onDragStart={(e) => {
          e.preventDefault();
        }}
        onMouseDown={(e) => dragStart(e)}
        role="button"
        tabIndex={0}
        aria-label="drag trigger"
      >
        {propsChildren}
      </div>
    </div>
  );
}

export default Draggable;

Draggable.defaultProps = {
  children: [],
  className: '',
  contextMenu: () => {},
  contextMenuHide: () => {},
  resizable: false,
  rotate: false,
  parentConstrain: false,
  parentRef: null,
  parentDimensions: {
    width: 0,
    height: 0,
  },
  width: 0,
  height: 0,
  index: -1,
  x: 0,
  y: 0,
  degree: 0,
  item: null,
  onInteractionStop: null,
  rightClick: () => {},
};

Draggable.propTypes = {
  children: PropTypes.array,
  className: PropTypes.string,
  contextMenu: PropTypes.func,
  contextMenuHide: PropTypes.func,
  degree: PropTypes.number,
  item: PropTypes.object,
  height: PropTypes.number,
  index: PropTypes.number,
  onInteractionStop: PropTypes.func,
  parentConstrain: PropTypes.bool,
  parentRef: PropTypes.object,
  parentDimensions: PropTypes.object,
  resizable: PropTypes.bool,
  rotate: PropTypes.bool,
  width: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  rightClick: PropTypes.func,
};
