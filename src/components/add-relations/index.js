import React, { Component } from 'react';
import {
  UncontrolledButtonDropdown, DropdownMenu, DropdownItem, DropdownToggle,
} from 'reactstrap';

import AddEventModal from './add-event';
import AddOrganisationModal from './add-organisation';
import AddPersonModal from './add-person';
import AddResourceModal from './add-resource';

import {connect} from "react-redux";
const mapStateToProps = state => {
  return {
    entitiesLoaded: state.entitiesLoaded,
    eventEntity: state.eventEntity,
    organisationEntity: state.organisationEntity,
    personEntity: state.personEntity,
    resourceEntity: state.resourceEntity,
    peopleRoles: state.peopleRoles,
   };
};

class AddReference extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addEventModal: false,
      addOrganisationModal: false,
      addPersonModal: false,
      addResourceModal: false,
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
    if (typeof this.props.referencesLabels!=="undefined") {
      let referencesLabels = this.props.referencesLabels;
      if (referencesLabels.indexOf("Event")===-1) {
        eventVisible = "hidden";
      }
      if (referencesLabels.indexOf("Organisation")===-1) {
        organisationVisible = "hidden";
      }
      if (referencesLabels.indexOf("Person")===-1) {
        personVisible = "hidden";
      }
      if (referencesLabels.indexOf("Resource")===-1) {
        resourceVisible = "hidden";
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
          </DropdownMenu>
        </UncontrolledButtonDropdown>

        <AddEventModal
          item={this.props.item}
          type={this.props.type}
          refTypes={this.props.referencesTypes.event}
          reload={this.props.reload}
          toggleModal={this.toggleModal}
          reference={this.props.reference}
          visible={this.state.addEventModal} />

        <AddOrganisationModal
          item={this.props.item}
          type={this.props.type}
          refTypes={this.props.referencesTypes.organisation}
          reload={this.props.reload}
          toggleModal={this.toggleModal}
          reference={this.props.reference}
          visible={this.state.addOrganisationModal} />

        <AddPersonModal
          item={this.props.item}
          type={this.props.type}
          refTypes={this.props.referencesTypes.person}
          reload={this.props.reload}
          toggleModal={this.toggleModal}
          reference={this.props.reference}
          visible={this.state.addPersonModal} />

        <AddResourceModal
          item={this.props.item}
          type={this.props.type}
          peopleRoles={this.props.peopleRoles}
          refTypes={this.props.referencesTypes.resource}
          reload={this.props.reload}
          toggleModal={this.toggleModal}
          reference={this.props.reference}
          visible={this.state.addResourceModal} />
      </div>
    )
  }
}
export default AddReference = connect(mapStateToProps, [])(AddReference);
