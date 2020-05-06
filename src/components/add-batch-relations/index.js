import React, { useState, useEffect } from 'react';
import {
  UncontrolledButtonDropdown, DropdownMenu, DropdownItem, DropdownToggle,
} from 'reactstrap';

import AddEventModal from './add-event';
import AddOrganisationModal from './add-organisation';
import AddPersonModal from './add-person';
import AddResourceModal from './add-resource';
import AddTemporalModal from './add-temporal';
import AddSpatialModal from './add-spatial';
import DeleteMany from './delete-many';
import {parseReferenceLabels,parseReferenceTypes} from '../../helpers/helpers';
import {useSelector} from "react-redux";
import Notification from '../notification';
import axios from 'axios';

const APIPath = process.env.REACT_APP_APIPATH;

const BatchActions = (props) => {
  const mainEntity = useSelector(state => {
    if (props.type==="Resource") {
      return state.resourceEntity;
    }
    else if (props.type==="Person") {
      return state.personEntity;
    }
    else if (props.type==="Organisation") {
      return state.organisationEntity;
    }
    else if (props.type==="Event") {
      return state.eventEntity;
    }
    else if (props.type==="Temporal") {
      return state.temporalEntity;
    }
    else if (props.type==="Spatial") {
      return state.spatialEntity;
    }
  });
  const entitiesLoaded = useSelector(state => state.entitiesLoaded);
  const [modalsVisible,setModalsVisible] = useState({
    eventModal: false,
    organisationModal: false,
    personModal: false,
    resourceModal: false,
    temporalModal: false,
    spatialModal: false,
  });
  const [referencesLabels, setReferencesLabels] = useState([]);
  const [referencesTypes, setReferencesTypes] = useState([]);
  const [referencesLoaded, setReferencesLoaded] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationContent, setNotificationContent] = useState([]);
  const [deleteManyVisible, setDeleteManyVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);


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
      temporalModal: false,
      spatialModal: false,
    }
    newModalsVisible[modal] = !newModalsVisible[modal];
    setModalsVisible(newModalsVisible);
  }

  const toggleDeleteMany = () => {
    if (props.items.length===0) {
      setNotificationVisible(true);
      setNotificationContent(<div><i className="fa fa-exclamation-triangle" /> <span>Please select some items to continue</span></div>);
      setTimeout(()=>{
        setNotificationVisible(false);
      },2000);
      return false;
    }
    setDeleteManyVisible(!deleteManyVisible);
  }

  const loadReferenceLabelsNTypes = () => {
    let properties = mainEntity.properties;
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
  });

  let eventVisible="", organisationVisible="", personVisible="", resourceVisible="", temporalVisible="", spatialVisible="";

  let eventModalHTML = <AddEventModal
    items={props.items}
    type={props.type}
    refTypes={referencesTypes}
    toggleModal={toggleModal}
    visible={modalsVisible.eventModal}
    removeSelected={props.removeSelected}
    />

  let organisationModalHTML = <AddOrganisationModal
    items={props.items}
    type={props.type}
    refTypes={referencesTypes}
    toggleModal={toggleModal}
    visible={modalsVisible.organisationModal}
    removeSelected={props.removeSelected}
    />

  let personModalHTML = <AddPersonModal
    items={props.items}
    type={props.type}
    refTypes={referencesTypes}
    toggleModal={toggleModal}
    visible={modalsVisible.personModal}
    removeSelected={props.removeSelected}
    />

  let resourceModalHTML = <AddResourceModal
    items={props.items}
    type={props.type}
    refTypes={referencesTypes}
    toggleModal={toggleModal}
    visible={modalsVisible.resourceModal}
    removeSelected={props.removeSelected}
    />

  let temporalModalHTML = <AddTemporalModal
    items={props.items}
    type={props.type}
    refTypes={referencesTypes}
    toggleModal={toggleModal}
    visible={modalsVisible.temporalModal}
    removeSelected={props.removeSelected}
    />

  let spatialModalHTML = <AddSpatialModal
    items={props.items}
    type={props.type}
    refTypes={referencesTypes}
    toggleModal={toggleModal}
    visible={modalsVisible.spatialModal}
    removeSelected={props.removeSelected}
    />

  if (referencesLabels.indexOf("Event")===-1) {
    eventVisible = "hidden";
    eventModalHTML = [];
  }
  if (referencesLabels.indexOf("Organisation")===-1) {
    organisationVisible = "hidden";
    organisationModalHTML = [];
  }
  if (referencesLabels.indexOf("Person")===-1) {
    personVisible = "hidden";
    personModalHTML = [];
  }
  if (referencesLabels.indexOf("Resource")===-1) {
    resourceVisible = "hidden";
    resourceModalHTML = [];
  }
  if (referencesLabels.indexOf("Temporal")===-1) {
    temporalVisible = "hidden";
    temporalModalHTML = [];
  }
  if (referencesLabels.indexOf("Spatial")===-1) {
    spatialVisible = "hidden";
    spatialModalHTML = [];
  }
  let notification = <Notification color="danger" visible={notificationVisible} content={notificationContent}/>

  let selectAllText = "Select all";
  if (props.allChecked) {
    selectAllText = "Deselect all";
  }

  const updateStatus = async(status) => {
    if (updatingStatus) {
      return false;
    }
    setUpdatingStatus(true);
    if (props.items.length===0) {
      setNotificationVisible(true);
      setNotificationContent(<div><i className="fa fa-exclamation-triangle" /> <span>Please select some items to continue</span></div>);
      setTimeout(()=>{
        setNotificationVisible(false);
      },2000);
      return false;
    }
    let path = "";
    if (props.type==="Resource") {
      path = APIPath+"resource-update-status";
    }
    if (props.type==="Person") {
      path = APIPath+"person-update-status";
    }
    if (props.type==="Organisation") {
      path = APIPath+"organisation-update-status";
    }
    if (props.type==="Event") {
      path = APIPath+"event-update-status";
    }
    let _ids = props.items.map(i=>i._id);
    let postData = {
      _ids: _ids,
      status: status
    }
    let update = await axios({
      method: 'post',
      url: path,
      crossDomain: true,
      data: postData
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error)
    });
    setUpdatingStatus(false);
    if (update.status) {
      setNotificationVisible(true);
      setNotificationContent(<div>Items status updated successfully</div>);
      setTimeout(()=>{
        setNotificationVisible(false);
      },2000);
    }
  }

  let updateStatusBtns = [];
  if (props.type!=="Temporal" && props.type!=="Spatial") {
    updateStatusBtns = [
      <DropdownItem key={0} onClick={()=>updateStatus("public")}>Make public</DropdownItem>,
      <DropdownItem key={1} onClick={()=>updateStatus("private")}>Make private</DropdownItem>,
      <DropdownItem key={2} divider />
    ]
  }
  return (
    <div>
      {notification}
      <UncontrolledButtonDropdown direction='down' className={"table-actions-dropdown "+props.className}>
        <DropdownToggle caret color="secondary" outline size="sm">
          actions
        </DropdownToggle>
        <DropdownMenu className="right">
          <DropdownItem onClick={()=>props.selectAll()}>{selectAllText}</DropdownItem>
          <DropdownItem divider />
          <DropdownItem header className="text-glue">Associate selected with:</DropdownItem>
          <DropdownItem className={eventVisible} onClick={()=>toggleModal('eventModal')}>... event</DropdownItem>
          <DropdownItem className={organisationVisible} onClick={()=>toggleModal('organisationModal')}>... organisation</DropdownItem>
          <DropdownItem className={personVisible} onClick={()=>toggleModal('personModal')}>... person</DropdownItem>
          <DropdownItem className={resourceVisible} onClick={()=>toggleModal('resourceModal')}>... resource</DropdownItem>
          <DropdownItem className={temporalVisible} onClick={()=>toggleModal('temporalModal')}>... temporal</DropdownItem>
          <DropdownItem className={spatialVisible} onClick={()=>toggleModal('spatialModal')}>... spatial</DropdownItem>
          <DropdownItem divider />
          {updateStatusBtns }
          <DropdownItem onClick={()=>toggleDeleteMany()}>Delete selected</DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>

      {eventModalHTML}
      {organisationModalHTML}
      {personModalHTML}
      {resourceModalHTML}
      {temporalModalHTML}
      {spatialModalHTML}

      <DeleteMany
        visible={deleteManyVisible}
        toggle={toggleDeleteMany}
        items={props.items}
        type={props.type}
        deleteSelected={props.deleteSelected}
        removeSelected={props.removeSelected}
      />
    </div>
  )
}
export default BatchActions;
