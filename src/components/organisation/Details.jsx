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

export default function ViewOrganisation(props) {
  // props
  const { delete: deleteFn, item: organisation } = props;

  const { organisationTypes } = useSelector((state) => state);

  const navigate = useNavigate();

  const defaultType =
    organisationTypes.length > 0 &&
    typeof organisationTypes[0].labelId !== 'undefined'
      ? organisationTypes[0].labelId
      : 'undefined';

  const [detailsOpen, setDetailsOpen] = useState(true);
  const [item, setItem] = useState({
    label: '',
    alternateAppelations: [],
    description: '',
    organisationType: defaultType,
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
    if (organisation !== null) {
      const {
        _id,
        label: oLabel = '',
        alternateAppelations: oAlternateAppelations = [],
        description: oDescription = '',
        organisationType: oOrganisationType = defaultType,
        status: rStatus = 'private',
      } = organisation;
      const itemData = {
        _id,
        label: oLabel,
        alternateAppelations: oAlternateAppelations,
        description: oDescription || '',
        organisationType: oOrganisationType,
        status: rStatus,
      };
      setItem(itemData);
    }
  }, [organisation, defaultType]);

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
      const itemData = { ...organisation };
      itemData.label = item.label;
      itemData.alternateAppelations = item.alternateAppelations;
      itemData.description = item.description;
      itemData.organisationType = item.organisationType;
      itemData.status = item.status;
      const responseData = await axios({
        method: 'put',
        url: `${APIPath}organisation`,
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
        if (organisation === null) {
          navigate(`/organisation/${rData.data._id}`);
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
      if (organisation !== null) {
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
      const { alternateAppelations } = organisation;
      if (index === 'new') {
        alternateAppelations.push(data);
      } else if (index !== null) {
        alternateAppelations[index] = data;
      }
      update();
    }
  };

  const removeAlternateLabel = (index = null) => {
    if (index !== null) {
      const { alternateAppelations } = organisation;
      if (index !== null) {
        alternateAppelations.splice(index, 1);
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
    alternateAppelations = [],
    description = '',
    organisationType = defaultType,
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

  const alternateLabelsBlock =
    organisation !== null ? (
      <div className="alternate-appelations">
        <div className="label">Alternate labels</div>
        <Suspense fallback={[]}>
          <AlternateLabels
            data={alternateAppelations}
            update={updateAlternateLabel}
            remove={removeAlternateLabel}
          />
        </Suspense>
      </div>
    ) : null;

  const organisationTypesOptions = organisationTypes.map((st) => (
    <option value={st.labelId} key={st.labelId}>
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
                placeholder="Organisation label..."
                value={label}
                onChange={handleChange}
              />
            </FormGroup>
            {alternateLabelsBlock}
            <FormGroup>
              <Label>Description</Label>
              <Input
                type="textarea"
                name="description"
                placeholder="Organisation description..."
                value={description}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Type</Label>
              <Input
                type="select"
                name="organisationType"
                onChange={handleChange}
                value={organisationType}
              >
                {organisationTypesOptions}
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

ViewOrganisation.defaultProps = {
  item: null,
};
ViewOrganisation.propTypes = {
  delete: PropTypes.func.isRequired,
  item: PropTypes.object,
};
