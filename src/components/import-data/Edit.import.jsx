import React, { useCallback, useEffect, useState } from 'react';
import {
  Collapse,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from 'reactstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';
import DeleteModal from '../Delete.modal';
import { getData, putData } from '../../helpers';

function EditImport(props) {
  // props
  const { _id, visible, toggle, reload, items } = props;

  // state
  const [label, setLabel] = useState('');
  const [copyId, setCopyId] = useState(null);
  const [updateBtn, setUpdateBtn] = useState(
    <span>
      <i className="fa fa-save" /> Save
    </span>
  );
  const [saving, setSaving] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [copyFromExistingVisible, setCopyFromExistingVisible] = useState(false);

  const toggleCopy = () => {
    setCopyFromExistingVisible(!copyFromExistingVisible);
  };

  const loadItem = useCallback(async () => {
    if (_id === 'new') {
      setLabel('');
    } else if (_id !== null) {
      const responseData = await getData(`import-plan`, { _id });
      if (responseData.status) {
        const { data } = responseData;
        setLabel(data.label);
      }
    }
  }, [_id]);

  useEffect(() => {
    if (visible) {
      loadItem();
    }
  }, [loadItem, visible, _id]);

  const updateLabel = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setLabel(value);
  };

  const select2Change = (selectedOption) => {
    if (selectedOption === null) {
      setCopyId(null);
    } else {
      setCopyId(selectedOption.value);
    }
  };

  const modalTitle =
    _id !== null && _id !== 'new' ? 'Edit import plan' : 'Add new import plan';
  const errorContainerClass = errorVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );

  const toggleDeleteModal = () => {
    setDeleteModalVisible(!deleteModalVisible);
  };

  const validate = () => {
    if (label === '') {
      setErrorVisible(true);
      setErrorText(<span>Please add a label to continue</span>);
      return false;
    }
    setErrorVisible(false);
    setErrorText([]);
    return true;
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return false;
    }
    if (saving) {
      return false;
    }
    setSaving(true);
    const updateData = {
      label,
    };
    if (_id !== 'new') {
      updateData._id = _id;
    }
    if (copyId !== null) {
      updateData.copyId = copyId;
    }
    const update = await putData(`import-plan`, updateData);
    if (update.status) {
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Save success{' '}
          <i className="fa fa-check" />
        </span>
      );
      setSaving(false);
      reload();
      toggle();
    } else {
      const newErrorText = [];
      for (let i = 0; i < update.errors.length; i += 1) {
        const error = update.errors[i];
        errorText.push(<div key={i}>{error.msg}</div>);
      }
      setErrorText(newErrorText);
      setErrorVisible(true);
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Update error{' '}
          <i className="fa fa-times" />
        </span>
      );
      setSaving(false);
    }
    setTimeout(() => {
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Save
        </span>
      );
    }, 2000);
    return true;
  };

  const deleteBtn =
    _id !== null && _id !== 'new' ? (
      <Button
        color="danger"
        outline
        size="sm"
        onClick={() => toggleDeleteModal()}
        className="pull-left"
      >
        <i className="fa fa-trash" /> Delete
      </Button>
    ) : (
      []
    );

  let copyFromExisting = [];
  if ((_id === null || _id === 'new') && items.length > 0) {
    const copyValues = items.map((i) => ({ value: i._id, label: i.label }));
    const copyActive = copyFromExistingVisible ? ' active' : '';
    copyFromExisting = (
      <div>
        <Button
          size="sm"
          color="secondary"
          outline
          onClick={() => toggleCopy()}
        >
          Copy from existing{' '}
          <i className={`collapse-toggle fa fa-angle-left${copyActive}`} />
        </Button>
        <Collapse isOpen={copyFromExistingVisible}>
          <FormGroup style={{ paddingTop: 10 }}>
            <Select
              onChange={(selectedOption) => select2Change(selectedOption)}
              options={copyValues}
              isClearable
            />
          </FormGroup>
        </Collapse>
      </div>
    );
  }

  return (
    <div>
      <Modal isOpen={visible} toggle={() => toggle(null)}>
        <ModalHeader toggle={() => toggle(null)}>{modalTitle}</ModalHeader>
        <ModalBody>
          <Form onSubmit={formSubmit}>
            {errorContainer}
            <FormGroup>
              <Label>Label</Label>
              <Input
                type="text"
                name="label"
                placeholder="The label of the new import..."
                value={label}
                onChange={updateLabel}
              />
            </FormGroup>
            {copyFromExisting}
          </Form>
        </ModalBody>
        <ModalFooter>
          {deleteBtn}
          <Button
            color="primary"
            outline
            size="sm"
            onClick={(e) => formSubmit(e)}
          >
            {updateBtn}
          </Button>
        </ModalFooter>
      </Modal>
      <DeleteModal
        _id={_id}
        label={label}
        path="import-plan"
        params={{ _id }}
        visible={deleteModalVisible}
        toggle={toggleDeleteModal}
        update={reload}
        hideModal={toggle}
      />
    </div>
  );
}
EditImport.defaultProps = {
  _id: null,
  items: [],
};

EditImport.propTypes = {
  visible: PropTypes.bool.isRequired,
  _id: PropTypes.string,
  toggle: PropTypes.func.isRequired,
  reload: PropTypes.func.isRequired,
  items: PropTypes.array,
};
export default EditImport;
