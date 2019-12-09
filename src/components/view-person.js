import React, { Component } from 'react';
import {
  Card, CardTitle, CardBody,
  Button, ButtonGroup,
  Form, FormGroup, Label, Input, InputGroup, InputGroupAddon,
  Collapse} from 'reactstrap';
import {
  getThumbnailURL,
  getPersonLabel,
  loadRelatedEvents,
  loadRelatedOrganisations,
  loadRelatedPeople,
  loadRelatedResources
} from '../helpers/helpers';
import axios from 'axios';
import PersonAppelations from './person-alternate-appelations.js';
const APIPath = process.env.REACT_APP_APIPATH;

export default class ViewPerson extends Component {
  constructor(props) {
    super(props);

    let person = this.props.person;
    let status = 'private';
    let honorificPrefix = [""];
    let firstName = '';
    let middleName = '';
    let lastName = '';
    let alternateAppelations = [];
    let description = '';
    if (person!==null) {
      if (typeof person.honorificPrefix!=="undefined" && person.honorificPrefix!==null) {
        honorificPrefix = person.honorificPrefix;
      }
      if (typeof person.firstName!=="undefined" && person.firstName!==null) {
        firstName = person.firstName;
      }
      if (typeof person.middleName!=="undefined" && person.middleName!==null) {
        middleName = person.middleName;
      }
      if (typeof person.lastName!=="undefined" && person.lastName!==null) {
        lastName = person.lastName;
      }
      if (typeof person.alternateAppelations!=="undefined" && person.alternateAppelations!==null) {
        alternateAppelations = person.alternateAppelations;
      }
      if (typeof person.description!=="undefined" && person.description!==null) {
        description = person.description;
      }
      if (typeof person.status!=="undefined" && person.status!==null) {
        status = person.status;
      }
    }

    this.state = {
      detailsOpen: true,
      metadataOpen: false,
      eventsOpen: false,
      organisationsOpen: false,
      peopleOpen: false,
      honorificPrefix: honorificPrefix,
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      alternateAppelations: alternateAppelations,
      description: description,
      status: status,
    }
    this.updateStatus = this.updateStatus.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleMultipleChange = this.handleMultipleChange.bind(this);
    this.parseMetadata = this.parseMetadata.bind(this);
    this.parseMetadataItems = this.parseMetadataItems.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.deleteRef = this.deleteRef.bind(this);
    this.updateAlternateAppelation = this.updateAlternateAppelation.bind(this);
    this.removeAlternateAppelation = this.removeAlternateAppelation.bind(this);
    this.removeHP = this.removeHP.bind(this);
    this.addHP = this.addHP.bind(this);
  }

  updateStatus(value) {
    this.setState({status:value});
  }

  formSubmit(e) {
    e.preventDefault();
    let newData = {
      honorificPrefix: this.state.honorificPrefix,
      firstName: this.state.firstName,
      middleName: this.state.middleName,
      lastName: this.state.lastName,
      alternateAppelations: this.state.alternateAppelations,
      description: this.state.description,
      status: this.state.status,
    }
    this.props.update(newData);
  }

  handleChange(e){
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleMultipleChange(e, i){
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    let elem = this.state[name];
    elem[i] = value;
    this.setState({
      [name]: elem
    });
  }

  parseMetadata(metadata) {
    if (metadata===null) {
      return false;
    }
    let metadataOutput = [];
    let i = 0;
    for (let key in metadata) {
      let metaItems = metadata[key];
      let metadataOutputItems = [];
      if (metaItems!==null && typeof metaItems.length==="undefined") {
        metadataOutputItems = this.parseMetadataItems(metaItems);
      }
      else {
        if (metaItems!==null) {
          let newItems = this.parseMetadata(metaItems[0]);
          metadataOutputItems.push(newItems)
        }
      }
      metadataOutputItems = <div className="list-items">{metadataOutputItems}</div>;
      let metaRow = <div key={i}>
        <div className="metadata-title">{key}</div>
        {metadataOutputItems}
        </div>
      metadataOutput.push(metaRow);
      i++;
    }
    return metadataOutput;
  }

  parseMetadataItems(metaItems) {
    let i=0;
    let items = [];
    for (let metaKey in metaItems) {
      let value = metaItems[metaKey];
      let newRow = [];
      if (typeof value!=="object") {
        newRow = <div key={i}><label>{metaKey}</label> : {metaItems[metaKey]}</div>
      }
      else {
        let newRows = <div className="list-items">{this.parseMetadataItems(value)}</div>;
        newRow = <div key={i}><div className="metadata-title">{metaKey}</div>{newRows}</div>
      }
      items.push(newRow);
      i++
    }
    return items;
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

  deleteRef(ref, refTerm, model) {
    let context = this;
    let params = {
      items: [
        {_id: this.props.person._id, type: "Person"},
        {_id: ref, type: model}
      ],
      taxonomyTermLabel: refTerm,
    }
    axios({
      method: 'delete',
      url: APIPath+'reference',
      crossDomain: true,
      data: params
    })
	  .then(function (response) {
      context.props.reload();
	  })
	  .catch(function (error) {
	  });
  }

  updateAlternateAppelation(index, data) {
    let person = this.props.person;
    let alternateAppelations = person.alternateAppelations;
    if (index==="new") {
      alternateAppelations.push(data);
    }
    else if (index!==null) {
      alternateAppelations[index] = data;
    }
    this.setState({
      alternateAppelations: alternateAppelations
    },()=> {
      let newData = {
        honorificPrefix: this.state.honorificPrefix,
        firstName: this.state.firstName,
        middleName: this.state.middleName,
        lastName: this.state.lastName,
        alternateAppelations: this.state.alternateAppelations,
        description: this.state.description,
        status: this.state.status,
      }
      this.props.update(newData);
    });
  }

  removeAlternateAppelation(index) {
    let person = this.props.person;
    let alternateAppelations = person.alternateAppelations;
    if (index!==null) {
      alternateAppelations.splice(index,1);
    }
    this.setState({
      alternateAppelations: alternateAppelations
    },()=> {
      let newData = {
        honorificPrefix: this.state.honorificPrefix,
        firstName: this.state.firstName,
        middleName: this.state.middleName,
        lastName: this.state.lastName,
        alternateAppelations: this.state.alternateAppelations,
        description: this.state.description,
        status: this.state.status,
      }
      this.props.update(newData);
    });
  }

  removeHP(i) {
    let hps = this.state.honorificPrefix;
    hps.splice(i,1);
    this.setState({
      honorificPrefix: hps
    });
  }
  addHP() {
    let hps = this.state.honorificPrefix;
    hps.push("");
    this.setState({
      honorificPrefix: hps
    });
  }

  render() {
    let detailsOpenActive = " active";
    if (!this.state.detailsOpen) {
      detailsOpenActive = "";
    }
    let metadataOpenActive = " active";
    if (!this.state.metadataOpen) {
      metadataOpenActive = "";
    }
    let eventsOpenActive = " active";
    if (!this.state.eventsOpen) {
      eventsOpenActive = "";
    }
    let organisationsOpenActive = " active";
    if (!this.state.organisationsOpen) {
      organisationsOpenActive = "";
    }
    let peopleOpenActive = " active";
    if (!this.state.peopleOpen) {
      peopleOpenActive = "";
    }
    let resourcesOpenActive = " active";
    if (!this.state.resourcesOpen) {
      resourcesOpenActive = "";
    }
    let statusPublic = "secondary";
    let statusPrivate = "secondary";
    let publicOutline = true;
    let privateOutline = false;
    if (this.state.status==="public") {
      statusPublic = "success";
      publicOutline = false;
      privateOutline = true;
    }

    let metadataItems = this.parseMetadata();
    let relatedEvents = loadRelatedEvents(this.props.person, this.deleteRef);
    let relatedOrganisations = loadRelatedOrganisations(this.props.person, this.deleteRef);
    let relatedPeople = loadRelatedPeople(this.props.person, this.deleteRef);
    let relatedResources = loadRelatedResources(this.props.person, this.deleteRef);

    let metadataCard = " hidden";
    if (metadataItems.length>0) {
      metadataItems = "";
    }

    let relatedEventsCard = " hidden";
    if (relatedEvents.length>0) {
      relatedEventsCard = "";
    }
    let relatedOrganisationsCard = " hidden";
    if (relatedOrganisations.length>0) {
      relatedOrganisationsCard = "";
    }
    let relatedPeopleCard = " hidden";
    if (relatedPeople.length>0) {
      relatedPeopleCard = "";
    }
    let relatedResourcesCard = " hidden";
    if (relatedResources.length>0) {
      relatedResourcesCard = "";
    }
    let thumbnailImage = [];
    let thumbnailURL = getThumbnailURL(this.props.person);
    if (thumbnailURL!==null) {
      thumbnailImage = <img src={thumbnailURL} className="img-fluid img-thumbnail" alt={getPersonLabel(this.props.person)} />
    }
    let metadataOutput = [];

    let deleteBtn = <Button color="danger" onClick={this.props.delete} outline type="button" size="sm" className="pull-left"><i className="fa fa-trash-o" /> Delete</Button>;
    let updateBtn = <Button color="primary" outline type="submit" size="sm" onClick={()=>this.formSubmit}>{this.props.updateBtn}</Button>

    let errorContainerClass = " hidden";
    if (this.props.errorVisible) {
      errorContainerClass = "";
    }
    let errorContainer = <div className={"error-container"+errorContainerClass}>{this.props.errorText}</div>

    let personAppelationsData = [];
    if (this.props.person!==null) {
      personAppelationsData = this.props.person.alternateAppelations;
    }
    let honorificPrefixInputs = [];
    if (typeof this.state.honorificPrefix!=="string") {
      honorificPrefixInputs = this.state.honorificPrefix.map((h,i)=>{
        let item = <InputGroup key={i}>
          <Input type="text" name="honorificPrefix" id="honorificPrefix" placeholder="Person honorific prefix..." value={this.state.honorificPrefix[i]} onChange={(e)=>this.handleMultipleChange(e,i)}/>
            <InputGroupAddon addonType="append">
              <Button type="button" color="info" outline onClick={()=>this.removeHP(i)}><b><i className="fa fa-minus" /></b></Button>
            </InputGroupAddon>
        </InputGroup>
        if (i===0) {
          item = <Input style={{marginBottom: "5px"}} key={i} type="text" name="honorificPrefix" id="honorificPrefix" placeholder="Person honorific prefix..." value={this.state.honorificPrefix[i]} onChange={(e)=>this.handleMultipleChange(e,i)}/>;
        }
        return item;
      });
    }

    return (
      <div className="row">
        <div className="col-xs-12 col-sm-6">
          {thumbnailImage}
        </div>
        <div className="col-xs-12 col-sm-6">
          <div className="resource-details">
            <Card>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'detailsOpen')}>Details <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+detailsOpenActive} /></Button></CardTitle>
                {errorContainer}
                <Collapse isOpen={this.state.detailsOpen}>
                  <Form onSubmit={this.formSubmit}>
                    <div className="text-right">
                      <ButtonGroup>
                        <Button size="sm" outline={publicOutline} color={statusPublic} onClick={()=>this.updateStatus("public")}>Public</Button>
                        <Button size="sm" outline={privateOutline} color={statusPrivate} onClick={()=>this.updateStatus("private")}>Private</Button>
                      </ButtonGroup>
                    </div>
                    <FormGroup>
                      <Label for="honorificPrefix">Honorific Prefix</Label>
                      {honorificPrefixInputs}
                      <div className="text-right">
                        <Button type="button" color="info" outline size="xs" onClick={()=>this.addHP()}>Add new <i className="fa fa-plus" /></Button>
                      </div>
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
                    <div className="alternate-appelations">
                      <div className="label">Alternate appelations</div>
                      <PersonAppelations
                        data={personAppelationsData}
                        update={this.updateAlternateAppelation}
                        remove={this.removeAlternateAppelation}
                      />
                    </div>
                    <FormGroup>
                      <Label for="description">Description</Label>
                      <Input type="textarea" name="description" id="description" placeholder="Person description..." value={this.state.description} onChange={this.handleChange}/>
                    </FormGroup>
                    <div className="text-right">
                      {deleteBtn}
                      {updateBtn}
                    </div>
                  </Form>
                </Collapse>
              </CardBody>
            </Card>

            <Card className={metadataCard}>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'metadataOpen')}>Metadata<Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+metadataOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.metadataOpen}>
                  {metadataOutput}
                </Collapse>
              </CardBody>
            </Card>

            <Card className={relatedEventsCard}>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'eventsOpen')}>Related events <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+eventsOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.eventsOpen}>
                  {relatedEvents}
                </Collapse>
              </CardBody>
            </Card>

            <Card className={relatedOrganisationsCard}>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'organisationsOpen')}>Related Organisations <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+organisationsOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.organisationsOpen}>
                  {relatedOrganisations}
                </Collapse>
              </CardBody>
            </Card>


            <Card className={relatedPeopleCard}>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'peopleOpen')}>Related people <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+peopleOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.peopleOpen}>
                  {relatedPeople}
                </Collapse>
              </CardBody>
            </Card>

            <Card className={relatedResourcesCard}>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'resourcesOpen')}>Related resources <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+resourcesOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.resourcesOpen}>
                  {relatedResources}
                </Collapse>
              </CardBody>
            </Card>

          </div>
        </div>
      </div>
    )
  }
}
