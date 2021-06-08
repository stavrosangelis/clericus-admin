import React, { useState, useEffect } from 'react';
import {
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap';
import Select from 'react-select';
import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';

const ResourceAlternateLabels = (props) => {
  // props
  const { data, update, remove } = props;

  // state
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ label: '', note: '', language: '' });
  const [activeIndex, setActiveIndex] = useState(null);
  const updateBtn = (
    <span>
      <i className="fa fa-save" /> Update
    </span>
  );
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const languageCodes = useSelector((state) => state.languageCodes);

  const openEdit = (index = null) => {
    let newEditOpen = false;
    if (index !== null) {
      newEditOpen = true;
    }
    if (index !== null && index !== 'new') {
      const activeLabel = data[index];
      const updateData = {
        label: activeLabel.label,
        note: activeLabel.note,
        language: activeLabel.language,
      };
      setForm(updateData);
    }
    setEditOpen(newEditOpen);
    setActiveIndex(index);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setErrorVisible(false);
    setErrorText([]);
    setForm({ label: '', note: '', language: '' });
    setActiveIndex(null);
  };

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const formData = { ...form };
    formData[name] = value;
    setForm(formData);
  };

  const select2Change = (selectedOption, element = null) => {
    if (element === null) {
      return false;
    }
    const formData = { ...form };
    formData[element] = selectedOption;
    setForm(formData);
    return false;
  };

  const submit = () => {
    const newItem = {
      label: form.label,
      note: form.note,
      language: form.language,
    };
    let error = false;
    let newErrorText = [];
    if (newItem.label === '') {
      error = true;
      newErrorText = (
        <div className="text-center">Please add a label to continue.</div>
      );
    }
    if (error) {
      setErrorVisible(true);
      setErrorText(newErrorText);
      return false;
    }

    update(activeIndex, newItem);
    closeEdit();
    return false;
  };

  const deleteItem = () => {
    remove(activeIndex);
    closeEdit();
  };

  useEffect(() => {
    const loadLanguageOptions = () => {
      const languagesOptions = [{ value: '', label: '-- select language --' }];
      for (let i = 0; i < languageCodes.length; i += 1) {
        const l = languageCodes[i];
        languagesOptions.push({ value: l.alpha2, label: l.English });
      }
      setLanguageOptions(languagesOptions);
    };
    if (languageCodes.length > 0) {
      loadLanguageOptions();
    }
  }, [languageCodes]);

  const rows = [];
  for (let i = 0; i < data.length; i += 1) {
    const newLabel = data[i];
    const labelText = [];
    labelText.push(<span key="simple">{newLabel.label}</span>);
    const row = (
      <div key={i} className="appelation-row">
        <div className="appelation-details">{labelText}</div>
        <div className="appelation-actions">
          <button
            type="button"
            className="btn btn-xs btn-outline-info"
            onClick={() => openEdit(i)}
          >
            <i className="fa fa-pencil" />
          </button>
        </div>
      </div>
    );
    rows.push(row);
  }

  let popoverTitle = 'Edit label';
  let deleteButton = (
    <button
      type="button"
      className="btn btn-xs btn-outline-danger"
      onClick={() => deleteItem()}
    >
      <i className="fa fa-trash" /> Delete
    </button>
  );
  if (activeIndex === 'new') {
    popoverTitle = 'Add label';
    deleteButton = (
      <button
        type="button"
        className="btn btn-xs btn-outline-danger"
        onClick={() => closeEdit()}
      >
        <i className="fa fa-times" /> Cancel
      </button>
    );
  }

  let errorContainerClass = ' hidden';
  if (errorVisible) {
    errorContainerClass = '';
  }
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );

  return (
    <div className="alternate-appelation-body" id="editAppelation">
      {rows}
      <div className="text-right" style={{ marginTop: '10px' }}>
        <button
          type="button"
          className="btn btn-xs btn-outline-info"
          onClick={() => openEdit('new')}
        >
          Add new <i className="fa fa-plus" />
        </button>
      </div>
      <Modal isOpen={editOpen} toggle={closeEdit}>
        <ModalHeader toggle={closeEdit}>{popoverTitle}</ModalHeader>
        <ModalBody>
          {errorContainer}
          <div>
            <FormGroup>
              <Label for="firstName">Label</Label>
              <Input
                type="text"
                name="label"
                placeholder="label"
                value={form.label}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup style={{ marginTop: '15px' }}>
              <Label>Language</Label>
              <Select
                value={form.language}
                onChange={(selectedOption) =>
                  select2Change(selectedOption, 'language')
                }
                options={languageOptions}
              />
            </FormGroup>
            <FormGroup>
              <Label for="note">Note</Label>
              <Input
                type="textarea"
                name="note"
                placeholder="A note about this alternate label..."
                value={form.note}
                onChange={handleChange}
              />
            </FormGroup>
          </div>
          <div className="text-left">
            {deleteButton}
            <button
              type="button"
              className="btn btn-xs btn-outline-info pull-right"
              onClick={() => submit()}
            >
              {updateBtn}
            </button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};
ResourceAlternateLabels.defaultProps = {
  data: [],
  update: () => {},
  remove: () => {},
};
ResourceAlternateLabels.propTypes = {
  data: PropTypes.array,
  update: PropTypes.func,
  remove: PropTypes.func,
};
export default ResourceAlternateLabels;
