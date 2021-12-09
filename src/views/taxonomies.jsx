import React, { Component, Suspense, lazy } from 'react';
import axios from 'axios';
import {
  Card,
  CardBody,
  Button,
  Badge,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Collapse,
  Spinner,
} from 'reactstrap';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { addGenericReference } from '../helpers';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));
const APIPath = process.env.REACT_APP_APIPATH;

export default class Taxonomies extends Component {
  static termsList(terms, termId = null) {
    const options = [];
    for (let i = 0; i < terms.length; i += 1) {
      const term = terms[i];
      const seps = [];
      if (typeof term.parentIds !== 'undefined') {
        for (let j = 0; j < term.parentIds.length; j += 1) {
          seps.push('-');
        }
      }
      if (termId !== term._id) {
        const option = {
          value: term._id,
          label: `${seps.join('')} ${term.label}`,
        };
        options.push(option);
      }
    }

    return options;
  }

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      taxonomies: [],
      taxonomy: null,
      taxonomyTerms: [],
      taxonomyLabel: '',
      taxonomyDescription: '',
      termModalVisible: false,
      termRelations: [],
      termRelationsCollapse: false,
      termId: '',
      termLabel: '',
      termLabelId: '',
      termInverseLabel: '',
      termInverseLabelId: '',
      termScopeNote: '',
      termParentRef: '',
      termCount: 0,
      termSaving: false,
      errorVisible: false,
      errorText: [],
      updateTermBtn: (
        <span>
          <i className="fa fa-save" /> Save
        </span>
      ),
      taxonomySaving: false,
      taxonomyErrorVisible: false,
      taxonomyErrorText: [],
      taxonomySaveBtn: (
        <span>
          <i className="fa fa-save" /> Save
        </span>
      ),

      deleteModalVisible: false,
      termsListOptions: [],
    };

    this.load = this.load.bind(this);
    this.loadItem = this.loadItem.bind(this);
    this.flattenItems = this.flattenItems.bind(this);
    this.processTerms = this.processTerms.bind(this);
    this.list = this.list.bind(this);
    this.showItem = this.showItem.bind(this);
    this.showTerms = this.showTerms.bind(this);
    this.renderTerm = this.renderTerm.bind(this);
    this.toggleTermChildren = this.toggleTermChildren.bind(this);
    this.filterItemChildren = this.filterItemChildren.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.editTermSubmit = this.editTermSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.termModalToggle = this.termModalToggle.bind(this);
    this.deleteTerm = this.deleteTerm.bind(this);
    this.toggleTermCollapse = this.toggleTermCollapse.bind(this);
    this.linkNewTermToTaxonomy = this.linkNewTermToTaxonomy.bind(this);
    this.deleteTaxonomy = this.deleteTaxonomy.bind(this);
    this.deleteModalToggle = this.deleteModalToggle.bind(this);
  }

  componentDidMount() {
    this.load();
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
      url: `${APIPath}taxonomies`,
      crossDomain: true,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    this.setState({
      loading: false,
      taxonomies: responseData.data,
    });
  }

  flattenItems(items, parentIds = null, parentId = null) {
    let newItems = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (parentIds !== null) {
        item.parentIds = parentIds;
      }
      if (parentId !== null) {
        item.parentId = parentId;
      }
      const itemCopy = { ...item };
      itemCopy.hasChildren = false;
      itemCopy.visible = true;
      if (typeof item.children !== 'undefined' && item.children.length > 0) {
        delete itemCopy.children;
        itemCopy.hasChildren = true;
      }
      newItems.push(itemCopy);
      let newParentIds = [];
      if (parentIds === null) {
        newParentIds.push(item._id);
      } else {
        newParentIds = [...parentIds, item._id];
        itemCopy.visible = false;
      }
      if (item.children?.length > 0) {
        newItems = [
          ...newItems,
          ...this.flattenItems(item.children, newParentIds, item._id),
        ];
      }
    }
    return newItems;
  }

  async loadItem(_id = null) {
    if (_id === null) {
      this.setState({
        taxonomy: [],
        taxonomyLabel: '',
        taxonomyDescription: '',
        taxonomyErrorVisible: false,
        taxonomyErrorText: [],
      });
      return false;
    }
    const params = {
      _id,
    };
    const taxonomy = await axios({
      method: 'get',
      url: `${APIPath}taxonomy`,
      crossDomain: true,
      params,
    })
      .then((response) => {
        const responseData = response.data.data;
        return responseData;
      })
      .catch((error) => {
        console.log(error);
      });

    let newLabel = '';
    let newDescription = '';
    if (taxonomy.label !== null) {
      newLabel = taxonomy.label;
    }
    if (taxonomy.description !== null) {
      newDescription = taxonomy.description;
    }
    const taxonomyTerms = this.flattenItems(taxonomy.taxonomyterms);
    this.setState({
      taxonomy,
      taxonomyLabel: newLabel,
      taxonomyDescription: newDescription,
      taxonomyTerms,
    });
    return false;
  }

  processTerms(terms) {
    const output = [];
    for (let i = 0; i < terms.length; i += 1) {
      const term = terms[i];
      term.childrenVisible = false;
      if (typeof term.children !== 'undefined' && term.children.length > 0) {
        term.children = this.processTerms(term.children);
      }
      output.push(term);
    }
    return output;
  }

  list(taxonomies) {
    const output = [];
    const { taxonomy: stateTaxonomy } = this.state;
    for (let i = 0; i < taxonomies.length; i += 1) {
      const taxonomy = taxonomies[i];
      const active =
        stateTaxonomy !== null && stateTaxonomy._id === taxonomy._id
          ? ' active'
          : '';
      const item = (
        <Button
          color="secondary"
          outline
          key={i}
          onClick={() => {
            this.loadItem(taxonomy._id);
          }}
          className={`taxonomy-btn${active}`}
        >
          {taxonomy.label} <Badge color="secondary">{taxonomy.terms}</Badge>
        </Button>
      );
      output.push(item);
    }
    return output;
  }

  showItem(taxonomy, terms) {
    const {
      taxonomyDescription: stateTaxonomyDescription,
      taxonomyErrorVisible,
      taxonomyErrorText,
      taxonomy: stateTaxonomy,
      taxonomyLabel,
      taxonomySaveBtn,
    } = this.state;
    let output = [];
    if (taxonomy !== null) {
      const taxonomyDescription =
        stateTaxonomyDescription !== '' ? stateTaxonomyDescription : '';
      const termsOutput = this.showTerms(terms);
      let errorContainerClass = ' hidden';
      if (taxonomyErrorVisible) {
        errorContainerClass = '';
      }
      const errorContainer = (
        <div className={`error-container${errorContainerClass}`}>
          {taxonomyErrorText}
        </div>
      );
      let termsVisible = 'hidden';
      if (stateTaxonomy !== null && Object.keys(stateTaxonomy).length > 0) {
        termsVisible = '';
      }
      output = (
        <Card>
          <CardBody>
            <div className="row">
              <div className="col-xs-12 col-sm-6 col-md-8">
                <FormGroup className={termsVisible}>
                  <Label>Terms</Label>
                  {termsOutput}
                  <div className="footer-box">
                    <Button
                      size="sm"
                      color="info"
                      onClick={() => this.termModalToggle()}
                    >
                      Add term <i className="fa fa-plus" />
                    </Button>
                  </div>
                </FormGroup>
              </div>
              <div className="col-xs-12 col-sm-6 col-md-4">
                {errorContainer}
                <Form onSubmit={this.formSubmit}>
                  <FormGroup>
                    <Label for="labelInput">Label</Label>
                    <Input
                      type="text"
                      name="taxonomyLabel"
                      id="labelInput"
                      placeholder="Taxonomy label..."
                      value={taxonomyLabel}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="descriptionInput">Description</Label>
                    <Input
                      type="textarea"
                      name="taxonomyDescription"
                      id="descriptionInput"
                      placeholder="Taxonomy description..."
                      value={taxonomyDescription}
                      onChange={this.handleChange}
                    />
                  </FormGroup>
                </Form>
                <div className="footer-box">
                  <Button
                    size="sm"
                    type="button"
                    onClick={this.formSubmit}
                    color="info"
                    outline
                  >
                    {taxonomySaveBtn}
                  </Button>
                  <Button
                    size="sm"
                    className="pull-left"
                    color="danger"
                    outline
                    onClick={() => this.deleteModalToggle()}
                  >
                    <i className="fa fa-trash-o" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      );
    }
    return output;
  }

  showTerms(terms = null) {
    let termsOutput = [];
    if (terms !== null) {
      for (let i = 0; i < terms.length; i += 1) {
        const term = terms[i];
        const termItem = this.renderTerm(term);
        termsOutput.push(termItem);
      }
      if (terms.length > 0) {
        termsOutput = <ul className="taxonomy-terms">{termsOutput}</ul>;
      }
    }
    return termsOutput;
  }

  toggleTermCollapse() {
    const { termRelationsCollapse } = this.state;
    this.setState({
      termRelationsCollapse: !termRelationsCollapse,
    });
  }

  deleteModalToggle() {
    const { deleteModalVisible } = this.state;
    this.setState({
      deleteModalVisible: !deleteModalVisible,
    });
  }

  async deleteTaxonomy() {
    const { taxonomy } = this.state;
    if (typeof taxonomy._id === 'undefined' || taxonomy._id === '') {
      return false;
    }
    const params = { _id: taxonomy._id };
    const deleteTax = await axios({
      method: 'delete',
      url: `${APIPath}taxonomy`,
      crossDomain: true,
      data: params,
    })
      .then((response) => {
        const responseData = response.data;
        return responseData;
      })
      .catch((error) => {
        console.log(error);
      });
    if (deleteTax.status) {
      this.setState({
        deleteModalVisible: false,
        taxonomy: null,
      });
      this.load();
    } else {
      const errorMsg = deleteTax.msg;
      const errorText = [];
      for (let i = 0; i < errorMsg.length; i += 1) {
        errorText.push(<div key={i}>{errorMsg[i]}</div>);
      }
      this.setState({
        taxonomyErrorVisible: true,
        taxonomyErrorText: errorText,
      });
    }
    return false;
  }

  async deleteTerm(_id) {
    const { taxonomy } = this.state;
    const params = { _id };
    const responseData = await axios({
      method: 'delete',
      url: `${APIPath}taxonomy-term`,
      crossDomain: true,
      data: params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });

    if (responseData.status) {
      this.setState({
        termModalVisible: false,
      });
      await this.load();
      await this.loadItem(taxonomy._id);
    } else {
      const error = responseData.msg;
      const errorText = [];
      for (let i = 0; i < error.length; i += 1) {
        errorText.push(<div key={i}>{error[i]}</div>);
      }
      this.setState({
        errorVisible: true,
        errorText,
      });
    }
  }

  async loadTerm(term) {
    const {
      taxonomyTerms,
      termsListOptions: stateTermsListOptions,
    } = this.state;
    const params = {
      _id: term._id,
    };
    const responseTerm = await axios({
      method: 'get',
      url: `${APIPath}taxonomy-term`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    let termId = '';
    if (typeof responseTerm._id !== 'undefined' && responseTerm._id !== null) {
      termId = responseTerm._id;
    }
    const termLabel = responseTerm?.label || '';
    const termLabelId = responseTerm?.labelId || '';
    const termInverseLabel = responseTerm?.inverseLabel || '';
    const termInverseLabelId = responseTerm?.inverseLabelId || '';
    const scopeNote = responseTerm?.scopeNote || '';
    let count = '';
    if (
      typeof responseTerm.count !== 'undefined' &&
      responseTerm.count !== null
    ) {
      count = parseInt(responseTerm.count, 10);
    }
    const parentRef = responseTerm?.parentRef || '';
    const termsListOptions = this.constructor.termsList(
      taxonomyTerms,
      termId,
      ''
    );
    termsListOptions.unshift({ value: '', label: '--' });
    this.setState(
      {
        termId,
        termLabel,
        termLabelId,
        termInverseLabel,
        termInverseLabelId,
        termScopeNote: scopeNote,
        termParentRef: parentRef,
        termCount: count,
        termRelations: responseTerm.relations,
        termsListOptions,
      },
      () => {
        if (
          typeof parentRef !== 'undefined' &&
          parentRef !== null &&
          parentRef !== ''
        ) {
          const parentRefOption = stateTermsListOptions.find(
            (t) => t.value === parentRef
          );
          if (typeof parentRefOption !== 'undefined') {
            this.setState({
              parentRef: parentRefOption,
            });
          }
        }
      }
    );
  }

  termModalToggle(term = null) {
    const { termModalVisible, taxonomyTerms } = this.state;
    const visible = !termModalVisible;
    const updateState = { termModalVisible: visible };
    if (visible) {
      if (term !== null) {
        this.loadTerm(term);
      } else {
        const termsListOptions = this.constructor.termsList(
          taxonomyTerms,
          null,
          ''
        );
        termsListOptions.unshift({ value: '', label: '--' });
        updateState.termsListOptions = termsListOptions;
      }
    } else {
      updateState.termId = '';
      updateState.termLabel = '';
      updateState.termLabelId = '';
      updateState.termInverseLabel = '';
      updateState.termInverseLabelId = '';
      updateState.termScopeNote = '';
      updateState.termParentRef = '';
      updateState.parentRef = '';
      updateState.termCount = 0;
      updateState.termRelations = [];
    }
    updateState.taxonomyErrorVisible = false;
    updateState.taxonomyErrorText = [];
    updateState.errorVisible = false;
    updateState.errorText = '';
    this.setState(updateState);
  }

  select2Change(selectedOption) {
    this.setState({
      termParentRef: selectedOption.value,
    });
  }

  async linkNewTermToTaxonomy(newTermId) {
    const { taxonomy } = this.state;
    const newReference = {
      items: [
        { _id: taxonomy._id, type: 'Taxonomy' },
        { _id: newTermId, type: 'TaxonomyTerm' },
      ],
      taxonomyTermLabel: 'hasChild',
    };
    const addReference = await addGenericReference(newReference);
    return addReference;
  }

  async editTermSubmit(e) {
    e.preventDefault();
    const {
      termSaving,
      termLabel,
      termInverseLabel,
      taxonomy,
      termId,
      termScopeNote,
      termParentRef,
    } = this.state;
    const context = this;
    if (termSaving) {
      return false;
    }
    this.setState({
      termSaving: true,
      updateTermBtn: (
        <span>
          <i className="fa fa-save" /> <i>Saving...</i>{' '}
          <Spinner size="sm" color="info" />
        </span>
      ),
    });
    if (termLabel === '') {
      this.setState({
        termSaving: false,
        updateTermBtn: (
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        ),
        errorVisible: true,
        errorText: <div>Please enter a Label to continue</div>,
      });
      setTimeout(() => {
        context.setState({
          updateTermBtn: (
            <span>
              <i className="fa fa-save" /> Save
            </span>
          ),
        });
      }, 2000);
      return false;
    }
    if (termInverseLabel === '') {
      this.setState({
        termSaving: false,
        updateTermBtn: (
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        ),
        errorVisible: true,
        errorText: <div>Please enter an Inverse Label to continue</div>,
      });
      setTimeout(() => {
        context.setState({
          updateTermBtn: (
            <span>
              <i className="fa fa-save" /> Save
            </span>
          ),
        });
      }, 2000);
      return false;
    }
    const postData = {
      taxonomyRef: taxonomy._id,
      label: termLabel,
      inverseLabel: termInverseLabel,
    };
    if (termId !== '') {
      postData._id = termId;
    }
    if (termScopeNote !== '') {
      postData.scopeNote = termScopeNote;
    }
    if (termParentRef !== '') {
      postData.parentRef = termParentRef;
    }
    const putData = await axios({
      method: 'put',
      url: `${APIPath}taxonomy-term`,
      crossDomain: true,
      data: postData,
    })
      .then((response) => {
        const responseData = response.data.data;
        return responseData;
      })
      .catch((error) => {
        console.log(error);
      });
    if (putData.status) {
      if (termId === '') {
        await this.linkNewTermToTaxonomy(putData.data._id);
        postData._id = putData.data._id;
      }
      if (typeof postData.parentRef !== 'undefined') {
        const newReference = {
          items: [
            { _id: postData.parentRef, type: 'TaxonomyTerm' },
            { _id: postData._id, type: 'TaxonomyTerm' },
          ],
          taxonomyTermLabel: 'hasChild',
        };
        await addGenericReference(newReference);
      }
      this.setState({
        termSaving: false,
        termModalVisible: false,
        termId: '',
        termLabel: '',
        termLabelId: '',
        termInverseLabel: '',
        termInverseLabelId: '',
        termScopeNote: '',
        termParentRef: '',
        updateTermBtn: (
          <span>
            <i className="fa fa-save" /> Save success{' '}
            <i className="fa fa-check" />{' '}
          </span>
        ),
      });
      await this.load();
      await this.loadItem(taxonomy._id);
      setTimeout(() => {
        context.setState({
          updateTermBtn: (
            <span>
              <i className="fa fa-save" /> Save
            </span>
          ),
        });
      }, 1000);
    } else {
      const { error } = putData;
      const errorText = [];
      for (let i = 0; i < error.length; i += 1) {
        errorText.push(<div key={i}>{error[i]}</div>);
      }
      this.setState({
        termSaving: false,
        updateTermBtn: (
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        ),
        errorVisible: true,
        errorText,
      });
      setTimeout(() => {
        context.setState({
          updateTermBtn: (
            <span>
              <i className="fa fa-save" /> Save
            </span>
          ),
        });
      }, 2000);
    }
    return false;
  }

  async formSubmit(e) {
    e.preventDefault();
    const context = this;
    const {
      taxonomySaving,
      taxonomyLabel,
      taxonomyDescription,
      taxonomy,
    } = this.state;
    if (taxonomySaving) {
      return false;
    }
    this.setState({
      taxonomySaving: true,
      taxonomySaveBtn: (
        <span>
          <i className="fa fa-save" /> <i>Saving...</i>{' '}
          <Spinner size="sm" color="info" />
        </span>
      ),
    });
    if (taxonomyLabel === '') {
      this.setState({
        taxonomySaving: false,
        taxonomySaveBtn: (
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        ),
        taxonomyErrorVisible: true,
        taxonomyErrorText: <div>Please enter a Label to continue</div>,
      });
      setTimeout(() => {
        context.setState({
          taxonomySaveBtn: (
            <span>
              <i className="fa fa-save" /> Save
            </span>
          ),
        });
      }, 2000);
      return false;
    }
    const postData = {
      label: taxonomyLabel,
      description: taxonomyDescription,
    };
    if (typeof taxonomy._id !== 'undefined' && taxonomy._id !== '') {
      postData._id = taxonomy._id;
    }
    const responseData = await axios({
      method: 'put',
      url: `${APIPath}taxonomy`,
      crossDomain: true,
      data: postData,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      context.setState({
        taxonomySaving: false,
        taxonomySaveBtn: (
          <span>
            <i className="fa fa-save" /> Save success{' '}
            <i className="fa fa-check" />{' '}
          </span>
        ),
      });
      context.load();
      context.loadItem(responseData.data._id);
      setTimeout(() => {
        context.setState({
          taxonomySaveBtn: (
            <span>
              <i className="fa fa-save" /> Save
            </span>
          ),
        });
      }, 1000);
    } else {
      const errorMsg = responseData.msg;
      const errorText = [];
      for (let i = 0; i < errorMsg.length; i += 1) {
        errorText.push(<div key={i}>{errorMsg[i]}</div>);
      }
      context.setState({
        taxonomySaving: false,
        taxonomySaveBtn: (
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        ),
        taxonomyErrorVisible: true,
        taxonomyErrorText: errorText,
      });
      setTimeout(() => {
        context.setState({
          taxonomySaveBtn: (
            <span>
              <i className="fa fa-save" /> Save
            </span>
          ),
        });
      }, 2000);
    }
    return false;
  }

  filterItemChildren(item) {
    const { taxonomyTerms } = this.state;
    const newItems = taxonomyTerms.filter(
      (i) => typeof i.parentId !== 'undefined' && i.parentId !== null
    );
    const childrenIds = [];
    if (typeof newItems !== 'undefined') {
      const children = newItems.filter(
        (i) => i.parentId.indexOf(item._id) > -1
      );
      if (typeof children !== 'undefined') {
        for (let k = 0; k < children.length; k += 1) {
          const c = children[k];
          childrenIds.push(c._id);
        }
      }
    }
    return childrenIds;
  }

  toggleTermChildren(item) {
    const { taxonomyTerms: stateTaxonomyTerms } = this.state;
    const taxonomyTerms = [...stateTaxonomyTerms];
    const itemCopy = item;
    const itemIndex = taxonomyTerms.indexOf(itemCopy);
    if (typeof itemCopy.collapsed === 'undefined') {
      itemCopy.collapsed = true;
    } else {
      itemCopy.collapsed = !itemCopy.collapsed;
    }
    taxonomyTerms[itemIndex] = itemCopy;
    const children = this.filterItemChildren(itemCopy);
    const childrenTerms = taxonomyTerms.filter(
      (i) => children.indexOf(i._id) > -1
    );
    for (let k = 0; k < childrenTerms.length; k += 1) {
      const c = childrenTerms[k];
      const index = taxonomyTerms.indexOf(c);
      c.visible = !c.visible;
      taxonomyTerms[index] = c;
    }
    this.setState({
      taxonomyTerms,
    });
  }

  renderTerm(item) {
    let collapseIcon = [];
    let collapseIconClass = ' fa-plus';
    if (typeof item.collapsed !== 'undefined' && item.collapsed) {
      collapseIconClass = ' fa-minus';
    }
    if (item.hasChildren) {
      collapseIcon = (
        <i
          className={`fa${collapseIconClass}`}
          onClick={() => this.toggleTermChildren(item)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle term children"
        />
      );
    }
    let visibleClass = 'hidden';
    if (item.visible) {
      visibleClass = '';
    }
    let left = 0;
    const parentIds = item.parentIds || null;
    if (parentIds !== null) {
      left = 15 * parentIds.length;
    }
    const style = { marginLeft: left };
    const output = (
      <li className={`${visibleClass}`} style={style} key={item._id}>
        {collapseIcon}{' '}
        <span
          className="term-item"
          onClick={() => this.termModalToggle(item)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle modal"
        >
          {item.label}
        </span>
      </li>
    );
    return output;
  }

  render() {
    const {
      loading,
      taxonomies,
      taxonomy,
      taxonomyTerms,
      termId,
      errorVisible,
      errorText,
      termsListOptions,
      termScopeNote,
      termCount: stateTermCount,
      termRelationsCollapse,
      termRelations,
      termLabel,
      termModalVisible,
      termLabelId,
      termInverseLabel,
      termInverseLabelId,
      parentRef,
      updateTermBtn,
      deleteModalVisible,
    } = this.state;
    const heading = 'Taxonomies';
    const breadcrumbsItems = [
      { label: 'Model', icon: 'pe-7s-share', active: false, path: '' },
      { label: heading, icon: '', active: true, path: '' },
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
    let deleteModal = [];
    if (!loading) {
      const taxonomiesHTML = this.list(taxonomies);

      const taxonomyHTML = this.showItem(taxonomy, taxonomyTerms);

      let modalTitle = 'Add new term';
      let btnDelete = [];
      if (termId !== '') {
        modalTitle = 'Edit term';
        btnDelete = (
          <Button
            color="danger"
            size="sm"
            outline
            onClick={() => this.deleteTerm(termId)}
            className="pull-left"
          >
            <i className="fa fa-trash-o" /> Delete
          </Button>
        );
      }

      let errorContainerClass = ' hidden';
      if (errorVisible) {
        errorContainerClass = '';
      }
      const errorContainer = (
        <div className={`error-container${errorContainerClass}`}>
          {errorText}
        </div>
      );

      const termsList = termsListOptions;

      const scopeNoteValue = termScopeNote !== '' ? termScopeNote : '';

      let termCount = [];
      if (stateTermCount > 0) {
        const term = taxonomyTerms.find((t) => t._id === termId);
        let termRelationsCollapseActive = ' active';
        if (!termRelationsCollapse) {
          termRelationsCollapseActive = '';
        }

        const termRelationsOutput = termRelations.map((t, i) => {
          const { source } = t;
          const { target } = t;
          let sourceLabel = source.nodeType.toLowerCase();
          let targetLabel = target.nodeType.toLowerCase();
          let sourceLink = `/${sourceLabel}/${source._id}`;
          let targetLink = `/${targetLabel}/${target._id}`;
          if (sourceLabel === 'entity') {
            sourceLabel = 'entities';
            sourceLink = `/${sourceLabel}`;
          }
          if (targetLabel === 'entity') {
            targetLabel = 'entities';
            targetLink = `/${targetLabel}`;
          }

          const item = (
            <li key={source._id}>
              <Link href={sourceLink} to={sourceLink} target="_blank">
                {source.label}
              </Link>{' '}
              <i>{termLabel}</i>{' '}
              <Link href={targetLink} to={targetLink} target="_blank">
                {target.label}
              </Link>
            </li>
          );
          return item;
        });
        termCount = [
          <div
            className="text-right"
            onClick={() => this.toggleTermCollapse()}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle term collapse"
            key={0}
          >
            <b>Relations count</b>: {stateTermCount} &nbsp;&nbsp;{' '}
            <Button
              type="button"
              className="pull-right"
              color="secondary"
              outline
              size="xs"
            >
              <i
                className={`collapse-toggle fa fa-angle-left${termRelationsCollapseActive}`}
              />
            </Button>
          </div>,
          <Collapse
            isOpen={termRelationsCollapse}
            key={1}
            className="term-relations-collapse-container"
          >
            <div
              className="text-right refresh-btn"
              onClick={() => this.loadTerm(term)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="load term"
            >
              Refresh <i className="fa fa-refresh" />
            </div>
            <ol>{termRelationsOutput}</ol>
          </Collapse>,
        ];
      }
      const addTermModal = (
        <Modal isOpen={termModalVisible} toggle={this.termModalToggle}>
          <ModalHeader toggle={this.termModalToggle}>{modalTitle}</ModalHeader>
          <ModalBody>
            {errorContainer}
            {termCount}
            <Form onSubmit={this.editTermSubmit}>
              <FormGroup>
                <Label for="termLabelInput">Label</Label>
                <Input
                  type="text"
                  name="termLabel"
                  id="termLabelInput"
                  placeholder="Term label..."
                  value={termLabel}
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label>
                  LabelId
                  <span>
                    : <i>{termLabelId}</i>
                  </span>
                </Label>
              </FormGroup>
              <FormGroup>
                <Label for="termInverseLabelInput">Inverse Label</Label>
                <Input
                  type="text"
                  name="termInverseLabel"
                  id="termInverseLabelInput"
                  placeholder="Term inverse label..."
                  value={termInverseLabel}
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label>
                  Inverse LabelId
                  <span>
                    : <i>{termInverseLabelId}</i>{' '}
                  </span>
                </Label>
              </FormGroup>
              <FormGroup>
                <Label for="termScopeNoteInput">Scope Note</Label>
                <Input
                  type="textarea"
                  name="termScopeNote"
                  id="termScopeNoteInput"
                  placeholder="Term scope note..."
                  value={scopeNoteValue}
                  onChange={this.handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label>Parent Term</Label>
                <Select
                  name="parentRef"
                  value={parentRef}
                  onChange={this.select2Change}
                  options={termsList}
                />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            {btnDelete}
            <Button
              size="sm"
              color="info"
              outline
              onClick={this.editTermSubmit}
            >
              {updateTermBtn}
            </Button>
          </ModalFooter>
        </Modal>
      );

      let deleteLabel = '';
      if (taxonomy !== null && typeof taxonomy.label !== 'undefined') {
        deleteLabel = taxonomy.label;
      }
      deleteModal = (
        <Modal isOpen={deleteModalVisible} toggle={this.deleteModalToggle}>
          <ModalHeader toggle={this.deleteModalToggle}>
            Delete &quot;{deleteLabel}&quot;
          </ModalHeader>
          <ModalBody>
            <div className="form-group">
              <p>
                The taxonomy &quot;{deleteLabel}&quot; will be deleted.
                Continue?
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              size="sm"
              onClick={() => this.deleteTaxonomy()}
            >
              <i className="fa fa-trash-o" /> Delete
            </Button>
            <Button
              color="secondary"
              className="pull-left"
              size="sm"
              onClick={this.deleteModalToggle}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      );

      content = (
        <div>
          <div className="row">
            <div className="col-12">
              <Card>
                <CardBody>
                  {taxonomiesHTML}
                  <Button
                    type="button"
                    size="sm"
                    color="info"
                    className="pull-right"
                    outline
                    onClick={() => {
                      this.loadItem(null);
                    }}
                  >
                    Add new <i className=" fa fa-plus" />
                  </Button>
                </CardBody>
              </Card>
              {taxonomyHTML}
              {addTermModal}
              {deleteModal}
            </div>
          </div>
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
