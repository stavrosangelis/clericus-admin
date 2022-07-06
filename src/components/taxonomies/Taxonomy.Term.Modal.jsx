import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Collapse,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import Select from 'react-select';
import { Link } from 'react-router-dom';

import DeleteModal from '../Delete.modal';

function TaxonomyTermModal(props) {
  // props
  const {
    errorVisible,
    errorText,
    _id,
    loadTerm,
    reload,
    submit,
    submitBtnText,
    term,
    terms,
    toggle,
    visible,
  } = props;

  // state
  const [label, setLabel] = useState('');
  const [inverseLabel, setInverseLabel] = useState('');
  const [scopeNote, setScopeNote] = useState('');
  const [parentRef, setParentRef] = useState('');
  const [relatedTermsCollapse, setRelatedTermsCollapse] = useState(false);

  // delete modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const prepareTermsList = useCallback(() => {
    const options = [];
    const { length } = terms;
    for (let i = 0; i < length; i += 1) {
      const t = terms[i];
      const seps = [];
      const { parentIds = [] } = t;
      const { length: pLength } = parentIds;
      for (let j = 0; j < pLength; j += 1) {
        seps.push('-');
      }
      if (_id !== t._id) {
        const option = {
          value: t._id,
          label: `${seps.join('')} ${t.label}`,
        };
        options.push(option);
      }
    }
    return options;
  }, [_id, terms]);

  useEffect(() => {
    const newLabel = term?.label || '';
    const newInverseLabel = term?.inverseLabel || '';
    const newScopeNote = term?.scopeNote || '';
    const newParentRef = term?.parentRef || null;
    setLabel(newLabel);
    setInverseLabel(newInverseLabel);
    setScopeNote(newScopeNote);
    setRelatedTermsCollapse(false);
    if (newParentRef !== null) {
      const options = prepareTermsList();
      const parentVal = options.find((o) => o.value === newParentRef) || null;
      setParentRef(parentVal);
    } else {
      setParentRef('');
    }
  }, [_id, prepareTermsList, term]);

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    switch (name) {
      case 'label':
        setLabel(value);
        break;
      case 'inverseLabel':
        setInverseLabel(value);
        break;
      case 'scopeNote':
        setScopeNote(value);
        break;
      default:
        break;
    }
  };

  const updateParentRef = (selectedOption) => {
    setParentRef(selectedOption);
  };

  const save = useCallback(
    (e) => {
      e.preventDefault();
      const copy = { ...term };
      const newParentRef = parentRef?.value || '';
      copy.label = label;
      copy.label = label;
      copy.inverseLabel = inverseLabel;
      copy.scopeNote = scopeNote;
      copy.parentRef = newParentRef;
      submit(copy);
    },
    [term, label, inverseLabel, scopeNote, submit, parentRef]
  );

  const toggleDeleteModal = () => {
    setDeleteModalVisible(!deleteModalVisible);
  };

  const modalTitle =
    _id === null ? 'Add new term' : `Edit term "${term?.label}"`;
  const btnDelete =
    _id === null ? (
      []
    ) : (
      <Button
        color="danger"
        size="sm"
        outline
        onClick={() => toggleDeleteModal()}
        className="pull-left"
        aria-label="Delete taxonomy term"
      >
        <i className="fa fa-trash-o" /> Delete
      </Button>
    );

  const errorContainerClass = errorVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );

  const termCount = term?.count || 0;
  const visibleIdsClass = _id !== null ? '' : 'hidden';
  const termLabelId = term?.labelId || '';
  const termInverseLabelId = term?.inverseLabelId || '';

  let termCountOutput = [];
  if (Number(termCount) > 0) {
    const toggleTermCollapse = () => {
      setRelatedTermsCollapse(!relatedTermsCollapse);
    };

    const termRelationsCollapseActive = relatedTermsCollapse ? ' active' : '';

    const termRelations = term?.relations || [];

    const termRelationsOutput = termRelations.map((t, i) => {
      const { source } = t;
      const { target } = t;
      let sourceLabel = source.nodeType.toLowerCase();
      let targetLabel = target.nodeType.toLowerCase();
      let sourceLink = `/${sourceLabel}/${source._id}`;
      let targetLink = `/${targetLabel}/${target._id}`;
      if (sourceLabel === 'entity') {
        sourceLabel = 'entities';
        sourceLink = `/${sourceLabel}`;
      }
      if (targetLabel === 'entity') {
        targetLabel = 'entities';
        targetLink = `/${targetLabel}`;
      }

      const key = `${i}-${source._id}`;
      const item = (
        <li key={key}>
          <Link href={sourceLink} to={sourceLink} target="_blank">
            {source.label}
          </Link>{' '}
          <i>{label}</i>{' '}
          <Link href={targetLink} to={targetLink} target="_blank">
            {target.label}
          </Link>
        </li>
      );
      return item;
    });

    termCountOutput = [
      <div
        className="text-end"
        onClick={() => toggleTermCollapse()}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle term collapse"
        key={0}
      >
        <small>
          <b>Relations count</b>: {termCount} &nbsp;&nbsp;{' '}
        </small>
        <Button
          type="button"
          className="pull-right"
          color="secondary"
          outline
          size="xs"
        >
          <i
            className={`collapse-toggle fa fa-angle-left${termRelationsCollapseActive}`}
          />
        </Button>
      </div>,
      <Collapse
        isOpen={relatedTermsCollapse}
        key={1}
        className="term-relations-collapse-container"
      >
        <div
          className="text-end refresh-btn"
          onClick={() => loadTerm(_id)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="load term"
        >
          Refresh <i className="fa fa-refresh" />
        </div>
        <ol className="taxonomy-term-relations">{termRelationsOutput}</ol>
      </Collapse>,
    ];
  }

  const associatedEntitiesCount = term?.entitiesCount || 0;
  const associatedEntitiesCountOutput =
    Number(associatedEntitiesCount) > 0 ? (
      <div className="text-end">
        <small>Associated entities: {associatedEntitiesCount}</small>
      </div>
    ) : (
      []
    );
  const termsList = prepareTermsList();

  return (
    <div>
      <Modal isOpen={visible} toggle={toggle}>
        <ModalHeader toggle={toggle}>{modalTitle}</ModalHeader>
        <ModalBody>
          {errorContainer}
          {termCountOutput}
          {associatedEntitiesCountOutput}
          <Form onSubmit={(e) => save(e)}>
            <FormGroup>
              <Label for="termLabelInput">Label</Label>
              <Input
                type="text"
                name="label"
                id="termLabelInput"
                placeholder="Term label..."
                value={label}
                onChange={(e) => handleChange(e)}
              />
            </FormGroup>
            <FormGroup className={visibleIdsClass}>
              <Label>
                LabelId
                <span>
                  : <i>{termLabelId}</i>
                </span>
              </Label>
            </FormGroup>
            <FormGroup>
              <Label for="termInverseLabelInput">Inverse Label</Label>
              <Input
                type="text"
                name="inverseLabel"
                id="termInverseLabelInput"
                placeholder="Term inverse label..."
                value={inverseLabel}
                onChange={(e) => handleChange(e)}
              />
            </FormGroup>
            <FormGroup className={visibleIdsClass}>
              <Label>
                Inverse LabelId
                <span>
                  : <i>{termInverseLabelId}</i>{' '}
                </span>
              </Label>
            </FormGroup>
            <FormGroup>
              <Label for="termScopeNoteInput">Scope Note</Label>
              <Input
                type="textarea"
                name="scopeNote"
                id="termScopeNoteInput"
                placeholder="Term scope note..."
                value={scopeNote}
                onChange={(e) => handleChange(e)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Parent Term</Label>
              <Select
                name="parentRef"
                value={parentRef}
                onChange={(v) => updateParentRef(v)}
                options={termsList}
                isClearable
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter className="flex justify-content-between">
          {btnDelete}
          <Button
            size="sm"
            color="info"
            outline
            onClick={(e) => save(e)}
            aria-label="Save taxonomy term"
          >
            {submitBtnText}
          </Button>
        </ModalFooter>
      </Modal>
      <DeleteModal
        _id={_id}
        label={term?.label}
        path="taxonomy-term"
        params={{ _id }}
        visible={deleteModalVisible}
        toggle={toggleDeleteModal}
        update={reload}
      />
    </div>
  );
}
TaxonomyTermModal.defaultProps = {
  errorVisible: false,
  errorText: [],
  _id: null,
  submitBtnText: '',
  term: null,
  terms: [],
  visible: false,
};

TaxonomyTermModal.propTypes = {
  errorVisible: PropTypes.bool,
  errorText: PropTypes.array,
  _id: PropTypes.string,
  loadTerm: PropTypes.func.isRequired,
  reload: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  submitBtnText: PropTypes.object,
  term: PropTypes.object,
  terms: PropTypes.array,
  toggle: PropTypes.func.isRequired,
  visible: PropTypes.bool,
};

export default TaxonomyTermModal;
