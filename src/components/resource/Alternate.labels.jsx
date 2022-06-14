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

function ResourceAlternateLabels(props) {
  // props
  const { data, update, remove } = props;

  // state
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ label: '', note: '', language: '' });
  const [activeIndex, setActiveIndex] = useState(null);
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
      const { label = '', note = '', language = '' } = data[index];
      const updateData = {
        label,
        note,
        language,
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
    if (element !== null) {
      const formData = { ...form };
      formData[element] = selectedOption;
      setForm(formData);
    }
  };

  const submit = () => {
    const { label = '', note = '', language = '' } = form;
    const newItem = {
      label,
      note,
      language,
    };
    let error = false;
    let newErrorText = null;
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
    return true;
  };

  const deleteItem = () => {
    remove(activeIndex);
    closeEdit();
  };

  useEffect(() => {
    if (languageCodes.length > 0) {
      const loadLanguageOptions = () => {
        const defaultLanguageOption = {
          value: '',
          label: '-- select language --',
        };
        const languagesOptions = languageCodes.map((l) => ({
          value: l.alpha2,
          label: l.English,
        }));
        languagesOptions.unshift(defaultLanguageOption);
        setLanguageOptions(languagesOptions);
      };
      loadLanguageOptions();
    }
  }, [languageCodes]);

  const rows = data.map((r, idx) => {
    const { label: nLabel = '' } = r;
    const key = `$idx.${nLabel}`;
    return (
      <div key={key} className="appelation-row">
        <div className="appelation-details">{nLabel}</div>
        <div className="appelation-actions">
          <button
            type="button"
            className="btn btn-xs btn-outline-info"
            onClick={() => openEdit(idx)}
          >
            <i className="fa fa-pencil" />
          </button>
        </div>
      </div>
    );
  });

  let popoverTitle = 'Edit label';
  let deleteButton = (
    <button
      type="button"
      className="btn btn-xs btn-danger"
      onClick={() => deleteItem()}
    >
      <i className="fa fa-trash" /> Delete
    </button>
  );
  let updateBtnText = 'Update';
  if (activeIndex === 'new') {
    popoverTitle = 'Add label';
    deleteButton = (
      <button
        type="button"
        className="btn btn-xs btn-secondary"
        onClick={() => closeEdit()}
      >
        <i className="fa fa-times" /> Cancel
      </button>
    );
    updateBtnText = 'Save';
  }

  const errorContainerClass = errorVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );

  const { label = '', language = '', note = '' } = form;
  return (
    <>
      <div className="alternate-appelation-body" id="editAppelation">
        {rows}
        <div className="text-end" style={{ marginTop: '10px' }}>
          <button
            type="button"
            className="btn btn-xs btn-outline-info"
            onClick={() => openEdit('new')}
          >
            Add new <i className="fa fa-plus" />
          </button>
        </div>
      </div>

      <Modal isOpen={editOpen} toggle={closeEdit}>
        <ModalHeader toggle={closeEdit}>{popoverTitle}</ModalHeader>
        <ModalBody>
          {errorContainer}
          <>
            <FormGroup>
              <Label for="firstName">Label</Label>
              <Input
                type="text"
                name="label"
                placeholder="label"
                value={label}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup style={{ marginTop: '15px' }}>
              <Label>Language</Label>
              <Select
                value={language}
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
                value={note}
                onChange={handleChange}
              />
            </FormGroup>
          </>
          <div className="flex justify-content-between">
            {deleteButton}
            <button
              type="button"
              className="btn btn-xs btn-info"
              onClick={() => submit()}
            >
              <span>
                <i className="fa fa-save" /> {updateBtnText}
              </span>
            </button>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
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
