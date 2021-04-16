import React, { Component } from 'react';
import {
  Spinner,
  Collapse,
  Button,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import ImportToDBToolbox from './right-sidebar-import-to-db';
import Breadcrumbs from '../../components/breadcrumbs';
import { getThumbnailURL, capitalizeOnlyFirst } from '../../helpers';

const APIPath = process.env.REACT_APP_APIPATH;

export default class ImportClassPieceToDB extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      data: [],
      loadedFaces: [],
      dbClasspiece: null,
      collapseRelations: [],
      identifyDuplicatesStatus: false,
      actionsOpen: false,
      identifyDuplicatesBtn: <span>Identify possible duplicates</span>,
      selectAllBtn: <span>Deselect All</span>,
      selectAllStatus: true,
      selectedPerson: [],
      selectedPersonIndex: null,
      selectedDuplicate: [],
      duplicateModal: false,
      duplicateImageOver: false,

      inputthumbnail: '',
      inputhonorificprefix: [],
      inputfirstname: '',
      inputmiddlename: '',
      inputlastname: '',
      inputdiocese: '',
      inputdioceseType: '',
      inputtype: 'student',
      input_id: '',

      mergePersonBtn: <span>Merge Person</span>,
      updateModal: false,
      updateHonorificPrefix: [],
      updateFirstName: '',
      updateMiddleName: '',
      updateLastName: '',
      updateDiocese: '',
      updateDioceseType: '',
      updateType: '',

      importSelectedBtn: <span>Import selected</span>,
      importSelectedStatus: false,
      imported: false,
      reImportModalOpen: false,
      draggedElem: null,
      draggedIndex: null,
    };
    this.updateImported = this.updateImported.bind(this);
    this.loadStatus = this.loadStatus.bind(this);
    this.toggleRelations = this.toggleRelations.bind(this);
    this.actionsToggle = this.actionsToggle.bind(this);
    this.identifyDuplicates = this.identifyDuplicates.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleDuplicateModal = this.toggleDuplicateModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleMultipleChange = this.handleMultipleChange.bind(this);
    this.startDragText = this.startDragText.bind(this);
    this.startDragImage = this.startDragImage.bind(this);
    this.dragStopText = this.dragStopText.bind(this);
    this.dragStopImage = this.dragStopImage.bind(this);
    this.dragOverText = this.dragOverText.bind(this);
    this.dragEnterText = this.dragEnterText.bind(this);
    this.dragLeaveText = this.dragLeaveText.bind(this);
    this.selectPossibleDuplicate = this.selectPossibleDuplicate.bind(this);
    this.copyRight = this.copyRight.bind(this);
    this.copyLeft = this.copyLeft.bind(this);
    this.mergePerson = this.mergePerson.bind(this);
    this.undoMerge = this.undoMerge.bind(this);
    this.toggleUpdateModal = this.toggleUpdateModal.bind(this);
    this.openUpdatePerson = this.openUpdatePerson.bind(this);
    this.importSelected = this.importSelected.bind(this);
    this.toggleReImportModal = this.toggleReImportModal.bind(this);
    this.removeHP = this.removeHP.bind(this);
    this.addHP = this.addHP.bind(this);
  }

  componentDidMount() {
    this.loadStatus();
  }

  componentDidUpdate(prevProps, prevState) {
    const { imported } = this.state;
    if (!prevState.imported && imported) {
      this.updateImported(false);
    }
  }

  handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  };

  handleMultipleChange = (e, i) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const { [name]: elem } = this.state;
    elem[i] = value;
    this.setState({
      [name]: elem,
    });
  };

  addHP = (name) => {
    if (name === null) {
      return false;
    }
    const { [name]: hps } = this.state;
    hps.push('');
    this.setState({
      inputhonorificprefix: hps,
    });
    return false;
  };

  removeHP = (i, name = null) => {
    if (name === null) {
      return false;
    }
    const { [name]: hps } = this.state;
    hps.splice(i, 1);
    this.setState({
      inputhonorificprefix: hps,
    });
    return false;
  };

  toggleRelations = (i) => {
    const { collapseRelations } = this.state;
    let collapseRelation = collapseRelations[i];
    collapseRelation = !collapseRelation;
    collapseRelations[i] = collapseRelation;
    this.setState({
      collapseRelations,
    });
  };

  actionsToggle = () => {
    const { actionsOpen } = this.state;
    this.setState({
      actionsOpen: !actionsOpen,
    });
  };

  loadStatus = async () => {
    const { match } = this.props;
    const file = match.params.fileName;
    const context = this;
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}prepare-classpiece-ingestion?file=${file}`,
      crossDomain: true,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });

    const collapseRelations = [];
    collapseRelations.push(false);

    const newData = [];
    const newClassPiece = responseData.classpiece;
    newClassPiece.checked = true;
    newData.classpiece = newClassPiece;
    const newFaces = [];
    for (let i = 0; i < responseData.faces.length; i += 1) {
      const face = responseData.faces[i];
      face.checked = true;
      newFaces.push(face);
      collapseRelations.push(false);
    }
    newData.faces = newFaces;
    const stateUpdate = {
      loading: false,
      data: newData,
      loadedFaces: newFaces,
      dbClasspiece: responseData.db_classpiece,
      collapseRelations,
    };

    if (
      responseData.db_classpiece !== null &&
      responseData.db_classpiece !== 0 &&
      responseData.db_classpiece !== '0'
    ) {
      stateUpdate.importSelectedBtn = <span>Re-import selected</span>;
    }
    context.setState(stateUpdate);
  };

  identifyDuplicates = async () => {
    const { identifyDuplicatesStatus, loadedFaces, data } = this.state;
    if (identifyDuplicatesStatus) {
      return false;
    }
    this.setState({
      identifyDuplicatesBtn: (
        <span>
          <i>Identifying...</i> <Spinner color="secondary" size="sm" />
        </span>
      ),
      identifyDuplicatesStatus: true,
    });
    const newFaces = await axios({
      method: 'put',
      url: `${APIPath}prepare-classpiece-identify-duplicates`,
      crossDomain: true,
      data: { faces: JSON.stringify(loadedFaces) },
    })
      .then((response) => JSON.parse(response.data.data))
      .catch((error) => {
        console.log(error);
      });
    const stateData = { ...data };
    stateData.faces = newFaces;
    this.setState({
      data: stateData,
      identifyDuplicatesStatus: false,
      identifyDuplicatesBtn: (
        <span>
          Identification complete <i className="fa fa-check" />
        </span>
      ),
    });

    const context = this;
    setTimeout(() => {
      context.setState({
        identifyDuplicatesBtn: <span>Identify possible duplicates</span>,
      });
    }, 2000);
    return false;
  };

  selectAll = () => {
    const { selectAllStatus: stateSelectAllStatus, stateData } = this.state;
    let selectAllBtn = <span>Select All</span>;
    const selectAllStatus = !stateSelectAllStatus;
    if (selectAllStatus) {
      selectAllBtn = <span>Deselect All</span>;
    }
    const classPiece = stateData.classpiece;
    classPiece.checked = selectAllStatus;

    const newFaces = [];
    const { faces } = stateData;
    for (let i = 0; i < faces.length; i += 1) {
      const face = faces[i];
      face.checked = selectAllStatus;
      newFaces.push(face);
    }
    stateData.faces = newFaces;
    this.setState({
      selectAllStatus: !stateSelectAllStatus,
      selectAllBtn,
      data: stateData,
    });
  };

  toggleSelected = (i, type) => {
    const { data: stateData } = this.state;
    let stateDataType = stateData[type];
    if (type === 'faces') {
      const item = stateDataType[i];
      item.checked = !item.checked;
      stateDataType[i] = item;
    } else {
      const item = stateDataType;
      item.checked = !item.checked;
      stateDataType = item;
    }

    stateData[type] = stateDataType;
    this.setState({
      data: stateData,
    });
  };

  toggleDuplicateModal = () => {
    const { duplicateModal } = this.state;
    this.setState({
      duplicateModal: !duplicateModal,
    });
  };

  startDragText = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/html', e.target.id);
    e.dataTransfer.dropEffect = 'move';
    this.setState({
      draggableText: e.target.textContent,
    });
  };

  startDragImage = (thumbnail, e) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/html', e.target.id);
    e.dataTransfer.dropEffect = 'move';
    this.setState({
      draggableImage: thumbnail,
    });
  };

  dragStopText = (e, i = null) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target.getAttribute('data-target');
    if (i === null) {
      const { [target]: targetText } = this.state;
      const { draggableText } = this.state;
      let space = '';
      if (targetText !== '') {
        space = ' ';
      }
      let newTargetText = targetText + space + draggableText;
      newTargetText = capitalizeOnlyFirst(newTargetText);
      this.setState({
        [target]: newTargetText,
        draggedElem: null,
        draggedIndex: null,
      });
    } else {
      const { [target]: stateTarget } = this.state;
      const targetText = stateTarget[i];
      const { draggableText } = this.state;
      let space = '';
      if (targetText !== '') {
        space = ' ';
      }
      let newTargetText = targetText + space + draggableText;
      newTargetText = capitalizeOnlyFirst(newTargetText);

      const { [target]: elem } = this.state;
      elem[i] = newTargetText;
      this.setState({
        [target]: elem,
        draggedElem: null,
        draggedIndex: null,
      });
    }
    return false;
  };

  dragStopImage = (e) => {
    const target = e.target.getAttribute('data-target');
    const { draggableImage } = this.state;
    this.setState({
      [target]: draggableImage,
      duplicateImageOver: false,
    });
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  dragOverText = (e) => {
    e.stopPropagation();
    e.preventDefault();
    return false;
  };

  dragEnterText = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { duplicateImageOver } = this.state;
    const target = e.target.getAttribute('data-target');
    const index = e.target.getAttribute('data-index');
    if (target === 'inputthumbnail' && !duplicateImageOver) {
      this.setState({
        duplicateImageOver: true,
      });
    } else {
      this.setState({
        draggedElem: target,
        draggedIndex: index,
      });
    }
  };

  dragLeaveText = (e) => {
    const { duplicateImageOver } = this.state;
    if (duplicateImageOver) {
      this.setState({
        duplicateImageOver: false,
      });
    } else {
      this.setState({
        draggedElem: null,
        draggedIndex: null,
      });
    }
    e.preventDefault();
    return false;
  };

  selectPossibleDuplicate = (i, fm) => {
    const { data } = this.state;
    const srcPerson = { ...data.faces[i] };
    const possibleDuplicate = srcPerson.matches[fm];
    let honorificPrefix = '';
    let firstName = '';
    let middleName = '';
    let lastName = '';
    let diocese = '';
    let dioceseType = '';
    let type = '';
    let thumbnail = '';
    if (typeof srcPerson.honorificPrefix !== 'undefined') {
      honorificPrefix = Object.assign([{}], srcPerson.honorificPrefix);
    }
    if (typeof srcPerson.firstName !== 'undefined') {
      firstName = srcPerson.firstName;
    }
    if (typeof srcPerson.middleName !== 'undefined') {
      middleName = srcPerson.middleName;
    }
    if (typeof srcPerson.lastName !== 'undefined') {
      lastName = srcPerson.lastName;
    }
    if (typeof srcPerson.diocese !== 'undefined') {
      diocese = srcPerson.diocese;
    }
    if (typeof srcPerson.dioceseType !== 'undefined') {
      dioceseType = srcPerson.dioceseType;
    }
    if (typeof srcPerson.type !== 'undefined') {
      type = srcPerson.type;
    }
    if (typeof srcPerson.thumbnail !== 'undefined') {
      thumbnail = srcPerson.thumbnail;
    }
    this.setState({
      inputthumbnail: thumbnail,
      inputhonorificprefix: honorificPrefix,
      inputfirstname: firstName,
      inputmiddlename: middleName,
      inputlastname: lastName,
      inputdiocese: diocese,
      inputdioceseType: dioceseType,
      inputtype: type,
      input_id: '',
      selectedPerson: srcPerson,
      selectedPersonIndex: i,
      selectedDuplicate: possibleDuplicate,
      duplicateModal: true,
    });
  };

  copyRight = () => {
    const { selectedPerson } = this.state;
    const srcPerson = { ...selectedPerson };
    let honorificPrefix = '';
    let firstName = '';
    let middleName = '';
    let lastName = '';
    let diocese = '';
    let dioceseType = '';
    let type = '';
    let thumbnail = '';
    if (typeof srcPerson.honorificPrefix !== 'undefined') {
      honorificPrefix = srcPerson.honorificPrefix;
    }
    if (typeof srcPerson.firstName !== 'undefined') {
      firstName = srcPerson.firstName;
    }
    if (typeof srcPerson.middleName !== 'undefined') {
      middleName = srcPerson.middleName;
    }
    if (typeof srcPerson.lastName !== 'undefined') {
      lastName = srcPerson.lastName;
    }
    if (typeof srcPerson.diocese !== 'undefined') {
      diocese = srcPerson.diocese;
    }
    if (typeof srcPerson.dioceseType !== 'undefined') {
      dioceseType = srcPerson.dioceseType;
    }
    if (typeof srcPerson.type !== 'undefined') {
      type = srcPerson.type;
    }
    if (typeof srcPerson.thumbnail !== 'undefined') {
      thumbnail = srcPerson.thumbnail;
    }
    this.setState({
      inputthumbnail: thumbnail,
      inputhonorificprefix: honorificPrefix,
      inputfirstname: firstName,
      inputmiddlename: middleName,
      inputlastname: lastName,
      inputdiocese: diocese,
      inputdioceseType: dioceseType,
      inputtype: type,
      input_id: '',
    });
  };

  copyLeft = () => {
    const { selectedDuplicate } = this.state;
    const srcPerson = { ...selectedDuplicate };
    let honorificPrefix = '';
    let firstName = '';
    let middleName = '';
    let lastName = '';
    let diocese = '';
    let dioceseType = '';
    let type = '';
    let _id = '';
    const thumbnail = {};
    if (typeof srcPerson.honorificPrefix !== 'undefined') {
      honorificPrefix = srcPerson.honorificPrefix;
    }
    if (typeof srcPerson.firstName !== 'undefined') {
      firstName = srcPerson.firstName;
    }
    if (typeof srcPerson.middleName !== 'undefined') {
      middleName = srcPerson.middleName;
    }
    if (typeof srcPerson.lastName !== 'undefined') {
      lastName = srcPerson.lastName;
    }
    // get diocese
    if (
      srcPerson.organisations.find((d) => d.term.label === 'hasAffiliation') !==
      'undefined'
    ) {
      const srcPersonDiocese = srcPerson.organisations.find(
        (d) => d.term.label === 'hasAffiliation'
      );
      diocese = srcPersonDiocese.ref.label;
      dioceseType = srcPersonDiocese.ref.organisationType;
    }
    // get type
    if (
      srcPerson.resources.find((r) => r.term.label === 'isDepictedOn') !==
      'undefined'
    ) {
      type = srcPerson.resources.find((r) => r.term.label === 'isDepictedOn')
        .role;
    }
    if (typeof srcPerson.resources !== 'undefined') {
      thumbnail.src = getThumbnailURL(srcPerson);
    }
    if (typeof srcPerson._id !== 'undefined') {
      _id = srcPerson._id;
    }
    this.setState({
      inputthumbnail: thumbnail,
      inputhonorificprefix: honorificPrefix,
      inputfirstname: firstName,
      inputmiddlename: middleName,
      inputlastname: lastName,
      inputdiocese: diocese,
      inputdioceseType: dioceseType,
      inputtype: type,
      input_id: _id,
    });
  };

  mergePerson = (e) => {
    e.preventDefault();
    const {
      data: stateData,
      selectedPerson,
      selectedPersonIndex,
      selectedDuplicate,
      inputthumbnail,
      inputhonorificprefix,
      inputfirstname,
      inputmiddlename,
      inputlastname,
      inputdiocese,
      inputdioceseType,
      inputtype,
    } = this.state;
    const data = { ...stateData };
    const { faces } = data;
    const newPerson = { ...selectedPerson };
    const personIndex = selectedPersonIndex;
    const newId = selectedDuplicate._id;

    newPerson.thumbnail = inputthumbnail;
    newPerson.honorificPrefix = inputhonorificprefix;
    newPerson.firstName = inputfirstname;
    newPerson.middleName = inputmiddlename;
    newPerson.lastName = inputlastname;
    newPerson.diocese = inputdiocese;
    newPerson.dioceseType = inputdioceseType;
    newPerson.type = inputtype;
    newPerson._id = newId;
    faces[personIndex] = newPerson;
    data.faces = faces;
    this.setState({
      data,
      duplicateModal: false,
    });
  };

  undoMerge = async () => {
    const { selectedPersonIndex: stateIndex, data: stateData } = this.state;
    const { match } = this.props;
    const file = match.params.fileName;
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}prepare-classpiece-ingestion?file=${file}`,
      crossDomain: true,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    const stateFaces = stateData.faces;

    const stateFace = stateFaces[stateIndex];
    const stateFaceMatches = stateFace.matches;
    const stateFaceChecked = stateFace.checked;

    const undoFace = responseData.faces[stateIndex];
    undoFace.matches = stateFaceMatches;
    undoFace.checked = stateFaceChecked;
    stateFaces[stateIndex] = undoFace;
    stateData.faces = stateFaces;
    this.setState({
      selectedPerson: undoFace,
      data: stateData,
    });

    const context = this;
    setTimeout(() => {
      context.copyRight();
    }, 250);
  };

  toggleUpdateModal = () => {
    const { updateModal } = this.state;
    this.setState({
      updateModal: !updateModal,
    });
  };

  openUpdatePerson = (i) => {
    const { data } = this.state;
    const person = { ...data.faces[i] };
    let thumbnail = '';
    if (typeof person.thumbnail !== 'undefined') {
      thumbnail = person.thumbnail;
    }
    let honorificPrefix = [];
    let firstName = '';
    let middleName = '';
    let lastName = '';
    let diocese = '';
    let dioceseType = '';
    let type = '';
    if (
      typeof person.honorificPrefix !== 'undefined' &&
      person.honorificPrefix !== ''
    ) {
      honorificPrefix = person.honorificPrefix;
    }
    if (typeof person.firstName !== 'undefined') {
      firstName = person.firstName;
    }
    if (typeof person.middleName !== 'undefined') {
      middleName = person.middleName;
    }
    if (typeof person.lastName !== 'undefined') {
      lastName = person.lastName;
    }
    if (typeof person.diocese !== 'undefined') {
      diocese = person.diocese;
    }
    if (typeof person.dioceseType !== 'undefined') {
      dioceseType = person.dioceseType;
    }
    if (typeof person.type !== 'undefined') {
      type = person.type;
    }
    this.setState({
      inputthumbnail: thumbnail,
      updateHonorificPrefix: honorificPrefix,
      updateFirstName: firstName,
      updateMiddleName: middleName,
      updateLastName: lastName,
      updateDiocese: diocese,
      updateDioceseType: dioceseType,
      updateType: type,
      selectedPerson: person,
      selectedPersonIndex: i,
      updateModal: true,
    });
  };

  updatePerson = (e) => {
    e.preventDefault();
    const {
      data: stateData,
      selectedPersonIndex,
      updateHonorificPrefix,
      updateFirstName,
      updateMiddleName,
      updateLastName,
      updateDiocese,
      updateDioceseType,
      updateType,
    } = this.state;
    const data = { ...stateData };
    const { faces } = stateData;
    const person = faces[selectedPersonIndex];
    person.honorificPrefix = updateHonorificPrefix;
    person.firstName = updateFirstName;
    person.middleName = updateMiddleName;
    person.lastName = updateLastName;
    person.diocese = updateDiocese;
    person.dioceseType = updateDioceseType;
    person.type = updateType;
    faces[selectedPersonIndex] = person;
    data.faces = faces;
    this.setState({
      data,
      updateModal: false,
    });
  };

  importSelected = async () => {
    const { importSelectedStatus, data } = this.state;
    const { match } = this.props;
    if (importSelectedStatus) {
      return false;
    }
    this.setState({
      importSelectedBtn: (
        <span>
          <i>Importing...</i> <Spinner color="secondary" size="sm" />
        </span>
      ),
      importSelectedStatus: true,
    });
    const file = match.params.fileName;
    const stateData = Object.assign([{}], data);
    const postData = {};
    postData.file = file;
    const classPiece = stateData.classpiece;
    if (classPiece.checked) {
      postData.classpiece = classPiece;
    }
    const { faces } = stateData;
    const checkedFaces = [];
    for (let i = 0; i < faces.length; i += 1) {
      const face = faces[i];
      if (face.checked) {
        checkedFaces.push(face);
      }
    }
    postData.faces = checkedFaces;

    const context = this;
    const ingestData = await axios({
      method: 'put',
      url: `${APIPath}ingest-classpiece`,
      crossDomain: true,
      data: { data: JSON.stringify(postData) },
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (ingestData.status) {
      this.setState({
        importSelectedStatus: false,
        importSelectedBtn: (
          <span>
            Import complete <i className="fa fa-check" />
          </span>
        ),
      });

      setTimeout(() => {
        context.setState({
          importSelectedBtn: <span>Import selected</span>,
          imported: true,
        });
      }, 2000);
    }
    return false;
  };

  toggleReImportModal = () => {
    const { reImportModalOpen } = this.state;
    this.setState({
      reImportModalOpen: !reImportModalOpen,
    });
  };

  updateImported(value) {
    this.setState({
      imported: value,
    });
  }

  render() {
    const {
      imported,
      loading,
      data,
      collapseRelations,
      dbClasspiece,
      selectAllBtn,
      identifyDuplicatesBtn,
      importSelectedBtn,
      selectedPerson,
      selectedDuplicate,
      inputthumbnail: stateInputthumbnail,
      duplicateImageOver,
      inputhonorificprefix,
      draggedElem,
      draggedIndex,
      duplicateModal: duplicateModalOpen,
      input_id: inputId,
      inputfirstname,
      inputmiddlename,
      inputlastname,
      inputdiocese,
      inputdioceseType,
      inputtype,
      mergePersonBtn,
      updateHonorificPrefix,
      updateModal: updateModalOpen,
      className,
      updateFirstName,
      updateMiddleName,
      updateLastName,
      updateDiocese,
      updateDioceseType,
      updateType,
      reImportModalOpen,
    } = this.state;
    let redirect = [];
    if (imported) {
      redirect = <Redirect to="/parse-class-pieces/" />;
    }
    let content = (
      <div className="row">
        <div className="col-12">
          <div style={{ padding: '40pt', textAlign: 'center' }}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    );
    if (!loading) {
      const { classpiece } = data;
      const { faces } = data;
      let tableRows = [];
      const classPieceRelations = [];

      // faces
      let f = 1;
      const facesRows = [];
      for (let i = 0; i < faces.length; i += 1) {
        const face = faces[i];
        let rotate = [];
        if (
          typeof face.default !== 'undefined' &&
          typeof face.default.rotate !== 'undefined' &&
          face.default.rotate !== 0
        ) {
          rotate = <span>rotate: {face.default.rotate}</span>;
        }
        let label = '';
        if (face.firstName !== '' || face.lastName !== '') {
          if (
            typeof face.honorificPrefix !== 'undefined' &&
            face.honorificPrefix !== ''
          ) {
            label += face.honorificPrefix;
          }
          if (typeof face.firstName !== 'undefined' && face.firstName !== '') {
            if (label !== '') {
              label += ' ';
            }
            label += face.firstName;
          }
          if (
            typeof face.middleName !== 'undefined' &&
            face.middleName !== ''
          ) {
            if (label !== '') {
              label += ' ';
            }
            label += face.middleName;
          }
          if (typeof face.lastName !== 'undefined' && face.lastName !== '') {
            if (label !== '') {
              label += ' ';
            }
            label += face.lastName;
          }
          // classpiece relations
          const personRelation = (
            <li key={`depicts-${f}`}>
              <span className="type-of">[:Resource]</span> {classpiece.label}{' '}
              <span className="relation">depicts</span>{' '}
              <span className="type-of">[:Person]</span> {label}
            </li>
          );
          const resourceRelation = (
            <li key={`hasPart-${f}`}>
              <span className="type-of">[:Resource]</span> {classpiece.label}{' '}
              <span className="relation">hasPart</span>{' '}
              <span className="type-of">[:Resource]</span>{' '}
              <img
                src={face.thumbnail.src}
                alt="Person"
                className="import-to-db-thumb-small img-responsive"
              />
            </li>
          );
          classPieceRelations.push(personRelation);
          classPieceRelations.push(resourceRelation);
        }

        // face relations
        const faceRelations = [];
        const personToClasspieceRelation = (
          <li key={0}>
            <span className="type-of">[:Person]</span> {label}{' '}
            <span className="relation">isDepictedOn</span>{' '}
            <span className="type-of">[:Resource]</span> {classpiece.label}
          </li>
        );
        const resourceToClasspieceRelation = (
          <li key={1}>
            <span className="type-of">[:Resource]</span>{' '}
            <img
              src={face.thumbnail.src}
              alt="Person"
              className="import-to-db-thumb-small img-responsive"
            />{' '}
            <span className="relation">isPartOf</span>{' '}
            <span className="type-of">[:Resource]</span> {classpiece.label}
          </li>
        );

        const resourceDioceseRelation = (
          <li key={2}>
            <span className="type-of">[:Person]</span> {label}{' '}
            <span className="relation">hasAffiliation</span>{' '}
            <span className="type-of">[:Organisation]</span> {face.diocese}
          </li>
        );

        if (face.firstName !== '' || face.lastName !== '') {
          faceRelations.push(personToClasspieceRelation);
        }

        faceRelations.push(resourceToClasspieceRelation);

        if (face.diocese.trim() !== '') {
          faceRelations.push(resourceDioceseRelation);
        }

        // duplicates
        let duplicatesTitle = [];
        let duplicatesClass = '';
        let duplicatesOutput = [];
        if (typeof face.matches !== 'undefined' && face.matches.length > 0) {
          duplicatesTitle = (
            <div>
              <Label>Possible duplicates</Label>
            </div>
          );
          duplicatesClass = ' duplicates';
          const duplicatesRows = face.matches.map((faceMatch, fm) => {
            const key = `a${fm}`;
            return (
              <li key={key}>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => this.selectPossibleDuplicate(i, fm)}
                >
                  {faceMatch.firstName} {faceMatch.lastName}
                </Button>{' '}
                [<i>{faceMatch.score}% match</i>]
              </li>
            );
          });
          duplicatesOutput = (
            <ul className="duplicates-list">{duplicatesRows}</ul>
          );
        }
        const checked = face.checked ? 'checked' : '';
        let relationToggleIconClass = '';
        if (collapseRelations[f]) {
          relationToggleIconClass = ' active';
        }

        const faceRow = (
          <tr key={f}>
            <td style={{ width: '35px' }}>
              <div className="select-checkbox-container">
                <input
                  type="checkbox"
                  value={f}
                  checked={checked}
                  onChange={() => false}
                />
                <span
                  className="select-checkbox"
                  onClick={() => this.toggleSelected(i, 'faces')}
                  onKeyDown={() => false}
                  role="button"
                  tabIndex={0}
                  aria-label="toggle selected"
                />
              </div>
            </td>
            <td style={{ width: '80px' }}>
              <div
                className="thumbnail-person"
                onClick={() => this.openUpdatePerson(i)}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="update person"
              >
                <img
                  src={face.thumbnail.src}
                  alt="Person"
                  className="import-to-db-thumb img-responsive"
                />
                <div className="thumbnail-person-edit">Edit</div>
              </div>
            </td>
            <td>
              <div>
                <Label>{label}</Label>
              </div>
              <div className={`import-to-db-details${duplicatesClass}`}>
                width: {face.default.width}px
                <br />
                height: {face.default.height}px
                <br />
                filetype: {face.default.type}
                <br />
                {rotate}
              </div>
              <div className="import-to-db-duplicates">
                {duplicatesTitle}
                {duplicatesOutput}
              </div>
              <div>
                <div
                  className="collapse-trigger"
                  onClick={() => this.toggleRelations(i)}
                  size="sm"
                  onKeyDown={() => false}
                  role="button"
                  tabIndex={0}
                  aria-label="toggle relations"
                >
                  Relations{' '}
                  <i className={`fa fa-angle-left${relationToggleIconClass}`} />
                </div>
                <Collapse isOpen={collapseRelations[f]}>
                  <ul className="collapse-relations-list">{faceRelations}</ul>
                </Collapse>
              </div>
            </td>
          </tr>
        );
        facesRows.push(faceRow);
        f += 1;
      }

      let classPieceChecked = '';
      if (classpiece.checked) {
        classPieceChecked = 'checked';
      }

      let classPieceRelationToggleIconClass = '';
      if (collapseRelations[0]) {
        classPieceRelationToggleIconClass = ' active';
      }

      const classpieceRow = (
        <tr key={0}>
          <td style={{ width: '35px' }}>
            <div className="select-checkbox-container">
              <input
                type="checkbox"
                value={0}
                onChange={() => false}
                checked={classPieceChecked}
              />
              <span
                className="select-checkbox"
                onClick={() => this.toggleSelected(-1, 'classpiece')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle selected"
              />
            </div>
          </td>
          <td style={{ width: '80px' }}>
            <img
              src={classpiece.thumbnail.src}
              alt="Classpiece"
              className="import-to-db-thumb img-responsive"
            />
          </td>
          <td>
            <Label>{classpiece.label}</Label>
            <div>
              width: {classpiece.default.width}px
              <br />
              height: {classpiece.default.height}px
              <br />
              filetype: {classpiece.default.type}
              <br />
              filename: {classpiece.fileName}
              <br />
            </div>
            <div
              className="collapse-trigger"
              onClick={() => this.toggleRelations(0)}
              size="sm"
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="toggle relations"
            >
              Relations{' '}
              <i
                className={`fa fa-angle-left${classPieceRelationToggleIconClass}`}
              />
            </div>
            <Collapse isOpen={collapseRelations[0]}>
              <ul className="collapse-relations-list">{classPieceRelations}</ul>
            </Collapse>
          </td>
        </tr>
      );
      tableRows.push(classpieceRow);
      tableRows = tableRows.concat(facesRows);

      let importFunction = this.importSelected;
      if (dbClasspiece !== null && dbClasspiece !== 0 && dbClasspiece !== '0') {
        importFunction = this.toggleReImportModal;
      }

      const toolbox = (
        <div className="sidebar-toolbox">
          <ImportToDBToolbox
            selectAll={this.selectAll}
            selectAllBtn={selectAllBtn}
            identifyDuplicates={this.identifyDuplicates}
            identifyDuplicatesBtn={identifyDuplicatesBtn}
            importSelected={importFunction}
            importSelectedBtn={importSelectedBtn}
          />
        </div>
      );

      // selected duplicate
      let selectedThumbnail = [];
      let selectedFace = [];
      let thumbnail = [];
      if (selectedPerson !== null) {
        selectedFace = selectedPerson;
        if (typeof selectedFace !== 'undefined') {
          thumbnail = selectedFace.thumbnail;
          if (
            typeof thumbnail !== 'undefined' &&
            typeof thumbnail.path !== 'undefined'
          ) {
            selectedThumbnail = (
              <img
                className="selected-face-thumbnail img-responsive img-thumbnail"
                alt="thumbnail"
                src={thumbnail.src}
              />
            );
          }
        }
      }
      let duplicateThumbnail = [];
      let duplicateFace = [];
      if (selectedDuplicate !== null) {
        duplicateFace = selectedDuplicate;
        const thumbnailURL = getThumbnailURL(duplicateFace);
        if (thumbnailURL !== null) {
          duplicateThumbnail = (
            <img
              className="selected-face-thumbnail img-responsive img-thumbnail"
              alt="thumbnail"
              src={thumbnailURL}
            />
          );
        }
      }

      let inputthumbnail = { src: '', path: '' };
      if (stateInputthumbnail) {
        inputthumbnail = stateInputthumbnail;
      }

      let mergedImage = [];
      if (
        typeof stateInputthumbnail !== 'undefined' &&
        typeof stateInputthumbnail.src !== 'undefined' &&
        stateInputthumbnail.src !== ''
      ) {
        mergedImage = (
          <img
            src={inputthumbnail.src}
            alt="Thumbnail placeholder"
            className="selected-face-thumbnail img-responsive img-thumbnail"
          />
        );
      }

      const duplicateImageOverClass = duplicateImageOver ? ' over' : '';

      const honorificPrefixInputs = inputhonorificprefix.map((h, i) => {
        let honorificPrefixActive = '';
        if (
          draggedElem === 'inputhonorificprefix' &&
          parseInt(draggedIndex, 10) === i
        ) {
          honorificPrefixActive = 'active';
        }

        const key = `a${i}`;
        let item = (
          <InputGroup key={key}>
            <Input
              className={honorificPrefixActive}
              type="text"
              name="inputhonorificprefix"
              placeholder="Person honorific prefix..."
              data-target="inputhonorificprefix"
              data-index={i}
              value={inputhonorificprefix[i]}
              onDrop={(e) => this.dragStopText(e, i)}
              onDragEnter={this.dragEnterText}
              onDragOver={this.dragOverText}
              onDragLeave={this.dragLeaveText}
              onChange={(e) => this.handleMultipleChange(e, i)}
            />
            <InputGroupAddon addonType="append">
              <Button
                type="button"
                color="info"
                outline
                onClick={() => this.removeHP(i, 'inputhonorificprefix')}
              >
                <b>
                  <i className="fa fa-minus" />
                </b>
              </Button>
            </InputGroupAddon>
          </InputGroup>
        );
        if (i === 0) {
          item = (
            <Input
              className={honorificPrefixActive}
              data-index={i}
              style={{ marginBottom: '5px' }}
              key={key}
              type="text"
              name="inputhonorificprefix"
              placeholder="Person honorific prefix..."
              value={inputhonorificprefix[i]}
              data-target="inputhonorificprefix"
              onDrop={(e) => this.dragStopText(e, i)}
              onDragEnter={this.dragEnterText}
              onDragOver={this.dragOverText}
              onDragLeave={this.dragLeaveText}
              onChange={(e) => this.handleMultipleChange(e, i)}
            />
          );
        }
        return item;
      });

      let duplicateDiocese = { label: '', type: '' };
      if (
        typeof duplicateFace !== 'undefined' &&
        typeof duplicateFace.organisations !== 'undefined' &&
        duplicateFace.organisations.length > 0
      ) {
        duplicateDiocese = {
          label: duplicateFace.organisations[0].ref.label,
          type: duplicateFace.organisations[0].ref.organisationType,
        };
      }

      let firstNameActive = '';
      let middleNameActive = '';
      let lastNameActive = '';
      let dioceseActive = '';
      let dioceseTypeActive = '';
      let typeActive = '';
      if (draggedElem === 'inputfirstname') {
        firstNameActive = 'active';
      }
      if (draggedElem === 'inputmiddlename') {
        middleNameActive = 'active';
      }
      if (draggedElem === 'inputlastname') {
        lastNameActive = 'active';
      }
      if (draggedElem === 'inputdiocese') {
        dioceseActive = 'active';
      }
      if (draggedElem === 'inputdioceseType') {
        dioceseTypeActive = 'active';
      }
      if (draggedElem === 'inputtype') {
        typeActive = 'active';
      }

      // 1. classpiece person values
      let cphp = [];
      let cpfn = [];
      let cpmn = [];
      let cpln = [];
      let cpdo = [];
      let cpty = [];
      let selectedFaceHP = [];
      if (
        typeof selectedFace.honorificPrefix !== 'undefined' &&
        selectedFace.honorificPrefix.length > 0
      ) {
        selectedFaceHP = selectedFace.honorificPrefix.map((hp, index) => {
          const key = `a${index}`;
          return (
            <div
              key={key}
              draggable="true"
              onDragStart={(e) => this.startDragText(e)}
              className="thumbnail-textbox"
            >
              {hp}
            </div>
          );
        });
      }
      if (selectedFaceHP.length > 0) {
        cphp = (
          <div className="form-group">
            <Label>Honorific Prefix</Label>
            {selectedFaceHP}
          </div>
        );
      }
      if (selectedFace.firstName !== '') {
        cpfn = (
          <div className="form-group">
            <Label>First Name</Label>
            <div
              draggable="true"
              onDragStart={(e) => this.startDragText(e)}
              className="thumbnail-textbox"
            >
              {selectedFace.firstName}
            </div>
          </div>
        );
      }
      if (selectedFace.middleName !== '') {
        cpmn = (
          <div className="form-group">
            <Label>Middle Name</Label>
            <div
              draggable="true"
              onDragStart={(e) => this.startDragText(e)}
              className="thumbnail-textbox"
            >
              {selectedFace.middleName}
            </div>
          </div>
        );
      }
      if (selectedFace.lastName !== '') {
        cpln = (
          <div className="form-group">
            <Label>Last Name</Label>
            <div
              draggable="true"
              onDragStart={(e) => this.startDragText(e)}
              className="thumbnail-textbox"
            >
              {selectedFace.lastName}
            </div>
          </div>
        );
      }
      if (selectedFace.diocese !== '') {
        cpdo = (
          <div className="form-group">
            <Label>Diocese | Order</Label>
            <div
              draggable="true"
              onDragStart={(e) => this.startDragText(e)}
              className="thumbnail-textbox"
            >
              {selectedFace.diocese}
            </div>
            <div
              draggable="true"
              onDragStart={(e) => this.startDragText(e)}
              className="thumbnail-textbox"
            >
              {selectedFace.dioceseType}
            </div>
          </div>
        );
      }
      if (selectedFace.type !== '') {
        cpty = (
          <div className="form-group">
            <Label>Type</Label>
            <div
              draggable="true"
              onDragStart={(e) => this.startDragText(e)}
              className="thumbnail-textbox"
            >
              {selectedFace.type}
            </div>
          </div>
        );
      }

      // 2. db person values
      let dbhp = [];
      let dbfn = [];
      let dbmn = [];
      let dbln = [];
      let dbdo = [];
      let dbty = [];

      let duplicateFaceHP = [];
      if (
        typeof duplicateFace.honorificPrefix !== 'undefined' &&
        duplicateFace.honorificPrefix.length > 0
      ) {
        duplicateFaceHP = duplicateFace.honorificPrefix.map((hp, index) => {
          const key = `a${index}`;
          return (
            <div
              key={key}
              draggable="true"
              onDragStart={(e) => this.startDragText(e)}
              className="thumbnail-textbox"
            >
              {hp}
            </div>
          );
        });
      }
      if (duplicateFaceHP.length > 0) {
        dbhp = (
          <div className="form-group">
            <Label>Honorific Prefix</Label>
            {duplicateFaceHP}
          </div>
        );
      }
      if (duplicateFace.firstName !== '') {
        dbfn = (
          <div className="form-group">
            <Label>First Name</Label>
            <div
              draggable="true"
              onDragStart={(e) => this.startDragText(e)}
              className="thumbnail-textbox"
            >
              {duplicateFace.firstName}
            </div>
          </div>
        );
      }
      if (duplicateFace.middleName !== '') {
        dbmn = (
          <div className="form-group">
            <Label>Middle Name</Label>
            <div
              draggable="true"
              onDragStart={(e) => this.startDragText(e)}
              className="thumbnail-textbox"
            >
              {duplicateFace.middleName}
            </div>
          </div>
        );
      }
      if (duplicateFace.lastName !== '') {
        dbln = (
          <div className="form-group">
            <Label>Last Name</Label>
            <div
              draggable="true"
              onDragStart={(e) => this.startDragText(e)}
              className="thumbnail-textbox"
            >
              {duplicateFace.lastName}
            </div>
          </div>
        );
      }
      if (duplicateDiocese.label !== '') {
        dbdo = (
          <div className="form-group">
            <Label>Diocese | Order</Label>
            <div
              draggable="true"
              onDragStart={(e) => this.startDragText(e)}
              className="thumbnail-textbox"
            >
              {duplicateDiocese.label}
            </div>
            <div
              draggable="true"
              onDragStart={(e) => this.startDragText(e)}
              className="thumbnail-textbox"
            >
              {duplicateDiocese.type}
            </div>
          </div>
        );
      }
      if (
        typeof duplicateFace.resources !== 'undefined' &&
        duplicateFace.resources.find((r) => r.term.label === 'isDepictedOn') !==
          'undefined'
      ) {
        const dbtype = duplicateFace.resources.find(
          (r) => r.term.label === 'isDepictedOn'
        ).term.role;
        dbty = (
          <div className="form-group">
            <Label>Type</Label>
            <div
              draggable="true"
              onDragStart={(e) => this.startDragText(e)}
              className="thumbnail-textbox"
            >
              {dbtype}
            </div>
          </div>
        );
      }

      const duplicateModal = (
        <Modal
          isOpen={duplicateModalOpen}
          toggle={this.toggleDuplicateModal}
          className="duplicate-modal"
          size="lg"
        >
          <form onSubmit={this.mergePerson}>
            <ModalHeader toggle={this.toggleDuplicateModal}>
              Merge person
            </ModalHeader>
            <ModalBody>
              <div className="row">
                <div className="col-xs-12 col-sm-4">
                  <h4>Classpiece person</h4>
                  <div className="selected-item-thumbnail">
                    <div
                      draggable="true"
                      onDragStart={this.startDragImage.bind(this, thumbnail)}
                      className=""
                    >
                      {selectedThumbnail}
                    </div>
                  </div>
                  {cphp}
                  {cpfn}
                  {cpmn}
                  {cpln}
                  {cpdo}
                  {cpty}
                </div>

                <div className="col-xs-12 col-sm-4">
                  <h4>Merged person</h4>
                  <input
                    type="hidden"
                    name="input_id"
                    value={inputId}
                    onChange={this.handleChange}
                  />
                  <div className="selected-item-thumbnail">
                    <div
                      className={`duplicate-thumbnail-placeholder${duplicateImageOverClass}`}
                      onDrop={this.dragStopImage.bind(this)}
                      onDragEnter={this.dragEnterText.bind(this)}
                      onDragOver={this.dragOverText.bind(this)}
                      onDragLeave={this.dragLeaveText.bind(this)}
                      data-target="inputthumbnail"
                    >
                      {mergedImage}
                    </div>
                  </div>
                  <div className="form-group">
                    <Label>Honorific Prefix</Label>
                    {honorificPrefixInputs}
                    <div className="text-right">
                      <Button
                        type="button"
                        color="info"
                        outline
                        size="xs"
                        onClick={() => this.addHP('inputhonorificprefix')}
                      >
                        Add new <i className="fa fa-plus" />
                      </Button>
                    </div>
                  </div>
                  <div className="form-group">
                    <Label>First Name</Label>
                    <input
                      onChange={this.handleChange}
                      value={inputfirstname}
                      onDrop={(e) => this.dragStopText(e)}
                      onDragEnter={this.dragEnterText}
                      onDragOver={this.dragOverText}
                      onDragLeave={this.dragLeaveText}
                      data-target="inputfirstname"
                      type="text"
                      className={`form-control ${firstNameActive}`}
                      name="inputfirstname"
                    />
                  </div>
                  <div className="form-group">
                    <Label>Middle Name</Label>
                    <input
                      onChange={this.handleChange}
                      value={inputmiddlename}
                      onDrop={(e) => this.dragStopText(e)}
                      onDragEnter={this.dragEnterText}
                      onDragOver={this.dragOverText}
                      onDragLeave={this.dragLeaveText}
                      data-target="inputmiddlename"
                      type="text"
                      className={`form-control ${middleNameActive}`}
                      name="inputmiddlename"
                    />
                  </div>
                  <div className="form-group">
                    <Label>Last Name</Label>
                    <input
                      onChange={this.handleChange}
                      value={inputlastname}
                      onDrop={(e) => this.dragStopText(e)}
                      onDragEnter={this.dragEnterText}
                      onDragOver={this.dragOverText}
                      onDragLeave={this.dragLeaveText}
                      data-target="inputlastname"
                      type="text"
                      className={`form-control ${lastNameActive}`}
                      name="inputlastname"
                    />
                  </div>
                  <div className="form-group">
                    <Label>Diocese | Order</Label>
                    <input
                      onChange={this.handleChange}
                      value={inputdiocese}
                      onDrop={(e) => this.dragStopText(e)}
                      onDragEnter={this.dragEnterText}
                      onDragOver={this.dragOverText}
                      onDragLeave={this.dragLeaveText}
                      data-target="inputdiocese"
                      type="text"
                      className={`form-control ${dioceseActive}`}
                      name="inputdiocese"
                    />
                    <select
                      style={{ marginTop: '5px' }}
                      className={`form-control ${dioceseTypeActive}`}
                      onChange={this.handleChange}
                      value={inputdioceseType}
                      onDrop={(e) => this.dragStopText(e)}
                      onDragEnter={this.dragEnterText}
                      onDragOver={this.dragOverText}
                      onDragLeave={this.dragLeaveText}
                      name="inputdioceseType"
                    >
                      <option value="diocese">Diocese</option>
                      <option value="order">Order</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <Label>Type</Label>
                    <select
                      name="inputtype"
                      className={`form-control ${typeActive}`}
                      onDrop={this.dragStopText}
                      onDragEnter={this.dragEnterText}
                      onDragOver={this.dragOverText}
                      onDragLeave={this.dragLeaveText}
                      onChange={this.handleChange}
                      data-target="inputtype"
                      value={inputtype}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="guestOfHonor">Guest of honor</option>
                    </select>
                  </div>
                </div>

                <div className="col-xs-12 col-sm-4">
                  <h4>Database person</h4>
                  <div className="merge-column">
                    <div className="selected-item-thumbnail">
                      {duplicateThumbnail}
                    </div>
                    {dbhp}
                    {dbfn}
                    {dbmn}
                    {dbln}
                    {dbdo}
                    {dbty}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12 col-sm-4">
                  <div className="form-group">
                    <Button
                      type="button"
                      outline
                      color="primary"
                      size="sm"
                      onClick={this.copyRight}
                    >
                      Copy right <i className="fa fa-angle-right" />
                    </Button>
                  </div>
                </div>
                <div className="col-xs-12 col-sm-4" />
                <div className="col-xs-12 col-sm-4">
                  <div className="form-group text-right">
                    <Button
                      type="button"
                      outline
                      color="primary"
                      size="sm"
                      onClick={this.copyLeft}
                    >
                      <i className="fa fa-angle-left" /> Copy left
                    </Button>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" size="sm" outline type="submit">
                {mergePersonBtn}
              </Button>
              <Button
                color="warning"
                size="sm"
                outline
                type="button"
                onClick={this.undoMerge}
              >
                Undo Merge
              </Button>
              <Button
                type="button"
                size="sm"
                color="secondary"
                onClick={this.closeSelectedModal}
              >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      );

      const updateHonorificPrefixInputs = updateHonorificPrefix.map((h, i) => {
        let honorificPrefixActive = '';
        if (
          draggedElem === 'updateHonorificPrefix' &&
          parseInt(draggedIndex, 10) === i
        ) {
          honorificPrefixActive = 'active';
        }
        const key = `a${i}`;
        let item = (
          <InputGroup key={key}>
            <Input
              className={honorificPrefixActive}
              type="text"
              name="updateHonorificPrefix"
              id="honorificPrefix"
              placeholder="Person honorific prefix..."
              data-target="updateHonorificPrefix"
              data-index={i}
              value={updateHonorificPrefix[i]}
              onDrop={(e) => this.dragStopText(e, i)}
              onDragEnter={this.dragEnterText}
              onDragOver={this.dragOverText}
              onDragLeave={this.dragLeaveText}
              onChange={(e) => this.handleMultipleChange(e, i)}
            />
            <InputGroupAddon addonType="append">
              <Button
                type="button"
                color="info"
                outline
                onClick={() => this.removeHP(i, 'updateHonorificPrefix')}
              >
                <b>
                  <i className="fa fa-minus" />
                </b>
              </Button>
            </InputGroupAddon>
          </InputGroup>
        );
        if (i === 0) {
          item = (
            <Input
              className={honorificPrefixActive}
              data-index={i}
              style={{ marginBottom: '5px' }}
              key={key}
              type="text"
              name="updateHonorificPrefix"
              placeholder="Person honorific prefix..."
              value={updateHonorificPrefix[i]}
              data-target="updateHonorificPrefix"
              onDrop={(e) => this.dragStopText(e, i)}
              onDragEnter={this.dragEnterText}
              onDragOver={this.dragOverText}
              onDragLeave={this.dragLeaveText}
              onChange={(e) => this.handleMultipleChange(e, i)}
            />
          );
        }
        return item;
      });

      const updateModal = (
        <Modal
          isOpen={updateModalOpen}
          toggle={this.toggleUpdateModal}
          className={`${className} update-modal`}
        >
          <form onSubmit={this.updatePerson}>
            <ModalHeader toggle={this.toggleUpdateModal}>
              Update person
            </ModalHeader>
            <ModalBody>
              <div className="row">
                <div className="col-xs-12 col-sm-4 col-md-4">
                  {selectedThumbnail}
                </div>
                <div className="col-xs-12 col-sm-8 col-md-8">
                  <div className="form-group">
                    <Label>Honorific Prefix</Label>
                    {updateHonorificPrefixInputs}

                    <div className="text-right">
                      <Button
                        type="button"
                        color="info"
                        outline
                        size="xs"
                        onClick={() => this.addHP('updateHonorificPrefix')}
                      >
                        Add new <i className="fa fa-plus" />
                      </Button>
                    </div>
                  </div>
                  <div className="form-group">
                    <Label>First Name</Label>
                    <input
                      onChange={this.handleChange}
                      value={updateFirstName}
                      type="text"
                      className="form-control"
                      name="updateFirstName"
                    />
                  </div>
                  <div className="form-group">
                    <Label>Middle Name</Label>
                    <input
                      onChange={this.handleChange}
                      value={updateMiddleName}
                      type="text"
                      className="form-control"
                      name="updateMiddleName"
                    />
                  </div>
                  <div className="form-group">
                    <Label>Last Name</Label>
                    <input
                      onChange={this.handleChange}
                      value={updateLastName}
                      type="text"
                      className="form-control"
                      name="updateLastName"
                    />
                  </div>
                  <div className="form-group">
                    <Label>Diocese | Order</Label>
                    <input
                      onChange={this.handleChange}
                      value={updateDiocese}
                      type="text"
                      className="form-control"
                      name="updateDiocese"
                    />
                    <select
                      style={{ marginTop: '5px' }}
                      className="form-control"
                      onChange={this.handleChange}
                      value={updateDioceseType}
                      name="updateDioceseType"
                    >
                      <option value="diocese">Diocese</option>
                      <option value="order">Order</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <Label>Type</Label>
                    <select
                      name="updateType"
                      className="form-control"
                      onChange={this.handleChange}
                      value={updateType}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="guestOfHonor">Guest of honor</option>
                    </select>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" outline type="submit" size="sm">
                Update person
              </Button>
              <Button
                type="button"
                color="secondary"
                onClick={this.closeSelectedModal}
                size="sm"
              >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      );

      const reImportModal = (
        <Modal
          isOpen={reImportModalOpen}
          toggle={this.toggleReImportModal}
          className={`${className} update-modal`}
        >
          <ModalHeader toggle={this.toggleReImportModal}>
            Re-import Classpiece confirm
          </ModalHeader>
          <ModalBody>
            <p>
              If you continue the selected items will be re-imported into the
              repository, resulting in duplicates. Continue?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" outline onClick={this.importSelected}>
              Re-import
            </Button>
            <Button color="secondary" onClick={this.toggleReImportModal}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      );

      content = (
        <div>
          <div className="row">
            <div className="col-xs-12 col-sm-8">
              <p>
                The following objects have been identified and are ready to be
                imported.
              </p>
            </div>
            <div className="col-xs-12 col-sm-4">
              <div className="text-right" />
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <table className="import-to-db-table">
                <tbody>{tableRows}</tbody>
              </table>
              <div className="text-right" style={{ padding: '15px 0' }}>
                <Button color="primary" outline onClick={importFunction}>
                  {importSelectedBtn}
                </Button>
              </div>
            </div>
          </div>
          {toolbox}
          {duplicateModal}
          {updateModal}
          {reImportModal}
        </div>
      );
    }

    let heading = 'Import data to repository';
    if (dbClasspiece !== null && dbClasspiece !== 0 && dbClasspiece !== '0') {
      heading = 'Re-import data to repository';
    }
    const { match } = this.props;
    const { fileName } = match.params;
    const breadcrumbsItems = [
      {
        label: 'Parse Class Pieces',
        icon: 'pe-7s-tools',
        active: false,
        path: '/parse-class-pieces',
      },
      {
        label: `Class Piece "${fileName}"`,
        icon: '',
        active: false,
        path: `/parse-class-piece/${fileName}`,
      },
      { label: heading, icon: '', active: true, path: '' },
    ];
    return (
      <div>
        {redirect}
        <Breadcrumbs items={breadcrumbsItems} />
        <div className="row">
          <div className="col-12">
            <h2>{heading}</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-12">{content}</div>
        </div>
      </div>
    );
  }
}

ImportClassPieceToDB.defaultProps = {
  match: null,
};
ImportClassPieceToDB.propTypes = {
  match: PropTypes.object,
};
