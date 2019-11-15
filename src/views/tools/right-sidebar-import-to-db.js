import React, { Component } from 'react';
import { Tooltip, Button } from 'reactstrap';

export default class ParseClassPieceToolbox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipIdentifyDuplicates: false,
      tooltipSelectAll: false,
      tooltipImportSelected: false,
      classes: "dropdown"
    }

    this.toggleTooltip = this.toggleTooltip.bind(this);
    this.handleClick = this.handleClick.bind(this);
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

    // tooltips

    let selectAllTooltip = <Tooltip className="toolbox-tooltip" placement="auto" isOpen={this.state.tooltipSelectAll} target='tooltip-selectAll' toggle={this.toggleTooltip.bind(this, 'tooltipSelectAll')} autohide={false}>Select all items</Tooltip>;

    let identifyDuplicatesTooltip = <Tooltip className="toolbox-tooltip" placement="auto" isOpen={this.state.tooltipIdentifyDuplicates} target='tooltip-identifyDuplicates' toggle={this.toggleTooltip.bind(this, 'tooltipIdentifyDuplicates')} autohide={false}>Cross reference the identified items with the repository to see if there are possible duplicates</Tooltip>;

    let importSelectedTooltip = <Tooltip className="toolbox-tooltip" placement="auto" isOpen={this.state.tooltipImportSelected} target='tooltip-importSelected' toggle={this.toggleTooltip.bind(this, 'tooltipImportSelected')} autohide={false}>Import all selected items to the repository</Tooltip>;

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
              <div style={{position: 'relative'}}>
                {selectAllTooltip}
                <Button color="secondary" outline block size="sm" onClick={this.props.selectAll}><i className="fa fa-question-circle pull-left" id="tooltip-selectAll"></i> {this.props.selectAllBtn} </Button>
              </div>
            </li>
            <li className="button-container">
              <div style={{position: 'relative'}}>
                {identifyDuplicatesTooltip}
                <Button color="secondary" outline block size="sm" onClick={this.props.identifyDuplicates}><i className="fa fa-question-circle pull-left" id="tooltip-identifyDuplicates"></i> {this.props.identifyDuplicatesBtn} </Button>
              </div>
            </li>
            <li className="button-container">
              <div style={{position: 'relative'}}>
                {importSelectedTooltip}
                <Button color="secondary" outline block size="sm" onClick={this.props.importSelected}><i className="fa fa-question-circle pull-left" id="tooltip-importSelected"></i> {this.props.importSelectedBtn} </Button>
              </div>
            </li>
            <li className="adjustments-line"></li>
            <li className="adjustments-line"></li>
          </ul>
        </div>
      </div>
    )
  }
}
