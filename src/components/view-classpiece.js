import React, { Component } from 'react';
import { Card, CardTitle, CardBody, Button, Form, FormGroup, Label, Input, Collapse} from 'reactstrap';

import { Link } from 'react-router-dom';

import {classPieceFullsize,classPieceThumbnails,outputDir} from '../static/constants';

export default class ViewClasspiece extends Component {
  constructor(props) {
    super(props);

    this.state = {
      zoom: 100,
      label: this.props.resource.label,
      detailsOpen: false,
      metadataOpen: false,
      peopleOpen: false,
      resourcesOpen: false,
    }
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.parseMetadata = this.parseMetadata.bind(this);
    this.parseMetadataItems = this.parseMetadataItems.bind(this);
    this.relatedPeople = this.relatedPeople.bind(this);
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

  relatedPeople() {
    let references = this.props.resource.people;
    let output = [];
    for (let i=0;i<references.length; i++) {
      let reference = references[i];
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
    return output;
  }

  relatedResources() {
    let references = this.props.resource.resources;
    let output = [];
    for (let i=0;i<references.length; i++) {
      let reference = references[i];
      let thumbnail = [];
      if (reference.ref.systemType==="classpiece") {
        thumbnail = classPieceThumbnails+reference.ref.fileName;
      }
      else if (reference.ref.systemType==="thumbnail") {
        let dirName = this.props.file;
        if (dirName!==null) {
          thumbnail = outputDir+dirName+"/thumbnails/"+reference.ref.fileName;
        }
      }
      let newRow = <div key={i} className="img-thumbnail related-resource">
          <Link to={"/resource/"+reference.ref._id} href={"/resource/"+reference.ref._id}>
            <i>{reference.refType}</i><br/>
            <img src={thumbnail} alt={reference.label} className="img-fluid"/>
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
    let mainImage = <img src={classPieceFullsize+resource.fileName} alt={resource.label} />;
    let thumbnailImage = <img src={classPieceThumbnails+resource.fileName} alt={resource.label} className="img-fluid img-thumbnail"/>;
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
    let peopleOpenActive = " active";
    if (!this.state.peopleOpen) {
      peopleOpenActive = "";
    }
    let resourcesOpenActive = " active";
    if (!this.state.resourcesOpen) {
      resourcesOpenActive = "";
    }

    let relatedPeople = this.relatedPeople();
    let relatedResources = this.relatedResources();
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

            <Card>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'peopleOpen')}>Related people <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+peopleOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.peopleOpen}>
                  {relatedPeople}
                </Collapse>
              </CardBody>
            </Card>

            <Card>
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
