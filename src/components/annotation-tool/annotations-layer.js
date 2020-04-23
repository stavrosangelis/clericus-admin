import React from 'react';
import Draggable from "./draggable";
const AnnotationsLayer = (props) => {
  const parentDimensions = {width: props.width, height: props.height};

  const contextMenuShow = (e, _id, i) => {
    e.preventDefault();
    let html = document.querySelector("html");
    let top = e.clientY;
    let left = e.clientX;
    if (html.classList.contains("nav-open") && window.innerWidth<992) {
      left -= 260;
      let container = props.container.current;
      let rect = container.getBoundingClientRect();
      let rectTop = rect.top;
      let offsetTop = container.offsetTop;
      if (rectTop<0) {
        top += Math.abs(rect.top);
      }
      else {
        top -= Math.abs(rect.top);
      }
      top += offsetTop;
    }
    let state = {
      visible: true,
      top: top,
      left: left,
      itemId: _id,
      index: i
    };
    props.itemContextMenuShow(state);
  }

  const contextMenuHide = () => {
    props.itemContextMenuShow({visible: false});
  }

  let annotationsLayer = [];
  let items = props.items;
  if (typeof items!=="undefined") {
    let annotationItems = items.map((r,i)=>{
      let item = r.ref;
      let metadata = item.metadata;
      if (typeof metadata!=="undefined" && typeof metadata==="string") {
        metadata = JSON.parse(metadata);
        if (typeof metadata==="string") {
          metadata = JSON.parse(metadata);
        }
      }
      let layer = [];
      if (typeof metadata.image!=="undefined") {
        let defaultMeta = metadata.image.default;
        layer = <Draggable
          key={item._id}
          index={i}
          className="annotation-item"
          item={item}
          draggable={true}
          resizable={true}
          rotate={true}
          width={defaultMeta.width}
          height={defaultMeta.height}
          x={defaultMeta.x}
          y={defaultMeta.y}
          degree={defaultMeta.rotate}
          parentConstrain={true}
          parentRef={props.container}
          parentDimensions={parentDimensions}
          contextMenu={contextMenuShow}
          contextMenuHide={contextMenuHide}
          onInteractionStop={props.returnValues}
          ></Draggable>
      }

      return layer;
    });
    annotationsLayer = <div className="annotation-items">{annotationItems}</div>;
  }

  return (annotationsLayer)
}

export default AnnotationsLayer;
