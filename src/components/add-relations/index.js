import React, { Component } from 'react';
import {
  UncontrolledButtonDropdown, DropdownMenu, DropdownItem, DropdownToggle,
} from 'reactstrap';

import AddEventModal from './add-event';
import AddOrganisationModal from './add-organisation';
import AddPersonModal from './add-person';
import AddResourceModal from './add-resource';
import AddTemporalModal from './add-temporal';
import AddSpatialModal from './add-spatial';

import {connect} from "react-redux";
const mapStateToProps = state => {
  return {
    entitiesLoaded: state.entitiesLoaded,
    peopleRoles: state.peopleRoles,
   };
};

class AddRelation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addEventModal: false,
      addOrganisationModal: false,
      addPersonModal: false,
      addResourceModal: false,
      addTemporalModal: false,
      addSpatialModal: false,
      entitiesLoaded: false,
    }
    this.toggleModal = this.toggleModal.bind(this);
  }

  toggleModal(modal) {
    this.setState({
      [modal]: !this.state[modal]
    });
  }

  render() {
    let eventVisible = "";
    let organisationVisible = "";
    let personVisible = "";
    let resourceVisible = "";
    let temporalVisible = "";
    let spatialVisible = "";

    let eventModal = <AddEventModal
      item={this.props.item}
      type={this.props.type}
      refTypes={this.props.referencesTypes.event}
      reload={this.props.reload}
      toggleModal={this.toggleModal}
      reference={this.props.reference}
      visible={this.state.addEventModal} />

    let organisationModal = <AddOrganisationModal
      item={this.props.item}
      type={this.props.type}
      refTypes={this.props.referencesTypes.organisation}
      reload={this.props.reload}
      toggleModal={this.toggleModal}
      reference={this.props.reference}
      visible={this.state.addOrganisationModal} />

    let personModal = <AddPersonModal
      item={this.props.item}
      type={this.props.type}
      refTypes={this.props.referencesTypes.person}
      reload={this.props.reload}
      toggleModal={this.toggleModal}
      reference={this.props.reference}
      visible={this.state.addPersonModal} />

    let resourceModal = <AddResourceModal
      item={this.props.item}
      type={this.props.type}
      peopleRoles={this.props.peopleRoles}
      refTypes={this.props.referencesTypes.resource}
      reload={this.props.reload}
      toggleModal={this.toggleModal}
      reference={this.props.reference}
      visible={this.state.addResourceModal} />

    let temporalModal = <AddTemporalModal
      item={this.props.item}
      type={this.props.type}
      refTypes={this.props.referencesTypes.temporal}
      reload={this.props.reload}
      toggleModal={this.toggleModal}
      reference={this.props.reference}
      visible={this.state.addTemporalModal} />

    let spatialModal = <AddSpatialModal
      item={this.props.item}
      type={this.props.type}
      refTypes={this.props.referencesTypes.spatial}
      reload={this.props.reload}
      toggleModal={this.toggleModal}
      reference={this.props.reference}
      visible={this.state.addSpatialModal} />

    if (typeof this.props.referencesLabels!=="undefined") {
      let referencesLabels = this.props.referencesLabels;
      if (referencesLabels.indexOf("Event")===-1) {
        eventVisible = "hidden";
        eventModal = [];
      }
      if (referencesLabels.indexOf("Organisation")===-1) {
        organisationVisible = "hidden";
        organisationModal = [];
      }
      if (referencesLabels.indexOf("Person")===-1) {
        personVisible = "hidden";
        personModal = [];
      }
      if (referencesLabels.indexOf("Resource")===-1) {
        resourceVisible = "hidden";
        resourceModal = [];
      }
      if (referencesLabels.indexOf("Temporal")===-1) {
        temporalVisible = "hidden";
        temporalModal = [];
      }
      if (referencesLabels.indexOf("Spatial")===-1) {
        spatialVisible = "hidden";
        spatialModal = [];
      }
    }



    return (
      <div>
        <UncontrolledButtonDropdown className="add-reference-group">
          <DropdownToggle className="add-reference-btn" outline color="secondary">
            <i className="fa fa-plus" />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Add relations</DropdownItem>
            <DropdownItem className={eventVisible} onClick={()=>this.toggleModal('addEventModal')}>Add event</DropdownItem>
            <DropdownItem className={organisationVisible} onClick={()=>this.toggleModal('addOrganisationModal')}>Add organisation</DropdownItem>
            <DropdownItem className={personVisible} onClick={()=>this.toggleModal('addPersonModal')}>Add person</DropdownItem>
            <DropdownItem className={resourceVisible} onClick={()=>this.toggleModal('addResourceModal')}>Add resource</DropdownItem>
            <DropdownItem className={temporalVisible} onClick={()=>this.toggleModal('addTemporalModal')}>Add temporal</DropdownItem>
            <DropdownItem className={spatialVisible} onClick={()=>this.toggleModal('addSpatialModal')}>Add spatial</DropdownItem>
          </DropdownMenu>
        </UncontrolledButtonDropdown>
        {eventModal}
        {organisationModal}
        {personModal}
        {resourceModal}
        {temporalModal}
        {spatialModal}


      </div>
    )
  }
}
export default AddRelation = connect(mapStateToProps, [])(AddRelation);
