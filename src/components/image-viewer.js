import React, { useState, useEffect, useRef } from 'react';
import {
  Spinner
} from 'reactstrap';

const Viewer = (props) => {
  const [loading, setLoading] = useState(true);
  const [dimensionsLoaded, setDimensionsLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const imgRef = useRef(null);

  const imgLoaded = () => {
    setLoading(false);
  }

  const imgDimensions = () => {
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let img = imgRef.current;
    if (img!==null) {
      let currentWidth = img.width;
      let currentHeight = img.height;
      //let newHeight = currentHeight;
      let newWidth = currentWidth;
      let newScale = scale;

      if (currentHeight>windowHeight) {
        newScale = windowHeight/currentHeight;
        //newHeight = currentHeight*newScale;
        newWidth = currentWidth*newScale;
      }

      if (newWidth>windowWidth) {
        newScale = windowWidth/newWidth;
        //newHeight = currentHeight*newScale;
        newWidth = currentWidth*newScale;
      }
      // center image
      let newLeft = 0+"px";
      // center left
      if (newWidth<windowWidth) {
        newLeft = (windowWidth - newWidth)/2+"px";
      }
      setLeft(newLeft)
      setTop(0)
      setScale(newScale)
      setDimensionsLoaded(true)
    }
  }

  const imgDragStart = (e) => {
    if (e.type==="mousedown" || e.type==="click") {
      setDragging(true);
      setX(e.pageX);
      setY(e.pageY);
    }
  }

  const imgDragEnd = (e) => {
    e.stopPropagation();
    setDragging(false);
    setX(0);
    setY(0);
  }

  const updateZoom = (value) => {
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let newScale = parseFloat(scale,10).toFixed(1);
    if (value==="plus") {
      if (newScale<2){
        newScale = parseFloat(newScale,10)+0.1;
      }
    }
    if (value==="minus") {
      if (newScale>0.1){
        newScale = parseFloat(newScale,10) - 0.1;
      }
    }
    setScale(newScale);
    setTimeout(()=> {
      // calculate new position left and top
      let img = imgRef.current;
      let imgDimensions = img.getBoundingClientRect();
      let imgHeight = imgDimensions.height;
      let imgWidth = imgDimensions.width;
      let newLeft = 0;
      let newTop = 0;
      if (windowWidth>imgWidth) {
        newLeft = (windowWidth-imgWidth)/2;
        setLeft(newLeft+"px")
      }
      if (windowHeight>imgHeight) {
        newTop = (windowHeight-imgHeight)/2;
        setTop(newTop+"px")
      }
    },1)

  }

  const updatePan = (direction) => {
    let add = 50;
    let newTop = top;
    let newLeft= left;
    if (direction==="up") {
      newTop = top.replace("px", "");
      newTop = parseFloat(top,10)-add;
      newTop = newTop+"px";
    }

    if (direction==="right") {
      newLeft = left.replace("px", "");
      newLeft = parseFloat(left,10)+add;
      newLeft = newLeft+"px";
    }

    if (direction==="down") {
      newTop = top.replace("px", "");
      newTop = parseFloat(top,10)+add;
      newTop = newTop+"px";
    }

    if (direction==="left") {
      newLeft = left.replace("px", "");
      newLeft = parseFloat(left,10)-add;
      newLeft = newLeft+"px";
    }
    setTop(newTop);
    setLeft(newLeft);
  }

  useEffect(()=> {
    if (!loading && props.visible && !dimensionsLoaded) {
      imgDimensions();
    }
  });

  useEffect(()=> {
    const imgDrag = (e) => {
      e.stopPropagation();
      if (!dragging || !props.visible) {
        return false;
      }
      let windowWidth = window.innerWidth;
      let windowHeight = window.innerHeight;
      let img = imgRef.current;
      let newX = e.pageX-x;
      let newY = e.pageY-y;
      let newStyle = img.style;
      let transformOrigin = newStyle.transformOrigin.split(" ");
      let transformOriginX = transformOrigin[0];
      let transformOriginY = transformOrigin[1];
      transformOriginX = transformOriginX.replace("px", "");
      transformOriginX = parseFloat(transformOriginX, 10);
      transformOriginY = transformOriginY.replace("px", "");
      transformOriginY = parseFloat(transformOriginY, 10);

      let newTransformOriginX = transformOriginX+newX;
      let newTransformOriginY = transformOriginY+newY;

      if (e.pageX>windowWidth || e.pageY>windowHeight || e.pageX<0 || e.pageY<=60 ||
        (e.pageY<=220 && e.pageX>=windowWidth-65)
      ) {
        setDragging(false);
        setX(0);
        setY(0);
      }
      else {
        setX(e.pageX);
        setY(e.pageY);
        setLeft(newTransformOriginX+"px");
        setTop(newTransformOriginY+"px");
      }
    }
    window.addEventListener("mousemove", imgDrag);
    return () => {
      window.removeEventListener("mousemove", imgDrag);
    }
  }, [dragging, x, y, props.visible]);

  useEffect(()=> {
    if (!props.visible && top!==0 && left!==0) {
      setDimensionsLoaded(false)
    }
  },[props.visible, top, left])

  // render
  let visibilityStyle = {visibility: "hidden"};
  if (props.visible) {
    visibilityStyle = {visibility: "visible"};
  }

  let img = <div className="row">
    <div className="col-12">
      <div style={{padding: '100px 40px',textAlign: 'center'}}>
        <Spinner color="light" />
      </div>
    </div>
  </div>;
  let imgPath = props.path;
  if (imgPath!==null) {
    let imgStyle = {
      transform: "scale("+scale+") translate("+left+","+top+")" ,
      transformOrigin: left+" "+top,
    }
    img = <img
      style={imgStyle}
      className="classpiece-full-size"
      src={imgPath}
      ref={imgRef}
      onLoad={()=>imgLoaded()}
      alt={props.label}
      onMouseDown={(e)=>imgDragStart(e)}
      onMouseUp={(e)=>imgDragEnd(e)}
      onDragEnd={(e)=>imgDragEnd(e)}
      draggable={false}
      />
  }

    let zoomPanel = <div className="zoom-container">
      <div
        className="zoom-action"
        onClick={()=>updateZoom("plus")}>
        <i className="fa fa-plus" />
      </div>
      <div
        className="zoom-action"
        onClick={()=>updateZoom("minus")}>
        <i className="fa fa-minus" />
      </div>
    </div>

    let panPanel = <div className="pan-container">
      <div className="pan-action up" onClick={()=>updatePan("up")}>
        <i className="fa fa-chevron-up" />
      </div>

      <div className="pan-action right" onClick={()=>updatePan("right")}>
        <i className="fa fa-chevron-right" />
      </div>

      <div className="pan-action down" onClick={()=>updatePan("down")}>
        <i className="fa fa-chevron-down" />
      </div>

      <div className="pan-action left" onClick={()=>updatePan("left")}>
        <i className="fa fa-chevron-left" />
      </div>
    </div>


  return(
    <div style={visibilityStyle} className="classpiece-viewer">
      <div className="classpiece-viewer-bg" onClick={()=>props.toggle()}></div>
      <div className="classpiece-viewer-header">
        <h4>{props.label}</h4>
        <div className="classpiece-viewer-close">
          <i className="pe-7s-close" onClick={()=>props.toggle()} />
        </div>
      </div>
      {img}
      {zoomPanel}
      {panPanel}
    </div>
  );

}

export default Viewer;
