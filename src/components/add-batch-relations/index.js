import React, { useState, useEffect } from 'react';
import {
  UncontrolledButtonDropdown, DropdownMenu, DropdownItem, DropdownToggle,
} from 'reactstrap';

import AddEventModal from './add-event';
import AddOrganisationModal from './add-organisation';
import AddPersonModal from './add-person';
import AddResourceModal from './add-resource';
import {parseReferenceLabels,parseReferenceTypes} from '../../helpers/helpers';
import {useSelector} from "react-redux";
import Notification from '../notification';

const AddRelations = (props) => {
  const personEntity = useSelector(state => state.personEntity);
  const entitiesLoaded = useSelector(state => state.entitiesLoaded);
  const [modalsVisible,setModalsVisible] = useState({
    eventModal: false,
    organisationModal: false,
    personModal: false,
    resourceModal: false,
  });
  const [referencesLabels, setReferencesLabels] = useState([]);
  const [referencesTypes, setReferencesTypes] = useState([]);
  const [referencesLoaded, setReferencesLoaded] = useState(false);
  let [notificationVisible, setNotificationVisible] = useState(false);
  let [notificationContent, setNotificationContent] = useState([]);

  const toggleModal = (modal) => {
    if (props.items.length===0) {
      setNotificationVisible(true);
      setNotificationContent(<div><i className="fa fa-exclamation-triangle" /> <span>Please select some items to continue</span></div>);
      setTimeout(()=>{
        setNotificationVisible(false);
      },2000);
      return false;
    }
    let newModalsVisible = {
      eventModal: false,
      organisationModal: false,
      personModal: false,
      resourceModal: false,
    }
    newModalsVisible[modal] = !newModalsVisible[modal];
    setModalsVisible(newModalsVisible);
  }

  const loadReferenceLabelsNTypes = () => {
    let properties = personEntity.properties;
    let newReferencesLabels = parseReferenceLabels(properties);
    let newReferencesTypes = parseReferenceTypes(properties);
    setReferencesLabels(newReferencesLabels);
    setReferencesTypes(newReferencesTypes);
    setReferencesLoaded(true);
  }

  useEffect(()=>{
    if (!referencesLoaded && entitiesLoaded) {
      loadReferenceLabelsNTypes();
    }
  })

  let eventVisible="", organisationVisible="", personVisible="", resourceVisible="";
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
  let notification = <Notification color="danger" visible={notificationVisible} content={notificationContent}/>
  return (
    <div>
      {notification}
      <UncontrolledButtonDropdown direction='down' className="table-actions-dropdown">
        <DropdownToggle caret color="secondary" outline size="sm">
          actions
        </DropdownToggle>
        <DropdownMenu className="right">
          <DropdownItem header className="text-glue">Associate selected with:</DropdownItem>
          <DropdownItem className={eventVisible} onClick={()=>toggleModal('eventModal')}>... event</DropdownItem>
          <DropdownItem className={organisationVisible} onClick={()=>toggleModal('organisationModal')}>... organisation</DropdownItem>
          <DropdownItem className={personVisible} onClick={()=>toggleModal('personModal')}>... person</DropdownItem>
          <DropdownItem className={resourceVisible} onClick={()=>toggleModal('resourceModal')}>... resource</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>Delete selected</DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>

      <AddEventModal
        items={props.items}
        type={props.type}
        refTypes={referencesTypes}
        toggleModal={toggleModal}
        visible={modalsVisible.eventModal}
        removeSelected={props.removeSelected}
        />

      <AddOrganisationModal
        items={props.items}
        type={props.type}
        refTypes={referencesTypes}
        toggleModal={toggleModal}
        visible={modalsVisible.organisationModal}
        removeSelected={props.removeSelected}
        />

      <AddPersonModal
        items={props.items}
        type={props.type}
        refTypes={referencesTypes}
        toggleModal={toggleModal}
        visible={modalsVisible.personModal}
        removeSelected={props.removeSelected}
        />

      <AddResourceModal
        items={props.items}
        type={props.type}
        refTypes={referencesTypes}
        toggleModal={toggleModal}
        visible={modalsVisible.resourceModal}
        removeSelected={props.removeSelected}
        />
    </div>
  )
}
export default AddRelations;
