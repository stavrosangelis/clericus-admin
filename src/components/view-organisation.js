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
} from 'reactstrap';
import PropTypes from 'prop-types';
import { getThumbnailURL } from '../helpers';
import OrganisationAppelations from './organisation-alternate-appelations';
import RelatedEntitiesBlock from './related-entities-block';

export default class ViewOrganisation extends Component {
  constructor(props) {
    super(props);

    const { organisation } = this.props;
    let status = 'private';
    let label = '';
    let description = '';
    let organisationType = '';
    let alternateAppelations = [];
    if (organisation !== null) {
      if (
        typeof organisation.label !== 'undefined' &&
        organisation.label !== null
      ) {
        label = organisation.label;
      }
      if (
        typeof organisation.description !== 'undefined' &&
        organisation.description !== null
      ) {
        description = organisation.description;
      }
      if (
        typeof organisation.organisationType !== 'undefined' &&
        organisation.organisationType !== null
      ) {
        organisationType = organisation.organisationType;
      }
      if (
        typeof organisation.alternateAppelations !== 'undefined' &&
        organisation.alternateAppelations !== null
      ) {
        alternateAppelations = organisation.alternateAppelations;
      }
      if (
        typeof organisation.status !== 'undefined' &&
        organisation.status !== null
      ) {
        status = organisation.status;
      }
    }
    this.state = {
      detailsOpen: true,
      label,
      description,
      organisationType,
      status,
      alternateAppelations,
    };
    this.updateStatus = this.updateStatus.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.parseMetadata = this.parseMetadata.bind(this);
    this.parseMetadataItems = this.parseMetadataItems.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.updateAlternateAppelation = this.updateAlternateAppelation.bind(this);
    this.removeAlternateAppelation = this.removeAlternateAppelation.bind(this);
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState({
      [name]: value,
    });
  }

  updateStatus(value) {
    this.setState({ status: value });
  }

  formSubmit(e) {
    e.preventDefault();
    const {
      label,
      description,
      organisationType,
      alternateAppelations,
      status,
    } = this.state;
    const { update } = this.props;
    const newData = {
      label,
      description,
      organisationType,
      alternateAppelations,
      status,
    };
    update(newData);
  }

  parseMetadata(metadata = null) {
    if (metadata === null) {
      return false;
    }
    const metadataOutput = [];
    let i = 0;
    Object.keys(metadata).forEach((key) => {
      const metaItems = metadata[key];
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
      } else {
        const newRows = (
          <div className="list-items">{this.parseMetadataItems(value)}</div>
        );
        newRow = (
          <div key={i}>
            <div className="metadata-title">{metaKey}</div>
            {newRows}
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

  updateAlternateAppelation(index, data) {
    const { organisation, update } = this.props;
    const { alternateAppelations } = organisation;
    const {
      label,
      description,
      organisationType,
      alternateAppelations: stateAlternateAppelations,
      status,
    } = this.state;
    if (index === 'new') {
      alternateAppelations.push(data);
    } else if (index !== null) {
      alternateAppelations[index] = data;
    }
    this.setState(
      {
        alternateAppelations,
      },
      () => {
        const newData = {
          label,
          description,
          organisationType,
          alternateAppelations: stateAlternateAppelations,
          status,
        };
        update(newData);
      }
    );
  }

  removeAlternateAppelation(index) {
    const { organisation, update } = this.props;
    const { alternateAppelations } = organisation;
    const {
      label,
      description,
      organisationType,
      alternateAppelations: stateAlternateAppelations,
      status,
    } = this.state;
    if (index !== null) {
      alternateAppelations.splice(index, 1);
    }
    this.setState(
      {
        alternateAppelations,
      },
      () => {
        const newData = {
          label,
          description,
          organisationType,
          stateAlternateAppelations,
          status,
        };
        update(newData);
      }
    );
  }

  render() {
    const {
      organisation,
      label,
      delete: deleteFn,
      updateBtn: propsUpdateBtn,
      errorVisible,
      errorText,
      organisationTypes,
      reload,
    } = this.props;
    const {
      detailsOpen,
      metadataOpen,
      status,
      label: stateLabel,
      description,
      organisationType,
    } = this.state;
    const detailsOpenActive = detailsOpen ? ' active' : '';
    const metadataOpenActive = metadataOpen ? ' active' : '';
    let statusPublic = 'secondary';
    const statusPrivate = 'secondary';
    let publicOutline = true;
    let privateOutline = false;
    if (status === 'public') {
      statusPublic = 'success';
      publicOutline = false;
      privateOutline = true;
    }

    let metadataItems = this.parseMetadata();

    const metadataCard = ' hidden';
    if (metadataItems.length > 0) {
      metadataItems = '';
    }

    let thumbnailImage = [];
    const thumbnailURL = getThumbnailURL(organisation);
    if (thumbnailURL !== null) {
      thumbnailImage = (
        <img
          src={thumbnailURL}
          className="img-fluid img-thumbnail"
          alt={label}
        />
      );
    }
    const metadataOutput = [];
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
      <Button
        color="primary"
        outline
        type="submit"
        size="sm"
        onClick={() => this.formSubmit}
      >
        {propsUpdateBtn}
      </Button>
    );

    const errorContainerClass = errorVisible ? '' : ' hidden';
    const errorContainer = (
      <div className={`error-container${errorContainerClass}`}>{errorText}</div>
    );

    let organisationAppelationsData = [];
    if (organisation !== null) {
      organisationAppelationsData = organisation.alternateAppelations;
    }

    let organisationTypesOptions = [];
    if (organisationTypes.length > 0) {
      organisationTypesOptions = organisationTypes.map((o, i) => {
        const key = `a${i}`;
        return (
          <option value={o.labelId} key={key}>
            {o.label}
          </option>
        );
      });
    }

    return (
      <div className="row">
        <div className="col-xs-12 col-sm-6">{thumbnailImage}</div>
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
                        placeholder="Organisation label..."
                        value={stateLabel}
                        onChange={this.handleChange}
                      />
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
                      <Input
                        type="textarea"
                        name="description"
                        placeholder="Organisation description..."
                        value={description}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Type</Label>
                      <Input
                        type="select"
                        name="organisationType"
                        placeholder="Organisation type..."
                        value={organisationType}
                        onChange={this.handleChange}
                      >
                        {organisationTypesOptions}
                      </Input>
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
              item={organisation}
              itemType="Organisation"
              reload={reload}
            />
          </div>
        </div>
      </div>
    );
  }
}

ViewOrganisation.defaultProps = {
  organisation: null,
  update: () => {},
  delete: () => {},
  label: '',
  updateBtn: null,
  errorVisible: false,
  errorText: [],
  organisationTypes: [],
  reload: () => {},
};
ViewOrganisation.propTypes = {
  organisation: PropTypes.object,
  update: PropTypes.func,
  delete: PropTypes.func,
  label: PropTypes.string,
  updateBtn: PropTypes.object,
  errorVisible: PropTypes.bool,
  errorText: PropTypes.array,
  organisationTypes: PropTypes.array,
  reload: PropTypes.func,
};
