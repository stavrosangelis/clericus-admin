import React, { lazy, Suspense, useState, useEffect } from 'react';
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

const AlternateLabels = lazy(() => import('./Alternate.labels'));

const { REACT_APP_APIPATH: APIPath } = process.env;

export default function ViewResource(props) {
  // props
  const { delete: deleteFn, resource } = props;

  const { resourcesTypes } = useSelector((state) => state);

  const navigate = useNavigate();

  const defaultSystemType =
    resourcesTypes.length > 0 && typeof resourcesTypes[0]._id !== 'undefined'
      ? resourcesTypes[0]._id
      : 'undefined';

  const [detailsOpen, setDetailsOpen] = useState(true);
  const [item, setItem] = useState({
    label: '',
    systemType: defaultSystemType,
    description: '',
    originalLocation: '',
    status: 'private',
    alternateLabels: [],
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
    if (resource !== null) {
      const {
        _id,
        label: rLabel = '',
        systemType: rSystemType = defaultSystemType,
        description: rDescription = '',
        originalLocation: rOriginalLocation = '',
        status: rStatus = 'private',
        alternateLabels: rAlternateLabels = [],
      } = resource;
      const itemData = {
        _id,
        label: rLabel,
        systemType: rSystemType,
        description: rDescription || '',
        originalLocation: rOriginalLocation,
        status: rStatus,
        alternateLabels: rAlternateLabels,
      };
      setItem(itemData);
    }
  }, [resource, defaultSystemType]);

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
      const resourceData = { ...resource };
      resourceData.label = item.label;
      resourceData.systemType = item.systemType;
      resourceData.description = item.description;
      resourceData.originalLocation = item.originalLocation;
      resourceData.status = item.status;
      resourceData.alternateLabels = item.alternateLabels;
      const postData = { resource: resourceData };
      const responseData = await axios({
        method: 'put',
        url: `${APIPath}resource`,
        crossDomain: true,
        data: postData,
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
        if (resource === null) {
          navigate(`/resource/${rData.data._id}`);
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
      if (resource !== null) {
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

  const updateAlternateLabel = (index = null, data = null) => {
    if (data !== null) {
      const { alternateLabels } = resource;
      if (index === 'new') {
        alternateLabels.push(data);
      } else if (index !== null) {
        alternateLabels[index] = data;
      }
      update();
    }
  };

  const removeAlternateLabel = (index = null) => {
    if (index !== null) {
      const { alternateLabels } = resource;
      if (index !== null) {
        alternateLabels.splice(index, 1);
      }
      update();
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
    systemType = defaultSystemType,
    description = '',
    originalLocation = '',
    status = 'private',
    alternateLabels = [],
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

  const alternateLabelsBlock =
    resource !== null ? (
      <div className="alternate-appelations">
        <div className="label">Alternate labels</div>
        <Suspense fallback={[]}>
          <AlternateLabels
            data={alternateLabels}
            update={updateAlternateLabel}
            remove={removeAlternateLabel}
          />
        </Suspense>
      </div>
    ) : null;

  const resourcesTypesOptions = resourcesTypes.map((st) => (
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
                placeholder="Resource label..."
                value={label}
                onChange={handleChange}
              />
            </FormGroup>
            {alternateLabelsBlock}
            <FormGroup>
              <Label>Type</Label>
              <Input
                type="select"
                name="systemType"
                onChange={handleChange}
                value={systemType}
              >
                {resourcesTypesOptions}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input
                type="textarea"
                name="description"
                placeholder="Resource description..."
                value={description}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Original location</Label>
              <Input
                type="textarea"
                name="originalLocation"
                placeholder="A URI pointing to the original location of the resource"
                value={originalLocation}
                onChange={handleChange}
              />
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

ViewResource.defaultProps = {
  resource: null,
};
ViewResource.propTypes = {
  delete: PropTypes.func.isRequired,
  resource: PropTypes.object,
};
