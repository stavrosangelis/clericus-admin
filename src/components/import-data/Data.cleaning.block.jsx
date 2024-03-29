import React, { useCallback, useEffect, useState, useRef } from 'react';
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
import { putData, getData } from '../../helpers';

function DataCleaning(props) {
  // props
  const { _id, updateLength } = props;

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
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const [newId, setNewId] = useState(null);

  const mounted = useRef(null);
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
      navigate(`/data-cleaning/${_id}/${newId}`);
      setRedirect(false);
    }
  }, [redirect, newId, _id, navigate]);

  const load = useCallback(async () => {
    const responseData = await getData(`data-cleaning`, { importPlanId: _id });
    const { data = [] } = responseData.data;
    return data;
  }, [_id]);

  useEffect(() => {
    mounted.current = true;
    const loadData = async () => {
      const data = await load();
      if (mounted.current) {
        setLoading(false);
        setItems(data);
        updateLength(data.length);
      }
    };
    if (loading) {
      loadData();
    }
    return () => {
      mounted.current = false;
    };
  }, [loading, load, updateLength]);

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
    const update = await putData(`data-cleaning-instance`, updateData);
    if (update.status) {
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Save success{' '}
          <i className="fa fa-check" />
        </span>
      );
      setSaving(false);
      setLoading(true);
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
      <Link to={`/data-cleaning/${_id}/${i._id}`}>{i.label}</Link>
    </li>
  ));

  return (
    <>
      <Card>
        <CardBody>
          <CardTitle onClick={() => toggle()}>
            Data cleaning / disambiguation
            <Button type="button" className="pull-right" size="xs" outline>
              <i
                className={`collapse-toggle fa fa-angle-left${openBtnActive}`}
              />
            </Button>
          </CardTitle>
          <Collapse isOpen={open}>
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
          Add new Data cleaning / disambiguation
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

DataCleaning.propTypes = {
  _id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  updateLength: PropTypes.func.isRequired,
};
export default DataCleaning;
