import React, { Component } from 'react';
import { Card, CardTitle, CardBody, Button, Form, FormGroup, Label, Input, Collapse} from 'reactstrap';
import { Link } from 'react-router-dom';
import {getResourceThumbnailURL} from '../helpers/helpers';
import LazyList from './lazylist';

export default class ViewClasspiece extends Component {
  constructor(props) {
    super(props);

    this.state = {
      zoom: 100,
      label: this.props.resource.label,
      detailsOpen: false,
      metadataOpen: false,
      eventsOpen: false,
      organisationsOpen: false,
      peopleOpen: false,
      resourcesOpen: false,
    }
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.parseMetadata = this.parseMetadata.bind(this);
    this.parseMetadataItems = this.parseMetadataItems.bind(this);
    this.relatedEvents = this.relatedEvents.bind(this);
    this.relatedOrganisations = this.relatedOrganisations.bind(this);
    this.relatedPeople = this.relatedPeople.bind(this);
    this.renderPerson = this.renderPerson.bind(this);
    this.relatedResources = this.relatedResources.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
  }

  formSubmit(e) {
    e.preventDefault();
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
    let references = this.props.resource.events;
    let output = [];
    for (let i=0;i<references.length; i++) {
      let reference = references[i];
      if (reference.ref!==null) {
        let label = reference.ref.label;
        let newRow = <div key={i}>
          <Link to={"/event/"+reference.ref._id} href={"/event/"+reference.ref._id}>
            <i>{reference.refType}</i> <b>{label}</b>
          </Link>
        </div>
        output.push(newRow);
      }
    }
    return output;
  }

  relatedOrganisations() {
    let references = this.props.resource.organisations;
    let output = [];
    for (let i=0;i<references.length; i++) {
      let reference = references[i];
      if (reference.ref!==null) {
        let label = reference.ref.label;

        let newRow = <div key={i}>
          <Link to={"/organisations/"+reference.ref._id} href={"/organisations/"+reference.ref._id}>
            <i>{reference.refType}</i> <b>{label}</b>
          </Link>
        </div>
        output.push(newRow);
      }
    }
    return output;
  }

  renderPerson(reference) {
    if (reference.ref!==null) {
      let label = reference.ref.firstName;
      if (reference.ref.middleName!=="") {
        label+= " "+reference.ref.middleName;
      }
      if (reference.ref.lastName!=="") {
        label+= " "+reference.ref.lastName;
      }
      let _id = reference.ref._id;
      let url = `/person/${_id}`;
      let newRow = <div key={_id}>
        <Link to={url} href={url}>
          <i>{reference.refType}</i> <b>{label}</b>
        </Link>
      </div>
      return newRow;
    }
  }

  relatedPeople() {
    let references = this.props.resource.people;
    let output = [];
    for (let i=0;i<references.length; i++) {
      let reference = references[i];
      if (reference.ref!==null) {
        let label = reference.ref.firstName;
        if (reference.ref.lastName!=="") {
          label+= " "+reference.ref.lastName
        }

        let newRow = <div key={i}>
          <Link to={"/person/"+reference.ref._id} href={"/person/"+reference.ref._id}>
            <i>{reference.refType}</i> <b>{label}</b>
          </Link>
        </div>
        output.push(newRow);
      }
    }
    return output;
  }

  relatedResources() {
    let references = this.props.resource.resources;
    let output = [];
    for (let i=0;i<references.length; i++) {
      let reference = references[i];
      let thumbnailPath = getResourceThumbnailURL(reference.ref);
      let thumbnailImage = [];
      if (thumbnailPath!==null) {
        thumbnailImage = <img src={thumbnailPath} alt={reference.label} className="img-fluid"/>
      }
      let newRow = <div key={i} className="img-thumbnail related-resource">
          <Link to={"/resource/"+reference.ref._id} href={"/resource/"+reference.ref._id}>
            <i>{reference.refType}</i><br/>
            {thumbnailImage}
          </Link>
        </div>
      output.push(newRow);
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

  render() {
    let resource = this.props.resource;

    let thumbnailPath = getResourceThumbnailURL(resource);
    let thumbnailImage = [];
    if (thumbnailPath!==null) {
      thumbnailImage = <img src={thumbnailPath} alt={resource.label} className="img-fluid img-thumbnail"/>;
    }
    // metadata
    let metadataOutput = this.parseMetadata(this.props.resource.metadata[0].image);

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

    let relatedEvents = this.relatedEvents();
    let relatedOrganisations = this.relatedOrganisations();
    let relatedPeople = this.relatedPeople();
    let relatedResources = this.relatedResources();

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
                <Collapse isOpen={this.state.detailsOpen}>
                  <Form onSubmit={this.formSubmit}>
                    <FormGroup>
                      <Label for="labelInput">Label</Label>
                      <Input type="text" name="label" id="labelInput" placeholder="Resource label..." value={this.state.label} onChange={this.handleChange}/>
                    </FormGroup>
                    <Button color="primary" outline type="submit" size="sm"><i className="fa fa-save" /> Update</Button>
                  </Form>
                </Collapse>
              </CardBody>
            </Card>

            <Card>
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
                  <LazyList
                    limit={50}
                    range={25}
                    items={this.props.resource.people}
                    containerClass="filter-body"
                    renderItem={this.renderPerson}
                  />
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
