import React, { useState } from 'react';
import { Label, Tooltip, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import '../../assets/scss/parse-classpieces-toolbox.scss';

const ParseClassPieceToolbox = (props) => {
  // props
  const {
    toggleSelections,
    selectionsActive,
    toggleLinking,
    linkingActive,
    updateSettings,
    zoom,
    updateFaces,
    updateZoom,
    storeSelectionsBtn,
    saveFacesThumbnails,
    saveThumbnailsBtn,
    storeLinking,
    storeLinkingBtn,
  } = props;

  // state
  const [tooltipZoom, setTooltipZoom] = useState(false);
  const [tooltipSelections, setTooltipSelections] = useState(false);
  const [tooltipLinking, setTooltipLinking] = useState(false);
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    setVisible(!visible);
  };

  const zoomSlider = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    updateZoom(value);
  };

  const toggleTooltip = (tooltip) => {
    if (tooltip === 'tooltipZoom') {
      setTooltipZoom(!tooltipZoom);
    }
    if (tooltip === 'tooltipSelections') {
      setTooltipSelections(!tooltipSelections);
    }
    if (tooltip === 'tooltipLinking') {
      setTooltipLinking(!tooltipLinking);
    }
  };

  const active = visible ? ' active' : '';
  const selectionsBodyClass = selectionsActive ? ' active' : '';

  const toggleSelectionsIcon = selectionsActive ? (
    <i
      className="toggle-icon fa fa-toggle-on pull-right"
      onClick={toggleSelections}
      onKeyDown={() => false}
      role="button"
      tabIndex={0}
      aria-label="action"
    />
  ) : (
    <i
      className="toggle-icon fa fa-toggle-off pull-right"
      onClick={toggleSelections}
      onKeyDown={() => false}
      role="button"
      tabIndex={0}
      aria-label="action"
    />
  );
  const btnSelectionDisabled = false;

  const linkingBodyClass = linkingActive ? ' active' : '';
  const toggleLinkingIcon = linkingActive ? (
    <i
      className="toggle-icon fa fa-toggle-on pull-right"
      onClick={toggleLinking}
      onKeyDown={() => false}
      role="button"
      tabIndex={0}
      aria-label="action"
    />
  ) : (
    <i
      className="toggle-icon fa fa-toggle-off pull-right"
      onClick={toggleLinking}
      onKeyDown={() => false}
      role="button"
      tabIndex={0}
      aria-label="action"
    />
  );
  const btnLinkingDisabled = !linkingActive;

  // tooltips
  // zoom
  const zoomTooltip = (
    <Tooltip
      className="toolbox-tooltip"
      placement="auto"
      isOpen={tooltipZoom}
      target="tooltip-zoom"
      toggle={() => toggleTooltip('tooltipZoom')}
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
      toggle={() => toggleTooltip('tooltipSelections')}
      autohide={false}
      html="true"
    >
      <ul>
        <li>Enable/disable the ability to modify the faces selections.</li>
        <li>Store the modified faces selections.</li>
        <li>
          Extract the selected faces thumbnails and store them to the filesystem
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
      toggle={() => toggleTooltip('tooltipLinking')}
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
    <div className={`fixed-plugin${active}`}>
      <div
        className="fixed-plugin-toggle"
        onClick={() => toggleVisible()}
        onKeyDown={() => toggleVisible()}
        role="button"
        tabIndex={0}
        aria-label="select event"
      >
        <i className="fa fa-cog fa-2x" />
      </div>
      <div className="menu">
        <div className="header-title">
          <h4>Toolbox</h4>
        </div>
        <div className="menu-body">
          <div className="button-container">
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
                onChange={zoomSlider}
                onMouseUp={updateSettings}
              />
              <div className="zoom-output text-center">{zoom}%</div>
            </div>
          </div>
          <div className="button-container">
            <div style={{ position: 'relative' }}>
              {selectionsTooltip}
              <Label>
                Selections{' '}
                <i className="fa fa-question-circle" id="tooltip-selections" />
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
          </div>
          <div className="button-container">
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
          </div>
        </div>
      </div>
    </div>
  );
};

ParseClassPieceToolbox.defaultProps = {
  updateZoom: () => {},
  toggleSelections: () => {},
  selectionsActive: false,
  toggleLinking: () => {},
  linkingActive: false,
  updateSettings: () => {},
  zoom: 1,
  updateFaces: () => {},
  storeSelectionsBtn: null,
  saveFacesThumbnails: () => {},
  saveThumbnailsBtn: null,
  storeLinking: () => {},
  storeLinkingBtn: null,
};
ParseClassPieceToolbox.propTypes = {
  updateZoom: PropTypes.func,
  toggleSelections: PropTypes.func,
  selectionsActive: PropTypes.bool,
  toggleLinking: PropTypes.func,
  linkingActive: PropTypes.bool,
  updateSettings: PropTypes.func,
  zoom: PropTypes.number,
  updateFaces: PropTypes.func,
  storeSelectionsBtn: PropTypes.object,
  saveFacesThumbnails: PropTypes.func,
  saveThumbnailsBtn: PropTypes.object,
  storeLinking: PropTypes.func,
  storeLinkingBtn: PropTypes.object,
};

export default ParseClassPieceToolbox;
