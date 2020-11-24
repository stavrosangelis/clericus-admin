import React, { Component } from 'react';
import {
  Card, CardTitle, CardBody,
  Button, ButtonGroup,
  Form, FormGroup, Label, Input,
  Collapse,
} from 'reactstrap';
import Select from 'react-select';
import RelatedEntitiesBlock from './related-entities-block';

export default class ViewEvent extends Component {
  constructor(props) {
    super(props);

    let item = this.props.item;
    let status = item?.status || 'private';
    let label = item?.label || '';
    let description = item?.description || '';
    let eventType = item?.eventType || '';

    this.state = {
      detailsOpen: true,
      label: label,
      description: description,
      eventType: "",
      initialEventType: eventType,
      status: status,
    }
    this.eventTypesList = this.eventTypesList.bind(this);
    this.eventTypesListChildren = this.eventTypesListChildren.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.initialSelect2Value = this.initialSelect2Value.bind(this);
  }

  eventTypesList(eventTypes) {
    let options = [];
    let defaultValue = {value: '', label: '--'};
    options.push(defaultValue);
    for (let i=0; i<eventTypes.length; i++) {
      let eventType = eventTypes[i];
      let option = {value: eventType._id, label: eventType.label};
      options.push(option);
      if (eventType.children.length>0) {
        let sep = "";
        let childOptions = this.eventTypesListChildren(eventType.children,sep);
        for (let k in childOptions) {
          options.push(childOptions[k]);
        }
      }
    }
    return options;
  }

  eventTypesListChildren(children, sep="") {
    let options = [];
    sep += "-";
    for (let i=0;i<children.length; i++) {
      let child = children[i];
      let newLabel = `${sep} ${child.label}`;
      let option = {value: child._id, label: newLabel};
      options.push(option);
      if (child.children.length>0) {
        let childOptions = this.eventTypesListChildren(child.children,sep);
        for (let k in childOptions) {
          options.push(childOptions[k]);
        }
      }
    }
    return options;
  }

  formSubmit(e) {
    e.preventDefault();
    let data = {
      label: this.state.label,
      description: this.state.description,
      eventType: this.state.eventType,
      status: this.state.status,
    }
    this.props.update(data);
  }

  handleChange(e){
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;

    this.setState({
      [name]: value
    });
  }

  initialSelect2Value(){
    let options = this.eventTypesList(this.props.eventTypes);
    let initialItem = options.find(o=>o.value===this.state.initialEventType) || "";
    this.setState({eventType:initialItem});
  }

  select2Change(selectedOption, element=null) {
    if (element===null) {
      return false;
    }
    this.setState({
      [element]: selectedOption
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

  updateStatus(value) {
    this.setState({status:value});
  }

  componentDidMount() {
    this.initialSelect2Value();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.eventTypes.length!==this.props.eventTypes.length) {
      this.initialSelect2Value();
    }
  }

  render() {
    let eventTypesList = this.eventTypesList(this.props.eventTypes);

    let detailsOpenActive = " active";
    if (!this.state.detailsOpen) {
      detailsOpenActive = "";
    }

    let statusPublic = "secondary";
    let statusPrivate = "secondary";
    let publicOutline = true;
    let privateOutline = false;
    if (this.state.status==="public") {
      statusPublic = "success";
      publicOutline = false;
      privateOutline = true;
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
                    <div className="text-right">
                      <ButtonGroup>
                        <Button size="sm" outline={publicOutline} color={statusPublic} onClick={()=>this.updateStatus("public")}>Public</Button>
                        <Button size="sm" outline={privateOutline} color={statusPrivate} onClick={()=>this.updateStatus("private")}>Private</Button>
                      </ButtonGroup>
                    </div>
                    <FormGroup>
                      <Label>Label</Label>
                      <Input type="text" name="label" placeholder="Label..." value={this.state.label} onChange={this.handleChange}/>
                    </FormGroup>
                    <FormGroup>
                      <Label for="description">Description</Label>
                      <Input type="textarea" name="description" placeholder="Description..." value={this.state.description} onChange={this.handleChange}/>
                    </FormGroup>
                    <FormGroup>
                      <Label>Type of Event</Label>
                      <Select
                        value={this.state.eventType}
                        onChange={(selectedOption)=>this.select2Change(selectedOption, "eventType")}
                        options={eventTypesList}
                      />
                    </FormGroup>
                    <div className="text-right" style={{marginTop: "15px"}}>
                      <Button color="info" outline size="sm" onClick={(e)=>this.formSubmit(e)}>{this.props.updateBtn}</Button>
                      <Button color="danger" outline  size="sm" onClick={()=>this.props.delete()} className="pull-left"><span><i className="fa fa-trash-o" /> Delete</span></Button>
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
              item={this.props.item}
              itemType="Event"
              reload={this.props.reload}
              />
          </div>
        </div>
      </div>
    )
  }
}
