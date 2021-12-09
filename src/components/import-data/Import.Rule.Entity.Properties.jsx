import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';

const EntityProperties = (props) => {
  const { properties, property, setProperty } = props;
  const options = properties.map((p) => (
    <option key={p.label} value={p.label} type={p.type}>
      {p.label}
    </option>
  ));
  options.push(
    <option key="condition" value="condition" type="condition">
      only add if value in cell
    </option>
  );
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
        setProperty({
          propertyVal: e.target.value,
          propertyType: e.target.selectedOptions[0].getAttribute('type'),
        })
      }
    >
      {options}
    </Input>
  );
};
EntityProperties.propTypes = {
  properties: PropTypes.array.isRequired,
  property: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  setProperty: PropTypes.func.isRequired,
};

export default EntityProperties;
