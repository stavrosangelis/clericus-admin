import React, { useState } from 'react';
import {
  Button,
  Card,
  CardTitle,
  CardBody,
  Collapse,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { putData } from '../../helpers';

const IngestDataBlock = (props) => {
  const { _id, ingestionStatus, reload } = props;

  const [ingestModalVisible, setIngestModalVisible] = useState(false);
  const [open, setOpen] = useState(true);

  const toggle = () => {
    setOpen(!open);
  };

  const toggleIngestModal = () => {
    setIngestModalVisible(!ingestModalVisible);
  };

  const ingestData = async () => {
    await putData(`import-plan-ingest`, { _id });
    reload();
    toggleIngestModal();
  };
  const ingestBtnVisible = ingestionStatus.status < 2 ? '' : 'hidden';
  const ingestModal = (
    <Modal isOpen={ingestModalVisible} toggle={toggleIngestModal}>
      <ModalHeader toggle={toggleIngestModal}>Ingest Data</ModalHeader>
      <ModalBody>
        <p>
          This will start the ingestion process. Depending on the ingestion plan
          and the data the ingestion process may take a long time (several
          hours). Please check back to this page to monitor the progress of the
          current ingestion job.
        </p>
        <p>
          To avoid creating duplicated entries this ingestion process can be
          executed only once.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button
          className="pull-left"
          size="sm"
          color="secondary"
          onClick={() => toggleIngestModal()}
        >
          Cancel
        </Button>
        <Button size="sm" color="success" onClick={() => ingestData()}>
          Continue <i className="fa fa-right-arrow" />
        </Button>
      </ModalFooter>
    </Modal>
  );

  const openBtnActive = open ? ' active' : '';

  let statusBlock = [];
  let statusLabel;
  switch (ingestionStatus.status) {
    case 0:
      statusLabel = 'Not started';
      break;
    case 1:
      statusLabel = 'Running';
      break;
    case 2:
      statusLabel = 'Completed';
      break;
    case 3:
      statusLabel = 'Failed';
      break;
    default:
      statusLabel = '';
      break;
  }
  const progress =
    ingestionStatus.status !== 1 ? (
      []
    ) : (
      <Progress value={ingestionStatus.progress} animated>
        {ingestionStatus.progress.toFixed(2)}%
      </Progress>
    );
  const statusMsg =
    ingestionStatus.msg !== '' ? <p>{ingestionStatus.msg}</p> : [];
  statusBlock = (
    <div className="ingestion-status-block">
      <h4>
        Ingestion status: <small>{statusLabel}</small>
      </h4>
      {progress}
      {statusMsg}
    </div>
  );
  return (
    <div>
      <Card>
        <CardBody>
          <CardTitle onClick={() => toggle()}>
            Ingest data
            <Button type="button" className="pull-right" size="xs" outline>
              <i
                className={`collapse-toggle fa fa-angle-left${openBtnActive}`}
              />
            </Button>
          </CardTitle>
          <Collapse isOpen={open}>
            <div style={{ marginBottom: '15px' }}>
              <Link
                to={`/import-plan-results-preview/${_id}`}
                className="btn btn-primary btn-sm"
              >
                Preview results <i className="fa fa-eye" />
              </Link>
            </div>
            <div>
              <Button
                className={ingestBtnVisible}
                color="success"
                size="sm"
                onClick={() => toggleIngestModal()}
              >
                Ingest data <i className="fa fa-arrow-right" />
              </Button>
            </div>
            <div>{statusBlock}</div>
          </Collapse>
        </CardBody>
      </Card>
      {ingestModal}
    </div>
  );
};

IngestDataBlock.propTypes = {
  _id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  ingestionStatus: PropTypes.exact({
    _id: PropTypes.string,
    msg: PropTypes.string,
    progress: PropTypes.number,
    started: PropTypes.string,
    status: PropTypes.number,
  }).isRequired,
  reload: PropTypes.func.isRequired,
};
export default IngestDataBlock;
