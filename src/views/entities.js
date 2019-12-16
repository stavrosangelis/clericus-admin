import React from "react";
import axios from 'axios';
import {
  Card,CardBody,
  Collapse,
  Button,
  Form, FormGroup, Label, Input,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Spinner
} from "reactstrap";
import {Breadcrumbs} from '../components/breadcrumbs';
import Select from 'react-select';
import {connect} from "react-redux";
import {addGenericReference} from '../helpers/helpers';

import {
  loadDefaultEntities
} from "../redux/actions/main-actions";

function mapDispatchToProps(dispatch) {
  return {
    loadDefaultEntities: () => dispatch(loadDefaultEntities()),
  }
}

const APIPath = process.env.REACT_APP_APIPATH;

class Entities extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      entities: [],
      entity: null,
      entityDefinition: '',
      entityExample: '',
      entityLabel: '',
      entityParent: null,
      taxonomy: [],
      taxonomyTerms: [],
      detailsOpen: true,
      propertiesOpen: true,
      propertyModalVisible: false,
      property: null,
      propertyTerm: '',
      propertyEntityRef: '',
      propertySaving: false,
      propertyErrorVisible: false,
      propertyErrorText: [],
      propertySaveBtn: <span><i className="fa fa-save"/> Save</span>,
      updating: false,
      updateBtn: <span><i className="fa fa-save" /> Update</span>,
      errorVisible: false,
      errorText: [],
    }

    this.load = this.load.bind(this);
    this.loadEntity = this.loadEntity.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.propertySubmit = this.propertySubmit.bind(this);
    this.deleteProperty = this.deleteProperty.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.entitiesList = this.entitiesList.bind(this);
    this.propertiesList = this.propertiesList.bind(this);
    this.loadTaxonomy = this.loadTaxonomy.bind(this);
    this.termsList = this.termsList.bind(this);
    this.list = this.list.bind(this);
    this.togglePropertyModal = this.togglePropertyModal.bind(this);
  }

  load() {
    let context = this;
    axios({
        method: 'get',
        url: APIPath+'entities',
        crossDomain: true,
      })
    .then(function (response) {
      let responseData = response.data.data;
      context.setState({
        loading: false,
        entities: responseData.data,
      })
    })
    .catch(function (error) {
    });
  }

  loadEntity(_id=null) {
    if (_id===null) {
      return false;
    }
    let context = this;
    let params = {_id: _id}
    axios({
        method: 'get',
        url: APIPath+'entity',
        crossDomain: true,
        params: params
      })
    .then(function (response) {
      let responseData = response.data.data;
      let entityDefinition = '';
      let entityExample = '';
      let entityLabel = '';
      let entityParent = null;
      if (responseData.definition!==null) {
        entityDefinition = responseData.definition;
      }
      if (responseData.example!==null) {
        entityExample = responseData.example;
      }
      if (responseData.label!==null) {
        entityLabel = responseData.label;
      }
      if (responseData.parent!==null) {
        entityParent = responseData.parent;
      }
      context.setState({
        entity: responseData,
        entityDefinition: entityDefinition,
        entityExample: entityExample,
        entityLabel: entityLabel,
        entityParent: entityParent,
      })
    })
    .catch(function (error) {
    });
  }

  toggleCollapse(name) {
    let value = true;
    if (this.state[name]==="undefined" || this.state[name]) {
      value = false
    }
    this.setState({
      [name]: value
    });
  }


  formSubmit(e) {
    e.preventDefault();
    if (this.state.updating) {
      return false;
    }
    this.setState({
      updating: true,
      updateBtn: <span><i className="fa fa-save" /> <i>Saving...</i> <Spinner color="info" size="sm"/></span>
    });
    let postData = {
      _id: this.state.entity._id,
      label: this.state.entityLabel,
      labelId: this.state.entity.labelId,
      definition: this.state.entityDefinition,
      example: this.state.entityExample,
      properties: this.state.entity.properties
    }
    let parentValue = null;
    if (this.state.entityParent!==null && this.state.entityParent.value!=='') {
      parentValue = this.state.entityParent.value;
    }
    postData.parent = parentValue;
    let context = this;
    if (this.label==="") {
      this.setState({
        errorVisible: true,
        errorText: <div>Please add a label to continue</div>,
        updating: false,
        updateBtn: <span><i className="fa fa-save" /> Save error <i className="fa fa-times" /></span>,
      });
      setTimeout(function() {
        context.setState({
          updateBtn: <span><i className="fa fa-save" /> Save</span>
        });
      },2000);
      return false;
    }

    axios({
        method: 'put',
        url: APIPath+'entity',
        crossDomain: true,
        data: postData,
      })
    .then(function (response) {
      let responseData = response.data;
      if (responseData.status) {
        context.setState({
          errorVisible: false,
          errorText: [],
          updating: false,
          updateBtn: <span><i className="fa fa-save" /> Save success <i className="fa fa-check" /> </span>,
        });
        context.load();
        context.loadEntity(context.state.entity._id);
        context.props.loadDefaultEntities();
        setTimeout(function() {
          context.setState({
            updateBtn: <span><i className="fa fa-save" /> Save</span>
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
          errorVisible: true,
          errorText: errorText,
          updating: false,
          updateBtn: <span><i className="fa fa-save" /> Save error <i className="fa fa-times" /></span>,
        });
        setTimeout(function() {
          context.setState({
            updateBtn: <span><i className="fa fa-save" /> Save</span>
          });
        },2000);
      }

    })
    .catch(function (error) {
    });
  }

  async propertySubmit(e) {
    e.preventDefault();
    let context = this;
    if (this.state.propertySaving) {
      return false;
    }
    this.setState({
      propertySaving: true,
      propertySaveBtn: <span><i className="fa fa-save" /> <i>Saving...</i> <Spinner size="sm" color="info" /></span>
    })
    if (this.state.propertyTerm==="" || this.state.propertyTerm.value==="") {
      this.setState({
        propertySaving: false,
        propertySaveBtn: <span><i className="fa fa-save" /> Save error <i className="fa fa-times" /></span>,
        propertyErrorVisible: true,
        propertyErrorText: <div>Please select a Relation to continue</div>
      });
      setTimeout(function() {
        context.setState({
          propertySaveBtn: <span><i className="fa fa-save" /> Save</span>
        });
      },2000);
      return false;
    }
    if (this.state.propertyEntityRef==="" || this.state.propertyEntityRef.value==="") {
      this.setState({
        propertySaving: false,
        propertySaveBtn: <span><i className="fa fa-save" /> Save error <i className="fa fa-times" /></span>,
        propertyErrorVisible: true,
        propertyErrorText: <div>Please select a Referenced Entity to continue</div>
      });
      setTimeout(function() {
        context.setState({
          propertySaveBtn: <span><i className="fa fa-save" /> Save</span>
        });
      },2000);
      return false;
    }
    this.setState({
      propertySaving: false,
    });

    let newReference = {
      items: [
        {_id: this.state.entity._id, type: "Entity"},
        {_id: this.state.propertyEntityRef.value, type: "Entity"}
      ],
      taxonomyTermId: this.state.propertyTerm.value,
    }
    let addReference = await addGenericReference(newReference);
    if (addReference.data.status) {
      this.setState({
        propertySaving: false,
        propertySaveBtn: <span><i className="fa fa-save" /> Save success <i className="fa fa-check" /> </span>,
        propertyModalVisible: false
      });
      this.loadEntity(this.state.entity._id);
      this.props.loadDefaultEntities();
      setTimeout(function() {
        context.setState({
          propertySaveBtn: <span><i className="fa fa-save" /> Save</span>
        });
      },1000);
    }
    else {
      let error = addReference.error;
      let errorText = [];
      for (let i=0; i<error.length; i++) {
        errorText.push(<div key={i}>{error[i]}</div>);
      }
      this.setState({
        propertySaving: false,
        propertySaveBtn: <span><i className="fa fa-save" /> Save error <i className="fa fa-times" /></span>,
        propertyErrorVisible: true,
        propertyErrorText: errorText
      });
      setTimeout(function() {
        context.setState({
          propertySaveBtn: <span><i className="fa fa-save" /> Save</span>
        });
      },2000);
    }
  }

  deleteProperty() {
    let context = this;
    let newReference = {
      items: [
        {_id: this.state.entity._id, type: "Entity"},
        {_id: this.state.propertyEntityRef.value, type: "Entity"}
      ],
      taxonomyTermId: this.state.propertyTerm.value,
    }
    if (this.state.property.term.direction==="to") {
      newReference = {
        items: [
          {_id: this.state.propertyEntityRef.value, type: "Entity"},
          {_id: this.state.entity._id, type: "Entity"}
        ],
        taxonomyTermId: this.state.propertyTerm.value,
      }
    }
    axios({
        method: 'delete',
        url: APIPath+'reference',
        crossDomain: true,
        data: newReference,
      })
    .then(function (response) {
      let responseData = response.data;
      if (responseData.status) {
        context.setState({
          property: null,
          propertyModalVisible: false
        });

        context.loadEntity(context.state.entity._id);
        context.props.loadDefaultEntities();
      }
      else {
        let error = responseData.data.error;
        let errorText = [];
        for (let i=0; i<error.length; i++) {
          errorText.push(<div key={i}>{error[i]}</div>);
        }
        context.setState({
          propertyErrorVisible: true,
          propertyErrorText: errorText
        });
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

  select2Change(selectedOption, element=null) {
    if (element===null) {
      return false;
    }
    this.setState({
      [element]: selectedOption
    });
  }

  entitiesList(entities) {
    let options = [];
    let defaultValue = {value: '', label: '--'};
    options.push(defaultValue);
    for (let i=0; i<entities.length; i++) {
      let entity = entities[i];
      let option = {value: entity._id, label: entity.label};
      options.push(option);
    }
    return options;
  }

  list(entities, parentKey=null) {
    let output = [];
    for (let i=0; i<entities.length; i++) {
      let entity = entities[i];
      let item = <li key={i} onClick={()=>this.loadEntity(entity._id)}>{entity.label}</li>;
      output.push(item);
      if (typeof entity.children!=="undefined" && entity.children.length>0) {
        let children = this.list(entity.children, i);
        output.push(children);
      }
    }
    let itemKey = 0;
    if (parentKey!==null) {
      itemKey = parentKey;
    }
    return <ul className="entities-list" key={"list-"+itemKey}>{output}</ul>;
  }

  togglePropertyModal(property=null) {
    let visible = !this.state.propertyModalVisible;
    let update = {propertyModalVisible: visible};
    if (visible) {
      let propertyTerm = '';
      let propertyEntityRef = '';
      if (property!==null) {
        propertyTerm = {label: property.term.label, value: property.term._id};
        propertyEntityRef = {label: property.entityRef.label, value: property.entityRef._id};
      }
      update.property = property;
      update.propertyTerm = propertyTerm;
      update.propertyEntityRef = propertyEntityRef;
    }
    else {
      update.property = null;
      update.propertyTerm = '';
      update.propertyEntityRef = '';
    }
    this.setState(update);
  }

  loadTaxonomy() {
    let context = this;
    let params = {
      systemType: "relationsTypes"
    }
    axios({
        method: 'get',
        url: APIPath+'taxonomy',
        crossDomain: true,
        params: params
      })
    .then(function (response) {
      let responseData = response.data.data;
      context.setState({
        loading: false,
        taxonomy: responseData,
        taxonomyTerms: responseData.taxonomyterms
      })
    })
    .catch(function (error) {
    });
  }

  termsList(terms, sep="") {
    let options = [];
    for (let i=0; i<terms.length; i++) {
      let term = terms[i];
      let option = {value: term._id, label: sep+" "+term.label};
      options.push(option);
    }
    return options;
  }

  propertiesList(entity) {
    let output = [];
    if (entity!==null) {
      for (let i=0; i<entity.properties.length; i++) {
        let property = entity.properties[i];
        let label = property.term.label;
        let taxonomyTerm = this.state.taxonomyTerms.find(item=>item.label===label);
        property.term.direction = "from";
        if (typeof taxonomyTerm==="undefined") {
          taxonomyTerm = this.state.taxonomyTerms.find(item=>item.inverseLabel===label);
          property.term.direction = "to";
        }
        if (typeof taxonomyTerm!=="undefined") {
          property.term._id = taxonomyTerm._id;
        }
        let item = <li key={i} onClick={()=>this.togglePropertyModal(property)}><span className="property-term">{label}</span> <span className="property-entity">{property.entityRef.label}</span></li>;
        output.push(item);
      }
      if (entity.properties.length>0) {
        output = <ul className="entity-properties">{output}</ul>
      }
    }
    return output;
  }

  componentDidMount() {
    this.load();
    this.loadTaxonomy();
  }

  render() {
    let heading = "Entities";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-share", active: true, path: ""}
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
      let detailsOpenActive = " active";
      if (!this.state.detailsOpen) {
        detailsOpenActive = "";
      }
      let propertiesOpenActive = " active";
      if (!this.state.propertiesOpen) {
        propertiesOpenActive = "";
      }

      let entitiesHTML = this.list(this.state.entities);

      let entityVisible = "hidden";
      if (this.state.entity!==null) {
        entityVisible = "";
      }

      let entitiesList = this.entitiesList(this.state.entities);
      let defaultValue = {value: '', label: '--'};
      let termsList = this.termsList(this.state.taxonomyTerms);
      termsList.unshift(defaultValue);

      let propertiesList = this.propertiesList(this.state.entity);

      let propertyModalTitle = "Edit property";
      if (this.state.property===null) {
        propertyModalTitle = "Add new property";
      }
      let propertyErrorContainerClass = " hidden";
      if (this.state.propertyErrorVisible) {
        propertyErrorContainerClass = "";
      }
      let propertyErrorContainer = <div className={"error-container"+propertyErrorContainerClass}>{this.state.propertyErrorText}</div>

      let deleteBtn = [];
      if (this.state.property!==null) {
        deleteBtn = <Button color="danger" outline onClick={this.deleteProperty} className="pull-left" size="sm"><i className="fa fa-trash-o" /> Delete</Button>
      }
      let propertySaveBtn = [];
      if(this.state.property===null) {
        propertySaveBtn = <Button color="primary" outline size="sm" onClick={this.propertySubmit}>{this.state.propertySaveBtn}</Button>
      }
      let propertyModal = <Modal isOpen={this.state.propertyModalVisible} toggle={()=>this.togglePropertyModal(null)} className={this.props.className}>
          <ModalHeader toggle={()=>this.togglePropertyModal(null)}>{propertyModalTitle}</ModalHeader>
          <ModalBody>
            {propertyErrorContainer}
            <Form onSubmit={this.propertySubmit}>
              <FormGroup>
                <Label>Relation</Label>
                <Select
                  name="term"
                  value={this.state.propertyTerm}
                  onChange={(selectedOption)=>this.select2Change(selectedOption, "propertyTerm")}
                  options={termsList}
                />
              </FormGroup>
              <FormGroup>
                <Label>Referenced Entity</Label>
                <Select
                  name="entityRef"
                  value={this.state.propertyEntityRef}
                  onChange={(selectedOption)=>this.select2Change(selectedOption, "propertyEntityRef")}
                  options={entitiesList}
                />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter className="modal-footer">
            {propertySaveBtn}
            {deleteBtn}
          </ModalFooter>
        </Modal>

      let errorContainerClass = " hidden";
      if (this.state.errorVisible) {
        errorContainerClass = "";
      }
      let errorContainer = <div className={"error-container"+errorContainerClass}>{this.state.errorText}</div>

      let entityParentValue = entitiesList.find(el=>el.value===this.state.entityParent);

      content = <div>
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                <div className="row">

                  <div className="col-xs-12 col-sm-6">
                    {entitiesHTML}
                  </div>

                  <div className="col-xs-12 col-sm-6">
                    <div className={entityVisible}>
                      <div onClick={this.toggleCollapse.bind(this, 'detailsOpen')}><b>Details</b> <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+detailsOpenActive} /></Button></div>
                      <Collapse isOpen={this.state.detailsOpen}>
                        <div style={{padding: "10px 0"}}>
                          {errorContainer}
                          <Form onSubmit={this.formSubmit}>
                            <FormGroup>
                              <Label for="labelInput">Label</Label>
                              <Input type="text" name="entityLabel" id="labelInput" placeholder="Entity label..." value={this.state.entityLabel} onChange={this.handleChange}/>
                            </FormGroup>
                            <FormGroup>
                              <Label for="definitionInput">Definition</Label>
                              <Input type="textarea" name="entityDefinition" id="definitionInput" placeholder="Entity definition..." value={this.state.entityDefinition} onChange={this.handleChange}/>
                            </FormGroup>
                            <FormGroup>
                              <Label for="exampleInput">Example</Label>
                              <Input type="textarea" name="entityExample" id="exampleInput" placeholder="Entity example..." value={this.state.entityExample} onChange={this.handleChange}/>
                            </FormGroup>
                            <FormGroup>
                              <Label>Parent Entity</Label>
                              <Select
                                name="parent"
                                value={entityParentValue}
                                onChange={(selectedOption)=>this.select2Change(selectedOption, "entityParent")}
                                options={entitiesList}
                              />
                            </FormGroup>
                            <div className="text-right">
                              <Button outline color="info" size="sm" type="submit">{this.state.updateBtn}</Button>
                            </div>
                          </Form>
                        </div>
                      </Collapse>
                      <hr style={{margin: "10px 0"}} />
                      <div onClick={this.toggleCollapse.bind(this, 'propertiesOpen')}><b>Properties</b> <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+propertiesOpenActive} /></Button></div>
                      <Collapse isOpen={this.state.propertiesOpen}>
                        <div style={{padding: "10px 0"}}>
                          {propertiesList}
                          <div className="footer-box">
                            <Button outline color="info" size="sm" onClick={()=>this.togglePropertyModal(null)}>Add new property <i className="fa fa-plus" /></Button>
                          </div>

                        </div>
                      </Collapse>
                    </div>
                  </div>

                </div>
              </CardBody>
            </Card>
          </div>
        </div>
        {propertyModal}
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
export default Entities = connect(null, mapDispatchToProps)(Entities);
