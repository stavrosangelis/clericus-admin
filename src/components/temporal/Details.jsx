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
import InputMask from 'react-input-mask';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const { REACT_APP_APIPATH: APIPath } = process.env;

const normalizeDate = (date = '') => {
  if (date === '') {
    return '';
  }
  const dateArr = date.split('-');
  let [d, m] = dateArr;
  const y = dateArr[2];
  if (Number(d) < 10 && d.length === 1) {
    d = `0${d}`;
  }
  if (Number(m) < 10 && m.length === 1) {
    m = `0${m}`;
  }
  return `${d}-${m}-${y}`;
};

export default function ViewTemporal(props) {
  // props
  const { delete: deleteFn, item: temporal } = props;

  const navigate = useNavigate();

  const [detailsOpen, setDetailsOpen] = useState(true);
  const [item, setItem] = useState({
    label: '',
    startDate: '',
    endDate: '',
    format: '',
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
    if (temporal !== null) {
      const {
        _id,
        label: tLabel = '',
        startDate: tStartDate = '',
        endDate: tEndDate,
        format: tFormat,
      } = temporal;
      const itemData = {
        _id,
        label: tLabel,
        startDate: normalizeDate(tStartDate),
        endDate: normalizeDate(tEndDate),
        format: tFormat,
      };
      setItem(itemData);
    }
  }, [temporal]);

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
      const itemData = { ...temporal };
      itemData.startDate = item.startDate;
      itemData.endDate = item.endDate;
      itemData.format = item.format;
      const responseData = await axios({
        method: 'put',
        url: `${APIPath}temporal`,
        crossDomain: true,
        data: itemData,
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response)
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
        if (temporal === null) {
          navigate(`/temporal/${rData.data._id}`);
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
      if (temporal !== null) {
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

  const { label = '', startDate = '', endDate = '' } = item;

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
                placeholder="Temporal label..."
                value={label}
                onChange={handleChange}
              />
            </FormGroup>
            <div className="row">
              <div className="col-xs-12 col-sm-6">
                <FormGroup>
                  <Label>Start date</Label>
                  <InputMask
                    className="input-mask"
                    placeholder="dd-mm-yyyy"
                    mask="99-99-9999"
                    name="startDate"
                    value={startDate}
                    onChange={handleChange}
                  />
                </FormGroup>
              </div>
              <div className="col-xs-12 col-sm-6">
                <FormGroup>
                  <Label>End date</Label>
                  <InputMask
                    className="input-mask"
                    placeholder="dd-mm-yyyy"
                    mask="99-99-9999"
                    name="endDate"
                    value={endDate}
                    onChange={handleChange}
                  />
                </FormGroup>
              </div>
            </div>
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

ViewTemporal.defaultProps = {
  item: null,
};
ViewTemporal.propTypes = {
  delete: PropTypes.func.isRequired,
  item: PropTypes.object,
};
