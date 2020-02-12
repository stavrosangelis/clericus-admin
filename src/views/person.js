import React, { Component } from 'react';
import {
  Spinner,
  Button,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';

import axios from 'axios';

import ViewPerson from '../components/view-person';
import AddRelation from '../components/add-relations';

import {Redirect} from 'react-router-dom';

import {parseReferenceLabels,parseReferenceTypes} from '../helpers/helpers';

import {connect} from "react-redux";
const APIPath = process.env.REACT_APP_APIPATH;

const mapStateToProps = state => {
  return {
    entitiesLoaded: state.entitiesLoaded,
    personEntity: state.personEntity,
   };
};

class Person extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reload: false,
      loading: true,
      person:null,
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
    this.validatePerson = this.validatePerson.bind(this);
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
    let params = {_id: _id};
    let personData = await axios({
        method: 'get',
        url: APIPath+'person',
        crossDomain: true,
        params: params
      })
  	  .then(function (response) {
        return response.data.data;
  	  })
  	  .catch(function (error) {
  	  });
      this.setState({
        loading: false,
        reload: false,
        person: personData
      });
    }
  }

  loadReferenceLabelsNTypes() {
    let properties = this.props.personEntity.properties;
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
      if (typeof this.state.person._id!=="undefined") {
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
    let postData = this.state.person;
    if (this.state.person===null) {
      postData = {};
    }
    postData.honorificPrefix = newData.honorificPrefix;
    postData.firstName = newData.firstName;
    postData.middleName = newData.middleName;
    postData.lastName = newData.lastName;
    postData.alternateAppelations = newData.alternateAppelations;
    postData.description = newData.description;
    postData.status = newData.status;
    let _id = this.props.match.params._id;
    if (_id!=="new") {
      postData._id = _id;
    }
    else {
      delete postData._id;
    }
    let isValid = this.validatePerson(postData);
    if (isValid) {
      let context = this;
      axios({
        method: 'put',
        url: APIPath+'person',
        crossDomain: true,
        data: postData
      })
      .then(function (response) {
        let responseData = response.data;
        if (responseData.status) {
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
        }
        else {
          let errorText = [];
          for (let i=0; i<responseData.errors.length; i++) {
            let error = responseData.errors[i];
            errorText.push(<div key={i}>{error.msg}</div>)
          }
          context.setState({
            errorVisible: true,
            errorText: errorText,
            updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>,
          });
        }
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

  validatePerson(postData) {
    if (postData.firstName.length<2) {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: <div>The person's <b>firstName</b> must contain at least two (2) characters</div>,
        updateBtn: <span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>
      });
      return false;
    }
    if (postData.lastName.length<2) {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: <div>The person's <b>lastName</b> must contain at least two (2) characters</div>,
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

  delete() {
    let context = this;
    let _id = this.props.match.params._id;
    let params = {_id: _id};
    axios({
      method: 'delete',
      url: APIPath+'person',
      crossDomain: true,
      params: params
    })
    .then(function (response) {
      let responseData = response.data;
      if (responseData.status) {
        context.setState({
          redirect: true
        });
      }
    })
    .catch(function (error) {
    });
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
    if (this.state.loading) {
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
    if (this.state.person!==null && typeof this.state.person.firstName!=="undefined") {
      label = this.state.person.firstName;
      if (this.state.person.lastName!=="") {
        label += " "+this.state.person.lastName;
      }
    }

    let heading = label;
    if (this.props.match.params._id==="new") {
      heading = "Add new person";
    }
    let breadcrumbsItems = [
      {label: "People", icon: "pe-7s-users", active: false, path: "/people"},
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
      content = <div className="items-container">
          <ViewPerson
            person={this.state.person}
            label={label}
            delete={this.toggleDeleteModal}
            uploadResponse={this.uploadResponse}
            update={this.update}
            updateBtn={this.state.updateBtn}
            errorVisible={this.state.errorVisible}
            errorText={this.state.errorText}
            closeUploadModal={this.state.closeUploadModal}
            reload={this.reload}
            />
      </div>

      if (this.state.redirect) {
        redirectElem = <Redirect to="/people" />;
      }
      if (this.state.redirectReload) {
        redirectReload = <Redirect to={"/person/"+this.state.newId} />;
      }

      deleteModal = <Modal isOpen={this.state.deleteModal} toggle={this.toggleDeleteModal} className={this.props.className}>
          <ModalHeader toggle={this.toggleDeleteModal}>Delete "{label}"</ModalHeader>
          <ModalBody>
          The person "{label}" will be deleted. Continue?
          </ModalBody>
          <ModalFooter className="text-left">
            <Button className="pull-right" color="danger" size="sm" outline onClick={this.delete}><i className="fa fa-trash-o" /> Delete</Button>
            <Button color="secondary" size="sm" onClick={this.toggleDeleteModal}>Cancel</Button>
          </ModalFooter>
        </Modal>;
    }

    let relationReference = {
      type: "Person",
      ref: this.props.match.params._id
    };

    let addRelation = [];
    if (this.state.person!==null) {
      addRelation = <AddRelation
        reload={this.reload}
        reference={relationReference}
        item={this.state.person}
        referencesLabels={this.state.referencesLabels}
        referencesTypes={this.state.referencesTypes}
        type="person"
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
export default Person = connect(mapStateToProps, [])(Person);
