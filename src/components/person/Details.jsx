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
  InputGroup,
  Label,
  Spinner,
} from 'reactstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const AlternateAppellations = lazy(() => import('./Alternate.appellations'));

const { REACT_APP_APIPATH: APIPath } = process.env;

export default function ViewPerson(props) {
  // props
  const { delete: deleteFn, item: person } = props;

  const { personTypes } = useSelector((state) => state);

  const navigate = useNavigate();

  const [detailsOpen, setDetailsOpen] = useState(true);
  const [item, setItem] = useState({
    description: '',
    firstName: '',
    honorificPrefix: [],
    lastName: '',
    middleName: '',
    personType: 'Clergy',
    status: 'private',
    alternateAppelations: [],
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
    if (person !== null) {
      const {
        _id,
        alternateAppelations = [],
        descriptionVal = '',
        firstName = '',
        honorificPrefix = '',
        lastName = '',
        middleName = '',
        personType = 'Clergy',
        status = 'private',
      } = person;
      const description = descriptionVal !== null ? descriptionVal : '';
      const itemData = {
        _id,
        alternateAppelations,
        description,
        firstName,
        honorificPrefix,
        lastName,
        middleName,
        personType,
        status,
      };
      setItem(itemData);
    }
  }, [person]);

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const copy = { ...item };
    copy[name] = value;
    setItem(copy);
  };

  const handleMultipleChange = (e, i) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const copy = { ...item };
    copy[name][i] = value;
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
      const itemData = { ...person };
      itemData.description = item.description;
      itemData.firstName = item.firstName;
      itemData.honorificPrefix = item.honorificPrefix;
      itemData.lastName = item.lastName;
      itemData.middleName = item.middleName;
      itemData.personType = item.personType;
      itemData.status = item.status;
      itemData.alternateAppelations = item.alternateAppelations;
      const responseData = await axios({
        method: 'put',
        url: `${APIPath}person`,
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
      const { data: pData = null } = responseData;
      const { errors = [], msg = '', status = false } = pData;
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
        if (person === null) {
          navigate(`/person/${pData._id}`);
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
      if (person !== null) {
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

  const updateAlternateAppellation = (index = null, data = null) => {
    if (data !== null) {
      const { alternateAppelations } = item;
      if (index === 'new') {
        alternateAppelations.push(data);
      } else if (index !== null) {
        alternateAppelations[index] = data;
      }
      update();
    }
  };

  const removeAlternateAppellation = (index = null) => {
    if (index !== null) {
      const { alternateAppelations } = item;
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

  const addHP = () => {
    const copy = { ...item };
    const { honorificPrefix = [] } = copy;
    honorificPrefix.push('');
    copy.honorificPrefix = honorificPrefix;
    setItem(copy);
  };

  const removeHP = (i) => {
    const copy = { ...item };
    const { honorificPrefix = [] } = copy;
    honorificPrefix.splice(i, 1);
    copy.honorificPrefix = honorificPrefix;
    setItem(copy);
  };

  const detailsOpenActive = detailsOpen ? ' active' : '';

  const { text: errorText, visible: errorVisible } = updateError;
  const errorContainerClass = errorVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );

  const {
    alternateAppelations = [],
    description = '',
    firstName = '',
    honorificPrefix = [],
    lastName = '',
    middleName = '',
    personType = 'Clergy',
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

  const alternateAppellationsBlock =
    item !== null ? (
      <div className="alternate-appelations">
        <div className="label">Alternate appelations</div>
        <Suspense fallback={[]}>
          <AlternateAppellations
            data={alternateAppelations}
            update={updateAlternateAppellation}
            remove={removeAlternateAppellation}
          />
        </Suspense>
      </div>
    ) : null;

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

  const selectPersonTypes = personTypes?.map((p) => {
    const { label: tLabel = '' } = p;
    return (
      <option key={tLabel} value={tLabel}>
        {tLabel}
      </option>
    );
  });

  const honorificPrefixInputs =
    typeof honorificPrefix !== 'string'
      ? honorificPrefix.map((h, i) => {
          const key = `a${i}`;
          const hpItem =
            i === 0 ? (
              <Input
                style={{ marginBottom: '5px' }}
                key={key}
                type="text"
                name="honorificPrefix"
                placeholder="Person honorific prefix..."
                value={honorificPrefix[i]}
                onChange={(e) => handleMultipleChange(e, i)}
              />
            ) : (
              <InputGroup key={key} style={{ marginBottom: '5px' }}>
                <Input
                  type="text"
                  name="honorificPrefix"
                  placeholder="Person honorific prefix..."
                  value={honorificPrefix[i]}
                  onChange={(e) => handleMultipleChange(e, i)}
                />
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
              </InputGroup>
            );
          return hpItem;
        })
      : null;

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
              <Label>Honorific Prefix</Label>
              {honorificPrefixInputs}
              <div className="text-end">
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
            </FormGroup>
            <FormGroup>
              <Label>First name</Label>
              <Input
                type="text"
                name="firstName"
                placeholder="Person first name..."
                value={firstName}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Middle name</Label>
              <Input
                type="text"
                name="middleName"
                placeholder="Person middle name..."
                value={middleName}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Last name</Label>
              <Input
                type="text"
                name="lastName"
                placeholder="Person last name..."
                value={lastName}
                onChange={handleChange}
              />
            </FormGroup>
            {alternateAppellationsBlock}
            <FormGroup>
              <Label>Description</Label>
              <Input
                type="textarea"
                name="description"
                placeholder="Person description..."
                value={description}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Type</Label>
              <Input
                type="select"
                name="personType"
                onChange={handleChange}
                value={personType}
              >
                {selectPersonTypes}
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

ViewPerson.defaultProps = {
  item: null,
};
ViewPerson.propTypes = {
  delete: PropTypes.func.isRequired,
  item: PropTypes.object,
};
