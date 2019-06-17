import React, { Component } from 'react';
import {
  Card, CardTitle, CardBody,
  Button,
  Form, FormGroup, Label, Input,
  Collapse,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import {getResourceThumbnailURL} from '../helpers/helpers';

import axios from 'axios';
import {APIPath} from '../static/constants';

export default class ViewEvent extends Component {
  constructor(props) {
    super(props);

    let item = this.props.item;
    let eventLabel = '';
    let eventDescription = '';
    let eventTimeId = '';
    let eventTimeLabel = '';
    let eventTimeStartDate = '';
    let eventTimeEndDate = '';
    let eventTimeFormat = '';
    let eventLocationId = '';
    let eventLocationLabel = '';
    let eventLocationStreetAddress = '';
    let eventLocationLocality = '';
    let eventLocationRegion = '';
    let eventLocationPostalCode = '';
    let eventLocationCountry = '';
    let eventLocationLatitude = '';
    let eventLocationLongitude = '';
    let eventLocationType = '';
    if (item!==null) {
      if (typeof item.label!=="undefined" && item.label!==null) {
        eventLabel = item.label;
      }
      if (typeof item.description!=="undefined" && item.description!==null) {
        eventDescription = item.description;
      }
      if (typeof item.temporal!=="undefined" && item.temporal!==null && Object.entries( item.temporal).length>0) {
        eventTimeId = item.temporal.ref._id;
        eventTimeLabel = item.temporal.ref.label;
        eventTimeStartDate = item.temporal.ref.startDate;
        eventTimeEndDate = item.temporal.ref.endDate;
        eventTimeFormat = item.temporal.ref.format;
      }
      if (typeof item.spatial!=="undefined" && item.spatial!==null && Object.entries( item.spatial).length>0) {
        eventLocationId = item.spatial.ref._id;
        eventLocationLabel = item.spatial.ref.label;
        eventLocationStreetAddress = item.spatial.ref.streetAddress;
        eventLocationLocality = item.spatial.ref.locality;
        eventLocationRegion = item.spatial.ref.region;
        eventLocationPostalCode = item.spatial.ref.postalCode;
        eventLocationCountry = item.spatial.ref.country;
        eventLocationLatitude = item.spatial.ref.coordinates.latitude;
        eventLocationLongitude = item.spatial.ref.coordinates.longitude;
        eventLocationType = item.spatial.ref.locationType;
      }
    }

    this.state = {
      zoom: 100,
      detailsOpen: true,
      metadataOpen: false,
      eventsOpen: false,
      organisationsOpen: false,
      peopleOpen: false,
      itemsOpen: false,
      systemTypes: [],
      eventTypes: [],

      form: {
        eventLabel: eventLabel,
        eventDescription: eventDescription,
        eventType: 'undefined',
        eventTimeId: eventTimeId,
        eventTimeLabel: eventTimeLabel,
        eventTimeStartDate: eventTimeStartDate,
        eventTimeEndDate: eventTimeEndDate,
        eventTimeFormat: eventTimeFormat,
        eventLocationId: eventLocationId,
        eventLocationLabel: eventLocationLabel,
        eventLocationStreetAddress: eventLocationStreetAddress,
        eventLocationLocality: eventLocationLocality,
        eventLocationRegion: eventLocationRegion,
        eventLocationPostalCode: eventLocationPostalCode,
        eventLocationCountry: eventLocationCountry,
        eventLocationLatitude: eventLocationLatitude,
        eventLocationLongitude: eventLocationLongitude,
        eventLocationType: eventLocationType,
      }
    }
    this.loadEventTypes = this.loadEventTypes.bind(this);
    this.eventTypesList = this.eventTypesList.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.parseMetadata = this.parseMetadata.bind(this);
    this.parseMetadataItems = this.parseMetadataItems.bind(this);
    this.relatedEvents = this.relatedEvents.bind(this);
    this.relatedOrganisations = this.relatedOrganisations.bind(this);
    this.relatedPeople = this.relatedPeople.bind(this);
    this.relatedResources = this.relatedResources.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.deleteRef = this.deleteRef.bind(this);
  }

  setFormValues() {
    let item = this.props.item;
    let eventLabel = '';
    let eventType = '';
    let eventDescription = '';
    let eventTimeId = '';
    let eventTimeLabel = '';
    let eventTimeStartDate = '';
    let eventTimeEndDate = '';
    let eventTimeFormat = '';
    let eventLocationId = '';
    let eventLocationLabel = '';
    let eventLocationStreetAddress = '';
    let eventLocationLocality = '';
    let eventLocationRegion = '';
    let eventLocationPostalCode = '';
    let eventLocationCountry = '';
    let eventLocationLatitude = '';
    let eventLocationLongitude = '';
    let eventLocationType = '';
    if (item!==null) {
      if (typeof item.label!=="undefined" && item.label!==null) {
        eventLabel = item.label;
      }
      if (typeof item.description!=="undefined" && item.description!==null) {
        eventDescription = item.description;
      }
      // eventType
      let eventTypes = this.state.eventTypes;
      let selectedEventType = item.eventType;
      if (item.eventType!=="undefined") {
        let selectedEventItem = eventTypes.find(value => value._id===selectedEventType);
        eventType = {value: selectedEventItem._id, label: selectedEventItem.label};
      }
      if (typeof item.temporal!=="undefined" && item.temporal!==null && Object.entries( item.temporal).length>0) {
        eventTimeId = item.temporal.ref._id;
        eventTimeLabel = item.temporal.ref.label;
        eventTimeStartDate = item.temporal.ref.startDate;
        eventTimeEndDate = item.temporal.ref.endDate;
        eventTimeFormat = item.temporal.ref.format;
      }
      if (typeof item.spatial!=="undefined" && item.spatial!==null && Object.entries( item.spatial).length>0) {
        eventLocationId = item.spatial.ref._id;
        eventLocationLabel = item.spatial.ref.label;
        eventLocationStreetAddress = item.spatial.ref.streetAddress;
        eventLocationLocality = item.spatial.ref.locality;
        eventLocationRegion = item.spatial.ref.region;
        eventLocationPostalCode = item.spatial.ref.postalCode;
        eventLocationCountry = item.spatial.ref.country;
        eventLocationLatitude = item.spatial.ref.coordinates.latitude;
        eventLocationLongitude = item.spatial.ref.coordinates.longitude;
        eventLocationType = item.spatial.ref.locationType;
      }
    }

    this.setState({
      form: {
        eventLabel: eventLabel,
        eventDescription: eventDescription,
        eventType: eventType,
        eventTimeId: eventTimeId,
        eventTimeLabel: eventTimeLabel,
        eventTimeStartDate: eventTimeStartDate,
        eventTimeEndDate: eventTimeEndDate,
        eventTimeFormat: eventTimeFormat,
        eventLocationId: eventLocationId,
        eventLocationLabel: eventLocationLabel,
        eventLocationStreetAddress: eventLocationStreetAddress,
        eventLocationLocality: eventLocationLocality,
        eventLocationRegion: eventLocationRegion,
        eventLocationPostalCode: eventLocationPostalCode,
        eventLocationCountry: eventLocationCountry,
        eventLocationLatitude: eventLocationLatitude,
        eventLocationLongitude: eventLocationLongitude,
        eventLocationType: eventLocationType,
      }
    })
  }

  loadEventTypes() {
    let context = this;
    let params = {systemType: "eventTypes"};
    let eventTypes = [];
    axios({
        method: 'get',
        url: APIPath+'system-taxonomy-tree',
        crossDomain: true,
        params: params
      })
    .then(function (response) {
      let responseData = response.data.data;
      eventTypes = responseData.data;
      context.setState({
        eventTypes: eventTypes,
      });
      return eventTypes;
    })
    .then((eventTypes) => {
      let selectedEventType = context.props.item.eventType;
      let eventType = '';
      if (context.props.eventType!=="undefined") {
        let selectedEventItem = eventTypes.find(value => value._id===selectedEventType);
        eventType = {value: selectedEventItem._id, label: selectedEventItem.label};
      }
      let form = context.state.form;
      form.eventType = eventType;
      context.setState({
        form: form
      })
    })
    .catch(function (error) {
    });
  }

  eventTypesList(eventTypes) {
    let options = [];
    let defaultValue = {value: '', label: '--'};
    options.push(defaultValue);
    for (let i=0; i<eventTypes.length; i++) {
      let eventType = eventTypes[i];
      let option = {value: eventType._id, label: eventType.label};
      options.push(option);
    }
    return options;
  }

  formSubmit(e) {
    e.preventDefault();
    this.props.update(this.state.form);
  }

  handleChange(e){
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    let form = this.state.form;
    form[name] = value;
    this.setState({
      form:form
    });
  }

  select2Change(selectedOption, element=null) {
    if (element===null) {
      return false;
    }
    let form = this.state.form;
    form[element] = selectedOption;
    this.setState({
      form: form
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
    if (this.props.item===null) {
      return [];
    }
    let references = this.props.item.events;
    let output = [];
    for (let i=0;i<references.length; i++) {
      let reference = references[i];
      if (reference.ref!==null) {
        let label = reference.ref.label;
        let newRow = <div key={i} className="ref-item">
          <Link to={"/event/"+reference.ref._id} href={"/event/"+reference.ref._id}>
            <i>{reference.refLabel}</i> <b>{label}</b>
          </Link>
          <div className="delete-ref" onClick={()=>this.deleteRef(reference.ref._id, reference.refTerm, "Event")}><i className="fa fa-times" /></div>
        </div>
        output.push(newRow);
      }
    }
    return output;
  }

  relatedOrganisations() {
    if (this.props.item===null) {
      return [];
    }
    let references = this.props.item.organisations;
    let output = [];
    for (let i=0;i<references.length; i++) {
      let reference = references[i];
      if (reference.ref!==null) {
        let label = reference.ref.label;

        let newRow = <div key={i} className="ref-item">
          <Link to={"/organisations/"+reference.ref._id} href={"/organisations/"+reference.ref._id}>
            <i>{reference.refLabel}</i> <b>{label}</b>
          </Link>
          <div className="delete-ref" onClick={()=>this.deleteRef(reference.ref._id, reference.refTerm, "Organisation")}><i className="fa fa-times" /></div>
        </div>
        output.push(newRow);
      }
    }
    return output;
  }

  relatedPeople() {
    if (this.props.item===null) {
      return [];
    }
    let references = this.props.item.people;
    let output = [];
    for (let i=0;i<references.length; i++) {
      let reference = references[i];
      if (reference.ref!==null) {
        let label = reference.ref.firstName;
        if (reference.ref.lastName!=="") {
          label+= " "+reference.ref.lastName
        }
        let newRow = <div key={i} className="ref-item">
          <Link to={"/person/"+reference.ref._id} href={"/person/"+reference.ref._id}>
            <i>{reference.refLabel}</i> <b>{label}</b>
          </Link>
          <div className="delete-ref" onClick={()=>this.deleteRef(reference.ref._id, reference.refTerm, "Person")}><i className="fa fa-times" /></div>
        </div>
        output.push(newRow);
      }
    }
    return output;
  }

  relatedResources() {
    if (this.props.item===null) {
      return [];
    }
    let references = this.props.item.resources;
    let output = [];
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
        {_id: this.props.item._id, type: "Event"},
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
	  .then(function(response) {
      context.props.reload();
	  })
	  .catch(function (error) {
	  });
  }

  componentDidMount() {
    this.loadEventTypes();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.item!==this.props.item) {
      this.setFormValues();
    }
  }

  render() {
    let item = this.props.item;

    // metadata
    let metadataOutput = [];
    if (item!==null) {
      if (typeof item.metadata!=="undefined" && item.metadata.length>0) {
        metadataOutput = this.parseMetadata(item.metadata[0].image);
      }
    }

    let eventTypesList = this.eventTypesList(this.state.eventTypes);

    let eventTimeActive = " active";
    if (!this.state.collapseEventTime) {
      eventTimeActive = "";
    }
    let eventPlaceActive = " active";
    if (!this.state.collapseEventPlace) {
      eventPlaceActive = "";
    }

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
    let itemsOpenActive = " active";
    if (!this.state.itemsOpen) {
      itemsOpenActive = "";
    }

    let relatedEvents = this.relatedEvents();
    let relatedOrganisations = this.relatedOrganisations();
    let relatedPeople = this.relatedPeople();
    let relatedResources = this.relatedResources();

    let metadataCard = " hidden";
    if (metadataOutput.length>0) {
      metadataCard = "";
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
    let errorContainerClass = " hidden";
    if (this.props.errorVisible) {
      errorContainerClass = "";
    }
    let errorContainer = <div className={"error-container"+errorContainerClass}>{this.props.errorText}</div>

    return (
      <div className="row">
        <div className="col">
          <div className="item-details">
            <Card>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'detailsOpen')}>Details <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+detailsOpenActive} /></Button></CardTitle>
                {errorContainer}
                <Collapse isOpen={this.state.detailsOpen}>
                  <Form onSubmit={this.formSubmit}>
                    <FormGroup>
                      <Label for="eventLabel">Label</Label>
                      <Input type="text" name="eventLabel" id="eventLabel" placeholder="Label..." value={this.state.form.eventLabel} onChange={this.handleChange}/>
                    </FormGroup>
                    <FormGroup>
                      <Label for="eventDescription">Description</Label>
                      <Input type="textarea" name="eventDescription" id="eventDescription" placeholder="Description..." value={this.state.form.eventDescription} onChange={this.handleChange}/>
                    </FormGroup>
                    <FormGroup>
                      <Label for="eventType">Type of Event</Label>
                      <Select
                        value={this.state.form.eventType}
                        onChange={(selectedOption)=>this.select2Change(selectedOption, "eventType")}
                        options={eventTypesList}
                      />
                    </FormGroup>
                    <hr />
                    <div onClick={()=>this.toggleCollapse("collapseEventTime")} className="toggle-collapse">
                      <b>Event Time</b>
                      <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+eventTimeActive} /></Button>
                    </div>
                    <Collapse isOpen={this.state.collapseEventTime}>
                      <div className="collapse-container">
                        <FormGroup>
                          <Label for="eventTimeLabel">Label</Label>
                          <Input type="text" name="eventTimeLabel" id="eventTimeLabel" placeholder="Event time label..." value={this.state.form.eventTimeLabel} onChange={this.handleChange}/>
                        </FormGroup>
                        <div className="row">
                          <div className="col-xs-12 col-sm-6">
                            <FormGroup>
                              <Label for="eventTimeStartDate">Start date</Label>
                              <Input type="text" name="eventTimeStartDate" id="eventTimeStartDate" placeholder="Event start date..." value={this.state.form.eventTimeStartDate} onChange={this.handleChange}/>
                            </FormGroup>
                          </div>
                          <div className="col-xs-12 col-sm-6">
                            <FormGroup>
                              <Label for="eventTimeEndDate">End date</Label>
                              <Input type="text" name="eventTimeEndDate" id="eventTimeEndDate" placeholder="Event end date..." value={this.state.form.eventTimeEndDate} onChange={this.handleChange}/>
                            </FormGroup>
                          </div>
                        </div>
                        <FormGroup>
                          <Label for="eventTimeDateFormat">Date format</Label>
                          <Input type="text" name="eventTimeDateFormat" id="eventTimeDateFormat" placeholder="Event date format..." value={this.state.form.eventTimeDateFormat} onChange={this.handleChange}/>
                        </FormGroup>
                      </div>
                    </Collapse>

                    <hr />
                    <div onClick={()=>this.toggleCollapse("collapseEventPlace")} className="toggle-collapse">
                      <b>Event Location</b>
                      <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+eventPlaceActive} /></Button>
                    </div>
                    <Collapse isOpen={this.state.collapseEventPlace}>
                      <div className="collapse-container">
                        <FormGroup>
                          <Label for="eventLocationLabel">Label</Label>
                          <Input type="text" name="eventLocationLabel" id="eventLocationLabel" placeholder="Event location label..." value={this.state.form.eventLocationLabel} onChange={this.handleChange}/>
                        </FormGroup>
                        <FormGroup>
                          <Label for="eventLocationStreetAddress">Street Address</Label>
                          <Input type="text" name="eventLocationStreetAddress" id="eventLocationStreetAddress" placeholder="Street address..." value={this.state.form.eventLocationStreetAddress} onChange={this.handleChange}/>
                        </FormGroup>
                        <FormGroup>
                          <Label for="eventLocationLocality">Locality</Label>
                          <Input type="text" name="eventLocationLocality" id="eventLocationLocality" placeholder="Locality..." value={this.state.form.eventLocationLocality} onChange={this.handleChange}/>
                        </FormGroup>
                        <FormGroup>
                          <Label for="eventLocationRegion">Region</Label>
                          <Input type="text" name="eventLocationRegion" id="eventLocationRegion" placeholder="Region..." value={this.state.form.eventLocationRegion} onChange={this.handleChange}/>
                        </FormGroup>
                        <FormGroup>
                          <Label for="eventLocationPostalCode">Postal Code</Label>
                          <Input type="text" name="eventLocationPostalCode" id="eventLocationPostalCode" placeholder="Postal Code..." value={this.state.form.eventLocationPostalCode} onChange={this.handleChange}/>
                        </FormGroup>
                        <FormGroup>
                          <Label for="eventLocationCountry">Country</Label>
                          <Input type="text" name="eventLocationCountry" id="eventLocationCountry" placeholder="Country..." value={this.state.form.eventLocationCountry} onChange={this.handleChange}/>
                        </FormGroup>
                        <div className="row">
                          <div className="col-xs-12 col-sm-6">
                            <FormGroup>
                              <Label for="eventLocationLatitude">Latitude</Label>
                              <Input type="text" name="eventLocationLatitude" id="eventLocationLatitude" placeholder="Latitude..." value={this.state.form.eventLocationLatitude} onChange={this.handleChange}/>
                            </FormGroup>
                          </div>
                          <div className="col-xs-12 col-sm-6">
                            <FormGroup>
                              <Label for="eventLocationLongitude">Longitude</Label>
                              <Input type="text" name="eventLocationLongitude" id="eventLocationLongitude" placeholder="Longitude..." value={this.state.form.eventLocationLongitude} onChange={this.handleChange}/>
                            </FormGroup>
                          </div>
                        </div>
                        <FormGroup>
                          <Label for="eventLocationType">Location Type</Label>
                          <Input type="text" name="eventLocationType" id="eventLocationType" placeholder="Location Type..." value={this.state.form.eventLocationType} onChange={this.handleChange}/>
                        </FormGroup>
                      </div>
                    </Collapse>
                    <div className="text-right" style={{marginTop: "15px"}}>
                      <Button color="info" outline size="sm" onClick={(e)=>this.formSubmit(e)}>{this.props.updateBtn}</Button>
                      <Button color="danger" outline  size="sm" onClick={()=>this.props.delete()} className="pull-left">{this.props.deleteBtn}</Button>
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
                <CardTitle onClick={this.toggleCollapse.bind(this, 'itemsOpen')}>Related resources <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+itemsOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.itemsOpen}>
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
