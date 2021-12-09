import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';

const EntityPropertiesChildren = (props) => {
  const { parent = false, properties, property, setProperty, index } = props;
  const options = properties.map((p) => (
    <option key={p.label} value={p.label} type={p.type}>
      {p.label}
    </option>
  ));
  options.unshift(
    <option key="default" value="" type="">
      - select property -
    </option>
  );

  const output = parent ? (
    <Input
      type="select"
      value={property}
      onChange={(e) => {
        const propertyVal = parent ? -1 : e.target.value;
        setProperty({
          propertyVal,
          propertyType: e.target.selectedOptions[0].getAttribute('type'),
          idx: index,
        });
      }}
    >
      {options}
    </Input>
  ) : (
    <div className="input-rule-child">{property}</div>
  );
  return output;
};
EntityPropertiesChildren.defaultProps = {
  index: -1,
  parent: false,
};
EntityPropertiesChildren.propTypes = {
  index: PropTypes.number,
  parent: PropTypes.bool,
  properties: PropTypes.array.isRequired,
  property: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  setProperty: PropTypes.func.isRequired,
};

export default EntityPropertiesChildren;
