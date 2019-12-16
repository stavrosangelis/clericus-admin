import React, { Component } from 'react';

export default class ContextualMenu extends Component {

  render() {
    let menuItems = [];
    let headerText = "";
    let addFaceClass = "";
    let removeFaceClass = "disabled";
    if (this.props.targetFace) {
      addFaceClass = "disabled";
      removeFaceClass = "";
    }
    if (this.props.selectionsActive) {
      headerText = "Selections";
      menuItems = <ul>
        <li className={addFaceClass} onClick={this.props.addNewSelection}>
          <span>Add new selection</span>
        </li>
        <li className={removeFaceClass} onClick={this.props.removeSelection}>
          <span>Remove selection</span>
        </li>
        <li onClick={this.props.updateFaces}>
          <span>Store selections</span>
        </li>
        <li onClick={this.props.saveFacesThumbnails}>
          <span>Extract thumbnails</span>
        </li>
      </ul>;
    }
    if (this.props.linkingActive) {
      headerText = "Linking";
      menuItems = <ul>
        <li onClick={this.props.storeLinking}>
          <span>Store updates</span>
        </li>
      </ul>;
    }
    let display = "none";
    if (this.props.visible) {
      display = "block";
    }
    let style = {top:this.props.position.top+"px", left: this.props.position.left+"px", display: display}
    return (
      <div className="context-menu" style={style}>
        <div className="header">{headerText}</div>
        {menuItems}
      </div>

    );
  }
}
