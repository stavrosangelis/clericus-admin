import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';

import {
  eventProperties,
  organisationProperties,
  personProperties,
  resourceProperties,
  spatialProperties,
  temporalProperties,
} from './entity.properties';

function EntityProperties(props) {
  const { type, property, setProperty } = props;

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
  const options = properties.map((p) => {
    if (
      p.type === 'list' &&
      typeof p.children !== 'undefined' &&
      p.children.length > 0
    ) {
      return p.children.map((c) => (
        <option key={c.label} value={`${p.label}-${c.label}`} type={c.type}>
          {`${p.label}-${c.label}`}
        </option>
      ));
    }
    return (
      <option key={p.label} value={p.label} type={p.type}>
        {p.label}
      </option>
    );
  });
  options.unshift(
    <option key="default" value="" type="">
      - select property -
    </option>
  );
  return (
    <Input
      type="select"
      value={property}
      onChange={(e) =>
        setProperty(
          null,
          e.target.value,
          null,
          e.target.selectedOptions[0].getAttribute('type')
        )
      }
    >
      {options}
    </Input>
  );
}

EntityProperties.defaultProps = {
  type: '',
};
EntityProperties.propTypes = {
  type: PropTypes.string,
  property: PropTypes.string.isRequired,
  setProperty: PropTypes.func.isRequired,
};

export default EntityProperties;
