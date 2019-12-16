import React from 'react';
import { Alert } from 'reactstrap';


const Notification = (props) => {
  let color = "info";
  if (typeof props.color!=="undefined") {
    color = props.color;
  }
  return (
    <Alert color={color} isOpen={props.visible} className="notification">{props.content}</Alert>
  )
}

export default Notification;
