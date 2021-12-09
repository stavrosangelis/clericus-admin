import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Input,
  Label,
  Collapse,
  Button,
  Card,
  CardTitle,
  CardBody,
} from 'reactstrap';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { putData, deleteData, returnLetter } from '../../helpers';

const ImportPlanRulesRelations = (props) => {
  // props
  const { columns, _id, items, reloadFn, rules } = props;

  // redux
  const eventEntity = useSelector((s) => s.eventEntity) || null;
  const organisationEntity = useSelector((s) => s.organisationEntity) || null;
  const personEntity = useSelector((s) => s.personEntity) || null;
  const resourceEntity = useSelector((s) => s.resourceEntity) || null;
  const spatialEntity = useSelector((s) => s.spatialEntity) || null;
  const temporalEntity = useSelector((s) => s.temporalEntity) || null;

  // state
  const [open, setOpen] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updateBtn, setUpdateBtn] = useState(
    <span>
      <i className="fa fa-save" /> Save
    </span>
  );
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const [selectedSourceNode, setSelectedSourceNode] = useState(null);
  const [selectedTargetNode, setSelectedTargetNode] = useState(null);
  const [selectedRelation, setSelectedRelation] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedRoleCustom, setSelectedRoleCustom] = useState('');
  const [index, setIndex] = useState(-1);

  const toggle = () => {
    setOpen(!open);
  };

  const toggleModal = (indexParam = null) => {
    if (indexParam !== null && indexParam > -1) {
      setIndex(indexParam);
      const item = items[indexParam];

      const newSelectedSourceNodeFind = rules.find((r) => r._id === item.srcId);
      const newSelectedTargetNodeFind = rules.find(
        (r) => r._id === item.targetId
      );
      const newSelectedSourceNode = {
        value: item.srcId,
        label: newSelectedSourceNodeFind.label,
        type: item.srcType,
      };
      const newSelectedTargetNode = {
        value: item.srcId,
        label: newSelectedTargetNodeFind.label,
        type: item.targetType,
      };
      const newRole =
        typeof item.role !== 'undefined' && item.role !== ''
          ? { value: item.role, label: columns[item.role] }
          : null;
      const newRoleCustom = item.roleCustom || '';
      setSelectedSourceNode(newSelectedSourceNode);
      setSelectedTargetNode(newSelectedTargetNode);
      setSelectedRelation({
        value: item.relationLabel,
        label: item.relationLabel,
      });
      setSelectedRole(newRole);
      setSelectedRoleCustom(newRoleCustom);
    } else {
      setSelectedSourceNode(null);
      setSelectedTargetNode(null);
      setSelectedRelation(null);
      setSelectedRole(null);
      setSelectedRoleCustom('');
    }
    setModalVisible(!modalVisible);
  };

  const handleChange = (option, type) => {
    switch (type) {
      case 'source':
        setSelectedSourceNode(option);
        setSelectedRelation(null);
        break;
      case 'target':
        setSelectedTargetNode(option);
        setSelectedRelation(null);
        break;
      case 'relation':
        setSelectedRelation(option);
        break;
      case 'role':
        setSelectedRole(option);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (redirect) {
      setRedirect(false);
    }
  }, [redirect]);

  const formSubmit = async (e) => {
    e.preventDefault();
    if (saving) {
      return false;
    }
    setSaving(true);
    const relation = {
      srcId: selectedSourceNode.value,
      srcType: selectedSourceNode.type,
      targetId: selectedTargetNode.value,
      targetType: selectedTargetNode.type,
      relationLabel: selectedRelation.label,
    };
    if (selectedRole !== null) {
      relation.role = selectedRole.value;
      if (
        Number(selectedRole.value) === columns.length - 1 &&
        selectedRoleCustom !== ''
      ) {
        relation.roleCustom = selectedRoleCustom;
      }
    }
    const updateData = {
      index,
      relation,
      importId: _id,
    };
    const update = await putData(`import-plan-relation`, updateData);
    if (update.status) {
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Save success{' '}
          <i className="fa fa-check" />
        </span>
      );
      setSaving(false);
      reloadFn();
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

  const removeSelection = async (e) => {
    e.preventDefault();
    const deleteValues = {
      index,
      importId: _id,
    };
    const deleteAction = await deleteData(`import-plan-relation`, deleteValues);
    if (deleteAction.status) {
      reloadFn();
      toggleModal();
    }
  };

  const openBtnActive = open ? ' active' : '';
  const errorContainerClass = errorVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );

  const entitiesOptions = rules.map((i) => {
    if (i.rule) {
      const rule = JSON.parse(i.rule);
      const { entityType: type } = rule;
      return {
        value: i._id,
        label: i.label,
        type,
      };
    }
    return [];
  });
  const itemsOutput = items.map((i, k) => {
    const src = rules.find((r) => r._id === i.srcId);
    const target = rules.find((r) => r._id === i.targetId);
    const key = `${k}.${i.srcId}`;
    return (
      <li key={key}>
        <div
          onClick={() => toggleModal(k)}
          onKeyDown={() => toggleModal(k)}
          role="button"
          tabIndex="0"
        >
          {src.label} <small>[{i.srcType}]</small> - ({i.relationLabel}) -&gt;{' '}
          {target.label} <small>[{i.targetType}]</small>
        </div>
      </li>
    );
  });

  let refTypesListOptions = [];
  if (selectedSourceNode !== null && selectedTargetNode !== null) {
    const { type: sourceType } = selectedSourceNode;
    const { type: targetType } = selectedTargetNode;
    if (sourceType !== null && targetType !== null) {
      let sourceEntity = null;
      switch (sourceType) {
        case 'Event':
          sourceEntity = eventEntity;
          break;
        case 'Organisation':
          sourceEntity = organisationEntity;
          break;
        case 'Person':
          sourceEntity = personEntity;
          break;
        case 'Resource':
          sourceEntity = resourceEntity;
          break;
        case 'Temporal':
          sourceEntity = temporalEntity;
          break;
        case 'Spatial':
          sourceEntity = spatialEntity;
          break;
        default:
          break;
      }
      const properties = sourceEntity.properties.filter(
        (p) => p.entityRef.label === targetType
      );
      refTypesListOptions = properties.map((p) => ({
        value: p.term.label,
        label: p.term.label,
      }));
    }
  }

  const addNewTopBtn =
    items.length > 2 ? (
      <div className="text-right">
        <Button color="info" size="xs" onClick={() => toggleModal()}>
          Add new <i className="fa fa-plus" />
        </Button>
      </div>
    ) : (
      []
    );
  if (columns.indexOf('Add custom value') === -1) {
    columns.push('Add custom value');
  }
  const columnsLength = columns.length;
  const roleOptions =
    selectedRelation !== null
      ? columns.map((c, key) => {
          const label =
            key === columnsLength - 1
              ? c
              : `[${returnLetter(key).toUpperCase()}] ${c}`;
          return {
            value: key,
            label,
          };
        })
      : [];

  const customRole =
    selectedRole !== null &&
    Number(selectedRole.value) === columnsLength - 1 ? (
      <Input
        name="custom-role"
        placeholder="Enter custom role"
        type="text"
        value={selectedRoleCustom}
        className="form-control"
        onChange={(e) => setSelectedRoleCustom(e.target.value)}
      />
    ) : (
      []
    );
  return (
    <div>
      <Card>
        <CardBody>
          <CardTitle onClick={() => toggle()}>
            Import plan rules <b>Relations</b>{' '}
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
            <div className="text-right">
              <Button color="info" size="xs" onClick={() => toggleModal()}>
                Add new <i className="fa fa-plus" />
              </Button>
            </div>
          </Collapse>
        </CardBody>
      </Card>

      <Modal isOpen={modalVisible} toggle={() => toggleModal()}>
        <ModalHeader toggle={() => toggleModal()}>
          Add new Relation between rule Entities
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={formSubmit}>
            {errorContainer}
            <FormGroup>
              <Label>Source Entity</Label>
              <Select
                value={selectedSourceNode}
                onChange={(o) => handleChange(o, 'source')}
                options={entitiesOptions}
              />
            </FormGroup>
            <FormGroup>
              <Label>Target Entity</Label>
              <Select
                value={selectedTargetNode}
                onChange={(o) => handleChange(o, 'target')}
                options={entitiesOptions}
              />
            </FormGroup>
            <FormGroup>
              <Label>Relation</Label>
              <Select
                value={selectedRelation}
                onChange={(o) => handleChange(o, 'relation')}
                options={refTypesListOptions}
              />
            </FormGroup>
            <FormGroup>
              <Label>Role</Label>
              <Select
                isClearable
                value={selectedRole}
                onChange={(o) => handleChange(o, 'role')}
                options={roleOptions}
              />
              {customRole}
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            className="pull-left"
            color="danger"
            outline
            size="sm"
            onClick={(e) => removeSelection(e)}
          >
            <i className="fa fa-trash-o" /> Delete
          </Button>
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
    </div>
  );
};

ImportPlanRulesRelations.propTypes = {
  columns: PropTypes.array.isRequired,
  _id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  rules: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired,
  reloadFn: PropTypes.func.isRequired,
};
export default ImportPlanRulesRelations;
