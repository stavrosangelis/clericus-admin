import React, { lazy, Suspense, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';

import {
  getResourceThumbnailURL,
  getResourceFullsizeURL,
  myHistory,
} from '../../helpers';

const Viewer = lazy(() => import('../Image.viewer'));
const UploadFile = lazy(() => import('../Upload.file'));

export default function ResourceThumbnail(props) {
  const { resource, reload } = props;
  const { _id: _idParams } = useParams();

  const [viewerVisible, setViewerVisible] = useState(false);
  const [updateFileModalVisible, setUpdateFileModalVisible] = useState(false);

  let outputThumbnail = null;
  let outputBtns = null;

  const uploadResponse = (responseData) => {
    const { status = false, data = null } = responseData;
    if (status) {
      if (_idParams === 'new' && data !== null && data._id !== null) {
        myHistory.replace(`/resource/${data._id}`);
      } else if (
        resource !== null &&
        typeof resource._id !== 'undefined' &&
        resource._id !== ''
      ) {
        setUpdateFileModalVisible(false);
        reload();
      }
    }
  };

  if (resource !== null) {
    const {
      description = '',
      _id = '',
      label = '',
      resourceType = '',
      systemType = '',
    } = resource;

    const toggleUpdateFileModal = () => {
      setUpdateFileModalVisible(!updateFileModalVisible);
    };

    const modal = (
      <Modal
        isOpen={updateFileModalVisible}
        toggle={() => toggleUpdateFileModal()}
      >
        <ModalHeader toggle={() => toggleUpdateFileModal()}>
          Update file
        </ModalHeader>
        <ModalBody>
          <div
            style={{
              position: 'relative',
              display: 'block',
              margin: '0 auto',
            }}
          >
            <UploadFile
              _id={_id}
              systemType={systemType}
              uploadResponse={uploadResponse}
              label={label}
              description={description}
            />
          </div>
        </ModalBody>
        <ModalFooter className="text-end">
          <Button color="secondary" onClick={() => toggleUpdateFileModal()}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
    if (resourceType === 'image') {
      const thumbnailPath = getResourceThumbnailURL(resource);

      let viewer = null;
      let viewerThumb = null;
      let annotateButton = null;

      if (thumbnailPath !== null) {
        const fullsizePath = getResourceFullsizeURL(resource);

        const toggleViewer = () => {
          setViewerVisible(!viewerVisible);
        };

        viewer = (
          <Suspense fallback={null}>
            <Viewer
              visible={viewerVisible}
              path={fullsizePath}
              label={label}
              toggle={toggleViewer}
            />
          </Suspense>
        );
        viewerThumb = (
          <div
            onClick={() => toggleViewer()}
            key="thumbnail"
            className="open-lightbox"
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="toggle image viewer"
          >
            <img
              src={thumbnailPath}
              alt={label}
              className="img-fluid img-thumbnail"
            />
          </div>
        );
        annotateButton = (
          <Link
            to={`/resource-annotate/${_id}`}
            className="btn btn-info btn-sm"
          >
            <i className="fa fa-pencil" /> Annotate
          </Link>
        );
      }
      outputThumbnail = (
        <>
          {viewerThumb}
          {modal}
          {viewer}
        </>
      );
      outputBtns = (
        <div className="flex justify-content-between m-top-10">
          <Button
            color="info"
            size="sm"
            onClick={() => toggleUpdateFileModal()}
          >
            <i className="fa fa-refresh" /> Update file
          </Button>
          {annotateButton}
        </div>
      );
    } else if (resourceType === 'document') {
      const fullsizePath = getResourceFullsizeURL(resource);
      let previewBtn = null;
      let thumbPreview = null;
      if (fullsizePath !== null) {
        thumbPreview = (
          <a
            target="_blank"
            href={fullsizePath}
            className="pdf-thumbnail"
            rel="noopener noreferrer"
          >
            <i className="fa fa-file-pdf-o" />
          </a>
        );
        previewBtn = (
          <a
            key="link-label"
            target="_blank"
            href={fullsizePath}
            className="btn btn-info btn-sm"
            rel="noopener noreferrer"
          >
            Preview file
          </a>
        );
      }
      outputThumbnail = (
        <>
          {thumbPreview}
          {modal}
        </>
      );

      outputBtns = (
        <div className="flex justify-content-between m-top-10">
          <Button color="info" size="sm" onClick={toggleUpdateFileModal}>
            <i className="fa fa-refresh" /> Update file
          </Button>
          {previewBtn}
        </div>
      );
    } else {
      outputThumbnail = (
        <Suspense fallback={null}>
          <UploadFile
            _id={_id}
            systemType={systemType}
            uploadResponse={uploadResponse}
            label={label}
            description={description}
          />
        </Suspense>
      );
    }
  } else {
    outputThumbnail = (
      <Suspense fallback={null}>
        <UploadFile
          _id={null}
          systemType=""
          uploadResponse={uploadResponse}
          label=""
          description=""
        />
      </Suspense>
    );
  }

  return (
    <>
      {outputThumbnail}
      {outputBtns}
    </>
  );
}

ResourceThumbnail.defaultProps = {
  resource: null,
};
ResourceThumbnail.propTypes = {
  resource: PropTypes.object,
  reload: PropTypes.func.isRequired,
};
