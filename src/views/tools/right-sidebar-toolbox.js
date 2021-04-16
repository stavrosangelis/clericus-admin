import React, { Component } from 'react';
import { Label, Tooltip, Button } from 'reactstrap';
import PropTypes from 'prop-types';

export default class ParseClassPieceToolbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tooltipZoom: false,
      tooltipSelections: false,
      tooltipLinking: false,
      classes: 'dropdown',
    };

    this.zoomSlider = this.zoomSlider.bind(this);
    this.toggleTooltip = this.toggleTooltip.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { classes } = this.state;
    if (classes === 'dropdown') {
      this.setState({ classes: 'dropdown show' });
    } else {
      this.setState({ classes: 'dropdown' });
    }
  }

  zoomSlider(e) {
    const { updateZoom } = this.props;
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    updateZoom(value);
  }

  toggleTooltip(tooltip) {
    const { [tooltip]: value } = this.state;
    this.setState({
      [tooltip]: !value,
    });
  }

  render() {
    const {
      tooltipZoom,
      tooltipSelections,
      tooltipLinking,
      classes,
    } = this.state;
    const {
      toggleSelections,
      selectionsActive,
      toggleLinking,
      linkingActive,
      updateSettings,
      zoom,
      updateFaces,
      storeSelectionsBtn,
      saveFacesThumbnails,
      saveThumbnailsBtn,
      storeLinking,
      storeLinkingBtn,
    } = this.props;
    let selectionsBodyClass = 'active';
    let toggleSelectionsIcon = (
      <i
        className="toggle-icon fa fa-toggle-on pull-right"
        onClick={toggleSelections}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="action"
      />
    );
    let btnSelectionDisabled = false;
    if (!selectionsActive) {
      toggleSelectionsIcon = (
        <i
          className="toggle-icon fa fa-toggle-off pull-right"
          onClick={toggleSelections}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="action"
        />
      );
      btnSelectionDisabled = true;
      selectionsBodyClass = '';
    }
    let linkingBodyClass = 'active';
    let toggleLinkingIcon = (
      <i
        className="toggle-icon fa fa-toggle-on pull-right"
        onClick={toggleLinking}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="action"
      />
    );
    let btnLinkingDisabled = false;
    if (!linkingActive) {
      toggleLinkingIcon = (
        <i
          className="toggle-icon fa fa-toggle-off pull-right"
          onClick={toggleLinking}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="action"
        />
      );
      btnLinkingDisabled = true;
      linkingBodyClass = '';
    }

    // tooltips
    // zoom
    const zoomTooltip = (
      <Tooltip
        className="toolbox-tooltip"
        placement="auto"
        isOpen={tooltipZoom}
        target="tooltip-zoom"
        toggle={() => this.toggleTooltip('tooltipZoom')}
        autohide={false}
      >
        Select and drag the slider to set the zoom value
      </Tooltip>
    );

    const selectionsTooltip = (
      <Tooltip
        className="toolbox-tooltip"
        placement="auto"
        isOpen={tooltipSelections}
        target="tooltip-selections"
        toggle={() => this.toggleTooltip('tooltipSelections')}
        autohide={false}
        html="true"
      >
        <ul>
          <li>Enable/disable the ability to modify the faces selections.</li>
          <li>Store the modified faces selections.</li>
          <li>
            Extract the selected faces thumbnails and store them to the
            filesystem
          </li>
        </ul>
      </Tooltip>
    );

    const linkingTooltip = (
      <Tooltip
        className="toolbox-tooltip"
        placement="auto"
        isOpen={tooltipLinking}
        target="tooltip-linking"
        toggle={() => this.toggleTooltip('tooltipLinking')}
        autohide={false}
        html="true"
      >
        <ul>
          <li>Enable/disable the ability to link faces with text</li>
          <li>
            Assign text to corresponding element:
            <ul>
              <li>First name</li>
              <li>Last name</li>
              <li>Diocese</li>
            </ul>
          </li>
          <li>Store the links to the filesystem</li>
        </ul>
      </Tooltip>
    );
    return (
      <div className="fixed-plugin">
        <div className={classes}>
          <div
            onClick={() => this.handleClick()}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select event"
          >
            <i className="fa fa-cog fa-2x" />
          </div>
          <ul className="dropdown-menu">
            <li className="header-title">
              <h4 style={{ marginTop: '5px' }}>Toolbox</h4>
            </li>
            <li className="adjustments-line" />
            <li className="button-container">
              <div className="slidecontainer">
                {zoomTooltip}
                <Label>
                  Zoom <i className="fa fa-question-circle" id="tooltip-zoom" />
                </Label>
                <input
                  type="range"
                  min={1}
                  max={200}
                  value={zoom}
                  className="slider"
                  onChange={this.zoomSlider}
                  onMouseUp={updateSettings}
                />
                <div className="zoom-output text-center">{zoom}%</div>
              </div>
            </li>
            <li className="button-container">
              <div style={{ position: 'relative' }}>
                {selectionsTooltip}
                <Label>
                  Selections{' '}
                  <i
                    className="fa fa-question-circle"
                    id="tooltip-selections"
                  />
                </Label>
                {toggleSelectionsIcon}
              </div>
              <div className={`nav-block-body ${selectionsBodyClass}`}>
                <Button
                  color="secondary"
                  outline
                  block
                  onClick={updateFaces}
                  disabled={btnSelectionDisabled}
                >
                  {storeSelectionsBtn}
                </Button>
                <Button
                  color="secondary"
                  outline
                  block
                  onClick={saveFacesThumbnails}
                  disabled={btnSelectionDisabled}
                >
                  {saveThumbnailsBtn}
                </Button>
              </div>
            </li>
            <li className="button-container">
              <div style={{ position: 'relative' }}>
                {linkingTooltip}
                <Label>
                  Linking{' '}
                  <i className="fa fa-question-circle" id="tooltip-linking" />
                </Label>
                {toggleLinkingIcon}
              </div>
              <div className={`nav-block-body ${linkingBodyClass}`}>
                <Button
                  color="secondary"
                  outline
                  block
                  onClick={storeLinking}
                  disabled={btnLinkingDisabled}
                >
                  {storeLinkingBtn}
                </Button>
              </div>
            </li>
            <li className="button-container" />
            <li className="button-container" />
            <li className="button-container" />
          </ul>
        </div>
      </div>
    );
  }
}

ParseClassPieceToolbox.defaultProps = {
  updateZoom: () => {},
  toggleSelections: () => {},
  selectionsActive: false,
  toggleLinking: () => {},
  linkingActive: false,
  updateSettings: () => {},
  zoom: 1,
  updateFaces: () => {},
  storeSelectionsBtn: [],
  saveFacesThumbnails: () => {},
  saveThumbnailsBtn: [],
  storeLinking: () => {},
  storeLinkingBtn: [],
};
ParseClassPieceToolbox.propTypes = {
  updateZoom: PropTypes.func,
  toggleSelections: PropTypes.func,
  selectionsActive: PropTypes.bool,
  toggleLinking: PropTypes.func,
  linkingActive: PropTypes.func,
  updateSettings: PropTypes.func,
  zoom: PropTypes.number,
  updateFaces: PropTypes.func,
  storeSelectionsBtn: PropTypes.array,
  saveFacesThumbnails: PropTypes.func,
  saveThumbnailsBtn: PropTypes.array,
  storeLinking: PropTypes.func,
  storeLinkingBtn: PropTypes.array,
};
