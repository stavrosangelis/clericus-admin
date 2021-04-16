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
import InputMask from 'react-input-mask';
import PropTypes from 'prop-types';
import RelatedEntitiesBlock from './related-entities-block';

export default class ViewTemporal extends Component {
  static normalizeDate(date = '') {
    if (date === '') {
      return '';
    }
    const dateArr = date.split('-');
    let d = dateArr[0];
    let m = dateArr[1];
    const y = dateArr[2];
    if (Number(d) < 10 && d.length === 1) {
      d = `0${d}`;
    }
    if (Number(m) < 10 && m.length === 1) {
      m = `0${m}`;
    }
    return `${d}-${m}-${y}`;
  }

  constructor(props) {
    super(props);

    const { item } = this.props;
    let label = '';
    let startDate = '';
    let endDate = '';
    let format = '';
    if (item !== null) {
      if (typeof item.label !== 'undefined' && item.label !== null) {
        label = item.label;
      }
      if (typeof item.startDate !== 'undefined' && item.startDate !== null) {
        startDate = item.startDate;
      }
      if (typeof item.endDate !== 'undefined' && item.endDate !== null) {
        endDate = item.endDate;
      }
      if (typeof item.format !== 'undefined' && item.format !== null) {
        format = item.format;
      }
    }
    startDate = this.constructor.normalizeDate(startDate);
    endDate = this.constructor.normalizeDate(endDate);
    this.state = {
      detailsOpen: true,
      form: {
        label,
        startDate,
        endDate,
        format,
      },
    };
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setDate = this.setDate.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { item } = this.props;
    if (prevProps.item !== item) {
      this.setFormValues();
    }
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const { form } = this.state;
    form[name] = value;
    this.setState({
      form,
    });
  }

  setDate(val, name) {
    const { form } = this.state;
    form[name] = val;
    this.setState({
      form,
    });
  }

  setFormValues() {
    const { item } = this.props;
    let label = '';
    let startDate = '';
    let endDate = '';
    let format = '';
    if (item !== null) {
      if (typeof item.label !== 'undefined' && item.label !== null) {
        label = item.label;
      }
      if (typeof item.startDate !== 'undefined' && item.startDate !== null) {
        startDate = item.startDate;
      }
      if (typeof item.endDate !== 'undefined' && item.endDate !== null) {
        endDate = item.endDate;
      }
      if (typeof item.format !== 'undefined' && item.format !== null) {
        format = item.format;
      }
    }
    this.setState({
      form: {
        label,
        startDate,
        endDate,
        format,
      },
    });
  }

  formSubmit(e) {
    e.preventDefault();
    const { update } = this.props;
    const { form } = this.state;
    update(form);
  }

  select2Change(selectedOption, element = null) {
    if (element === null) {
      return false;
    }
    const { form } = this.state;
    form[element] = selectedOption;
    this.setState({
      form,
    });
    return false;
  }

  toggleCollapse(name) {
    const { [name]: value } = this.state;
    this.setState({
      [name]: !value,
    });
  }

  render() {
    const { detailsOpen, form } = this.state;
    const {
      errorVisible,
      errorText,
      updateBtn,
      delete: deleteFn,
      deleteBtn,
      item,
      reload,
    } = this.props;
    const detailsOpenActive = detailsOpen ? ' active' : '';
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
                    <FormGroup>
                      <Label>Label</Label>
                      <Input
                        type="text"
                        name="label"
                        placeholder="Label..."
                        value={form.label}
                        onChange={this.handleChange}
                      />
                    </FormGroup>
                    <div className="row">
                      <div className="col-xs-12 col-sm-6">
                        <FormGroup>
                          <Label>Start date</Label>
                          <InputMask
                            className="input-mask"
                            placeholder="dd-mm-yyyy"
                            mask="99-99-9999"
                            name="startDate"
                            value={form.startDate}
                            onChange={this.handleChange}
                          />
                        </FormGroup>
                      </div>
                      <div className="col-xs-12 col-sm-6">
                        <FormGroup>
                          <Label>End date</Label>
                          <InputMask
                            className="input-mask"
                            placeholder="dd-mm-yyyy"
                            mask="99-99-9999"
                            name="endDate"
                            value={form.endDate}
                            onChange={this.handleChange}
                          />
                        </FormGroup>
                      </div>
                    </div>
                    {/* <FormGroup>
                      <Label>Date format</Label>
                      <Input type="text" name="format" placeholder="Temporal date format..." value={form.format} onChange={this.handleChange}/>
                    </FormGroup> */}

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
                        onClick={() => deleteFn()}
                        className="pull-left"
                      >
                        {deleteBtn}
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
            <RelatedEntitiesBlock
              item={item}
              itemType="Temporal"
              reload={reload}
            />
          </div>
        </div>
      </div>
    );
  }
}

ViewTemporal.defaultProps = {
  item: null,
  update: () => {},
  delete: () => {},
  reload: () => {},
  errorVisible: false,
  errorText: [],
  updateBtn: null,
  deleteBtn: null,
};
ViewTemporal.propTypes = {
  item: PropTypes.object,
  update: PropTypes.func,
  delete: PropTypes.func,
  reload: PropTypes.func,
  errorVisible: PropTypes.bool,
  errorText: PropTypes.array,
  updateBtn: PropTypes.object,
  deleteBtn: PropTypes.object,
};
