import React, { Component, Suspense, lazy } from 'react';
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
import Select from 'react-select';
import PropTypes from 'prop-types';
import { renderLoader } from '../helpers';

const RelatedEntitiesBlock = lazy(() => import('./related-entities-block'));

export default class ViewEvent extends Component {
  constructor(props) {
    super(props);

    const { item } = this.props;
    const status = item?.status || 'private';
    const label = item?.label || '';
    const description = item?.description || '';
    const eventType = item?.eventType || '';

    this.state = {
      detailsOpen: true,
      label,
      description,
      eventType: '',
      initialEventType: eventType,
      status,
    };
    this.eventTypesList = this.eventTypesList.bind(this);
    this.eventTypesListChildren = this.eventTypesListChildren.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.initialSelect2Value = this.initialSelect2Value.bind(this);
  }

  componentDidMount() {
    this.initialSelect2Value();
  }

  componentDidUpdate(prevProps) {
    const { eventTypes } = this.props;
    if (prevProps.eventTypes.length !== eventTypes.length) {
      this.initialSelect2Value();
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

  eventTypesList(eventTypes) {
    const options = [];
    const defaultValue = { value: '', label: '--' };
    options.push(defaultValue);
    for (let i = 0; i < eventTypes.length; i += 1) {
      const eventType = eventTypes[i];
      const option = { value: eventType._id, label: eventType.label };
      options.push(option);
      if (eventType.children.length > 0) {
        const sep = '';
        const childOptions = this.eventTypesListChildren(
          eventType.children,
          sep
        );
        for (let k = 0; k < childOptions.length; k += 1) {
          options.push(childOptions[k]);
        }
      }
    }
    return options;
  }

  eventTypesListChildren(children, sep = '') {
    const options = [];
    const newSep = `${sep}-`;
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      const newLabel = `${sep} ${child.label}`;
      const option = { value: child._id, label: newLabel };
      options.push(option);
      if (child.children.length > 0) {
        const childOptions = this.eventTypesListChildren(
          child.children,
          newSep
        );
        for (let k = 0; k < childOptions.length; k += 1) {
          options.push(childOptions[k]);
        }
      }
    }
    return options;
  }

  formSubmit(e) {
    e.preventDefault();
    const { label, description, eventType, status } = this.state;
    const { update } = this.props;
    const data = {
      label,
      description,
      eventType,
      status,
    };
    update(data);
  }

  initialSelect2Value() {
    const { eventTypes } = this.props;
    const { initialEventType } = this.state;
    const options = this.eventTypesList(eventTypes);
    const initialItem = options.find((o) => o.value === initialEventType) || '';
    this.setState({ eventType: initialItem });
  }

  select2Change(selectedOption, element = null) {
    if (element === null) {
      return false;
    }
    return this.setState({
      [element]: selectedOption,
    });
  }

  toggleCollapse(name) {
    const { [name]: value } = this.state;
    this.setState({
      [name]: !value,
    });
  }

  updateStatus(value) {
    this.setState({ status: value });
  }

  render() {
    const {
      eventTypes: propsEventTypes,
      errorVisible,
      errorText,
      updateBtn,
      delete: propsDelete,
      item,
      reload,
    } = this.props;
    const { detailsOpen, status, label, description, eventType } = this.state;
    const eventTypesList = this.eventTypesList(propsEventTypes);

    const detailsOpenActive = detailsOpen ? ' active' : '';

    let statusPublic = 'secondary';
    const statusPrivate = 'secondary';
    let publicOutline = true;
    let privateOutline = false;
    if (status === 'public') {
      statusPublic = 'success';
      publicOutline = false;
      privateOutline = true;
    }
    const errorContainerClass = errorVisible ? '' : ' hidden';
    const errorContainer = (
      <div className={`error-container${errorContainerClass}`}>{errorText}</div>
    );

    return (
      <div className="row">
        <div className="col-xs-12 col-sm-6">
          <div className="item-details">
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
                        placeholder="Label..."
                        value={label}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="description">Description</Label>
                      <Input
                        type="textarea"
                        name="description"
                        placeholder="Description..."
                        value={description}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Type of Event</Label>
                      <Select
                        value={eventType}
                        onChange={(selectedOption) =>
                          this.select2Change(selectedOption, 'eventType')
                        }
                        options={eventTypesList}
                      />
                    </FormGroup>
                    <div className="text-right" style={{ marginTop: '15px' }}>
                      <Button
                        color="info"
                        outline
                        size="sm"
                        onClick={(e) => this.formSubmit(e)}
                      >
                        {updateBtn}
                      </Button>
                      <Button
                        color="danger"
                        outline
                        size="sm"
                        onClick={() => propsDelete()}
                        className="pull-left"
                      >
                        <span>
                          <i className="fa fa-trash-o" /> Delete
                        </span>
                      </Button>
                    </div>
                  </Form>
                </Collapse>
              </CardBody>
            </Card>
          </div>
        </div>
        <div className="col-xs-12 col-sm-6">
          <div className="item-details">
            <Suspense fallback={renderLoader()}>
              <RelatedEntitiesBlock
                item={item}
                itemType="Event"
                reload={reload}
              />
            </Suspense>
          </div>
        </div>
      </div>
    );
  }
}

ViewEvent.defaultProps = {
  item: null,
  eventTypes: [],
  update: () => {},
  delete: () => {},
  reload: () => {},
  updateBtn: null,
  errorVisible: false,
  errorText: [],
};
ViewEvent.propTypes = {
  item: PropTypes.object,
  eventTypes: PropTypes.array,
  update: PropTypes.func,
  delete: PropTypes.func,
  reload: PropTypes.func,
  updateBtn: PropTypes.object,
  errorVisible: PropTypes.bool,
  errorText: PropTypes.array,
};
