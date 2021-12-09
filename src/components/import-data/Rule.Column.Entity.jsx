import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Input, Button } from 'reactstrap';
import EntityProperties from './Import.Rule.Entity.Properties';

const ColumnEntity = (props) => {
  const { type, columns, column, index, update, remove } = props;
  const [columnValue, setColumnValue] = useState('');
  const [columnType, setColumnType] = useState('');
  const [property, setProperty] = useState('');
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    if (column !== null) {
      setColumnValue(column.value);
      setProperty(column.property);
      setCustomValue(column.customValue);
    }
  }, [column]);

  if (columns.indexOf('Add custom value') === -1) {
    columns.push('Add custom value');
  }

  const options = columns.map((c, i) => (
    <option key={c} value={i}>
      {c}
    </option>
  ));

  const updateValues = (
    columnVal = null,
    propertyVal = null,
    customVal = null,
    propertyType = null
  ) => {
    const newColumnVal = columnVal !== null ? columnVal : columnValue;
    const newPropertyVal = propertyVal !== null ? propertyVal : property;
    const newCustomVal = customVal !== null ? customVal : '';
    const newPropertyType = propertyType !== null ? propertyType : columnType;
    if (columnVal !== null) {
      setColumnValue(columnVal);
    }
    if (propertyVal !== null) {
      setProperty(propertyVal);
    }
    if (customVal !== null) {
      setCustomValue(customVal);
    }
    if (propertyType !== null) {
      setColumnType(propertyType);
    }
    const label = columns[Number(newColumnVal)];
    const custom = label === 'Add custom value';
    const columnUpdate = {
      value: newColumnVal,
      label,
      property: newPropertyVal,
      custom,
      customValue: newCustomVal,
      type: newPropertyType,
    };
    update(index, columnUpdate);
  };

  const removeBlock = () => {
    remove(index);
  };

  const removeBlockElem =
    index > 0 ? (
      <Button color="info" outline size="xs" onClick={() => removeBlock()}>
        <i className="fa fa-minus" />
      </Button>
    ) : (
      []
    );

  const customValueBlock = column.custom ? (
    <FormGroup>
      <Input
        type="text"
        name="custom-val"
        placeholder="Enter custom value"
        value={customValue}
        onChange={(e) => updateValues(null, null, e.target.value)}
      />
    </FormGroup>
  ) : (
    []
  );
  return (
    <div className="row">
      <div className="col-5">
        <FormGroup>
          <Input
            type="select"
            name="column"
            value={columnValue}
            onChange={(e) => updateValues(e.target.value, null)}
          >
            {options}
          </Input>
        </FormGroup>
      </div>
      <div className="col-5">
        <FormGroup>
          <EntityProperties
            type={type}
            property={property}
            setProperty={updateValues}
          />
        </FormGroup>
        {customValueBlock}
      </div>
      <div className="col-2">{removeBlockElem}</div>
    </div>
  );
};

ColumnEntity.defaultProps = {
  type: '',
  column: null,
};
ColumnEntity.propTypes = {
  type: PropTypes.string,
  index: PropTypes.number.isRequired,
  columns: PropTypes.array.isRequired,
  column: PropTypes.object,
  update: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
};

export default ColumnEntity;
