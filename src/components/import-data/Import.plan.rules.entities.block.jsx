import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Collapse,
  Button,
  Card,
  CardTitle,
  CardBody,
} from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { putData } from '../../helpers';

function ImportPlanRulesEntities(props) {
  // props
  const { _id, items, reloadFn } = props;

  // state
  const [open, setOpen] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState('');
  const [updateBtn, setUpdateBtn] = useState(
    <span>
      <i className="fa fa-save" /> Save
    </span>
  );
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const [newId, setNewId] = useState(null);

  const navigate = useNavigate();

  const toggle = () => {
    setOpen(!open);
  };

  const toggleModal = () => {
    setLabel('');
    setModalVisible(!modalVisible);
  };

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setLabel(value);
  };

  useEffect(() => {
    if (redirect && newId !== null) {
      navigate(`/import-plan-rule-entity/${_id}/${newId}`);
      setRedirect(false);
    }
  }, [redirect, _id, newId, navigate]);

  const formSubmit = async (e) => {
    e.preventDefault();
    if (saving) {
      return false;
    }
    setSaving(true);
    const updateData = {
      label,
      importPlanId: _id,
    };
    const update = await putData(`import-plan-rule`, updateData);
    if (update.status) {
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Save success{' '}
          <i className="fa fa-check" />
        </span>
      );
      setSaving(false);
      reloadFn();
      setLabel('');
      const updatedId = update?.data?._id || null;
      setNewId(updatedId);
      setRedirect(true);
      toggleModal();
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

  const openBtnActive = open ? ' active' : '';
  const errorContainerClass = errorVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );

  const itemsOutput = items.map((i) => (
    <li key={i._id}>
      <Link to={`/import-plan-rule-entity/${_id}/${i._id}`}>{i.label}</Link>
    </li>
  ));

  const addNewTopBtn =
    items.length > 2 ? (
      <div className="text-end">
        <Button color="info" size="xs" onClick={() => toggleModal()}>
          Add new <i className="fa fa-plus" />
        </Button>
      </div>
    ) : (
      []
    );

  return (
    <>
      <Card>
        <CardBody>
          <CardTitle onClick={() => toggle()}>
            Import plan rules <b>Entities</b>{' '}
            <small>[{itemsOutput.length}]</small>
            <Button type="button" className="pull-right" size="xs" outline>
              <i
                className={`collapse-toggle fa fa-angle-left${openBtnActive}`}
              />
            </Button>
          </CardTitle>
          <Collapse isOpen={open}>
            {addNewTopBtn}
            <ol className="links-list">{itemsOutput}</ol>
            <div className="text-end">
              <Button color="info" size="xs" onClick={() => toggleModal()}>
                Add new <i className="fa fa-plus" />
              </Button>
            </div>
          </Collapse>
        </CardBody>
      </Card>

      <Modal isOpen={modalVisible} toggle={() => toggleModal()}>
        <ModalHeader toggle={() => toggleModal()}>
          Add new rule Entity
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={formSubmit}>
            {errorContainer}
            <FormGroup>
              <Label>Label</Label>
              <Input
                type="text"
                name="label"
                placeholder="The label of the new Data cleaning / disambiguation ..."
                value={label}
                onChange={(e) => handleChange(e)}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
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
    </>
  );
}

ImportPlanRulesEntities.propTypes = {
  _id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  items: PropTypes.array.isRequired,
  reloadFn: PropTypes.func.isRequired,
};
export default ImportPlanRulesEntities;
