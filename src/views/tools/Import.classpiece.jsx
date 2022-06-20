import React, { useEffect, useState, useReducer } from 'react';
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
} from 'reactstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ImportToDBToolbox from './Right.sidebar.import.to.db';
import Breadcrumbs from '../../components/Breadcrumbs';
import { getThumbnailURL, capitalizeOnlyFirst } from '../../helpers';

const { REACT_APP_APIPATH: APIPath } = process.env;

export default function ImportClassPieceToDB() {
  const [loading, setLoading] = useState(true);
  const defaultState = {
    data: null,
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
  const [state, setState] = useReducer(
    (exState, newState) => ({ ...exState, ...newState }),
    defaultState
  );

  const { fileName } = useParams();

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    if (loading) {
      const load = async () => {
        const responseData = await axios({
          method: 'get',
          url: `${APIPath}prepare-classpiece-ingestion`,
          crossDomain: true,
          params: { file: fileName },
          signal: controller.signal,
        })
          .then((response) => response.data.data)
          .catch((error) => {
            console.log(error);
          });
        if (!unmounted) {
          setLoading(false);
          const collapseRelations = [];
          collapseRelations.push(false);

          const newData = [];
          const {
            classpiece: newClassPiece,
            db_classpiece: dbClasspiece = null,
            faces = [],
          } = responseData;
          newClassPiece.checked = true;
          newData.classpiece = newClassPiece;
          const newFaces = [];
          const { length: fLength } = faces;
          for (let i = 0; i < fLength; i += 1) {
            const face = faces[i];
            face.checked = true;
            newFaces.push(face);
            collapseRelations.push(false);
          }
          newData.faces = newFaces;
          const stateUpdate = {
            data: newData,
            loadedFaces: newFaces,
            dbClasspiece,
            collapseRelations,
          };

          if (
            dbClasspiece !== null &&
            dbClasspiece !== 0 &&
            dbClasspiece !== '0'
          ) {
            stateUpdate.importSelectedBtn = <span>Re-import selected</span>;
          }
          setState(stateUpdate);
        }
      };
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading, fileName]);

  useEffect(() => {
    if (state.imported) {
      setState({
        imported: false,
      });
    }
  }, [state.imported]);

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    setState({
      [name]: value,
    });
  };

  const handleMultipleChange = (e, i) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const { [name]: elem } = state;
    elem[i] = value;
    setState({
      [name]: elem,
    });
  };

  const addHP = (name = null) => {
    if (name !== null) {
      const { [name]: hps } = state;
      hps.push('');
      setState({
        inputhonorificprefix: hps,
      });
    }
  };

  const removeHP = (i, name = null) => {
    if (name !== null) {
      const { [name]: hps } = state;
      hps.splice(i, 1);
      setState({
        inputhonorificprefix: hps,
      });
    }
  };

  const toggleRelations = (i) => {
    const { collapseRelations } = state;
    const collapseRelation = !collapseRelations[i];
    collapseRelations[i] = collapseRelation;
    setState({
      collapseRelations,
    });
  };

  const identifyDuplicates = async () => {
    const { identifyDuplicatesStatus, loadedFaces, data } = state;
    if (!identifyDuplicatesStatus) {
      setState({
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
      setState({
        data: stateData,
        identifyDuplicatesStatus: false,
        identifyDuplicatesBtn: (
          <span>
            Identification complete <i className="fa fa-check" />
          </span>
        ),
      });
      setTimeout(() => {
        setState({
          identifyDuplicatesBtn: <span>Identify possible duplicates</span>,
        });
      }, 2000);
    }
  };

  const selectAll = () => {
    const { selectAllStatus: stateSelectAllStatus, data: stateData } = state;
    const selectAllStatus = !stateSelectAllStatus;
    const selectAllBtn = selectAllStatus ? (
      <span>Deselect All</span>
    ) : (
      <span>Select All</span>
    );
    const { classpiece: classPiece } = stateData;
    classPiece.checked = selectAllStatus;

    const newFaces = [];
    const { faces } = stateData;
    const { length } = faces;
    for (let i = 0; i < length; i += 1) {
      const face = faces[i];
      face.checked = selectAllStatus;
      newFaces.push(face);
    }
    stateData.faces = newFaces;
    setState({
      selectAllStatus: !stateSelectAllStatus,
      selectAllBtn,
      data: stateData,
    });
  };

  const toggleSelected = (i, type) => {
    const { data: stateData } = state;
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
    setState({
      data: stateData,
    });
  };

  const toggleDuplicateModal = () => {
    const { duplicateModal } = state;
    setState({
      duplicateModal: !duplicateModal,
    });
  };

  const startDragText = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/html', e.target.id);
    e.dataTransfer.dropEffect = 'move';
    setState({
      draggableText: e.target.textContent,
    });
  };

  const startDragImage = (thumbnail, e) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/html', e.target.id);
    e.dataTransfer.dropEffect = 'move';
    setState({
      draggableImage: thumbnail,
    });
  };

  const dragStopText = (e, i = null) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target.getAttribute('data-target');
    if (i === null) {
      const { [target]: targetText, draggableText } = state;
      const space = targetText !== '' ? ' ' : '';
      const newTargetText = capitalizeOnlyFirst(
        targetText + space + draggableText
      );
      setState({
        [target]: newTargetText,
        draggedElem: null,
        draggedIndex: null,
      });
    } else {
      const { [target]: stateTarget, draggableText } = state;
      const targetText = stateTarget[i];
      const space = targetText !== '' ? ' ' : '';
      const newTargetText = capitalizeOnlyFirst(
        targetText + space + draggableText
      );
      stateTarget[i] = newTargetText;
      setState({
        [target]: stateTarget,
        draggedElem: null,
        draggedIndex: null,
      });
    }
    return false;
  };

  const dragStopImage = (e) => {
    const target = e.target.getAttribute('data-target');
    const { draggableImage } = state;
    setState({
      [target]: draggableImage,
      duplicateImageOver: false,
    });
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const dragEnterText = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { duplicateImageOver } = state;
    const target = e.target.getAttribute('data-target');
    const index = e.target.getAttribute('data-index');
    if (target === 'inputthumbnail' && !duplicateImageOver) {
      setState({
        duplicateImageOver: true,
      });
    } else {
      setState({
        draggedElem: target,
        draggedIndex: index,
      });
    }
  };

  const dragLeaveText = (e) => {
    const { duplicateImageOver } = state;
    if (duplicateImageOver) {
      setState({
        duplicateImageOver: false,
      });
    } else {
      setState({
        draggedElem: null,
        draggedIndex: null,
      });
    }
    e.preventDefault();
    return false;
  };

  const dragOverText = (e) => {
    e.stopPropagation();
    e.preventDefault();
    return false;
  };

  const selectPossibleDuplicate = (i, fm) => {
    const { data } = state;
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
    setState({
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

  const copyRight = () => {
    const { selectedPerson } = state;
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
    setState({
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

  const copyLeft = () => {
    const { selectedDuplicate } = state;
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
      const srcPersonDiocese =
        srcPerson.organisations.find(
          (d) => d.term.label === 'hasAffiliation'
        ) || null;
      if (srcPersonDiocese !== null) {
        const { ref: refDiocese } = srcPersonDiocese;
        const { label: rLabel = '', organisationType: rOrganisationType = '' } =
          refDiocese;
        diocese = rLabel;
        dioceseType = rOrganisationType;
      }
    }
    // get type
    if (
      srcPerson.resources.find((r) => r.term.label === 'isDepictedOn') !==
      'undefined'
    ) {
      type = srcPerson.resources.find(
        (r) => r.term.label === 'isDepictedOn'
      ).role;
    }
    if (typeof srcPerson.resources !== 'undefined') {
      thumbnail.src = getThumbnailURL(srcPerson);
    }
    if (typeof srcPerson._id !== 'undefined') {
      _id = srcPerson._id;
    }
    setState({
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

  const mergePerson = (e) => {
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
    } = state;
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
    setState({
      data,
      duplicateModal: false,
    });
  };

  const undoMerge = async () => {
    const { selectedPersonIndex: stateIndex, data: stateData } = state;
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}prepare-classpiece-ingestion`,
      crossDomain: true,
      params: { file: fileName },
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    const { faces: stateFaces } = stateData;

    const stateFace = stateFaces[stateIndex];
    const { matches: stateFaceMatches, checked: stateFaceChecked } = stateFace;

    const undoFace = responseData.faces[stateIndex];
    undoFace.matches = stateFaceMatches;
    undoFace.checked = stateFaceChecked;
    stateFaces[stateIndex] = undoFace;
    stateData.faces = stateFaces;
    setState({
      selectedPerson: undoFace,
      data: stateData,
    });

    setTimeout(() => {
      copyRight();
    }, 100);
  };

  const toggleUpdateModal = () => {
    setState({
      updateModal: !state.updateModal,
    });
  };

  const openUpdatePerson = (i) => {
    const { data } = state;
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
    setState({
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

  const updatePerson = (e) => {
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
    } = state;
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
    setState({
      data,
      updateModal: false,
    });
  };

  const importSelected = async () => {
    const { importSelectedStatus, data } = state;
    if (!importSelectedStatus) {
      setState({
        importSelectedBtn: (
          <span>
            <i>Importing...</i> <Spinner color="secondary" size="sm" />
          </span>
        ),
        importSelectedStatus: true,
      });
      const stateData = Object.assign([{}], data);
      const postData = {};
      postData.file = fileName;
      const classPiece = stateData.classpiece;
      if (classPiece.checked) {
        postData.classpiece = classPiece;
      }
      const { faces } = stateData;
      const checkedFaces = [];
      const { length } = faces;
      for (let i = 0; i < length; i += 1) {
        const face = faces[i];
        if (face.checked) {
          checkedFaces.push(face);
        }
      }
      postData.faces = checkedFaces;

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
        setState({
          importSelectedStatus: false,
          importSelectedBtn: (
            <span>
              Import complete <i className="fa fa-check" />
            </span>
          ),
        });

        setTimeout(() => {
          setState({
            importSelectedBtn: <span>Import selected</span>,
            imported: true,
          });
        }, 2000);
      }
    }
  };

  const toggleReImportModal = () => {
    setState({
      reImportModalOpen: !state.reImportModalOpen,
    });
  };

  const {
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
  } = state;

  let content = (
    <div className="row">
      <div className="col-12">
        <div style={{ padding: '40pt', textAlign: 'center' }}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
  );
  if (!loading && data !== null) {
    const { classpiece, faces } = data;
    let tableRows = [];
    const classPieceRelations = [];

    // faces
    let f = 1;
    const facesRows = [];
    const { length: fLength } = faces;
    for (let i = 0; i < fLength; i += 1) {
      const face = faces[i];
      const {
        default: defaultInfo = null,
        firstName = '',
        middleName = '',
        lastName = '',
        diocese = '',
        honorificPrefix = [],
        thumbnail = null,
        matches = [],
        checked: fChecked = false,
      } = face;
      const rotate =
        defaultInfo !== null &&
        typeof defaultInfo.rotate !== 'undefined' &&
        defaultInfo.rotate !== 0 ? (
          <span>rotate: {defaultInfo.rotate}</span>
        ) : null;

      let label = '';
      if (firstName !== '' || lastName !== '') {
        if (honorificPrefix.length > 0) {
          label += honorificPrefix.join(', ');
        }
        if (firstName !== '') {
          if (label !== '') {
            label += ' ';
          }
          label += firstName;
        }
        if (middleName !== '') {
          if (label !== '') {
            label += ' ';
          }
          label += middleName;
        }
        if (lastName !== '') {
          if (label !== '') {
            label += ' ';
          }
          label += lastName;
        }
        // classpiece relations
        const personRelation = (
          <li key={`depicts-${f}`}>
            <span className="type-of">[:Resource]</span> {classpiece.label}{' '}
            <span className="relation">depicts</span>{' '}
            <span className="type-of">[:Person]</span> {label}
          </li>
        );
        const resourceRelation =
          thumbnail !== null ? (
            <li key={`hasPart-${f}`}>
              <span className="type-of">[:Resource]</span> {classpiece.label}{' '}
              <span className="relation">hasPart</span>{' '}
              <span className="type-of">[:Resource]</span>{' '}
              <img
                src={thumbnail.src}
                alt="Person"
                className="import-to-db-thumb-small img-responsive"
              />
            </li>
          ) : null;
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
      const resourceToClasspieceRelation =
        thumbnail !== null ? (
          <li key={1}>
            <span className="type-of">[:Resource]</span>{' '}
            <img
              src={thumbnail.src}
              alt="Person"
              className="import-to-db-thumb-small img-responsive"
            />{' '}
            <span className="relation">isPartOf</span>{' '}
            <span className="type-of">[:Resource]</span> {classpiece.label}
          </li>
        ) : null;

      const resourceDioceseRelation = (
        <li key={2}>
          <span className="type-of">[:Person]</span> {label}{' '}
          <span className="relation">hasAffiliation</span>{' '}
          <span className="type-of">[:Organisation]</span> {face.diocese}
        </li>
      );

      if (firstName !== '' || lastName !== '') {
        faceRelations.push(personToClasspieceRelation);
      }

      faceRelations.push(resourceToClasspieceRelation);

      if (diocese.trim() !== '') {
        faceRelations.push(resourceDioceseRelation);
      }

      // duplicates
      let duplicatesTitle = [];
      let duplicatesClass = '';
      let duplicatesOutput = [];
      if (matches.length > 0) {
        duplicatesTitle = (
          <div>
            <Label>Possible duplicates</Label>
          </div>
        );
        duplicatesClass = ' duplicates';
        const duplicatesRows = matches.map((faceMatch, fm) => {
          const key = `a${fm}`;
          const {
            firstName: mFirstName = '',
            lastName: mLastName = '',
            score = 0,
          } = faceMatch;
          return (
            <li key={key}>
              <Button
                size="sm"
                type="button"
                onClick={() => selectPossibleDuplicate(i, fm)}
              >
                {mFirstName} {mLastName}
              </Button>{' '}
              [<i>{score}% match</i>]
            </li>
          );
        });
        duplicatesOutput = (
          <ul className="duplicates-list">{duplicatesRows}</ul>
        );
      }
      const checked = fChecked ? 'checked' : '';
      const relationToggleIconClass = collapseRelations[f] ? ' active' : '';

      const thumbnailImg =
        thumbnail !== null ? (
          <div
            className="thumbnail-person"
            onClick={() => openUpdatePerson(i)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="update person"
          >
            <img
              src={thumbnail.src}
              alt="Person"
              className="import-to-db-thumb img-responsive"
            />
            <div className="thumbnail-person-edit">Edit</div>
          </div>
        ) : null;
      const dimensions =
        defaultInfo !== null ? (
          <div className={`import-to-db-details${duplicatesClass}`}>
            width: {face.default.width}px
            <br />
            height: {face.default.height}px
            <br />
            filetype: {face.default.type}
            <br />
            {rotate}
          </div>
        ) : null;

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
                onClick={() => toggleSelected(i, 'faces')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="toggle selected"
              />
            </div>
          </td>
          <td style={{ width: '80px' }}>{thumbnailImg}</td>
          <td>
            <div>
              <Label>{label}</Label>
            </div>
            {dimensions}
            <div className="import-to-db-duplicates">
              {duplicatesTitle}
              {duplicatesOutput}
            </div>
            <div>
              <div
                className="collapse-trigger"
                onClick={() => toggleRelations(i + 1)}
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

    const classPieceChecked = classpiece.checked ? 'checked' : '';

    const classPieceRelationToggleIconClass = collapseRelations[0]
      ? ' active'
      : '';

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
              onClick={() => toggleSelected(-1, 'classpiece')}
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
            onClick={() => toggleRelations(0)}
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

    let importFunction = importSelected;
    if (dbClasspiece !== null && dbClasspiece !== 0 && dbClasspiece !== '0') {
      importFunction = toggleReImportModal;
    }

    const toolbox = (
      <div className="sidebar-toolbox">
        <ImportToDBToolbox
          selectAll={selectAll}
          selectAllBtn={selectAllBtn}
          identifyDuplicates={identifyDuplicates}
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

    const inputthumbnail =
      stateInputthumbnail !== null
        ? stateInputthumbnail
        : { src: '', path: '' };

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
            onDrop={(e) => dragStopText(e, i)}
            onDragEnter={dragEnterText}
            onDragOver={dragOverText}
            onDragLeave={dragLeaveText}
            onChange={(e) => handleMultipleChange(e, i)}
          />
          <Button
            type="button"
            color="info"
            outline
            onClick={() => removeHP(i, 'inputhonorificprefix')}
          >
            <b>
              <i className="fa fa-minus" />
            </b>
          </Button>
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
            onDrop={(e) => dragStopText(e, i)}
            onDragEnter={dragEnterText}
            onDragOver={dragOverText}
            onDragLeave={dragLeaveText}
            onChange={(e) => handleMultipleChange(e, i)}
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
            onDragStart={(e) => startDragText(e)}
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
            onDragStart={(e) => startDragText(e)}
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
            onDragStart={(e) => startDragText(e)}
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
            onDragStart={(e) => startDragText(e)}
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
            onDragStart={(e) => startDragText(e)}
            className="thumbnail-textbox"
          >
            {selectedFace.diocese}
          </div>
          <div
            draggable="true"
            onDragStart={(e) => startDragText(e)}
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
            onDragStart={(e) => startDragText(e)}
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
            onDragStart={(e) => startDragText(e)}
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
            onDragStart={(e) => startDragText(e)}
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
            onDragStart={(e) => startDragText(e)}
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
            onDragStart={(e) => startDragText(e)}
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
            onDragStart={(e) => startDragText(e)}
            className="thumbnail-textbox"
          >
            {duplicateDiocese.label}
          </div>
          <div
            draggable="true"
            onDragStart={(e) => startDragText(e)}
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
      const dbtypeFind =
        duplicateFace.resources.find((r) => r.term.label === 'isDepictedOn') ||
        null;
      const dbtype = dbtypeFind !== null ? dbtypeFind.term.role : '';
      dbty = (
        <div className="form-group">
          <Label>Type</Label>
          <div
            draggable="true"
            onDragStart={(e) => startDragText(e)}
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
        toggle={toggleDuplicateModal}
        className="duplicate-modal"
        size="lg"
      >
        <form onSubmit={mergePerson}>
          <ModalHeader toggle={toggleDuplicateModal}>Merge person</ModalHeader>
          <ModalBody>
            <div className="row">
              <div className="col-xs-12 col-sm-4">
                <h4>Classpiece person</h4>
                <div className="selected-item-thumbnail">
                  <div
                    draggable="true"
                    onDragStart={startDragImage.bind(this, thumbnail)}
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
                  onChange={handleChange}
                />
                <div className="selected-item-thumbnail">
                  <div
                    className={`duplicate-thumbnail-placeholder${duplicateImageOverClass}`}
                    onDrop={dragStopImage.bind(this)}
                    onDragEnter={dragEnterText.bind(this)}
                    onDragOver={dragOverText.bind(this)}
                    onDragLeave={dragLeaveText.bind(this)}
                    data-target="inputthumbnail"
                  >
                    {mergedImage}
                  </div>
                </div>
                <div className="form-group">
                  <Label>Honorific Prefix</Label>
                  {honorificPrefixInputs}
                  <div className="text-end">
                    <Button
                      type="button"
                      color="info"
                      outline
                      size="xs"
                      onClick={() => addHP('inputhonorificprefix')}
                    >
                      Add new <i className="fa fa-plus" />
                    </Button>
                  </div>
                </div>
                <div className="form-group">
                  <Label>First Name</Label>
                  <input
                    onChange={handleChange}
                    value={inputfirstname}
                    onDrop={(e) => dragStopText(e)}
                    onDragEnter={dragEnterText}
                    onDragOver={dragOverText}
                    onDragLeave={dragLeaveText}
                    data-target="inputfirstname"
                    type="text"
                    className={`form-control ${firstNameActive}`}
                    name="inputfirstname"
                  />
                </div>
                <div className="form-group">
                  <Label>Middle Name</Label>
                  <input
                    onChange={handleChange}
                    value={inputmiddlename}
                    onDrop={(e) => dragStopText(e)}
                    onDragEnter={dragEnterText}
                    onDragOver={dragOverText}
                    onDragLeave={dragLeaveText}
                    data-target="inputmiddlename"
                    type="text"
                    className={`form-control ${middleNameActive}`}
                    name="inputmiddlename"
                  />
                </div>
                <div className="form-group">
                  <Label>Last Name</Label>
                  <input
                    onChange={handleChange}
                    value={inputlastname}
                    onDrop={(e) => dragStopText(e)}
                    onDragEnter={dragEnterText}
                    onDragOver={dragOverText}
                    onDragLeave={dragLeaveText}
                    data-target="inputlastname"
                    type="text"
                    className={`form-control ${lastNameActive}`}
                    name="inputlastname"
                  />
                </div>
                <div className="form-group">
                  <Label>Diocese | Order</Label>
                  <input
                    onChange={handleChange}
                    value={inputdiocese}
                    onDrop={(e) => dragStopText(e)}
                    onDragEnter={dragEnterText}
                    onDragOver={dragOverText}
                    onDragLeave={dragLeaveText}
                    data-target="inputdiocese"
                    type="text"
                    className={`form-control ${dioceseActive}`}
                    name="inputdiocese"
                  />
                  <select
                    style={{ marginTop: '5px' }}
                    className={`form-control ${dioceseTypeActive}`}
                    onChange={handleChange}
                    value={inputdioceseType}
                    onDrop={(e) => dragStopText(e)}
                    onDragEnter={dragEnterText}
                    onDragOver={dragOverText}
                    onDragLeave={dragLeaveText}
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
                    onDrop={dragStopText}
                    onDragEnter={dragEnterText}
                    onDragOver={dragOverText}
                    onDragLeave={dragLeaveText}
                    onChange={handleChange}
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
                    onClick={copyRight}
                  >
                    Copy right <i className="fa fa-angle-right" />
                  </Button>
                </div>
              </div>
              <div className="col-xs-12 col-sm-4" />
              <div className="col-xs-12 col-sm-4">
                <div className="form-group text-end">
                  <Button
                    type="button"
                    outline
                    color="primary"
                    size="sm"
                    onClick={copyLeft}
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
              onClick={undoMerge}
            >
              Undo Merge
            </Button>
            <Button
              type="button"
              size="sm"
              color="secondary"
              onClick={toggleDuplicateModal}
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
            onDrop={(e) => dragStopText(e, i)}
            onDragEnter={dragEnterText}
            onDragOver={dragOverText}
            onDragLeave={dragLeaveText}
            onChange={(e) => handleMultipleChange(e, i)}
          />
          <Button
            type="button"
            color="info"
            outline
            onClick={() => removeHP(i, 'updateHonorificPrefix')}
          >
            <b>
              <i className="fa fa-minus" />
            </b>
          </Button>
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
            onDrop={(e) => dragStopText(e, i)}
            onDragEnter={dragEnterText}
            onDragOver={dragOverText}
            onDragLeave={dragLeaveText}
            onChange={(e) => handleMultipleChange(e, i)}
          />
        );
      }
      return item;
    });

    const updateModal = (
      <Modal
        isOpen={updateModalOpen}
        toggle={toggleUpdateModal}
        className={`${className} update-modal`}
      >
        <form onSubmit={updatePerson}>
          <ModalHeader toggle={toggleUpdateModal}>Update person</ModalHeader>
          <ModalBody>
            <div className="row">
              <div className="col-xs-12 col-sm-4 col-md-4">
                {selectedThumbnail}
              </div>
              <div className="col-xs-12 col-sm-8 col-md-8">
                <div className="form-group">
                  <Label>Honorific Prefix</Label>
                  {updateHonorificPrefixInputs}

                  <div className="text-end">
                    <Button
                      type="button"
                      color="info"
                      outline
                      size="xs"
                      onClick={() => addHP('updateHonorificPrefix')}
                    >
                      Add new <i className="fa fa-plus" />
                    </Button>
                  </div>
                </div>
                <div className="form-group">
                  <Label>First Name</Label>
                  <input
                    onChange={handleChange}
                    value={updateFirstName}
                    type="text"
                    className="form-control"
                    name="updateFirstName"
                  />
                </div>
                <div className="form-group">
                  <Label>Middle Name</Label>
                  <input
                    onChange={handleChange}
                    value={updateMiddleName}
                    type="text"
                    className="form-control"
                    name="updateMiddleName"
                  />
                </div>
                <div className="form-group">
                  <Label>Last Name</Label>
                  <input
                    onChange={handleChange}
                    value={updateLastName}
                    type="text"
                    className="form-control"
                    name="updateLastName"
                  />
                </div>
                <div className="form-group">
                  <Label>Diocese | Order</Label>
                  <input
                    onChange={handleChange}
                    value={updateDiocese}
                    type="text"
                    className="form-control"
                    name="updateDiocese"
                  />
                  <select
                    style={{ marginTop: '5px' }}
                    className="form-control"
                    onChange={handleChange}
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
                    onChange={handleChange}
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
          <ModalFooter className="flex justify-content-between">
            <Button
              type="button"
              color="secondary"
              onClick={toggleUpdateModal}
              size="sm"
            >
              Cancel
            </Button>
            <Button color="primary" outline type="submit" size="sm">
              Update person
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    );

    const reImportModal = (
      <Modal
        isOpen={reImportModalOpen}
        toggle={toggleReImportModal}
        className={`${className} update-modal`}
      >
        <ModalHeader toggle={toggleReImportModal}>
          Re-import Classpiece confirm
        </ModalHeader>
        <ModalBody>
          <p>
            If you continue the selected items will be re-imported into the
            repository, resulting in duplicates. Continue?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" outline onClick={importSelected}>
            Re-import
          </Button>
          <Button color="secondary" onClick={toggleReImportModal}>
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
            <div className="text-end" />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <table className="import-to-db-table">
              <tbody>{tableRows}</tbody>
            </table>
            <div className="text-end" style={{ padding: '15px 0' }}>
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
    <>
      <Breadcrumbs items={breadcrumbsItems} />
      <div className="row">
        <div className="col-12">
          <h2>{heading}</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">{content}</div>
      </div>
    </>
  );
}
