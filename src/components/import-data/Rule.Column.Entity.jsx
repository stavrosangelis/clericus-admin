import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Input, Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import EntityProperties from './Import.Rule.Entity.Properties';

function ColumnEntity(props) {
  const { type, columns, column, index, update, remove, properties } = props;
  const [columnValue, setColumnValue] = useState('');
  const [columnType, setColumnType] = useState('');
  const [property, setProperty] = useState('');
  const [customValue, setCustomValue] = useState('');

  // redux
  const eventTypes = useSelector((s) => s.eventTypes);
  const organisationTypes = useSelector((s) => s.organisationTypes);
  const personTypes = useSelector((s) => s.personTypes);
  const resourcesTypes = useSelector((s) => s.resourcesTypes);

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

  const typesOptions = (propertyType, types = [], pre = '') => {
    const output = [];
    const { length } = types;
    for (let i = 0; i < length; i += 1) {
      const t = types[i];
      const { _id, label, children = [] } = t;
      const value = propertyType === 'string' ? label : _id;
      const option = (
        <option key={_id} value={value}>
          {pre} {label}
        </option>
      );
      output.push(option);
      const { length: cLength } = children;
      if (cLength > 0) {
        const cPre = `${pre}-`;
        const childrenOptions = typesOptions(propertyType, children, cPre);
        for (let j = 0; j < cLength; j += 1) {
          output.push(childrenOptions[j]);
        }
      }
    }
    return output;
  };

  let customValueBlock = [];
  if (column.custom) {
    const selectedProperty =
      properties.find((p) => p.label === property) || null;
    const selectedPropertyTaxonomy = selectedProperty?.taxonomy || false;
    if (selectedPropertyTaxonomy) {
      const { labelId } = selectedProperty;
      let types = [];
      switch (labelId) {
        case 'EventTypes':
          types = eventTypes;
          break;
        case 'OrganisationTypes':
          types = organisationTypes;
          break;
        case 'PersonTypes':
          types = personTypes;
          break;
        case 'ResourceSystemTypes':
          types = resourcesTypes;
          break;
        default:
          break;
      }
      const customOptions = typesOptions(selectedProperty.type, types, '');
      customValueBlock = (
        <FormGroup>
          <Input
            type="select"
            name="custom-val"
            value={customValue}
            onChange={(e) => updateValues({ customVal: e.target.value })}
          >
            {customOptions}
          </Input>
        </FormGroup>
      );
    } else {
      customValueBlock = (
        <FormGroup>
          <Input
            type="text"
            name="custom-val"
            placeholder="Enter custom value"
            value={customValue}
            onChange={(e) => updateValues({ customVal: e.target.value })}
          />
        </FormGroup>
      );
    }
  }

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
            properties={properties}
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
}

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
  properties: PropTypes.array.isRequired,
};

export default ColumnEntity;
