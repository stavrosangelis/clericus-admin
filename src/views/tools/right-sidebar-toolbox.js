import React, { Component } from 'react';
import { Tooltip, Button } from 'reactstrap';


export default class ParseClassPieceToolbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tooltipZoom: false,
      tooltipSelections: false,
      tooltipLinking: false,
      classes: "dropdown"
    };

    this.zoomSlider = this.zoomSlider.bind(this);
    this.toggleTooltip = this.toggleTooltip.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  zoomSlider(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    this.props.updateZoom(value);
  }

  toggleTooltip(tooltip) {
    let value = true;
    if (this.state[tooltip]) {
      value = false;
    }
    this.setState({
      [tooltip]: value
    });
  }

  handleClick() {
    if (this.state.classes === "dropdown") {
      this.setState({ classes: "dropdown show" });
    } else {
      this.setState({ classes: "dropdown" });
    }
  }

  render() {
    let selectionsBodyClass = "active";
    let toggleSelectionsIcon = <i className="toggle-icon fa fa-toggle-on pull-right" onClick={this.props.toggleSelections}></i>;
    let btnSelectionDisabled = false;
    if (!this.props.selectionsActive) {
      toggleSelectionsIcon = <i className="toggle-icon fa fa-toggle-off pull-right" onClick={this.props.toggleSelections}></i>;
      btnSelectionDisabled = true;
      selectionsBodyClass = "";
    }
    let linkingBodyClass = "active";
    let toggleLinkingIcon = <i className="toggle-icon fa fa-toggle-on pull-right" onClick={this.props.toggleLinking}></i>;
    let btnLinkingDisabled = false;
    if (!this.props.linkingActive) {
      toggleLinkingIcon = <i className="toggle-icon fa fa-toggle-off pull-right" onClick={this.props.toggleLinking}></i>;
      btnLinkingDisabled = true;
      linkingBodyClass = "";
    }

    // tooltips
    // zoom
    let zoomTooltip = <Tooltip className="toolbox-tooltip" placement="auto" isOpen={this.state.tooltipZoom} target='tooltip-zoom' toggle={this.toggleTooltip.bind(this, 'tooltipZoom')} autohide={false}>Select and drag the slider to set the zoom value</Tooltip>

    let selectionsTooltip = <Tooltip className="toolbox-tooltip" placement="auto" isOpen={this.state.tooltipSelections} target='tooltip-selections' toggle={this.toggleTooltip.bind(this, 'tooltipSelections')} autohide={false} html="true">
      <ul>
        <li>Enable/disable the ability to modify the faces selections.</li>
        <li>Store the modified faces selections.</li>
        <li>Extract the selected faces thumbnails and store them to the filesystem</li>
      </ul>
    </Tooltip>

    let linkingTooltip = <Tooltip className="toolbox-tooltip" placement="auto" isOpen={this.state.tooltipLinking} target='tooltip-linking' toggle={this.toggleTooltip.bind(this, 'tooltipLinking')} autohide={false} html="true">
      <ul>
        <li>Enable/disable the ability to link faces with text</li>
        <li>Assign text to corresponding element:
          <ul>
            <li>First name</li>
            <li>Last name</li>
            <li>Diocese</li>
          </ul>
        </li>
        <li>Store the links to the filesystem</li>
      </ul>
    </Tooltip>
    return (
      <div className="fixed-plugin">
        <div className={this.state.classes}>
          <div onClick={this.handleClick}>
            <i className="fa fa-cog fa-2x" />
          </div>
          <ul className="dropdown-menu">
            <li className="header-title"><h4 style={{marginTop: "5px"}}>Toolbox</h4></li>
            <li className="adjustments-line"></li>
            <li className="button-container">
              <div className="slidecontainer">
                {zoomTooltip}
                <label>Zoom <i className="fa fa-question-circle" id="tooltip-zoom"></i></label>
                <input
                  type="range"
                  min={1}
                  max={200}
                  value={this.props.zoom}
                  className="slider"
                  onChange={this.zoomSlider}
                  onMouseUp={this.props.updateSettings}
                  />
                <div className="zoom-output text-center">{this.props.zoom}%</div>
              </div>
            </li>
            <li className="button-container">
              <div style={{position: 'relative'}}>
                {selectionsTooltip}
                <label>Selections <i className="fa fa-question-circle" id="tooltip-selections"></i></label>
                {toggleSelectionsIcon}
              </div>
              <div className={"nav-block-body "+selectionsBodyClass}>
                <Button color="secondary" outline block onClick={this.props.updateFaces} disabled={btnSelectionDisabled}>{this.props.storeSelectionsBtn}</Button>
                <Button color="secondary" outline block onClick={this.props.saveFacesThumbnails} disabled={btnSelectionDisabled}>{this.props.saveThumbnailsBtn}</Button>
              </div>
            </li>
            <li className="button-container">
              <div style={{position: 'relative'}}>
                {linkingTooltip}
                <label>Linking <i className="fa fa-question-circle" id="tooltip-linking"></i></label>
                {toggleLinkingIcon}
              </div>              
              <div className={"nav-block-body "+linkingBodyClass}>
                <Button color="secondary" outline block onClick={this.props.storeLinking} disabled={btnLinkingDisabled}>{this.props.storeLinkingBtn}</Button>
              </div>
            </li>
            <li className="button-container"></li>
            <li className="button-container"></li>
            <li className="button-container"></li>
          </ul>
        </div>
      </div>
    )
  }
}
