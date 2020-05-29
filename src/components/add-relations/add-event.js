import React, { Component } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
  FormGroup, Label, Input,
  Alert,
  Spinner
} from 'reactstrap';
import axios from 'axios';
import Select from 'react-select';
import {addGenericReference,refTypesList} from '../../helpers/helpers';
import InputMask from 'react-input-mask';
const APIPath = process.env.REACT_APP_APIPATH;

export default class AddEvent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      refType: null,
      listVisible: true,
      addNewVisible: false,
      list: [],
      listPage: 1,
      listLimit: 25,
      listTotalPages: 0,
      selectedEvent: null,
      loadMoreVisible: false,
      loadingPage: false,
      searchItem: '',
      searchTemporal: '',
      searchSpatial: '',

      saving: false,
      savingSuccess: false,

      addingReference: false,
      addingReferenceErrorVisible: false,
      addingReferenceErrorText: [],
      addingReferenceBtn: <span>Add</span>,
    }

    this.loadEvents = this.loadEvents.bind(this);
    this.loadMoreEvents = this.loadMoreEvents.bind(this);
    this.selectedEvent = this.selectedEvent.bind(this);
    this.searchEvents = this.searchEvents.bind(this);
    this.clearSearchEvents = this.clearSearchEvents.bind(this);
    this.clearSearchEventsTemporal = this.clearSearchEventsTemporal.bind(this);
    this.clearSearchEventsSpatial = this.clearSearchEventsSpatial.bind(this);
    this.keypress = this.keypress.bind(this);
    this.toggleAddNew = this.toggleAddNew.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.submitReferences = this.submitReferences.bind(this);
    this.addReference = this.addReference.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.validateEvent = this.validateEvent.bind(this);
    this.loadDefaultRefType = this.loadDefaultRefType.bind(this);

    this.listRef = React.createRef();

    // hack to kill load promise on unmount
    this.cancelLoad=false;
  }

  async loadEvents() {
    let temporal = this.state.searchTemporal.replace(/_/g,".");
    let params = {
      page: this.state.listPage,
      limit: this.state.listLimit,
      label: this.state.searchItem,
      temporal: temporal,
      spatial: this.state.searchSpatial,
    }
    let responseData = await axios({
        method: 'get',
        url: APIPath+'events',
        crossDomain: true,
        params: params
      })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
    if (this.cancelLoad) {
      return false;
    }
    let events = responseData.data.data;
    let list = this.state.list;
    let listIds = [];
    for (let j=0;j<list.length; j++) {
      listIds.push(list[j]._id);
    }
    for (let i=0;i<events.length; i++) {
      let eventItem = events[i];
      if (listIds.indexOf(eventItem._id===-1)) {
        eventItem.key =  eventItem._id;
        list.push(eventItem);
      }
    }
    let currentPage = 1;
    if (responseData.data.currentPage>1) {
      currentPage = responseData.data.currentPage;
    }
    let loadMoreVisible = false;
    if (currentPage<responseData.data.totalPages) {
      loadMoreVisible = true;
    }
    this.setState({
      list: list,
      loading: false,
      loadMoreVisible: loadMoreVisible,
      listTotalPages: responseData.data.totalPages,
      listPage: currentPage,
      loadingPage: false
    });
  }

  loadMoreEvents() {
    let currentPage = this.state.listPage;
    let lastPage = this.state.listTotalPages;
    if (currentPage<lastPage) {
      let newPage = currentPage+1;
      this.setState({
        listPage:newPage,
        loadingPage: true,
      })
    }
  }

  searchEvents() {
    let temporal = this.state.searchTemporal.replace(/_/g,".");
    this.setState({
      loading: true,
      list: []
    })
    let context = this;
    let params = {
      label: this.state.searchItem,
      temporal: temporal,
      spatial: this.state.searchSpatial,
    }
    axios({
        method: 'get',
        url: APIPath+'events',
        crossDomain: true,
        params: params
      })
    .then(function (response) {
      let responseData = response.data;
      let events = responseData.data.data;
      let list = [];
      for (let i=0;i<events.length; i++) {
        let eventItem = events[i];
        eventItem.key =  eventItem._id;
        list.push(eventItem);
      }
      let currentPage = 1;
      if (responseData.data.currentPage>1) {
        currentPage = responseData.data.currentPage;
      }
      let loadMoreVisible = false;
      if (currentPage<responseData.data.totalPages) {
        loadMoreVisible = true;
      }
      context.setState({
        list: list,
        loading: false,
        loadMoreVisible: loadMoreVisible,
        listTotalPages: responseData.data.totalPages,
        listPage: currentPage,
        loadingPage: false
      });
    })
    .catch(function (error) {
    });
  }

  keypress(e) {
    if(e.which===13){
      this.searchEvents();
    }
  }

  clearSearchEvents() {
    if (this.state.searchItem!=="") {
      this.setState({
        searchItem: '',
        list: [],
        loadMoreVisible:true
      });
    }
  }
  clearSearchEventsTemporal() {
    if (this.state.searchTemporal!=="") {
      this.setState({
        searchTemporal: '',
        list: [],
        loadMoreVisible:true
      });
      let context = this;
      setTimeout(()=>context.loadEvents(),250);

    }
  }
  clearSearchEventsSpatial() {
    if (this.state.searchSpatial!=="") {
      this.setState({
        searchSpatial: '',
        list: [],
        loadMoreVisible:true
      });
      let context = this;
      setTimeout(()=>context.loadEvents(),250);
    }
  }

  selectedEvent(_id) {
    this.setState({
      selectedEvent: _id
    })
  }

  toggleAddNew() {
    this.setState({
      listVisible: !this.state.listVisible,
      addNewVisible: !this.state.addNewVisible,
    });
  }

  toggleModal(modal) {
    this.setState({
      selectedEvent: null,
      addingReferenceErrorVisible: false,
      addingReferenceErrorText: [],
      addingReferenceBtn: <span>Add</span>,
    });
    this.props.toggleModal(modal);
  }

  select2Change(selectedOption, element=null) {
    if (element===null) {
      return false;
    }
    this.setState({
      [element]: selectedOption
    });
  }

  async submitReferences() {
    if (this.state.addingReference) {
      return false;
    }
    if (this.state.selectedEvent===null) {
      this.setState({
        addingReference: false,
        addingReferenceErrorVisible: true,
        addingReferenceErrorText: <div>Please select an event to continue</div>,
        addingReferenceBtn: <span>Error... <i className="fa fa-times" /></span>,
      });
      return false;
    }
    this.setState({
      addingReference: true,
      addingReferenceErrorVisible: false,
      addingReferenceErrorText: [],
      addingReferenceBtn: <span><i>Adding...</i> <Spinner color="info" size="sm"/></span>,
    });

    let addReference = await this.addReference();

    let addReferenceData = addReference.data;
    if (addReferenceData.status===false) {
      this.setState({
        addingReference: false,
        addingReferenceErrorVisible: true,
        addingReferenceErrorText: <div>{addReferenceData.error}</div>,
        addingReferenceBtn: <span>Error... <i className="fa fa-times" /></span>,
      });
      return false;
    }
    else {
      let context = this;
      this.setState({
        addingReference: false,
        addingReferenceBtn: <span>Added successfully <i className="fa fa-check" /></span>
      });
      this.props.reload();
      this.toggleModal('addEventModal')

      setTimeout(function() {
        context.setState({
          addingReferenceBtn: <span>Add</span>
        });
      },2000);
    }
  }

  addReference() {
    if (typeof this.state.refType==="undefined" || this.state.refType===null) {
      let response = {
        data: {
          status: false,
          error: <div>Please select a valid <b>Reference Type</b> to continue</div>
        }
      }
      return response;
    }
    else {
      let newReference = {
        items: [
          {_id: this.props.reference.ref, type: this.props.reference.type},
          {_id: this.state.selectedEvent, type: "Event"},
        ],
        taxonomyTermLabel: this.state.refType.label,
      }
      return addGenericReference(newReference);
    }
  }

  handleChange(e){
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  toggleCollapse(collapseName) {
    this.setState({
      [collapseName]: !this.state[collapseName]
    })
  }

  validateEvent() {
    if (this.state.eventLabel==="") {
      this.setState({
        saving: false,
        errorVisible: true,
        errorText: <div>Please enter the event <b>Label</b> to continue!</div>,
        updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
      });
      return false;
    }
    if (this.state.eventType==="") {
      this.setState({
        saving: false,
        errorVisible: true,
        errorText: <div>Please enter the <b>Type of event</b> to continue!</div>,
        updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
      });
      return false;
    }
    if (this.state.eventTimeStartDate!=="" ||
      this.state.eventTimeEndDate!=="" ||
      this.state.eventTimeFormat!==""
    ) {
      if (this.state.eventTimeLabel==="") {
        this.setState({
          saving: false,
          errorVisible: true,
          errorText: <div>Please enter the <b>Event Time Label</b> to continue!</div>,
          updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
        });
        return false;
      }
    }
    if (this.state.eventLocationStreetAddress!=="" ||
      this.state.eventLocationLocality!=="" ||
      this.state.eventLocationRegion!=="" ||
      this.state.eventLocationPostalCode!=="" ||
      this.state.eventLocationCountry!=="" ||
      this.state.eventLocationLatitude!=="" ||
      this.state.eventLocationLongitude!=="" ||
      this.state.eventLocationType!==""
    ) {
      if (this.state.eventLocationLabel==="") {
        this.setState({
          saving: false,
          errorVisible: true,
          errorText: <div>Please enter the <b>Event Time Label</b> to continue!</div>,
          updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
        });
        return false;
      }
    }
    this.setState({
      saving: false,
      errorVisible: false,
      errorText: []
    })
    return true;
  }

  loadDefaultRefType() {
    this.setState({
      refType: refTypesList(this.props.refTypes)[0]
    })
  }

  componentDidMount() {
    this.loadEvents();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.listPage<this.state.listPage) {
      this.loadEvents();
      let context = this;
      setTimeout(function() {
        context.listRef.current.scrollTop = context.listRef.current.scrollHeight;
      },100);
    }
    if (prevState.searchItem!==this.state.searchItem) {
      this.searchEvents();
    }
    if (prevProps.refTypes!==this.props.refTypes) {
      this.loadDefaultRefType();
    }
    if (prevProps.item!==this.props.item) {
      this.loadDefaultRefType();
    }
  }

  componentWillUnmount() {
    this.cancelLoad=true;
  }

  render() {
    let list = <div className="text-center"><Spinner color="secondary" /></div>;
    let loadingMoreVisible = "hidden";
    if (this.state.loadingPage) {
      loadingMoreVisible = "";
    }

    let loadingMore = <Spinner color="light" size="sm" className={loadingMoreVisible}/>;
    let loadMoreVisibleClass = "hidden";
    if (this.state.loadMoreVisible) {
      loadMoreVisibleClass = "";
    }
    if (!this.state.loading) {
      list = [];
      let item = this.props.item;
      let itemEvents = [];
      if (item!==null && typeof item.events!=="undefined" && item.events!==null) {
        itemEvents = item.events.map(org=> {return {ref:org.ref._id,term: org.term.label}});
      }
      for (let i=0;i<this.state.list.length; i++) {
        let eventItem = this.state.list[i];
        let active = "";
        let exists = "";
        if (this.state.selectedEvent===eventItem._id) {
          active = " active";
        }
        let isRelated = itemEvents.find(org=> {
          if (this.state.refType!==null && org.ref===eventItem._id && org.term===this.state.refType.value) {
            return true;
          }
          return false
        })
        if (isRelated) {
          exists = " exists";
        }
        let temporal = [];
        if (eventItem.temporal.length>0) {
          let temporalData = eventItem.temporal[0].ref;
          temporal = temporalData.label;
        }
        let spatial = [];
        if (eventItem.spatial.length>0) {
          let spatialData = eventItem.spatial[0].ref;
          spatial = spatialData.label;
          if (temporal.length>0) {
            spatial = `| ${spatial}`
          }
        }
        let eventListItem = <div
          className={"event-list-item"+active+exists}
          key={eventItem._id}
          onClick={()=>this.selectedEvent(eventItem._id)}>{eventItem.label} <small>({temporal} {spatial})</small></div>;
        list.push(eventListItem);
      }
    }
    let refTypesListItems = refTypesList(this.props.refTypes);

    let addingReferenceErrorVisible = "hidden";
    if (this.state.addingReferenceErrorVisible) {
      addingReferenceErrorVisible = "";
    }

    let errorContainer = <Alert className={addingReferenceErrorVisible} color="danger">{this.state.addingReferenceErrorText}</Alert>;
    return (
      <Modal isOpen={this.props.visible} toggle={()=>this.toggleModal('addEventModal')} className={this.props.className}>
        <ModalHeader toggle={()=>this.toggleModal('addEventModal')}>Add Event Relation</ModalHeader>
        <ModalBody>
          {errorContainer}
          <FormGroup style={{marginTop: '15px'}}>
            <Label for="refType">Reference Type</Label>
            <Select
              value={this.state.refType}
              onChange={(selectedOption)=>this.select2Change(selectedOption, "refType")}
              options={refTypesListItems}
            />
          </FormGroup>
          <hr/>
          <h4>Select Event</h4>
          <FormGroup className="autocomplete-search">
            <Input type="text" name="searchItem" placeholder="Search..." value={this.state.searchItem} onChange={this.handleChange}/>
            <div className="close-icon" onClick={()=>this.clearSearchEvents()}><i className="fa fa-times" /></div>
          </FormGroup>
          <FormGroup className="autocomplete-search">
            <InputMask className="input-mask" placeholder="dd-mm-yyyy" mask="99-99-9999" name="searchTemporal" value={this.state.searchTemporal} onChange={this.handleChange} onKeyPress={this.keypress}/>
            <div className="close-icon" onClick={()=>this.clearSearchEventsTemporal()}><i className="fa fa-times" /></div>
            <div className="submit-icon" onClick={()=>this.searchEvents()}><i className="fa fa-search" /></div>
          </FormGroup>
          <FormGroup className="autocomplete-search">
            <Input type="text" name="searchSpatial" placeholder="Search spatial..." value={this.state.searchSpatial} onChange={this.handleChange} onKeyPress={this.keypress}/>
            <div className="close-icon" onClick={()=>this.clearSearchEventsSpatial()}><i className="fa fa-times" /></div>
            <div className="submit-icon" onClick={()=>this.searchEvents()}><i className="fa fa-search" /></div>
          </FormGroup>
          <div className="events-list-container" ref={this.listRef}>
            {list}
          </div>
          <Button className={loadMoreVisibleClass} color="secondary" outline size="sm" block onClick={()=>this.loadMoreEvents()}>Load more {loadingMore}</Button>

        </ModalBody>
        <ModalFooter className="modal-footer">
          <Button color="info" outline onClick={()=>this.submitReferences()}>{this.state.addingReferenceBtn}</Button>
          <Button color="secondary" outline onClick={()=>this.toggleModal('addEventModal')} className="pull-left">Cancel</Button>
        </ModalFooter>
      </Modal>
    )
  }
}
