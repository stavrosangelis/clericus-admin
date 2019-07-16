import React, { Component } from 'react';
import {Spinner,Collapse, Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import axios from 'axios';
import {loadProgressBar} from 'axios-progress-bar';
import {APIPath} from '../../static/constants';
import ImportToDBToolbox from './right-sidebar-import-to-db';
import {Breadcrumbs} from '../../components/breadcrumbs';

export default class ImportClassPieceToDB extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      compact: false,
      data: [],
      dbClasspiece: null,
      collapseRelations: [],
      identifyDuplicatesStatus: false,
      actionsOpen: false,
      identifyDuplicatesBtn: <span>Identify possible duplicates</span>,
      selectAllBtn: <span>Deselect All</span>,
      selectAllStatus: true,
      selectedPerson: [],
      selectedPersonIndex: null,
      selectedDuplicate:[],
      duplicateModal: false,
      duplicateImageOver: false,
      inputthumbnail: '',
      inputfirstname: '',
      inputlastname: '',
      inputdiocese: '',
      input_id: '',
      mergePersonBtn: <span>Merge Person</span>,
      updateModal: false,
      updateFirstName: '',
      updateLastName: '',
      updateDiocese: '',
      importSelectedBtn: <span>Import selected</span>,
      importSelectedStatus: false,
      reImportModalOpen: false,
    }
    this.loadStatus = this.loadStatus.bind(this);
    this.toggleRelations = this.toggleRelations.bind(this);
    this.actionsToggle = this.actionsToggle.bind(this);
    this.identifyDuplicates = this.identifyDuplicates.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleDuplicateModal = this.toggleDuplicateModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
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
  }

  toggleRelations = (i) => {
    let collapseRelations = this.state.collapseRelations;
    let collapseRelation = collapseRelations[i];
    collapseRelation = !collapseRelation;
    collapseRelations[i] = collapseRelation;
    this.setState({
      collapseRelations: collapseRelations
    })
  }

  actionsToggle = () => {
    this.setState({
      actionsOpen: !this.state.actionsOpen
    });
  }

  loadStatus = () => {
    let file = this.props.match.params.fileName;
    let context = this;
    axios({
        method: 'get',
        url: APIPath+'prepare-classpiece-ingestion?file='+file,
        crossDomain: true,
      })
    .then(function (response) {
      let responseData = response.data.data;

      let collapseRelations = [];
      collapseRelations.push(false);

      let newData = [];
      let newClassPiece = responseData.classpiece;
      newClassPiece.checked = true;
      newData.classpiece=newClassPiece;
      let newFaces = [];
      for (let i=0;i<responseData.faces.length;i++) {
        let face = responseData.faces[i];
        face.checked = true;
        newFaces.push(face);
        collapseRelations.push(false);
      }
      newData.faces = newFaces;

      let stateUpdate = {
        loading: false,
        data: newData,
        dbClasspiece: responseData.dbClasspiece,
        collapseRelations: collapseRelations
      }
      if (responseData.dbClasspiece!==null) {
        stateUpdate.importSelectedBtn = <span>Re-import selected</span>;
      }
      context.setState(stateUpdate);

    })
    .catch(function (error) {
    });
  }

  identifyDuplicates = () => {
    let context = this;
    if (this.state.identifyDuplicatesStatus) {
      return false;
    }
    this.setState({
      identifyDuplicatesBtn: <span><i>Identifying...</i> <Spinner color="secondary" size="sm" /></span>,
      identifyDuplicatesStatus: true
    });
    axios({
      method: 'post',
      url: APIPath+'prepare-classpiece-identify-duplicates',
      crossDomain: true,
      data: {faces: this.state.data.faces},
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
	  .then(function (response) {
      let newFaces = response.data.data;
      let stateData = context.state.data;
      for (let i=0; i<newFaces.length; i++) {
        let newFace = newFaces[i];
        if (typeof newFace.matches!=="undefined" && newFace.matches.length>0) {
          let matches = newFace.matches;
          matches.sort(function (a,b) {
            return b.score - a.score;
          });
        }
      }
      stateData.faces = newFaces;
      context.setState({
        data: stateData,
        identifyDuplicatesStatus: false,
        identifyDuplicatesBtn: <span>Identification complete <i className="fa fa-check"></i></span>
      });

      setTimeout(function() {
        context.setState({
          identifyDuplicatesBtn: <span>Identify possible duplicates</span>
        });
      },2000)
	  })
	  .catch(function (error) {
	  });
  }

  selectAll = () => {
    let selectAllBtn = <span>Select All</span>;
    let selectAllStatus = !this.state.selectAllStatus;
    if (selectAllStatus) {
      selectAllBtn = <span>Deselect All</span>;
    }
    let stateData = this.state.data;
    let classPiece = stateData.classpiece;
    classPiece.checked = selectAllStatus;

    let newFaces = [];
    let faces = stateData.faces;
    for (let i=0;i<faces.length; i++) {
      let face = faces[i];
      face.checked = selectAllStatus;
      newFaces.push(face);
    }
    stateData.faces = newFaces;
    this.setState({
      selectAllStatus: !this.state.selectAllStatus,
      selectAllBtn: selectAllBtn,
      data: stateData
    })
  }

  toggleSelected = (i, type) => {
    let stateData = this.state.data;
    let stateDataType = stateData[type];
    if (type==="faces") {
      i = i-1;
      let item = stateDataType[i];
      item.checked = !item.checked;
      stateDataType[i] = item;
    }
    else {
      let item = stateDataType;
      item.checked = !item.checked;
      stateDataType = item;
    }

    stateData[type] = stateDataType;
    this.setState({
      data: stateData
    });
  }

  toggleDuplicateModal = () => {
    this.setState({
      duplicateModal: !this.state.duplicateModal
    })
  }

  handleChange = (e) => {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;

    this.setState({
      [name]: value
    });
  }

  startDragText = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData("text/html", e.target.id);
    e.dataTransfer.dropEffect = "move";
    this.setState({
      draggableText: e.target.textContent
    })
  }

  startDragImage = (thumbnail, e) => {
    e.stopPropagation();
    e.dataTransfer.setData("text/html", e.target.id);
    e.dataTransfer.dropEffect = "move";
    this.setState({
      draggableImage: thumbnail
    })
  }

  dragStopText = (e) => {
    let target = e.target.getAttribute("data-target");
    let targetText = this.state.draggableText;
    this.setState({
      [target]: targetText
    })
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  dragStopImage = (e) => {
    let target = e.target.getAttribute("data-target");
    this.setState({
      [target]: this.state.draggableImage,
      duplicateImageOver: false
    })
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  dragOverText = (e) => {
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  dragEnterText = (e) => {
    let target = e.target.getAttribute("data-target");
    if (target==="inputthumbnail" && !this.state.duplicateImageOver) {
      this.setState({
        duplicateImageOver: true
      });
    }
    e.preventDefault();
    e.stopPropagation();
  }

  dragLeaveText = (e) => {
    if (this.state.duplicateImageOver) {
      this.setState({
        duplicateImageOver: false
      });
    }
    e.preventDefault();
    return false;
  }

  selectPossibleDuplicate = (i, fm) => {
    let person = this.state.data.faces[i];
    let possibleDuplicate = person.matches[fm];
    this.setState({
      inputthumbnail: '',
      inputfirstname: '',
      inputlastname: '',
      inputdiocese: '',
      input_id: '',
      selectedPerson: person,
      selectedPersonIndex: i,
      selectedDuplicate: possibleDuplicate,
      duplicateModal: true
    });
    let context = this;
    setTimeout(function() {
      context.copyRight();
    },250)

  }

  copyRight = () => {
    let srcPerson = this.state.selectedPerson;
    let firstName = '';
    let lastName = '';
    let diocese = '';
    let thumbnail = '';
    if (typeof srcPerson.firstName!=="undefined") {
      firstName = srcPerson.firstName;
    }
    if (typeof srcPerson.lastName!=="undefined") {
      lastName = srcPerson.lastName;
    }
    if (typeof srcPerson.diocese!=="undefined") {
      diocese = srcPerson.diocese;
    }
    if (typeof srcPerson.thumbnail!=="undefined") {
      thumbnail = srcPerson.thumbnail;
    }
    this.setState({
      inputthumbnail: thumbnail,
      inputfirstname: firstName,
      inputlastname: lastName,
      inputdiocese: diocese,
      input_id: '',
    });
  }

  copyLeft = () => {
    let srcPerson = this.state.selectedDuplicate;
    let firstName = '';
    let lastName = '';
    let diocese = '';
    let thumbnail = '';
    if (typeof srcPerson.firstName!=="undefined") {
      firstName = srcPerson.firstName;
    }
    if (typeof srcPerson.lastName!=="undefined") {
      lastName = srcPerson.lastName;
    }
    if (typeof srcPerson.diocese!=="undefined") {
      diocese = srcPerson.diocese;
    }
    if (typeof srcPerson.thumbnail!=="undefined") {
      thumbnail = srcPerson.thumbnail;
    }
    this.setState({
      inputthumbnail: thumbnail,
      inputfirstname: firstName,
      inputlastname: lastName,
      inputdiocese: diocese,
      input_id: '',
    });
  }

  mergePerson = (e) => {
    e.preventDefault();
    let data = this.state.data;
    let faces = data.faces;
    let newPerson = this.state.selectedPerson;
    let personIndex = this.state.selectedPersonIndex;
    let newId = this.state.selectedDuplicate._id;
    let inputthumbnail = this.state.inputthumbnail;
    let inputfirstname = this.state.inputfirstname;
    let inputlastname = this.state.inputlastname;
    let inputdiocese = this.state.inputdiocese;

    newPerson.thumbnail = inputthumbnail;
    newPerson.firstName = inputfirstname;
    newPerson.lastName = inputlastname;
    newPerson.diocese = inputdiocese;
    newPerson._id = newId;
    faces[personIndex] = newPerson;
    data.faces = faces;
    this.setState({
      data: data
    })
  }

  undoMerge = () => {
    let stateIndex = this.state.selectedPersonIndex;
    let file = this.props.match.params.fileName;
    let context = this;
    axios({
        method: 'get',
        url: APIPath+'prepare-classpiece-ingestion?file='+file,
        crossDomain: true,
      })
    .then(function (response) {
      let responseData = response.data.data;
      let stateData = context.state.data;
      let stateFaces = context.state.data.faces;

      let stateFace = stateFaces[stateIndex];
      let stateFaceMatches = stateFace.matches;
      let stateFaceChecked = stateFace.checked;

      let undoFace = responseData.faces[stateIndex];
      undoFace.matches = stateFaceMatches;
      undoFace.checked = stateFaceChecked;
      stateFaces[stateIndex] = undoFace;
      stateData.faces = stateFaces;
      context.setState({
        selectedPerson: undoFace,
        data: stateData,
      })

      setTimeout(function() {
        context.copyRight();
      },250)
    })
    .catch(function (error) {
    });

  }

  toggleUpdateModal = () => {
    this.setState({
      updateModal: !this.state.updateModal
    })
  }

  openUpdatePerson = (i) => {
    let person = this.state.data.faces[i];
    let thumbnail = '';
    if (typeof person.thumbnail!=="undefined") {
      thumbnail = person.thumbnail;
    }
    let firstName = '';
    if (typeof person.firstName!=="undefined") {
      firstName = person.firstName;
    }
    let lastName = '';
    if (typeof person.lastName!=="undefined") {
      lastName = person.lastName;
    }
    let diocese = '';
    if (typeof person.diocese!=="undefined") {
      diocese = person.diocese;
    }
    this.setState({
      inputthumbnail: thumbnail,
      updateFirstName: firstName,
      updateLastName: lastName,
      updateDiocese: diocese,
      selectedPerson: person,
      selectedPersonIndex: i,
      updateModal: true
    })
  }

  updatePerson = (e) => {
    e.preventDefault();
    let data = this.state.data;
    let faces = this.state.data.faces;
    let person = this.state.data.faces[this.state.selectedPersonIndex];
    person.firstName = this.state.updateFirstName;
    person.lastName = this.state.updateLastName;
    person.diocese = this.state.updateDiocese;
    faces[this.state.selectedPersonIndex] = person;
    data.faces = faces;
    this.setState({
      data: data,
      updateModal: false
    })

  }

  importSelected = (e) => {
    if (this.state.importSelectedStatus) {
      return false;
    }
    this.setState({
      importSelectedBtn: <span><i>Importing...</i> <Spinner color="secondary" size="sm" /></span>,
      importSelectedStatus: true
    })
    let file = this.props.match.params.fileName;
    let stateData = this.state.data;
    let postData = {};
    postData.file = file;
    let classPiece = stateData.classpiece;
    if (classPiece.checked) {
      postData.classpiece = classPiece;
    }
    let faces = stateData.faces;
    let checkedFaces = [];
    for (let i=0;i<faces.length;i++) {
      let face = faces[i];
      if (face.checked) {
        checkedFaces.push(face);
      }
    }
    postData.faces = checkedFaces;

    let context = this;
    axios({
        method: 'post',
        url: APIPath+'ingest-classpiece',
        crossDomain: true,
        data: postData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    .then(function (response) {
      context.setState({
        importSelectedStatus: false,
        importSelectedBtn: <span>Import complete <i className="fa fa-check"></i></span>
      });

      setTimeout(function() {
        context.setState({
          importSelectedBtn: <span>Import selected</span>
        });
      },2000)

    })
    .catch(function (error) {
    });

  }

  toggleReImportModal = () => {
    this.setState({
      reImportModalOpen: !this.state.reImportModalOpen
    });
  }

  componentDidMount() {
    loadProgressBar();
    this.loadStatus();
  }

  render() {
    let content = <div className="row">
      <div className="col-12">
        <div style={{padding: '40pt',textAlign: 'center'}}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
    if (!this.state.loading) {
      let data = this.state.data;
      let classpiece = data.classpiece;
      let faces = data.faces;
      let tableRows = [];
      let classPieceRelations = [];

      // faces
      let f=1;
      let facesRows = [];
      for (let i=0; i<faces.length; i++) {
        let face = faces[i];
        let rotate = [];
        if (typeof face.default.rotate!=="undefined" && face.default.rotate!==0) {
          rotate = <span>rotate: {face.default.rotate}</span>
        }
        let label = '';
        if (face.firstName!=="" || face.lastName!=="") {
          label = face.firstName+' '+face.lastName;
          // classpiece relations
          let personRelation = <li key={"depicts-"+f}>
            <span className="type-of">[classpiece]</span> {classpiece.label} <span className="relation">depicts</span> <span className="type-of">[person]</span> {label}</li>;
          let resourceRelation = <li key={"hasPart-"+f}>
            <span className="type-of">[classpiece]</span> {classpiece.label} <span className="relation">hasPart</span> <span className="type-of">[resource]</span> <img src={face.thumbnail.src} alt="Person" className="import-to-db-thumb-small img-responsive" /></li>;
          classPieceRelations.push(personRelation);
          classPieceRelations.push(resourceRelation);
        }

        // face relations
        let faceRelations = [];
        let personToClasspieceRelation = <li key={0}>
          <span className="type-of">[person]</span> {label} <span className="relation">isDepictedOn</span> <span className="type-of">[classpiece]</span> {classpiece.label}</li>;
        let resourceToClasspieceRelation = <li key={1}>
          <span className="type-of">[resource]</span> <img src={face.thumbnail.src} alt="Person" className="import-to-db-thumb-small img-responsive" /> <span className="relation">isPartOf</span> <span className="type-of">[classpiece]</span> {classpiece.label}</li>;

        let resourceDioceseRelation = <li key={2}>
          <span className="type-of">[person]</span> {label} <span className="relation">isRegisteredTo</span> <span className="type-of">[diocese]</span> {face.diocese}</li>;

        if (face.firstName!=="" || face.lastName!=="") {
          faceRelations.push(personToClasspieceRelation);
        }

        faceRelations.push(resourceToClasspieceRelation);

        if (face.diocese.trim()!=="") {
          faceRelations.push(resourceDioceseRelation);
        }

        // duplicates
        let duplicatesRows = [];
        let duplicatesTitle = [];
        let duplicatesClass = "";
        let duplicatesOutput = [];
        if (typeof face.matches!=="undefined" && face.matches.length>0) {
          duplicatesTitle = <div><label>Possible duplicates</label></div>;
          duplicatesClass = " duplicates";
          for (let fm=0; fm<face.matches.length; fm++) {
            let faceMatch = face.matches[fm];
            let faceMatchRow = <li key={fm} id={faceMatch.id}><Button size="sm" type="button" onClick={this.selectPossibleDuplicate.bind(this, i, fm)}>{faceMatch.firstName} {faceMatch.lastName}</Button> [<i>{faceMatch.score}% match</i>]</li>
            duplicatesRows.push(faceMatchRow);
          }
          duplicatesOutput = <ul className="duplicates-list">{duplicatesRows}</ul>
        }
        let checked = "";
        if (face.checked) {
          checked = "checked";
        }
        let relationToggleIconClass = "";
        if (this.state.collapseRelations[f]) {
          relationToggleIconClass = " active";
        }

        let faceRow = <tr key={f}>
          <td style={{width: "35px"}}>
            <div className="select-checkbox-container">
              <input type="checkbox" value={f} checked={checked} onChange={() => {return false}}/>
              <span className="select-checkbox" onClick={this.toggleSelected.bind(this,f, "faces")}></span>
            </div>
          </td>
          <td style={{width: "80px"}}>
            <div className="thumbnail-person" onClick={this.openUpdatePerson.bind(this, i)}>
              <img src={face.thumbnail.src} alt="Person" className="import-to-db-thumb img-responsive" />
              <div className="thumbnail-person-edit">Edit</div>
            </div>
          </td>
          <td>
            <div>
              <label>{label}</label>
            </div>
            <div className={"import-to-db-details"+duplicatesClass}>
              width: {face.default.width}px<br/>
              height: {face.default.height}px<br/>
              filetype: {face.default.type}<br/>
              {rotate}
            </div>
            <div className="import-to-db-duplicates">{duplicatesTitle}{duplicatesOutput}</div>
            <div>
              <div className="collapse-trigger" onClick={this.toggleRelations.bind(this,f)} size="sm">Relations <i className={"fa fa-angle-left"+relationToggleIconClass} /></div>
              <Collapse isOpen={this.state.collapseRelations[f]}>
                <ul className="collapse-relations-list">{faceRelations}</ul>
              </Collapse>
            </div>
          </td>
        </tr>;
        facesRows.push(faceRow);
        f++;
      }

      let classPieceChecked = "";
      if (classpiece.checked) {
        classPieceChecked = "checked";
      }


      let classPieceRelationToggleIconClass = "";
      if (this.state.collapseRelations[0]) {
        classPieceRelationToggleIconClass = " active";
      }

      let classpieceRow = <tr key={0}>
        <td style={{width: "35px"}}>
          <div className="select-checkbox-container">
            <input type="checkbox" value={0} onChange={()=>{return false;}} checked={classPieceChecked}/>
            <span className="select-checkbox" onClick={this.toggleSelected.bind(this,0,"classpiece")}></span>
          </div>
        </td>
        <td style={{width: "80px"}}><img src={classpiece.thumbnail.src} alt="Classpiece" className="import-to-db-thumb img-responsive" /></td>
        <td>
          <label>{classpiece.label}</label>
          <div>
            width: {classpiece.default.width}px<br/>
            height: {classpiece.default.height}px<br/>
            filetype: {classpiece.default.type}<br/>
            filename: {classpiece.fileName}<br/>
          </div>
          <div className="collapse-trigger" onClick={this.toggleRelations.bind(this,0)} size="sm">Relations <i className={"fa fa-angle-left"+classPieceRelationToggleIconClass} /></div>
          <Collapse isOpen={this.state.collapseRelations[0]}>
            <ul className="collapse-relations-list">{classPieceRelations}</ul>
          </Collapse>
        </td>
      </tr>;
      tableRows.push(classpieceRow);
      tableRows = tableRows.concat(facesRows);

      let importFunction = this.importSelected;
      if (this.state.dbClasspiece!==null) {
        importFunction = this.toggleReImportModal;
      }

      let toolbox = <div className={"sidebar-toolbox"}>
        <ImportToDBToolbox
          selectAll={this.selectAll}
          selectAllBtn={this.state.selectAllBtn}
          identifyDuplicates={this.identifyDuplicates}
          identifyDuplicatesBtn={this.state.identifyDuplicatesBtn}
          importSelected={importFunction}
          importSelectedBtn={this.state.importSelectedBtn}
          />
      </div>;

      // selected duplicate
      let selectedThumbnail = [];
      let selectedFace = [];
      let thumbnail = [];
      if (this.state.selectedPerson!==null) {
        selectedFace = this.state.selectedPerson;
        if (typeof selectedFace!=="undefined") {
          thumbnail = selectedFace.thumbnail;
          if (typeof thumbnail!=="undefined" && typeof thumbnail.path!=="undefined") {
            selectedThumbnail = <img className="selected-face-thumbnail img-responsive img-thumbnail" alt="thumbnail" src={thumbnail.src} />
          }
        }
      }
      let duplicateThumbnail = [];
      let duplicateFace = [];
      let newThumbnail = [];
      if (this.state.selectedDuplicate!==null) {
        duplicateFace = this.state.selectedDuplicate;
        if (typeof duplicateFace!=="undefined") {
          newThumbnail = duplicateFace.thumbnail;
          if (typeof newThumbnail!=="undefined" && typeof newThumbnail.path!=="undefined") {
            duplicateThumbnail = <img className="selected-face-thumbnail img-responsive img-thumbnail" alt="thumbnail" src={newThumbnail.src} />
          }
        }
      }

      let inputthumbnail = {src: '', path: ''};
      if (this.state.inputthumbnail) {
        inputthumbnail = this.state.inputthumbnail;
      }

      let mergedImage = [];
      if (typeof this.state.inputthumbnail!=="undefined" && typeof this.state.inputthumbnail.src!=="undefined" && this.state.inputthumbnail.src!=="") {
        mergedImage = <img src={inputthumbnail.src} alt="Thumbnail placeholder" className="selected-face-thumbnail img-responsive img-thumbnail"/>
      }

      let duplicateImageOverClass = '';
      if (this.state.duplicateImageOver) {
        duplicateImageOverClass = " over";
      }

      let duplicateModal = <Modal isOpen={this.state.duplicateModal} toggle={this.toggleDuplicateModal} className={this.props.className+" duplicate-modal"} size="lg">
        <form onSubmit={this.mergePerson}>
          <ModalHeader toggle={this.toggleDuplicateModal}>Merge person</ModalHeader>
          <ModalBody>
            <div className="row">

              <div className="col-xs-12 col-sm-4">
                <h4>Classpiece person</h4>
                <div className="selected-item-thumbnail">
                  <div
                    draggable="true"
                    onDragStart={this.startDragImage.bind(this,thumbnail)}
                    className="">
                    {selectedThumbnail}</div>
                </div>
                <div className="form-group">
                  <label>First Name</label>
                  <div
                    draggable="true"
                    onDragStart={this.startDragText.bind(this)}
                    className="thumbnail-textbox">{selectedFace.firstName}</div>

                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <div
                    draggable="true"
                    onDragStart={this.startDragText.bind(this)}
                    className="thumbnail-textbox">{selectedFace.lastName}</div>
                </div>
                <div className="form-group">
                  <label>Diocese</label>
                  <div
                    draggable="true"
                    onDragStart={this.startDragText.bind(this)}
                    className="thumbnail-textbox">{selectedFace.diocese}</div>
                </div>
              </div>

              <div className="col-xs-12 col-sm-4">
                <h4>Merged person</h4>
                <input type="hidden" name="input_id" value={this.state.input_id} onChange={this.handleChange}/>
                <div className="selected-item-thumbnail">
                  <div
                    className={"duplicate-thumbnail-placeholder"+duplicateImageOverClass}
                    onDrop={this.dragStopImage.bind(this)}
                    onDragEnter={this.dragEnterText.bind(this)}
                    onDragOver={this.dragOverText.bind(this)}
                    onDragLeave={this.dragLeaveText.bind(this)}
                    data-target="inputthumbnail">
                      {mergedImage}
                    </div>
                </div>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    onChange={this.handleChange}
                    value={this.state.inputfirstname}
                    onDrop={this.dragStopText.bind(this)}
                    onDragEnter={this.dragEnterText.bind(this)}
                    onDragOver={this.dragOverText.bind(this)}
                    onDragLeave={this.dragLeaveText.bind(this)}
                    data-target="inputfirstname"
                    type="text" className="form-control" name="inputfirstname" />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    onChange={this.handleChange}
                    value={this.state.inputlastname}
                    onDrop={this.dragStopText.bind(this)}
                    onDragEnter={this.dragEnterText.bind(this)}
                    onDragOver={this.dragOverText.bind(this)}
                    onDragLeave={this.dragLeaveText.bind(this)}
                    data-target="inputlastname"
                    type="text" className="form-control" name="inputlastname" />
                </div>
                <div className="form-group">
                  <label>Diocese</label>
                  <input
                    onChange={this.handleChange}
                    value={this.state.inputdiocese}
                    onDrop={this.dragStopText.bind(this)}
                    onDragEnter={this.dragEnterText.bind(this)}
                    onDragOver={this.dragOverText.bind(this)}
                    onDragLeave={this.dragLeaveText.bind(this)}
                    data-target="inputdiocese"
                    type="text" className="form-control" name="inputdiocese" />
                </div>
              </div>

              <div className="col-xs-12 col-sm-4">
                <h4>Database person</h4>
                <div className="merge-column">
                  <div className="selected-item-thumbnail">
                    {duplicateThumbnail}
                  </div>
                  <div className="form-group">
                    <label>First Name</label>
                    <div
                      draggable="true"
                      onDragStart={this.startDragText.bind(this)}
                      className="thumbnail-textbox">{duplicateFace.firstName}</div>
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <div
                      draggable="true"
                      onDragStart={this.startDragText.bind(this)}
                      className="thumbnail-textbox">{duplicateFace.lastName}</div>
                  </div>
                  <div className="form-group">
                    <label>Diocese</label>
                  </div>
                </div>
              </div>

            </div>
            <div className="row">
              <div className="col-xs-12 col-sm-4">
                <div className="form-group">
                  <Button type="button" outline color="primary" size="sm" onClick={this.copyRight}>Copy right <i className="fa fa-angle-right" /></Button>
                </div>
              </div>
              <div className="col-xs-12 col-sm-4"></div>
              <div className="col-xs-12 col-sm-4">
                <div className="form-group">
                  <Button type="button" outline color="primary" size="sm" onClick={this.copyLeft}><i className="fa fa-angle-left" /> Copy left</Button>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" outline type="submit">{this.state.mergePersonBtn}</Button>
            <Button color="warning" outline type="button" onClick={this.undoMerge}>Undo Merge</Button>
            <Button type="button" color="secondary" onClick={this.closeSelectedModal}>Cancel</Button>
          </ModalFooter>
        </form>
      </Modal>;

      let updateModal = <Modal isOpen={this.state.updateModal} toggle={this.toggleUpdateModal} className={this.props.className+" update-modal"}>
        <form onSubmit={this.updatePerson}>
          <ModalHeader toggle={this.toggleUpdateModal}>Update person</ModalHeader>
          <ModalBody>
            <div className="row">

              <div className="col-xs-12 col-sm-4 col-md-4">
                {selectedThumbnail}
              </div>
              <div className="col-xs-12 col-sm-8 col-md-8">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    onChange={this.handleChange}
                    value={this.state.updateFirstName}
                    type="text" className="form-control" name="updateFirstName" />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    onChange={this.handleChange}
                    value={this.state.updateLastName}
                    type="text" className="form-control" name="updateLastName" />
                </div>
                <div className="form-group">
                  <label>Diocese</label>
                  <input
                    onChange={this.handleChange}
                    value={this.state.updateDiocese}
                    type="text" className="form-control" name="updateDiocese" />
                </div>
              </div>

            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" outline type="submit">Update person</Button>
            <Button type="button" color="secondary" onClick={this.closeSelectedModal}>Cancel</Button>
          </ModalFooter>
        </form>
      </Modal>;

      let reImportModal = <Modal isOpen={this.state.reImportModalOpen} toggle={this.toggleReImportModal} className={this.props.className+" update-modal"}>
         <ModalHeader toggle={this.toggleReImportModal}>Re-import Classpiece confirm</ModalHeader>
         <ModalBody>
            <p>If you continue the selected items will be re-imported into the database, resulting in duplicates. Continue?</p>
         </ModalBody>
         <ModalFooter>
          <Button color="danger" outline onClick={this.importSelected}>Re-import</Button>
          <Button color="secondary" onClick={this.toggleReImportModal}>Cancel</Button>
         </ModalFooter>
      </Modal>;

      content = <div>
          <div className="row">
            <div className="col-xs-12 col-sm-8">
              <p>The following objects have been identified and are ready to be imported.</p>
            </div>
            <div className="col-xs-12 col-sm-4">
              <div className="text-right">
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <table className="import-to-db-table">
                <tbody>
                  {tableRows}
                </tbody>
              </table>
              <div className="text-right" style={{padding: '15px 0'}}>
                <Button color="primary" outline onClick={importFunction}>{this.state.importSelectedBtn}</Button>
              </div>
            </div>
          </div>
          {toolbox}
          {duplicateModal}
          {updateModal}
          {reImportModal}
        </div>;
    }

    let heading = "Import data to database";
    if (this.state.dbClasspiece!==null) {
      heading = "Re-import data to database";
    }
    let fileName = this.props.match.params.fileName;
    let breadcrumbsItems = [
      {label: "Parse Class Pieces", icon: "pe-7s-tools", active: false, path: "/parse-class-pieces"},
      {label: "Class Piece \""+fileName+"\"", icon: "", active: false, path: "/parse-class-piece/"+fileName},
      {label: heading, icon: "", active: true, path: ""}
    ];
    return (
      <div>
        <Breadcrumbs items={breadcrumbsItems} />
        <div className="row">
          <div className="col-12">
            <h2>{heading}</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            {content}
          </div>
        </div>

      </div>
    );
  }
}
