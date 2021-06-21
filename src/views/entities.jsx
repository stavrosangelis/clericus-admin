import React, { Component, Suspense, lazy } from 'react';
import axios from 'axios';
import {
  Card,
  CardBody,
  Collapse,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from 'reactstrap';
import Select from 'react-select';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { addGenericReference } from '../helpers';

import { loadDefaultEntities } from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));

function mapDispatchToProps(dispatch) {
  return {
    loadDefaultEntities: () => dispatch(loadDefaultEntities()),
  };
}

const APIPath = process.env.REACT_APP_APIPATH;

class Entities extends Component {
  static entitiesList(entities) {
    const options = [];
    const defaultValue = { value: '', label: '--' };
    options.push(defaultValue);
    for (let i = 0; i < entities.length; i += 1) {
      const entity = entities[i];
      const option = { value: entity._id, label: entity.label };
      options.push(option);
    }
    return options;
  }

  static termsList(terms, sep = '') {
    const options = [];
    for (let i = 0; i < terms.length; i += 1) {
      const term = terms[i];
      const option = { value: term._id, label: `${sep} ${term.label}` };
      options.push(option);
    }
    return options;
  }

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      entities: [],
      entity: null,
      entityDefinition: '',
      entityExample: '',
      entityLabel: '',
      entityParent: null,
      taxonomyTerms: [],
      detailsOpen: true,
      propertiesOpen: true,
      propertyModalVisible: false,
      property: null,
      propertyTerm: '',
      propertyEntityRef: '',
      propertySaving: false,
      propertyErrorVisible: false,
      propertyErrorText: [],
      propertySaveBtn: (
        <span>
          <i className="fa fa-save" /> Save
        </span>
      ),
      updating: false,
      updateBtn: (
        <span>
          <i className="fa fa-save" /> Update
        </span>
      ),
      errorVisible: false,
      errorText: [],
    };

    this.load = this.load.bind(this);
    this.loadEntity = this.loadEntity.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.propertySubmit = this.propertySubmit.bind(this);
    this.deleteProperty = this.deleteProperty.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.propertiesList = this.propertiesList.bind(this);
    this.loadTaxonomy = this.loadTaxonomy.bind(this);
    this.list = this.list.bind(this);
    this.togglePropertyModal = this.togglePropertyModal.bind(this);
  }

  componentDidMount() {
    this.load();
    this.loadTaxonomy();
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  async load() {
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}entities`,
      crossDomain: true,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    this.setState({
      loading: false,
      entities: responseData.data,
    });
  }

  async loadEntity(_id = null) {
    if (_id === null) {
      return false;
    }
    const params = { _id };
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}entity`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });

    let entityDefinition = '';
    let entityExample = '';
    let entityLabel = '';
    let entityParent = null;
    if (responseData.definition !== null) {
      entityDefinition = responseData.definition;
    }
    if (responseData.example !== null) {
      entityExample = responseData.example;
    }
    if (responseData.label !== null) {
      entityLabel = responseData.label;
    }
    if (responseData.parent !== null) {
      entityParent = responseData.parent;
    }
    this.setState({
      entity: responseData,
      entityDefinition,
      entityExample,
      entityLabel,
      entityParent,
    });
    return false;
  }

  toggleCollapse(name) {
    const { [name]: value } = this.state;
    this.setState({
      [name]: !value,
    });
  }

  async formSubmit(e) {
    e.preventDefault();
    const { loadDefaultEntities: loadDefaultEntitiesFn } = this.props;
    const {
      updating,
      entity,
      entityLabel,
      entityDefinition,
      entityExample,
      entityParent,
    } = this.state;
    if (updating) {
      return false;
    }
    this.setState({
      updating: true,
      updateBtn: (
        <span>
          <i className="fa fa-save" /> <i>Saving...</i>{' '}
          <Spinner color="info" size="sm" />
        </span>
      ),
    });
    const postData = {
      _id: entity._id,
      label: entityLabel,
      labelId: entity.labelId,
      definition: entityDefinition,
      example: entityExample,
      properties: entity.properties,
    };
    let parentValue = null;
    if (entityParent !== null && entityParent.value !== '') {
      parentValue = entityParent.value;
    }
    postData.parent = parentValue;
    const context = this;
    if (this.label === '') {
      this.setState({
        errorVisible: true,
        errorText: <div>Please add a label to continue</div>,
        updating: false,
        updateBtn: (
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        ),
      });
      setTimeout(() => {
        context.setState({
          updateBtn: (
            <span>
              <i className="fa fa-save" /> Save
            </span>
          ),
        });
      }, 2000);
      return false;
    }

    const responseData = await axios({
      method: 'put',
      url: `${APIPath}entity`,
      crossDomain: true,
      data: postData,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });

    if (responseData.status) {
      this.setState({
        errorVisible: false,
        errorText: [],
        updating: false,
        updateBtn: (
          <span>
            <i className="fa fa-save" /> Save success{' '}
            <i className="fa fa-check" />{' '}
          </span>
        ),
      });
      this.load();
      this.loadEntity(context.state.entity._id);
      loadDefaultEntitiesFn();
      setTimeout(() => {
        context.setState({
          updateBtn: (
            <span>
              <i className="fa fa-save" /> Save
            </span>
          ),
        });
      }, 1000);
    } else {
      const { error } = responseData;
      const errorText = [];
      for (let i = 0; i < error.length; i += 1) {
        errorText.push(<div key={i}>{error[i]}</div>);
      }
      this.setState({
        errorVisible: true,
        errorText,
        updating: false,
        updateBtn: (
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        ),
      });
      setTimeout(() => {
        context.setState({
          updateBtn: (
            <span>
              <i className="fa fa-save" /> Save
            </span>
          ),
        });
      }, 2000);
    }
    return false;
  }

  async propertySubmit(e) {
    e.preventDefault();
    const {
      propertySaving,
      propertyTerm,
      propertyEntityRef,
      entity,
    } = this.state;
    const context = this;
    if (propertySaving) {
      return false;
    }
    this.setState({
      propertySaving: true,
      propertySaveBtn: (
        <span>
          <i className="fa fa-save" /> <i>Saving...</i>{' '}
          <Spinner size="sm" color="info" />
        </span>
      ),
    });
    if (propertyTerm === '' || propertyTerm.value === '') {
      this.setState({
        propertySaving: false,
        propertySaveBtn: (
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        ),
        propertyErrorVisible: true,
        propertyErrorText: <div>Please select a Relation to continue</div>,
      });
      setTimeout(() => {
        context.setState({
          propertySaveBtn: (
            <span>
              <i className="fa fa-save" /> Save
            </span>
          ),
        });
      }, 2000);
      return false;
    }
    if (propertyEntityRef === '' || propertyEntityRef.value === '') {
      this.setState({
        propertySaving: false,
        propertySaveBtn: (
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        ),
        propertyErrorVisible: true,
        propertyErrorText: (
          <div>Please select a Referenced Entity to continue</div>
        ),
      });
      setTimeout(() => {
        context.setState({
          propertySaveBtn: (
            <span>
              <i className="fa fa-save" /> Save
            </span>
          ),
        });
      }, 2000);
      return false;
    }
    this.setState({
      propertySaving: false,
    });

    const newReference = {
      items: [
        { _id: entity._id, type: 'Entity' },
        { _id: propertyEntityRef.value, type: 'Entity' },
      ],
      taxonomyTermId: propertyTerm.value,
    };
    const addReference = await addGenericReference(newReference);
    if (addReference.data.status) {
      this.setState({
        propertySaving: false,
        propertySaveBtn: (
          <span>
            <i className="fa fa-save" /> Save success{' '}
            <i className="fa fa-check" />{' '}
          </span>
        ),
        propertyModalVisible: false,
      });
      await this.loadEntity(entity._id);
      loadDefaultEntities();
      setTimeout(() => {
        context.setState({
          propertySaveBtn: (
            <span>
              <i className="fa fa-save" /> Save
            </span>
          ),
        });
      }, 1000);
    } else {
      const { error } = addReference;
      const errorText = [];
      for (let i = 0; i < error.length; i += 1) {
        errorText.push(<div key={i}>{error[i]}</div>);
      }
      this.setState({
        propertySaving: false,
        propertySaveBtn: (
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        ),
        propertyErrorVisible: true,
        propertyErrorText: errorText,
      });
      setTimeout(() => {
        context.setState({
          propertySaveBtn: (
            <span>
              <i className="fa fa-save" /> Save
            </span>
          ),
        });
      }, 2000);
    }
    return false;
  }

  async deleteProperty() {
    const { entity, propertyEntityRef, propertyTerm, property } = this.state;
    let newReference = {
      items: [
        { _id: entity._id, type: 'Entity' },
        { _id: propertyEntityRef.value, type: 'Entity' },
      ],
      taxonomyTermId: propertyTerm.value,
    };
    if (property.term.direction === 'to') {
      newReference = {
        items: [
          { _id: propertyEntityRef.value, type: 'Entity' },
          { _id: entity._id, type: 'Entity' },
        ],
        taxonomyTermId: propertyTerm.value,
      };
    }
    const responseData = await axios({
      method: 'delete',
      url: `${APIPath}reference`,
      crossDomain: true,
      data: newReference,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      this.setState({
        property: null,
        propertyModalVisible: false,
      });

      await this.loadEntity(entity._id);
      loadDefaultEntities();
    } else {
      const { error } = responseData.data;
      const errorText = [];
      for (let i = 0; i < error.length; i += 1) {
        errorText.push(<div key={i}>{error[i]}</div>);
      }
      this.setState({
        propertyErrorVisible: true,
        propertyErrorText: errorText,
      });
    }
    return false;
  }

  select2Change(selectedOption, element = null) {
    if (element === null) {
      return false;
    }
    this.setState({
      [element]: selectedOption,
    });
    return false;
  }

  list(entities, parentKey = null) {
    const output = [];
    for (let i = 0; i < entities.length; i += 1) {
      const entity = entities[i];
      const item = (
        <li key={entity._id}>
          <div
            onClick={() => this.loadEntity(entity._id)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="load entity"
          >
            {entity.label}
          </div>
        </li>
      );
      output.push(item);
      if (
        typeof entity.children !== 'undefined' &&
        entity.children.length > 0
      ) {
        const children = this.list(entity.children, i);
        output.push(children);
      }
    }
    let itemKey = 0;
    if (parentKey !== null) {
      itemKey = parentKey;
    }
    return (
      <ul className="entities-list" key={`list-${itemKey}`}>
        {output}
      </ul>
    );
  }

  togglePropertyModal(property = null) {
    const { propertyModalVisible } = this.state;
    const visible = !propertyModalVisible;
    const update = { propertyModalVisible: visible };
    if (visible) {
      let propertyTerm = '';
      let propertyEntityRef = '';
      if (property !== null) {
        propertyTerm = { label: property.term.label, value: property.term._id };
        propertyEntityRef = {
          label: property.entityRef.label,
          value: property.entityRef._id,
        };
      }
      update.property = property;
      update.propertyTerm = propertyTerm;
      update.propertyEntityRef = propertyEntityRef;
    } else {
      update.property = null;
      update.propertyTerm = '';
      update.propertyEntityRef = '';
    }
    this.setState(update);
  }

  async loadTaxonomy() {
    const params = {
      systemType: 'relationsTypes',
    };
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}taxonomy`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    this.setState({
      loading: false,
      taxonomyTerms: responseData.taxonomyterms,
    });
  }

  propertiesList(entity) {
    const { taxonomyTerms } = this.state;
    let output = [];
    if (entity !== null) {
      for (let i = 0; i < entity.properties.length; i += 1) {
        const property = entity.properties[i];
        const labelId = property.term.label;
        let taxonomyTerm = taxonomyTerms.find(
          (item) => item.labelId === labelId
        );
        let label = '';
        property.term.direction = 'from';
        if (typeof taxonomyTerm === 'undefined') {
          taxonomyTerm = taxonomyTerms.find(
            (item) => item.inverseLabelId === labelId
          );
          property.term.direction = 'to';
          label = taxonomyTerm.inverseLabel;
        }
        if (typeof taxonomyTerm !== 'undefined') {
          property.term._id = taxonomyTerm._id;
          label = taxonomyTerm.label;
        }
        const item = (
          <li key={property._id}>
            <div
              onClick={() => this.togglePropertyModal(property)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="toggle property modal"
            >
              <span className="property-term">{label}</span>{' '}
              <span className="property-entity">
                {property.entityRef.label}
              </span>
            </div>
          </li>
        );
        output.push(item);
      }
      if (entity.properties.length > 0) {
        output = <ul className="entity-properties">{output}</ul>;
      }
    }
    return output;
  }

  render() {
    const {
      loading,
      detailsOpen,
      propertiesOpen,
      entities,
      entity,
      taxonomyTerms,
      property,
      propertyErrorVisible,
      propertyErrorText,
      propertySaveBtn: statePropertySaveBtn,
      propertyModalVisible,
      propertyTerm,
      propertyEntityRef,
      errorVisible,
      errorText,
      entityParent,
      entityLabel,
      entityDefinition,
      entityExample,
      updateBtn,
    } = this.state;
    const { className } = this.props;
    const heading = 'Entities';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-share', active: true, path: '' },
    ];

    let content = (
      <div>
        <div className="row">
          <div className="col-12">
            <div style={{ padding: '40pt', textAlign: 'center' }}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>
      </div>
    );
    if (!loading) {
      let detailsOpenActive = ' active';
      if (!detailsOpen) {
        detailsOpenActive = '';
      }
      let propertiesOpenActive = ' active';
      if (!propertiesOpen) {
        propertiesOpenActive = '';
      }

      const entitiesHTML = this.list(entities);

      let entityVisible = 'hidden';
      if (entity !== null) {
        entityVisible = '';
      }

      const entitiesList = this.constructor.entitiesList(entities);
      const defaultValue = { value: '', label: '--' };
      const termsList = this.constructor.termsList(taxonomyTerms);
      termsList.unshift(defaultValue);

      const propertiesList = this.propertiesList(entity);

      let propertyModalTitle = 'Edit property';
      if (property === null) {
        propertyModalTitle = 'Add new property';
      }
      let propertyErrorContainerClass = ' hidden';
      if (propertyErrorVisible) {
        propertyErrorContainerClass = '';
      }
      const propertyErrorContainer = (
        <div className={`error-container${propertyErrorContainerClass}`}>
          {propertyErrorText}
        </div>
      );

      let deleteBtn = [];
      if (property !== null) {
        deleteBtn = (
          <Button
            color="danger"
            outline
            onClick={this.deleteProperty}
            className="pull-left"
            size="sm"
          >
            <i className="fa fa-trash-o" /> Delete
          </Button>
        );
      }
      let propertySaveBtn = [];
      if (property === null) {
        propertySaveBtn = (
          <Button
            color="primary"
            outline
            size="sm"
            onClick={this.propertySubmit}
          >
            {statePropertySaveBtn}
          </Button>
        );
      }
      const propertyModal = (
        <Modal
          isOpen={propertyModalVisible}
          toggle={() => this.togglePropertyModal(null)}
          className={className}
        >
          <ModalHeader toggle={() => this.togglePropertyModal(null)}>
            {propertyModalTitle}
          </ModalHeader>
          <ModalBody>
            {propertyErrorContainer}
            <Form onSubmit={this.propertySubmit}>
              <FormGroup>
                <Label>Relation</Label>
                <Select
                  name="term"
                  value={propertyTerm}
                  onChange={(selectedOption) =>
                    this.select2Change(selectedOption, 'propertyTerm')
                  }
                  options={termsList}
                />
              </FormGroup>
              <FormGroup>
                <Label>Referenced Entity</Label>
                <Select
                  name="entityRef"
                  value={propertyEntityRef}
                  onChange={(selectedOption) =>
                    this.select2Change(selectedOption, 'propertyEntityRef')
                  }
                  options={entitiesList}
                />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter className="modal-footer">
            {propertySaveBtn}
            {deleteBtn}
          </ModalFooter>
        </Modal>
      );

      let errorContainerClass = ' hidden';
      if (errorVisible) {
        errorContainerClass = '';
      }
      const errorContainer = (
        <div className={`error-container${errorContainerClass}`}>
          {errorText}
        </div>
      );

      const entityParentValue = entitiesList.find(
        (el) => el.value === entityParent
      );

      content = (
        <div>
          <div className="row">
            <div className="col-12">
              <Card>
                <CardBody>
                  <div className="row">
                    <div className="col-xs-12 col-sm-6">{entitiesHTML}</div>

                    <div className="col-xs-12 col-sm-6">
                      <div className={entityVisible}>
                        <div
                          onClick={() => this.toggleCollapse('detailsOpen')}
                          onKeyDown={() => false}
                          role="button"
                          tabIndex={0}
                          aria-label="toggle details collapse"
                        >
                          <b>Details</b>{' '}
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
                        </div>
                        <Collapse isOpen={detailsOpen}>
                          <div style={{ padding: '10px 0' }}>
                            {errorContainer}
                            <Form onSubmit={this.formSubmit}>
                              <FormGroup>
                                <Label for="labelInput">Label</Label>
                                <Input
                                  type="text"
                                  name="entityLabel"
                                  id="labelInput"
                                  placeholder="Entity label..."
                                  value={entityLabel}
                                  onChange={this.handleChange}
                                />
                              </FormGroup>
                              <FormGroup>
                                <Label for="definitionInput">Definition</Label>
                                <Input
                                  type="textarea"
                                  name="entityDefinition"
                                  id="definitionInput"
                                  placeholder="Entity definition..."
                                  value={entityDefinition}
                                  onChange={this.handleChange}
                                />
                              </FormGroup>
                              <FormGroup>
                                <Label for="exampleInput">Example</Label>
                                <Input
                                  type="textarea"
                                  name="entityExample"
                                  id="exampleInput"
                                  placeholder="Entity example..."
                                  value={entityExample}
                                  onChange={this.handleChange}
                                />
                              </FormGroup>
                              <FormGroup>
                                <Label>Parent Entity</Label>
                                <Select
                                  name="parent"
                                  value={entityParentValue}
                                  onChange={(selectedOption) =>
                                    this.select2Change(
                                      selectedOption,
                                      'entityParent'
                                    )
                                  }
                                  options={entitiesList}
                                />
                              </FormGroup>
                              <div className="text-right">
                                <Button
                                  outline
                                  color="info"
                                  size="sm"
                                  type="submit"
                                >
                                  {updateBtn}
                                </Button>
                              </div>
                            </Form>
                          </div>
                        </Collapse>
                        <hr style={{ margin: '10px 0' }} />
                        <div
                          onClick={() => this.toggleCollapse('propertiesOpen')}
                          onKeyDown={() => false}
                          role="button"
                          tabIndex={0}
                          aria-label="toggle properties collapse"
                        >
                          <b>Properties</b>{' '}
                          <Button
                            type="button"
                            className="pull-right"
                            color="secondary"
                            outline
                            size="xs"
                          >
                            <i
                              className={`collapse-toggle fa fa-angle-left${propertiesOpenActive}`}
                            />
                          </Button>
                        </div>
                        <Collapse isOpen={propertiesOpen}>
                          <div style={{ padding: '10px 0' }}>
                            {propertiesList}
                            <div className="footer-box">
                              <Button
                                outline
                                color="info"
                                size="sm"
                                onClick={() => this.togglePropertyModal(null)}
                              >
                                Add new property <i className="fa fa-plus" />
                              </Button>
                            </div>
                          </div>
                        </Collapse>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
          {propertyModal}
        </div>
      );
    }
    return (
      <div>
        <Suspense fallback={[]}>
          <Breadcrumbs items={breadcrumbsItems} />
        </Suspense>
        <div className="row">
          <div className="col-12">
            <h2>{heading}</h2>
          </div>
        </div>
        {content}
      </div>
    );
  }
}

Entities.defaultProps = {
  className: '',
  loadDefaultEntities: () => {},
};
Entities.propTypes = {
  className: PropTypes.string,
  loadDefaultEntities: PropTypes.func,
};
export default compose(connect(null, mapDispatchToProps))(Entities);
