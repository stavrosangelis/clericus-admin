import React, { useEffect, useState } from 'react';
import { Collapse, Button, Card, CardTitle, CardBody } from 'reactstrap';
import PropTypes from 'prop-types';
import UploadFile from './Upload.file';
import DeleteModal from '../Delete.modal';
import '../../assets/scss/upload.file.scss';

const { REACT_APP_APIPATH: APIPath } = process.env;

function Fileblock(props) {
  // props
  const { item, update } = props;

  // state
  const [uploadOpen, setUploadOpen] = useState(true);
  const [deleteFileModalVisible, setDeleteFileModalVisible] = useState(false);

  const toggleUpload = (val = null) => {
    const newVal = val !== null ? val : !uploadOpen;
    setUploadOpen(newVal);
  };
  const toggleDeleteFile = () => {
    setDeleteFileModalVisible(!deleteFileModalVisible);
  };

  useEffect(() => {
    if (
      item !== null &&
      typeof item.uploadedFile !== 'undefined' &&
      item.uploadedFile !== null
    ) {
      setUploadOpen(false);
    }
  }, [item]);

  const uploadBtnActive = uploadOpen ? ' active' : '';
  const uploadFileBlock =
    item !== null ? <UploadFile _id={item._id} update={update} /> : [];

  let fileBlock = [];
  if (
    item !== null &&
    typeof item.uploadedFile !== 'undefined' &&
    item.uploadedFile !== null
  ) {
    const { paths } = item.uploadedFileDetails;
    const { path } = JSON.parse(paths[0]) || '';
    const dPath = `${APIPath}import-plan-file-download/${item._id}`;
    const fileLink =
      path !== '' ? (
        <a href={dPath} download className="import-file-link">
          <i className="fa fa-file-excel-o" />
          <b>{item.uploadedFileDetails.filename}</b>
        </a>
      ) : (
        <span>
          <i className="fa fa-file-excel-o" />
          <b>{item.uploadedFileDetails.filename}</b>
        </span>
      );
    fileBlock = (
      <Card>
        <CardBody>
          <CardTitle>File details</CardTitle>
          <Button
            size="xs"
            color="danger"
            className="pull-right"
            onClick={() => toggleDeleteFile()}
          >
            <i className="fa fa-times" />
          </Button>
          {fileLink}
        </CardBody>
        <DeleteModal
          label={item.uploadedFileDetails.filename}
          path="import-file-delete"
          params={{ _id: item._id }}
          visible={deleteFileModalVisible}
          toggle={toggleDeleteFile}
          update={update}
        />
      </Card>
    );
  }
  return (
    <div>
      {fileBlock}
      <Card>
        <CardBody>
          <CardTitle onClick={() => toggleUpload()}>
            Upload new file
            <Button type="button" className="pull-right" size="xs" outline>
              <i
                className={`collapse-toggle fa fa-angle-left${uploadBtnActive}`}
              />
            </Button>
          </CardTitle>

          <Collapse isOpen={uploadOpen}>{uploadFileBlock}</Collapse>
        </CardBody>
      </Card>
    </div>
  );
}

Fileblock.defaultProps = {
  item: null,
  update: null,
};
Fileblock.propTypes = {
  item: PropTypes.object,
  update: PropTypes.func,
};
export default Fileblock;
