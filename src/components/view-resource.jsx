import React, { Component } from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Button,
  ButtonGroup,
  Form,
  FormGroup,
  Label,
  Input,
  Collapse,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import {
  getResourceThumbnailURL,
  getResourceFullsizeURL,
  jsonStringToObject,
} from '../helpers';
import UploadFile from './upload-file';
import RelatedEntitiesBlock from './related-entities-block';
import ResourceAlternateLabels from './resource-alternate-labels';

import Viewer from './image-viewer';

const APIPath = process.env.REACT_APP_APIPATH;

const mapStateToProps = (state) => ({
  resourcesTypes: state.resourcesTypes,
});

class ViewResource extends Component {
  constructor(props) {
    super(props);
    const { resource } = this.props;
    const status = 'private';
    const newLabel = resource?.label || '';
    const newDescription = resource?.description || '';
    const newOriginalLocation = resource?.originalLocation || '';
    const newSystemType = resource?.systemType || 'undefined';
    this.state = {
      detailsOpen: true,
      metadataOpen: false,
      label: newLabel,
      alternateLabels: [],
      systemType: newSystemType,
      originalLocation: newOriginalLocation,
      description: newDescription,
      updateFileModal: false,
      imageViewerVisible: false,
      status,
      deleteClasspieceModal: false,
      deletingClasspiece: false,
    };
    this.updateStatus = this.updateStatus.bind(this);
    this.updatePropsSystemType = this.updatePropsSystemType.bind(this);
    this.updateResourceDetails = this.updateResourceDetails.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.parseMetadata = this.parseMetadata.bind(this);
    this.parseMetadataItems = this.parseMetadataItems.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.toggleUpdateFileModal = this.toggleUpdateFileModal.bind(this);
    this.toggleImageViewer = this.toggleImageViewer.bind(this);
    this.deleteClasspieceModalToggle = this.deleteClasspieceModalToggle.bind(
      this
    );
    this.deleteClasspiece = this.deleteClasspiece.bind(this);
    this.updateSystemType = this.updateSystemType.bind(this);
    this.updateAlternateLabel = this.updateAlternateLabel.bind(this);
    this.removeAlternateLabel = this.removeAlternateLabel.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {
      closeUploadModal,
      resource,
      systemType: propsSystemType,
      resourcesTypes,
    } = this.props;
    const { systemType } = this.state;
    if (closeUploadModal) {
      this.toggleUpdateFileModal(false);
    }
    if (
      resource === null &&
      systemType === 'undefined' &&
      propsSystemType !== null &&
      resourcesTypes.length > 0
    ) {
      this.updatePropsSystemType(propsSystemType);
    }
    if (resource !== null) {
      if (
        (prevProps.resource === null && resource._id !== null) ||
        prevProps.resource._id !== resource._id
      ) {
        this.updateResourceDetails(resource);
      }
    }
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  updateResourceDetails(resource) {
    const status = 'private';
    const {
      label,
      originalLocation,
      description,
      systemType: resourceSystemType,
    } = resource;
    const newLabel = label || '';
    const newOriginalLocation = originalLocation || '';
    const newDescription = description || '';
    const newSystemType = resourceSystemType || 'undefined';
    this.setState({
      status,
      label: newLabel,
      systemType: newSystemType,
      originalLocation: newOriginalLocation,
      description: newDescription,
      detailsOpen: true,
      metadataOpen: false,
    });
  }

  updatePropsSystemType(value) {
    this.setState({
      systemType: value,
    });
  }

  updateSystemType(value) {
    const { resourcesTypes } = this.props;
    const systemType = resourcesTypes.find((i) => i.labelId === value);
    if (typeof systemType !== 'undefined') {
      this.setState({
        systemType: parseInt(systemType._id, 10),
      });
    }
  }

  updateStatus(value) {
    this.setState({ status: value });
  }

  formSubmit(e) {
    e.preventDefault();
    const {
      label,
      alternateLabels,
      originalLocation,
      description,
      status,
    } = this.state;
    const { update } = this.props;
    let { systemType } = this.state;
    if (typeof systemType === 'object') {
      systemType = JSON.stringify(systemType);
    }
    const updateData = {
      label,
      alternateLabels,
      originalLocation,
      systemType,
      description,
      status,
    };
    update(updateData);
  }

  parseMetadata(metadata) {
    if (metadata === null) {
      return false;
    }
    const metadataOutput = [];
    let i = 0;
    Object.keys(metadata).forEach((key) => {
      let metaItems = metadata[key];
      if (typeof metaItems === 'string') {
        metaItems = jsonStringToObject(metaItems);
      }
      let metadataOutputItems = [];
      if (metaItems !== null && typeof metaItems.length === 'undefined') {
        metadataOutputItems = this.parseMetadataItems(metaItems);
      } else if (metaItems !== null) {
        const newItems = this.parseMetadata(metaItems[0]);
        metadataOutputItems.push(newItems);
      }
      metadataOutputItems = (
        <div className="list-items">{metadataOutputItems}</div>
      );
      const metaRow = (
        <div key={i}>
          <div className="metadata-title">{key}</div>
          {metadataOutputItems}
        </div>
      );
      metadataOutput.push(metaRow);
      i += 1;
    });
    return metadataOutput;
  }

  parseMetadataItems(metaItems) {
    let i = 0;
    const items = [];
    Object.keys(metaItems).forEach((metaKey) => {
      const value = metaItems[metaKey];
      let newRow = [];
      if (typeof value !== 'object') {
        newRow = (
          <div key={i}>
            <Label>{metaKey}</Label> : {metaItems[metaKey]}
          </div>
        );
      } else if (metaKey !== 'data' && metaKey !== 'XPKeywords') {
        const newRows = (
          <div className="list-items">{this.parseMetadataItems(value)}</div>
        );
        newRow = (
          <div key={i}>
            <div className="metadata-title">{metaKey}</div>
            {newRows}
          </div>
        );
      } else {
        newRow = (
          <div key={i}>
            <Label>{metaKey}</Label> : {value.join(' ')}
          </div>
        );
      }
      items.push(newRow);
      i += 1;
    });
    return items;
  }

  toggleCollapse(name) {
    const { [name]: value } = this.state;
    this.setState({
      [name]: !value,
    });
  }

  toggleUpdateFileModal(value = null) {
    const { updateFileModal: stateValue } = this.state;
    let updateValue = !stateValue;
    if (value !== null) {
      updateValue = value;
    }
    this.setState({
      updateFileModal: updateValue,
    });
  }

  toggleImageViewer() {
    const { imageViewerVisible } = this.state;
    this.setState({
      imageViewerVisible: !imageViewerVisible,
    });
  }

  deleteClasspieceModalToggle() {
    const { deleteClasspieceModal } = this.state;
    this.setState({
      deleteClasspieceModal: !deleteClasspieceModal,
    });
  }

  async deleteClasspiece() {
    const { deletingClasspiece } = this.state;
    const { resource, setRedirect } = this.props;
    if (deletingClasspiece) {
      return false;
    }
    this.setState({
      deletingClasspiece: true,
    });
    const params = { _id: resource._id };
    const responseData = await axios({
      method: 'delete',
      url: `${APIPath}delete-classpiece`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      this.setState({
        deletingClasspiece: false,
        deleteClasspieceModal: false,
      });
      setRedirect();
    }
    return false;
  }

  updateAlternateLabel(index, data) {
    const { resource, update } = this.props;
    const { alternateLabels } = resource;
    if (index === 'new') {
      alternateLabels.push(data);
    } else if (index !== null) {
      alternateLabels[index] = data;
    }
    this.setState(
      {
        alternateLabels,
      },
      () => {
        const { label, description, status } = this.state;
        let { systemType } = this.state;
        if (typeof systemType === 'object') {
          systemType = JSON.stringify(systemType);
        }
        const updateData = {
          label,
          alternateLabels,
          systemType,
          description,
          status,
        };
        update(updateData);
      }
    );
  }

  removeAlternateLabel(index) {
    const { resource, update } = this.props;
    const { alternateLabels } = resource;
    if (index !== null) {
      alternateLabels.splice(index, 1);
    }
    this.setState(
      {
        alternateLabels,
      },
      () => {
        const { label, description, status } = this.state;
        let { systemType } = this.state;
        if (typeof systemType === 'object') {
          systemType = JSON.stringify(systemType);
        }
        const updateData = {
          label,
          alternateLabels,
          systemType,
          description,
          status,
        };
        update(updateData);
      }
    );
  }

  render() {
    const {
      resource,
      delete: deleteFn,
      updateBtn: propsUpdateBtn,
      uploadResponse,
      className,
      errorVisible,
      errorText,
      reload,
    } = this.props;
    const {
      imageViewerVisible,
      label,
      systemType,
      description,
      updateFileModal: stateUpdateFileModal,
      deleteClasspieceModal: stateDeleteClasspieceModal,
      detailsOpen,
      metadataOpen,
      originalLocation,
    } = this.state;
    let imgViewer = [];
    const thumbnailPath = getResourceThumbnailURL(resource);
    let thumbnailImage = [];
    let annotateBtn = [];
    if (
      resource !== null &&
      thumbnailPath !== null &&
      typeof resource.resourceType !== 'undefined' &&
      resource.resourceType === 'image'
    ) {
      annotateBtn = (
        <Link
          to={`/resource-annotate/${resource._id}`}
          href={`/resource-annotate/${resource._id}`}
          className="resource-upload-btn btn btn-info"
        >
          <i className="fa fa-pencil" /> Annotate
        </Link>
      );
      const fullsizePath = getResourceFullsizeURL(resource);
      thumbnailImage = [
        <div
          onClick={() => this.toggleImageViewer(fullsizePath)}
          key="thumbnail"
          className="open-lightbox"
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle image viewer"
        >
          <img
            src={thumbnailPath}
            alt={resource.label}
            className="img-fluid img-thumbnail"
          />
        </div>,
      ];
      imgViewer = (
        <Viewer
          visible={imageViewerVisible}
          path={fullsizePath}
          label={label}
          toggle={this.toggleImageViewer}
        />
      );
    }
    if (
      resource !== null &&
      typeof resource.resourceType !== 'undefined' &&
      resource.resourceType === 'document'
    ) {
      const fullsizePath = getResourceFullsizeURL(resource);
      if (fullsizePath !== null) {
        thumbnailImage = [
          <a
            key="link"
            target="_blank"
            href={fullsizePath}
            className="pdf-thumbnail"
            rel="noopener noreferrer"
          >
            <i className="fa fa-file-pdf-o" />
          </a>,
          <a
            key="link-label"
            target="_blank"
            href={fullsizePath}
            className="pdf-thumbnail"
            rel="noopener noreferrer"
          >
            <Label>Preview file</Label>{' '}
          </a>,
        ];
      }
    }
    const deleteBtn = (
      <Button
        color="danger"
        onClick={deleteFn}
        outline
        type="button"
        size="sm"
        className="pull-left"
      >
        <i className="fa fa-trash-o" /> Delete
      </Button>
    );
    const updateBtn = (
      <Button color="primary" outline type="submit" size="sm">
        {propsUpdateBtn}
      </Button>
    );

    let updateFileModal = [];
    if (resource === null) {
      thumbnailImage = (
        <UploadFile
          _id={null}
          systemType={systemType}
          uploadResponse={uploadResponse}
          label={label}
          description={description}
          updateSystemType={this.updateSystemType}
        />
      );
    } else {
      thumbnailImage.push(
        <Button
          style={{ marginTop: '10px' }}
          color="info"
          className="resource-upload-btn"
          key="update-img-btn"
          onClick={() => this.toggleUpdateFileModal()}
        >
          <i className="fa fa-refresh" /> Update file
        </Button>
      );

      updateFileModal = (
        <Modal
          isOpen={stateUpdateFileModal}
          toggle={() => this.toggleUpdateFileModal()}
          className={className}
        >
          <ModalHeader toggle={() => this.toggleUpdateFileModal()}>
            Update file
          </ModalHeader>
          <ModalBody>
            <div
              style={{
                position: 'relative',
                display: 'block',
                margin: '0 auto',
              }}
            >
              <UploadFile
                _id={resource._id}
                systemType={systemType}
                uploadResponse={uploadResponse}
                label={label}
                description={description}
                updateSystemType={this.updateSystemType}
              />
            </div>
          </ModalBody>
          <ModalFooter className="text-right">
            <Button
              color="secondary"
              onClick={() => this.toggleUpdateFileModal()}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      );
    }

    // system types
    const resourcesTypesOptions = [];
    const { resourcesTypes } = this.props;
    let isClasspiece = false;
    if (resourcesTypes.length > 0) {
      const classpieceSystemType = resourcesTypes.find(
        (i) => i.labelId === 'Classpiece'
      );
      if (
        resource !== null &&
        resource.systemType === classpieceSystemType._id
      ) {
        isClasspiece = true;
      }
      for (let st = 0; st < resourcesTypes.length; st += 1) {
        const newSystemType = resourcesTypes[st];
        const systemTypeOption = (
          <option value={newSystemType._id} key={st}>
            {newSystemType.label}
          </option>
        );
        resourcesTypesOptions.push(systemTypeOption);
      }
    }

    let deleteClasspieceBtn = [];
    let deleteClasspieceModal = [];
    if (isClasspiece) {
      deleteClasspieceBtn = (
        <Button
          style={{ marginBottom: '15px' }}
          color="danger"
          type="button"
          block
          onClick={() => this.deleteClasspieceModalToggle()}
        >
          <i className="fa fa-trash" /> Delete Classpiece
        </Button>
      );

      deleteClasspieceModal = (
        <Modal
          isOpen={stateDeleteClasspieceModal}
          toggle={() => this.deleteClasspieceModalToggle()}
        >
          <ModalHeader toggle={this.deleteClasspieceModalToggle}>
            Delete Classpiece
          </ModalHeader>
          <ModalBody>
            The classpiece &quot;{resource.label}&quot; will be deleted.
            <br />
            All related <b>Resources</b> and <b>People</b> will also be deleted.
            <br />
            Related <b>Events</b> and <b>Organisations</b> will not be deleted.
            <br />
            Continue?
          </ModalBody>
          <ModalFooter className="text-right">
            <Button
              className="pull-left"
              size="sm"
              color="secondary"
              onClick={this.deleteClasspieceModalToggle}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              color="danger"
              outline
              onClick={() => this.deleteClasspiece()}
            >
              <i className="fa fa-trash" /> Delete
            </Button>
          </ModalFooter>
        </Modal>
      );
    }

    // metadata
    let metadataOutput = [];
    if (resource !== null) {
      if (
        typeof resource.metadata !== 'undefined' &&
        Object.entries(resource.metadata).length > 0
      ) {
        metadataOutput = this.parseMetadata(resource.metadata.image);
      }
    }

    const detailsOpenActive = detailsOpen ? ' active' : '';
    const metadataOpenActive = metadataOpen ? ' active' : '';
    let statusPublic = 'secondary';
    const statusPrivate = 'secondary';
    let publicOutline = true;
    let privateOutline = false;
    if (resource !== null && resource.status === 'public') {
      statusPublic = 'success';
      publicOutline = false;
      privateOutline = true;
    }

    let metadataCard = ' hidden';
    if (metadataOutput.length > 0) {
      metadataCard = '';
    }

    const errorContainerClass = errorVisible ? '' : ' hidden';
    const errorContainer = (
      <div className={`error-container${errorContainerClass}`}>{errorText}</div>
    );

    let alternateLabelsBlock = [];
    if (resource !== null) {
      const alData = resource.alternateLabels || [];
      alternateLabelsBlock = (
        <div className="alternate-appelations">
          <div className="label">Alternate labels</div>
          <ResourceAlternateLabels
            data={alData}
            update={this.updateAlternateLabel}
            remove={this.removeAlternateLabel}
          />
        </div>
      );
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
                <CardTitle onClick={() => this.toggleCollapse('detailsOpen')}>
                  Details{' '}
                  <Button
                    type="button"
                    className="pull-right"
                    color="secondary"
                    outline
                    size="xs"
                  >
                    <i
                      className={`collapse-toggle fa fa-angle-left${detailsOpenActive}`}
                    />
                  </Button>
                </CardTitle>
                {errorContainer}
                <Collapse isOpen={detailsOpen}>
                  <Form onSubmit={this.formSubmit}>
                    <div className="text-right">
                      <ButtonGroup>
                        <Button
                          size="sm"
                          outline={publicOutline}
                          color={statusPublic}
                          onClick={() => this.updateStatus('public')}
                        >
                          Public
                        </Button>
                        <Button
                          size="sm"
                          outline={privateOutline}
                          color={statusPrivate}
                          onClick={() => this.updateStatus('private')}
                        >
                          Private
                        </Button>
                      </ButtonGroup>
                    </div>
                    <FormGroup>
                      <Label>Label</Label>
                      <Input
                        type="text"
                        name="label"
                        placeholder="Resource label..."
                        value={label}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    {alternateLabelsBlock}
                    <FormGroup>
                      <Label>Type</Label>
                      <Input
                        type="select"
                        name="systemType"
                        onChange={this.handleChange}
                        value={systemType}
                      >
                        {resourcesTypesOptions}
                      </Input>
                    </FormGroup>
                    <FormGroup>
                      <Label>Description</Label>
                      <Input
                        type="textarea"
                        name="description"
                        placeholder="Resource description..."
                        value={description}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Original location</Label>
                      <Input
                        type="textarea"
                        name="originalLocation"
                        placeholder="A URI pointing to the original location of the resource"
                        value={originalLocation}
                        onChange={this.handleChange}
                      />
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
                <CardTitle onClick={() => this.toggleCollapse('metadataOpen')}>
                  Metadata
                  <Button
                    type="button"
                    className="pull-right"
                    color="secondary"
                    outline
                    size="xs"
                  >
                    <i
                      className={`collapse-toggle fa fa-angle-left${metadataOpenActive}`}
                    />
                  </Button>
                </CardTitle>
                <Collapse isOpen={metadataOpen}>{metadataOutput}</Collapse>
              </CardBody>
            </Card>

            <RelatedEntitiesBlock
              item={resource}
              itemType="Resource"
              reload={reload}
            />
          </div>
        </div>
        {updateFileModal}
      </div>
    );
  }
}

ViewResource.defaultProps = {
  resource: null,
  closeUploadModal: false,
  systemType: '',
  resourcesTypes: [],
  update: () => {},
  setRedirect: () => {},
  delete: () => {},
  updateBtn: {},
  uploadResponse: () => {},
  className: '',
  errorVisible: false,
  errorText: [],
  reload: () => {},
};
ViewResource.propTypes = {
  resource: PropTypes.object,
  closeUploadModal: PropTypes.bool,
  systemType: PropTypes.string,
  resourcesTypes: PropTypes.array,
  update: PropTypes.func,
  setRedirect: PropTypes.func,
  delete: PropTypes.func,
  updateBtn: PropTypes.object,
  uploadResponse: PropTypes.func,
  className: PropTypes.string,
  errorVisible: PropTypes.bool,
  errorText: PropTypes.array,
  reload: PropTypes.func,
};
export default compose(connect(mapStateToProps, []))(ViewResource);
