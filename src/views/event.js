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
      deleteBtn: <span><i className="fa fa-trash-o" /> Delete</span>,
      closeUploadModal: false,

      addReferencesVisible: true,
      referencesLoaded: false,
      referencesLabels: [],
      referencesTypes: {
        event: [],
        organisation: [],
        person: [],
        resource: [],
      },
    }
    this.load = this.load.bind(this);
    this.loadReferenceLabelsNTypes = this.loadReferenceLabelsNTypes.bind(this);
    this.uploadResponse = this.uploadResponse.bind(this);
    this.update = this.update.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.delete = this.delete.bind(this);
    this.reload = this.reload.bind(this);
  }

  load() {
    let context = this;
    let _id = this.props.match.params._id;
    if (_id==="new") {
      this.setState({
        loading: false,
        systemType: 'thumbnail',
        addReferencesVisible: false
      })
    }
    else {
      let params = {_id:_id}
      axios({
        method: 'get',
        url: APIPath+'event',
        crossDomain: true,
        params: params
      })
  	  .then(function (response) {
        let responseData = response.data.data;
        context.setState({
          loading: false,
          item: responseData,
          reload: false,
        });
  	  })
  	  .catch(function (error) {
        console.log(error);
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

  uploadResponse(data) {
    if (data.status) {
      if (this.state.newId===null) {
        this.setState({
          newId: data.data._id,
          redirectReload: true,
          errorVisible: false,
          errorText: []
        })
      }
      if (typeof this.state.item._id!=="undefined") {
        this.setState({
          closeUploadModal: true
        })
      }
    }
    else {
      let errorText = [];
      if (typeof data.error!=="undefined" && data.error.length>0) {
        let i=0;
        for (let key in data.error) {
          errorText.push(<div key={i}>{data.error[key]}</div>);
          i++;
        }
      }

      this.setState({
        errorVisible: true,
        errorText: errorText
      })
    }
  }

  update(newData) {
    if (this.state.updating) {
      return false;
    }
    this.setState({
      updateBtn: <span><i className="fa fa-save" /> <i>Saving...</i> <Spinner color="info" size="sm"/></span>,
      updating: true
    })
    let temporalData = null;
    if (newData.eventTimeLabel!=="") {
      temporalData = {
        label: newData.eventTimeLabel,
        startDate: newData.eventTimeStartDate,
        endDate: newData.eventTimeEndDate,
        format: newData.eventTimeFormat,
      };
      if (newData.eventTimeId!=="") {
        temporalData._id = newData.eventTimeId;
      }
    }
    let spatialData = null;
    if (newData.eventLocationLabel!=="") {
      spatialData = {
        label: newData.eventLocationLabel,
        streetAddress: newData.eventLocationStreetAddress,
        locality: newData.eventLocationLocality,
        region: newData.eventLocationRegion,
        postalCode: newData.eventLocationPostalCode,
        country: newData.eventLocationCountry,
        coordinates: {
          latitude: newData.eventLocationLatitude,
          longitude: newData.eventLocationLongitude,
        },
        locationType: newData.eventLocationType,
      };
    }
    let postData = {
      label: newData.eventLabel,
      description: newData.eventDescription,
      eventType: newData.eventType.value,
      temporal: temporalData,
      spatial: spatialData,
    }
    let _id = this.props.match.params._id;
    if (_id!=="new") {
      postData._id = _id;
    }
    let isValid = this.validateEvent(postData);
    if (isValid) {
      let context = this;
      axios({
          method: 'post',
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
    if (postData.temporal!==null) {
      if (postData.temporal.label==="") {
        this.setState({
          updating: false,
          errorVisible: true,
          errorText: <div>Please enter the <b>Event Time Label</b> to continue!</div>,
          updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
        });
        return false;
      }
    }
    if (postData.spatial!==null) {
      if (this.state.label==="") {
        this.setState({
          updating: false,
          errorVisible: true,
          errorText: <div>Please enter the <b>Event Time Label</b> to continue!</div>,
          updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
        });
        return false;
      }
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

  delete() {
    let context = this;
    let _id = this.props.match.params._id;
    if (_id==="new") {
      this.setState({
        loading: false
      })
    }
    else {
      axios({
          method: 'delete',
          url: APIPath+'event?_id='+_id,
          crossDomain: true,
        })
    	  .then(function (response) {
          let responseData = response.data.data;
          if (responseData.data.ok===1) {
            context.setState({
              redirect: true
            });
          }
    	  })
    	  .catch(function (error) {
    	  });
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
    let heading = "Event \""+label+"\"";
    if (this.props.match.params._id==="new") {
      heading = "Add new event";
    }
    let breadcrumbsItems = [
      {label: "Events", icon: "pe-7s-date", active: false, path: "/events"},
      {label: heading, icon: "pe-7s-date", active: true, path: ""}
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
        item={this.state.item}
        file={label}
        delete={this.toggleDeleteModal}
        uploadResponse={this.uploadResponse}
        update={this.update}
        updateBtn={this.state.updateBtn}
        deleteBtn={this.state.deleteBtn}
        errorVisible={this.state.errorVisible}
        errorText={this.state.errorText}
        closeUploadModal={this.state.closeUploadModal}
        reload={this.reload}
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
            <Button className="pull-left" color="danger" outline onClick={this.delete}><i className="fa fa-trash-o" /> Delete</Button>
            <Button color="secondary" onClick={this.toggleDeleteModal}>Cancel</Button>
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
