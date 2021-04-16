import React, { Component } from 'react';
import { Button, Input } from 'reactstrap';
import PropTypes from 'prop-types';

export default class AdvancedSearchFormRow extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  render() {
    const {
      addAdvancedSearchRow,
      default: isDefault,
      removeAdvancedSearchRow,
      rowId,
      searchSelect,
      handleAdvancedSearchChange,
      availableElements,
      searchInput,
    } = this.props;
    let button = (
      <Button
        size="sm"
        color="secondary"
        outline
        type="button"
        onClick={addAdvancedSearchRow}
      >
        <i className="fa fa-plus" />
      </Button>
    );
    if (!isDefault) {
      button = (
        <Button
          size="sm"
          color="secondary"
          outline
          type="button"
          onClick={() => removeAdvancedSearchRow(rowId)}
        >
          <i className="fa fa-minus" />
        </Button>
      );
    }
    return (
      <div className="advanced-search-row">
        <div className="advanced-search-select">
          <Input
            type="select"
            name="select"
            value={searchSelect}
            onChange={(e) => handleAdvancedSearchChange(e, rowId)}
          >
            {availableElements}
          </Input>
        </div>
        <div className="advanced-search-input">
          <Input
            type="text"
            name="input"
            value={searchInput}
            onChange={(e) => handleAdvancedSearchChange(e, rowId)}
          />
        </div>
        <div className="advanced-search-button">{button}</div>
      </div>
    );
  }
}

AdvancedSearchFormRow.defaultProps = {
  addAdvancedSearchRow: () => {},
  removeAdvancedSearchRow: () => {},
  handleAdvancedSearchChange: () => {},
  default: false,
  rowId: '',
  searchSelect: '',
  availableElements: [],
  searchInput: '',
};

AdvancedSearchFormRow.propTypes = {
  addAdvancedSearchRow: PropTypes.func,
  removeAdvancedSearchRow: PropTypes.func,
  handleAdvancedSearchChange: PropTypes.func,
  default: PropTypes.bool,
  rowId: PropTypes.string,
  searchSelect: PropTypes.string,
  availableElements: PropTypes.array,
  searchInput: PropTypes.string,
};
