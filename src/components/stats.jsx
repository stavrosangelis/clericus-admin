import React from 'react';
import PropTypes from 'prop-types';

const Stats = (props) => {
  const { children } = props;
  const stats = [];
  for (let i = 0; i < children.length; i += 1) {
    stats.push(<i className={children[i].i} key={i} />);
    stats.push(` ${children[i].t}`);
    if (i !== children.length - 1) {
      stats.push(<br />);
    }
  }
  return <div className="stats">{stats}</div>;
};

Stats.defaultProps = {
  children: [],
};
Stats.propTypes = {
  children: PropTypes.array,
};

export default Stats;
