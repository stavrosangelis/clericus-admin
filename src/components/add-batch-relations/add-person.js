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

export default class AddPerson extends Component {
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
      selectedPerson: null,
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

    this.loadPeople = this.loadPeople.bind(this);
    this.loadMorePeople = this.loadMorePeople.bind(this);
    this.selectedPerson = this.selectedPerson.bind(this);
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
  }

  loadPeople() {
    let context = this;
    let params = {
      page: this.state.listPage,
      limit: this.state.listLimit,
      label: this.state.searchItem
    }
    axios({
        method: 'get',
        url: APIPath+'people',
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
          let label = item.firstName;
          if (item.lastName!=="") {
            label += " "+item.lastName
          }
          item.key = item._id;
          item.label = label;
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

  loadMorePeople() {
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
        url: APIPath+'people',
        crossDomain: true,
        params: params
      })
    .then(function (response) {
      let responseData = response.data;
      let items = responseData.data.data;
      let list = [];
      for (let i=0;i<items.length; i++) {
        let item = items[i];
        let label = item.firstName;
        if (item.lastName!=="") {
          label += " "+item.lastName
        }
        item.key = item._id;
        item.label = label;
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

  selectedPerson(_id) {
    this.setState({
      selectedPerson: _id
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
      selectedPerson: null,
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
    if (this.state.selectedPerson===null) {
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
      let errorOutput = [];
      for (let errorKey in addReferenceData.error) {
        errorOutput.push(<div key={errorKey}>{addReferenceData.error[errorKey]}</div>)
      }
      this.setState({
        addingReference: false,
        addingReferenceErrorVisible: true,
        addingReferenceErrorText: <div>{errorOutput}</div>,
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
      this.toggleModal('addPersonModal')

      setTimeout(function() {
        context.setState({
          addingReferenceBtn: <span>Submit</span>
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
            {_id: this.state.selectedPerson, type: "Person"},
            {_id: item._id, type: this.props.type}
          ],
          taxonomyTermId: this.state.refType.value,
        }
        return newReference;
      });
      return this.postReferences(newReferences);
    }
  }

  postReferences(references) {
    return new Promise((resolve, reject) => {
      axios({
          method: 'post',
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
      refType: refTypesList(this.props.refTypes.person)[0]
    })
  }

  componentDidMount() {
    this.loadPeople();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.listPage<this.state.listPage) {
      this.loadPeople();
      let context = this;
      setTimeout(function() {
        context.listRef.current.scrollTop = context.listRef.current.scrollHeight;
      },100);
    }
    if (prevState.searchItem!==this.state.searchItem) {
      this.search();
    }
    if (this.props.visible && !prevProps.visible && typeof this.props.refTypes.person!=="undefined") {
      this.loadDefaultRefType();
    }
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
      let itemPeople = [];
      for (let i=0;i<this.state.list.length; i++) {
        let item = this.state.list[i];
        let active = "";
        let exists = "";
        if (this.state.selectedPerson===item._id) {
          active = " active";
        }
        if (itemPeople.indexOf(item._id)>-1) {
          exists = " exists"
        }
        let listItem = <div
          className={"event-list-item"+active+exists}
          key={item._id}
          onClick={()=>this.selectedPerson(item._id)}>{item.label}</div>;
        list.push(listItem);
      }
    }

    let addingReferenceErrorVisible = "hidden";
    if (this.state.addingReferenceErrorVisible) {
      addingReferenceErrorVisible = "";
    }

    let refTypesListItems = [];
    if (typeof this.props.refTypes.person!=="undefined") {
      refTypesListItems = refTypesList(this.props.refTypes.person);
    }

    let errorContainer = <Alert className={addingReferenceErrorVisible} color="danger">{this.state.addingReferenceErrorText}</Alert>;

    return (
      <Modal isOpen={this.props.visible} toggle={()=>this.toggleModal('addPersonModal')} className={this.props.className}>
        <ModalHeader toggle={()=>this.toggleModal('addPersonModal')}>Associate selected items with  Person</ModalHeader>
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
            <Label>Select Person</Label>
          </FormGroup>
          <FormGroup className="autocomplete-search">
            <Input type="text" name="searchItem" placeholder="Search..." value={this.state.searchItem} onChange={this.handleChange}/>
            <div className="close-icon" onClick={()=>this.clearSearch()}><i className="fa fa-times" /></div>
          </FormGroup>
          <div className="events-list-container" ref={this.listRef}>
            {list}
          </div>
          <Button className={loadMoreVisibleClass} color="secondary" outline size="sm" block onClick={()=>this.loadMorePeople()}>Load more {loadingMore}</Button>
          <div className="list-legend">
            <span className="heading">Showing:</span>
            <span className="text">{this.state.showingItems}/{this.state.totalItems}</span>
          </div>
        </ModalBody>
        <ModalFooter className="modal-footer">
          <Button color="info" outline size="sm" onClick={()=>this.submitReferences()}>{this.state.addingReferenceBtn}</Button>
          <Button color="secondary" outline size="sm" onClick={()=>this.toggleModal('addPersonModal')} className="pull-left">Cancel</Button>
        </ModalFooter>
      </Modal>
    )
  }
}
