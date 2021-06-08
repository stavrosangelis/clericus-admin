import React, { Component } from 'react';
import {
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from 'reactstrap';

import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import AddEventModal from './add-event';
import AddOrganisationModal from './add-organisation';
import AddPersonModal from './add-person';
import AddResourceModal from './add-resource';
import AddTemporalModal from './add-temporal';
import AddSpatialModal from './add-spatial';

const mapStateToProps = (state) => ({
  entitiesLoaded: state.entitiesLoaded,
  peopleRoles: state.peopleRoles,
});

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
    };
    this.toggleModal = this.toggleModal.bind(this);
  }

  toggleModal(modal) {
    const { [modal]: value } = this.state;
    this.setState({
      [modal]: !value,
    });
  }

  render() {
    const {
      item,
      type,
      referencesTypes,
      reload,
      reference,
      peopleRoles,
      referencesLabels,
    } = this.props;
    const {
      addEventModal,
      addOrganisationModal,
      addPersonModal,
      addResourceModal,
      addTemporalModal,
      addSpatialModal,
    } = this.state;
    let eventVisible = '';
    let organisationVisible = '';
    let personVisible = '';
    let resourceVisible = '';
    let temporalVisible = '';
    let spatialVisible = '';

    let eventModal = (
      <AddEventModal
        item={item}
        type={type}
        refTypes={referencesTypes.event}
        reload={reload}
        toggleModal={this.toggleModal}
        reference={reference}
        visible={addEventModal}
      />
    );

    let organisationModal = (
      <AddOrganisationModal
        item={item}
        type={type}
        refTypes={referencesTypes.organisation}
        reload={reload}
        toggleModal={this.toggleModal}
        reference={reference}
        visible={addOrganisationModal}
      />
    );

    let personModal = (
      <AddPersonModal
        item={item}
        type={type}
        refTypes={referencesTypes.person}
        reload={reload}
        toggleModal={this.toggleModal}
        reference={reference}
        visible={addPersonModal}
      />
    );

    let resourceModal = (
      <AddResourceModal
        item={item}
        type={type}
        peopleRoles={peopleRoles}
        refTypes={referencesTypes.resource}
        reload={reload}
        toggleModal={this.toggleModal}
        reference={reference}
        visible={addResourceModal}
      />
    );

    let temporalModal = (
      <AddTemporalModal
        item={item}
        type={type}
        refTypes={referencesTypes.temporal}
        reload={reload}
        toggleModal={this.toggleModal}
        reference={reference}
        visible={addTemporalModal}
      />
    );

    let spatialModal = (
      <AddSpatialModal
        item={item}
        type={type}
        refTypes={referencesTypes.spatial}
        reload={reload}
        toggleModal={this.toggleModal}
        reference={reference}
        visible={addSpatialModal}
      />
    );

    if (typeof referencesLabels !== 'undefined') {
      if (referencesLabels.indexOf('Event') === -1) {
        eventVisible = 'hidden';
        eventModal = [];
      }
      if (referencesLabels.indexOf('Organisation') === -1) {
        organisationVisible = 'hidden';
        organisationModal = [];
      }
      if (referencesLabels.indexOf('Person') === -1) {
        personVisible = 'hidden';
        personModal = [];
      }
      if (referencesLabels.indexOf('Resource') === -1) {
        resourceVisible = 'hidden';
        resourceModal = [];
      }
      if (referencesLabels.indexOf('Temporal') === -1) {
        temporalVisible = 'hidden';
        temporalModal = [];
      }
      if (referencesLabels.indexOf('Spatial') === -1) {
        spatialVisible = 'hidden';
        spatialModal = [];
      }
    }

    return (
      <div>
        <UncontrolledButtonDropdown className="add-reference-group">
          <DropdownToggle
            className="add-reference-btn"
            outline
            color="secondary"
          >
            <i className="fa fa-plus" />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Add relations</DropdownItem>
            <DropdownItem
              className={eventVisible}
              onClick={() => this.toggleModal('addEventModal')}
            >
              Add event
            </DropdownItem>
            <DropdownItem
              className={organisationVisible}
              onClick={() => this.toggleModal('addOrganisationModal')}
            >
              Add organisation
            </DropdownItem>
            <DropdownItem
              className={personVisible}
              onClick={() => this.toggleModal('addPersonModal')}
            >
              Add person
            </DropdownItem>
            <DropdownItem
              className={resourceVisible}
              onClick={() => this.toggleModal('addResourceModal')}
            >
              Add resource
            </DropdownItem>
            <DropdownItem
              className={temporalVisible}
              onClick={() => this.toggleModal('addTemporalModal')}
            >
              Add temporal
            </DropdownItem>
            <DropdownItem
              className={spatialVisible}
              onClick={() => this.toggleModal('addSpatialModal')}
            >
              Add spatial
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledButtonDropdown>
        {eventModal}
        {organisationModal}
        {personModal}
        {resourceModal}
        {temporalModal}
        {spatialModal}
      </div>
    );
  }
}

AddRelation.defaultProps = {
  type: '',
  item: null,
  reload: () => {},
  reference: null,
  referencesTypes: null,
  peopleRoles: [],
  referencesLabels: [],
};

AddRelation.propTypes = {
  type: PropTypes.string,
  item: PropTypes.object,
  reload: PropTypes.func,
  reference: PropTypes.object,
  referencesTypes: PropTypes.object,
  peopleRoles: PropTypes.array,
  referencesLabels: PropTypes.array,
};

export default compose(connect(mapStateToProps, []))(AddRelation);
