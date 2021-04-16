import React, { Component } from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Collapse,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getResourceThumbnailURL } from '../helpers';
import LazyList from './lazylist';

export default class ViewClasspiece extends Component {
  static formSubmit(e) {
    e.preventDefault();
  }

  static renderPerson(reference) {
    if (reference.ref !== null) {
      let label = reference.ref.firstName;
      if (reference.ref.middleName !== '') {
        label += ` ${reference.ref.middleName}`;
      }
      if (reference.ref.lastName !== '') {
        label += ` ${reference.ref.lastName}`;
      }
      const { _id } = reference.ref;
      const url = `/person/${_id}`;
      const newRow = (
        <div key={_id}>
          <Link to={url} href={url}>
            <i>{reference.refType}</i> <b>{label}</b>
          </Link>
        </div>
      );
      return newRow;
    }
    return [];
  }

  constructor(props) {
    super(props);
    const { resource } = this.props;

    this.state = {
      label: resource.label,
      detailsOpen: false,
      metadataOpen: false,
      eventsOpen: false,
      organisationsOpen: false,
      peopleOpen: false,
      resourcesOpen: false,
    };
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

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState({
      [name]: value,
    });
  }

  parseMetadata(metadata) {
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
      const output = <div className="list-items">{metadataOutputItems}</div>;
      const metaRow = (
        <div key={i}>
          <div className="metadata-title">{key}</div>
          {output}
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

  relatedEvents() {
    const { resource } = this.props;
    const references = resource.events;
    const output = [];
    for (let i = 0; i < references.length; i += 1) {
      const reference = references[i];
      if (reference.ref !== null) {
        const { label } = reference.ref;
        const newRow = (
          <div key={i}>
            <Link
              to={`/event/${reference.ref._id}`}
              href={`/event/${reference.ref._id}`}
            >
              <i>{reference.refType}</i> <b>{label}</b>
            </Link>
          </div>
        );
        output.push(newRow);
      }
    }
    return output;
  }

  relatedOrganisations() {
    const { resource } = this.props;
    const references = resource.organisations;
    const output = [];
    for (let i = 0; i < references.length; i += 1) {
      const reference = references[i];
      if (reference.ref !== null) {
        const { label } = reference.ref;

        const newRow = (
          <div key={i}>
            <Link
              to={`/organisations/${reference.ref._id}`}
              href={`/organisations/${reference.ref._id}`}
            >
              <i>{reference.refType}</i> <b>{label}</b>
            </Link>
          </div>
        );
        output.push(newRow);
      }
    }
    return output;
  }

  toggleCollapse(name) {
    const { [name]: value } = this.state;
    this.setState({
      [name]: !value,
    });
  }

  relatedResources() {
    const { resource } = this.props;
    const references = resource.resources;
    const output = [];
    for (let i = 0; i < references.length; i += 1) {
      const reference = references[i];
      const thumbnailPath = getResourceThumbnailURL(reference.ref);
      let thumbnailImage = [];
      if (thumbnailPath !== null) {
        thumbnailImage = (
          <img
            src={thumbnailPath}
            alt={reference.label}
            className="img-fluid"
          />
        );
      }
      const newRow = (
        <div key={i} className="img-thumbnail related-resource">
          <Link
            to={`/resource/${reference.ref._id}`}
            href={`/resource/${reference.ref._id}`}
          >
            <i>{reference.refType}</i>
            <br />
            {thumbnailImage}
          </Link>
        </div>
      );
      output.push(newRow);
    }
    return output;
  }

  relatedPeople() {
    const { resource } = this.props;
    const references = resource.people;
    const output = [];
    for (let i = 0; i < references.length; i += 1) {
      const reference = references[i];
      if (reference.ref !== null) {
        let label = reference.ref.firstName;
        if (reference.ref.lastName !== '') {
          label += ` ${reference.ref.lastName}`;
        }

        const newRow = (
          <div key={i}>
            <Link
              to={`/person/${reference.ref._id}`}
              href={`/person/${reference.ref._id}`}
            >
              <i>{reference.refType}</i> <b>{label}</b>
            </Link>
          </div>
        );
        output.push(newRow);
      }
    }
    return output;
  }

  render() {
    const {
      resource,
      detailsOpen,
      metadataOpen,
      eventsOpen,
      organisationsOpen,
      peopleOpen,
      resourcesOpen,
    } = this.props;
    const {
      detailsOpen: stateDetailsOpen,
      label,
      metadataOpen: stateMetadataOpen,
      eventsOpen: stateEventsOpen,
      organisationsOpen: stateOrganisationsOpen,
      peopleOpen: statePeopleOpen,
      resourcesOpen: stateResourcesOpen,
    } = this.state;
    const thumbnailPath = getResourceThumbnailURL(resource);
    let thumbnailImage = [];
    if (thumbnailPath !== null) {
      thumbnailImage = (
        <img
          src={thumbnailPath}
          alt={resource.label}
          className="img-fluid img-thumbnail"
        />
      );
    }
    // metadata
    const metadataOutput = this.parseMetadata(resource.metadata[0].image);

    const detailsOpenActive = detailsOpen ? ' active' : '';
    const metadataOpenActive = metadataOpen ? ' active' : '';
    const eventsOpenActive = eventsOpen ? ' active' : '';
    const organisationsOpenActive = organisationsOpen ? ' active' : '';
    const peopleOpenActive = peopleOpen ? ' active' : '';
    const resourcesOpenActive = resourcesOpen ? ' active' : '';

    const relatedEvents = this.relatedEvents();
    const relatedOrganisations = this.relatedOrganisations();
    const relatedPeople = this.relatedPeople();
    const relatedResources = this.relatedResources();

    const relatedEventsCard = relatedEvents.length > 0 ? '' : ' hidden';
    const relatedOrganisationsCard =
      relatedOrganisations.length > 0 ? '' : ' hidden';
    const relatedPeopleCard = relatedPeople.length > 0 ? '' : ' hidden';
    const relatedResourcesCard = relatedResources.length > 0 ? '' : ' hidden';
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
                <Collapse isOpen={stateDetailsOpen}>
                  <Form onSubmit={this.formSubmit}>
                    <FormGroup>
                      <Label for="labelInput">Label</Label>
                      <Input
                        type="text"
                        name="label"
                        id="labelInput"
                        placeholder="Resource label..."
                        value={label}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    <Button color="primary" outline type="submit" size="sm">
                      <i className="fa fa-save" /> Update
                    </Button>
                  </Form>
                </Collapse>
              </CardBody>
            </Card>

            <Card>
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
                <Collapse isOpen={stateMetadataOpen}>{metadataOutput}</Collapse>
              </CardBody>
            </Card>

            <Card className={relatedEventsCard}>
              <CardBody>
                <CardTitle onClick={() => this.toggleCollapse('eventsOpen')}>
                  Related events{' '}
                  <Button
                    type="button"
                    className="pull-right"
                    color="secondary"
                    outline
                    size="xs"
                  >
                    <i
                      className={`collapse-toggle fa fa-angle-left${eventsOpenActive}`}
                    />
                  </Button>
                </CardTitle>
                <Collapse isOpen={stateEventsOpen}>{relatedEvents}</Collapse>
              </CardBody>
            </Card>

            <Card className={relatedOrganisationsCard}>
              <CardBody>
                <CardTitle
                  onClick={() => this.toggleCollapse('organisationsOpen')}
                >
                  Related Organisations{' '}
                  <Button
                    type="button"
                    className="pull-right"
                    color="secondary"
                    outline
                    size="xs"
                  >
                    <i
                      className={`collapse-toggle fa fa-angle-left${organisationsOpenActive}`}
                    />
                  </Button>
                </CardTitle>
                <Collapse isOpen={stateOrganisationsOpen}>
                  {relatedOrganisations}
                </Collapse>
              </CardBody>
            </Card>

            <Card className={relatedPeopleCard}>
              <CardBody>
                <CardTitle onClick={() => this.toggleCollapse('peopleOpen')}>
                  Related people{' '}
                  <Button
                    type="button"
                    className="pull-right"
                    color="secondary"
                    outline
                    size="xs"
                  >
                    <i
                      className={`collapse-toggle fa fa-angle-left${peopleOpenActive}`}
                    />
                  </Button>
                </CardTitle>
                <Collapse isOpen={statePeopleOpen}>
                  <LazyList
                    limit={50}
                    range={25}
                    items={resource.people}
                    containerClass="filter-body"
                    renderItem={this.renderPerson}
                  />
                </Collapse>
              </CardBody>
            </Card>

            <Card className={relatedResourcesCard}>
              <CardBody>
                <CardTitle onClick={() => this.toggleCollapse('resourcesOpen')}>
                  Related resources{' '}
                  <Button
                    type="button"
                    className="pull-right"
                    color="secondary"
                    outline
                    size="xs"
                  >
                    <i
                      className={`collapse-toggle fa fa-angle-left${resourcesOpenActive}`}
                    />
                  </Button>
                </CardTitle>
                <Collapse isOpen={stateResourcesOpen}>
                  {relatedResources}
                </Collapse>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

ViewClasspiece.defaultProps = {
  resource: null,
  detailsOpen: false,
  metadataOpen: false,
  eventsOpen: false,
  organisationsOpen: false,
  peopleOpen: false,
  resourcesOpen: false,
};
ViewClasspiece.propTypes = {
  resource: PropTypes.object,
  detailsOpen: PropTypes.bool,
  metadataOpen: PropTypes.bool,
  eventsOpen: PropTypes.bool,
  organisationsOpen: PropTypes.bool,
  peopleOpen: PropTypes.bool,
  resourcesOpen: PropTypes.bool,
};
