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

function AlternateAppellations(props) {
  // props
  const { data, update, remove } = props;

  // state
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    appelation: '',
    firstName: '',
    middleName: '',
    lastName: '',
    note: '',
    language: '',
  });
  const [activeIndex, setActiveIndex] = useState(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [simple, setSimple] = useState(true);

  const languageCodes = useSelector((state) => state.languageCodes);

  const openEdit = (index = null) => {
    let newEditOpen = false;
    if (index !== null) {
      newEditOpen = true;
    }
    if (index !== null && index !== 'new') {
      const {
        appelation = '',
        firstName = '',
        middleName = '',
        lastName = '',
        note = '',
        language = '',
      } = data[index];
      const updateData = {
        appelation,
        firstName,
        middleName,
        lastName,
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
    setForm({
      appelation: '',
      firstName: '',
      middleName: '',
      lastName: '',
      note: '',
      language: '',
    });
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
    const {
      appelation = '',
      firstName = '',
      middleName = '',
      lastName = '',
      note = '',
      language = '',
    } = form;
    const newItem = {
      appelation,
      firstName,
      middleName,
      lastName,
      note,
      language,
    };
    let error = false;
    let newErrorText = null;
    if (appelation.length < 2 && firstName.length < 2) {
      error = true;
      newErrorText = (
        <div className="text-center">
          Please enter an appelation or a first name to continue.
        </div>
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

  const toggleForm = () => {
    setSimple(!simple);
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
    const { appelation: nAppelation = '', firstName, middleName, lastName } = r;
    const key = `$idx.${nAppelation}`;
    const appellationText =
      nAppelation !== ''
        ? nAppelation
        : `${firstName} ${middleName} ${lastName}`;
    return (
      <div key={key} className="appelation-row">
        <div className="appelation-details">{appellationText}</div>
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

  let popoverTitle = 'Edit appellation';
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
    popoverTitle = 'Add appellation';
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

  const {
    appelation = '',
    firstName = '',
    middleName = '',
    lastName = '',
    language = '',
    note = '',
  } = form;
  const formOutput = simple ? (
    <>
      <FormGroup>
        <Label for="Appelation">Appelation</Label>
        <Input
          type="text"
          name="appelation"
          id="Appelation"
          placeholder="Person alternate appelation..."
          value={appelation}
          onChange={handleChange}
        />
      </FormGroup>
      <span
        className="toggle-advanced"
        onClick={toggleForm}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="select event"
      >
        Advanced
      </span>
    </>
  ) : (
    <>
      <FormGroup>
        <Label for="firstName">First name</Label>
        <Input
          type="text"
          name="firstName"
          id="firstName"
          placeholder="Person first name prefix..."
          value={firstName}
          onChange={handleChange}
        />
      </FormGroup>
      <FormGroup>
        <Label for="middleName">Middle name</Label>
        <Input
          type="text"
          name="middleName"
          id="middleName"
          placeholder="Person middle name prefix..."
          value={middleName}
          onChange={handleChange}
        />
      </FormGroup>
      <FormGroup>
        <Label for="lastName">Last name</Label>
        <Input
          type="text"
          name="lastName"
          id="lastName"
          placeholder="Person last name prefix..."
          value={lastName}
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
          id="note"
          placeholder="A note about this alternate appelation..."
          value={note}
          onChange={handleChange}
        />
      </FormGroup>
      <span
        className="toggle-advanced"
        onClick={toggleForm}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="select event"
      >
        Simple
      </span>
    </>
  );

  const errorContainerClass = errorVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );

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
          {formOutput}
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
AlternateAppellations.defaultProps = {
  data: [],
  update: () => {},
  remove: () => {},
};
AlternateAppellations.propTypes = {
  data: PropTypes.array,
  update: PropTypes.func,
  remove: PropTypes.func,
};
export default AlternateAppellations;
