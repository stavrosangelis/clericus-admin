import React, { Component } from 'react';
import {
  Spinner,
  Button,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';

import axios from 'axios';
import {APIPath} from '../static/constants';

import ViewOrganisation from '../components/view-organisation';
import AddRelation from '../components/add-relations';

import {Redirect} from 'react-router-dom';

import {parseReferenceLabels,parseReferenceTypes} from '../helpers/helpers';

import {connect} from "react-redux";
const mapStateToProps = state => {
  return {
    entitiesLoaded: state.entitiesLoaded,
    organisationEntity: state.organisationEntity,
   };
};

class Organisation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reload: false,
      loading: true,
      organisation:null,
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
    this.validateOrganisation = this.validateOrganisation.bind(this);
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
      let params = {
        _id:_id
      }
      axios({
        method: 'get',
        url: APIPath+'organisation',
        crossDomain: true,
        params: params
      })
  	  .then(function (response) {
        let responseData = response.data;
        let organisation = responseData.data;
        context.setState({
          loading: false,
          reload: false,
          organisation: organisation
        });

  	  })
  	  .catch(function (error) {
        console.log(error)
  	  });
    }
  }

  loadReferenceLabelsNTypes() {
    let properties = this.props.organisationEntity.properties;
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
      if (typeof this.state.organisation._id!=="undefined") {
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
    let postData = {
      label: newData.label,
    }
    let _id = this.props.match.params._id;
    if (_id!=="new") {
      postData._id = _id;
    }
    let isValid = this.validateOrganisation(postData);
    if (isValid) {
      let context = this;
      axios({
        method: 'post',
        url: APIPath+'organisation',
        crossDomain: true,
        data: postData
      })
      .then(function (response) {
        let responseData = response.data.data;
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

  validateOrganisation(postData) {
    if (postData.label.length<2) {
      this.setState({
        updating: false,
        errorVisible: true,
        errorText: <div>The organisation <b>label</b> must contain at least two (2) characters</div>,
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
    if (_id==="new") {
      this.setState({
        loading: false
      })
    }
    else {
      let params = {_id: _id};
      axios({
          method: 'delete',
          url: APIPath+'organisation',
          crossDomain: true,
          params: params
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

  componentDidUpdate(prevProps) {
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
    if (this.state.organisation!==null && typeof this.state.organisation.label!=="undefined") {
      label = this.state.organisation.label;
    }

    let heading = "Organisation \""+label+"\"";
    if (this.props.match.params._id==="new") {
      heading = "Add new organisation";
    }
    let breadcrumbsItems = [
      {label: "Organisations", icon: "pe-7s-culture", active: false, path: "/organisations"},
      {label: heading, icon: "pe-7s-culture", active: true, path: ""}
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
          <ViewOrganisation
            organisation={this.state.organisation}
            reload={this.reload}
            label={label}
            delete={this.toggleDeleteModal}
            uploadResponse={this.uploadResponse}
            update={this.update}
            updateBtn={this.state.updateBtn}
            errorVisible={this.state.errorVisible}
            errorText={this.state.errorText}
            closeUploadModal={this.state.closeUploadModal}
            />
      </div>

      if (this.state.redirect) {
        redirectElem = <Redirect to="/organisations" />;
      }
      if (this.state.redirectReload) {
        redirectReload = <Redirect to={"/organisation/"+this.state.newId} />;
      }

      deleteModal = <Modal isOpen={this.state.deleteModal} toggle={this.toggleDeleteModal} className={this.props.className}>
          <ModalHeader toggle={this.toggleDeleteModal}>Delete "{label}"</ModalHeader>
          <ModalBody>
          The organisation "{label}" will be deleted. Continue?
          </ModalBody>
          <ModalFooter className="text-right">
            <Button className="pull-left" color="danger" outline onClick={this.delete}><i className="fa fa-trash-o" /> Delete</Button>
            <Button color="secondary" onClick={this.toggleDeleteModal}>Cancel</Button>
          </ModalFooter>
        </Modal>;
    }

    let relationReference = {
      type: "Organisation",
      ref: this.props.match.params._id
    };
    let addRelation = [];
    if (this.state.item!==null) {
      addRelation = <AddRelation
        reload={this.reload}
        reference={relationReference}
        item={this.state.organisation}
        referencesLabels={this.state.referencesLabels}
        referencesTypes={this.state.referencesTypes}
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
export default Organisation = connect(mapStateToProps, [])(Organisation);
