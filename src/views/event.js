import React, { Component } from 'react';
import { Spinner, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';

import axios from 'axios';

import ViewEvent from '../components/view-event';
import AddRelation from '../components/add-relations';

import {Redirect} from 'react-router-dom';

import {parseReferenceLabels,parseReferenceTypes} from '../helpers/helpers';

import {connect} from "react-redux";
const mapStateToProps = state => {
  return {
    entitiesLoaded: state.entitiesLoaded,
    eventEntity: state.eventEntity,
    eventTypes: state.eventTypes,
   };
};

const APIPath = process.env.REACT_APP_APIPATH;

class Event extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reload: false,
      loading: true,
      item: null,
      systemType: null,
      newId: null,
      redirect: false,
      redirectReload: false,
      deleteModal: false,
      updating: false,
      updateBtn: <span><i className="fa fa-save" /> Update</span>,
      errorVisible: false,
      errorText: [],

      addReferencesVisible: true,
      referencesLoaded: false,
      referencesLabels: [],
      referencesTypes: {
        event: [],
        organisation: [],
        person: [],
        resource: [],
        temporal: [],
        spatial: [],
      },
    }
    this.load = this.load.bind(this);
    this.loadReferenceLabelsNTypes = this.loadReferenceLabelsNTypes.bind(this);
    this.update = this.update.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.delete = this.delete.bind(this);
    this.reload = this.reload.bind(this);
  }

  async load() {
    let _id = this.props.match.params._id;
    if (_id==="new") {
      this.setState({
        loading: false,
        addReferencesVisible: false
      })
    }
    else {
      let params = {_id:_id}
      let responseData = await axios({
        method: 'get',
        url: APIPath+'event',
        crossDomain: true,
        params: params
      })
  	  .then(function (response) {
        return response.data.data;
  	  })
  	  .catch(function (error) {
        console.log(error);
  	  });
      this.setState({
        loading: false,
        item: responseData,
        reload: false,
      });
    }
  }

  loadReferenceLabelsNTypes() {
    let properties = this.props.eventEntity.properties;
    let referencesLabels = parseReferenceLabels(properties);
    let referencesTypes = parseReferenceTypes(properties);
    this.setState({
      referencesLabels: referencesLabels,
      referencesTypes: referencesTypes,
      referencesLoaded: true,
    })
  }

  update(newData) {
    if (this.state.updating) {
      return false;
    }
    this.setState({
      updateBtn: <span><i className="fa fa-save" /> <i>Saving...</i> <Spinner color="info" size="sm"/></span>,
      updating: true
    });
    let postData = {
      label: newData.label,
      description: newData.description,
      eventType: newData.eventType.value,
      status: newData.status,
    }
    let _id = this.props.match.params._id;
    if (_id!=="new") {
      postData._id = _id;
    }
    let isValid = this.validateEvent(postData);
    if (isValid) {
      let context = this;
      axios({
          method: 'put',
          url: APIPath+'event',
          crossDomain: true,
          data: postData
        })
      .then(function (response) {
        let responseData = response.data;
        let newState = {
          updating: false,
          updateBtn: <span><i className="fa fa-save" /> Update success <i className="fa fa-check" /></span>,
          reload: true
        };
        if (_id==="new") {
          newState.redirectReload = true;
          newState.newId = responseData.data._id;
        }
        context.setState(newState);

        setTimeout(function() {
          context.setState({
            updateBtn: <span><i className="fa fa-save" /> Update</span>
          });
        },2000);
      })
      .catch(function (error) {
      });
    }
  }

  validateEvent(postData) {
    if (postData.label==="") {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: <div>Please enter the event <b>Label</b> to continue!</div>,
        updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
      });
      return false;
    }
    if (typeof postData.eventType==="undefined" || postData.eventType==="") {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: <div>Please enter the <b>Type of event</b> to continue!</div>,
        updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
      });
      return false;
    }
    this.setState({
      updating: false,
      errorVisible: false,
      errorText: []
    })
    return true;
  }

  toggleDeleteModal() {
    this.setState({
      deleteModal: !this.state.deleteModal
    })
  }

  async delete() {
    let _id = this.props.match.params._id;
    if (_id==="new") {
      this.setState({
        loading: false
      })
    }
    else {
      let responseData = await axios({
        method: 'delete',
        url: APIPath+'event?_id='+_id,
        crossDomain: true,
      })
  	  .then(function (response) {
        return response.data;
  	  })
  	  .catch(function (error) {
  	  });

      if (responseData.status) {
        this.setState({
          redirect: true
        });
      }
    }

  }

  reload() {
    this.setState({
      reload: true
    })
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.match.params._id!==this.props.match.params._id){
      this.load();
    }
    if (this.state.reload) {
      this.load();
    }
    if (this.state.redirect) {
      this.setState({
        redirect: false
      })
    }
    if (this.state.redirectReload) {
      this.setState({
        redirectReload: false
      })
    }
    if (this.state.closeUploadModal) {
      this.setState({
        closeUploadModal: false
      })
    }
    if (this.props.entitiesLoaded && !this.state.referencesLoaded) {
      this.loadReferenceLabelsNTypes();
    }
  }

  render() {
    let label = '';
    if (this.state.item!==null && typeof this.state.item.label!=="undefined") {
      label = this.state.item.label;
    }
    let heading = label;
    if (this.props.match.params._id==="new") {
      heading = "Add new event";
    }
    let breadcrumbsItems = [
      {label: "Events", icon: "pe-7s-date", active: false, path: "/events"},
      {label: heading, icon: "", active: true, path: ""}
    ];

    let redirectElem = [];
    let redirectReload = [];
    let deleteModal = [];

    let content = <div className="row">
      <div className="col-12">
        <div style={{padding: '40pt',textAlign: 'center'}}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
    if (!this.state.loading) {
      let viewComponent = <ViewEvent
        delete={this.toggleDeleteModal}
        errorText={this.state.errorText}
        errorVisible={this.state.errorVisible}
        eventTypes={this.props.eventTypes}
        item={this.state.item}
        reload={this.reload}
        update={this.update}
        updateBtn={this.state.updateBtn}
        />;
      content = <div className="items-container">
          {viewComponent}
      </div>
      if (this.state.redirect) {
        redirectElem = <Redirect to="/events" />;
      }
      if (this.state.redirectReload) {
        redirectReload = <Redirect to={"/event/"+this.state.newId} />;
      }

      deleteModal = <Modal isOpen={this.state.deleteModal} toggle={this.toggleDeleteModal} className={this.props.className}>
          <ModalHeader toggle={this.toggleDeleteModal}>Delete "{label}"</ModalHeader>
          <ModalBody>
          The item "{label}" will be deleted. Continue?
          </ModalBody>
          <ModalFooter className="text-right">
            <Button size="sm" color="danger" outline onClick={this.delete}><i className="fa fa-trash-o" /> Delete</Button>
            <Button className="pull-left" color="secondary" size="sm" onClick={this.toggleDeleteModal}>Cancel</Button>
          </ModalFooter>
        </Modal>;
    }
    let relationReference = {
      type: "Event",
      ref: this.props.match.params._id
    };
    let addRelation = [];
    if (this.state.item!==null) {

      addRelation = <AddRelation
        reload={this.reload}
        reference={relationReference}
        item={this.state.item}
        referencesLabels={this.state.referencesLabels}
        referencesTypes={this.state.referencesTypes}
        type="event"
      />
    }
    return(
      <div>
        {redirectElem}
        {redirectReload}
        <Breadcrumbs items={breadcrumbsItems} />
        <div className="row">
          <div className="col-12">
            <h2>{heading}</h2>
          </div>
        </div>
        {content}
        {addRelation}
        {deleteModal}
      </div>
    );
  }
}
export default Event = connect(mapStateToProps, [])(Event);
