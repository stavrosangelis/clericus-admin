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
  InputGroup,
  InputGroupAddon,
  Collapse,
} from 'reactstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { getThumbnailURL, getPersonLabel } from '../helpers';
import PersonAppelations from './person-alternate-appelations';
import RelatedEntitiesBlock from './related-entities-block';

const mapStateToProps = (state) => ({
  personTypes: state.personTypes,
});

class ViewPerson extends Component {
  constructor(props) {
    super(props);

    const { person } = this.props;
    const status = person?.status || 'private';
    const honorificPrefix = person?.honorificPrefix || [''];
    const firstName = person?.firstName || '';
    const middleName = person?.middleName || '';
    const lastName = person?.lastName || '';
    const alternateAppelations = person?.alternateAppelations || [];
    const description = person?.description || '';
    const personType = person?.personType || '';

    this.state = {
      detailsOpen: true,
      metadataOpen: false,
      honorificPrefix,
      firstName,
      middleName,
      lastName,
      alternateAppelations,
      description,
      personType,
      status,
    };
    this.updateStatus = this.updateStatus.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleMultipleChange = this.handleMultipleChange.bind(this);
    this.parseMetadata = this.parseMetadata.bind(this);
    this.parseMetadataItems = this.parseMetadataItems.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.updateAlternateAppelation = this.updateAlternateAppelation.bind(this);
    this.removeAlternateAppelation = this.removeAlternateAppelation.bind(this);
    this.removeHP = this.removeHP.bind(this);
    this.addHP = this.addHP.bind(this);
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState({
      [name]: value,
    });
  }

  handleMultipleChange(e, i) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const { [name]: elem } = this.state;
    elem[i] = value;
    this.setState({
      [name]: elem,
    });
  }

  updateStatus(value) {
    this.setState({ status: value });
  }

  formSubmit(e) {
    e.preventDefault();
    const {
      honorificPrefix,
      firstName,
      middleName,
      lastName,
      alternateAppelations,
      description,
      personType,
      status,
    } = this.state;
    const { update } = this.props;
    const newData = {
      honorificPrefix,
      firstName,
      middleName,
      lastName,
      alternateAppelations,
      description,
      personType,
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
    const { person, update } = this.props;
    const { alternateAppelations } = person;
    const {
      honorificPrefix,
      firstName,
      middleName,
      lastName,
      description,
      personType,
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
          honorificPrefix,
          firstName,
          middleName,
          lastName,
          alternateAppelations,
          description,
          personType,
          status,
        };
        update(newData);
      }
    );
  }

  removeAlternateAppelation(index) {
    const { person, update } = this.props;
    const { alternateAppelations } = person;
    const {
      honorificPrefix,
      firstName,
      middleName,
      lastName,
      description,
      personType,
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
          honorificPrefix,
          firstName,
          middleName,
          lastName,
          alternateAppelations,
          description,
          personType,
          status,
        };
        update(newData);
      }
    );
  }

  removeHP(i) {
    const { honorificPrefix } = this.state;
    const hps = honorificPrefix;
    hps.splice(i, 1);
    this.setState({
      honorificPrefix: hps,
    });
  }

  addHP() {
    const { honorificPrefix } = this.state;
    const hps = honorificPrefix;
    hps.push('');
    this.setState({
      honorificPrefix: hps,
    });
  }

  render() {
    const {
      person,
      delete: deleteFn,
      updateBtn: propsUpdateBtn,
      errorVisible,
      errorText,
      personTypes,
      reload,
    } = this.props;
    const {
      detailsOpen,
      metadataOpen,
      status,
      honorificPrefix,
      firstName,
      middleName,
      lastName,
      description,
      personType,
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
    const thumbnailURL = getThumbnailURL(person);
    if (thumbnailURL !== null) {
      thumbnailImage = (
        <img
          src={thumbnailURL}
          className="img-fluid img-thumbnail"
          alt={getPersonLabel(person)}
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
        onClick={(e) => this.formSubmit(e)}
      >
        {propsUpdateBtn}
      </Button>
    );

    let errorContainerClass = ' hidden';
    if (errorVisible) {
      errorContainerClass = '';
    }
    const errorContainer = (
      <div className={`error-container${errorContainerClass}`}>{errorText}</div>
    );

    let personAppelationsData = [];
    if (person !== null) {
      personAppelationsData = person.alternateAppelations;
    }
    let honorificPrefixInputs = [];
    if (typeof honorificPrefix !== 'string') {
      honorificPrefixInputs = honorificPrefix.map((h, i) => {
        const key = `a${i}`;
        let item = (
          <InputGroup key={key}>
            <Input
              type="text"
              name="honorificPrefix"
              placeholder="Person honorific prefix..."
              value={honorificPrefix[i]}
              onChange={(e) => this.handleMultipleChange(e, i)}
            />
            <InputGroupAddon addonType="append">
              <Button
                type="button"
                color="info"
                outline
                onClick={() => this.removeHP(i)}
              >
                <b>
                  <i className="fa fa-minus" />
                </b>
              </Button>
            </InputGroupAddon>
          </InputGroup>
        );
        if (i === 0) {
          item = (
            <Input
              style={{ marginBottom: '5px' }}
              key={key}
              type="text"
              name="honorificPrefix"
              placeholder="Person honorific prefix..."
              value={honorificPrefix[i]}
              onChange={(e) => this.handleMultipleChange(e, i)}
            />
          );
        }
        return item;
      });
    }

    let alternateAppelationsBlock = [];
    if (person !== null) {
      alternateAppelationsBlock = (
        <div className="alternate-appelations">
          <div className="label">Alternate appelations</div>
          <PersonAppelations
            data={personAppelationsData}
            update={this.updateAlternateAppelation}
            remove={this.removeAlternateAppelation}
          />
        </div>
      );
    }

    const selectPersonTypes = personTypes?.map((p, i) => {
      const key = `a${i}`;
      return (
        <option key={key} value={p.label}>
          {p.label}
        </option>
      );
    });

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
                  <Form onSubmit={(e) => this.formSubmit(e)}>
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
                      <Label>Honorific Prefix</Label>
                      {honorificPrefixInputs}
                      <div className="text-right">
                        <Button
                          type="button"
                          color="info"
                          outline
                          size="xs"
                          onClick={() => this.addHP()}
                        >
                          Add new <i className="fa fa-plus" />
                        </Button>
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <Label>First name</Label>
                      <Input
                        type="text"
                        name="firstName"
                        placeholder="Person first name prefix..."
                        value={firstName}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Middle name</Label>
                      <Input
                        type="text"
                        name="middleName"
                        placeholder="Person middle name prefix..."
                        value={middleName}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Last name</Label>
                      <Input
                        type="text"
                        name="lastName"
                        placeholder="Person last name prefix..."
                        value={lastName}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    {alternateAppelationsBlock}
                    <FormGroup>
                      <Label>Description</Label>
                      <Input
                        type="textarea"
                        name="description"
                        placeholder="Person description..."
                        value={description}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Type</Label>
                      <Input
                        type="select"
                        name="personType"
                        value={personType}
                        onChange={this.handleChange}
                      >
                        {selectPersonTypes}
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
              item={person}
              itemType="Person"
              reload={reload}
            />
          </div>
        </div>
      </div>
    );
  }
}

ViewPerson.defaultProps = {
  person: null,
  update: () => {},
  delete: () => {},
  reload: () => {},
  updateBtn: null,
  personTypes: [],
  errorVisible: false,
  errorText: [],
};
ViewPerson.propTypes = {
  person: PropTypes.object,
  update: PropTypes.func,
  delete: PropTypes.func,
  reload: PropTypes.func,
  updateBtn: PropTypes.object,
  personTypes: PropTypes.array,
  errorVisible: PropTypes.bool,
  errorText: PropTypes.array,
};
export default compose(connect(mapStateToProps, []))(ViewPerson);
