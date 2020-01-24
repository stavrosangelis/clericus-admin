import React, { Component } from 'react';
import {
  Card, CardTitle, CardBody,
  Button, ButtonGroup,
  Form, FormGroup, Label, Input,
  Collapse
} from 'reactstrap';
import {
  getThumbnailURL,
  loadRelatedEvents,
  loadRelatedOrganisations,
  loadRelatedPeople,
  loadRelatedResources
} from '../helpers/helpers';
import axios from 'axios';
import OrganisationAppelations from './organisation-alternate-appelations';
const APIPath = process.env.REACT_APP_APIPATH;

export default class ViewOrganisation extends Component {
  constructor(props) {
    super(props);

    let organisation = this.props.organisation;
    let status = 'private', label = '', description = '', organisationType = '', alternateAppelations = [];
    if (organisation!==null) {
      if (typeof organisation.label!=="undefined" && organisation.label!==null) {
        label = organisation.label;
      }
      if (typeof organisation.description!=="undefined" && organisation.description!==null) {
        description = organisation.description;
      }
      if (typeof organisation.organisationType!=="undefined" && organisation.organisationType!==null) {
        organisationType = organisation.organisationType;
      }
      if (typeof organisation.alternateAppelations!=="undefined" && organisation.alternateAppelations!==null) {
        alternateAppelations = organisation.alternateAppelations;
      }
      if (typeof organisation.status!=="undefined" && organisation.status!==null) {
        status = organisation.status;
      }
    }
    this.state = {
      detailsOpen: true,
      eventsOpen: false,
      organisationsOpen: false,
      peopleOpen: false,
      label: label,
      description: description,
      organisationType: organisationType,
      status: status,
      alternateAppelations: alternateAppelations,
    }
    this.updateStatus = this.updateStatus.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.parseMetadata = this.parseMetadata.bind(this);
    this.parseMetadataItems = this.parseMetadataItems.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.deleteRef = this.deleteRef.bind(this);
    this.updateAlternateAppelation = this.updateAlternateAppelation.bind(this);
    this.removeAlternateAppelation = this.removeAlternateAppelation.bind(this);
  }

  updateStatus(value) {
    this.setState({status:value});
  }

  formSubmit(e) {
    e.preventDefault();
    let newData = {
      label: this.state.label,
      description: this.state.description,
      organisationType: this.state.organisationType,
      alternateAppelations: this.state.alternateAppelations,
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
        {_id: this.props.organisation._id, type: "Organisation"},
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
    let organisation = this.props.organisation;
    let alternateAppelations = organisation.alternateAppelations;
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
        label: this.state.label,
        description: this.state.description,
        organisationType: this.state.organisationType,
        alternateAppelations: this.state.alternateAppelations,
        status: this.state.status,
      }
      this.props.update(newData);
    });
  }

  removeAlternateAppelation(index) {
    let organisation = this.props.organisation;
    let alternateAppelations = organisation.alternateAppelations;
    if (index!==null) {
      alternateAppelations.splice(index,1);
    }
    this.setState({
      alternateAppelations: alternateAppelations
    },()=> {
      let newData = {
        label: this.state.label,
        description: this.state.description,
        organisationType: this.state.organisationType,
        alternateAppelations: this.state.alternateAppelations,
        status: this.state.status,
      }
      this.props.update(newData);
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
    let relatedEvents = loadRelatedEvents(this.props.organisation, this.deleteRef);
    let relatedOrganisations = loadRelatedOrganisations(this.props.organisation, this.deleteRef);
    let relatedPeople = loadRelatedPeople(this.props.organisation, this.deleteRef);
    let relatedResources = loadRelatedResources(this.props.organisation, this.deleteRef);

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
    let thumbnailURL = getThumbnailURL(this.props.organisation);
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

    let organisationAppelationsData = [];
    if (this.props.organisation!==null) {
      organisationAppelationsData = this.props.organisation.alternateAppelations;
    }

    let organisationTypesOptions = [];
    if (this.props.organisationTypes.length>0) {
      organisationTypesOptions = this.props.organisationTypes.map((o,i)=><option value={o.labelId} key={i}>{o.label}</option>);
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
                      <Label>Label</Label>
                      <Input type="text" name="label" placeholder="Organisation label..." value={this.state.label} onChange={this.handleChange}/>
                    </FormGroup>
                    <div className="alternate-appelations">
                      <div className="label">Alternate labels</div>
                      <OrganisationAppelations
                        data={organisationAppelationsData}
                        update={this.updateAlternateAppelation}
                        remove={this.removeAlternateAppelation}
                      />
                    </div>
                    <FormGroup>
                      <Label>Description</Label>
                      <Input type="textarea" name="description" placeholder="Organisation description..." value={this.state.description} onChange={this.handleChange}/>
                    </FormGroup>
                    <FormGroup>
                      <Label>Type</Label>
                      <Input type="select" name="organisationType" placeholder="Organisation type..." value={this.state.organisationType} onChange={this.handleChange}>{organisationTypesOptions}</Input>
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
                <CardTitle onClick={this.toggleCollapse.bind(this, 'resourcesOpen')}>Related resources (<span className="related-num">{relatedResources.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+resourcesOpenActive} /></Button></CardTitle>
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
