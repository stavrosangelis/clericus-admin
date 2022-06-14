import React from 'react';
import { Alert } from 'reactstrap';
import PropTypes from 'prop-types';

function Notification(props) {
  const { color, visible, content } = props;
  return (
    <div style={{ position: 'relative', display: 'block' }}>
      <Alert color={color} isOpen={visible} className="notification">
        {content}
      </Alert>
    </div>
  );
}
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
