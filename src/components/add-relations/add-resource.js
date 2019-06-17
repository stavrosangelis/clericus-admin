import React, { Component } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
  FormGroup, Label, Input,
  Alert,
  Spinner
} from 'reactstrap';
import axios from 'axios';
import {APIPath} from '../../static/constants';
import Select from 'react-select';
import {getResourceThumbnailURL,addGenericReference,refTypesList} from '../../helpers/helpers';

export default class AddResource extends Component {
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
      totalItems: 0,
      selectedResource: null,
      loadMoreVisible: false,
      loadingPage: false,
      searchItem: '',

      saving: false,
      savingSuccess: false,

      addingReference: false,
      addingReferenceErrorVisible: false,
      addingReferenceErrorText: [],
      addingReferenceBtn: <span>Add</span>,
    }

    this.loadResources = this.loadResources.bind(this);
    this.loadMoreResources = this.loadMoreResources.bind(this);
    this.selectedResource = this.selectedResource.bind(this);
    this.search = this.search.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.toggleAddNew = this.toggleAddNew.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.submitReferences = this.submitReferences.bind(this);
    this.addReference = this.addReference.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.loadDefaultRefType = this.loadDefaultRefType.bind(this);

    this.listRef = React.createRef();
  }

  loadResources() {
    let context = this;
    let params = {
      page: this.state.listPage,
      limit: this.state.listLimit,
      label: this.state.searchItem
    }
    axios({
        method: 'get',
        url: APIPath+'resources',
        crossDomain: true,
        params: params
      })
    .then(function (response) {
      let responseData = response.data;
      let items = responseData.data.data;
      let list = context.state.list;
      let listIds = [];
      for (let j=0;j<listIds.length; j++) {
        listIds.push(list[j]._id);
      }
      for (let i=0;i<items.length; i++) {
        let item = items[i];
        if (listIds.indexOf(item._id===-1)) {
          item.key = item._id;
          list.push(item);
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
      let showingItems = parseInt(context.state.listLimit,10)*parseInt(currentPage,10);
      if (showingItems>parseInt(responseData.data.totalItems,10)) {
        showingItems = responseData.data.totalItems;
      }
      context.setState({
        list: list,
        loading: false,
        loadMoreVisible: loadMoreVisible,
        listTotalPages: responseData.data.totalPages,
        listPage: currentPage,
        showingItems: showingItems,
        totalItems: responseData.data.totalItems,
        loadingPage: false
      });
    })
    .catch(function (error) {
    });
  }

  loadMoreResources() {
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

  search() {
    this.setState({
      loading: true,
      list: []
    })
    let context = this;
    let params = {
      label: this.state.searchItem
    }
    axios({
        method: 'get',
        url: APIPath+'resources',
        crossDomain: true,
        params: params
      })
    .then(function (response) {
      let responseData = response.data;
      let items = responseData.data.data;
      let list = [];
      for (let i=0;i<items.length; i++) {
        let item = items[i];
        item.key = item._id;
        list.push(item);
      }
      let currentPage = 1;
      if (responseData.data.currentPage>1) {
        currentPage = responseData.data.currentPage;
      }
      let loadMoreVisible = false;
      if (currentPage<responseData.data.totalPages) {
        loadMoreVisible = true;
      }
      let showingItems = parseInt(context.state.listLimit,10)*parseInt(currentPage,10);
      if (showingItems>parseInt(responseData.data.totalItems,10)) {
        showingItems = responseData.data.totalItems;
      }
      context.setState({
        list: list,
        loading: false,
        loadMoreVisible: loadMoreVisible,
        listTotalPages: responseData.data.totalPages,
        listPage: currentPage,
        showingItems: showingItems,
        totalItems: responseData.data.totalItems,
        loadingPage: false
      });
    })
    .catch(function (error) {
    });
  }

  clearSearch() {
    if (this.state.searchItem!=="") {
      this.setState({
        searchItem: '',
        list: []
      });
    }
  }

  selectedResource(_id) {
    this.setState({
      selectedResource: _id
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
      selectedResource: null,
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
    if (this.state.selectedResource===null) {
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
      this.toggleModal('addResourceModal')

      setTimeout(function() {
        context.setState({
          addingReferenceBtn: <span>Add</span>
        });
      },2000);
    }
  }

  addReference() {
    if (typeof this.state.refType==="undefined") {
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
          {_id: this.state.selectedResource, type: "Resource"},
          {_id: this.props.reference.ref, type: this.props.reference.type}
        ],
        taxonomyTermId: this.state.refType.value,
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

  loadDefaultRefType() {
    this.setState({
      refType: refTypesList(this.props.refTypes)[0]
    })
  }

  componentDidMount() {
    this.loadResources();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.listPage<this.state.listPage) {
      this.loadResources();
      let context = this;
      setTimeout(function() {
        context.listRef.current.scrollTop = context.listRef.current.scrollHeight;
      },100);
    }
    if (prevState.searchItem!==this.state.searchItem) {
      this.search();
    }
    if (prevProps.refTypes!==this.props.refTypes) {
      this.loadDefaultRefType();
    }
    if (prevProps.item!==this.props.item) {
      this.loadDefaultRefType();
    }
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
      let itemResources = [];
      let item = this.props.item;
      if (item!==null && typeof item.resources!=="undefined" && item.resources!==null) {
        for (let ie=0; ie<item.resources.length; ie++) {
          let itemResource = item.resources[ie];
          if (
            typeof itemResource!=="undefined" &&
            itemResource.ref!==null &&
            typeof this.state.refType!=="undefined" && this.state.refType!==null
            && this.state.refType.value===itemResource.refTerm
            && itemResource.refLabel===this.state.refType.label
          ) {
            itemResources.push(itemResource.ref._id);
          }
        }
      }
      for (let i=0;i<this.state.list.length; i++) {
        let item = this.state.list[i];
        let active = "";
        let exists = "";
        if (this.state.selectedResource===item._id) {
          active = " active";
        }
        if (itemResources.indexOf(item._id)>-1) {
          exists = " exists"
        }
        let thumbnail = <div className="img-responsive img-thumbnail">
          <img src={getResourceThumbnailURL(item)} alt={item.label}/>
          </div>;
        let listItem = <div
          className={"event-list-item event-list-resource"+active+exists}
          key={item._id}
          onClick={()=>this.selectedResource(item._id)}>{thumbnail} <div className="label">{item.label}</div></div>;
        list.push(listItem);
      }
    }
    let refTypesListItems = refTypesList(this.props.refTypes);

    let addingReferenceErrorVisible = "hidden";
    if (this.state.addingReferenceErrorVisible) {
      addingReferenceErrorVisible = "";
    }

    let errorContainer = <Alert className={addingReferenceErrorVisible} color="danger">{this.state.addingReferenceErrorText}</Alert>;

    return (
      <Modal isOpen={this.props.visible} toggle={()=>this.toggleModal('addResourceModal')} className={this.props.className}>
        <ModalHeader toggle={()=>this.toggleModal('addResourceModal')}>Add Resource Relation</ModalHeader>
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
          <h4>Select Resource</h4>
          <FormGroup className="autocomplete-search">
            <Input type="text" name="searchItem" placeholder="Search..." value={this.state.searchItem} onChange={this.handleChange}/>
            <div className="close-icon" onClick={()=>this.clearSearch()}><i className="fa fa-times" /></div>
          </FormGroup>
          <div className="events-list-container" ref={this.listRef}>
            {list}
          </div>
          <Button className={loadMoreVisibleClass} color="secondary" outline size="sm" block onClick={()=>this.loadMoreResources()}>Load more {loadingMore}</Button>
          <div className="list-legend">
            <span className="heading">Showing:</span>
            <span className="text">{this.state.showingItems}/{this.state.totalItems}</span>
          </div>
        </ModalBody>
        <ModalFooter className="modal-footer">
          <Button color="info" outline onClick={()=>this.submitReferences()}>{this.state.addingReferenceBtn}</Button>
          <Button color="secondary" outline onClick={()=>this.toggleModal('addResourceModal')} className="pull-left">Cancel</Button>
        </ModalFooter>
      </Modal>
    )
  }
}
