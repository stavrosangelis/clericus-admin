import React, { useEffect, useRef, useReducer} from 'react';
import PropTypes from 'prop-types';

const Draggable = (props) => {
  const defaultState = {
    dragging: false,
    resizing: false,
    rotating: false,
    resizeDirection: null,
    x: 0,
    y: 0,
    top: props.y,
    left: props.x,
    width: props.width,
    height: props.height,
    rotateDegree: props.degree || 0,
    rightClick: false
  };
  const [state, setState] = useReducer(
    (state, newState) => (
    {...state, ...newState}
  ),defaultState);
  const itemRef = useRef(null);

  const dragStart = (e) => {
    props.contextMenuHide()
    if (state.resizing || state.rotating || state.richtClick) {
      return false;
    }
    if ((e.type==="mousedown" || e.type==="click") && e.button===0) {
      setState({
        dragging: true,
        x:e.pageX,
        y:e.pageY
      });
    }
  }

  const resizeStart = (e,direction=null) => {
    props.contextMenuHide();
    if (!props.resizable || state.dragging || state.rotating || state.richtClick) {
      return false;
    }
    if (e.type==="mousedown" && e.button===0) {
      setState({
        resizing: true,
        resizeDirection: direction,
        x:e.pageX,
        y:e.pageY
      });
    }
  }

  const rotateStart = (e) => {
    props.contextMenuHide();
    if (!props.rotate || state.dragging || state.resizing || state.richtClick) {
      return false;
    }
    if ((e.type==="mousedown" || e.type==="click") && e.button===0) {
      setState({
        rotating: true,
        x:e.pageX,
        y:e.pageY
      });
    }
  }

  const rightClick = (e) => {
    setState({rightClick: true})
    let update = {
      height: state.height,
      width: state.width,
      y: state.top,
      x: state.left,
      rotate: state.rotateDegree,
    }
    props.onInteractionStop(update);
    props.contextMenu(e, props.item._id, props.index);
  }
  // item interactions effect
  useEffect(()=> {
    const drag = (e) => {
      if (!state.dragging) {
        return false;
      }
      let item = itemRef.current;
      let newX = e.pageX-state.x;
      let newY = e.pageY-state.y;
      let translateX = state.left;
      let translateY = state.top;

      let newTranslateX = translateX+newX;
      let newTranslateY = translateY+newY;

      //console.log(e.pageX, state.x, newX, translateX, newTranslateX)
      if (newTranslateX<0) {
        newTranslateX = 0;
      }
      if (newTranslateY<0) {
        newTranslateY = 0;
      }
      if (props.parentConstrain && props.parentRef!==null) {
        let windowWidth = window.innerWidth;
        let containerWidth = props.parentDimensions.width;
        let containerHeight = props.parentDimensions.height;
        let itemWidth = parseFloat(item.style.width.replace("px", ""),10);
        let itemHeight = parseFloat(item.style.height.replace("px", ""),10);
        let rightX = translateX+itemWidth;
        let bottomY = newTranslateY+itemHeight;

        if (newTranslateX===0 || (rightX>containerWidth) || e.pageX>windowWidth || newTranslateY===0 || (bottomY>containerHeight)) {
          let update = {
            dragging: false,
            x: 0,
            y: 0
          };
          if (rightX>=containerWidth) {
            newTranslateX = containerWidth-(itemWidth+1);
            update.left(newTranslateX);
          }
          if (bottomY>=containerHeight) {
            newTranslateY = containerHeight-(itemHeight+1);
            update.top(newTranslateY);
          }

          setState(update);
          return false;
        }
      }
      let update = {
        x: e.pageX,
        y: e.pageY,
        top: newTranslateY,
        left: newTranslateX,
      }
      setState(update);
    }

    const resize = (e) => {
      if (!state.resizing) {
        return false;
      }
      let item = itemRef.current;
      let newX = e.pageX-state.x;
      let newY = e.pageY-state.y;
      let newHeight = state.height;
      let newWidth = state.width;
      let heightDirections = ["tl","t","tr"];
      let reverseHeightDirections = ["bl","b","br"];
      if (heightDirections.indexOf(state.resizeDirection)>-1) {
        newHeight = state.height-newY;
      }
      if (reverseHeightDirections.indexOf(state.resizeDirection)>-1) {
        newHeight = state.height+newY;
      }
      let widthDirections = ["tr","r","br"];
      let reverseWidthDirections = ["tl","l","bl"];
      if (widthDirections.indexOf(state.resizeDirection)>-1) {
        newWidth = state.width+newX;
      }
      if (reverseWidthDirections.indexOf(state.resizeDirection)>-1) {
        newWidth = state.width-newX;
      }
      let translateX = state.left;
      let translateY = state.top;

      let newTranslateX = translateX+newX;
      let newTranslateY = translateY+newY;
      if (state.resizeDirection==="t") {
        newTranslateX = translateX;
      }
      if (state.resizeDirection==="tr") {
        newTranslateX = translateX;
      }
      if (state.resizeDirection==="r") {
        newTranslateX = translateX;
        newTranslateY = translateY;
      }
      if (state.resizeDirection==="br") {
        newTranslateX = translateX;
        newTranslateY = translateY;
      }
      if (state.resizeDirection==="b") {
        newTranslateX = translateX;
        newTranslateY = translateY;
      }
      if (state.resizeDirection==="bl") {
        newTranslateY = translateY;
      }
      if (state.resizeDirection==="l") {
        newTranslateY = translateY;
      }

      if (props.parentConstrain && props.parentRef!==null) {
        let windowWidth = window.innerWidth;
        let containerWidth = props.parentDimensions.width;
        let containerHeight = props.parentDimensions.height;
        let itemWidth = parseFloat(item.style.width.replace("px", ""),10);
        let itemHeight = parseFloat(item.style.height.replace("px", ""),10);
        let rightX = translateX+itemWidth;
        let bottomY = newTranslateY+itemHeight;

        if (newTranslateX===0 || (rightX>containerWidth) || e.pageX>windowWidth || newTranslateY===0 || (bottomY>containerHeight)) {
          let update = {
            resizing: false,
            x: 0,
            y: 0
          }
          if (rightX>=containerWidth) {
            newTranslateX = containerWidth-(itemWidth+1);
            update.left = newTranslateX;
          }
          if (bottomY>=containerHeight) {
            newTranslateY = containerHeight-(itemHeight+1);
            update.top = newTranslateY;
          }
          setState(update)
          return false;
        }
      }
      let update = {
        x: e.pageX,
        y: e.pageY,
        top: newTranslateY,
        left: newTranslateX,
        width: newWidth,
        height: newHeight,
      }
      setState(update);
      return false;
    }

    const rotate = (e) => {
      let item = itemRef.current;
      var rect = item.getBoundingClientRect(),
      center_x = (rect.left + rect.right) / 2,
      center_y = (rect.top + rect.bottom) / 2,
      radians = Math.atan2(e.clientX - center_x, e.clientY - center_y);
      let degree = Math.round(radians * (180 / Math.PI) * -1 + 100) + 80;
      setState({rotateDegree: degree});
      return false;
    }

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
    }

    const interactionEnd = (e) => {
      if (!state.dragging && !state.resizing && !state.rotating) {
        return false;
      }
      setState({
        resizing: false,
        dragging: false,
        rotating: false,
        x:0,
        y:0
      });
      props.onInteractionStop({
        height: state.height,
        width: state.width,
        x: state.x,
        y: state.y,
        rotate: state.rotateDegree,
      });
    }

    document.addEventListener("contextmenu", interactionEnd);
    document.addEventListener("dragstart", interact);
    document.addEventListener("mousemove", interact);
    document.addEventListener("touchmove", interact);
    document.addEventListener("mouseup", interactionEnd);
    document.addEventListener("touchend", interactionEnd);
    document.addEventListener("dragend", interactionEnd);

    return () => {
      document.removeEventListener("contextmenu", interactionEnd);
      document.removeEventListener("dragstart", interact);
      document.removeEventListener("mousemove", interact);
      document.removeEventListener("touchmove", interact);
      document.removeEventListener("mouseup", interactionEnd);
      document.removeEventListener("touchend", interactionEnd);
      document.removeEventListener("dragend", interactionEnd);
    }
  }, [state.dragging, state.height, state.resizeDirection, state.resizing, state.rotating, state.width, state.x, state.y, state.left, state.top, state.rightClick, state.rotateDegree, props]);

  let className = "sa-dnd-draggable";
  let rotateAnchor = [];
  let resizableAnchors = [];

  if (props.resizable) {
    resizableAnchors = [
      <div className="sa-dnd-resizable-anchor tl"
        key="tl"
        onMouseDown={(e)=>resizeStart(e,"tl")}
        onDragStart={(e)=>{e.preventDefault()}}
      ></div>,
      <div className="sa-dnd-resizable-anchor t" key="t"
        onMouseDown={(e)=>resizeStart(e,"t")}
        onDragStart={(e)=>{e.preventDefault()}}
      ></div>,
      <div className="sa-dnd-resizable-anchor tr" key="tr"
        onMouseDown={(e)=>resizeStart(e,"tr")}
        onDragStart={(e)=>{e.preventDefault()}}
      ></div>,
      <div className="sa-dnd-resizable-anchor r" key="r"
        onMouseDown={(e)=>resizeStart(e,"r")}
        onDragStart={(e)=>{e.preventDefault()}}
      ></div>,
      <div className="sa-dnd-resizable-anchor br" key="br"
        onMouseDown={(e)=>resizeStart(e,"br")}
        onDragStart={(e)=>{e.preventDefault()}}
      ></div>,
      <div className="sa-dnd-resizable-anchor b" key="b"
        onMouseDown={(e)=>resizeStart(e,"b")}
        onDragStart={(e)=>{e.preventDefault()}}
      ></div>,
      <div className="sa-dnd-resizable-anchor bl" key="bl"
        onMouseDown={(e)=>resizeStart(e,"bl")}
        onDragStart={(e)=>{e.preventDefault()}}
      ></div>,
      <div className="sa-dnd-resizable-anchor l" key="l"
        onMouseDown={(e)=>resizeStart(e,"l")}
        onDragStart={(e)=>{e.preventDefault()}}
      ></div>,
    ];
    className += " sa-dnd-resizable";
  }
  if (props.rotate) {
    rotateAnchor = <div
      className="sa-dnd-rotate-anchor"
      key="rotate"
      onMouseDown={(e)=>rotateStart(e)}
      onDragStart={(e)=>{e.preventDefault()}}
      ></div>
  }

  if (props.className!=="") {
    className += " "+props.className;
  }
  let style = {
    transform: `translateX(${state.left}px) translateY(${state.top}px) rotate(${state.rotateDegree}deg)`,
    width: state.width+"px",
    height: state.height+"px",
  }
  let activeClass = "";
  if (state.dragging || state.resizing || state.rotating || state.rightClick) {
    activeClass = " active;"
  }
  className +=activeClass;
  return (
    <div
      ref={itemRef}
      style={style}
      className={className}
      onContextMenu={(e)=>rightClick(e)}
    >
      {rotateAnchor}
      {resizableAnchors}
      <div
        className="sa-dnd-draggable-item"
        onDragStart={(e)=>{e.preventDefault()}}
        onMouseDown={(e)=>dragStart(e)}
      >
        {props.children}
      </div>
    </div>
  )

}

export default Draggable;

Draggable.defaultProps = {
  draggable: true,
  resizable: false,
  rotate: false,
  parentRef: null,
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  degree: 0,
  onInteractionStop: null,
}

Draggable.propTypes = {
  children: PropTypes.object,
  className: PropTypes.string,
  contextMenu: PropTypes.func,
  contextMenuHide: PropTypes.func,
  degree: PropTypes.number,
  draggable: PropTypes.bool,
  height: PropTypes.number,
  index: PropTypes.number,
  left: PropTypes.string,
  onInteractionStop: PropTypes.func,
  parentConstrain: PropTypes.bool,
  parentRef: PropTypes.object,
  parentDimensions: PropTypes.object,
  resizable: PropTypes.bool,
  rotate: PropTypes.bool,
  top: PropTypes.string,
  width: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
}
