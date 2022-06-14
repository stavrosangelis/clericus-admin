import React, { useState } from 'react';
import axios from 'axios';
import {
  CardTitle,
  Collapse,
  Button,
  Form,
  FormGroup,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from 'reactstrap';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { addGenericReference } from '../../helpers';
import { loadDefaultEntities } from '../../redux/actions';

const { REACT_APP_APIPATH: APIPath } = process.env;

export default function Properties(props) {
  const dispatch = useDispatch();
  const { _id, entity, entities, reload, taxonomyTerms } = props;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingBtn, setSavingBtn] = useState(
    <span>
      <i className="fa fa-save" /> Save
    </span>
  );
  const [error, setError] = useState({
    visible: false,
    text: null,
  });
  const [relation, setRelation] = useState({ value: '', label: '--' });
  const [referencedEntity, setReferencedEntity] = useState({
    value: '',
    label: '--',
  });

  const togglePropertyModal = (property = null) => {
    if (error.visible) {
      setError({
        visible: false,
        text: null,
      });
    }
    setModalVisible(!modalVisible);
    if (property !== null) {
      setSelectedProperty(property);
      const { term, entityRef } = property;
      const { label: tLabel } = term;
      const { _id: eValue, label: eLabel } = entityRef;
      setReferencedEntity({ value: eValue, label: eLabel });
      const newRelation =
        taxonomyTerms.find(
          (t) => t.labelId === tLabel || t.inverseLabelId === tLabel
        ) || null;
      if (newRelation !== null) {
        const {
          _id: rValue,
          label: rLabel,
          inverseLabel: rInverseLabel,
        } = newRelation;
        setRelation({ value: rValue, label: `${rLabel}/${rInverseLabel}` });
      }
    }
  };

  const toggleProperties = () => {
    setPropertiesOpen(!propertiesOpen);
  };

  const select2Change = (name, value) => {
    if (name !== '') {
      switch (name) {
        case 'relation':
          setRelation(value);
          break;
        case 'referencedEntity':
          setReferencedEntity(value);
          break;
        default:
          break;
      }
    }
  };

  const list = () => {
    const output = [];
    if (entity !== null) {
      const { properties } = entity;
      const { length } = properties;
      for (let i = 0; i < length; i += 1) {
        const property = properties[i];
        const { _id: pId, entityRef, term } = property;
        const { label: eLabel } = entityRef;
        const { label: tLabel } = term;
        const item = (
          <li key={pId}>
            <div
              onClick={() => togglePropertyModal(property)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="toggle property modal"
            >
              <span className="property-term">{tLabel}</span>{' '}
              <span className="property-entity">{eLabel}</span>
            </div>
          </li>
        );
        output.push(item);
      }
      if (length > 0) {
        return <ul className="entity-properties">{output}</ul>;
      }
    }
    return [];
  };

  const propertySubmit = async (e = null) => {
    if (e !== null) {
      e.preventDefault();
    }
    if (!saving) {
      setSaving(true);
      setSavingBtn(
        <span>
          <i className="fa fa-save" /> <i>Saving...</i>{' '}
          <Spinner size="sm" color="info" />
        </span>
      );
      if (relation.value === '') {
        setSaving(false);
        setSavingBtn(
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        );
        setError({
          visible: true,
          text: <div>Please select a Relation to continue</div>,
        });
        setTimeout(() => {
          setSavingBtn(
            <span>
              <i className="fa fa-save" /> Save
            </span>
          );
        }, 2000);
        return false;
      }
      if (referencedEntity.value === '') {
        setSaving(false);
        setSavingBtn(
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        );
        setError({
          visible: true,
          text: <div>Please select a Referenced Entity to continue</div>,
        });
        setTimeout(() => {
          setSavingBtn(
            <span>
              <i className="fa fa-save" /> Save
            </span>
          );
        }, 2000);
        return false;
      }

      const newReference = {
        items: [
          { _id, type: 'Entity' },
          { _id: referencedEntity.value, type: 'Entity' },
        ],
        taxonomyTermId: relation.value,
      };
      const addReference = await addGenericReference(newReference);
      setSaving(false);
      const { data } = addReference;
      const { status } = data;
      if (status) {
        setSavingBtn(
          <span>
            <i className="fa fa-save" /> Save
          </span>
        );
        dispatch(loadDefaultEntities());
        reload();
        togglePropertyModal();
      } else {
        const { error: refError } = addReference;
        const errorText = refError.map((er) => <div key={er}>{er}</div>);
        setSavingBtn(
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        );
        setError({
          visible: true,
          text: errorText,
        });
        setTimeout(() => {
          setSavingBtn(
            <span>
              <i className="fa fa-save" /> Save
            </span>
          );
        }, 2000);
      }
    }
    return true;
  };

  const propertiesOpenActive = propertiesOpen ? ' active' : '';

  const propertiesList = list();

  const propertyModalTitle =
    selectedProperty !== null
      ? `Edit property ${selectedProperty.label}`
      : 'Add new property';

  const propertyErrorContainer = error.visible ? (
    <div className="error-container">{error.text}</div>
  ) : null;

  const deleteProperty = async () => {
    const fromReference = {
      items: [
        { _id, type: 'Entity' },
        { _id: referencedEntity.value, type: 'Entity' },
      ],
      taxonomyTermId: relation.value,
    };
    const toReference = {
      items: [
        { _id: referencedEntity.value, type: 'Entity' },
        { _id, type: 'Entity' },
      ],
      taxonomyTermId: relation.value,
    };
    const fromResponseData = await axios({
      method: 'delete',
      url: `${APIPath}reference`,
      crossDomain: true,
      data: fromReference,
    })
      .then((response) => response.data)
      .catch((err) => {
        console.log(err);
      });
    const toResponseData = await axios({
      method: 'delete',
      url: `${APIPath}reference`,
      crossDomain: true,
      data: toReference,
    })
      .then((response) => response.data)
      .catch((err) => {
        console.log(err);
      });
    if (fromResponseData.status || toResponseData.status) {
      setSelectedProperty(null);
      setModalVisible(false);
      dispatch(loadDefaultEntities());
      reload();
    } else {
      const errorText = (
        <div>Something went wrong while deleting the reference</div>
      );
      setError({
        visible: true,
        text: errorText,
      });
    }
    return false;
  };

  const prepareEntitiesList = () => {
    const options = [{ value: '', label: '--' }];
    const { length } = entities;
    for (let i = 0; i < length; i += 1) {
      const { _id: eId, label: eLabel } = entities[i];
      const option = { value: eId, label: eLabel };
      options.push(option);
    }
    return options;
  };

  const prepareTermsList = () => {
    const options = [{ value: '', label: '--' }];
    const { length } = taxonomyTerms;
    for (let i = 0; i < length; i += 1) {
      const {
        _id: tId,
        label: tLabel,
        inverseLabel: tInverseLabel,
      } = taxonomyTerms[i];
      const option = { value: tId, label: `${tLabel}/${tInverseLabel}` };
      options.push(option);
    }
    return options;
  };

  const termsList = prepareTermsList();
  const entitiesList = prepareEntitiesList();

  return (
    <>
      <hr style={{ margin: '10px 0' }} />
      <CardTitle onClick={toggleProperties}>
        Properties <small>[{entity.properties.length}]</small>
        <Button
          type="button"
          className="pull-right"
          color="secondary"
          outline
          size="xs"
        >
          <i
            className={`collapse-toggle fa fa-angle-left${propertiesOpenActive}`}
          />
        </Button>
      </CardTitle>
      <Collapse isOpen={propertiesOpen}>
        {propertiesList}
        <div className="footer-box">
          <Button
            outline
            color="info"
            size="sm"
            onClick={() => togglePropertyModal(null)}
          >
            Add new property <i className="fa fa-plus" />
          </Button>
        </div>
      </Collapse>
      <Modal isOpen={modalVisible} toggle={() => togglePropertyModal(null)}>
        <ModalHeader toggle={() => togglePropertyModal(null)}>
          {propertyModalTitle}
        </ModalHeader>

        <Form onSubmit={propertySubmit}>
          <ModalBody>
            {propertyErrorContainer}
            <FormGroup>
              <Label>Relation</Label>
              <Select
                value={relation}
                onChange={(value) => select2Change('relation', value)}
                options={termsList}
              />
            </FormGroup>
            <FormGroup>
              <Label>Referenced Entity</Label>
              <Select
                value={referencedEntity}
                onChange={(value) => select2Change('referencedEntity', value)}
                options={entitiesList}
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="flex justify-content-between">
            <Button
              color="danger"
              outline
              onClick={deleteProperty}
              className="pull-left"
              size="sm"
            >
              <i className="fa fa-trash-o" /> Delete
            </Button>
            <Button color="primary" outline type="submit" size="sm">
              {savingBtn}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </>
  );
}
Properties.propTypes = {
  _id: PropTypes.string.isRequired,
  entity: PropTypes.object.isRequired,
  entities: PropTypes.array.isRequired,
  taxonomyTerms: PropTypes.array.isRequired,
  reload: PropTypes.func.isRequired,
};
