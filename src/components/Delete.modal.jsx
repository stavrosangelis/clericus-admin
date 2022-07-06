import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import PropTypes from 'prop-types';

import { deleteData } from '../helpers';

function DeleteModal(props) {
  // props
  const { label, path, params, visible, toggle, update, hideModal } = props;

  // state
  const [error, setError] = useState(false);
  const [errorHTML, setErrorHTML] = useState([]);

  const deleteFn = async () => {
    const responseData = await deleteData(path, params);
    const { status, error: rError } = responseData;
    if (status) {
      setError(false);
      setErrorHTML([]);
      toggle();
      update();
      if (hideModal !== null) {
        hideModal();
      }
    } else {
      const errorText = rError.map((e, i) => {
        const key = `a${i}`;
        return <div key={key}>{e}</div>;
      });
      setError(true);
      setErrorHTML(errorText);
    }
  };
  const errorClass = !error ? ' hidden' : '';
  const errorOutput = (
    <div className={`error-container${errorClass}`}>{errorHTML}</div>
  );
  const deleteMenuItemModal = (
    <Modal isOpen={visible} toggle={() => toggle()}>
      <ModalHeader toggle={() => toggle()}>
        Delete &quot;{label}&quot;
      </ModalHeader>
      <ModalBody>
        {errorOutput} &quot;<b>{label}</b>&quot; will be deleted. Continue?
      </ModalBody>
      <ModalFooter className="justify-content-between">
        <Button
          color="secondary"
          size="sm"
          onClick={() => toggle()}
          aria-label="Delete modal cancel"
        >
          Cancel
        </Button>
        <Button
          color="danger"
          size="sm"
          outline
          onClick={() => deleteFn()}
          aria-label="Delete modal submit"
        >
          <i className="fa fa-trash-o" /> Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
  return deleteMenuItemModal;
}

DeleteModal.defaultProps = {
  label: '',
  path: '',
  params: {},
  visible: false,
  toggle: () => {},
  update: () => {},
  hideModal: null,
};
DeleteModal.propTypes = {
  label: PropTypes.string,
  path: PropTypes.string,
  params: PropTypes.object,
  visible: PropTypes.bool,
  toggle: PropTypes.func,
  update: PropTypes.func,
  hideModal: PropTypes.func,
};
export default DeleteModal;
