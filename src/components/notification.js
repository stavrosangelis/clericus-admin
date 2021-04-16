import React from 'react';
import { Alert } from 'reactstrap';
import PropTypes from 'prop-types';

const Notification = (props) => {
  const { color, visible, content } = props;
  return (
    <Alert color={color} isOpen={visible} className="notification">
      {content}
    </Alert>
  );
};
Notification.defaultProps = {
  color: 'info',
  visible: false,
  content: null,
};

Notification.propTypes = {
  color: PropTypes.string,
  visible: PropTypes.bool,
  content: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
export default Notification;
