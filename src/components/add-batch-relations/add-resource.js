import React, { Component } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
  FormGroup, Label, Input,
  Alert,
  Spinner
} from 'reactstrap';
import axios from 'axios';
import Select from 'react-select';
import {getResourceThumbnailURL,refTypesList} from '../../helpers/helpers';
const APIPath = process.env.REACT_APP_APIPATH;

export default class AddResource extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      refType: null,
      refRole: null,
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
    this.postReferences = this.postReferences.bind(this);

    this.listRef = React.createRef();

    // hack to kill load promise on unmount
    this.cancelLoad=false;
  }

  async loadResources() {
    let params = {
      page: this.state.listPage,
      limit: this.state.listLimit,
      label: this.state.searchItem
    }
    let responseData = await axios({
        method: 'get',
        url: APIPath+'resources',
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
    let items = responseData.data.data;
    let list = this.state.list;
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
    let showingItems = parseInt(this.state.listLimit,10)*parseInt(currentPage,10);
    if (showingItems>parseInt(responseData.data.totalItems,10)) {
      showingItems = responseData.data.totalItems;
    }
    this.setState({
      list: list,
      loading: false,
      loadMoreVisible: loadMoreVisible,
      listTotalPages: responseData.data.totalPages,
      listPage: currentPage,
      showingItems: showingItems,
      totalItems: responseData.data.totalItems,
      loadingPage: false
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

  async search() {
    this.setState({
      loading: true,
      list: []
    })
    let params = {
      label: this.state.searchItem
    }
    let responseData = await axios({
        method: 'get',
        url: APIPath+'resources',
        crossDomain: true,
        params: params
      })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });

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
    let showingItems = parseInt(this.state.listLimit,10)*parseInt(currentPage,10);
    if (showingItems>parseInt(responseData.data.totalItems,10)) {
      showingItems = responseData.data.totalItems;
    }
    this.setState({
      list: list,
      loading: false,
      loadMoreVisible: loadMoreVisible,
      listTotalPages: responseData.data.totalPages,
      listPage: currentPage,
      showingItems: showingItems,
      totalItems: responseData.data.totalItems,
      loadingPage: false
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
        addingReferenceErrorText: <div>Please select a resource to continue</div>,
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
      this.toggleModal('addResourceModal')

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
      let newReferences = this.props.items.map(item=> {
        let newReference = {
          items: [
            {_id: item._id, type: this.props.type},
            {_id: this.state.selectedResource, type: "Resource"},
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
      refType: refTypesList(this.props.refTypes.resource)[0]
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
    if (this.props.visible && !prevProps.visible && typeof this.props.refTypes.resource!=="undefined") {
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
      let itemResources = [];
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
          onClick={()=>this.selectedResource(item._id)}>
            <div className="event-list-resource-body">
              {thumbnail}
              <div className="label">{item.label}</div>
            </div>
          </div>;
        list.push(listItem);
      }
    }

    let addingReferenceErrorVisible = "hidden";
    if (this.state.addingReferenceErrorVisible) {
      addingReferenceErrorVisible = "";
    }

    let refTypesListItems = [];
    if (typeof this.props.refTypes.resource!=="undefined") {
      refTypesListItems = refTypesList(this.props.refTypes.resource);
    }

    let errorContainer = <Alert className={addingReferenceErrorVisible} color="danger">{this.state.addingReferenceErrorText}</Alert>;

    let referenceRole = [];
    if (this.props.type==="person") {
      let refRoleOptions = [{value: null, label: "-"}];
      for (let i=0;i<this.props.peopleRoles.length;i++) {
        let refRoleOption = this.props.peopleRoles[i];
        refRoleOptions.push({value: refRoleOption._id, label: refRoleOption.label});

      }
      referenceRole = <FormGroup style={{marginTop: '15px'}}>
        <Label for="refType">Reference Role</Label>
        <Select
          value={this.state.refRole}
          onChange={(selectedOption)=>this.select2Change(selectedOption, "refRole")}
          options={refRoleOptions}
        />
      </FormGroup>
    }
    return (
      <Modal isOpen={this.props.visible} toggle={()=>this.toggleModal('addResourceModal')} className={this.props.className}>
        <ModalHeader toggle={()=>this.toggleModal('addResourceModal')}>Associate selected items with  Resource</ModalHeader>
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
          {referenceRole}
          <FormGroup>
            <Label>Select Resource</Label>
          </FormGroup>
          <FormGroup className="autocomplete-search">
            <Input type="text" name="searchItem" placeholder="Search..." value={this.state.searchItem} onChange={this.handleChange}/>
            <div className="close-icon" onClick={()=>this.clearSearch()}><i className="fa fa-times" /></div>
          </FormGroup>
          <div className="events-list-container resources-list-container" ref={this.listRef}>
            {list}
          </div>
          <Button className={loadMoreVisibleClass} color="secondary" outline size="sm" block onClick={()=>this.loadMoreResources()}>Load more {loadingMore}</Button>
          <div className="list-legend">
            <span className="heading">Showing:</span>
            <span className="text">{this.state.showingItems}/{this.state.totalItems}</span>
          </div>
        </ModalBody>
        <ModalFooter className="modal-footer">
          <Button color="info" outline size="sm" onClick={()=>this.submitReferences()}>{this.state.addingReferenceBtn}</Button>
          <Button color="secondary" outline size="sm" onClick={()=>this.toggleModal('addResourceModal')} className="pull-left">Cancel</Button>
        </ModalFooter>
      </Modal>
    )
  }
}
