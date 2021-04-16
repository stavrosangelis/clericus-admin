import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
  ModalFooter,
  Button,
} from 'reactstrap';
import PropTypes from 'prop-types';

const EditModal = (props) => {
  const {
    visible,
    toggleFn,
    submitFn,
    itemState,
    handleChangeFn,
    resourcesTypes,
    toggleDeleteModalFn,
    editItemUpdateBtn,
  } = props;

  const resourcesTypesOptions = [];
  if (resourcesTypes.length > 0) {
    for (let st = 0; st < resourcesTypes.length; st += 1) {
      const systemType = resourcesTypes[st];
      const systemTypeOption = (
        <option value={systemType._id} key={st}>
          {systemType.label}
        </option>
      );
      resourcesTypesOptions.push(systemTypeOption);
    }
  }
  const { label, systemType, description } = itemState;
  return (
    <Modal isOpen={visible} toggle={toggleFn}>
      <ModalHeader toggle={toggleFn}>Edit Item</ModalHeader>
      <ModalBody>
        <Form onSubmit={submitFn}>
          <FormGroup>
            <Label>Label</Label>
            <Input
              type="text"
              name="label"
              placeholder="Resource label..."
              value={label}
              onChange={(e) => handleChangeFn(e)}
            />
          </FormGroup>
          <FormGroup>
            <Label>Type</Label>
            <Input
              type="select"
              name="systemType"
              onChange={(e) => handleChangeFn(e)}
              value={systemType}
            >
              {resourcesTypesOptions}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label>Description</Label>
            <Input
              type="textarea"
              name="description"
              placeholder="Resource description..."
              value={description}
              onChange={(e) => handleChangeFn(e)}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter className="text-right">
        <Button
          className="pull-left"
          size="sm"
          color="danger"
          outline
          onClick={() => toggleDeleteModalFn()}
        >
          <i className="fa fa-trash" /> Delete
        </Button>
        <Button color="primary" outline onClick={(e) => submitFn(e)} size="sm">
          {editItemUpdateBtn}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
EditModal.defaultProps = {
  visible: false,
  toggleFn: () => {},
  submitFn: () => {},
  itemState: null,
  handleChangeFn: () => {},
  resourcesTypes: [],
  toggleDeleteModalFn: () => {},
  editItemUpdateBtn: null,
};
EditModal.propTypes = {
  visible: PropTypes.bool,
  toggleFn: PropTypes.func,
  submitFn: PropTypes.func,
  itemState: PropTypes.object,
  handleChangeFn: PropTypes.func,
  resourcesTypes: PropTypes.array,
  toggleDeleteModalFn: PropTypes.func,
  editItemUpdateBtn: PropTypes.object,
};
export default EditModal;
