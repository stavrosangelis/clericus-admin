import React from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, Label } from 'reactstrap';
import ColumnEntity from './Import.Rule.Column.Entity';

import {
  eventProperties,
  organisationProperties,
  personProperties,
  resourceProperties,
  spatialProperties,
  temporalProperties,
} from './entity.properties';

function ColumnEntities(props) {
  const { type, columns, selectedColumns, update, remove } = props;

  const defaultVal = { value: 0, label: columns[0], property: '' };

  const addMore = () => {
    const index = selectedColumns.length;
    update(index, defaultVal);
  };

  let properties = [];
  switch (type) {
    case 'Event':
      properties = eventProperties;
      break;
    case 'Organisation':
      properties = organisationProperties;
      break;
    case 'Person':
      properties = personProperties;
      break;
    case 'Resource':
      properties = resourceProperties;
      break;
    case 'Spatial':
      properties = spatialProperties;
      break;
    case 'Temporal':
      properties = temporalProperties;
      break;
    default:
      properties = [];
  }

  const output = selectedColumns.map((c, i) => {
    const { property } = c;
    const newPropertyDetails =
      properties.find((p) => p.label === property) || null;
    const key = `c${i}`;
    return (
      <ColumnEntity
        index={i}
        key={key}
        type={type}
        columns={columns}
        column={c}
        update={update}
        remove={remove}
        properties={properties}
        propertyDetails={newPropertyDetails}
      />
    );
  });

  return (
    <div>
      <div className="row">
        <div className="col-6">
          <FormGroup>
            <Label>Select columns</Label>
          </FormGroup>
        </div>
        <div className="col-6">
          <FormGroup>
            <Label>Assign column to property</Label>
          </FormGroup>
        </div>
      </div>
      {output}
      <div className="text-center">
        <Button color="info" onClick={() => addMore()}>
          Add column/property pair <i className="fa fa-plus" />
        </Button>
      </div>
    </div>
  );
}

ColumnEntities.defaultProps = {
  type: '',
};
ColumnEntities.propTypes = {
  type: PropTypes.string,
  selectedColumns: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  update: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
};

export default ColumnEntities;
