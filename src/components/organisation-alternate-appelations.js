import React, { Component } from 'react';
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
import { connect } from 'react-redux';
import { compose } from 'redux';

const mapStateToProps = (state) => ({
  languageCodes: state.languageCodes,
});

class OrganisationAppelations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editOpen: false,
      label: '',
      note: '',
      language: '',
      activeIndex: null,
      updateBtn: (
        <span>
          <i className="fa fa-save" /> Update
        </span>
      ),
      errorVisible: false,
      errorText: [],
      languageOptions: [],
    };
    this.openEdit = this.openEdit.bind(this);
    this.closeEdit = this.closeEdit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.submit = this.submit.bind(this);
    this.delete = this.delete.bind(this);
    this.loadLanguageOptions = this.loadLanguageOptions.bind(this);
  }

  componentDidUpdate() {
    const { languageCodes } = this.props;
    const { languageOptions } = this.state;
    if (languageCodes.length > 0 && languageOptions.length === 0) {
      this.loadLanguageOptions();
    }
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState({
      [name]: value,
    });
  }

  openEdit(index = null) {
    const { data } = this.props;
    let editOpen = false;
    if (index !== null) {
      editOpen = true;
    }
    const update = {
      editOpen,
      activeIndex: index,
    };
    if (index !== null && index !== 'new') {
      const appelation = data[index];
      update.label = appelation.label;
      update.note = appelation.note;
      update.language = appelation.language;
    }
    this.setState(update);
  }

  closeEdit() {
    this.setState({
      editOpen: false,
      errorVisible: false,
      errorText: [],
      label: '',
      note: '',
      language: '',
    });
  }

  select2Change(selectedOption, element = null) {
    if (element === null) {
      return false;
    }
    return this.setState({
      [element]: selectedOption,
    });
  }

  submit() {
    const { label, note, language, activeIndex } = this.state;
    const { update } = this.props;
    const newItem = {
      label,
      note,
      language,
    };
    let error = false;
    let errorText = [];
    if (newItem.label.length < 2) {
      error = true;
      errorText = (
        <div className="text-center">Please enter a label to continue.</div>
      );
    }
    if (error) {
      this.setState({
        errorVisible: true,
        errorText,
      });
      return false;
    }

    update(activeIndex, newItem);
    this.closeEdit();
    return false;
  }

  delete() {
    const { remove } = this.props;
    const { activeIndex } = this.state;
    remove(activeIndex);
    this.closeEdit();
  }

  loadLanguageOptions() {
    const { languageCodes } = this.props;
    const languagesOptions = [{ value: '', label: '-- select language --' }];
    for (let i = 0; i < languageCodes.length; i += 1) {
      const l = languageCodes[i];
      languagesOptions.push({ value: l.alpha2, label: l.English });
    }
    this.setState({ languageOptions: languagesOptions });
  }

  render() {
    const { data } = this.props;
    const {
      activeIndex,
      errorVisible,
      errorText,
      editOpen,
      label,
      language,
      languageOptions,
      note,
      updateBtn,
    } = this.state;
    const rows = [];
    for (let i = 0; i < data.length; i += 1) {
      const appelation = data[i];
      const appelationText = [];
      appelationText.push(
        <span key={appelation.label}>{appelation.label}</span>
      );
      const row = (
        <div key={i} className="appelation-row">
          <div className="appelation-details">{appelationText}</div>
          <div className="appelation-actions">
            <button
              type="button"
              className="btn btn-xs btn-outline-info"
              onClick={() => this.openEdit(i)}
            >
              <i className="fa fa-pencil" />
            </button>
          </div>
        </div>
      );
      rows.push(row);
    }

    let popoverTitle = 'Edit appelation';
    let deleteButton = (
      <button
        type="button"
        className="btn btn-xs btn-outline-danger"
        onClick={() => this.delete()}
      >
        <i className="fa fa-trash" /> Delete
      </button>
    );
    if (activeIndex === 'new') {
      popoverTitle = 'Add appelation';
      deleteButton = (
        <button
          type="button"
          className="btn btn-xs btn-outline-danger"
          onClick={() => this.closeEdit()}
        >
          <i className="fa fa-times" /> Cancel
        </button>
      );
    }
    const errorContainerClass = errorVisible ? '' : ' hidden';
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
            onClick={() => this.openEdit('new')}
          >
            Add new <i className="fa fa-plus" />
          </button>
        </div>
        <Modal isOpen={editOpen} toggle={this.closeEdit}>
          <ModalHeader toggle={this.closeEdit}>{popoverTitle}</ModalHeader>
          <ModalBody>
            {errorContainer}
            <FormGroup>
              <Label>Label</Label>
              <Input
                type="text"
                name="label"
                placeholder="Label..."
                value={label}
                onChange={this.handleChange}
              />
            </FormGroup>
            <FormGroup style={{ marginTop: '15px' }}>
              <Label>Language</Label>
              <Select
                value={language}
                onChange={(selectedOption) =>
                  this.select2Change(selectedOption, 'language')
                }
                options={languageOptions}
              />
            </FormGroup>
            <FormGroup>
              <Label>Note</Label>
              <Input
                type="textarea"
                name="note"
                placeholder="A note about this alternate appelation..."
                value={note}
                onChange={this.handleChange}
              />
            </FormGroup>
            <div className="text-left">
              {deleteButton}
              <button
                type="button"
                className="btn btn-xs btn-outline-info pull-right"
                onClick={() => this.submit()}
              >
                {updateBtn}
              </button>
            </div>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

OrganisationAppelations.defaultProps = {
  languageCodes: [],
  data: [],
  update: () => {},
  remove: () => {},
};

OrganisationAppelations.propTypes = {
  languageCodes: PropTypes.array,
  data: PropTypes.array,
  update: PropTypes.func,
  remove: PropTypes.func,
};

export default compose(connect(mapStateToProps, []))(OrganisationAppelations);
