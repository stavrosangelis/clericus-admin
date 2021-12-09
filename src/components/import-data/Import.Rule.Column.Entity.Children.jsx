import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { FormGroup, Input, Button } from 'reactstrap';
import EntityPropertiesChildren from './Import.Rule.Entity.Properties.Children';

const ColumnEntityChildren = (props) => {
  const {
    columns,
    column,
    index,
    update,
    remove,
    properties,
    propertyDetails,
  } = props;
  const [columnValue, setColumnValue] = useState('');
  const [columnChildren, setColumnChildren] = useState([]);
  const [columnType, setColumnType] = useState('');
  const [property, setProperty] = useState('');

  useEffect(() => {
    if (column !== null && typeof column.children !== 'undefined') {
      setColumnChildren(column.children);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (column !== null) {
      const { value } = column;
      if (
        typeof column.children === 'undefined' &&
        columnChildren.length === 0 &&
        propertyDetails !== null &&
        typeof propertyDetails.children !== 'undefined' &&
        propertyDetails.children.length > 0
      ) {
        const children = propertyDetails.children.map((c) => ({
          custom: false,
          customValue: '',
          label: '',
          property: c.label,
          type: c.type,
          value: -1,
        }));
        setColumnChildren(children);
      }
      setColumnValue(value);
      setProperty(column.property);
    }
  }, [column, propertyDetails, columnChildren]);

  if (columns.indexOf('Add custom value') === -1) {
    columns.push('Add custom value');
  }

  const updateValues = ({
    columnVal = null,
    propertyVal = null,
    customVal = null,
    propertyType = null,
    propertyColumnChildren = [],
  }) => {
    const newColumnVal = columnVal !== null ? columnVal : columnValue;
    const newPropertyVal = propertyVal !== null ? propertyVal : property;
    const newCustomVal = customVal !== null ? customVal : '';
    const newPropertyType = propertyType !== null ? propertyType : columnType;
    const newPropertyColumnChildren =
      propertyColumnChildren.length > 0
        ? propertyColumnChildren
        : columnChildren;
    if (columnVal !== null) {
      setColumnValue(columnVal);
    }
    if (propertyVal !== null) {
      setProperty(propertyVal);
    }
    if (propertyType !== null) {
      setColumnType(propertyType);
    }
    if (propertyColumnChildren.length > 0) {
      setColumnChildren(propertyColumnChildren);
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
      children: newPropertyColumnChildren,
    };
    update(index, columnUpdate);
  };

  const updateChildValues = ({
    columnVal = null,
    propertyVal = null,
    customVal = null,
    propertyType = null,
    idx = 0,
  }) => {
    const children = [...columnChildren];
    const child = children[idx];
    if (columnVal !== null) {
      child.value = columnVal;
      child.label =
        columnVal === '' ? '- leave blank -' : columns[Number(columnVal)];
    }
    if (propertyVal !== null) {
      child.property = propertyVal;
    }
    if (customVal !== null) {
      child.custom = customVal;
    }
    if (customVal !== null) {
      child.customValue = customVal;
    }
    if (propertyType !== null) {
      child.type = propertyType;
    }
    const custom = child.label === 'Add custom value';
    if (custom) {
      child.custom = custom;
    }
    const columnUpdate = { ...column };
    columnUpdate.children = children;
    columnUpdate.children[idx] = child;
    setColumnChildren(children);
    update(index, columnUpdate);
  };

  const handleChildChange = (option, idx) => {
    updateChildValues({ columnVal: option.value, idx });
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

  const rows = [];
  const parentRow = (
    <div className="row" key="parent-row">
      <div className="col-5" />
      <div className="col-5">
        <FormGroup>
          <EntityPropertiesChildren
            properties={properties}
            property={property}
            setProperty={updateValues}
            parent
          />
        </FormGroup>
      </div>
      <div className="col-2">{removeBlockElem}</div>
    </div>
  );

  const { length } = columnChildren;

  const options = columns.map((c, key) => ({ value: key, label: c }));
  options.unshift({ value: '', label: '- leave blank -' });

  for (let i = 0; i < length; i += 1) {
    const child = columnChildren[i];

    const customValueBlock = child.custom ? (
      <FormGroup>
        <Input
          type="text"
          name="custom-val"
          placeholder="Enter custom value"
          value={child.customValue}
          onChange={(e) =>
            updateChildValues({ customVal: e.target.value, idx: i })
          }
        />
      </FormGroup>
    ) : (
      []
    );
    const childValue = {
      value: child.value,
      label: child.label,
    };
    const row = (
      <div className="row" key={`${i}-${child.label}`}>
        <div className="col-5">
          <FormGroup>
            <div style={{ paddingLeft: 20 }}>
              <Select
                value={childValue}
                onChange={(o) => handleChildChange(o, i)}
                options={options}
              />
            </div>
          </FormGroup>
        </div>
        <div className="col-5">
          <FormGroup>
            <EntityPropertiesChildren
              properties={propertyDetails.children}
              property={child.property}
              setProperty={updateChildValues}
              index={i}
            />
          </FormGroup>
          {customValueBlock}
        </div>
        <div className="col-2">{removeBlockElem}</div>
      </div>
    );
    rows.push(row);
  }

  return (
    <div>
      {parentRow}
      <div className="children-rows">{rows}</div>
    </div>
  );
};

ColumnEntityChildren.defaultProps = {
  column: null,
};
ColumnEntityChildren.propTypes = {
  index: PropTypes.number.isRequired,
  columns: PropTypes.array.isRequired,
  column: PropTypes.object,
  update: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  properties: PropTypes.array.isRequired,
  propertyDetails: PropTypes.object.isRequired,
};

export default ColumnEntityChildren;
