import React, { Component } from 'react';
import { Tooltip, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import '../../assets/scss/parse-classpieces-toolbox.scss';

export default class ParseClassPieceToolbox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipIdentifyDuplicates: false,
      tooltipSelectAll: false,
      tooltipImportSelected: false,
      visible: false,
    };

    this.toggleTooltip = this.toggleTooltip.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  }

  toggleTooltip(tooltip) {
    const { [tooltip]: value } = this.state;
    this.setState({
      [tooltip]: !value,
    });
  }

  render() {
    const {
      tooltipSelectAll,
      tooltipIdentifyDuplicates,
      tooltipImportSelected,
      visible,
    } = this.state;
    const {
      selectAll,
      selectAllBtn,
      identifyDuplicates,
      identifyDuplicatesBtn,
      importSelected,
      importSelectedBtn,
    } = this.props;
    const selectAllTooltip = (
      <Tooltip
        className="toolbox-tooltip"
        placement="auto"
        isOpen={tooltipSelectAll}
        target="tooltip-selectAll"
        toggle={() => this.toggleTooltip('tooltipSelectAll')}
        autohide={false}
      >
        Select all items
      </Tooltip>
    );

    const identifyDuplicatesTooltip = (
      <Tooltip
        className="toolbox-tooltip"
        placement="auto"
        isOpen={tooltipIdentifyDuplicates}
        target="tooltip-identifyDuplicates"
        toggle={() => this.toggleTooltip('tooltipIdentifyDuplicates')}
        autohide={false}
      >
        Cross reference the identified items with the repository to see if there
        are possible duplicates
      </Tooltip>
    );

    const importSelectedTooltip = (
      <Tooltip
        className="toolbox-tooltip"
        placement="auto"
        isOpen={tooltipImportSelected}
        target="tooltip-importSelected"
        toggle={() => this.toggleTooltip('tooltipImportSelected')}
        autohide={false}
      >
        Import all selected items to the repository
      </Tooltip>
    );

    const active = visible ? ' active' : '';
    return (
      <div className={`fixed-plugin${active}`}>
        <div
          className="fixed-plugin-toggle"
          onClick={() => this.handleClick()}
          onKeyDown={() => this.handleClick()}
          role="button"
          tabIndex={0}
          aria-label="toggle sidebar toolbox"
        >
          <i className="fa fa-cog fa-2x" />
        </div>
        <div className="menu">
          <div className="header-title">
            <h4>Toolbox</h4>
          </div>
          <div className="menu-body">
            <div className="spacer" />
            <div className="button-container">
              <div style={{ position: 'relative' }}>
                {selectAllTooltip}
                <Button
                  color="secondary"
                  outline
                  block
                  size="sm"
                  onClick={selectAll}
                >
                  <i
                    className="fa fa-question-circle pull-left"
                    id="tooltip-selectAll"
                  />{' '}
                  {selectAllBtn}{' '}
                </Button>
              </div>
            </div>
            <div className="spacer" />
            <div className="button-container">
              <div style={{ position: 'relative' }}>
                {identifyDuplicatesTooltip}
                <Button
                  color="secondary"
                  outline
                  block
                  size="sm"
                  onClick={identifyDuplicates}
                >
                  <i
                    className="fa fa-question-circle pull-left"
                    id="tooltip-identifyDuplicates"
                  />{' '}
                  {identifyDuplicatesBtn}{' '}
                </Button>
              </div>
            </div>
            <div className="spacer" />
            <div className="button-container">
              <div style={{ position: 'relative' }}>
                {importSelectedTooltip}
                <Button
                  color="secondary"
                  outline
                  block
                  size="sm"
                  onClick={importSelected}
                >
                  <i
                    className="fa fa-question-circle pull-left"
                    id="tooltip-importSelected"
                  />{' '}
                  {importSelectedBtn}{' '}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ParseClassPieceToolbox.defaultProps = {
  selectAll: () => {},
  selectAllBtn: [],
  identifyDuplicates: () => {},
  identifyDuplicatesBtn: [],
  importSelected: () => {},
  importSelectedBtn: [],
};
ParseClassPieceToolbox.propTypes = {
  selectAll: PropTypes.func,
  selectAllBtn: PropTypes.object,
  identifyDuplicates: PropTypes.func,
  identifyDuplicatesBtn: PropTypes.object,
  importSelected: PropTypes.func,
  importSelectedBtn: PropTypes.object,
};
