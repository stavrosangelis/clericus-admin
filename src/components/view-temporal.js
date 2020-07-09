import React, { Component } from 'react';
import {
  Card, CardTitle, CardBody,
  Button,
  Form, FormGroup, Label, Input,
  Collapse,
} from 'reactstrap';
import InputMask from 'react-input-mask';
import {
  loadRelatedEvents
} from '../helpers/helpers';
import axios from 'axios';

const APIPath = process.env.REACT_APP_APIPATH;

export default class ViewTemporal extends Component {
  constructor(props) {
    super(props);

    let item = this.props.item;
    let label = '';
    let startDate = '';
    let endDate = '';
    let format = '';
    if (item!==null) {
      if (typeof item.label!=="undefined" && item.label!==null) {
        label = item.label;
      }
      if (typeof item.startDate!=="undefined" && item.startDate!==null) {
        startDate = item.startDate;
      }
      if (typeof item.endDate!=="undefined" && item.endDate!==null) {
        endDate = item.endDate;
      }
      if (typeof item.format!=="undefined" && item.format!==null) {
        format = item.format;
      }
    }
    startDate = this.normalizeDate(startDate);
    endDate = this.normalizeDate(endDate);
    this.state = {
      detailsOpen: true,
      eventsOpen: false,
      form: {
        label: label,
        startDate: startDate,
        endDate: endDate,
        format: format,
      }
    }
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setDate = this.setDate.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.deleteRef = this.deleteRef.bind(this);
  }

  normalizeDate(date="") {
    if(date==="") {
      return "";
    }
    let dateArr = date.split("-");
    let d = dateArr[0];
    let m = dateArr[1];
    let y = dateArr[2];
    if (Number(d)<10 && d.length===1) {
      d = `0${d}`;
    }
    if (Number(m)<10 && m.length===1) {
      m = `0${m}`;
    }
    return `${d}-${m}-${y}`;
  }

  setFormValues() {
    let item = this.props.item;
    let label = '';
    let startDate = '';
    let endDate = '';
    let format = '';
    if (item!==null) {
      if (typeof item.label!=="undefined" && item.label!==null) {
        label = item.label;
      }
      if (typeof item.startDate!=="undefined" && item.startDate!==null) {
        startDate = item.startDate;
      }
      if (typeof item.endDate!=="undefined" && item.endDate!==null) {
        endDate = item.endDate;
      }
      if (typeof item.format!=="undefined" && item.format!==null) {
        format = item.format;
      }
    }
    this.setState({
      form: {
        label: label,
        startDate: startDate,
        endDate: endDate,
        format: format
      }
    })
  }

  formSubmit(e) {
    e.preventDefault();
    this.props.update(this.state.form);
  }

  handleChange(e){
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    let form = this.state.form;
    form[name] = value;
    this.setState({
      form:form
    });
  }

  setDate(val,name) {
    let form = this.state.form;
    form[name] = val;
    this.setState({
      form:form
    });
  }

  select2Change(selectedOption, element=null) {
    if (element===null) {
      return false;
    }
    let form = this.state.form;
    form[element] = selectedOption;
    this.setState({
      form: form
    });
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

  async deleteRef(ref, refTerm, model) {
    let params = {
      items: [
        {_id: this.props.item._id, type: "Temporal"},
        {_id: ref, type: model}
      ],
      taxonomyTermLabel: refTerm,
    }
    await axios({
      method: 'delete',
      url: APIPath+'reference',
      crossDomain: true,
      data: params
    })
	  .then(function(response) {
      return true;
	  })
	  .catch(function (error) {
	  });
    this.props.reload();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.item!==this.props.item) {
      this.setFormValues();
    }
  }

  render() {
    let detailsOpenActive = " active";
    if (!this.state.detailsOpen) {
      detailsOpenActive = "";
    }
    let eventsOpenActive = " active";
    if (!this.state.eventsOpen) {
      eventsOpenActive = "";
    }

    let relatedEvents = loadRelatedEvents(this.props.item, this.deleteRef);

    let relatedEventsCard = " hidden";
    if (relatedEvents.length>0) {
      relatedEventsCard = "";
    }
    let errorContainerClass = " hidden";
    if (this.props.errorVisible) {
      errorContainerClass = "";
    }
    let errorContainer = <div className={"error-container"+errorContainerClass}>{this.props.errorText}</div>
    return (
      <div className="row">
        <div className="col-xs-12 col-sm-6">
          <div className="item-details">
            <Card>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'detailsOpen')}>Details <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+detailsOpenActive} /></Button></CardTitle>
                {errorContainer}
                <Collapse isOpen={this.state.detailsOpen}>
                  <Form onSubmit={this.formSubmit}>
                    <FormGroup>
                      <Label>Label</Label>
                      <Input type="text" name="label" placeholder="Label..." value={this.state.form.label} onChange={this.handleChange}/>
                    </FormGroup>
                    <div className="row">
                      <div className="col-xs-12 col-sm-6">
                        <FormGroup>
                          <Label>Start date</Label>
                          <InputMask className="input-mask" placeholder="dd-mm-yyyy" mask="99-99-9999" name="startDate" value={this.state.form.startDate} onChange={this.handleChange}/>
                        </FormGroup>
                      </div>
                      <div className="col-xs-12 col-sm-6">
                        <FormGroup>
                          <Label>End date</Label>
                          <InputMask className="input-mask" placeholder="dd-mm-yyyy" mask="99-99-9999" name="endDate" value={this.state.form.endDate} onChange={this.handleChange}/>
                        </FormGroup>
                      </div>
                    </div>
                    {/*<FormGroup>
                      <Label>Date format</Label>
                      <Input type="text" name="format" placeholder="Temporal date format..." value={this.state.form.format} onChange={this.handleChange}/>
                    </FormGroup>*/}

                    <div className="text-right" style={{marginTop: "15px"}}>
                      <Button color="info" outline size="sm" onClick={(e)=>this.formSubmit(e)}>{this.props.updateBtn}</Button>
                      <Button color="danger" outline  size="sm" onClick={()=>this.props.delete()} className="pull-left">{this.props.deleteBtn}</Button>
                    </div>
                  </Form>
                </Collapse>
              </CardBody>
            </Card>
          </div>
        </div>
        <div className="col-xs-12 col-sm-6">
          <div className="item-details">

            <Card className={relatedEventsCard}>
              <CardBody>
                <CardTitle onClick={this.toggleCollapse.bind(this, 'eventsOpen')}>Related events (<span className="related-num">{relatedEvents.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+eventsOpenActive} /></Button></CardTitle>
                <Collapse isOpen={this.state.eventsOpen}>
                  {relatedEvents}
                </Collapse>
              </CardBody>
            </Card>

          </div>
        </div>
      </div>
    )
  }
}
