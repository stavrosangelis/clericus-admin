import React from "react";
import axios from 'axios';
import {
  Card, CardBody,
  Button, Badge,
  Form, FormGroup, Label, Input,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Collapse,
  Spinner
} from "reactstrap";
import Select from 'react-select';
import { Link } from 'react-router-dom';
import {addGenericReference} from '../helpers/helpers';

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
      termRelations: [],
      termRelationsCollapse: false,
      termId: '',
      termLabel: '',
      termInverseLabel: '',
      termScopeNote: '',
      termParentRef: '',
      termCount: 0,
      termSaving: false,
      errorVisible: false,
      errorText: [],
      updateTermBtn: <span><i className="fa fa-save"/> Save</span>,
      taxonomySaving: false,
      taxonomyErrorVisible: false,
      taxonomyErrorText: [],
      taxonomySaveBtn: <span><i className="fa fa-save"/> Save</span>,

      deleteModalVisible: false,
      termsListOptions: [],
    }

    this.load = this.load.bind(this);
    this.loadItem = this.loadItem.bind(this);
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
    this.toggleTermCollapse = this.toggleTermCollapse.bind(this);
    this.linkNewTermToTaxonomy = this.linkNewTermToTaxonomy.bind(this);
    this.deleteTaxonomy = this.deleteTaxonomy.bind(this);
    this.deleteModalToggle = this.deleteModalToggle.bind(this);
  }

  async load() {
    let responseData = await axios({
        method: 'get',
        url: APIPath+'taxonomies',
        crossDomain: true,
      })
    .then(function (response) {
      return response.data.data;
    })
    .catch(function (error) {
    });
    this.setState({
      loading: false,
      taxonomies: responseData.data,
    })
  }

  async loadItem(_id=null) {
    if (_id===null) {
      this.setState({
        taxonomy: [],
        taxonomyLabel: '',
        taxonomyDescription: '',
        taxonomyErrorVisible: false,
        taxonomyErrorText: [],
      });
      return false;
    }
    let params = {
      _id: _id
    }
    let taxonomy = await axios({
        method: 'get',
        url: APIPath+'taxonomy',
        crossDomain: true,
        params: params,
      })
    .then(function (response) {
      let responseData = response.data.data;
      return responseData;
    })
    .catch(function (error) {
    });

    let newLabel = "";
    let newDescription = "";
    if (taxonomy.label!==null) {
      newLabel = taxonomy.label;
    }
    if (taxonomy.description!==null) {
      newDescription = taxonomy.description;
    }
    this.setState({
      taxonomy: taxonomy,
      taxonomyLabel: newLabel,
      taxonomyDescription: newDescription,
      taxonomyTerms: taxonomy.taxonomyterms
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
                  <Button size="sm" color="info" onClick={()=>this.termModalToggle()}>Add term <i className="fa fa-plus" /></Button>
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
                <Button size="sm" className="pull-left" color="danger" outline onClick={()=>this.deleteModalToggle()}><i className="fa fa-trash-o" /> Delete</Button>
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

  termsList(terms, termId=null, sep="") {
    let options = [];
    for (let i=0; i<terms.length; i++) {
      let term = terms[i];
      if (termId!==term._id) {
        let option = {value: term._id, label: sep+" "+term.label};
        options.push(option);
        if (term.children.length>0) {
          let childSep = "-"+sep;
          let termChildren = this.termsList(term.children, termId, childSep);
          for (let c=0; c<termChildren.length; c++) {
            options.push(termChildren[c]);
          }
        }
      }
    }

    return options;
  }

  async formSubmit(e) {
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
    let responseData = await axios({
      method: 'put',
      url: APIPath+'taxonomy',
      crossDomain: true,
      data: postData,
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
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
      let errorMsg = responseData.msg;
      let errorText = [];
      for (let i=0; i<errorMsg.length; i++) {
        errorText.push(<div key={i}>{errorMsg[i]}</div>);
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
    //addGenericReference
  }

  async editTermSubmit(e) {
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
    let putData = await axios({
        method: 'put',
        url: APIPath+'taxonomy-term',
        crossDomain: true,
        data: postData,
      })
    .then(function (response) {
      let responseData = response.data.data;
      return responseData;
    })
    .catch(function (error) {
    });
    if (putData.status) {
      if (this.state.termId==="") {
        await this.linkNewTermToTaxonomy(putData.data._id);
        postData._id = putData.data._id;
      }
      if (typeof postData.parentRef!=="undefined") {
        let newReference = {
          items: [
            {_id: postData.parentRef, type: "TaxonomyTerm"},
            {_id: postData._id, type: "TaxonomyTerm"},
          ],
          taxonomyTermLabel: "hasChild",
        }
        await addGenericReference(newReference);
      }
      this.setState({
        termSaving: false,
        termModalVisible: false,
        termId: '',
        termLabel: '',
        termInverseLabel: '',
        termScopeNote: '',
        termParentRef: '',
        updateTermBtn: <span><i className="fa fa-save" /> Save success <i className="fa fa-check" /> </span>
      });
      await this.load();
      await this.loadItem(this.state.taxonomy._id);
      setTimeout(function() {
        context.setState({
          updateTermBtn: <span><i className="fa fa-save" /> Save</span>
        });
      },1000);
    }
    else {
      let error = putData.error;
      let errorText = [];
      for (let i=0; i<error.length; i++) {
        errorText.push(<div key={i}>{error[i]}</div>);
      }
      this.setState({
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
  }

  async linkNewTermToTaxonomy(newTermId) {
    let newReference = {
      items: [
        {_id: this.state.taxonomy._id, type: "Taxonomy"},
        {_id: newTermId, type: "TaxonomyTerm"}
      ],
      taxonomyTermLabel: "hasChild",
    }
    let addReference = await addGenericReference(newReference);
    return addReference;
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
    let visible = !this.state.termModalVisible;
    let updateState = {termModalVisible: visible};
    if (visible) {
      if (term!==null) {
        this.loadTerm(term);
      }
      else {
        let termsListOptions = this.termsList(this.state.taxonomyTerms, null, "");
        termsListOptions.unshift({value: "", label: "--"});
        updateState.termsListOptions = termsListOptions;
      }
    }
    else {
      updateState.termId = '';
      updateState.termLabel = '';
      updateState.termInverseLabel = '';
      updateState.termScopeNote = '';
      updateState.termParentRef = '';
      updateState.parentRef = '';
      updateState.termCount = 0;
      updateState.termRelations = [];
    }
    updateState.taxonomyErrorVisible = false;
    updateState.taxonomyErrorText = [];
    updateState.errorVisible = false;
    updateState.errorText= "";
    this.setState(updateState);
  }

  async loadTerm(term) {
    let params = {
      _id: term._id
    }
    let responseTerm = await axios({
        method: 'get',
        url: APIPath+'taxonomy-term',
        crossDomain: true,
        params: params,
      })
    .then(function (response) {
      return response.data.data;
    })
    .catch(function (error) {
    });
    let termId = "";
    if (typeof responseTerm._id!=="undefined" && responseTerm._id!==null) {
      termId = responseTerm._id;
    }
    let termLabel = "";
    if (typeof responseTerm.label!=="undefined" && responseTerm.label!==null) {
      termLabel = responseTerm.label;
    }
    let termInverseLabel = "";
    if (typeof responseTerm.inverseLabel!=="undefined" && responseTerm.inverseLabel!==null) {
      termInverseLabel = responseTerm.inverseLabel;
    }
    let scopeNote = "";
    if (typeof responseTerm.scopeNote!=="undefined" && responseTerm.scopeNote!==null) {
      scopeNote = responseTerm.scopeNote;
    }
    let count = "";
    if (typeof responseTerm.count!=="undefined" && responseTerm.count!==null) {
      count = parseInt(responseTerm.count,10);
    }
    let parentRef = "";
    if (typeof responseTerm.parentRef!=="undefined" && responseTerm.parentRef!==null) {
      parentRef = responseTerm.parentRef;
    }
    let termsListOptions = this.termsList(this.state.taxonomyTerms, termId, "");
    termsListOptions.unshift({value: "", label: "--"});
    this.setState({
      termId: termId,
      termLabel: termLabel,
      termInverseLabel: termInverseLabel,
      termScopeNote: scopeNote,
      termParentRef: parentRef,
      termCount: count,
      termRelations: responseTerm.relations,
      termsListOptions: termsListOptions
    }, ()=> {
      if (typeof parentRef!=="undefined" && parentRef!==null && parentRef!=="") {
        let parentRefOption = this.state.termsListOptions.find(t=>t.value===parentRef);
        if (typeof parentRefOption!=="undefined") {
          this.setState({
            parentRef: parentRefOption
          });
        }
      }
    });
  }

  deleteTerm(_id) {
    let context = this;
    let params = {_id: _id}
    axios({
        method: 'delete',
        url: APIPath+'taxonomy-term',
        crossDomain: true,
        data: params,
      })
    .then(function (response) {
      let responseData = response.data;
      if (responseData.status) {
        context.setState({
          termModalVisible: false,
        });
        context.load();
        context.loadItem(context.state.taxonomy._id);
      }
      else {
        let error = responseData.msg;
        let errorText = [];
        for (let i=0; i<error.length; i++) {
          errorText.push(<div key={i}>{error[i]}</div>);
        }
        context.setState({
          errorVisible: true,
          errorText: errorText
        });
      }
    })
    .catch(function (error) {
    });
  }

  async deleteTaxonomy() {
    if (typeof this.state.taxonomy._id==="undefined" || this.state.taxonomy._id==="") {
      return false;
    }
    let params = {_id: this.state.taxonomy._id}
    let deleteTax = await axios({
        method: 'delete',
        url: APIPath+'taxonomy',
        crossDomain: true,
        data: params,
      })
    .then(function (response) {
      let responseData = response.data;
      return responseData;
    })
    .catch(function (error) {
      console.log(error);
    });
    if (deleteTax.status) {
      this.setState({
        deleteModalVisible: false,
        taxonomy: null,
      })
      this.load();
    }
    else {
      let errorMsg = deleteTax.msg;
      let errorText = [];
      for (let i=0; i<errorMsg.length; i++) {
        errorText.push(<div key={i}>{errorMsg[i]}</div>);
      }
      this.setState({
        taxonomyErrorVisible: true,
        taxonomyErrorText: errorText,
      });
    }
  }

  deleteModalToggle() {
    this.setState({
      deleteModalVisible: !this.state.deleteModalVisible
    })
  }

  toggleTermCollapse() {
    this.setState({
      termRelationsCollapse: !this.state.termRelationsCollapse
    })
  }

  componentDidMount() {
    this.load();
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
    let deleteModal = [];
    if (!this.state.loading) {
      let taxonomiesHTML = this.list(this.state.taxonomies);

      let taxonomyHTML = this.showItem(this.state.taxonomy, this.state.taxonomyTerms);

      let modalTitle = "Add new term";
      let btnDelete = [];
      if (this.state.termId!=="") {
        modalTitle = "Edit term";
        btnDelete = <Button color="danger" size="sm" outline onClick={() => this.deleteTerm(this.state.termId)} className="pull-left"><i className="fa fa-trash-o" /> Delete</Button>
      }

      let errorContainerClass = " hidden";
      if (this.state.errorVisible) {
        errorContainerClass = "";
      }
      let errorContainer = <div className={"error-container"+errorContainerClass}>{this.state.errorText}</div>

      let termsList = this.state.termsListOptions;

      let scopeNoteValue = "";
      if (this.state.termScopeNote!=="") {
        scopeNoteValue = this.state.termScopeNote;
      }

      let termCount = [];
      if (this.state.termCount>0) {
        let term = this.state.taxonomyTerms.find(t=>t._id===this.state.termId);
        let termRelationsCollapseActive = " active";
        if (!this.state.termRelationsCollapse) {
          termRelationsCollapseActive = "";
        }

        let termRelationsOutput = this.state.termRelations.map((t,i)=>{
          let source = t.source;
          let target = t.target;
          let sourceLabel = source.nodeType.toLowerCase();
          let targetLabel = target.nodeType.toLowerCase();
          let sourceLink = "/"+sourceLabel+"/"+source._id;
          let targetLink = "/"+targetLabel+"/"+target._id;
          if (sourceLabel==="entity") {
            sourceLabel = "entities";
            sourceLink = "/"+sourceLabel;
          }
          if (targetLabel==="entity") {
            targetLabel = "entities";
            targetLink = "/"+targetLabel
          }

          let item = <li key={i}>
            <Link href={sourceLink} to={sourceLink} target="_blank">{source.label}</Link>{' '}
            <i>{this.state.termLabel}</i>{' '}
            <Link href={targetLink} to={targetLink} target="_blank">{target.label}</Link>
          </li>
          return item;
        });
        termCount = [
          <div className="text-right" onClick={()=>this.toggleTermCollapse()} key={0}><b>Relations count</b>: {this.state.termCount} &nbsp;&nbsp; <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+termRelationsCollapseActive} /></Button></div>,
          <Collapse isOpen={this.state.termRelationsCollapse} key={1} className="term-relations-collapse-container">
            <div className="text-right refresh-btn" onClick={()=>this.loadTerm(term)}>Refresh <i className="fa fa-refresh" /></div>
            <ol>{termRelationsOutput}</ol>
          </Collapse>
      ]
      }
      let addTermModal = <Modal isOpen={this.state.termModalVisible} toggle={this.termModalToggle} className={this.props.className}>
          <ModalHeader toggle={this.termModalToggle}>{modalTitle}</ModalHeader>
          <ModalBody>
            {errorContainer}
            {termCount}
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
          </ModalFooter>
        </Modal>;

      let deleteLabel = "";
      if (this.state.taxonomy!==null && typeof this.state.taxonomy.label!=="undefined") {
        deleteLabel = this.state.taxonomy.label;
      }
      deleteModal = <Modal isOpen={this.state.deleteModalVisible} toggle={this.deleteModalToggle}>
        <ModalHeader toggle={this.deleteModalToggle}>Delete "{deleteLabel}"</ModalHeader>
        <ModalBody>
          <div className="form-group">
            <p>The taxonomy "{deleteLabel}" will be deleted. Continue?</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" size="sm" onClick={()=>this.deleteTaxonomy()}><i className="fa fa-trash-o" /> Delete</Button>
          <Button color="secondary" className="pull-left" size="sm" onClick={this.deleteModalToggle}>Cancel</Button>
        </ModalFooter>
      </Modal>

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
            {deleteModal}
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
