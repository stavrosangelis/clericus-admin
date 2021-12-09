import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { FormGroup, Input, Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import EntityProperties from './Import.Rule.Entity.Properties';

const ColumnEntity = (props) => {
  const { columns, column, index, update, remove, properties } = props;
  const [columnValue, setColumnValue] = useState('');
  const [columnObjValue, setColumnObjValue] = useState(null);
  const [columnType, setColumnType] = useState('');
  const [property, setProperty] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [regexpActive, setRegexpActive] = useState(false);
  const [regexp, setRegexp] = useState('');
  const [prefixTextActive, setPrefixTextActive] = useState(false);
  const [prefixText, setPrefixText] = useState('');

  // redux
  const eventTypes = useSelector((s) => s.eventTypes);
  const organisationTypes = useSelector((s) => s.organisationTypes);
  const personTypes = useSelector((s) => s.personTypes);
  const resourcesTypes = useSelector((s) => s.resourcesTypes);

  useEffect(() => {
    if (column !== null) {
      const newCustomValue = column.customValue || '';
      const newRegexp = column.regexp || '';
      const newPrefixText = column.prefixText || '';
      setColumnObjValue({ value: column.value, label: columns[column.value] });
      setColumnValue(column.value);
      setProperty(column.property);
      setCustomValue(newCustomValue);
      setRegexp(newRegexp);
      setPrefixText(newPrefixText);
    }
  }, [column, columns]);

  if (columns.indexOf('Add custom value') === -1) {
    columns.push('Add custom value');
  }

  const options = columns.map((c, i) => ({ value: i, label: c }));

  const updateValues = ({
    columnVal = null,
    propertyVal = null,
    customVal = null,
    propertyType = null,
    regexpVal = null,
    prefixTextVal = null,
  }) => {
    const newColumnVal = columnVal !== null ? columnVal : columnValue;
    const newPropertyVal = propertyVal !== null ? propertyVal : property;
    const newCustomVal = customVal !== null ? customVal : '';
    const newPropertyType = propertyType !== null ? propertyType : columnType;
    const newRegexpVal = regexpVal !== null ? regexpVal : regexp;
    const newPrefixTextVal =
      prefixTextVal !== null ? prefixTextVal : prefixText;
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
    if (regexpVal !== null) {
      setRegexp(regexpVal);
    }
    if (prefixTextVal !== null) {
      setPrefixText(prefixTextVal);
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
      regexp: newRegexpVal,
      prefixText: newPrefixTextVal,
    };
    update(index, columnUpdate);
  };

  const handleChange = (option) => {
    setColumnObjValue(option);
    updateValues({ columnVal: option.value });
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

  const prefixTextBtnColor = prefixTextActive ? 'success' : 'secondary';
  const prefixTextValueBlock = prefixTextActive ? (
    <FormGroup>
      <Input
        type="text"
        name="prefix-text"
        placeholder="Enter prefix text"
        value={prefixText}
        onChange={(e) => updateValues({ prefixTextVal: e.target.value })}
      />
    </FormGroup>
  ) : (
    []
  );

  const regexpBtnColor = regexpActive ? 'success' : 'secondary';

  const regexpBlock = regexpActive ? (
    <FormGroup>
      <Input
        type="text"
        name="regexp"
        placeholder="Enter regular expression"
        value={regexp}
        onChange={(e) => updateValues({ regexpVal: e.target.value })}
      />
    </FormGroup>
  ) : (
    []
  );

  const toggleRegexp = () => {
    if (regexpActive) {
      updateValues({ regexpVal: '' });
    }
    setRegexpActive(!regexpActive);
  };

  const togglePrefixText = () => {
    if (prefixTextActive) {
      updateValues({ prefixText: '' });
    }
    setPrefixTextActive(!prefixTextActive);
  };

  useEffect(() => {
    if (
      column !== null &&
      typeof column.regexp !== 'undefined' &&
      column.regexp !== ''
    ) {
      toggleRegexp();
    }
    if (
      column !== null &&
      typeof column.prefixText !== 'undefined' &&
      column.prefixText !== ''
    ) {
      togglePrefixText();
    }
    /* eslint-disable-next-line */
  }, []);
  return (
    <div className="row">
      <div className="col-5">
        <FormGroup>
          <Select
            value={columnObjValue}
            onChange={(o) => handleChange(o)}
            options={options}
          />
        </FormGroup>
      </div>
      <div className="col-5">
        <FormGroup className="import-plan-rule-input-group">
          <EntityProperties
            properties={properties}
            property={property}
            setProperty={updateValues}
          />
          <Button
            className="add-regexp"
            active={regexpActive}
            size="sm"
            outline
            color={regexpBtnColor}
            onClick={() => toggleRegexp()}
            title="Add regular expression match"
          >
            <i className="fa fa-asterisk" />
          </Button>
          <Button
            className="add-prefix-text"
            active={prefixTextActive}
            size="sm"
            outline
            color={prefixTextBtnColor}
            onClick={() => togglePrefixText()}
            title="Add prefix text"
          >
            <i className="fa fa-plus" />
          </Button>
        </FormGroup>
        {customValueBlock}
        {regexpBlock}
        {prefixTextValueBlock}
      </div>
      <div className="col-2">{removeBlockElem}</div>
    </div>
  );
};

ColumnEntity.defaultProps = {
  column: null,
};
ColumnEntity.propTypes = {
  index: PropTypes.number.isRequired,
  columns: PropTypes.array.isRequired,
  column: PropTypes.object,
  update: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  properties: PropTypes.array.isRequired,
};

export default ColumnEntity;
