import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import PropTypes from 'prop-types';

function DeleteModal(props) {
  const { visible, toggleFn, itemState, deleteFn } = props;
  return (
    <Modal isOpen={visible} toggle={toggleFn}>
      <ModalHeader toggle={toggleFn}>Delete Item</ModalHeader>
      <ModalBody>
        The item &quot;{itemState.label}&quot; will be deleted.
        <br />
        All related <b>Resources</b> and <b>People</b> will also be deleted.
        <br />
        Related <b>Events</b> and <b>Organisations</b> will not be deleted.
        <br />
        Continue?
      </ModalBody>
      <ModalFooter className="text-end">
        <Button
          className="pull-left"
          size="sm"
          color="secondary"
          onClick={toggleFn}
        >
          Cancel
        </Button>
        <Button size="sm" color="danger" outline onClick={() => deleteFn()}>
          <i className="fa fa-trash" /> Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
}
DeleteModal.defaultProps = {
  visible: false,
  toggleFn: () => {},
  itemState: null,
  deleteFn: () => {},
};
DeleteModal.propTypes = {
  visible: PropTypes.bool,
  toggleFn: PropTypes.func,
  itemState: PropTypes.object,
  deleteFn: PropTypes.func,
};
export default DeleteModal;
