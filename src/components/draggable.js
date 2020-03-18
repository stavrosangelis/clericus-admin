import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {stringDimensionToInteger} from '../helpers/helpers'

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
    }
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

  startDrag = (e) => {
    if (!this.props.draggable) {
      return false;
    }
    e.preventDefault();
    e.stopPropagation();
    if (e.type==='mousedown' && e.button===0) {
      let update = {};
      update.dragging = true;
      update.x = e.pageX;
      update.y = e.pageY;
      this.setState(update);
    }
  }

  startResize = (e,direction=null) => {
    if (!this.props.resizable) {
      return false;
    }
    if (e.type==="mousedown" && e.button===0) {
      let update = {};
      update.resizing = true;
      update.resizeDirection = direction;
      update.x = e.pageX;
      update.y = e.pageY;
      this.setState(update);
    }
  }

  startRotate=(e)=> {
    if (!this.props.rotate) {
      return false;
    }
    e.preventDefault();
    e.stopPropagation();
    if (e.type==="mousedown" && e.button===0) {
      let update = {};
      update.rotating = true;
      update.x = e.pageX;
      update.y = e.pageY;
      this.setState(update);
    }
  }

  mouseUp = (e) => {
    if (!this.state.dragging && !this.state.resizing && !this.state.rotating) {
      return false;
    }
    else {
      this.onComplete();
      if (this.state.dragging) {
        let update = {};
        update.dragging = false;
        update.x = 0;
        update.y = 0;
        this.setState(update);
        return false;
      }
      if (this.state.resizing) {
        let update = {};
        update.resizing = false;
        update.x = 0;
        update.y = 0;
        this.setState(update);
        return false;
      }
      if (this.state.rotating) {
        let update = {};
        update.rotating = false;
        update.x = 0;
        update.y = 0;
        this.setState(update);
        return false;
      }
    }
  }

  onComplete = () => {
    let width = stringDimensionToInteger(this.state.width);
    let height = stringDimensionToInteger(this.state.height);
    let left = stringDimensionToInteger(this.state.left);
    let top = stringDimensionToInteger(this.state.top);
    let obj = {
      degree: this.state.degree,
      height: height,
      left: left,
      top: top,
      width: width,
      x: this.state.x,
      y: this.state.y,
    }
    if (this.state.dragging) {
      if (this.props.onDragStop!==null) {
        this.props.onDragStop(obj, this.props.index);
      }
    }
    if (this.state.resizing) {
      if (this.props.onResizeStop!==null) {
        this.props.onResizeStop(obj, this.props.index);
      }
    }
    if (this.state.rotating) {
      if (this.props.onResizeStop!==null) {
        this.props.onResizeStop(obj, this.props.index);
      }
    }
  }

  itemMove = (e) => {
    if (!this.state.dragging) {
      return false;
    }
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let item = this.itemRef.current;
    let newX = e.pageX-this.state.x;
    let newY = e.pageY-this.state.y;
    let newStyle = item.style;
    let transform = newStyle.transform.split(" ");
    let translateX = transform[0];
    let translateY = transform[1];
    translateX = translateX.replace("translateX(", "");
    translateX = translateX.replace(")px", "");
    translateX = parseFloat(translateX, 10);
    translateY = translateY.replace("translateY(", "");
    translateY = translateY.replace(")px", "");
    translateY = parseFloat(translateY, 10);

    let newTranslateX = translateX+newX;
    let newTranslateY = translateY+newY;

    if (!this.props.parentConstrain &&
      (e.pageX>windowWidth || e.pageY>windowHeight || e.pageX<0 || e.pageY<0)
    ) {
      let update = {};
      update.dragging = false;
      update.x = 0;
      update.y = 0;
      this.setState(update);
      return false;
    }
    if (this.props.parentConstrain) {
      let parent = item.parentElement;
      if (this.props.parentId!==null) {
        parent = document.getElementById(this.props.parentId);
      }
      let parentBoundingBox = parent.getBoundingClientRect();
      let parentWidth = parentBoundingBox.width;
      let parentHeight = parentBoundingBox.height;
      let top = 0;
      if (this.state.top!==0&& typeof this.state.top==="string") {
        top = this.state.top.replace("px", "");
        top = parseInt(top, 10);
      }
      let left = 0;
      if (this.state.left!==0 && typeof this.state.left==="string") {
        left = this.state.left.replace("px", "");
        left = parseInt(left, 10);
      }
      if (
        newX+left+this.state.width>=parentWidth ||
        newX+left<0 ||
        newY+top+this.state.height>=parentHeight ||
        newY+top<0
      ) {
        let update = {};
        update.dragging = false;
        update.x = 0;
        update.y = 0;
        if (newX+left<0) {
          update.left = 0;
        }
        if (newX+left+this.state.width>=parentWidth) {
          update.left = (parentWidth-this.state.width)-2+"px";
        }
        if (newY+top<0) {
          update.top = 0;
        }
        if (newY+top+this.state.height>=parentHeight) {
          update.top = (parentHeight-this.state.height)-2+"px";
        }
        this.setState(update);
        return false;
      }
    }

    let update = {};
    update.x = e.pageX;
    update.y = e.pageY;
    update.left = newTranslateX+"px";
    update.top = newTranslateY+"px";
    this.setState(update);
  };

  itemResize = (e) => {
    if (!this.state.resizing) {
      return false;
    }
    e.stopPropagation();
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let item = this.itemRef.current;
    let newX = e.pageX-this.state.x;
    let newY = e.pageY-this.state.y;
    let width = this.state.width;
    let height = this.state.height;
    let boundingBox = item.getBoundingClientRect();
    if (width===0) {
      width = boundingBox.width;
    }
    if (height===0) {
      height = boundingBox.height;
    }
    let newHeight = height;
    let newWidth = width;
    let heightDirections = ["tl","t","tr"];
    let reverseHeightDirections = ["bl","b","br"];
    if (heightDirections.indexOf(this.state.resizeDirection)>-1) {
      newHeight = height-newY;
    }
    if (reverseHeightDirections.indexOf(this.state.resizeDirection)>-1) {
      newHeight = height+newY;
    }
    let widthDirections = ["tr","r","br"];
    let reverseWidthDirections = ["tl","l","bl"];
    if (widthDirections.indexOf(this.state.resizeDirection)>-1) {
      newWidth = width+newX;
    }
    if (reverseWidthDirections.indexOf(this.state.resizeDirection)>-1) {
      newWidth = width-newX;
    }
    let update = {};

    if (e.pageX>windowWidth || e.pageY>windowHeight || e.pageX<0 || e.pageY<0) {
      update.resizing = false;
      update.x = 0;
      update.y = 0;
    }
    else {
      update.x = e.pageX;
      update.y = e.pageY;
      let newStyle = item.style;
      let transform = newStyle.transform.split(" ");
      let translateX = transform[0];
      let translateY = transform[1];
      translateX = translateX.replace("translateX(", "");
      translateX = translateX.replace(")px", "");
      translateX = parseFloat(translateX, 10);
      translateY = translateY.replace("translateY(", "");
      translateY = translateY.replace(")px", "");
      translateY = parseFloat(translateY, 10);

      let newTranslateX = translateX+newX;
      let newTranslateY = translateY+newY;
      if (this.state.resizeDirection==="t") {
        newTranslateX = translateX;
      }
      if (this.state.resizeDirection==="tr") {
        newTranslateX = translateX;
      }
      if (this.state.resizeDirection==="r") {
        newTranslateX = translateX;
        newTranslateY = translateY;
      }
      if (this.state.resizeDirection==="br") {
        newTranslateX = translateX;
        newTranslateY = translateY;
      }
      if (this.state.resizeDirection==="b") {
        newTranslateX = translateX;
        newTranslateY = translateY;
      }
      if (this.state.resizeDirection==="bl") {
        newTranslateY = translateY;
      }
      if (this.state.resizeDirection==="l") {
        newTranslateY = translateY;
      }

      update.top = newTranslateY+"px";
      update.left = newTranslateX+"px";
      update.height = newHeight;
      update.width = newWidth;
    }
    this.setState(update);
    return false;
  }

  itemRotate = (e) => {
    if (!this.state.rotating) {
      return false;
    }
    e.stopPropagation();
    let item = this.itemRef.current;
    var rect = item.getBoundingClientRect(),
    center_x = (rect.left + rect.right) / 2,
    center_y = (rect.top + rect.bottom) / 2,
    radians = Math.atan2(e.pageX - center_x, e.pageY - center_y);
    let degree = Math.round(radians * (180 / Math.PI) * -1 + 100) + 80;
    let update = {};
    update.degree = degree;
    this.setState(update);
    return false;
  };

  mouseMove = (e) => {
    if (!this.state.dragging && !this.state.resizing && !this.state.rotating) {
      return false;
    }
    if (this.state.dragging) {
      this.itemMove(e);
    }
    if (this.state.resizing) {
      this.itemResize(e);
    }
    if (this.state.rotating) {
      this.itemRotate(e);
    }
  }

  componentDidMount() {
    window.addEventListener("mousemove", this.mouseMove);
    window.addEventListener("mouseup", this.mouseUp);
    window.addEventListener('touchmove', this.mouseMove);
    window.addEventListener('touchend', this.mouseUp);
    window.addEventListener('dragend', this.mouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.mouseMove);
    window.removeEventListener("mouseup", this.mouseUp);
    window.removeEventListener('touchmove', this.mouseMove);
    window.removeEventListener('touchend', this.mouseUp);
    window.removeEventListener('dragend', this.mouseUp);
  }

  render() {
    let state = this.state;
    let props = this.props;
    let className = "sa-dnd-draggable";
    if (props.className!=="") {
      className += " "+props.className
    }
    let transformStyle = "translateX("+state.left+") translateY("+state.top+")"
    if (state.degree>0) {
      transformStyle += " rotate("+state.degree+"deg)";
    }
    let itemStyle = {
      transform:transformStyle
    };
    if (state.width>0) {
      itemStyle.width = state.width+"px"
    }
    if (state.height>0) {
      itemStyle.height = state.height+"px"
    }

    let resizableAnchors = [];

    if (props.resizable) {
      resizableAnchors = [
        <div className="sa-dnd-resizable-anchor tl"
          key="tl"
          onMouseDown={(e)=>this.startResize(e,"tl")}
        ></div>,
        <div className="sa-dnd-resizable-anchor t" key="t"
          onMouseDown={(e)=>this.startResize(e,"t")}
        ></div>,
        <div className="sa-dnd-resizable-anchor tr" key="tr"
          onMouseDown={(e)=>this.startResize(e,"tr")}
        ></div>,
        <div className="sa-dnd-resizable-anchor r" key="r"
          onMouseDown={(e)=>this.startResize(e,"r")}
        ></div>,
        <div className="sa-dnd-resizable-anchor br" key="br"
          onMouseDown={(e)=>this.startResize(e,"br")}
        ></div>,
        <div className="sa-dnd-resizable-anchor b" key="b"
          onMouseDown={(e)=>this.startResize(e,"b")}
        ></div>,
        <div className="sa-dnd-resizable-anchor bl" key="bl"
          onMouseDown={(e)=>this.startResize(e,"bl")}
        ></div>,
        <div className="sa-dnd-resizable-anchor l" key="l"
          onMouseDown={(e)=>this.startResize(e,"l")}
        ></div>,
      ];
      className += " sa-dnd-resizable";
    }
    let rotateAnchor = [];
    if (props.rotate) {
      rotateAnchor = <div
        className="sa-dnd-rotate-anchor"
        key="rotate"
        onMouseDown={(e)=>this.startRotate(e)}
        ></div>
    }
    let activeClass = "";
    if (this.state.dragging || this.state.resizing || this.state.rotating) {
      activeClass = " active;"
    }
    className +=activeClass;
    return (
      <div
        ref={this.itemRef}
        style={itemStyle}
        className={className}
      >
        {rotateAnchor}
        {resizableAnchors}
        <div
          className="sa-dnd-draggable-item"
          onMouseDown={(e)=>this.startDrag(e)}
        >
          {props.children}
        </div>
      </div>
    )
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
  onDragStop: null,
  onResizeStop: null,
  onRotateStop: null,
}

Wrapper.propTypes = {
  parentConstrain: PropTypes.bool,
  parentId: PropTypes.string,
  children: PropTypes.object,
  draggable: PropTypes.bool,
  resizable: PropTypes.bool,
  rotate: PropTypes.bool,
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
  onRotateStop: PropTypes.func,
}
