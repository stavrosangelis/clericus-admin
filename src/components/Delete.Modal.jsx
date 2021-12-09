import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import PropTypes from 'prop-types';

import { deleteData } from '../helpers';

const DeleteModal = (props) => {
  // props
  const { label, path, params, visible, toggle, update, hideModal } = props;

  // state
  const [error, setError] = useState(false);
  const [errorHTML, setErrorHTML] = useState([]);

  const deleteFn = async () => {
    const responseData = await deleteData(path, params);
    if (responseData.status) {
      setError(false);
      setErrorHTML([]);
      toggle();
      update();
      if (hideModal !== null) {
        hideModal();
      }
    } else {
      const errorMsg = responseData.msg;
      const errorText =
        typeof errorMsg === 'string' ? (
          <div>{errorMsg}</div>
        ) : (
          errorMsg.map((e, i) => {
            const key = `a${i}`;
            return <div key={key}>{e}</div>;
          })
        );
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
      <ModalFooter className="text-left">
        <Button
          className="pull-right"
          color="danger"
          size="sm"
          outline
          onClick={() => deleteFn()}
        >
          <i className="fa fa-trash-o" /> Delete
        </Button>
        <Button color="secondary" size="sm" onClick={() => toggle()}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
  return deleteMenuItemModal;
};
DeleteModal.defaultProps = {
  _id: null,
  label: '',
  path: '',
  params: {},
  visible: false,
  toggle: () => {},
  update: () => {},
  hideModal: null,
};
DeleteModal.propTypes = {
  _id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  label: PropTypes.string,
  path: PropTypes.string,
  params: PropTypes.object,
  visible: PropTypes.bool,
  toggle: PropTypes.func,
  update: PropTypes.func,
  hideModal: PropTypes.func,
};
export default DeleteModal;
