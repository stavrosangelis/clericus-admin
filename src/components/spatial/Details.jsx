import React, { useState, useEffect } from 'react';
import {
  Button,
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
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const { REACT_APP_APIPATH: APIPath } = process.env;

export default function ViewSpatial(props) {
  // props
  const { delete: deleteFn, item: spatial } = props;

  const navigate = useNavigate();

  const [detailsOpen, setDetailsOpen] = useState(true);
  const [item, setItem] = useState({
    label: '',
    streetAddress: '',
    locality: '',
    region: '',
    postalCode: '',
    country: '',
    latitude: '',
    longitude: '',
    locationType: '',
    note: '',
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
    if (spatial !== null) {
      const {
        _id,
        label,
        streetAddress,
        locality,
        region,
        postalCode,
        country,
        latitude,
        longitude,
        locationType,
        note: sNote = '',
      } = spatial;
      const note = sNote || '';
      const itemData = {
        _id,
        label,
        streetAddress,
        locality,
        region,
        postalCode,
        country,
        latitude,
        longitude,
        locationType,
        note,
      };
      setItem(itemData);
    }
  }, [spatial]);

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const copy = { ...item };
    copy[name] = value;
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
      const itemData = { ...spatial };
      itemData.label = item.label;
      itemData.streetAddress = item.streetAddress;
      itemData.locality = item.locality;
      itemData.region = item.region;
      itemData.postalCode = item.postalCode;
      itemData.country = item.country;
      itemData.latitude = item.latitude;
      itemData.longitude = item.longitude;
      itemData.locationType = item.locationType;
      itemData.note = item.note;
      const responseData = await axios({
        method: 'put',
        url: `${APIPath}spatial`,
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
        if (spatial === null) {
          navigate(`/spatial/${rData.data._id}`);
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
      if (spatial !== null) {
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
    e.prspatialDefault();
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
    streetAddress = '',
    locality = '',
    region = '',
    postalCode = '',
    country = '',
    latitude = '',
    longitude = '',
    locationType = '',
    note = '',
  } = item;

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
            <FormGroup>
              <Label>Label</Label>
              <Input
                type="text"
                name="label"
                placeholder="Spatial label..."
                value={label}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Street address</Label>
              <Input
                type="text"
                name="streetAddress"
                placeholder="Street address..."
                value={streetAddress}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Locality</Label>
              <Input
                type="text"
                name="locality"
                placeholder="Locality..."
                value={locality}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>Region</Label>
              <Input
                type="text"
                name="region"
                placeholder="Region..."
                value={region}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>Postal Code</Label>
              <Input
                type="text"
                name="postalCode"
                placeholder="Postal Code..."
                value={postalCode}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>Country</Label>
              <Input
                type="text"
                name="country"
                placeholder="Country..."
                value={country}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>Coordinates</Label>
            </FormGroup>
            <div className="row">
              <div className="col-xs-12 col-sm-6">
                <FormGroup>
                  <Label>Latitude</Label>
                  <Input
                    type="text"
                    name="latitude"
                    placeholder="Latitude..."
                    value={latitude}
                    onChange={handleChange}
                  />
                </FormGroup>
              </div>
              <div className="col-xs-12 col-sm-6">
                <FormGroup>
                  <Label>Longitude</Label>
                  <Input
                    type="text"
                    name="longitude"
                    placeholder="Longitude..."
                    value={longitude}
                    onChange={handleChange}
                  />
                </FormGroup>
              </div>
            </div>

            <FormGroup>
              <Label>Location Type</Label>
              <Input
                type="text"
                name="locationType"
                placeholder="Location Type..."
                value={locationType}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>Note</Label>
              <Input
                type="textarea"
                name="note"
                placeholder="Note..."
                value={note}
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

ViewSpatial.defaultProps = {
  item: null,
};
ViewSpatial.propTypes = {
  delete: PropTypes.func.isRequired,
  item: PropTypes.object,
};
