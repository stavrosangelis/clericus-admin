import React, { Component } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
  FormGroup, Label, Input,
  Alert,
  Spinner
} from 'reactstrap';
import axios from 'axios';
import Select from 'react-select';
import {refTypesList} from '../../helpers/helpers';
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

      saving: false,
      savingSuccess: false,

      addingReference: false,
      addingReferenceErrorVisible: false,
      addingReferenceErrorText: [],
      addingReferenceBtn: <span>Submit</span>,
    }

    this.loadEvents = this.loadEvents.bind(this);
    this.loadMoreEvents = this.loadMoreEvents.bind(this);
    this.selectedEvent = this.selectedEvent.bind(this);
    this.searchEvents = this.searchEvents.bind(this);
    this.clearSearchEvents = this.clearSearchEvents.bind(this);
    this.toggleAddNew = this.toggleAddNew.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.submitReferences = this.submitReferences.bind(this);
    this.addReferences = this.addReferences.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.loadDefaultRefType = this.loadDefaultRefType.bind(this);
    this.postReferences = this.postReferences.bind(this);

    this.listRef = React.createRef();

    // hack to kill load promise on unmount
    this.cancelLoad=false;
  }

  async loadEvents() {
    let params = {
      page: this.state.listPage,
      limit: this.state.listLimit,
      label: this.state.searchItem
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

  async searchEvents() {
    this.setState({
      loading: true,
      list: []
    })
    let params = {
      label: this.state.searchItem
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
    this.setState({
      list: list,
      loading: false,
      loadMoreVisible: loadMoreVisible,
      listTotalPages: responseData.data.totalPages,
      listPage: currentPage,
      loadingPage: false
    });
  }

  clearSearchEvents() {
    if (this.state.searchItem!=="") {
      this.setState({
        searchItem: '',
        list: []
      });
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
      addingReferenceBtn: <span>Submit</span>,
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

    let addReferences = await this.addReferences();

    let addReferencesData = addReferences.data;
    if (addReferencesData.status===false) {
      this.setState({
        addingReference: false,
        addingReferenceErrorVisible: true,
        addingReferenceErrorText: <div>{addReferencesData.error}</div>,
        addingReferenceBtn: <span>Error... <i className="fa fa-times" /></span>,
      });
      return false;
    }
    else {
      let context = this;
      this.setState({
        addingReference: false,
        addingReferenceBtn: <span>Submitted successfully <i className="fa fa-check" /></span>
      });
      this.toggleModal('addEventModal')

      setTimeout(function() {
        context.setState({
          addingReferenceBtn: <span>Submit</span>
        });
      },2000);
    }
  }

  addReferences() {
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
      let newReferences = this.props.items.map(item=> {
        let newReference = {
          items: [
            {_id: item._id, type: this.props.type},
            {_id: this.state.selectedEvent, type: "Event"},
          ],
          taxonomyTermLabel: this.state.refType.value,
        }
        return newReference;
      });
      return this.postReferences(newReferences);
    }
  }

  postReferences(references) {
    return new Promise((resolve, reject) => {
      axios({
          method: 'put',
          url: APIPath+'references',
          crossDomain: true,
          data: references
        })
      .then(function (response) {
        resolve (response);
      })
      .catch(function (error) {
      });
    });
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

  loadDefaultRefType() {
    this.setState({
      refType: refTypesList(this.props.refTypes.event)[0]
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
    if (this.props.visible && !prevProps.visible && typeof this.props.refTypes.event!=="undefined") {
      this.loadDefaultRefType();
    }
  }

  componentWillUnmount() {
    this.cancelLoad=true;
  }

  render() {
    let selectedItems = [];
    if (this.props.type==="Person") {
      selectedItems = this.props.items.map(item=> {
        let name = "";
        if (typeof item.honorificPrefix!=="undefined" && item.honorificPrefix!=="") {
          name += item.honorificPrefix+" ";
        }
        if (typeof item.firstName!=="undefined" && item.firstName!=="") {
          name += item.firstName+" ";
        }
        if (typeof item.middleName!=="undefined" && item.middleName!=="") {
          name += item.middleName+" ";
        }
        if (typeof item.lastName!=="undefined" && item.lastName!=="") {
          name += item.lastName+" ";
        }
        return <li key={item._id}>
          <span>{name}</span>
          <span className="remove-item-from-list" onClick={()=>this.props.removeSelected(item._id)}><i className="fa fa-times-circle" /></span>
        </li>
      });
    }
    else {
      selectedItems = this.props.items.map(item=> {
        return <li key={item._id}>
          <span>{item.label}</span>
          <span className="remove-item-from-list" onClick={()=>this.props.removeSelected(item._id)}><i className="fa fa-times-circle" /></span>
        </li>
      });
    }
    if (selectedItems.length>0) {
      selectedItems = <div className="form-group">
        <label>Selected items</label>
        <ul className="selected-items-list">{selectedItems}</ul>
      </div>
    }
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

      for (let i=0;i<this.state.list.length; i++) {
        let eventItem = this.state.list[i];
        let active = "";
        let exists = "";
        if (this.state.selectedEvent===eventItem._id) {
          active = " active";
        }
        let eventListItem = <div
          className={"event-list-item"+active+exists}
          key={eventItem._id}
          onClick={()=>this.selectedEvent(eventItem._id)}>{eventItem.label}</div>;
        list.push(eventListItem);
      }
    }

    let addingReferenceErrorVisible = "hidden";
    if (this.state.addingReferenceErrorVisible) {
      addingReferenceErrorVisible = "";
    }

    let refTypesListItems = [];
    if (typeof this.props.refTypes.event!=="undefined") {
      refTypesListItems = refTypesList(this.props.refTypes.event);
    }
    let errorContainer = <Alert className={addingReferenceErrorVisible} color="danger">{this.state.addingReferenceErrorText}</Alert>;
    return (
      <Modal isOpen={this.props.visible} toggle={()=>this.toggleModal('addEventModal')} className={this.props.className}>
        <ModalHeader toggle={()=>this.toggleModal('addEventModal')}>Associate selected items with Event</ModalHeader>
        <ModalBody>
          {errorContainer}
          {selectedItems}
          <FormGroup style={{marginTop: '15px'}}>
            <Label for="refType">Reference Type</Label>
            <Select
              value={this.state.refType}
              onChange={(selectedOption)=>this.select2Change(selectedOption, "refType")}
              options={refTypesListItems}
            />
          </FormGroup>

          <FormGroup>
            <Label>Select Event</Label>
          </FormGroup>
          <FormGroup className="autocomplete-search">
            <Input type="text" name="searchItem" placeholder="Search..." value={this.state.searchItem} onChange={this.handleChange}/>
            <div className="close-icon" onClick={()=>this.clearSearchEvents()}><i className="fa fa-times" /></div>
          </FormGroup>
          <div className="events-list-container" ref={this.listRef}>
            {list}
          </div>
          <Button className={loadMoreVisibleClass} color="secondary" outline size="sm" block onClick={()=>this.loadMoreEvents()}>Load more {loadingMore}</Button>

        </ModalBody>
        <ModalFooter className="modal-footer">
          <Button color="info" outline size="sm" onClick={()=>this.submitReferences()}>{this.state.addingReferenceBtn}</Button>
          <Button color="secondary" outline size="sm" onClick={()=>this.toggleModal('addEventModal')} className="pull-left">Cancel</Button>
        </ModalFooter>
      </Modal>
    )
  }
}
