import React, { Component } from 'react';
import { Card, CardTitle, CardBody, Button, Form, FormGroup, Label, Input, Collapse} from 'reactstrap';
import { Link } from 'react-router-dom';
import {getOrganisationThumbnailURL,getResourceThumbnailURL} from '../helpers/helpers';
import axios from 'axios';
import {APIPath} from '../static/constants';

export default class ViewOrganisation extends Component {
  constructor(props) {
    super(props);

    let label = '';
    if (typeof this.props.label!=="undefined" && this.props.label!==null) {
      label = this.props.label;
    }
    this.state = {
      detailsOpen: true,
      metadataOpen: false,
      eventsOpen: false,
      organisationsOpen: false,
      peopleOpen: false,
      label: label
    }
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.parseMetadata = this.parseMetadata.bind(this);
    this.parseMetadataItems = this.parseMetadataItems.bind(this);
    this.relatedEvents = this.relatedEvents.bind(this);
    this.relatedOrganisations = this.relatedOrganisations.bind(this);
    this.relatedPeople = this.relatedPeople.bind(this);
    this.relatedResources = this.relatedResources.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.deleteRef = this.deleteRef.bind(this);
  }

  formSubmit(e) {
    e.preventDefault();
    let newData = {
      label: this.state.label
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

  relatedEvents() {
    if (this.props.organisation===null || this.props.organisation.length===0 || this.props.organisation.events===null) {
      return [];
    }
    let references = this.props.organisation.events;
    let output = [];
    for (let i=0;i<references.length; i++) {
      let reference = references[i];
      if (reference.ref!==null) {
        let label = reference.ref.label;
        let newRow = <div key={i}>
          <Link to={"/event/"+reference.ref._id} href={"/event/"+reference.ref._id}>
            <i>{reference.refType}</i> <b>{label}</b>
          </Link>
          <div className="delete-ref" onClick={()=>this.deleteRef(reference.ref._id, reference.refTerm, "Event")}><i className="fa fa-times" /></div>
        </div>
        output.push(newRow);
      }
    }
    return output;
  }

  relatedOrganisations() {
    if (this.props.organisation===null || this.props.organisation.length===0 || this.props.organisation.organisations===null) {
      return [];
    }
    let references = this.props.organisation.organisations;
    let output = [];
    for (let i=0;i<references.length; i++) {
      let reference = references[i];
      if (reference.ref!==null) {
        let label = reference.ref.label;

        let newRow = <div key={i} className="ref-item">
          <Link to={"/organisations/"+reference.ref._id} href={"/organisations/"+reference.ref._id}>
            <i>{reference.refType}</i> <b>{label}</b>
          </Link>
          <div className="delete-ref" onClick={()=>this.deleteRef(reference.ref._id, reference.refTerm, "Organisation")}><i className="fa fa-times" /></div>
        </div>
        output.push(newRow);
      }
    }
    return output;
  }

  relatedPeople() {
    if (this.props.organisation===null || this.props.organisation.length===0 || this.props.organisation.people===null) {
      return [];
    }
    let output = [];
    if (typeof this.props.organisation.people!=="undefined") {
      let references = this.props.organisation.people;
      for (let i=0;i<references.length; i++) {
        let reference = references[i];
        if (reference.ref!==null) {
          let label = reference.ref.firstName;
          if (reference.ref.lastName!=="") {
            label+= " "+reference.ref.lastName
          }
          let newRow = <div key={i} className="ref-item">
            <Link to={"/organisation/"+reference.ref._id} href={"/organisation/"+reference.ref._id}>
              <i>{reference.refType}</i> <b>{label}</b>
            </Link>
            <div className="delete-ref" onClick={()=>this.deleteRef(reference.ref._id, reference.refTerm, "Person")}><i className="fa fa-times" /></div>
          </div>
          output.push(newRow);
        }
      }
    }
    return output;
  }

  relatedResources() {
    if (this.props.organisation===null || this.props.organisation.length===0 || this.props.organisation.resources===null) {
      return [];
    }
    let output = [];
    if (typeof this.props.organisation.resources!=="undefined") {
      let references = this.props.organisation.resources;
      for (let i=0;i<references.length; i++) {
        let reference = references[i];
        if (reference.ref!==null) {
          let thumbnailPath = getResourceThumbnailURL(reference.ref);
          let thumbnailImage = [];
          if (thumbnailPath!==null) {
            thumbnailImage = <img src={thumbnailPath} alt={reference.label} className="img-fluid"/>
          }
          let newRow = <div key={i} className="img-thumbnail related-resource">
              <Link to={"/resource/"+reference.ref._id} href={"/resource/"+reference.ref._id}>
                <i>{reference.refLabel}</i>
                {thumbnailImage}
              </Link>
              <div className="delete-ref" onClick={()=>this.deleteRef(reference.ref._id, reference.refTerm, "Resource")}><i className="fa fa-times" /></div>
            </div>
          output.push(newRow);
        }
      }
    }
    return output;
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
        {_id: this.props.organisation._id, type: "Organisation"},
        {_id: ref, type: model}
      ],
      taxonomyTermId: refTerm,
    }
    axios({
      method: 'delete',
      url: APIPath+'reference',
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      context.props.reload();
	  })
	  .catch(function (error) {
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

    let metadataItems = this.parseMetadata();
    let relatedEvents = this.relatedEvents();
    let relatedOrganisations = this.relatedOrganisations();
    let relatedPeople = this.relatedPeople();
    let relatedResources = this.relatedResources();

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
    let thumbnailURL = getOrganisationThumbnailURL(this.props.organisation);
    if (thumbnailURL!==null) {
      thumbnailImage = <img src={thumbnailURL} className="img-fluid img-thumbnail" alt={this.props.label} />
    }
    let metadataOutput = [];
    let deleteBtn = <Button color="danger" onClick={this.props.delete} outline type="button" size="sm" className="pull-left"><i className="fa fa-trash-o" /> Delete</Button>;
    let updateBtn = <Button color="primary" outline type="submit" size="sm" onClick={()=>this.formSubmit}>{this.props.updateBtn}</Button>

    let errorContainerClass = " hidden";
    if (this.props.errorVisible) {
      errorContainerClass = "";
    }
    let errorContainer = <div className={"error-container"+errorContainerClass}>{this.props.errorText}</div>


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
                    <FormGroup>
                      <Label for="labelInput">Label</Label>
                      <Input type="text" name="label" id="labelInput" placeholder="Organisation label..." value={this.state.label} onChange={this.handleChange}/>
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
