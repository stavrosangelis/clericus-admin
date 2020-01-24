import React, { Component } from 'react';
import {
  Card, CardTitle, CardBody,
  Button, ButtonGroup,
  Form, FormGroup, Label, Input,
  Collapse,
} from 'reactstrap';
import Select from 'react-select';
import {
  loadRelatedEvents,
  loadRelatedOrganisations,
  loadRelatedPeople,
  loadRelatedResources,
  loadRelatedTemporal,
  loadRelatedSpatial,
} from '../helpers/helpers';

import axios from 'axios';
const APIPath = process.env.REACT_APP_APIPATH;

export default class ViewEvent extends Component {
  constructor(props) {
    super(props);

    let item = this.props.item;
    let status = 'private', label = '', description = '', eventType = '';
    if (item!==null) {
      if (typeof item.label!=="undefined" && item.label!==null) {
        label = item.label;
      }
      if (typeof item.description!=="undefined" && item.description!==null) {
        description = item.description;
      }
      if (typeof item.eventType!=="undefined" && item.eventType!==null && this.props.eventTypes.length>0) {
        let eventTypeFind = this.props.eventTypes.find(type=>type._id===item.eventType);
        eventType = {value: item.eventType, label:eventTypeFind.label};
      }
      if (typeof item.status!=="undefined" && item.status!==null) {
        status = item.status;
      }
    }

    this.state = {
      detailsOpen: true,
      eventsOpen: false,
      organisationsOpen: false,
      peopleOpen: false,
      temporalOpen: false,
      spatialOpen: false,

      label: label,
      description: description,
      eventType: eventType,
      status: status,
    }
    this.deleteRef = this.deleteRef.bind(this);
    this.eventTypesList = this.eventTypesList.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  deleteRef(ref, refTerm, model) {
    let context = this;
    let params = {
      items: [
        {_id: this.props.item._id, type: "Event"},
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
	  .then(function(response) {
      context.props.reload();
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
    let data = {
      label: this.state.label,
      description: this.state.description,
      eventType: this.state.eventType,
      status: this.state.status,
    }
    this.props.update(data);
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

  toggleCollapse(name) {
    let value = true;
    if (this.state[name]==="undefined" || this.state[name]) {
      value = false
    }
    this.setState({
      [name]: value
    });
  }

  updateStatus(value) {
    this.setState({status:value});
  }

  render() {
    let eventTypesList = this.eventTypesList(this.props.eventTypes);

    let detailsOpenActive = " active";
    if (!this.state.detailsOpen) {
      detailsOpenActive = "";
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

    let statusPublic = "secondary";
    let statusPrivate = "secondary";
    let publicOutline = true;
    let privateOutline = false;
    if (this.state.status==="public") {
      statusPublic = "success";
      publicOutline = false;
      privateOutline = true;
    }

    let relatedEvents = loadRelatedEvents(this.props.item, this.deleteRef);
    let relatedOrganisations = loadRelatedOrganisations(this.props.item, this.deleteRef);
    let relatedPeople = loadRelatedPeople(this.props.item, this.deleteRef);
    let relatedResources = loadRelatedResources(this.props.item, this.deleteRef);
    let relatedTemporal = loadRelatedTemporal(this.props.item, this.deleteRef);
    let relatedSpatial = loadRelatedSpatial(this.props.item, this.deleteRef);

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
    let relatedTemporalCard = " hidden";
    if (relatedTemporal.length>0) {
      relatedTemporalCard = "";
    }
    let relatedSpatialCard = " hidden";
    if (relatedSpatial.length>0) {
      relatedSpatialCard = "";
    }
    let errorContainerClass = " hidden";
    if (this.props.errorVisible) {
      errorContainerClass = "";
    }
    let errorContainer = <div className={"error-container"+errorContainerClass}>{this.props.errorText}</div>


    return (
      <div className="row">
        <div className="col-xs-12 col-sm-6">
          <div className="item-details">
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
                      <Label>Label</Label>
                      <Input type="text" name="label" placeholder="Label..." value={this.state.label} onChange={this.handleChange}/>
                    </FormGroup>
                    <FormGroup>
                      <Label for="description">Description</Label>
                      <Input type="textarea" name="description" placeholder="Description..." value={this.state.description} onChange={this.handleChange}/>
                    </FormGroup>
                    <FormGroup>
                      <Label>Type of Event</Label>
                      <Select
                        value={this.state.eventType}
                        onChange={(selectedOption)=>this.select2Change(selectedOption, "eventType")}
                        options={eventTypesList}
                      />
                    </FormGroup>
                    <div className="text-right" style={{marginTop: "15px"}}>
                      <Button color="info" outline size="sm" onClick={(e)=>this.formSubmit(e)}>{this.props.updateBtn}</Button>
                      <Button color="danger" outline  size="sm" onClick={()=>this.props.delete()} className="pull-left"><span><i className="fa fa-trash-o" /> Delete</span></Button>
                    </div>
                  </Form>
                </Collapse>
              </CardBody>
            </Card>
          </div>
        </div>
        <div className="col-xs-12 col-sm-6">
          <div className="item-details">
            <Card className={relatedEventsCard}>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'eventsOpen')}>Related events (<span className="related-num">{relatedEvents.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+eventsOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.eventsOpen}>
                  {relatedEvents}
                </Collapse>
              </CardBody>
            </Card>

            <Card className={relatedOrganisationsCard}>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'organisationsOpen')}>Related Organisations (<span className="related-num">{relatedOrganisations.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+organisationsOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.organisationsOpen}>
                  {relatedOrganisations}
                </Collapse>
              </CardBody>
            </Card>


            <Card className={relatedPeopleCard}>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'peopleOpen')}>Related people (<span className="related-num">{relatedPeople.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+peopleOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.peopleOpen}>
                  {relatedPeople}
                </Collapse>
              </CardBody>
            </Card>

            <Card className={relatedResourcesCard}>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'itemsOpen')}>Related resources (<span className="related-num">{relatedResources.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+itemsOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.itemsOpen}>
                  {relatedResources}
                </Collapse>
              </CardBody>
            </Card>

            <Card className={relatedTemporalCard}>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'temporalOpen')}>Related temporal (<span className="related-num">{relatedTemporal.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+itemsOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.temporalOpen}>
                  {relatedTemporal}
                </Collapse>
              </CardBody>
            </Card>

            <Card className={relatedSpatialCard}>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'spatialOpen')}>Related spatial (<span className="related-num">{relatedSpatial.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+itemsOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.spatialOpen}>
                  {relatedSpatial}
                </Collapse>
              </CardBody>
            </Card>

          </div>
        </div>
      </div>
    )
  }
}
