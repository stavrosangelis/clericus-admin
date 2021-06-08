import React, { useCallback, useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import {
  Spinner,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { Link, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../components/breadcrumbs';

const APIPath = process.env.REACT_APP_APIPATH;

const ParseClassPiece = (props) => {
  // props
  const { match } = props;
  const fileName = match.params?.fileName || '';
  const [loading, setLoading] = useState(true);
  // state
  const defaultState = {
    loading: true,
    file: [],
    analyzeBtnText: <span>Analyze image</span>,
    analyzeBtnStatus: true,
    analyzeStatus: false,
    analyzeStep: 0,
    analyzingText: [],
    createThumbnailsBtnText: <span>Identify people</span>,
    createThumbnailsBtnStatus: false,
    identifyStep: 0,
    importDataBtnText: <span>Import data to database</span>,
    importDataBtnStatus: false,
    importDataStep: 0,
    faceBoxes: [],
    textBoxes: [],
    zoomSliderValue: 100,
    confirmModal: false,
    confirmModalTitle: '',
    confirmModalContent: [],
    confirmModalAction: () => {},
    confirmModalBtn: [],
    redirect: false,
  };
  const [state, setState] = useReducer(
    (exState, newState) => ({ ...exState, ...newState }),
    defaultState
  );

  const confirmModalToggle = useCallback(() => {
    setState({
      confirmModal: !state.confirmModal,
    });
  }, [state.confirmModal]);

  const loadFaces = useCallback(async () => {
    const facesFile = state.file.faces;
    const responseData = await axios({
      method: 'get',
      url: facesFile,
      crossDomain: true,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });

    let thumbnailCount = 0;
    let dataCount = 0;
    for (let i = 0; i < responseData.length; i += 1) {
      const face = responseData[i];
      if (typeof face.thumbnail !== 'undefined') {
        thumbnailCount += 1;
      }
      if (typeof face.firstName !== 'undefined') {
        dataCount += 1;
      }
    }
    if (
      responseData.length === thumbnailCount &&
      responseData.length === dataCount
    ) {
      setState({
        createThumbnailsBtnText: <span>Re-identify people</span>,
        identifyStep: 1,
      });
    }
  }, [state]);

  const loadFile = useCallback(async () => {
    const loadData = await axios({
      method: 'get',
      url: `${APIPath}list-class-piece?file=${fileName}`,
      crossDomain: true,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    const file = loadData[0];
    let analyzeBtnText = <span>Analyze image</span>;
    let createThumbnailsBtnStatus = false;
    let importDataBtnStatus = false;
    let analyzeStep = 0;
    if (file.faces !== null && file.text === null) {
      setState({
        analyzingText: (
          <div>
            <i>Processing image...</i> <Spinner size="sm" color="secondary" />
          </div>
        ),
      });
      setTimeout(() => {
        loadFile();
      }, 5000);
      return false;
    }
    setState({
      analyzingText: [],
    });
    if (file.faces !== null) {
      analyzeBtnText = <span>Re-analyze image</span>;
      createThumbnailsBtnStatus = true;
      analyzeStep = 1;
    }
    if (file.facesThumbnails && file.text !== null) {
      importDataBtnStatus = true;
    }
    setState({
      file,
      loading: false,
      analyzeBtnText,
      analyzeStep,
      createThumbnailsBtnStatus,
      importDataBtnStatus,
    });
    loadFaces();
    return false;
  }, [loadFaces, fileName]);

  useEffect(() => {
    if (loading) {
      setLoading(false);
      loadFile();
    }
  }, [loading, props, loadFile, loadFaces]);

  useEffect(() => {
    if (state.redirect) {
      setState({ redirect: false });
    }
  }, [state.redirect]);

  const analyzeFile = async () => {
    if (state.analyzeStatus) {
      return false;
    }
    // confirm re-analysis
    if (state.analyzeStep === 1 && !state.confirmModal) {
      setState({
        confirmModal: true,
        confirmModalTitle: 'Confirm image re-analysis',
        confirmModalContent: (
          <p>
            This classpiece will be submitted to microsoft&apos;s computer
            vision api to be analyzed again.
            <br /> Continue?
          </p>
        ),
        confirmModalAction: analyzeFile,
        confirmModalBtn: <span>Re-analyze image</span>,
      });
      return false;
    }
    setState({
      analyzeBtnText: (
        <span>
          Analyzing image... <Spinner size="sm" color="secondary" />
        </span>
      ),
      analyzeStatus: true,
    });
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}parse-class-piece?file=${fileName}`,
      crossDomain: true,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    const file = responseData[0];
    setState({
      analyzeBtnText: <span>Analysis complete</span>,
      file,
      loading: false,
    });
    loadFile();
    setTimeout(() => {
      setState({
        analyzeBtnText: <span>Analyze image</span>,
      });
    }, 2000);
    return false;
  };

  const redirectToIdentify = () => {
    setState({
      redirect: true,
    });
  };

  const confirmReidentify = () => {
    // confirm re-identification
    if (state.identifyStep === 1 && !state.confirmModal) {
      setState({
        confirmModal: true,
        confirmModalTitle: 'Confirm people re-identification',
        confirmModalContent: (
          <p>
            You are about to edit the people identified in this class piece.
            <br /> Continue?
          </p>
        ),
        confirmModalAction: redirectToIdentify,
        confirmModalBtn: <span>Re-identify people</span>,
      });
      return false;
    }
    return false;
  };

  let redirectElem = [];
  if (state.redirect) {
    const redirectPath = `/parse-class-piece-thumbnails/${fileName}`;
    redirectElem = (
      <Redirect
        to={{
          pathname: redirectPath,
          state: { from: props.location },
        }}
      />
    );
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

  if (!state.loading) {
    const thumbnail = (
      <img
        src={state.file.thumbnail}
        alt={state.file.name}
        className="img-thumbnail img-responsive"
      />
    );
    const analyzeBtn = state.analyzeBtnStatus ? (
      <div>
        <Button outline color="secondary" onClick={analyzeFile}>
          {state.analyzeBtnText}
        </Button>
      </div>
    ) : (
      []
    );
    let createThumbnailsBtn = [];
    if (state.createThumbnailsBtnStatus) {
      if (state.identifyStep === 0) {
        createThumbnailsBtn = (
          <div>
            <Link
              className="btn btn-outline-secondary"
              href={`/parse-class-piece-thumbnails/${fileName}`}
              to={`/parse-class-piece-thumbnails/${fileName}`}
            >
              {state.createThumbnailsBtnText}
            </Link>
          </div>
        );
      }
      if (state.identifyStep === 1) {
        createThumbnailsBtn = (
          <div>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={confirmReidentify}
            >
              {state.createThumbnailsBtnText}
            </button>
          </div>
        );
      }
    }
    const importDataBtn = state.importDataBtnStatus ? (
      <div>
        <Link
          className="btn btn-outline-secondary"
          href={`/import-class-piece-to-db/${fileName}`}
          to={`/import-class-piece-to-db/${fileName}`}
        >
          {state.importDataBtnText}
        </Link>
      </div>
    ) : (
      []
    );

    content = (
      <div className="row">
        <div className="col-xs-12 col-sm-6 col-md-4">{thumbnail}</div>
        <div className="col-xs-12 col-sm-6 col-md-8">
          <div className="classpiece-actions">
            {analyzeBtn}
            {state.analyzingText}
            {createThumbnailsBtn}
            {importDataBtn}
          </div>
        </div>
      </div>
    );
  }

  const heading = `Class Piece "${fileName}"`;
  const breadcrumbsItems = [
    {
      label: 'Parse Class Pieces',
      icon: 'pe-7s-tools',
      active: false,
      path: '/parse-class-pieces',
    },
    { label: heading, icon: '', active: true, path: '' },
  ];
  return (
    <div>
      <Breadcrumbs items={breadcrumbsItems} />
      <div className="row">
        <div className="col-12">
          <h2>{heading}</h2>
        </div>
      </div>
      {redirectElem}
      {content}
      <Modal isOpen={state.confirmModal} toggle={confirmModalToggle}>
        <ModalHeader toggle={confirmModalToggle}>
          {state.confirmModalTitle}
        </ModalHeader>
        <ModalBody>{state.confirmModalContent}</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={state.confirmModalAction}>
            {state.confirmModalBtn}
          </Button>{' '}
          <Button color="secondary" onClick={confirmModalToggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

ParseClassPiece.defaultProps = {
  location: {},
  match: {},
};

ParseClassPiece.propTypes = {
  location: PropTypes.object,
  match: PropTypes.shape({
    params: PropTypes.shape({
      fileName: PropTypes.string,
    }),
  }),
};

export default ParseClassPiece;
