import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { stringDimensionToInteger } from '../helpers';

export default class Wrapper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dragging: false,
      resizing: false,
      rotating: false,
      resizeDirection: null,
      top: props.top,
      left: props.left,
      x: props.x,
      y: props.y,
      degree: props.degree,
      width: props.width,
      height: props.height,
    };
    this.itemRef = React.createRef();
    this.startDrag = this.startDrag.bind(this);
    this.startResize = this.startResize.bind(this);
    this.startRotate = this.startRotate.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.itemMove = this.itemMove.bind(this);
    this.itemResize = this.itemResize.bind(this);
    this.itemRotate = this.itemRotate.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.onComplete = this.onComplete.bind(this);
  }

  componentDidMount() {
    window.addEventListener('mousemove', this.mouseMove);
    window.addEventListener('mouseup', this.mouseUp);
    window.addEventListener('touchmove', this.mouseMove);
    window.addEventListener('touchend', this.mouseUp);
    window.addEventListener('dragend', this.mouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.mouseMove);
    window.removeEventListener('mouseup', this.mouseUp);
    window.removeEventListener('touchmove', this.mouseMove);
    window.removeEventListener('touchend', this.mouseUp);
    window.removeEventListener('dragend', this.mouseUp);
  }

  startDrag = (e) => {
    const { draggable } = this.props;
    if (!draggable) {
      return false;
    }
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'mousedown' && e.button === 0) {
      const update = {};
      update.dragging = true;
      update.x = e.pageX;
      update.y = e.pageY;
      this.setState(update);
    }
    return false;
  };

  startResize = (e, direction = null) => {
    const { resizable } = this.props;
    if (!resizable) {
      return false;
    }
    if (e.type === 'mousedown' && e.button === 0) {
      const update = {};
      update.resizing = true;
      update.resizeDirection = direction;
      update.x = e.pageX;
      update.y = e.pageY;
      this.setState(update);
    }
    return false;
  };

  startRotate = (e) => {
    const { rotate } = this.props;
    if (!rotate) {
      return false;
    }
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'mousedown' && e.button === 0) {
      const update = {};
      update.rotating = true;
      update.x = e.pageX;
      update.y = e.pageY;
      this.setState(update);
    }
    return false;
  };

  mouseUp = () => {
    const { dragging, resizing, rotating } = this.state;
    if (!dragging && !resizing && !rotating) {
      return false;
    }
    this.onComplete();
    if (dragging) {
      const update = {};
      update.dragging = false;
      update.x = 0;
      update.y = 0;
      this.setState(update);
      return false;
    }
    if (resizing) {
      const update = {};
      update.resizing = false;
      update.x = 0;
      update.y = 0;
      this.setState(update);
      return false;
    }
    if (rotating) {
      const update = {};
      update.rotating = false;
      update.x = 0;
      update.y = 0;
      this.setState(update);
      return false;
    }
    return false;
  };

  onComplete = () => {
    const {
      width: stateWidth,
      height: stateHeight,
      left: stateLeft,
      top: stateTop,
      degree,
      x,
      y,
      dragging,
      resizing,
      rotating,
    } = this.state;
    const { onDragStop, index, onResizeStop } = this.props;
    const width = stringDimensionToInteger(stateWidth);
    const height = stringDimensionToInteger(stateHeight);
    const left = stringDimensionToInteger(stateLeft);
    const top = stringDimensionToInteger(stateTop);
    const obj = {
      degree,
      height,
      left,
      top,
      width,
      x,
      y,
    };
    if (dragging) {
      if (onDragStop !== null) {
        onDragStop(obj, index);
      }
    }
    if (resizing) {
      if (onResizeStop !== null) {
        onResizeStop(obj, index);
      }
    }
    if (rotating) {
      if (onResizeStop !== null) {
        onResizeStop(obj, index);
      }
    }
  };

  itemMove = (e) => {
    const {
      dragging,
      x,
      y,
      top: stateTop,
      left: stateLeft,
      width: stateWidth,
      height: stateHeight,
    } = this.state;
    const { parentConstrain, parentId } = this.props;
    if (!dragging) {
      return false;
    }
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const item = this.itemRef.current;
    const newX = e.pageX - x;
    const newY = e.pageY - y;
    const newStyle = item.style;
    const transform = newStyle.transform.split(' ');
    let translateX = transform[0];
    let translateY = transform[1];
    translateX = translateX.replace('translateX(', '');
    translateX = translateX.replace(')px', '');
    translateX = parseFloat(translateX, 10);
    translateY = translateY.replace('translateY(', '');
    translateY = translateY.replace(')px', '');
    translateY = parseFloat(translateY, 10);

    const newTranslateX = translateX + newX;
    const newTranslateY = translateY + newY;

    if (
      !parentConstrain &&
      (e.pageX > windowWidth ||
        e.pageY > windowHeight ||
        e.pageX < 0 ||
        e.pageY < 0)
    ) {
      const update = {};
      update.dragging = false;
      update.x = 0;
      update.y = 0;
      this.setState(update);
      return false;
    }
    if (parentConstrain) {
      let parent = item.parentElement;
      if (parentId !== null) {
        parent = document.getElementById(parentId);
      }
      const parentBoundingBox = parent.getBoundingClientRect();
      const parentWidth = parentBoundingBox.width;
      const parentHeight = parentBoundingBox.height;
      let top = 0;
      if (stateTop !== 0 && typeof stateTop === 'string') {
        top = stateTop.replace('px', '');
        top = parseInt(top, 10);
      }
      let left = 0;
      if (stateLeft !== 0 && typeof stateLeft === 'string') {
        left = stateLeft.replace('px', '');
        left = parseInt(left, 10);
      }
      if (
        newX + left + stateWidth >= parentWidth ||
        newX + left < 0 ||
        newY + top + stateHeight >= parentHeight ||
        newY + top < 0
      ) {
        const update = {};
        update.dragging = false;
        update.x = 0;
        update.y = 0;
        if (newX + left < 0) {
          update.left = 0;
        }
        if (newX + left + stateWidth >= parentWidth) {
          update.left = `${parentWidth - stateWidth - 2}px`;
        }
        if (newY + top < 0) {
          update.top = 0;
        }
        if (newY + top + stateHeight >= parentHeight) {
          update.top = `${parentHeight - stateHeight - 2}px`;
        }
        this.setState(update);
        return false;
      }
    }

    const update = {};
    update.x = e.pageX;
    update.y = e.pageY;
    update.left = `${newTranslateX}px`;
    update.top = `${newTranslateY}px`;
    this.setState(update);
    return false;
  };

  itemResize = (e) => {
    const { resizing, x, y, resizeDirection } = this.state;
    if (!resizing) {
      return false;
    }
    e.stopPropagation();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const item = this.itemRef.current;
    const newX = e.pageX - x;
    const newY = e.pageY - y;
    let { width } = this.state;
    let { height } = this.state;
    const boundingBox = item.getBoundingClientRect();
    if (width === 0) {
      width = boundingBox.width;
    }
    if (height === 0) {
      height = boundingBox.height;
    }
    let newHeight = height;
    let newWidth = width;
    const heightDirections = ['tl', 't', 'tr'];
    const reverseHeightDirections = ['bl', 'b', 'br'];
    if (heightDirections.indexOf(resizeDirection) > -1) {
      newHeight = height - newY;
    }
    if (reverseHeightDirections.indexOf(resizeDirection) > -1) {
      newHeight = height + newY;
    }
    const widthDirections = ['tr', 'r', 'br'];
    const reverseWidthDirections = ['tl', 'l', 'bl'];
    if (widthDirections.indexOf(resizeDirection) > -1) {
      newWidth = width + newX;
    }
    if (reverseWidthDirections.indexOf(resizeDirection) > -1) {
      newWidth = width - newX;
    }
    const update = {};

    if (
      e.pageX > windowWidth ||
      e.pageY > windowHeight ||
      e.pageX < 0 ||
      e.pageY < 0
    ) {
      update.resizing = false;
      update.x = 0;
      update.y = 0;
    } else {
      update.x = e.pageX;
      update.y = e.pageY;
      const newStyle = item.style;
      const transform = newStyle.transform.split(' ');
      let translateX = transform[0];
      let translateY = transform[1];
      translateX = translateX.replace('translateX(', '');
      translateX = translateX.replace(')px', '');
      translateX = parseFloat(translateX, 10);
      translateY = translateY.replace('translateY(', '');
      translateY = translateY.replace(')px', '');
      translateY = parseFloat(translateY, 10);

      let newTranslateX = translateX + newX;
      let newTranslateY = translateY + newY;
      if (resizeDirection === 't') {
        newTranslateX = translateX;
      }
      if (resizeDirection === 'tr') {
        newTranslateX = translateX;
      }
      if (resizeDirection === 'r') {
        newTranslateX = translateX;
        newTranslateY = translateY;
      }
      if (resizeDirection === 'br') {
        newTranslateX = translateX;
        newTranslateY = translateY;
      }
      if (resizeDirection === 'b') {
        newTranslateX = translateX;
        newTranslateY = translateY;
      }
      if (resizeDirection === 'bl') {
        newTranslateY = translateY;
      }
      if (resizeDirection === 'l') {
        newTranslateY = translateY;
      }

      update.top = `${newTranslateY}px`;
      update.left = `${newTranslateX}px`;
      update.height = newHeight;
      update.width = newWidth;
    }
    this.setState(update);
    return false;
  };

  itemRotate = (e) => {
    const { rotating } = this.state;
    if (!rotating) {
      return false;
    }
    e.stopPropagation();
    const item = this.itemRef.current;
    const rect = item.getBoundingClientRect();
    const centerX = (rect.left + rect.right) / 2;
    const centerY = (rect.top + rect.bottom) / 2;
    const radians = Math.atan2(e.pageX - centerX, e.pageY - centerY);
    const degree = Math.round(radians * (180 / Math.PI) * -1 + 100) + 80;
    const update = {};
    update.degree = degree;
    this.setState(update);
    return false;
  };

  mouseMove = (e) => {
    const { dragging, resizing, rotating } = this.state;
    if (!dragging && !resizing && !rotating) {
      return false;
    }
    if (dragging) {
      this.itemMove(e);
    }
    if (resizing) {
      this.itemResize(e);
    }
    if (rotating) {
      this.itemRotate(e);
    }
    return false;
  };

  render() {
    const {
      left,
      top,
      degree,
      width,
      height,
      dragging,
      resizing,
      rotating,
    } = this.state;
    const {
      className: propsClassName,
      resizable,
      rotate,
      children,
    } = this.props;
    let className = 'sa-dnd-draggable';
    if (propsClassName !== '') {
      className += ` ${propsClassName}`;
    }
    let transformStyle = `translateX(${left}) translateY(${top})`;
    if (degree > 0) {
      transformStyle += ` rotate(${degree}deg)`;
    }
    const itemStyle = {
      transform: transformStyle,
    };
    if (width > 0) {
      itemStyle.width = `${width}px`;
    }
    if (height > 0) {
      itemStyle.height = `${height}px`;
    }

    let resizableAnchors = [];

    if (resizable) {
      resizableAnchors = [
        <div
          className="sa-dnd-resizable-anchor tl"
          key="tl"
          onMouseDown={(e) => this.startResize(e, 'tl')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="start resize"
        />,
        <div
          className="sa-dnd-resizable-anchor t"
          key="t"
          onMouseDown={(e) => this.startResize(e, 't')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="start resize"
        />,
        <div
          className="sa-dnd-resizable-anchor tr"
          key="tr"
          onMouseDown={(e) => this.startResize(e, 'tr')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="start resize"
        />,
        <div
          className="sa-dnd-resizable-anchor r"
          key="r"
          onMouseDown={(e) => this.startResize(e, 'r')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="start resize"
        />,
        <div
          className="sa-dnd-resizable-anchor br"
          key="br"
          onMouseDown={(e) => this.startResize(e, 'br')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="start resize"
        />,
        <div
          className="sa-dnd-resizable-anchor b"
          key="b"
          onMouseDown={(e) => this.startResize(e, 'b')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="start resize"
        />,
        <div
          className="sa-dnd-resizable-anchor bl"
          key="bl"
          onMouseDown={(e) => this.startResize(e, 'bl')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="start resize"
        />,
        <div
          className="sa-dnd-resizable-anchor l"
          key="l"
          onMouseDown={(e) => this.startResize(e, 'l')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="start resize"
        />,
      ];
      className += ' sa-dnd-resizable';
    }
    let rotateAnchor = [];
    if (rotate) {
      rotateAnchor = (
        <div
          className="sa-dnd-rotate-anchor"
          key="rotate"
          onMouseDown={(e) => this.startRotate(e)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="start rotation"
        />
      );
    }
    let activeClass = '';
    if (dragging || resizing || rotating) {
      activeClass = ' active;';
    }
    className += activeClass;
    return (
      <div ref={this.itemRef} style={itemStyle} className={className}>
        {rotateAnchor}
        {resizableAnchors}
        <div
          className="sa-dnd-draggable-item"
          onMouseDown={(e) => this.startDrag(e)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="start dragging"
        >
          {children}
        </div>
      </div>
    );
  }
}

Wrapper.defaultProps = {
  draggable: true,
  resizable: false,
  rotate: false,
  parentId: null,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  degree: 0,
  onDragStop: () => {},
  onResizeStop: () => {},
  index: -1,
  parentConstrain: false,
  children: [],
  className: '',
  left: '0',
  top: '0',
};

Wrapper.propTypes = {
  draggable: PropTypes.bool,
  resizable: PropTypes.bool,
  rotate: PropTypes.bool,
  index: PropTypes.number,
  parentConstrain: PropTypes.bool,
  parentId: PropTypes.string,
  children: PropTypes.object,
  className: PropTypes.string,
  left: PropTypes.string,
  top: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  degree: PropTypes.number,
  onDragStop: PropTypes.func,
  onResizeStop: PropTypes.func,
};
