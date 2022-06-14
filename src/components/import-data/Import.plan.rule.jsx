import React, { useState, useEffect } from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import PropTypes from 'prop-types';
import ColumnEntities from './Import.Rule.Column.Entities';
/* rule example
  {
    columns: [{"value":1,"label":"[B] Surname"}],
    entityType: '',
  }
*/

function Rule(props) {
  // props
  const { columns, ruleValues, updateValues } = props;
  // state
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [entityType, setEntityType] = useState('');

  useEffect(() => {
    const {
      columns: newSelectedColumns = [],
      entityType: newSelectedEntity = '',
    } = ruleValues;
    setSelectedColumns(newSelectedColumns);
    setEntityType(newSelectedEntity);
  }, [ruleValues]);

  const updateEntityType = (e) => {
    const { target } = e;
    const { value } = target;
    setEntityType(value);
    const copyValues = { ...ruleValues };
    copyValues.entityType = value;
    updateValues(copyValues);
  };

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

  return (
    <div>
      <div className="row">
        <div className="col-6">
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
      </div>
      <div className="row">
        <div className="col-12">
          <ColumnEntities
            type={entityType}
            columns={columns}
            key="columns-association"
            selectedColumns={selectedColumns}
            update={updateSelectedColumns}
            remove={removeSelectedColumns}
          />
        </div>
      </div>
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
