import React, { Component } from 'react';
import { Tooltip, Button } from 'reactstrap';
import PropTypes from 'prop-types';

export default class ParseClassPieceToolbox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipIdentifyDuplicates: false,
      tooltipSelectAll: false,
      tooltipImportSelected: false,
      classes: 'dropdown',
    };

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
      classes,
    } = this.state;
    const {
      selectAll,
      selectAllBtn,
      identifyDuplicates,
      identifyDuplicatesBtn,
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

    return (
      <div className="fixed-plugin">
        <div className={classes}>
          <div
            onClick={() => this.handleClick()}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="action"
          >
            <i className="fa fa-cog fa-2x" />
          </div>
          <ul className="dropdown-menu">
            <li className="header-title">
              <h4 style={{ marginTop: '5px' }}>Toolbox</h4>
            </li>
            <li className="adjustments-line" />
            <li className="button-container">
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
            </li>
            <li className="button-container">
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
            </li>
            <li className="button-container">
              <div style={{ position: 'relative' }}>
                {importSelectedTooltip}
                <Button
                  color="secondary"
                  outline
                  block
                  size="sm"
                  onClick={identifyDuplicatesBtn}
                >
                  <i
                    className="fa fa-question-circle pull-left"
                    id="tooltip-importSelected"
                  />{' '}
                  {importSelectedBtn}{' '}
                </Button>
              </div>
            </li>
            <li className="adjustments-line" />
            <li className="adjustments-line" />
          </ul>
        </div>
      </div>
    );
  }
}

ParseClassPieceToolbox.defaultProps = {
  selectAll: () => {},
  identifyDuplicates: () => {},
  selectAllBtn: [],
  identifyDuplicatesBtn: [],
  importSelectedBtn: [],
};
ParseClassPieceToolbox.propTypes = {
  selectAll: PropTypes.func,
  identifyDuplicates: PropTypes.func,
  selectAllBtn: PropTypes.array,
  identifyDuplicatesBtn: PropTypes.array,
  importSelectedBtn: PropTypes.array,
};
