import React from 'react';
import { Button } from 'reactstrap';
import cx from 'classnames';
import PropTypes from 'prop-types';

const CustomButton = (props) => {
  const {
    simple,
    round,
    icon,
    neutral,
    leftLabel,
    rightLabel,
    wd,
    link,
    fab,
    className,
    children,
    // ...rest,
  } = props;

  let btnClasses = cx({
    'btn-simple': simple,
    'btn-round': round,
    'btn-icon': icon,
    'btn-neutral': neutral,
    'btn-wd': wd,
    'btn-link': link,
    'btn-fab': fab,
  });

  if (className !== undefined) {
    btnClasses += ` ${className}`;
  }

  // <Button className={btnClasses} {...rest}>
  return (
    <Button className={btnClasses}>
      {leftLabel ? (
        <span className="btn-label">
          <i className={leftLabel} />{' '}
        </span>
      ) : null}
      {children}
      {rightLabel ? (
        <span className="btn-label btn-label-right">
          <i className={rightLabel} />{' '}
        </span>
      ) : null}
    </Button>
  );
};

CustomButton.defaultProps = {
  simple: '',
  round: '',
  icon: '',
  neutral: '',
  wd: '',
  link: '',
  fab: '',
  // this is an icon
  leftLabel: '',
  // this is an icon
  rightLabel: '',
  className: '',
  children: [],
};

CustomButton.propTypes = {
  simple: PropTypes.bool,
  round: PropTypes.bool,
  icon: PropTypes.bool,
  neutral: PropTypes.bool,
  wd: PropTypes.bool,
  link: PropTypes.bool,
  fab: PropTypes.bool,
  // this is an icon
  leftLabel: PropTypes.string,
  // this is an icon
  rightLabel: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.array,
};

export default CustomButton;
