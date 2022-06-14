import React, { useState, useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  Card,
  CardTitle,
  CardBody,
  Collapse,
  Form,
  FormGroup,
  Input,
  Label,
  Spinner,
} from 'reactstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const { REACT_APP_APIPATH: APIPath } = process.env;

export default function ViewEvent(props) {
  // props
  const { delete: deleteFn, item: event } = props;

  const { eventTypes } = useSelector((state) => state);

  const navigate = useNavigate();

  const defaultType =
    eventTypes.length > 0 && typeof eventTypes[0]._id !== 'undefined'
      ? eventTypes[0]._id
      : 'undefined';

  const [detailsOpen, setDetailsOpen] = useState(true);
  const [item, setItem] = useState({
    label: '',
    description: '',
    eventType: defaultType,
    status: 'private',
  });
  const [updating, setUpdating] = useState(false);
  const [updateBtnText, setUpdateBtnText] = useState(
    <span>
      <i className="fa fa-save" /> Update
    </span>
  );
  const [updateError, setUpdateError] = useState({
    text: [],
    visible: false,
  });

  useEffect(() => {
    if (event !== null) {
      const {
        _id,
        label: eLabel = '',
        description: eDescription = '',
        eventType: eEventType = defaultType,
        status: eStatus = 'private',
      } = event;
      const itemData = {
        _id,
        label: eLabel,
        description: eDescription || '',
        eventType: eEventType,
        status: eStatus,
      };
      setItem(itemData);
    }
  }, [event, defaultType]);

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const copy = { ...item };
    copy[name] = value;
    setItem(copy);
  };

  const updateStatus = (value = 'private') => {
    const copy = { ...item };
    copy.status = value;
    setItem(copy);
  };

  const toggleDetails = () => {
    setDetailsOpen(!detailsOpen);
  };

  const update = async () => {
    if (!updating) {
      setUpdating(true);
      setUpdateBtnText(
        <span>
          <i className="fa fa-save" /> <i>Saving...</i>{' '}
          <Spinner color="info" size="sm" />
        </span>
      );
      const itemData = { ...event };
      itemData.label = item.label;
      itemData.description = item.description;
      itemData.eventType = item.eventType;
      itemData.status = item.status;
      const responseData = await axios({
        method: 'put',
        url: `${APIPath}event`,
        crossDomain: true,
        data: itemData,
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.data)
        .catch((error) => {
          console.log(error);
        });
      const { data: rData = null } = responseData;
      const { errors = [], msg = '', status = false } = rData;
      if (status) {
        setUpdating(false);
        setUpdateBtnText(
          <span>
            <i className="fa fa-save" /> Update success{' '}
            <i className="fa fa-check" />
          </span>
        );
        setUpdateError({
          text: [],
          visible: false,
        });
        if (event === null) {
          navigate(`/event/${rData.data._id}`);
        }
      } else {
        const errorArr = [];
        errorArr.push(<div key="main">{msg}</div>);
        const { length } = errors;
        for (let i = 0; i < length; i += 1) {
          const error = errors[i];
          const { field = '', msg: emsg = '' } = error;
          const output = (
            <div key={i}>
              [{field}]: {emsg}
            </div>
          );
          errorArr.push(output);
        }
        setUpdating(false);
        setUpdateBtnText(
          <span>
            <i className="fa fa-save" /> Update error{' '}
            <i className="fa fa-times" />
          </span>
        );
        setUpdateError({
          text: errorArr,
          visible: true,
        });
      }
      if (event !== null) {
        setTimeout(() => {
          setUpdateBtnText(
            <span>
              <i className="fa fa-save" /> Update
            </span>
          );
        }, 2000);
      }
    }
  };

  const formSubmit = (e) => {
    e.preventDefault();
    update();
  };

  const detailsOpenActive = detailsOpen ? ' active' : '';

  const { text: errorText, visible: errorVisible } = updateError;
  const errorContainerClass = errorVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );

  const {
    label = '',
    description = '',
    eventType = defaultType,
    status = 'private',
  } = item;

  let statusPublic = 'secondary';
  const statusPrivate = 'secondary';
  let publicOutline = true;
  let privateOutline = false;
  if (status === 'public') {
    statusPublic = 'success';
    publicOutline = false;
    privateOutline = true;
  }

  const eventTypesOptions = eventTypes.map((st) => (
    <option value={st._id} key={st._id}>
      {st.label}
    </option>
  ));

  const deleteBtn = (
    <Button
      color="danger"
      onClick={() => deleteFn()}
      outline
      type="button"
      size="sm"
      className="pull-left"
    >
      <i className="fa fa-trash-o" /> Delete
    </Button>
  );
  const updateBtn = (
    <Button color="primary" outline type="submit" size="sm">
      {updateBtnText}
    </Button>
  );

  return (
    <Card>
      <CardBody>
        <CardTitle onClick={toggleDetails}>
          Details{' '}
          <Button
            type="button"
            className="pull-right"
            color="secondary"
            outline
            size="xs"
          >
            <i
              className={`collapse-toggle fa fa-angle-left${detailsOpenActive}`}
            />
          </Button>
        </CardTitle>
        {errorContainer}
        <Collapse isOpen={detailsOpen}>
          <Form onSubmit={formSubmit}>
            <div className="text-end">
              <ButtonGroup>
                <Button
                  size="sm"
                  outline={publicOutline}
                  color={statusPublic}
                  onClick={() => updateStatus('public')}
                >
                  Public
                </Button>
                <Button
                  size="sm"
                  outline={privateOutline}
                  color={statusPrivate}
                  onClick={() => updateStatus('private')}
                >
                  Private
                </Button>
              </ButtonGroup>
            </div>
            <FormGroup>
              <Label>Label</Label>
              <Input
                type="text"
                name="label"
                placeholder="Event label..."
                value={label}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input
                type="textarea"
                name="description"
                placeholder="Event description..."
                value={description}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Type</Label>
              <Input
                type="select"
                name="eventType"
                onChange={handleChange}
                value={eventType}
              >
                {eventTypesOptions}
              </Input>
            </FormGroup>
            <div className="flex justify-content-between">
              {deleteBtn}
              {updateBtn}
            </div>
          </Form>
        </Collapse>
      </CardBody>
    </Card>
  );
}

ViewEvent.defaultProps = {
  item: null,
};
ViewEvent.propTypes = {
  delete: PropTypes.func.isRequired,
  item: PropTypes.object,
};
