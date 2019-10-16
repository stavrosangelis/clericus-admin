import React, { Component } from 'react';
import { Spinner, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';

import axios from 'axios';

import ViewResource from '../components/view-resource';
import AddRelation from '../components/add-relations';

import {Redirect} from 'react-router-dom';

import {parseReferenceLabels,parseReferenceTypes} from '../helpers/helpers';

import {connect} from "react-redux";
const APIPath = process.env.REACT_APP_APIPATH;
const mapStateToProps = state => {
  return {
    entitiesLoaded: state.entitiesLoaded,
    resourceEntity: state.resourceEntity,
    systemTypes: state.systemTypes
   };
};

class Resource extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reload: false,
      loading: true,
      resource: null,
      systemType: null,
      newId: null,
      redirect: false,
      redirectReload: false,
      deleteModal: false,
      updating: false,
      updateBtn: <span><i className="fa fa-save" /> Update</span>,
      errorVisible: false,
      errorText: [],
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
        addReferencesVisible: false
      })
    }
    else {
      let params = {_id:_id}
      axios({
          method: 'get',
          url: APIPath+'resource',
          crossDomain: true,
          params: params
        })
    	  .then(function (response) {
          let responseData = response.data.data;
          context.setState({
            loading: false,
            resource: responseData,
            systemType: responseData.systemType,
            reload: false,
          });
    	  })
    	  .catch(function (error) {
    	  });
    }
  }

  loadReferenceLabelsNTypes() {
    let properties = this.props.resourceEntity.properties;
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
      if (this.state.resource!==null && typeof this.state.resource._id!=="undefined") {
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
      updating: true,
      updateBtn: <span><i className="fa fa-save" /> <i>Saving...</i> <Spinner color="info" size="sm"/></span>
    })
    let resource = this.state.resource;
    resource.label = newData.label;
    resource.systemType = newData.systemType;
    resource.description = newData.description;

    let postData = {
      resource: resource
    }
    let context = this;
    axios({
      method: 'post',
      url: APIPath+'resource',
      crossDomain: true,
      data: postData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
    .then(function (response) {
      context.setState({
        updating: false,
        updateBtn: <span><i className="fa fa-save" /> Update success <i className="fa fa-check" /></span>
      });

      setTimeout(function() {
        context.setState({
          updateBtn: <span><i className="fa fa-save" /> Update success</span>
        });
      },2000);
    })
    .catch(function (error) {
    });
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
        loading: false,
        systemType: 'thumbnail'
      })
    }
    else {
      axios({
          method: 'delete',
          url: APIPath+'resource?_id='+_id,
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
    if (this.props.match.params._id==="new" && this.state.systemType===null && this.props.systemTypes.length>0) {
      let defaultSystemType = this.props.systemTypes.find(item=>item.labelId==="Thumbnail");
      this.setState({
        systemType: {ref:defaultSystemType._id},
      })
    }
  }

  render() {
    let label = '';
    if (this.state.resource!==null && typeof this.state.resource.label!=="undefined") {
      label = this.state.resource.label;
    }
    let heading = label;
    if (this.props.match.params._id==="new") {
      heading = "Add new resource";
    }
    let breadcrumbsItems = [
      {label: "Resources", icon: "pe-7s-photo", active: false, path: "/resources"},
      {label: heading, icon: "pe-7s-photo", active: true, path: ""}
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
      let viewComponent = <ViewResource
        resource={this.state.resource}
        file={label}
        delete={this.toggleDeleteModal}
        uploadResponse={this.uploadResponse}
        update={this.update}
        updateBtn={this.state.updateBtn}
        errorVisible={this.state.errorVisible}
        errorText={this.state.errorText}
        closeUploadModal={this.state.closeUploadModal}
        reload={this.reload}
        systemType={this.state.systemType}
        />;
      content = <div className="resources-container">
          {viewComponent}
      </div>
      if (this.state.redirect) {
        redirectElem = <Redirect to="/resources" />;
      }
      if (this.state.redirectReload) {
        redirectReload = <Redirect to={"/resource/"+this.state.newId} />;
      }

      deleteModal = <Modal isOpen={this.state.deleteModal} toggle={this.toggleDeleteModal} className={this.props.className}>
          <ModalHeader toggle={this.toggleDeleteModal}>Delete "{label}"</ModalHeader>
          <ModalBody>
          The resource "{label}" will be deleted. Continue?
          </ModalBody>
          <ModalFooter className="text-left">
            <Button className="pull-right" color="danger" outline onClick={this.delete}><i className="fa fa-trash-o" /> Delete</Button>
            <Button color="secondary" onClick={this.toggleDeleteModal}>Cancel</Button>
          </ModalFooter>
        </Modal>;
    }
    let relationReference = {
      type: "Resource",
      ref: this.props.match.params._id
    };
    let addRelation = [];
    if (this.state.resource!==null) {
      addRelation = <AddRelation
        reload={this.reload}
        reference={relationReference}
        item={this.state.resource}
        referencesLabels={this.state.referencesLabels}
        referencesTypes={this.state.referencesTypes}
        type="resource"
        />
    }
    return(
      <div>
        {redirectElem}
        {redirectReload}
        <Breadcrumbs items={breadcrumbsItems} />
        <div className="row">
          <div className="col-12">
            <h2>Resource "{heading}"</h2>
          </div>
        </div>
        {content}
        {addRelation}
        {deleteModal}
      </div>
    );
  }
}
export default Resource = connect(mapStateToProps, [])(Resource);
