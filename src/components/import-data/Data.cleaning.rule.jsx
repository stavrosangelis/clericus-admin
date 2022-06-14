import React, { useState, useEffect } from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';
import ColumnEntities from './Rule.Column.Entities';
/* rule example
  {
    type: 1.unique values
    columns: [{"value":1,"label":"[B] Surname"}],
    entityType: '',
  }
*/

function Rule(props) {
  // props
  const { columns, ruleValues, updateValues } = props;
  // state
  const [type, setType] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [entityType, setEntityType] = useState('');

  useEffect(() => {
    setType(ruleValues.type);
    setSelectedColumns(ruleValues.columns);
    setEntityType(ruleValues.entityType);
  }, [ruleValues]);

  const updateType = (e) => {
    const { target } = e;
    const { value } = target;
    setType(value);
    const copyValues = { ...ruleValues };
    copyValues.type = value;
    updateValues(copyValues);
  };

  const updateEntityType = (e) => {
    const { target } = e;
    const { value } = target;
    setEntityType(value);
    const copyValues = { ...ruleValues };
    copyValues.entityType = value;
    updateValues(copyValues);
  };

  const select2Change = (value) => {
    setSelectedColumns(value);
    const copyValues = { ...ruleValues };
    copyValues.columns = value;
    updateValues(copyValues);
  };

  const options = columns.map((c, i) => ({ value: i, label: c }));

  const updateSelectedColumns = (idx, value) => {
    const copyValues = { ...ruleValues };
    copyValues.columns[idx] = value;
    updateValues(copyValues);
  };

  const removeSelectedColumns = (idx) => {
    const copyValues = { ...ruleValues };
    if (copyValues.columns[idx]) {
      copyValues.columns.splice(idx, 1);
    }
    updateValues(copyValues);
  };

  let columnsBlock = [];
  if (type === 'unique' || type === 'wf-dates') {
    columnsBlock = (
      <div className="row">
        <div className="col">
          <FormGroup>
            <Label>Select columns</Label>
            <Select
              name="selectedColumns"
              value={selectedColumns}
              onChange={select2Change}
              options={options}
              isMulti
            />
          </FormGroup>
        </div>
      </div>
    );
  }
  if (type === 'db-entries') {
    columnsBlock = [
      <div className="row" key="entity-type">
        <div className="col-6" key="entity-type">
          <FormGroup>
            <Label>Select entity type</Label>
            <Input
              type="select"
              name="entityType"
              value={entityType}
              onChange={(e) => updateEntityType(e)}
            >
              <option value="">- select entity type -</option>
              <option value="Event">Event</option>
              <option value="Organisation">Organisation</option>
              <option value="Person">Person</option>
              <option value="Resource">Resource</option>
              <option value="Spatial">Spatial</option>
              <option value="Temporal">Temporal</option>
            </Input>
          </FormGroup>
        </div>
      </div>,
    ];
    if (entityType !== '') {
      columnsBlock.push(
        <ColumnEntities
          type={entityType}
          columns={columns}
          key="columns-association"
          selectedColumns={selectedColumns}
          update={updateSelectedColumns}
          remove={removeSelectedColumns}
        />
      );
    }
  }
  return (
    <div>
      <div className="row">
        <div className="col-4">
          <FormGroup>
            <Label>Type</Label>
            <Input
              name="type"
              type="select"
              value={type}
              onChange={(e) => updateType(e)}
            >
              <option value="">-- select type --</option>
              <option value="unique">Unique Values</option>
              <option value="db-entries">Identify DB entries</option>
              <option value="wf-dates">Well-formed Dates</option>
            </Input>
          </FormGroup>
        </div>
      </div>
      {columnsBlock}
    </div>
  );
}

Rule.defaultProps = {
  columns: [],
  ruleValues: {},
  updateValues: null,
};
Rule.propTypes = {
  columns: PropTypes.array,
  ruleValues: PropTypes.object,
  updateValues: PropTypes.func,
};

export default Rule;
