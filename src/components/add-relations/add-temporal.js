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
const APIPath = process.env.REACT_APP_APIPATH;

export default class AddTemporal extends Component {
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
      selectedTemporal: null,
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

    this.loadTemporals = this.loadTemporals.bind(this);
    this.loadMoreTemporals = this.loadMoreTemporals.bind(this);
    this.selectedTemporal = this.selectedTemporal.bind(this);
    this.searchTemporals = this.searchTemporals.bind(this);
    this.clearSearchTemporals = this.clearSearchTemporals.bind(this);
    this.toggleAddNew = this.toggleAddNew.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.submitReferences = this.submitReferences.bind(this);
    this.addReference = this.addReference.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.select2Change = this.select2Change.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.validateTemporal = this.validateTemporal.bind(this);
    this.loadDefaultRefType = this.loadDefaultRefType.bind(this);

    this.listRef = React.createRef();

    // hack to kill load promise on unmount
    this.cancelLoad=false;
  }

  async loadTemporals() {
    let params = {
      page: this.state.listPage,
      limit: this.state.listLimit,
      label: this.state.searchItem
    }
    let responseData = await axios({
        method: 'get',
        url: APIPath+'temporals',
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
    let temporals = responseData.data.data;
    let list = this.state.list;
    let listIds = [];
    for (let j=0;j<list.length; j++) {
      listIds.push(list[j]._id);
    }
    for (let i=0;i<temporals.length; i++) {
      let temporalItem = temporals[i];
      if (listIds.indexOf(temporalItem._id===-1)) {
        temporalItem.key =  temporalItem._id;
        list.push(temporalItem);
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

  loadMoreTemporals() {
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

  searchTemporals() {
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
        url: APIPath+'temporals',
        crossDomain: true,
        params: params
      })
    .then(function (response) {
      let responseData = response.data;
      let temporals = responseData.data.data;
      let list = [];
      for (let i=0;i<temporals.length; i++) {
        let temporalItem = temporals[i];
        temporalItem.key =  temporalItem._id;
        list.push(temporalItem);
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

  clearSearchTemporals() {
    if (this.state.searchItem!=="") {
      this.setState({
        searchItem: '',
        list: []
      });
    }
  }

  selectedTemporal(_id) {
    this.setState({
      selectedTemporal: _id
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
      selectedTemporal: null,
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
    if (this.state.selectedTemporal===null) {
      this.setState({
        addingReference: false,
        addingReferenceErrorVisible: true,
        addingReferenceErrorText: <div>Please select an temporal to continue</div>,
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
      this.toggleModal('addTemporalModal')

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
          {_id: this.state.selectedTemporal, type: "Temporal"},
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

  validateTemporal() {
    if (this.state.temporalLabel==="") {
      this.setState({
        saving: false,
        errorVisible: true,
        errorText: <div>Please enter the temporal <b>Label</b> to continue!</div>,
        updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
      });
      return false;
    }
    if (this.state.temporalType==="") {
      this.setState({
        saving: false,
        errorVisible: true,
        errorText: <div>Please enter the <b>Type of temporal</b> to continue!</div>,
        updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
      });
      return false;
    }
    if (this.state.temporalTimeStartDate!=="" ||
      this.state.temporalTimeEndDate!=="" ||
      this.state.temporalTimeFormat!==""
    ) {
      if (this.state.temporalTimeLabel==="") {
        this.setState({
          saving: false,
          errorVisible: true,
          errorText: <div>Please enter the <b>Temporal Time Label</b> to continue!</div>,
          updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
        });
        return false;
      }
    }
    if (this.state.temporalLocationStreetAddress!=="" ||
      this.state.temporalLocationLocality!=="" ||
      this.state.temporalLocationRegion!=="" ||
      this.state.temporalLocationPostalCode!=="" ||
      this.state.temporalLocationCountry!=="" ||
      this.state.temporalLocationLatitude!=="" ||
      this.state.temporalLocationLongitude!=="" ||
      this.state.temporalLocationType!==""
    ) {
      if (this.state.temporalLocationLabel==="") {
        this.setState({
          saving: false,
          errorVisible: true,
          errorText: <div>Please enter the <b>Temporal Time Label</b> to continue!</div>,
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
    this.loadTemporals();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.listPage<this.state.listPage) {
      this.loadTemporals();
      let context = this;
      setTimeout(function() {
        context.listRef.current.scrollTop = context.listRef.current.scrollHeight;
      },100);
    }
    if (prevState.searchItem!==this.state.searchItem) {
      this.searchTemporals();
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
      let itemTemporals = [];
      if (item!==null && typeof item.temporals!=="undefined" && item.temporals!==null) {
        itemTemporals = item.temporals.map(org=> {return {ref:org.ref._id,term: org.term.label}});
      }
      for (let i=0;i<this.state.list.length; i++) {
        let temporalItem = this.state.list[i];
        let active = "";
        let exists = "";
        if (this.state.selectedTemporal===temporalItem._id) {
          active = " active";
        }
        let isRelated = itemTemporals.find(org=> {
          if (this.state.refType!==null && org.ref===temporalItem._id && org.term===this.state.refType.value) {
            return true;
          }
          return false
        })
        if (isRelated) {
          exists = " exists"
        }
        let temporalListItem = <div
          className={"event-list-item"+active+exists}
          key={temporalItem._id}
          onClick={()=>this.selectedTemporal(temporalItem._id)}>{temporalItem.label}</div>;
        list.push(temporalListItem);
      }
    }
    let refTypesListItems = refTypesList(this.props.refTypes);

    let addingReferenceErrorVisible = "hidden";
    if (this.state.addingReferenceErrorVisible) {
      addingReferenceErrorVisible = "";
    }

    let errorContainer = <Alert className={addingReferenceErrorVisible} color="danger">{this.state.addingReferenceErrorText}</Alert>;
    return (
      <Modal isOpen={this.props.visible} toggle={()=>this.toggleModal('addTemporalModal')} className={this.props.className}>
        <ModalHeader toggle={()=>this.toggleModal('addTemporalModal')}>Add Temporal Relation</ModalHeader>
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
          <h4>Select Temporal</h4>
          <FormGroup className="autocomplete-search">
            <Input type="text" name="searchItem" placeholder="Search..." value={this.state.searchItem} onChange={this.handleChange}/>
            <div className="close-icon" onClick={()=>this.clearSearchTemporals()}><i className="fa fa-times" /></div>
          </FormGroup>
          <div className="events-list-container" ref={this.listRef}>
            {list}
          </div>
          <Button className={loadMoreVisibleClass} color="secondary" outline size="sm" block onClick={()=>this.loadMoreTemporals()}>Load more {loadingMore}</Button>

        </ModalBody>
        <ModalFooter className="modal-footer">
          <Button color="info" outline onClick={()=>this.submitReferences()}>{this.state.addingReferenceBtn}</Button>
          <Button color="secondary" outline onClick={()=>this.toggleModal('addTemporalModal')} className="pull-left">Cancel</Button>
        </ModalFooter>
      </Modal>
    )
  }
}
