import React, { Component } from 'react';
import {
  FormGroup, Label, Input,
  Popover, PopoverHeader, PopoverBody
} from 'reactstrap';


export default class PersonAppelations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editOpen: false,
      appelation: '',
      honorificPrefix: '',
      firstName: '',
      middleName: '',
      lastName: '',
      activeIndex: null,
      simple: true,
      updating: false,
      updateBtn: <span><i className="fa fa-save" /> Update</span>,
      errorVisible: false,
      errorText: []
    }
    this.openEdit = this.openEdit.bind(this);
    this.closeEdit = this.closeEdit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
    this.delete = this.delete.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
  }

  openEdit(index=null) {
    let editOpen = false;
    if (index!==null) {
      editOpen = true
    }
    let update = {
      editOpen: editOpen,
      activeIndex: index
    };
    if (index!==null && index!=="new") {
      let appelation = this.props.data[index];
      update.appelation = appelation.appelation;
      update.honorificPrefix = appelation.honorificPrefix;
      update.firstName = appelation.firstName;
      update.middleName = appelation.middleName;
      update.lastName = appelation.lastName;
      if (update.appelation.length<2 && update.firstName>2) {
        update.simple = false;
      }
      else {
        update.simple = true;
      }
    }
    this.setState(update)
  }

  closeEdit() {
    this.setState({
      editOpen: false,
      errorVisible: false,
      errorText: [],
      appelation: '',
      honorificPrefix: '',
      firstName: '',
      middleName: '',
      lastName: '',
    })
  }

  handleChange(e){
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;

    this.setState({
      [name]: value
    });
  }

  submit() {
    let newItem = {
      appelation: this.state.appelation,
      honorificPrefix: this.state.honorificPrefix,
      firstName: this.state.firstName,
      middleName: this.state.middleName,
      lastName: this.state.lastName,
    }
    let error = false;
    let errorText = [];
    if (newItem.appelation.length<2 && newItem.firstName.length<2) {
      error = true;
      errorText = <div className="text-center">Please enter an appelation or a first name to continue.</div>
    }
    if (error) {
      this.setState({
        errorVisible: true,
        errorText: errorText,
      })
      return false;
    }
    else {
      this.props.update(this.state.activeIndex, newItem);
      this.closeEdit();
    }
  }

  delete() {
    this.props.remove(this.state.activeIndex);
    this.closeEdit();
  }

  toggleForm() {
    this.setState({
      simple:!this.state.simple
    })
  }

  render() {
    let rows = [];
    for (let i=0;i<this.props.data.length; i++) {
      let appelation = this.props.data[i];
      let appelationText = []
      appelationText.push(<span key="simple">{appelation.appelation}</span>);
      if (appelation.honorificPrefix!=="" || appelation.firstName!=="" || appelation.middleName!=="" || appelation.lastName!=="") {
        appelationText.push(<span key="advanced">{appelation.honorificPrefix} {appelation.firstName} {appelation.middleName} {appelation.lastName}</span>)
      }
      let row = <div key={i} className="appelation-row">
        <div className="appelation-details">{appelationText}</div>
        <div className="appelation-actions">
          <button type="button" className="btn btn-xs btn-outline-info" onClick={()=>this.openEdit(i)}>
            <i className="fa fa-pencil" />
          </button>
        </div>
      </div>
      rows.push(row);
    }

    let popoverTitle = "Edit appelation";
    let deleteButton = <button type="button" className="btn btn-xs btn-outline-danger" onClick={()=>this.delete()}><i className="fa fa-trash" /> Delete</button>
    if (this.state.activeIndex==="new") {
      popoverTitle = "Add appelation";
      deleteButton = <button type="button" className="btn btn-xs btn-outline-danger" onClick={()=>this.closeEdit()}><i className="fa fa-times" /> Cancel</button>
    }

    let simpleFormClass="";
    let advancedFormClass="hidden";
    if (!this.state.simple) {
      simpleFormClass="hidden";
      advancedFormClass="";
    }
    let errorContainerClass = " hidden";
    if (this.state.errorVisible) {
      errorContainerClass = "";
    }
    let errorContainer = <div className={"error-container"+errorContainerClass}>{this.state.errorText}</div>

    return(
      <div className="alternate-appelation-body" id="editAppelation">
        {rows}
        <div className="text-right" style={{marginTop: '10px'}}>
          <button  type="button" className="btn btn-xs btn-outline-info" onClick={()=>this.openEdit("new")}>
            Add new <i className="fa fa-plus" />
          </button>
        </div>
        <Popover className="edit-alternate-appelation-form" placement="top" isOpen={this.state.editOpen} target="editAppelation">
          <PopoverHeader>{popoverTitle} <button type="button" className="btn btn-xs btn-outline-secondary pull-right" onClick={()=>this.closeEdit()}><i className="fa fa-times" /></button>
          </PopoverHeader>
          <PopoverBody>
            {errorContainer}
            <div className={simpleFormClass}>
              <FormGroup>
                <Label for="Appelation">Appelation</Label>
                <Input type="text" name="appelation" id="Appelation" placeholder="Person alternate appelation..." value={this.state.appelation} onChange={this.handleChange}/>
              </FormGroup>
              <span className="toggle-advanced" onClick={this.toggleForm}>Advanced</span>
            </div>
            <div className={advancedFormClass}>
              <FormGroup>
                <Label for="honorificPrefix">Honorific Prefix</Label>
                <Input type="text" name="honorificPrefix" id="honorificPrefix" placeholder="Person honorific prefix..." value={this.state.honorificPrefix} onChange={this.handleChange}/>
              </FormGroup>
              <FormGroup>
                <Label for="firstName">First name</Label>
                <Input type="text" name="firstName" id="firstName" placeholder="Person first name prefix..." value={this.state.firstName} onChange={this.handleChange}/>
              </FormGroup>
              <FormGroup>
                <Label for="middleName">Middle name</Label>
                <Input type="text" name="middleName" id="middleName" placeholder="Person middle name prefix..." value={this.state.middleName} onChange={this.handleChange}/>
              </FormGroup>
              <FormGroup>
                <Label for="lastName">Last name</Label>
                <Input type="text" name="lastName" id="lastName" placeholder="Person last name prefix..." value={this.state.lastName} onChange={this.handleChange}/>
              </FormGroup>
              <span className="toggle-advanced" onClick={this.toggleForm}>Simple</span>
            </div>
            <div className="text-left">
              {deleteButton}
              <button type="button" className="btn btn-xs btn-outline-info pull-right" onClick={()=>this.submit()}>{this.state.updateBtn}</button>
            </div>
          </PopoverBody>
        </Popover>
      </div>
    );
  }

}
