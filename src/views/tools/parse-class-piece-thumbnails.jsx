import React, {
  useCallback,
  useEffect,
  useState,
  useReducer,
  useRef,
} from 'react';
import axios from 'axios';
import {
  Spinner,
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
import PropTypes from 'prop-types';
import Breadcrumbs from '../../components/breadcrumbs';
import Draggable from '../../components/draggable';
import '../../assets/sa-dnd/sa-dnd.css';
import ParseClassPieceToolbox from './right-sidebar-toolbox';
import ContextualMenu from '../../components/parse-class-piece-contextual-menu';
import { stringDimensionToInteger, capitalizeOnlyFirst } from '../../helpers';

const APIPath = process.env.REACT_APP_APIPATH;

const ParseClassPieceThumbnails = (props) => {
  // props
  const { match } = props;
  const fileName = match.params?.fileName || '';

  // state
  const [loadingTaxonomies, setLoadingTaxonomies] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingFaces, setLoadingFaces] = useState(true);
  const defaultState = {
    initialLoad: true,
    organisationTypes: [],
    peopleRoles: [],
    fileInfo: null,
    file: [],
    faces: [],
    texts: [],
    zoom: 100,
    settingsUpdate: false,
    selectionsActive: true,

    storeSelectionsStatus: false,
    storeSelectionsBtn: (
      <span>
        <i className="fa fa-save" /> Store selections
      </span>
    ),

    saveThumbnailsStatus: false,
    saveThumbnailsBtn: (
      <span>
        <i className="fa fa-save" /> Extract thumbnails
      </span>
    ),

    linkingActive: false,
    linkingSelectionActive: false,
    selectionFaces: null,
    selectionText: [],
    saveSelectedModal: false,

    linkingSelection: false,
    linkinSelectionRect: {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      transform: 'translate: (0,0)',
    },

    draggableText: '',
    dragover: false,
    draggedElem: null,
    draggedIndex: null,
    inputhonorificprefix: [''],
    inputfirstname: '',
    inputmiddlename: '',
    inputlastname: '',
    inputdiocese: '',
    inputdioceseType: 'Diocese',
    inputtype: 'student',

    updatePersonStatus: false,
    updatePersonBtn: (
      <span>
        <i className="fa fa-save" /> Update person
      </span>
    ),

    storeLinkingBtn: (
      <span>
        <i className="fa fa-save" /> Store updates
      </span>
    ),
    storeLinkingStatus: false,

    // contextual menu
    contextualMenuVisible: false,
    contextualMenuPosition: {
      top: 0,
      left: 0,
    },
    contextualMenuTargetFace: false,
    selectedNode: [],
    selectedNodeKey: [],

    // errorModal
    errorModalVisible: false,
    errorModalText: [],
  };
  const [state, setState] = useReducer(
    (exState, newState) => ({ ...exState, ...newState }),
    defaultState
  );

  // refs
  const itemPreview = useRef(null);

  const loadFaces = useCallback(async () => {
    const facesFile = state.fileInfo.faces;
    let facesData = await axios({
      method: 'get',
      url: facesFile,
      crossDomain: true,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (typeof facesData === 'string') {
      facesData = JSON.parse(facesData);
    }
    let hasThumbnailCount = 0;
    for (let i = 0; i < facesData.length; i += 1) {
      const face = facesData[i];
      if (typeof face.thumbnail !== 'undefined') {
        hasThumbnailCount += 1;
      }
    }
    const selectionsActive = hasThumbnailCount !== facesData.length;
    const linkingActive = hasThumbnailCount === facesData.length;
    setState({
      faces: facesData,
      selectionsActive,
      linkingActive,
    });
  }, [state]);

  const loadText = useCallback(async () => {
    const textFile = state.fileInfo.text;
    const textData = await axios({
      method: 'get',
      url: textFile,
      crossDomain: true,
    })
      .then((response) => response.data.lines)
      .catch((error) => {
        console.log(error);
      });
    const texts = [];
    for (let i = 0; i < textData.length; i += 1) {
      const line = textData[i];
      if (typeof line.words !== 'undefined') {
        for (let j = 0; j < line.words.length; j += 1) {
          const word = line.words[j];
          texts.push(word);
        }
      }
    }
    setState({
      texts,
      loading: false,
    });
  }, [state.fileInfo]);

  const loadSettings = useCallback(() => {
    let settings = [];
    if (
      sessionStorage.getItem('settings') !== null &&
      sessionStorage.getItem('settings') !== ''
    ) {
      settings = JSON.parse(sessionStorage.getItem('settings'));
    }
    const newZoom = settings.zoom || 100;
    setState({
      zoom: Number(newZoom),
    });
  }, []);

  const loadFile = useCallback(async () => {
    const file = await axios({
      method: 'get',
      url: `${APIPath}list-class-piece?file=${fileName}`,
      crossDomain: true,
    })
      .then((response) => response.data.data[0])
      .catch((error) => {
        console.log(error);
      });
    const fileOutput = (
      <img
        src={file.compressed}
        alt={file.name}
        draggable="false"
        onDragStart={(e) => {
          e.preventDefault();
        }}
      />
    );
    setState({
      fileInfo: file,
      file: fileOutput,
    });
    setLoading(false);
  }, [fileName]);

  const loadTaxonomyTypes = useCallback(async () => {
    const organisationTypes = await axios({
      method: 'get',
      url: `${APIPath}taxonomy`,
      crossDomain: true,
      params: { systemType: 'organisationTypes' },
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    const peopleRoles = await axios({
      method: 'get',
      url: `${APIPath}taxonomy`,
      crossDomain: true,
      params: { systemType: 'peopleRoles' },
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    setState({
      organisationTypes: organisationTypes.taxonomyterms,
      peopleRoles: peopleRoles.taxonomyterms,
    });
    setLoadingTaxonomies(false);
  }, []);

  const updateFaces = async () => {
    if (state.storeSelectionsStatus) {
      return false;
    }
    setState({
      storeSelectionsStatus: true,
      storeSelectionsBtn: (
        <span>
          <i className="fa fa-save" /> Storing selections...{' '}
          <Spinner size="sm" color="secondary" />
        </span>
      ),
    });
    const postData = {
      file: fileName,
      faces: JSON.stringify(state.faces),
    };
    const update = await axios({
      method: 'post',
      url: `${APIPath}update-class-piece-faces?file=${fileName}`,
      crossDomain: true,
      data: postData,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    let stateUpdate = {};
    if (update.status) {
      stateUpdate = {
        storeSelectionsStatus: false,
        storeSelectionsBtn: (
          <span>
            <i className="fa fa-save" /> Success
            <i className="fa fa-check" />
          </span>
        ),
      };
    } else {
      stateUpdate = {
        storeSelectionsStatus: false,
        storeSelectionsBtn: (
          <span>
            <i className="fa fa-save" /> Error
            <i className="fa fa-times" />
          </span>
        ),
      };
    }
    setState(stateUpdate);
    setTimeout(() => {
      setState({
        storeSelectionsBtn: (
          <span>
            <i className="fa fa-save" /> Store selections
          </span>
        ),
      });
    }, 2000);
    return false;
  };

  const dragFace = (d, i) => {
    const faces = Object.assign([], state.faces);
    const currentFace = faces[i];
    const { width, height } = d;
    const leftX = d.left;
    const topY = d.top;
    const calcFaceRectangle = {
      width,
      height,
      left: leftX,
      top: topY,
    };
    const newFace = { ...currentFace };
    newFace.faceRectangle = calcFaceRectangle;
    faces[i] = newFace;
    setState({
      faces,
    });
    return false;
  };

  const resizeFace = (d, i) => {
    const faces = Object.assign([], state.faces);
    const currentFace = faces[i];
    const { width, height } = d;
    const leftX = d.left;
    const topY = d.top;
    const calcFaceRectangle = {
      width,
      height,
      left: leftX,
      top: topY,
    };
    const rotate = d.degree;
    const newFace = { ...currentFace };
    newFace.faceRectangle = calcFaceRectangle;
    newFace.rotate = rotate;
    faces[i] = newFace;
    setState({
      faces,
    });
    return false;
  };

  const updateSettings = () => {
    const newZoom = state.zoom;
    let settings = {};
    if (sessionStorage.getItem('settings') !== null) {
      settings = JSON.parse(sessionStorage.getItem('settings'));
    }
    settings = { zoom: Number(newZoom) };
    const storedSettings = JSON.stringify(settings);
    sessionStorage.setItem('settings', storedSettings);
  };

  const updateZoom = (value) => {
    setState({
      zoom: Number(value),
      settingsUpdate: true,
    });
  };

  const toggleSelections = () => {
    const value = !state.selectionsActive;
    setState({
      selectionsActive: value,
    });
    if (value) {
      setState({
        linkingActive: false,
      });
    }
  };

  const toggleLinking = () => {
    const value = !state.linkingActive;
    setState({
      linkingActive: value,
    });
    if (value) {
      setState({
        selectionsActive: false,
      });
    }
  };

  const saveFacesThumbnails = async () => {
    if (state.saveThumbnailsStatus) {
      return false;
    }
    setState({
      saveThumbnailsStatus: true,
      saveThumbnailsBtn: (
        <span>
          <i className="fa fa-save" /> Extracting thumbnails...{' '}
          <Spinner size="sm" color="secondary" />
        </span>
      ),
    });
    const update = await axios({
      method: 'get',
      url: `${APIPath}meta-parse-class-piece?file=${fileName}`,
      crossDomain: true,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    let updateState = {};
    if (update.status) {
      updateState = {
        saveThumbnailsStatus: false,
        saveThumbnailsBtn: (
          <span>
            <i className="fa fa-save" /> Success <i className="fa fa-check" />
          </span>
        ),
      };
    } else {
      updateState = {
        saveThumbnailsStatus: false,
        saveThumbnailsBtn: (
          <span>
            <i className="fa fa-save" /> Error <i className="fa fa-times" />
          </span>
        ),
      };
    }
    setState(updateState);
    setTimeout(() => {
      setState({
        saveThumbnailsBtn: (
          <span>
            <i className="fa fa-save" /> Extract thumbnails
          </span>
        ),
      });
      loadFaces();
    }, 2000);
    return false;
  };

  // linking
  const startSelection = useCallback((e) => {
    if (e.metaKey || e.ctrlKey) {
      setState({
        linkingSelectionActive: true,
      });
    }
  }, []);

  const endSelection = useCallback(
    (e) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        let saveSelectedModal = false;
        if (state.selectionFaces !== null || state.selectionText.length > 0) {
          saveSelectedModal = true;
        }
        setState({
          linkingSelectionActive: false,
          saveSelectedModal,
        });
      }
    },
    [state.selectionFaces, state.selectionText]
  );

  const closeSelectedModal = () => {
    setState({
      selectionFaces: null,
      selectionText: [],
      draggableText: '',
      inputhonorificprefix: [''],
      inputfirstname: '',
      inputmiddlename: '',
      inputlastname: '',
      inputdiocese: '',
      inputdioceseType: 'Diocese',
      inputtype: 'student',
      saveSelectedModal: false,
    });
  };

  const selectFace = (i) => {
    if (state.linkingSelectionActive) {
      let { selectedFaces } = state.selectionFaces;
      if (selectedFaces !== i) {
        selectedFaces = i;
      } else {
        selectedFaces = null;
      }
      setState({
        selectionFaces: selectedFaces,
      });
    }
  };

  const selectText = (i) => {
    if (state.linkingSelectionActive) {
      const selectedText = state.selectionText;
      if (selectedText.indexOf(i) === -1) {
        selectedText.push(i);
      } else {
        selectedText.splice(i, 1);
      }
      setState({
        selectionText: selectedText,
      });
    }
  };

  const linkingSelectionStart = useCallback(
    (e) => {
      const windowOffset = window.pageYOffset;
      if (!state.linkingActive || state.linkingSelectionActive) {
        return false;
      }
      if (e.target.closest('.classpiece-container')) {
        const parent = document.getElementById('classpiece-container');
        const rect = [];
        const boundingRect = parent.getBoundingClientRect();
        rect.top =
          ((e.pageY - windowOffset - boundingRect.y) * 100) /
          parseInt(state.zoom, 10);
        rect.left =
          ((e.pageX - boundingRect.x) * 100) / parseInt(state.zoom, 10);
        setState({
          linkingSelection: true,
          linkinSelectionRect: rect,
        });
      }
      return false;
    },
    [state.linkingActive, state.linkingSelectionActive, state.zoom]
  );

  const linkingSelectionMove = useCallback(
    (e) => {
      if (state.linkingActive && state.linkingSelection) {
        if (e.target.closest('.classpiece-container')) {
          const windowOffset = window.pageYOffset;
          const stateRect = state.linkinSelectionRect;
          const rect = {
            top: stateRect.top,
            left: stateRect.left,
            width: 0,
            height: 0,
            transform: 'translate(0,0)',
          };
          // new mouse position
          const parent = document.getElementById('classpiece-container');
          const boundingRect = parent.getBoundingClientRect();
          const mouseTop =
            ((e.pageY - windowOffset - boundingRect.y) * 100) /
            parseInt(state.zoom, 10);
          const mouseLeft =
            ((e.pageX - boundingRect.x) * 100) / parseInt(state.zoom, 10);

          const width = mouseLeft - stateRect.left;
          const height = mouseTop - stateRect.top;

          rect.width = Math.abs(width);
          rect.height = Math.abs(height);
          if (width < 0 || height < 0) {
            let transform = '';
            if (width < 0 && height >= 0) {
              transform = `translate(${width}px,0px)`;
            }
            if (width >= 0 && height < 0) {
              transform = `translate(0px,${height}px)`;
            }
            if (width < 0 && height < 0) {
              transform = `translate(${width}px,${height}px)`;
            }
            rect.transform = transform;
          }

          setState({
            linkinSelectionRect: rect,
          });
        }
      }
    },
    [
      state.linkingActive,
      state.linkingSelection,
      state.linkinSelectionRect,
      state.zoom,
    ]
  );

  const getFaceInSelection = useCallback(() => {
    const selection = state.linkinSelectionRect;
    const selectedFaces = [];
    for (let i = 0; i < state.faces.length; i += 1) {
      const linkingFaceBox = state.faces[i];
      const { faceRectangle } = linkingFaceBox;

      // create css shape
      const width = stringDimensionToInteger(faceRectangle.width);
      const height = stringDimensionToInteger(faceRectangle.height);
      const { left, top } = faceRectangle;
      const right = left + width;
      const bottom = top + height;

      // normal selection
      const selectionWidth = selection.width;
      const selectionHeight = selection.height;

      let selectionLeft = selection.left;
      let selectionRight = selection.left + selectionWidth;
      let selectionTop = selection.top;
      let selectionBottom = selection.top + selectionHeight;

      // negative selection
      if (typeof selection.transform !== 'undefined') {
        let selectionTransform = selection.transform;
        selectionTransform = selectionTransform.replace('translate(', '');
        selectionTransform = selectionTransform.replace(')', '');
        selectionTransform = selectionTransform.replace(/px/g, '');
        const selectionTransformArr = selectionTransform.split(',');
        if (selectionTransformArr[0] < 0) {
          selectionRight = selectionLeft;
          selectionLeft = selection.left - selectionWidth;
        }
        if (selectionTransformArr[1] < 0) {
          selectionBottom = selectionTop;
          selectionTop = selection.top - selectionHeight;
        }
      }

      if (
        left >= selectionLeft &&
        top >= selectionTop &&
        right <= selectionRight &&
        bottom <= selectionBottom
      ) {
        selectedFaces.push(i);
      }
    }
    const selectedFace = selectedFaces[0];
    return selectedFace;
  }, [state.faces, state.linkinSelectionRect]);

  const getTextsSelection = useCallback(() => {
    const selection = state.linkinSelectionRect;
    const selectedTexts = [];
    for (let j = 0; j < state.texts.length; j += 1) {
      const linkingTextBox = state.texts[j];
      const { boundingBox } = linkingTextBox;

      // create css shape
      const left = boundingBox[0];
      const right = boundingBox[2];
      const top = boundingBox[1];
      const bottom = boundingBox[5];

      // normal selection
      const selectionWidth = selection.width;
      const selectionHeight = selection.height;

      let selectionLeft = selection.left;
      let selectionRight = selection.left + selectionWidth;
      let selectionTop = selection.top;
      let selectionBottom = selection.top + selectionHeight;

      // negative selection
      if (typeof selection.transform !== 'undefined') {
        let selectionTransform = selection.transform;
        selectionTransform = selectionTransform.replace('translate(', '');
        selectionTransform = selectionTransform.replace(')', '');
        selectionTransform = selectionTransform.replace(/px/g, '');
        const selectionTransformArr = selectionTransform.split(',');
        if (selectionTransformArr[0] < 0) {
          selectionRight = selectionLeft;
          selectionLeft = selection.left - selectionWidth;
        }
        if (selectionTransformArr[1] < 0) {
          selectionBottom = selectionTop;
          selectionTop = selection.top - selectionHeight;
        }
      }

      if (
        left >= selectionLeft &&
        top >= selectionTop &&
        right <= selectionRight &&
        bottom <= selectionBottom
      ) {
        selectedTexts.push(j);
      }
    }
    return selectedTexts;
  }, [state.linkinSelectionRect, state.texts]);

  const toggleErrorModal = useCallback(
    (value = null, text = null) => {
      let visible = !state.errorModalVisible;
      if (value !== null) {
        visible = value;
      }
      setState({
        errorModalVisible: visible,
        errorModalText: text,
      });
    },
    [state.errorModalVisible]
  );

  const matchTexts = async (texts) => {
    const dbTexts = await axios({
      method: 'post',
      url: `${APIPath}query-texts`,
      crossDomain: true,
      data: { texts },
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    return dbTexts;
  };

  const linkingSelectionEnd = useCallback(async () => {
    if (state.linkingSelectionActive) {
      return false;
    }
    if (
      typeof state.linkinSelectionRect.width === 'undefined' ||
      state.linkinSelectionRect.width < 40 ||
      state.linkinSelectionRect.height < 40
    ) {
      setState({
        linkingSelection: false,
        linkinSelectionRect: {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          transform: 'translate(0,0)',
        },
      });
      return false;
    }
    if (state.linkingActive && state.linkingSelection) {
      const selectedFace = getFaceInSelection();
      const face = state.faces[selectedFace];
      if (typeof face === 'undefined') {
        const errorModalText = (
          <div>
            Please make certain that a person&apos;s thumbnail is part of your
            selection.
          </div>
        );
        toggleErrorModal(true, errorModalText);
        setState({
          linkingSelection: false,
          linkinSelectionRect: {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            transform: 'translate(0,0)',
          },
        });
        return false;
      }

      // check if thumbnail exists
      if (typeof face.thumbnail === 'undefined') {
        const errorModalText = (
          <div>
            Please return to the <b>Selections</b> step and click on{' '}
            <b>Extract thumbnails</b> to continue.
          </div>
        );
        toggleErrorModal(true, errorModalText);
        setState({
          linkingSelection: false,
          linkinSelectionRect: {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            transform: 'translate(0,0)',
          },
        });
        return false;
      }

      const selectedText = getTextsSelection();
      let saveSelectedModal = false;

      if (typeof selectedFace !== 'undefined') {
        if (selectedFace !== null || selectedText.length > 0) {
          saveSelectedModal = true;
        }

        const stateFaces = state.faces;
        const selectedFaceData = stateFaces[selectedFace];
        let inputhonorificprefix = [''];
        let inputfirstname = '';
        let inputmiddlename = '';
        let inputlastname = '';
        let inputdiocese = '';
        let inputdioceseType = 'Diocese';
        let inputtype = 'student';
        if (typeof selectedFaceData.honorificPrefix !== 'undefined') {
          if (typeof selectedFaceData.honorificPrefix === 'string') {
            selectedFaceData.honorificPrefix = [
              selectedFaceData.honorificPrefix,
            ];
          }
          inputhonorificprefix = selectedFaceData.honorificPrefix;
        }
        if (typeof selectedFaceData.firstName !== 'undefined') {
          inputfirstname = selectedFaceData.firstName;
        }
        if (typeof selectedFaceData.middleName !== 'undefined') {
          inputmiddlename = selectedFaceData.middleName;
        }
        if (typeof selectedFaceData.lastName !== 'undefined') {
          inputlastname = selectedFaceData.lastName;
        }
        if (typeof selectedFaceData.diocese !== 'undefined') {
          inputdiocese = selectedFaceData.diocese;
        }
        if (
          typeof selectedFaceData.dioceseType !== 'undefined' &&
          selectedFaceData.dioceseType !== ''
        ) {
          inputdioceseType = selectedFaceData.dioceseType;
        }
        if (
          typeof selectedFaceData.type !== 'undefined' &&
          selectedFaceData.type !== ''
        ) {
          inputtype = selectedFaceData.type;
        }
        if (
          inputhonorificprefix[0] === '' &&
          inputfirstname === '' &&
          inputmiddlename === '' &&
          inputlastname === '' &&
          inputdiocese === ''
        ) {
          const texts = selectedText.map((i) => state.texts[i]);
          const words = texts.map((item) => item.text);
          const matchedTexts = await matchTexts(words);
          for (let i = 0; i < matchedTexts.length; i += 1) {
            const matchedText = matchedTexts[i];
            if (matchedText.type !== null && matchedText.count > 0) {
              if (matchedText.type === 'firstName') {
                inputfirstname += `${matchedText.word} `;
              }
              if (matchedText.type === 'middleName') {
                inputmiddlename += `${matchedText.word} `;
              }
              if (matchedText.type === 'lastName') {
                inputlastname += `${matchedText.word} `;
              }
              if (matchedText.type === 'diocese') {
                inputdiocese += `${matchedText.word} `;
              }
            }
          }
          // inputhonorificprefix = inputhonorificprefix.trim();
          inputfirstname = inputfirstname.trim();
          inputmiddlename = inputmiddlename.trim();
          inputlastname = inputlastname.trim();
          inputdiocese = inputdiocese.trim();
        }
        setState({
          selectionFaces: selectedFace,
          selectionText: selectedText,
          saveSelectedModal,
          linkingSelection: false,
          linkinSelectionRect: {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            transform: 'translate(0,0)',
          },
          inputhonorificprefix,
          inputfirstname,
          inputmiddlename,
          inputlastname,
          inputdiocese,
          inputdioceseType,
          inputtype,
        });
        setTimeout(() => {
          const rectangle = selectedFaceData.faceRectangle;
          let left = stringDimensionToInteger(rectangle.left);
          const width = stringDimensionToInteger(rectangle.width);
          const { top } = rectangle;
          const previewWindow = itemPreview.current;
          const box = previewWindow.getBoundingClientRect();
          const boxWidth = box.width;
          const margin = (boxWidth - width) / 2;
          left -= margin;
          previewWindow.scrollTo(left, top);
        }, 500);
      } else {
        setState({
          linkingSelection: false,
          linkinSelectionRect: {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            transform: 'translate(0,0)',
          },
        });
      }
    }
    return false;
  }, [getFaceInSelection, getTextsSelection, state, toggleErrorModal]);

  const startDragText = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/html', e.target.id);
    e.dataTransfer.dropEffect = 'move';
    setState({
      draggableText: e.target.textContent,
    });
  };

  const dragStopText = (e, i = null) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target.getAttribute('data-target');
    if (i === null) {
      const targetText = state[target];
      let space = '';
      if (targetText !== '') {
        space = ' ';
      }
      let newTargetText = targetText + space + state.draggableText;
      newTargetText = capitalizeOnlyFirst(newTargetText);
      setState({
        [target]: newTargetText,
        draggedElem: null,
        draggedIndex: null,
      });
    } else {
      const targetText = state[target][i];
      let space = '';
      if (targetText !== '') {
        space = ' ';
      }
      let newTargetText = targetText + space + state.draggableText;
      newTargetText = capitalizeOnlyFirst(newTargetText);

      const elem = state[target];
      elem[i] = newTargetText;
      setState({
        [target]: elem,
        draggedElem: null,
        draggedIndex: null,
      });
    }
    return false;
  };

  const dragOverText = (e) => {
    e.stopPropagation();
    e.preventDefault();
    return false;
  };

  const dragEnterText = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target.getAttribute('data-target');
    const index = e.target.getAttribute('data-index');
    setState({
      dragover: true,
      draggedElem: target,
      draggedIndex: index,
    });
  };

  const dragLeaveText = (e) => {
    setState({
      dragover: false,
      draggedElem: null,
      draggedIndex: null,
    });
    e.preventDefault();
    return false;
  };

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
    const elem = state[name];
    elem[i] = value;
    setState({
      [name]: elem,
    });
  };

  const updatePersonModal = (e) => {
    e.preventDefault();
    if (state.updatePersonStatus) {
      return false;
    }
    setState({
      updatePersonStatus: true,
      updatePersonBtn: (
        <span>
          <i className="fa fa-save" /> Updating person...{' '}
          <Spinner size="sm" color="light" />
        </span>
      ),
    });

    const faces = [...state.faces];
    const selectedFaceIndex = state.selectionFaces;

    const selectedPerson = faces[selectedFaceIndex];
    selectedPerson.honorificPrefix = state.inputhonorificprefix;
    selectedPerson.firstName = state.inputfirstname;
    selectedPerson.middleName = state.inputmiddlename;
    selectedPerson.lastName = state.inputlastname;
    selectedPerson.diocese = state.inputdiocese;
    selectedPerson.dioceseType = state.inputdioceseType;
    selectedPerson.type = state.inputtype;

    if (
      typeof selectedPerson.dioceseType === 'undefined' ||
      selectedPerson.dioceseType === ''
    ) {
      selectedPerson.dioceseType = 'diocese';
    }
    if (selectedPerson.type === '') {
      selectedPerson.type = 'student';
    }
    faces[selectedFaceIndex] = selectedPerson;
    setState({
      faces,
      saveSelectedModal: false,
      updatePersonStatus: false,
      updatePersonBtn: (
        <span>
          <i className="fa fa-save" /> Update person
        </span>
      ),
      draggableText: '',
      inputhonorificprefix: [],
      inputfirstname: '',
      inputmiddlename: '',
      inputlastname: '',
      inputdiocese: '',
      inputdioceseType: '',
      inputtype: 'student',
    });
    return false;
  };

  const storeLinking = async () => {
    if (state.storeLinkingStatus) {
      return false;
    }
    setState({
      storeLinkingStatus: true,
      storeLinkingBtn: (
        <span>
          <i className="fa fa-save" /> Storing updates...{' '}
          <Spinner size="sm" color="secondary" />
        </span>
      ),
    });
    const postData = {
      file: fileName,
      faces: JSON.stringify(state.faces),
    };
    const post = await axios({
      method: 'post',
      url: `${APIPath}update-class-piece-faces?file=${fileName}`,
      crossDomain: true,
      data: postData,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (post.status) {
      setState({
        storeLinkingStatus: false,
        storeLinkingBtn: (
          <span>
            <i className="fa fa-save" /> Success <i className="fa fa-check" />
          </span>
        ),
      });
      setTimeout(() => {
        setState({
          storeLinkingBtn: (
            <span>
              <i className="fa fa-save" /> Store updates
            </span>
          ),
        });
      }, 2000);
    }
    return false;
  };

  const addNewSelection = () => {
    if (state.contextualMenuTargetFace) {
      return false;
    }
    const containerPosition = state.selectedNode.getBoundingClientRect();
    const faces = { ...state.faces };
    const mousePosition = state.contextualMenuPosition;
    const zoom = Number(state.zoom);
    const mouseLeft =
      ((parseInt(mousePosition.left, 10) - containerPosition.left) * 100) /
      zoom;
    const mouseTop =
      ((parseInt(mousePosition.top, 10) - containerPosition.top) * 100) / zoom;
    const leftX = mouseLeft;
    const topY = mouseTop;
    const newFace = {};
    newFace.faceRectangle = {
      width: 100,
      height: 100,
      left: leftX,
      top: topY,
    };
    faces.push(newFace);
    setState({
      faces,
    });
    return false;
  };

  const removeSelection = () => {
    if (!state.contextualMenuTargetFace) {
      return false;
    }
    const targetNode = state.selectedNode;
    const index = parseInt(targetNode.getAttribute('data-key'), 10);
    const { faces } = state;
    const newFaces = faces.filter((i) => i !== faces[index]);
    setState({
      faces: [],
    });
    setState({
      faces: newFaces,
    });
    return false;
  };

  const handleContextMenu = (e) => {
    e.preventDefault();

    const sideBarOpen = document.documentElement.classList.contains('nav-open');

    const leftMargin = sideBarOpen ? 260 : 0;
    let contextualMenuTargetFace = false;
    if (typeof e.target.classes !== 'undefined') {
      const nodeClasses = e.target.attributes.class.nodeValue;
      const nodeClassesArr = nodeClasses.split(' ');
      if (nodeClassesArr.indexOf('facebox') > -1) {
        contextualMenuTargetFace = true;
      }
    }

    let clickX = e.clientX;
    let clickY = e.clientY;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const contextMenuHeight = 232;
    const contextMenuWidth = 180;

    if (parseFloat(clickY, 10) + contextMenuHeight > parseFloat(screenH, 10)) {
      clickY = parseFloat(clickY, 10) - contextMenuHeight;
    }

    if (parseFloat(clickX, 10) + contextMenuWidth > parseFloat(screenW, 10)) {
      clickX = parseFloat(clickX, 10) - contextMenuWidth;
    }
    const newPosition = {
      left: clickX - leftMargin,
      top: clickY,
    };
    setState({
      contextualMenuVisible: true,
      contextualMenuPosition: newPosition,
      contextualMenuTargetFace,
      selectedNode: e.target,
    });
  };

  const handleClick = useCallback(() => {
    if (state.contextualMenuVisible) {
      setState({
        contextualMenuVisible: false,
      });
    }
  }, [state.contextualMenuVisible]);

  const handleScroll = useCallback(() => {
    if (state.contextualMenuVisible) {
      setState({
        contextualMenuVisible: false,
      });
    }
  }, [state.contextualMenuVisible]);

  const removeHP = (i) => {
    const hps = state.inputhonorificprefix;
    hps.splice(i, 1);
    setState({
      inputhonorificprefix: hps,
    });
  };

  const addHP = () => {
    const hps = state.inputhonorificprefix;
    hps.push('');
    setState({
      inputhonorificprefix: hps,
    });
  };

  useEffect(() => {
    if (loadingTaxonomies) {
      loadTaxonomyTypes();
    }
  }, [loadingTaxonomies, loadTaxonomyTypes]);

  useEffect(() => {
    if (loading && !loadingTaxonomies) {
      loadFile();
    }
  }, [loading, loadingTaxonomies, loadFile]);

  useEffect(() => {
    if (state.fileInfo !== null && loadingFaces) {
      setLoadingFaces(false);
      loadFaces();
      loadText();
      loadSettings();
    }
  }, [state.fileInfo, loadingFaces, loadFaces, loadText, loadSettings]);

  useEffect(() => {
    window.addEventListener('keydown', startSelection);
    window.addEventListener('keyup', endSelection);

    // drag selection
    window.addEventListener('mousedown', linkingSelectionStart);
    window.addEventListener('mouseup', linkingSelectionEnd);
    window.addEventListener('mousemove', linkingSelectionMove);

    // contextual menu
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('keydown', startSelection);
      window.removeEventListener('keyup', endSelection);

      // drag selection
      window.removeEventListener('mousedown', linkingSelectionStart);
      window.removeEventListener('mouseup', linkingSelectionEnd);
      window.removeEventListener('mousemove', linkingSelectionMove);

      // contextual menu
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [
    startSelection,
    endSelection,
    linkingSelectionStart,
    linkingSelectionEnd,
    linkingSelectionMove,
    handleClick,
    handleScroll,
  ]);

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
    const scaleNum = parseInt(state.zoom, 10) / 100;
    const transform = { transform: `scale(${scaleNum},${scaleNum})` };

    // selections
    const selectionsVisible = state.selectionsActive ? '' : ' hidden';
    const selectionsFaceBoxes = [];
    for (let sf = 0; sf < state.faces.length; sf += 1) {
      const face = state.faces[sf];
      const rectangle = face.faceRectangle;
      let rotate = 0;
      if (typeof face.rotate !== 'undefined') {
        rotate = face.rotate;
      }
      const hasThumbnailClass =
        typeof face.thumbnail !== 'undefined' ? ' has-thumbnail' : '';
      let widthInt = rectangle.width;
      if (typeof widthInt === 'string') {
        widthInt = widthInt.replace('px', '');
        widthInt = parseInt(widthInt, 10);
      }
      let heightInt = rectangle.height;
      if (typeof heightInt === 'string') {
        heightInt = heightInt.replace('px', '');
        heightInt = parseInt(heightInt, 10);
      }
      const newBox = (
        <Draggable
          draggable
          resizable
          rotate
          parentConstrain={false}
          parentId="classpiece-container"
          key={sf}
          index={sf}
          className={`facebox${hasThumbnailClass}`}
          left={`${rectangle.left}px`}
          top={`${rectangle.top}px`}
          width={widthInt}
          height={heightInt}
          degree={rotate}
          onDragStop={dragFace}
          onResizeStop={resizeFace}
        />
      );
      selectionsFaceBoxes.push(newBox);
    }

    const selectionsTextBoxes = [];
    for (let st = 0; st < state.texts.length; st += 1) {
      const text = state.texts[st];
      const { boundingBox } = text;

      const textLeft = boundingBox[0];
      const textTop = boundingBox[1];
      const textWidth = boundingBox[2] - boundingBox[0];
      const textHeight = boundingBox[5] - boundingBox[1];
      // create css shape
      const boxStyle = {
        left: textLeft,
        top: textTop,
        width: textWidth,
        height: textHeight,
      };
      const newTextBox = <div key={st} className="textbox" style={boxStyle} />;
      selectionsTextBoxes.push(newTextBox);
    }

    // linking
    const linkingFaceBoxesOutput = [];
    for (let lf = 0; lf < state.faces.length; lf += 1) {
      const linkingFaceBox = state.faces[lf];
      const rectangle = linkingFaceBox.faceRectangle;

      // create css shape

      let rotate = 0;
      if (typeof linkingFaceBox.rotate !== 'undefined') {
        rotate = linkingFaceBox.rotate;
      }
      const defaultValues = {
        left: rectangle.left,
        top: rectangle.top,
        width: rectangle.width,
        height: rectangle.height,
      };
      if (rotate !== 0) {
        defaultValues.transform = `rotate(${rotate}deg)`;
      }
      const activeLinkingFacebox =
        Number(state.selectionFaces) === lf ? ' active' : '';
      const hasDataClass =
        typeof linkingFaceBox.firstName !== 'undefined' ? ' has-data' : '';

      const newLinkingFaceBox = (
        <div
          draggable="false"
          style={defaultValues}
          key={lf}
          className={`facebox${activeLinkingFacebox}${hasDataClass}`}
          onClick={() => selectFace(lf)}
          onKeyDown={() => false}
          role="textbox"
          tabIndex={0}
          aria-label="link"
        />
      );
      linkingFaceBoxesOutput.push(newLinkingFaceBox);
    }
    let linkingVisible = ' hidden';
    if (state.linkingActive) {
      linkingVisible = '';
    }
    const linkingTextBoxesOutput = [];
    for (let lt = 0; lt < state.texts.length; lt += 1) {
      const linkingTextBox = state.texts[lt];
      const { boundingBox } = linkingTextBox;

      const textLeft = boundingBox[0];
      const textTop = boundingBox[1];
      const textWidth = boundingBox[2] - boundingBox[0];
      const textHeight = boundingBox[5] - boundingBox[1];
      // create css shape
      const boxStyle = {
        left: textLeft,
        top: textTop,
        width: textWidth,
        height: textHeight,
      };

      const activeLinkingTextbox =
        state.selectionText.indexOf(lt) > -1 ? ' active' : '';
      const newTextBox = (
        <div
          draggable="false"
          key={lt}
          className={`textbox${activeLinkingTextbox}`}
          onClick={() => selectText(lt)}
          style={boxStyle}
          onKeyDown={() => false}
          role="textbox"
          tabIndex={0}
          aria-label="link text"
        />
      );
      linkingTextBoxesOutput.push(newTextBox);
    }
    const linkingSelectionClass = state.linkingSelection ? ' active' : '';
    const linkingSelection = (
      <div
        style={state.linkinSelectionRect}
        className={`linking-selection${linkingSelectionClass}`}
      />
    );

    content = (
      <div
        className="classpiece-container"
        style={transform}
        id="classpiece-container"
        onContextMenu={handleContextMenu}
      >
        {linkingSelection}
        {state.file}
        <div className={`face-boxes-container${selectionsVisible}`}>
          {selectionsFaceBoxes}
        </div>
        <div className={`text-boxes-container${selectionsVisible}`}>
          {selectionsTextBoxes}
        </div>
        <div className={`linking-boxes-container${linkingVisible}`}>
          {linkingFaceBoxesOutput}
        </div>
        <div className={`linking-text-container${linkingVisible}`}>
          {linkingTextBoxesOutput}
        </div>
      </div>
    );
  }

  const firstNameActive =
    state.draggedElem === 'inputfirstname' ? ' active' : '';
  const middleNameActive =
    state.draggedElem === 'inputmiddlename' ? ' active' : '';
  const lastNameActive = state.draggedElem === 'inputlastname' ? ' active' : '';
  const dioceseActive = state.draggedElem === 'inputdiocese' ? ' active' : '';

  let selectedThumbnail = '';
  if (state.selectionFaces !== null) {
    const selectedFace = state.faces[state.selectionFaces];
    if (typeof selectedFace !== 'undefined') {
      if (typeof selectedFace.thumbnail !== 'undefined') {
        const { thumbnail } = selectedFace;
        selectedThumbnail = (
          <img
            className="selected-face-thumbnail img-responsive img-thumbnail"
            alt="thumbnail"
            src={thumbnail.path}
          />
        );
      }
    }
  }

  const thumbnailText = state.selectionText.map((textItem, i) => {
    const textChunk = state.texts[textItem].text;
    const key = `a${i}`;
    const textBox = (
      <div
        draggable="true"
        onDragStart={(e) => startDragText(e)}
        key={key}
        className="thumbnail-textbox"
      >
        {textChunk}
      </div>
    );
    return textBox;
  });

  const heading = 'Identify people';
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

  const errorModal = (
    <Modal
      isOpen={state.errorModalVisible}
      toggle={() => toggleErrorModal(!state.errorModalVisible, null)}
    >
      <ModalHeader toggle={() => toggleErrorModal(false, [])}>
        Error
      </ModalHeader>
      <ModalBody>{state.errorModalText}</ModalBody>
      <ModalFooter>
        <Button
          type="button"
          color="secondary"
          onClick={() => toggleErrorModal(false, [])}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );

  const honorificPrefixInputs = state.inputhonorificprefix.map((h, i) => {
    let honorificPrefixActive = '';
    if (
      state.draggedElem === 'inputhonorificprefix' &&
      parseInt(state.draggedIndex, 10) === i
    ) {
      honorificPrefixActive = 'active';
    }
    const key = `b${i}`;
    let item = (
      <InputGroup key={key}>
        <Input
          className={honorificPrefixActive}
          type="text"
          name="inputhonorificprefix"
          id="honorificPrefix"
          placeholder="Person honorific prefix..."
          data-target="inputhonorificprefix"
          data-index={i}
          value={state.inputhonorificprefix[i]}
          onDrop={(e) => dragStopText(e, i)}
          onDragEnter={dragEnterText}
          onDragOver={dragOverText}
          onDragLeave={dragLeaveText}
          onChange={(e) => handleMultipleChange(e, i)}
        />
        <InputGroupAddon addonType="append">
          <Button
            type="button"
            color="info"
            outline
            onClick={() => removeHP(i)}
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
          id="honorificPrefix"
          placeholder="Person honorific prefix..."
          value={state.inputhonorificprefix[i]}
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

  let organisationTypesOptions = [];
  let peopleRolesOptions = [];
  if (state.organisationTypes.length > 0) {
    organisationTypesOptions = state.organisationTypes.map((o, i) => {
      const key = `c${i}`;
      return (
        <option value={o.labelId} key={key}>
          {o.label}
        </option>
      );
    });
  }
  if (state.peopleRoles.length > 0) {
    peopleRolesOptions = state.peopleRoles.map((o, i) => {
      const key = `d${i}`;
      return (
        <option value={o.labelId} key={key}>
          {o.label}
        </option>
      );
    });
  }

  return (
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
          updateFaces={updateFaces}
          zoom={Number(state.zoom)}
          updateZoom={updateZoom}
          updateSettings={updateSettings}
          toggleSelections={toggleSelections}
          selectionsActive={state.selectionsActive}
          storeSelectionsBtn={state.storeSelectionsBtn}
          saveFacesThumbnails={saveFacesThumbnails}
          saveThumbnailsBtn={state.saveThumbnailsBtn}
          toggleLinking={toggleLinking}
          linkingActive={state.linkingActive}
          storeLinkingBtn={state.storeLinkingBtn}
          storeLinking={storeLinking}
        />
      </div>

      <Modal
        isOpen={state.saveSelectedModal}
        toggle={closeSelectedModal}
        size="lg"
      >
        <form onSubmit={updatePersonModal}>
          <ModalHeader toggle={closeSelectedModal}>Update person</ModalHeader>
          <ModalBody>
            <div className="row">
              <div className="col-xs-12 col-sm-6 col-md-4">
                <div className="selected-item-thumbnail">
                  {selectedThumbnail}
                </div>
                <div style={{ marginTop: '20px' }}>
                  <b>Preview</b>
                </div>
                <div className="preview-window" ref={itemPreview}>
                  {state.file}
                </div>
              </div>
              <div className="col-xs-12 col-sm-6 col-md-8">
                <div className="form-group">
                  <Label>Honorific Prefix</Label>
                  {honorificPrefixInputs}
                  <div className="text-right">
                    <Button
                      type="button"
                      color="info"
                      outline
                      size="xs"
                      onClick={() => addHP()}
                    >
                      Add new <i className="fa fa-plus" />
                    </Button>
                  </div>
                </div>
                <div className="form-group">
                  <Label>First Name</Label>
                  <input
                    className={`form-control ${firstNameActive}`}
                    onChange={handleChange}
                    value={state.inputfirstname}
                    data-target="inputfirstname"
                    onDrop={dragStopText.bind(this)}
                    onDragEnter={dragEnterText.bind(this)}
                    onDragOver={dragOverText.bind(this)}
                    onDragLeave={dragLeaveText.bind(this)}
                    type="text"
                    name="inputfirstname"
                  />
                </div>

                <div className="form-group">
                  <Label>Middle Name</Label>
                  <input
                    className={`form-control ${middleNameActive}`}
                    onChange={handleChange}
                    value={state.inputmiddlename}
                    data-target="inputmiddlename"
                    onDrop={dragStopText.bind(this)}
                    onDragEnter={dragEnterText.bind(this)}
                    onDragOver={dragOverText.bind(this)}
                    onDragLeave={dragLeaveText.bind(this)}
                    type="text"
                    name="inputmiddlename"
                  />
                </div>
                <div className="form-group">
                  <Label>Last Name</Label>
                  <input
                    className={`form-control ${lastNameActive}`}
                    onChange={handleChange}
                    value={state.inputlastname}
                    data-target="inputlastname"
                    onDrop={dragStopText.bind(this)}
                    onDragEnter={dragEnterText.bind(this)}
                    onDragOver={dragOverText.bind(this)}
                    onDragLeave={dragLeaveText.bind(this)}
                    type="text"
                    name="inputlastname"
                  />
                </div>
                <div className="form-group">
                  <Label>Diocese | Order</Label>
                  <input
                    className={`form-control ${dioceseActive}`}
                    onChange={handleChange}
                    value={state.inputdiocese}
                    data-target="inputdiocese"
                    onDrop={dragStopText.bind(this)}
                    onDragEnter={dragEnterText.bind(this)}
                    onDragOver={dragOverText.bind(this)}
                    onDragLeave={dragLeaveText.bind(this)}
                    type="text"
                    name="inputdiocese"
                  />
                  <select
                    style={{ marginTop: '5px' }}
                    className="form-control"
                    onChange={handleChange}
                    value={state.inputdioceseType}
                    name="inputdioceseType"
                  >
                    {organisationTypesOptions}
                  </select>
                </div>
                <div className="form-group">
                  <Label>Type</Label>
                  <select
                    name="inputtype"
                    className="form-control"
                    onChange={handleChange}
                    value={state.inputtype}
                  >
                    {peopleRolesOptions}
                  </select>
                </div>
                {thumbnailText}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit">
              {state.updatePersonBtn}
            </Button>
            <Button
              type="button"
              color="secondary"
              onClick={closeSelectedModal}
            >
              Cancel
            </Button>
          </ModalFooter>
        </form>
      </Modal>
      <ContextualMenu
        visible={state.contextualMenuVisible}
        position={state.contextualMenuPosition}
        targetFace={state.contextualMenuTargetFace}
        selectedNode={state.selectedNode}
        selectionsActive={state.selectionsActive}
        linkingActive={state.linkingActive}
        updateFaces={updateFaces}
        saveFacesThumbnails={saveFacesThumbnails}
        storeLinking={storeLinking}
        addNewSelection={addNewSelection}
        removeSelection={removeSelection}
      />
      {errorModal}
    </div>
  );
};

ParseClassPieceThumbnails.defaultProps = {
  match: {},
};

ParseClassPieceThumbnails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      fileName: PropTypes.string,
    }),
  }),
};

export default ParseClassPieceThumbnails;
