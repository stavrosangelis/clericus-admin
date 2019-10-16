import React from "react";
import axios from 'axios';
import {loadProgressBar} from 'axios-progress-bar';
import {
  Card, CardBody,
  Button, Badge,
  Form, FormGroup, Label, Input,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Spinner
} from "reactstrap";
import Select from 'react-select';

import {Breadcrumbs} from '../components/breadcrumbs';
const APIPath = process.env.REACT_APP_APIPATH;


export default class Taxonomies extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      taxonomies: [],
      taxonomy: null,
      taxonomyTerms: [],
      taxonomyLabel: '',
      taxonomyDescription: '',
      termModalVisible: false,
      termId: '',
      termLabel: '',
      termInverseLabel: '',
      termScopeNote: '',
      termParentRef: '',
      termSaving: false,
      errorVisible: false,
      errorText: [],
      updateTermBtn: <span><i className="fa fa-save"/> Save</span>,
      taxonomySaving: false,
      taxonomyErrorVisible: false,
      taxonomyErrorText: [],
      taxonomySaveBtn: <span><i className="fa fa-save"/> Save</span>,
    }

    this.load = this.load.bind(this);
    this.loadItem = this.loadItem.bind(this);
    this.loadTermsTree = this.loadTermsTree.bind(this);
    this.processTerms = this.processTerms.bind(this);
    this.list = this.list.bind(this);
    this.showItem = this.showItem.bind(this);
    this.showTerms = this.showTerms.bind(this);
    this.toggleTermChildren = this.toggleTermChildren.bind(this);
    this.termsList = this.termsList.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.editTermSubmit = this.editTermSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.termModalToggle = this.termModalToggle.bind(this);
    this.deleteTerm = this.deleteTerm.bind(this);
  }

  load() {
    let context = this;
    axios({
        method: 'get',
        url: APIPath+'taxonomies',
        crossDomain: true,
      })
    .then(function (response) {
      let responseData = response.data.data;
      context.setState({
        loading: false,
        taxonomies: responseData.data,
      })
    })
    .catch(function (error) {
    });
  }

  loadItem(_id=null) {
    if (_id===null) {
      this.setState({
        taxonomy: [],
        taxonomyLabel: '',
        taxonomyDescription: '',
      });
      return false;
    }
    let context = this;
    let params = {
      _id: _id
    }
    axios({
        method: 'get',
        url: APIPath+'taxonomy',
        crossDomain: true,
        params: params,
      })
    .then(function (response) {
      let responseData = response.data.data;
      let newLabel = "";
      let newDescription = "";
      if (responseData.label!==null) {
        newLabel = responseData.label;
      }
      if (responseData.description!==null) {
        newDescription = responseData.description;
      }
      context.setState({
        taxonomy: responseData,
        taxonomyLabel: newLabel,
        taxonomyDescription: newDescription,
      });
      context.loadTermsTree(_id);
    })
    .catch(function (error) {
    });
  }

  loadTermsTree(_id) {
    let context = this;
    let params = {
      taxonomyRef: _id
    }
    axios({
        method: 'get',
        url: APIPath+'taxonomy-terms-tree',
        crossDomain: true,
        params: params,
      })
    .then(function (response) {
      let responseData = response.data.data;
      let newTerms = context.processTerms(responseData);
      context.setState({
        taxonomyTerms: newTerms
      });
    })
    .catch(function (error) {
    });
  }

  processTerms(terms) {
    let output = [];
    for (let i=0; i<terms.length; i++) {
      let term = terms[i];
      term.childrenVisible = false;
      if (typeof term.children!=="undefined" && term.children.length>0) {
        term.children = this.processTerms(term.children);
      }
      output.push(term);
    }
    return output;
  }

  list(taxonomies) {
    let output = [];
    for (let i=0; i<taxonomies.length; i++) {
      let taxonomy = taxonomies[i];
      let item = <Button color="secondary" outline key={i} onClick={()=> {this.loadItem(taxonomy._id)}} className="taxonomy-btn">{taxonomy.label} <Badge color="secondary">{taxonomy.terms}</Badge></Button>
      output.push(item);
    }
    return output;
  }

  showItem(taxonomy, terms) {
    let output = [];
    if (taxonomy!==null) {
      let taxonomyDescription = "";
      if (this.state.taxonomyDescription!=="") {
        taxonomyDescription = this.state.taxonomyDescription;
      }
      let termsOutput = this.showTerms(terms);
      let errorContainerClass = " hidden";
      if (this.state.taxonomyErrorVisible) {
        errorContainerClass = "";
      }
      let errorContainer = <div className={"error-container"+errorContainerClass}>{this.state.taxonomyErrorText}</div>
      let termsVisible = "hidden";
      if (this.state.taxonomy!==null && Object.keys(this.state.taxonomy).length>0) {
        termsVisible = "";
      }
      output = <Card>
        <CardBody>
          <div className="row">
            <div className="col-xs-12 col-sm-6 col-md-8">
              <FormGroup className={termsVisible}>
                <Label>Terms</Label>
                {termsOutput}
                <div className="footer-box">
                  <Button size="sm" color="info" onClick={this.termModalToggle}>Add term <i className="fa fa-plus" /></Button>
                </div>
              </FormGroup>
            </div>
            <div className="col-xs-12 col-sm-6 col-md-4">
              {errorContainer}
              <Form onSubmit={this.formSubmit}>
                <FormGroup>
                  <Label for="labelInput">Label</Label>
                  <Input type="text" name="taxonomyLabel" id="labelInput" placeholder="Taxonomy label..." value={this.state.taxonomyLabel} onChange={this.handleChange}/>
                </FormGroup>
                <FormGroup>
                  <Label for="descriptionInput">Description</Label>
                  <Input type="textarea" name="taxonomyDescription" id="descriptionInput" placeholder="Taxonomy description..." value={taxonomyDescription} onChange={this.handleChange}/>
                </FormGroup>
              </Form>
              <div className="footer-box">
                <Button size="sm" type="button" onClick={this.formSubmit} color="info" outline>{this.state.taxonomySaveBtn}</Button>
                <Button size="sm" className="pull-left" color="danger" outline><i className="fa fa-trash-o" /> Delete</Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    }
    return output;
  }

  showTerms(terms=null, termIndex=0) {
    let termsOutput = [];
    if (terms!==null) {
      for (let i=0; i<terms.length; i++) {
        let count = i+1+".";
        let countOutput = '';
        if (termIndex>0) {
          let newTermIndex = termIndex+1;
          countOutput = newTermIndex+".";
        }
        countOutput += count;
        let term = terms[i];
        let termChildren = [];
        let termChildrenOutput = [];
        let collapseIcon = [];
        let collapseIconClass = " fa-plus";
        let childrenVisibleClass = "hidden";
        if (term.childrenVisible) {
          childrenVisibleClass = "";
          collapseIconClass = " fa-minus";
        }
        if (typeof term.children!=="undefined" && term.children!==null && term.children.length>0) {
          termChildren = this.showTerms(term.children, i);
          collapseIcon = <i className={"fa"+collapseIconClass} onClick={()=>this.toggleTermChildren(i, termIndex)}/>;
          termChildrenOutput = <div className={childrenVisibleClass}>{termChildren}</div>
        }
        let termItem = <li key={i}>{collapseIcon} {countOutput} <span className="term-item" onClick={()=>this.termModalToggle(term)}>{term.label}</span> {termChildrenOutput}</li>;
        termsOutput.push(termItem);
      }
      if (terms.length>0) {
        termsOutput = <ul className="taxonomy-terms">{termsOutput}</ul>;
      }
    }
    return termsOutput;
  }

  toggleTermChildren(index=null, parentIndex=null) {
    let taxonomyTerms = this.state.taxonomyTerms;
    let activeTerm;
    if (parentIndex===0 || parentIndex===null) {
      activeTerm = taxonomyTerms[index];
      activeTerm.childrenVisible = !activeTerm.childrenVisible;
      taxonomyTerms[index] = activeTerm;
    }
    if (parentIndex!==null && parentIndex>0) {
      activeTerm = taxonomyTerms[parentIndex][index];
      activeTerm.childrenVisible = !activeTerm.childrenVisible;
      taxonomyTerms[parentIndex][index] = activeTerm;
    }
    this.setState({
      taxonomyTerms: taxonomyTerms
    })
  }

  termsList(terms) {
    let options = [];
    let defaultValue = {value: '', label: '--'};
    options.push(defaultValue);
    for (let i=0; i<terms.length; i++) {
      let term = terms[i];
      let option = {value: term._id, label: term.label};
      options.push(option);
    }
    return options;
  }

  formSubmit(e) {
    e.preventDefault();
    let context = this;
    if (this.state.taxonomySaving) {
      return false;
    }
    this.setState({
      taxonomySaving: true,
      taxonomySaveBtn: <span><i className="fa fa-save" /> <i>Saving...</i> <Spinner size="sm" color="info" /></span>
    })
    if (this.state.taxonomyLabel==="") {
      this.setState({
        taxonomySaving: false,
        taxonomySaveBtn: <span><i className="fa fa-save" /> Save error <i className="fa fa-times" /></span>,
        taxonomyErrorVisible: true,
        taxonomyErrorText: <div>Please enter a Label to continue</div>
      });
      setTimeout(function() {
        context.setState({
          taxonomySaveBtn: <span><i className="fa fa-save" /> Save</span>
        });
      },2000);
      return false;
    }
    let postData = {
      label: this.state.taxonomyLabel,
      description: this.state.taxonomyDescription
    }
    if (typeof this.state.taxonomy._id!=="undefined" && this.state.taxonomy._id!=="") {
      postData._id = this.state.taxonomy._id;
    }
    axios({
        method: 'post',
        url: APIPath+'taxonomy',
        crossDomain: true,
        data: postData,
      })
    .then(function (response) {
      let responseData = response.data.data;
      if (responseData.status) {
        context.setState({
          taxonomySaving: false,
          taxonomySaveBtn: <span><i className="fa fa-save" /> Save success <i className="fa fa-check" /> </span>
        });
        context.load();
        context.loadItem(responseData.data._id);
        setTimeout(function() {
          context.setState({
            taxonomySaveBtn: <span><i className="fa fa-save" /> Save</span>
          });
        },1000);
      }
      else {
        let error = responseData.error;
        let errorText = [];
        for (let i=0; i<error.length; i++) {
          errorText.push(<div key={i}>{error[i]}</div>);
        }
        context.setState({
          taxonomySaving: false,
          taxonomySaveBtn: <span><i className="fa fa-save" /> Save error <i className="fa fa-times" /></span>,
          taxonomyErrorVisible: true,
          taxonomyErrorText: errorText
        });
        setTimeout(function() {
          context.setState({
            taxonomySaveBtn: <span><i className="fa fa-save" /> Save</span>
          });
        },2000);
      }

    })
    .catch(function (error) {
    });
  }

  editTermSubmit(e) {
    e.preventDefault();
    let context = this;
    if (this.state.termSaving) {
      return false;
    }
    this.setState({
      termSaving: true,
      updateTermBtn: <span><i className="fa fa-save" /> <i>Saving...</i> <Spinner size="sm" color="info" /></span>
    })
    if (this.state.termLabel==="") {
      this.setState({
        termSaving: false,
        updateTermBtn: <span><i className="fa fa-save" /> Save error <i className="fa fa-times" /></span>,
        errorVisible: true,
        errorText: <div>Please enter a Label to continue</div>
      });
      setTimeout(function() {
        context.setState({
          updateTermBtn: <span><i className="fa fa-save" /> Save</span>
        });
      },2000);
      return false;
    }
    if (this.state.termInverseLabel==="") {
      this.setState({
        termSaving: false,
        updateTermBtn: <span><i className="fa fa-save" /> Save error <i className="fa fa-times" /></span>,
        errorVisible: true,
        errorText: <div>Please enter an Inverse Label to continue</div>
      });
      setTimeout(function() {
        context.setState({
          updateTermBtn: <span><i className="fa fa-save" /> Save</span>
        });
      },2000);
      return false;
    }
    let postData = {
      taxonomyRef: this.state.taxonomy._id,
      label: this.state.termLabel,
      inverseLabel: this.state.termInverseLabel
    }
    if (this.state.termId!=="") {
      postData._id = this.state.termId;
    }
    if (this.state.termScopeNote!=="") {
      postData.scopeNote = this.state.termScopeNote;
    }
    if (this.state.termParentRef!=="") {
      postData.parentRef = this.state.termParentRef;
    }
    axios({
        method: 'post',
        url: APIPath+'taxonomy-term',
        crossDomain: true,
        data: postData,
      })
    .then(function (response) {
      let responseData = response.data.data;
      if (responseData.status) {
        context.setState({
          termSaving: false,
          termModalVisible: false,
          termId: '',
          termLabel: '',
          termInverseLabel: '',
          termScopeNote: '',
          termParentRef: '',
          updateTermBtn: <span><i className="fa fa-save" /> Save success <i className="fa fa-check" /> </span>
        });
        context.load();
        context.loadItem(context.state.taxonomy._id);
        setTimeout(function() {
          context.setState({
            updateTermBtn: <span><i className="fa fa-save" /> Save</span>
          });
        },1000);
      }
      else {
        let error = responseData.error;
        let errorText = [];
        for (let i=0; i<error.length; i++) {
          errorText.push(<div key={i}>{error[i]}</div>);
        }
        context.setState({
          termSaving: false,
          updateTermBtn: <span><i className="fa fa-save" /> Save error <i className="fa fa-times" /></span>,
          errorVisible: true,
          errorText: errorText
        });
        setTimeout(function() {
          context.setState({
            updateTermBtn: <span><i className="fa fa-save" /> Save</span>
          });
        },2000);
      }

    })
    .catch(function (error) {
    });
  }

  handleChange(e){
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  select2Change(selectedOption) {
    this.setState({
      termParentRef: selectedOption.value
    });
  }

  termModalToggle(term=null) {
    let visible = true;
    if (this.state.termModalVisible) {
      visible = false;
    }
    let updateState = {termModalVisible: visible};
    if (visible) {
      if (term!==null) {
        let termId = "";
        if (typeof term._id!=="undefined" && term._id!==null) {
          termId = term._id;
        }
        let termLabel = "";
        if (typeof term.label!=="undefined" && term.label!==null) {
          termLabel = term.label;
        }
        let termInverseLabel = "";
        if (typeof term.inverseLabel!=="undefined" && term.inverseLabel!==null) {
          termInverseLabel = term.inverseLabel;
        }
        let scopeNote = "";
        if (typeof term.scopeNote!=="undefined" && term.scopeNote!==null) {
          scopeNote = term.scopeNote;
        }
        let parentRef = "";
        if (typeof term.parentRef!=="undefined" && term.parentRef!==null) {
          parentRef = term.parentRef;
        }
        updateState.termId = termId;
        updateState.termLabel = termLabel;
        updateState.termInverseLabel = termInverseLabel;
        updateState.termScopeNote = scopeNote;
        updateState.termParentRef = parentRef;
      }
    }
    else {
      updateState.termId = '';
      updateState.termLabel = '';
      updateState.termInverseLabel = '';
      updateState.termScopeNote = '';
      updateState.termParentRef = '';
    }
    updateState.taxonomyErrorVisible = false;
    updateState.taxonomyErrorText = [];
    this.setState(updateState);
  }

  deleteTerm(_id) {
    let context = this;
    let params = {_id: _id}
    axios({
        method: 'delete',
        url: APIPath+'taxonomy-term',
        crossDomain: true,
        params: params,
      })
    .then(function (response) {
      //let responseData = response.data.data;
      context.setState({
        termModalVisible: false,
      });
      context.load();
      context.loadItem(context.state.taxonomy._id);
    })
    .catch(function (error) {
    });
  }

  componentDidMount() {
    this.load();
    loadProgressBar();
  }

  render() {
    let heading = "Taxonomies";
    let breadcrumbsItems = [
      {label: "Model", icon: "pe-7s-share", active: false, path: ""},
      {label: heading, icon: "", active: true, path: ""}
    ];

    let content = <div>
      <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    </div>
    if (!this.state.loading) {
      let taxonomiesHTML = this.list(this.state.taxonomies);

      let taxonomyHTML = this.showItem(this.state.taxonomy, this.state.taxonomyTerms);

      let modalTitle = "Add new term";
      let btnDelete = [];
      if (this.state.termId!=="") {
        modalTitle = "Edit term";
        btnDelete = <Button color="danger" size="sm" outline onClick={() => this.deleteTerm(this.state.termId)}><i className="fa fa-trash-o" /> Delete</Button>
      }

      let errorContainerClass = " hidden";
      if (this.state.errorVisible) {
        errorContainerClass = "";
      }
      let errorContainer = <div className={"error-container"+errorContainerClass}>{this.state.errorText}</div>

      let termsList = this.termsList(this.state.taxonomyTerms);


      let scopeNoteValue = "";
      if (this.state.termScopeNote!=="") {
        scopeNoteValue = this.state.termScopeNote;
      }

      let addTermModal = <Modal isOpen={this.state.termModalVisible} toggle={this.termModalToggle} className={this.props.className}>
          <ModalHeader toggle={this.termModalToggle}>{modalTitle}</ModalHeader>
          <ModalBody>
            {errorContainer}
            <Form onSubmit={this.editTermSubmit}>
              <FormGroup>
                <Label for="termLabelInput">Label</Label>
                <Input type="text" name="termLabel" id="termLabelInput" placeholder="Term label..." value={this.state.termLabel} onChange={this.handleChange}/>
              </FormGroup>
              <FormGroup>
                <Label for="termInverseLabelInput">Inverse Label</Label>
                <Input type="text" name="termInverseLabel" id="termInverseLabelInput" placeholder="Term inverse label..." value={this.state.termInverseLabel} onChange={this.handleChange}/>
              </FormGroup>
              <FormGroup>
                <Label for="termScopeNoteInput">Scope Note</Label>
                <Input type="textarea" name="termScopeNote" id="termScopeNoteInput" placeholder="Term scope note..." value={scopeNoteValue} onChange={this.handleChange}/>
              </FormGroup>
              <FormGroup>
                <Label>Parent Term</Label>
                <Select
                  name="parentRef"
                  value={this.state.parentRef}
                  onChange={this.select2Change}
                  options={termsList}
                />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            {btnDelete}
            <Button size="sm" color="info" outline onClick={this.editTermSubmit}>{this.state.updateTermBtn}</Button>
            <Button size="sm" color="secondary" className="pull-left" onClick={this.termModalToggle}>Cancel</Button>
          </ModalFooter>
        </Modal>;

      content = <div>
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                {taxonomiesHTML}
                <Button type="button" size="sm" color="info" className="pull-right" outline onClick={()=> {this.loadItem(null)}}>Add new <i className=" fa fa-plus"/></Button>
              </CardBody>
            </Card>
            {taxonomyHTML}
            {addTermModal}
          </div>
        </div>
      </div>
    }
    return (
      <div>
        <Breadcrumbs items={breadcrumbsItems} />
        <div className="row">
          <div className="col-12">
            <h2>{heading}</h2>
          </div>
        </div>
        {content}
      </div>
    );
  }
}
