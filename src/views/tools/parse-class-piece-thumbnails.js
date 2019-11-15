import React, { Component } from 'react';
import {Spinner} from 'reactstrap';
import Rnd from 'react-rnd-rotate';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {Breadcrumbs} from '../../components/breadcrumbs';

import axios from 'axios';
import ParseClassPieceToolbox from './right-sidebar-toolbox';
import ContextualMenu from '../../components/parse-class-piece-contextual-menu';
const APIPath = process.env.REACT_APP_APIPATH;

export default class ParseClassPieceThumbnails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialLoad: true,
      loading: true,
      fileInfo: [],
      file: [],
      faces: [],
      texts: [],
      zoom: 100,
      settingsUpdate: false,
      selectionsActive: true,

      storeSelectionsStatus: false,
      storeSelectionsBtn: <span><i className="fa fa-save"></i> Store selections</span>,

      saveThumbnailsStatus: false,
      saveThumbnailsBtn: <span><i className="fa fa-save"></i> Extract thumbnails</span>,

      linkingActive: false,
      linkingSelectionActive: false,
      selectionFaces: null,
      selectionText: [],
      saveSelectedModal: false,

      linkingSelection: false,
      linkinSelectionRect: {top:0, left:0, width:0, height:0, transform: 'translate: (0,0)'},

      draggableText: '',
      dragover: false,
      draggedElem: null,
      inputhonorificprefix: '',
      inputfirstname: '',
      inputmiddlename: '',
      inputlastname: '',
      inputdiocese: '',
      inputtype: 'student',

      updatePersonStatus: false,
      updatePersonBtn: <span><i className="fa fa-save"></i> Update person</span>,

      storeLinkingBtn: <span><i className="fa fa-save"></i> Store updates</span>,
      storeLinkingStatus: false,

      // contextual menu
      contextualMenuVisible: false,
      contextualMenuPosition: [],
      contextualMenuTargetFace: false,
      selectedNode: [],
      selectedNodeKey: [],

      // errorModal
      errorModalVisible: false,
      errorModalText: []
    }
    this.loadFile = this.loadFile.bind(this);
    this.loadFaces = this.loadFaces.bind(this);
    this.loadSettings = this.loadSettings.bind(this);
    this.loadText = this.loadText.bind(this);
    this.updateFaces = this.updateFaces.bind(this);
    this.resizeFace = this.resizeFace.bind(this);
    this.dragFace = this.dragFace.bind(this);
    this.saveFacesThumbnails = this.saveFacesThumbnails.bind(this);

    this.updateSettings = this.updateSettings.bind(this);
    this.updateZoom = this.updateZoom.bind(this);
    this.toggleSelections = this.toggleSelections.bind(this);
    this.toggleLinking = this.toggleLinking.bind(this);

    this.addNewSelection = this.addNewSelection.bind(this);
    this.removeSelection = this.removeSelection.bind(this);

    // linking
    this.startSelection = this.startSelection.bind(this);
    this.endSelection = this.endSelection.bind(this);
    this.closeSelectedModal = this.closeSelectedModal.bind(this);
    this.selectFace = this.selectFace.bind(this);
    this.selectText = this.selectText.bind(this);

    this.linkingSelectionStart = this.linkingSelectionStart.bind(this);
    this.linkingSelectionEnd = this.linkingSelectionEnd.bind(this);
    this.linkingSelectionMove = this.linkingSelectionMove.bind(this);
    this.getFaceInSelection = this.getFaceInSelection.bind(this);
    this.getTextsSelection = this.getTextsSelection.bind(this);
    this.startDragText = this.startDragText.bind(this);
    this.dragStopText = this.dragStopText.bind(this);
    this.dragOverText = this.dragOverText.bind(this);
    this.dragEnterText = this.dragEnterText.bind(this);
    this.dragLeaveText = this.dragLeaveText.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.updatePersonModal = this.updatePersonModal.bind(this);
    this.storeLinking = this.storeLinking.bind(this);

    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleScroll = this.handleScroll.bind(this);


    this.toggleErrorModal = this.toggleErrorModal.bind(this);
  }

  loadFile = async() => {
    let fileName = this.props.match.params.fileName;
    let file = await axios({
      method: 'get',
      url: APIPath+'list-class-piece?file='+fileName,
      crossDomain: true,
    })
	  .then(function (response) {
      return response.data.data[0];
	  })
	  .catch(function (error) {
	  });

    let fileOutput = <img src={file.compressed} alt={file.name}
      draggable="false" />;
    this.setState({
      fileInfo: file,
      file: fileOutput,
    });
    this.loadFaces();
    this.loadText();
    this.loadSettings();
  }

  loadFaces = () => {
    let facesFile = this.state.fileInfo.faces;
    let context = this;
    axios({
        method: 'get',
        url: facesFile,
        crossDomain: true,
      })
  	  .then(function (response) {
        let responseData = response.data;

        let hasThumbnailCount = 0;
        for (let i=0; i<responseData.length; i++) {
          let face = responseData[i];
          if (typeof face.thumbnail!=="undefined") {
            hasThumbnailCount++;
          }
        }
        let selectionsActive = true;
        let linkingActive = false;
        if (hasThumbnailCount===responseData.length) {
          selectionsActive = false;
          linkingActive = true;
        }
        context.setState({
          faces: responseData,
          selectionsActive: selectionsActive,
          linkingActive: linkingActive,
        });

  	  })
  	  .catch(function (error) {
  	  });
  }

  loadText = async () => {
    let textFile = this.state.fileInfo.text;
    let texts = await axios({
      method: 'get',
      url: textFile,
      crossDomain: true,
    })
	  .then(function (response) {
      let textData = response.data.lines;
      let words = [];
      for (let key in textData) {
        let line = textData[key];
        if (typeof line.words!=="undefined") {
          for (let wordKey in line.words) {
            let word = line.words[wordKey];
            words.push(word);
          }
        }
      }
      return words;
	  })
	  .catch(function (error) {
	  });
    this.setState({
      texts: texts,
      loading: false
    });
  }

  loadSettings = () => {
    let settings = [];
    if (sessionStorage.getItem("settings")!==null && sessionStorage.getItem("settings")!=='') {
      settings = JSON.parse(sessionStorage.getItem('settings'));
    }
    let newZoom = settings.zoom || 100;
    this.setState({
      zoom: parseInt(newZoom,10)
    })
  }

  updateFaces = async() => {
    if (this.state.storeSelectionsStatus) {
      return false;
    }
    this.setState({
      storeSelectionsStatus: true,
      storeSelectionsBtn: <span><i className="fa fa-save"></i> Storing selections... <Spinner size="sm" color="secondary" /></span>
    })
    let fileName = this.props.match.params.fileName;
    let postData = {
      file: fileName,
      faces: this.state.faces
    };
    let update = await axios({
      method: 'post',
      url: APIPath+'update-class-piece-faces?file='+fileName,
      crossDomain: true,
      data: postData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
	  });
    let stateUpdate = {};
    if (update.status) {
      stateUpdate = {
        storeSelectionsStatus: false,
        storeSelectionsBtn: <span><i className="fa fa-save"></i> Success <i className="fa fa-check"></i></span>
      };
    }
    else {
      stateUpdate = {
        storeSelectionsStatus: false,
        storeSelectionsBtn: <span><i className="fa fa-save"></i> Error <i className="fa fa-times"></i></span>
      };
    }
    this.setState(stateUpdate);
    let context = this;
    setTimeout(()=>{
      context.setState({
        storeSelectionsBtn: <span><i className="fa fa-save"></i> Store selections</span>
      });
    },2000);
  }

  dragFace = (e,d,i) => {
    let faces = this.state.faces;
    let currentFace = faces[i];
    let width = d.newWidth;
    let height = d.newHeight;
    let leftX = parseInt(d.x,10);
    let topY = parseInt(d.y,10);
    let calcFaceRectangle = {
      width: width,
      height: height,
      left: leftX,
      top: topY,
    }

    let newFace = Object.assign({}, currentFace);
    newFace.faceRectangle = calcFaceRectangle;
    faces[i] = newFace;
    this.setState({
      faces: faces
    })
  }

  resizeFace = (e, direction, ref, delta, position, i) => {
    let faces = this.state.faces;
    let currentFace = faces[i];
    let width = ref.style.width;
    let height = ref.style.height;
    let leftX = parseInt(position.x,10);
    let topY = parseInt(position.y,10);
    let calcFaceRectangle = {
      width: width,
      height: height,
      left: leftX,
      top: topY,
    }

    let rotate = delta.degree;
    let newFace = Object.assign({}, currentFace);
    newFace.faceRectangle = calcFaceRectangle;
    newFace.rotate = rotate;
    faces[i] = newFace;
    this.setState({
      faces: faces
    })
  }

  updateSettings = () => {
    let newZoom = this.state.zoom;
    let settings = {};
    if (sessionStorage.getItem("settings")!==null) {
      settings = JSON.parse(sessionStorage.getItem('settings'));
    }
    settings = {zoom: newZoom};
    let storedSettings = JSON.stringify(settings);
    sessionStorage.setItem("settings", storedSettings);
  }

  updateZoom = (value) => {
    this.setState({
      zoom: value,
      settingsUpdate: true
    });
  }

  toggleSelections = () => {
    let value = true;
    if (this.state.selectionsActive) {
      value = false;
    }
    this.setState({
      selectionsActive: value
    })
    if (value) {
      this.setState({
        linkingActive: false
      })
    }
  }

  toggleLinking = () => {
    let value = true;
    if (this.state.linkingActive) {
      value = false;
    }
    this.setState({
      linkingActive: value
    })
    if (value) {
      this.setState({
        selectionsActive: false
      })
    }
  }

  saveFacesThumbnails = async () => {
    if (this.state.saveThumbnailsStatus) {
      return false;
    }
    this.setState({
      saveThumbnailsStatus: true,
      saveThumbnailsBtn: <span><i className="fa fa-save"></i> Extracting thumbnails... <Spinner size="sm" color="secondary" /></span>
    });
    let fileName = this.props.match.params.fileName;
    let update = await axios({
      method: 'get',
      url: APIPath+'meta-parse-class-piece?file='+fileName,
      crossDomain: true,
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
	  });
    let updateState = {};
    if (update.status) {
      updateState = {
        saveThumbnailsStatus: false,
        saveThumbnailsBtn: <span><i className="fa fa-save"></i> Success <i className="fa fa-check"></i></span>
      };
    }
    else {
      updateState = {
        saveThumbnailsStatus: false,
        saveThumbnailsBtn: <span><i className="fa fa-save"></i> Error <i className="fa fa-times"></i></span>
      };
    }
    this.setState(updateState);
    this.loadFaces();
    let context = this;
    setTimeout(()=>{
      context.setState({
        saveThumbnailsBtn: <span><i className="fa fa-save"></i> Extract thumbnails</span>
      })
    },2000);
  }

  // linking

  startSelection = (e) => {
    if (e.metaKey || e.ctrlKey) {
      this.setState({
        linkingSelectionActive: true
      })
    }
  }

  endSelection = (e) => {
    if (e.key==="Control" || e.key==="Meta") {
      let saveSelectedModal = false;
      if (this.state.selectionFaces!==null || this.state.selectionText.length>0) {
        saveSelectedModal = true;
      }
      this.setState({
        linkingSelectionActive: false,
        saveSelectedModal: saveSelectedModal
      });
    }
  }

  closeSelectedModal = () => {
    this.setState({
      selectionFaces: null,
      selectionText: [],
      draggableText: '',
      inputhonorificprefix: '',
      inputfirstname: '',
      inputmiddlename: '',
      inputlastname: '',
      inputdiocese: '',
      inputtype: 'student',
      saveSelectedModal: false
    });
  }

  selectFace = (i)=>  {
    if (this.state.linkingSelectionActive) {
      let selectedFaces = this.state.selectionFaces;
      if (selectedFaces!==i) {
        selectedFaces = i;
      }
      else {
        selectedFaces = null
      }
      this.setState({
        selectionFaces: selectedFaces
      })
    }
  }

  selectText = (i)=>  {
    if (this.state.linkingSelectionActive) {
      let selectedText = this.state.selectionText;
      if (selectedText.indexOf(i)===-1) {
        selectedText.push(i);
      }
      else {
        selectedText.splice(i,1);
      }
      this.setState({
        selectionText: selectedText
      })
    }
  }

  linkingSelectionStart = (e) => {
    let windowOffset = window.pageYOffset;
    if (!this.state.linkingActive || this.state.linkingSelectionActive) {
      return false;
    }
    if (e.target.closest(".classpiece-container")) {
      let parent = document.getElementById("classpiece-container");
      let rect = [];
      let boundingRect = parent.getBoundingClientRect();
      rect.top = ((e.pageY - windowOffset - boundingRect.y)*100)/parseInt(this.state.zoom,10);
      rect.left = ((e.pageX - boundingRect.x)*100)/parseInt(this.state.zoom,10);
      this.setState({
        linkingSelection: true,
        linkinSelectionRect: rect,
      })
    }
  };

  linkingSelectionMove = (e) => {
    if (this.state.linkingActive && this.state.linkingSelection) {
      if (e.target.closest(".classpiece-container")) {
        let windowOffset = window.pageYOffset;
        let stateRect = this.state.linkinSelectionRect;
        let rect = {top:stateRect.top, left:stateRect.left, width:0, height:0, transform: 'translate(0,0)'}
        // new mouse position
        let parent = document.getElementById("classpiece-container");
        let boundingRect = parent.getBoundingClientRect();
        let mouseTop = ((e.pageY - windowOffset - boundingRect.y)*100)/parseInt(this.state.zoom,10);
        let mouseLeft = ((e.pageX - boundingRect.x)*100)/parseInt(this.state.zoom,10);

        let width = mouseLeft - stateRect.left ;
        let height = mouseTop - stateRect.top;
        //console.log(width, height);
        rect.width = Math.abs(width);
        rect.height = Math.abs(height);
        if (width<0 || height<0) {
          let transform = '';
          if (width<0 && height>=0) {
            transform = 'translate('+width+'px,0px)';
          }
          if (width>=0 && height<0) {
            transform = 'translate(0px,'+height+'px)';
          }
          if (width<0 && height<0) {
            transform = 'translate('+width+'px,'+height+'px)';
          }
          rect.transform = transform;
        }

        this.setState({
          linkinSelectionRect: rect,
        })
      }

    }
  }

  linkingSelectionEnd = () => {
    if (this.state.linkingSelectionActive) {
      return false;
    }
    if (typeof this.state.linkinSelectionRect.width==="undefined" || this.state.linkinSelectionRect.width<40 || this.state.linkinSelectionRect.height<40) {
      this.setState({
        linkingSelection: false,
        linkinSelectionRect: {top:0, left:0, width:0, height:0,transform: 'translate(0,0)'},
      })
      return false;
    }
    if (this.state.linkingActive && this.state.linkingSelection) {
      let selectedFace = this.getFaceInSelection();
      let face = this.state.faces[selectedFace];
      if (typeof face==="undefined") {
        let errorModalText = <div>Please make certain that a person's thumbnail is part of your selection.</div>
        this.toggleErrorModal(true, errorModalText);
        this.setState({
          linkingSelection: false,
          linkinSelectionRect: {top:0, left:0, width:0, height:0,transform: 'translate(0,0)'}
        })
        return false;
      }

      // check if thumbnail exists
      if (typeof face.thumbnail==="undefined") {
        let errorModalText = <div>Please return to the <b>Selections</b> step and click on <b>Extract thumbnails</b> to continue.</div>
        this.toggleErrorModal(true, errorModalText);
        this.setState({
          linkingSelection: false,
          linkinSelectionRect: {top:0, left:0, width:0, height:0,transform: 'translate(0,0)'}
        })
        return false;
      }

      let selectedText = this.getTextsSelection();
      let saveSelectedModal = false;

      if (typeof selectedFace!=="undefined") {
        if (selectedFace!==null || selectedText.length>0) {
          saveSelectedModal = true;
        }

        let stateFaces = this.state.faces;
        let selectedFaceData = stateFaces[selectedFace];
        let inputhonorificprefix = '';
        let inputfirstname = '';
        let inputmiddlename = '';
        let inputlastname = '';
        let inputdiocese = '';
        let inputtype = '';
        if (typeof selectedFaceData.honorificPrefix!=="undefined") {
          inputhonorificprefix = selectedFaceData.honorificPrefix;
        }
        if (typeof selectedFaceData.firstName!=="undefined") {
          inputfirstname = selectedFaceData.firstName;
        }
        if (typeof selectedFaceData.middleName!=="undefined") {
          inputmiddlename = selectedFaceData.middleName;
        }
        if (typeof selectedFaceData.lastName!=="undefined") {
          inputlastname = selectedFaceData.lastName;
        }
        if (typeof selectedFaceData.diocese!=="undefined") {
          inputdiocese = selectedFaceData.diocese;
        }
        if (typeof selectedFaceData.type!=="undefined") {
          inputtype = selectedFaceData.type;
        }

        this.setState({
          selectionFaces: selectedFace,
          selectionText: selectedText,
          saveSelectedModal: saveSelectedModal,
          linkingSelection: false,
          linkinSelectionRect: {top:0, left:0, width:0, height:0,transform: 'translate(0,0)'},
          inputhonorificprefix: inputhonorificprefix,
          inputfirstname: inputfirstname,
          inputmiddlename: inputmiddlename,
          inputlastname: inputlastname,
          inputdiocese: inputdiocese,
          inputtype: inputtype,
        })
      }
      else {
        this.setState({
          linkingSelection: false,
          linkinSelectionRect: {top:0, left:0, width:0, height:0,transform: 'translate(0,0)'},
        })
      }

    }
  };

  getFaceInSelection = () => {
    let selection = this.state.linkinSelectionRect;
    let selectedFaces = [];
    for (let i=0; i<this.state.faces.length; i++) {
      let linkingFaceBox = this.state.faces[i];
      let faceRectangle = linkingFaceBox.faceRectangle;

      // create css shape
      let width = faceRectangle.width.replace("px", "");
      width = parseInt(width,10);
      let height = faceRectangle.height.replace("px", "");
      height = parseInt(height,10);
      let left = faceRectangle.left;
      let top = faceRectangle.top;
      let right = left+width;
      let bottom = top+height;

      // normal selection
      let selectionWidth = selection.width;
      let selectionHeight = selection.height;

      let selectionLeft = selection.left;
      let selectionRight = selection.left + selectionWidth;
      let selectionTop = selection.top;
      let selectionBottom = selection.top + selectionHeight;

      // negative selection
      if (typeof selection.transform!=="undefined") {
        let selectionTransform = selection.transform;
        selectionTransform = selectionTransform.replace('translate(','');
        selectionTransform = selectionTransform.replace(')','');
        selectionTransform = selectionTransform.replace(/px/g,'');
        let selectionTransformArr = selectionTransform.split(",");
        if (selectionTransformArr[0]<0) {
          selectionRight = selectionLeft;
          selectionLeft = selection.left - selectionWidth;
        }
        if (selectionTransformArr[1]<0) {
          selectionBottom = selectionTop;
          selectionTop = selection.top - selectionHeight;
        }
      }


      if (left>=selectionLeft && top>=selectionTop && right<=selectionRight && bottom<=selectionBottom) {
        selectedFaces.push(i);
      }
    }
    let selectedFace = selectedFaces[0];
    return selectedFace;
  }

  getTextsSelection = () => {
    let selection = this.state.linkinSelectionRect;
    let selectedTexts = [];
    for (let j=0; j<this.state.texts.length; j++) {
      let linkingTextBox = this.state.texts[j];
      let boundingBox = linkingTextBox.boundingBox;

      // create css shape
      let left = boundingBox[0];
      let right = boundingBox[2];
      let top = boundingBox[1];
      let bottom = boundingBox[5];

      // normal selection
      let selectionWidth = selection.width;
      let selectionHeight = selection.height;

      let selectionLeft = selection.left;
      let selectionRight = selection.left + selectionWidth;
      let selectionTop = selection.top;
      let selectionBottom = selection.top + selectionHeight;

      // negative selection
      if (typeof selection.transform!=="undefined") {
        let selectionTransform = selection.transform;
        selectionTransform = selectionTransform.replace('translate(','');
        selectionTransform = selectionTransform.replace(')','');
        selectionTransform = selectionTransform.replace(/px/g,'');
        let selectionTransformArr = selectionTransform.split(",");
        if (selectionTransformArr[0]<0) {
          selectionRight = selectionLeft;
          selectionLeft = selection.left - selectionWidth;
        }
        if (selectionTransformArr[1]<0) {
          selectionBottom = selectionTop;
          selectionTop = selection.top - selectionHeight;
        }
      }

      if (left>=selectionLeft && top>=selectionTop && right<=selectionRight && bottom<=selectionBottom) {
        selectedTexts.push(j);
      }
    }
    return selectedTexts;
  }

  startDragText = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData("text/html", e.target.id);
    e.dataTransfer.dropEffect = "move";
    this.setState({
      draggableText: e.target.textContent
    })
  }

  dragStopText = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let target = e.target.getAttribute("data-target");
    let targetText = this.state[target];
    let space = '';
    if (targetText!=='') {
      space = ' ';
    }
    let newTargetText = targetText+space+this.state.draggableText;
    this.setState({
      [target]: newTargetText,
      draggedElem:null
    })
    return false;
  }

  dragOverText = (e) => {
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  dragEnterText = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let target = e.target.getAttribute("data-target");
    this.setState({
      dragover: true,
      draggedElem:target
    });
  }

  dragLeaveText = (e) => {
    this.setState({
      dragover: false,
      draggedElem:null
    });
    e.preventDefault();
    return false;
  }

  handleChange = (e) => {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;

    this.setState({
      [name]: value
    });
  }

  updatePersonModal = (e) => {
    e.preventDefault();
    if (this.state.updatePersonStatus) {
      return false;
    }
    this.setState({
      updatePersonStatus: true,
      updatePersonBtn: <span><i className="fa fa-save"></i> Updating person... <Spinner size="sm" color="light" /></span>
    });
    let faces = this.state.faces;
    let selectedFace = this.state.selectionFaces;

    let selectedPerson = faces[selectedFace];
    selectedPerson.honorificPrefix = this.state.inputhonorificprefix;
    selectedPerson.firstName = this.state.inputfirstname;
    selectedPerson.middleName = this.state.inputmiddlename;
    selectedPerson.lastName = this.state.inputlastname;
    selectedPerson.diocese = this.state.inputdiocese;
    selectedPerson.type = this.state.inputtype;

    faces[selectedFace] = selectedPerson;
    this.setState({
      faces: faces,
      saveSelectedModal: false,
      updatePersonStatus: false,
      updatePersonBtn: <span><i className="fa fa-save"></i> Update person</span>,
      draggableText: '',
      inputhonorificprefix: '',
      inputfirstname: '',
      inputmiddlename: '',
      inputlastname: '',
      inputdiocese: '',
      inputtype: 'student',
    });
  }

  storeLinking = () => {
    if (this.state.storeLinkingStatus) {
      return false;
    }
    this.setState({
      storeLinkingStatus: true,
      storeLinkingBtn: <span><i className="fa fa-save"></i> Storing updates... <Spinner size="sm" color="secondary" /></span>
    });

    let context = this;
    let fileName = this.props.match.params.fileName;
    let postData = {
      file: fileName,
      faces: this.state.faces
    };
    axios({
        method: 'post',
        url: APIPath+'update-class-piece-faces?file='+fileName,
        crossDomain: true,
        data: postData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
  	  .then(function (response) {
        context.setState({
          storeLinkingStatus: false,
          storeLinkingBtn: <span><i className="fa fa-save"></i> Success <i className="fa fa-check"></i></span>
        })
        setTimeout(function() {
          context.setState({
            storeLinkingBtn: <span><i className="fa fa-save"></i> Store updates</span>
          })
        },2000)
  	  })
  	  .catch(function (error) {
  	  });
  }

  addNewSelection = () => {
    if (this.state.contextualMenuTargetFace) {
      return false;
    }
    else {
      let containerPosition = this.state.selectedNode.getBoundingClientRect();
      let faces = this.state.faces;
      let defaultDimensions = faces[0].boundingPoly.vertices;
      let defaultWidth = defaultDimensions[1].x - defaultDimensions[0].x;
      let defaultHeight = defaultDimensions[2].y - defaultDimensions[0].y;

      let newWidth = Math.abs(defaultWidth);
      let newHeight = Math.abs(defaultHeight);

      let mousePosition = this.state.contextualMenuPosition;
      let zoom = parseInt(this.state.zoom,10);
      let mouseLeft = ((parseInt(mousePosition.left,10)-containerPosition.left)*100)/zoom;
      let mouseTop = ((parseInt(mousePosition.top,10)-containerPosition.top)*100)/zoom;
      let leftX = mouseLeft;
      let rightX = mouseLeft+newWidth;
      let topY = mouseTop;
      let bottomY = mouseTop+newHeight;

      let tl = {x: leftX, y: topY};
      let tr = {x: rightX, y: topY};
      let br = {x: rightX, y: bottomY};
      let bl = {x: leftX, y: bottomY};
      let newFace = {};
      newFace.boundingPoly = {vertices: [tl, tr, br, bl]};

      faces.push(newFace);
      this.setState({
        faces: faces
      });
    }
  }

  removeSelection = () => {
    if (!this.state.contextualMenuTargetFace) {
      return false;
    }
    let targetNode = this.state.selectedNode;
    let index = parseInt(targetNode.getAttribute("data-key"),10);
    let faces = this.state.faces;
    let newFaces = faces.filter(i => i !== faces[index])
    let context = this;
    this.setState({
      faces: []
    })
    setTimeout(function() {
      context.setState({
        faces: newFaces
      })
    },10)

  }

  handleContextMenu = (e) => {
    e.preventDefault();

    let contextualMenuTargetFace = false;
    if (typeof e.target.classes!=="undefined") {
      let nodeClasses = e.target.attributes.class.nodeValue;
      let nodeClassesArr = nodeClasses.split(" ");
      if (nodeClassesArr.indexOf("facebox")>-1) {
        contextualMenuTargetFace = true
      }
    }

    let clickX = e.clientX;
    let clickY = e.clientY;
    let screenW = window.innerWidth;
    let screenH = window.innerHeight;

    let contextMenuHeight = 232;
    let contextMenuWidth = 180;

    if ((parseFloat(clickY,10)+contextMenuHeight)>parseFloat(screenH,10)) {
      clickY = parseFloat(clickY,10)-contextMenuHeight;
    }

    if ((parseFloat(clickX,10)+contextMenuWidth)>parseFloat(screenW,10)) {
      clickX = parseFloat(clickX,10)-contextMenuWidth;
    }
    let newPosition = {
      left: clickX,
      top: clickY
    }
    this.setState({
      contextualMenuVisible: true,
      contextualMenuPosition: newPosition,
      contextualMenuTargetFace: contextualMenuTargetFace,
      selectedNode: e.target
    });
  }

  handleClick = () => {
    if (this.state.contextualMenuVisible) {
      this.setState({
        contextualMenuVisible: false
      });
    }
  }

  handleScroll = () => {
    if (this.state.contextualMenuVisible) {
      this.setState({
        contextualMenuVisible: false
      });
    }
  }

  toggleErrorModal = (value=null, text=null) => {
    let visible = !this.state.errorModalVisible;
    if (value!==null) {
      visible = value;
    }
    this.setState({
      errorModalVisible: visible,
      errorModalText: text
    })
  }

  componentDidMount() {
    this.loadFile();
    window.addEventListener('keydown', this.startSelection);
    window.addEventListener('keyup', this.endSelection);

    // drag selection
    window.addEventListener('mousedown', this.linkingSelectionStart);
    window.addEventListener('mouseup', this.linkingSelectionEnd);
    window.addEventListener('mousemove', this.linkingSelectionMove);

    // contextual menu
    document.addEventListener('click', this.handleClick);
    document.addEventListener('scroll', this.handleScroll);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.match.params.fileName!==this.props.match.params.fileName) {
      this.loadFile();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.startSelection);
    window.removeEventListener('keyup', this.endSelection);

    // drag selection
    window.removeEventListener('mousedown', this.linkingSelectionStart);
    window.removeEventListener('mouseup', this.linkingSelectionEnd);
    window.removeEventListener('mousemove', this.linkingSelectionMove);

    // contextual menu
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('scroll', this.handleScroll);
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
      let scaleNum = parseInt(this.state.zoom,10)/100;
      let transform = {transform: "scale("+scaleNum+","+scaleNum+")"};

      // selections
      let selectionsVisible = " hidden";
      if (this.state.selectionsActive) {
        selectionsVisible = "";
      }
      let selectionsFaceBoxes = [];
      for (let sf=0; sf<this.state.faces.length; sf++) {
        let face = this.state.faces[sf];
        let rectangle = face.faceRectangle;
        let rotate = 0;
        if (typeof face.rotate!=="undefined") {
          rotate = face.rotate;
        }

        let defaultValues = {
          x: rectangle.left,
          y: rectangle.top,
          width: rectangle.width,
          height: rectangle.height,
          degree: rotate,
        }
        let hasThumbnailClass = "";
        if (typeof face.thumbnail!=="undefined") {
          hasThumbnailClass = " has-thumbnail";
        }
        let extendedProps = {'data-key': sf}
        let newBox = <Rnd
          extendsProps = {extendedProps}
          key={sf}
          className={"facebox"+hasThumbnailClass}
          default={defaultValues}
          enable={{rotate: rotate}}
          onDragStop={(e,d) =>this.dragFace(e,d,sf)}
          onResizeStop={(e, direction, ref, delta, position)=> this.resizeFace(e, direction, ref, delta, position, sf)}
          ></Rnd>;
        selectionsFaceBoxes.push(newBox);

      }

      let selectionsTextBoxes = [];
      for (let st=0; st<this.state.texts.length; st++) {
        let text = this.state.texts[st];
        let boundingBox = text.boundingBox;

        let textLeft = boundingBox[0];
        let textTop = boundingBox[1];
        let textWidth = boundingBox[2]-boundingBox[0];
        let textHeight = boundingBox[5] - boundingBox[1];
        // create css shape
        let boxStyle = {
          left: textLeft,
          top: textTop,
          width: textWidth,
          height: textHeight,
        }
        let newTextBox = <div key={st} className="textbox" style={boxStyle}></div>;
        selectionsTextBoxes.push(newTextBox);
      }

      // linking
      let linkingFaceBoxesOutput = [];
      for (let lf=0; lf<this.state.faces.length; lf++) {
        let linkingFaceBox = this.state.faces[lf];
        let rectangle = linkingFaceBox.faceRectangle;

        // create css shape

        let rotate = 0;
        if (typeof linkingFaceBox.rotate!=="undefined") {
          rotate = linkingFaceBox.rotate;
        }
        let defaultValues = {
          left: rectangle.left,
          top: rectangle.top,
          width: rectangle.width,
          height: rectangle.height,
        }
        if (rotate!==0) {
          defaultValues.transform = "rotate("+rotate+"deg)";
        }
        let activeLinkingFacebox = "";
        if (parseInt(this.state.selectionFaces,10)===lf) {
          activeLinkingFacebox = " active";
        }
        let hasDataClass = "";
        if (typeof linkingFaceBox.firstName!=="undefined") {
          hasDataClass = " has-data";
        }

        let newLinkingFaceBox = <div
          draggable="false"
          style={defaultValues}
          key={lf}
          className={"facebox"+activeLinkingFacebox+hasDataClass}
          onClick={() => this.selectFace(lf)}
          ></div>
        linkingFaceBoxesOutput.push(newLinkingFaceBox);
      }
      let linkingVisible = " hidden";
      if (this.state.linkingActive) {
        linkingVisible = "";
      }


      let linkingTextBoxesOutput = [];
      for (let lt=0; lt<this.state.texts.length; lt++) {
        let linkingTextBox = this.state.texts[lt];
        let boundingBox = linkingTextBox.boundingBox;

        let textLeft = boundingBox[0];
        let textTop = boundingBox[1];
        let textWidth = boundingBox[2]-boundingBox[0];
        let textHeight = boundingBox[5] - boundingBox[1];
        // create css shape
        let boxStyle = {
          left: textLeft,
          top: textTop,
          width: textWidth,
          height: textHeight,
        }

        let activeLinkingTextbox = "";
        if (this.state.selectionText.indexOf(lt)>-1) {
          activeLinkingTextbox = " active";
        }
        let newTextBox = <div
          draggable="false"
          key={lt}
          className={"textbox"+activeLinkingTextbox}
          onClick={() => this.selectText(lt)}
          style={boxStyle}
          ></div>;
        linkingTextBoxesOutput.push(newTextBox);
      }
      let linkingSelectionClass="";
      if (this.state.linkingSelection) {
        linkingSelectionClass = " active";
      }
      let linkingSelection = <div style={this.state.linkinSelectionRect} className={"linking-selection"+linkingSelectionClass}></div>

      content = <div
        className="classpiece-container"
        style={transform}
        id="classpiece-container"
        onContextMenu={this.handleContextMenu}
        >
        {linkingSelection}
        {this.state.file}
        <div className={"face-boxes-container"+selectionsVisible}>{selectionsFaceBoxes}</div>
        <div className={"text-boxes-container"+selectionsVisible}>{selectionsTextBoxes}</div>
        <div className={"linking-boxes-container"+linkingVisible}>{linkingFaceBoxesOutput}</div>
        <div className={"linking-text-container"+linkingVisible}>{linkingTextBoxesOutput}</div>
      </div>
    }

    let honorificPrefixActive="",firstNameActive="",middleNameActive="",lastNameActive="",dioceseActive="";
    if (this.state.draggedElem==="inputhonorificprefix") {
      honorificPrefixActive = "active";
    }
    if (this.state.draggedElem==="inputfirstname") {
      firstNameActive = "active";
    }
    if (this.state.draggedElem==="inputmiddlename") {
      middleNameActive = "active";
    }
    if (this.state.draggedElem==="inputlastname") {
      lastNameActive = "active";
    }
    if (this.state.draggedElem==="inputdiocese") {
      dioceseActive = "active";
    }

    let selectedThumbnail = "";
    let thumbnailText = [];
    if (this.state.selectionFaces!==null) {
      let selectedFace = this.state.faces[this.state.selectionFaces];
      if (typeof selectedFace!=="undefined") {
        if (typeof selectedFace.thumbnail!=="undefined") {
          let thumbnail = selectedFace.thumbnail;
          selectedThumbnail = <img className="selected-face-thumbnail img-responsive img-thumbnail" alt="thumbnail" src={thumbnail.path} />
        }
      }

    }
    for (let tt=0;tt<this.state.selectionText.length; tt++) {
      let textItem = this.state.selectionText[tt]
      let textChunk = this.state.texts[textItem].text;
      let textBox = <div
        draggable="true"
        onDragStart={this.startDragText.bind(this)}
        key={tt}
        className="thumbnail-textbox">{textChunk}</div>
      thumbnailText.push(textBox);
    }

    let fileName = this.props.match.params.fileName;
    let heading = "Identify people";
    let breadcrumbsItems = [
      {label: "Parse Class Pieces", icon: "pe-7s-tools", active: false, path: "/parse-class-pieces"},
      {label: "Class Piece \""+fileName+"\"", icon: "", active: false, path: "/parse-class-piece/"+fileName},
      {label: heading, icon: "", active: true, path: ""}
    ];

    let errorModal = <Modal isOpen={this.state.errorModalVisible} toggle={()=>this.toggleErrorModal(!this.state.errorModalVisible,null)}>
        <ModalHeader toggle={()=>this.toggleErrorModal(false,[])}>Error</ModalHeader>
        <ModalBody>
          {this.state.errorModalText}
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="secondary" onClick={()=>this.toggleErrorModal(false,[])}>Close</Button>
        </ModalFooter>
    </Modal>

    return(
      <div id="classpiece-content-wrapper">
        <Breadcrumbs items={breadcrumbsItems} />
        <div className="row">
          <div className="col-12">
            <h2>{heading}</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="classpiece-wrapper" id="classpiece-wrapper">
              {content}
            </div>
          </div>
        </div>
        <div className="sidebar-toolbox">
          <ParseClassPieceToolbox
            updateFaces={this.updateFaces}
            zoom={this.state.zoom}
            updateZoom={this.updateZoom}
            updateSettings={this.updateSettings}
            toggleSelections={this.toggleSelections}
            selectionsActive={this.state.selectionsActive}
            storeSelectionsBtn={this.state.storeSelectionsBtn}
            saveFacesThumbnails={this.saveFacesThumbnails}
            saveThumbnailsBtn={this.state.saveThumbnailsBtn}
            toggleLinking={this.toggleLinking}
            linkingActive={this.state.linkingActive}
            storeLinkingBtn={this.state.storeLinkingBtn}
            storeLinking={this.storeLinking}
            />
        </div>
        <Modal isOpen={this.state.saveSelectedModal} toggle={this.closeSelectedModal} className={this.props.className}>
          <form onSubmit={this.updatePersonModal}>
            <ModalHeader toggle={this.closeSelectedModal}>Update person</ModalHeader>
            <ModalBody>
              <div className="row">
                <div className="col-xs-12 col-sm-6 col-md-4">
                  <div className="selected-item-thumbnail">
                    {selectedThumbnail}
                  </div>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-8">
                  <div className="form-group">
                    <label>Honorific Prefix</label>
                    <input
                      className={"form-control "+honorificPrefixActive}
                      onChange={this.handleChange}
                      value={this.state.inputhonorificprefix}
                      data-target="inputhonorificprefix"
                      onDrop={this.dragStopText.bind(this)}
                      onDragEnter={this.dragEnterText.bind(this)}
                      onDragOver={this.dragOverText.bind(this)}
                      onDragLeave={this.dragLeaveText.bind(this)}
                      type="text" name="inputhonorificprefix" />
                  </div>
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      className={"form-control "+firstNameActive}
                      onChange={this.handleChange}
                      value={this.state.inputfirstname}
                      data-target="inputfirstname"
                      onDrop={this.dragStopText.bind(this)}
                      onDragEnter={this.dragEnterText.bind(this)}
                      onDragOver={this.dragOverText.bind(this)}
                      onDragLeave={this.dragLeaveText.bind(this)}
                      type="text" name="inputfirstname" />
                  </div>

                  <div className="form-group">
                    <label>Middle Name</label>
                    <input
                      className={"form-control "+middleNameActive}
                      onChange={this.handleChange}
                      value={this.state.inputmiddlename}
                      data-target="inputmiddlename"
                      onDrop={this.dragStopText.bind(this)}
                      onDragEnter={this.dragEnterText.bind(this)}
                      onDragOver={this.dragOverText.bind(this)}
                      onDragLeave={this.dragLeaveText.bind(this)}
                      type="text" name="inputmiddlename" />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      className={"form-control "+lastNameActive}
                      onChange={this.handleChange}
                      value={this.state.inputlastname}
                      data-target="inputlastname"
                      onDrop={this.dragStopText.bind(this)}
                      onDragEnter={this.dragEnterText.bind(this)}
                      onDragOver={this.dragOverText.bind(this)}
                      onDragLeave={this.dragLeaveText.bind(this)}
                      type="text" name="inputlastname" />
                  </div>
                  <div className="form-group">
                    <label>Diocese</label>
                    <input
                      className={"form-control "+dioceseActive}
                      onChange={this.handleChange}
                      value={this.state.inputdiocese}
                      data-target="inputdiocese"
                      onDrop={this.dragStopText.bind(this)}
                      onDragEnter={this.dragEnterText.bind(this)}
                      onDragOver={this.dragOverText.bind(this)}
                      onDragLeave={this.dragLeaveText.bind(this)}
                      type="text" name="inputdiocese" />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select name="inputtype" className="form-control"
                      onChange={this.handleChange}
                      value={this.state.inputtype}>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="guestofhonor">Guest of honor</option>
                    </select>
                  </div>
                  {thumbnailText}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit">{this.state.updatePersonBtn}</Button>
              <Button type="button" color="secondary" onClick={this.closeSelectedModal}>Cancel</Button>
            </ModalFooter>
          </form>
        </Modal>
        <ContextualMenu
          visible={this.state.contextualMenuVisible}
          position={this.state.contextualMenuPosition}
          targetFace={this.state.contextualMenuTargetFace}
          selectedNode={this.state.selectedNode}
          selectionsActive={this.state.selectionsActive}
          linkingActive={this.state.linkingActive}
          updateFaces={this.updateFaces}
          saveFacesThumbnails={this.saveFacesThumbnails}
          storeLinking={this.storeLinking}
          addNewSelection={this.addNewSelection}
          removeSelection={this.removeSelection}
          />
          {errorModal}
      </div>
    );
  }
}
