import React, { Component } from 'react';
import {
  Card, CardTitle, CardBody,
  Button,
  Form, FormGroup, Label, Input,
  Collapse,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import { Link } from 'react-router-dom';
import {getResourceThumbnailURL,getResourceFullsizeURL} from '../helpers/helpers';
import UploadFile from './upload-file';

import axios from 'axios';

import Viewer from './image-viewer'

import {connect} from "react-redux";

const APIPath = process.env.REACT_APP_APIPATH;
const mapStateToProps = state => {
  return {
    systemTypes: state.systemTypes
   };
};
class ViewResource extends Component {
  constructor(props) {
    super(props);
    let resource = this.props.resource;
    let newLabel = '';
    let newDescription = '';
    let newSystemType = 'undefined';
    if (resource!==null) {
      if (typeof resource.label!=="undefined" && resource.label!==null) {
        newLabel = resource.label;
      }
      if (typeof resource.systemType!=="undefined" && resource.systemType!==null) {
        newSystemType = resource.systemType;
      }
      if (typeof resource.description!=="undefined" && resource.description!==null) {
        newDescription = resource.description;
      }
    }

    this.state = {
      zoom: 100,
      detailsOpen: true,
      metadataOpen: false,
      eventsOpen: false,
      organisationsOpen: false,
      peopleOpen: false,
      resourcesOpen: false,
      label: newLabel,
      systemType: newSystemType,
      description: newDescription,
      updateFileModal: false,
      imageViewerVisible: false
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
    this.toggleUpdateFileModal = this.toggleUpdateFileModal.bind(this);
    this.toggleImageViewer = this.toggleImageViewer.bind(this);
  }

  formSubmit(e) {
    e.preventDefault();

    let updateData = {label: this.state.label, systemType: this.state.systemType, description: this.state.description};
    this.props.update(updateData);
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
      i++;
    }
    return items;
  }

  relatedEvents() {
    if (this.props.resource===null || this.props.resource.length===0) {
      return [];
    }
    let references = this.props.resource.events;
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
    if (this.props.resource===null || this.props.resource.length===0) {
      return [];
    }
    let references = this.props.resource.organisations;
    let output = [];
    for (let i=0;i<references.length; i++) {
      let reference = references[i];
      if (reference.ref!==null) {
        let label = reference.ref.label;

        let newRow = <div key={i} className="ref-item">
          <Link to={"/organisation/"+reference.ref._id} href={"/organisation/"+reference.ref._id}>
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
    if (this.props.resource===null || this.props.resource.length===0) {
      return [];
    }
    let references = this.props.resource.people;
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
    if (this.props.resource===null || this.props.resource.length===0) {
      return [];
    }
    let references = this.props.resource.resources;
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

  toggleUpdateFileModal() {
    this.setState({
      updateFileModal: !this.state.updateFileModal
    })
  }

  deleteRef(ref, refTerm, model) {
    let context = this;
    let params = {
      items: [
        {_id: this.props.resource._id, type: "Resource"},
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

  toggleImageViewer(src) {
    this.setState({
      imageViewerVisible: !this.state.imageViewerVisible
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.closeUploadModal) {
      this.setState({
        updateFileModal: false
      })
    }
    if (this.props.resource===null && this.state.systemType==="undefined" && this.props.systemType!==null && this.props.systemTypes.length>0) {
      this.setState({
        systemType: this.props.systemType
      });
    }
  }

  render() {
    let resource = this.props.resource;
    let imgViewer = [];
    let thumbnailPath = getResourceThumbnailURL(resource);
    let thumbnailImage = [];
    if (thumbnailPath!==null && resource.resourceType==="image") {
      let fullsizePath = getResourceFullsizeURL(resource);
      thumbnailImage = [<div onClick={()=>this.toggleImageViewer(fullsizePath)} key='thumbnail' className="open-lightbox"><img src={thumbnailPath} alt={resource.label} className="img-fluid img-thumbnail" /></div>];
      imgViewer = <Viewer visible={this.state.imageViewerVisible} path={fullsizePath} label={this.state.label} toggle={this.toggleImageViewer}/>
    }
    let deleteBtn = <Button color="danger" onClick={this.props.delete} outline type="button" size="sm" className="pull-left"><i className="fa fa-trash-o" /> Delete</Button>;
    let updateBtn = <Button color="primary" outline type="submit" size="sm">{this.props.updateBtn}</Button>

    let updateFileModal = [];
    if (resource===null) {
      thumbnailImage = <UploadFile
        _id={null}
        systemType={this.state.systemType}
        uploadResponse={this.props.uploadResponse}
        label={this.state.label}
        description={this.state.description}
        />;
      deleteBtn = [];
      updateBtn = [];
    }
    else {
      thumbnailImage.push(<Button style={{marginTop: "10px"}} color="info" className="resource-upload-btn" key="update-img-btn" onClick={this.toggleUpdateFileModal}><i className="fa fa-refresh" /> Update file</Button>);

      updateFileModal = <Modal isOpen={this.state.updateFileModal} toggle={this.toggleUpdateFileModal} className={this.props.className}>
          <ModalHeader toggle={this.toggleUpdateFileModal}>Update file</ModalHeader>
          <ModalBody>
            <div style={{position: 'relative', display: 'block',margin: '0 auto'}}>
              <UploadFile
                _id={this.props.resource._id}
                systemType={this.state.systemType}
                uploadResponse={this.props.uploadResponse}
                label={this.state.label}
                description={this.state.description}
                />
            </div>
          </ModalBody>
          <ModalFooter className="text-right">
            <Button color="secondary" onClick={this.toggleUpdateFileModal}>Cancel</Button>
          </ModalFooter>
        </Modal>;
    }

    // system types
    let systemTypesOptions = [];
    for (let st=0;st<this.props.systemTypes.length; st++) {
      let systemType = this.props.systemTypes[st];
      let systemTypeOption = <option value={systemType._id} key={st}>{systemType.label}</option>;
      systemTypesOptions.push(systemTypeOption);
    }

    let systemTypesSelect = <Input type="select" name="systemType" id="systemTypeInput" className="system-type-select" onChange={this.handleChange} value={this.state.systemType.ref}>
      {systemTypesOptions}
    </Input>

    // metadata
    let metadataOutput = [];
    if (resource!==null) {
      if (typeof resource.metadata!=="undefined" && resource.metadata.length>0) {
        metadataOutput = this.parseMetadata(resource.metadata[0].image);
      }
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
    let resourcesOpenActive = " active";
    if (!this.state.resourcesOpen) {
      resourcesOpenActive = "";
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
        <div className="col-xs-12 col-sm-6">
          {thumbnailImage}
          {imgViewer}
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
                      <Input type="text" name="label" id="labelInput" placeholder="Resource label..." value={this.state.label} onChange={this.handleChange}/>
                    </FormGroup>
                    <FormGroup>
                     <Label for="systemTypeInput">Type</Label>
                      {systemTypesSelect}
                    </FormGroup>
                    <FormGroup>
                      <Label for="DescriptionInput">Description</Label>
                      <Input type="textarea" name="description" id="DescriptionInput" placeholder="Resource description..." value={this.state.description} onChange={this.handleChange}/>
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
        {updateFileModal}
      </div>
    )
  }
}
export default ViewResource = connect(mapStateToProps, [])(ViewResource);;
