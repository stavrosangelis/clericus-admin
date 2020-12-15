import React, { Component } from 'react';
import {
  Card, CardTitle, CardBody,
  Button, ButtonGroup,
  Form, FormGroup, Label, Input,
  Collapse,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import { getResourceThumbnailURL, getResourceFullsizeURL } from '../helpers/helpers';
import {Link} from 'react-router-dom';
import UploadFile from './upload-file';
import RelatedEntitiesBlock from './related-entities-block';
import ResourceAlternateLabels from './resource-alternate-labels.js';
import {jsonStringToObject} from '../helpers/helpers';
import axios from 'axios';
import Viewer from './image-viewer'

import {connect} from "react-redux";

const APIPath = process.env.REACT_APP_APIPATH;
const mapStateToProps = (state) => {
  return {
    resourcesTypes: state.resourcesTypes
   };
};
class ViewResource extends Component {
  constructor(props) {
    super(props);
    let resource = this.props.resource;
    let status = 'private';
    let newLabel = resource?.label || '';
    let newDescription = resource?.description || '';
    let newOriginalLocation = resource?.originalLocation || '';
    let newSystemType = resource?.systemType || 'undefined';
    this.state = {
      zoom: 100,
      detailsOpen: true,
      metadataOpen: false,
      label: newLabel,
      alternateLabels: [],
      systemType: newSystemType,
      originalLocation: newOriginalLocation,
      description: newDescription,
      updateFileModal: false,
      imageViewerVisible: false,
      status: status,
      deleteClasspieceModal: false,
      deletingClasspiece: false,
    }
    this.updateStatus = this.updateStatus.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.parseMetadata = this.parseMetadata.bind(this);
    this.parseMetadataItems = this.parseMetadataItems.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.toggleUpdateFileModal = this.toggleUpdateFileModal.bind(this);
    this.toggleImageViewer = this.toggleImageViewer.bind(this);
    this.deleteClasspieceModalToggle = this.deleteClasspieceModalToggle.bind(this);
    this.deleteClasspiece = this.deleteClasspiece.bind(this);
    this.updateSystemType = this.updateSystemType.bind(this);
    this.updateAlternateLabel = this.updateAlternateLabel.bind(this);
    this.removeAlternateLabel = this.removeAlternateLabel.bind(this);
  }

  updateSystemType(value) {
    let systemType = this.props.resourcesTypes.find(i=>i.labelId===value);
    if (typeof systemType!=="undefined") {
      this.setState({
        systemType: parseInt(systemType._id,10)
      });
    }
  }

  updateStatus(value) {
    this.setState({status:value});
  }

  formSubmit(e) {
    e.preventDefault();
    let systemType = this.state.systemType;
    if(typeof systemType==="object") {
      systemType = JSON.stringify(systemType);
    }
    let updateData = {
      label: this.state.label,
      alternateLabels: this.state.alternateLabels,
      originalLocation: this.state.originalLocation,
      systemType: systemType,
      description: this.state.description,
      status: this.state.status,
    };
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
      if (typeof metaItems==="string") {
        metaItems = jsonStringToObject(metaItems);
      }
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
        if (metaKey!=="data" && metaKey!=="XPKeywords") {
          let newRows = <div className="list-items">{this.parseMetadataItems(value)}</div>;
          newRow = <div key={i}><div className="metadata-title">{metaKey}</div>{newRows}</div>
        }
        else {
          newRow = <div key={i}><label>{metaKey}</label> : {value.join(" ")}</div>
        }
      }
      items.push(newRow);
      i++;
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

  toggleUpdateFileModal() {
    this.setState({
      updateFileModal: !this.state.updateFileModal
    })
  }

  toggleImageViewer(src) {
    this.setState({
      imageViewerVisible: !this.state.imageViewerVisible
    })
  }

  deleteClasspieceModalToggle() {
    this.setState({
      deleteClasspieceModal: !this.state.deleteClasspieceModal
    });
  }

  async deleteClasspiece() {
    if (this.state.deletingClasspiece) {
      return false;
    }
    this.setState({
      deletingClasspiece: true
    });
    let params = {_id: this.props.resource._id};
    let responseData = await axios({
      method: 'delete',
      url: APIPath+'delete-classpiece',
      crossDomain: true,
      params: params
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
    if (responseData.status) {
      this.setState({
        deletingClasspiece: false,
        deleteClasspieceModal: false
      });
      this.props.setRedirect();
    }
  }

  updateAlternateLabel(index, data) {
    let resource = this.props.resource;
    let alternateLabels = resource.alternateLabels;
    if (index==="new") {
      alternateLabels.push(data);
    }
    else if (index!==null) {
      alternateLabels[index] = data;
    }
    this.setState({
      alternateLabels: alternateLabels
    },()=> {
      let systemType = this.state.systemType;
      if(typeof systemType==="object") {
        systemType = JSON.stringify(systemType);
      }
      let updateData = {
        label: this.state.label,
        alternateLabels: this.state.alternateLabels,
        systemType: systemType,
        description: this.state.description,
        status: this.state.status,
      };
      this.props.update(updateData);
    });
  }

  removeAlternateLabel(index) {
    let resource = this.props.resource;
    let alternateLabels = resource.alternateLabels;
    if (index!==null) {
      alternateLabels.splice(index,1);
    }
    this.setState({
      alternateLabels: alternateLabels
    },()=> {
      let systemType = this.state.systemType;
      if(typeof systemType==="object") {
        systemType = JSON.stringify(systemType);
      }
      let updateData = {
        label: this.state.label,
        alternateLabels: this.state.alternateLabels,
        systemType: systemType,
        description: this.state.description,
        status: this.state.status,
      };
      this.props.update(updateData);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.closeUploadModal) {
      this.setState({
        updateFileModal: false
      })
    }
    if (this.props.resource===null && this.state.systemType==="undefined" && this.props.systemType!==null && this.props.resourcesTypes.length>0) {
      this.setState({
        systemType: this.props.systemType
      });
    }
    if (this.props.resource!==null) {
      if (
        (prevProps.resource===null && this.props.resource._id!==null)
         ||
        (prevProps.resource._id!==this.props.resource._id)
      ) {
        let status = 'private';
        let newLabel = this.props.resource?.label || '';
        let newOriginalLocation = this.props.resource?.originalLocation || '';
        let newDescription = this.props.resource?.description || '';
        let newSystemType = this.props.resource?.systemType || 'undefined';
        this.setState({
          status: status,
          label: newLabel,
          systemType: newSystemType,
          originalLocation: newOriginalLocation,
          description: newDescription,
          detailsOpen: true,
          metadataOpen: false,
          eventsOpen: false,
          organisationsOpen: false,
        });
      }
    }
  }

  render() {
    let resource = this.props.resource;
    let imgViewer = [];
    let thumbnailPath = getResourceThumbnailURL(resource);
    let thumbnailImage = [];
    let annotateBtn = [];
    if (resource!==null && thumbnailPath!==null && typeof resource.resourceType!=="undefined" && resource.resourceType==="image") {
      annotateBtn = <Link to={"/resource-annotate/"+this.props.resource._id} href={"/resource-annotate/"+this.props.resource._id} className="resource-upload-btn btn btn-info"><i className="fa fa-pencil" /> Annotate</Link>
      let fullsizePath = getResourceFullsizeURL(resource);
      thumbnailImage = [<div onClick={()=>this.toggleImageViewer(fullsizePath)} key='thumbnail' className="open-lightbox"><img src={thumbnailPath} alt={resource.label} className="img-fluid img-thumbnail" /></div>];
      imgViewer = <Viewer visible={this.state.imageViewerVisible} path={fullsizePath} label={this.state.label} toggle={this.toggleImageViewer}/>
    }
    if (resource!==null && typeof resource.resourceType!=="undefined" && resource.resourceType==="document") {
      let fullsizePath = getResourceFullsizeURL(resource);
      if (fullsizePath!==null) {
        thumbnailImage = [<a key="link" target="_blank" href={fullsizePath} className="pdf-thumbnail" rel="noopener noreferrer"><i className="fa fa-file-pdf-o"/></a>, <a key="link-label" target="_blank" href={fullsizePath} className="pdf-thumbnail" rel="noopener noreferrer"><label>Preview file</label> </a>];
      }
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
        updateSystemType={this.updateSystemType}
        />;
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
                updateSystemType={this.updateSystemType}
                />
            </div>
          </ModalBody>
          <ModalFooter className="text-right">
            <Button color="secondary" onClick={this.toggleUpdateFileModal}>Cancel</Button>
          </ModalFooter>
        </Modal>;
    }

    // system types
    let resourcesTypesOptions = [];
    let resourcesTypes = this.props.resourcesTypes;
    let isClasspiece = false;
    if (resourcesTypes.length>0) {
      let classpieceSystemType = resourcesTypes.find(i=>i.labelId==="Classpiece");
      if (resource!==null && resource.systemType===classpieceSystemType._id) {
        isClasspiece = true;
      }
      for (let st=0;st<resourcesTypes.length; st++) {
        let systemType = resourcesTypes[st];
        let systemTypeOption = <option value={systemType._id} key={st}>{systemType.label}</option>;
        resourcesTypesOptions.push(systemTypeOption);
      }
    }

    let deleteClasspieceBtn = [];
    let deleteClasspieceModal = [];
    if (isClasspiece) {
      deleteClasspieceBtn = <Button style={{marginBottom: "15px"}} color="danger" type="button" block={true} onClick={()=>this.deleteClasspieceModalToggle()}><i className="fa fa-trash" /> Delete Classpiece</Button>

      deleteClasspieceModal = <Modal isOpen={this.state.deleteClasspieceModal} toggle={this.deleteClasspieceModalToggle}>
          <ModalHeader toggle={this.deleteClasspieceModalToggle}>Delete Classpiece</ModalHeader>
          <ModalBody>
            The classpiece "{resource.label}" will be deleted.<br/>
            All related <b>Resources</b> and <b>People</b> will also be deleted.<br/>
            Related <b>Events</b> and <b>Organisations</b> will not be deleted.<br/>
            Continue?
          </ModalBody>
          <ModalFooter className="text-right">
            <Button className="pull-left" size="sm" color="secondary" onClick={this.deleteClasspieceModalToggle}>Cancel</Button>
            <Button size="sm" color="danger" outline onClick={()=>this.deleteClasspiece()}><i className="fa fa-trash" /> Delete</Button>
          </ModalFooter>
        </Modal>;
    }

    // metadata
    let metadataOutput = [];
    if (resource!==null) {
      if (typeof resource.metadata!=="undefined" && Object.entries(resource.metadata).length>0) {
        metadataOutput = this.parseMetadata(resource.metadata.image);
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

    let statusPublic = "secondary";
    let statusPrivate = "secondary";
    let publicOutline = true;
    let privateOutline = false;
    if (resource!==null && resource.status==="public") {
      statusPublic = "success";
      publicOutline = false;
      privateOutline = true;
    }

    let metadataCard = " hidden";
    if (metadataOutput.length>0) {
      metadataCard = "";
    }

    let errorContainerClass = " hidden";
    if (this.props.errorVisible) {
      errorContainerClass = "";
    }
    let errorContainer = <div className={"error-container"+errorContainerClass}>{this.props.errorText}</div>

    let alternateLabelsBlock = [];
    if (this.props.resource!==null) {
      let alData = this.props.resource.alternateLabels || [];
      alternateLabelsBlock = <div className="alternate-appelations">
        <div className="label">Alternate labels</div>
        <ResourceAlternateLabels
          data={alData}
          update={this.updateAlternateLabel}
          remove={this.removeAlternateLabel}
        />
      </div>
    }



    return (
      <div className="row">
        <div className="col-xs-12 col-sm-6">
          {thumbnailImage}
          {annotateBtn}
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
                    <div className="text-right">
                      <ButtonGroup>
                        <Button size="sm" outline={publicOutline} color={statusPublic} onClick={()=>this.updateStatus("public")}>Public</Button>
                        <Button size="sm" outline={privateOutline} color={statusPrivate} onClick={()=>this.updateStatus("private")}>Private</Button>
                      </ButtonGroup>
                    </div>
                    <FormGroup>
                      <Label>Label</Label>
                      <Input type="text" name="label" placeholder="Resource label..." value={this.state.label} onChange={this.handleChange}/>
                    </FormGroup>
                    {alternateLabelsBlock}
                    <FormGroup>
                     <Label>Type</Label>
                     <Input type="select" name="systemType" onChange={this.handleChange} value={this.state.systemType}>
                       {resourcesTypesOptions}
                     </Input>
                    </FormGroup>
                    <FormGroup>
                      <Label>Description</Label>
                      <Input type="textarea" name="description" placeholder="Resource description..." value={this.state.description} onChange={this.handleChange}/>
                    </FormGroup>
                    <FormGroup>
                      <Label>Original location</Label>
                      <Input type="textarea" name="originalLocation" placeholder="A URI pointint to the original location of the resource" value={this.state.originalLocation} onChange={this.handleChange}/>
                    </FormGroup>
                    <div className="text-right">
                      {deleteBtn}
                      {updateBtn}
                    </div>
                  </Form>
                </Collapse>
              </CardBody>
            </Card>
            {deleteClasspieceBtn}
            {deleteClasspieceModal}
            <Card className={metadataCard}>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'metadataOpen')}>Metadata<Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+metadataOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.metadataOpen}>
                  {metadataOutput}
                </Collapse>
              </CardBody>
            </Card>

            <RelatedEntitiesBlock
              item={this.props.resource}
              itemType="Resource"
              reload={this.props.reload}
              />

          </div>
        </div>
        {updateFileModal}
      </div>
    )
  }
}
export default ViewResource = connect(mapStateToProps, [])(ViewResource);;
