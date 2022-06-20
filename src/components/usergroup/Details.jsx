import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
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

export default function Details(props) {
  // props
  const { delete: deleteFn, item: usergroup } = props;

  const navigate = useNavigate();

  const [item, setItem] = useState({
    label: '',
    description: '',
    isAdmin: false,
    isDefault: false,
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
    if (usergroup !== null) {
      setItem(usergroup);
    }
  }, [usergroup]);

  const handleChange = (e) => {
    const { target } = e;
    const { type, name } = target;
    let { value } = target;
    if (type === 'radio') {
      value = value === 'true';
    }
    const copy = { ...item };
    copy[name] = value;
    setItem(copy);
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
      const itemData = { ...usergroup };
      itemData.label = item.label;
      itemData.description = item.description;
      itemData.isAdmin = item.isAdmin;
      itemData.isDefault = item.isDefault;
      const responseData = await axios({
        method: 'put',
        url: `${APIPath}user-group`,
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

      const { error = [], status = false, data: rData = null } = responseData;
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
        if (usergroup === null) {
          navigate(`/usergroup/${rData.data._id}`);
        }
      } else {
        const errorText = error.map((e) => <div key={e}>{e}</div>);
        setUpdating(false);
        setUpdateBtnText(
          <span>
            <i className="fa fa-save" /> Update error{' '}
            <i className="fa fa-times" />
          </span>
        );
        setUpdateError({
          text: errorText,
          visible: true,
        });
      }
      if (usergroup !== null) {
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

  const { text: errorText, visible: errorVisible } = updateError;
  const errorContainerClass = errorVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );

  const {
    label = '',
    description = '',
    isAdmin = false,
    isDefault = false,
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

  const isDefaultChecked1 = isDefault;
  const isDefaultChecked2 = !isDefault;
  const isAdminChecked1 = isAdmin;
  const isAdminChecked2 = !isAdmin;

  return (
    <Card>
      <CardBody>
        {errorContainer}
        <Form onSubmit={formSubmit}>
          <FormGroup>
            <Label>Label</Label>
            <Input
              type="text"
              name="label"
              placeholder="Usergroup label..."
              value={label}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Description</Label>
            <Input
              type="textarea"
              name="description"
              placeholder="Usergroup description..."
              value={description}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Is default</Label>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="isDefault"
                  onChange={handleChange}
                  checked={isDefaultChecked1}
                  value="true"
                />
                Yes
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="isDefault"
                  onChange={handleChange}
                  checked={isDefaultChecked2}
                  value="false"
                />
                No
              </Label>
            </FormGroup>
          </FormGroup>
          <FormGroup>
            <Label>Is admin</Label>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="isAdmin"
                  checked={isAdminChecked1}
                  onChange={handleChange}
                  value="true"
                />
                Yes
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="isAdmin"
                  checked={isAdminChecked2}
                  onChange={handleChange}
                  value="false"
                />
                No
              </Label>
            </FormGroup>
          </FormGroup>
          <div className="flex justify-content-between">
            {deleteBtn}
            {updateBtn}
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}

Details.defaultProps = {
  item: null,
};
Details.propTypes = {
  delete: PropTypes.func.isRequired,
  item: PropTypes.object,
};
