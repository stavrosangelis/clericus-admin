import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  UncontrolledDropdown,
} from 'reactstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Select from 'react-select';
import crypto from 'crypto-js';

const { REACT_APP_APIPATH: APIPath } = process.env;

export default function Details(props) {
  // props
  const { delete: deleteFn, item: user, usergroups, reload } = props;

  const navigate = useNavigate();

  const defaultUsergroup =
    usergroups.length > 0
      ? usergroups.find((u) => u.isDefault)
      : { _id: '', label: '' };
  const { _id: ugId, label: ugLabel } = defaultUsergroup;
  const defaultOption = {
    value: ugId,
    label: ugLabel,
  };

  const [usergroup, setUsergroup] = useState(defaultOption);
  const [item, setItem] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordRepeat: '',
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
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordUpdateBtnText, setPasswordUpdateBtnText] = useState(
    <span>
      <i className="fa fa-save" /> Update
    </span>
  );
  const [passwordUpdateError, setPasswordUpdateError] = useState({
    text: [],
    visible: false,
  });
  const [pModalVisible, setPModalVisible] = useState(false);

  useEffect(() => {
    if (user !== null) {
      setItem(user);
      const usergroupValue = usergroups.find(
        (u) => u._id === user.usergroup._id
      );
      const { _id: nugId, label: nugLabel } = usergroupValue;
      const usergroupOption = {
        value: nugId,
        label: nugLabel,
      };
      setUsergroup(usergroupOption);
    }
  }, [user, usergroups]);

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const copy = { ...item };
    copy[name] = value;
    setItem(copy);
  };

  const updateUsergroup = (value) => {
    setUsergroup(value);
  };

  const togglePasswordModal = () => {
    setPModalVisible(!pModalVisible);
  };

  const validateUser = () => {
    const { email: pEmail } = item;
    const result = {
      status: true,
      error: [],
    };
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(String(pEmail).toLowerCase())) {
      result.status = false;
      result.error = [<div key="e">Please provide a valid email</div>];
    }
    return result;
  };

  const validatePassword = () => {
    const result = {
      status: true,
      error: [],
    };
    const { password = '', passwordRepeat = '' } = item;
    if (password.length < 6) {
      result.status = false;
      result.error = [
        <div key="e">The user password must contain at least 6 characters</div>,
      ];
      return result;
    }
    if (password !== passwordRepeat) {
      result.status = false;
      result.error = [
        <div key="e">
          The user password and password repeat don&apos;t match.
        </div>,
      ];
      return result;
    }
    return result;
  };

  const update = async () => {
    if (!updating) {
      const validate = validateUser();
      const { status: vStatus, error: vError } = validate;
      if (!vStatus) {
        setUpdating(false);
        setUpdateBtnText(
          <span>
            <i className="fa fa-save" /> Update error{' '}
            <i className="fa fa-times" />
          </span>
        );
        setUpdateError({
          visible: true,
          text: vError,
        });
        setTimeout(() => {
          setUpdateBtnText(
            <span>
              <i className="fa fa-save" /> Update
            </span>
          );
        }, 1000);
      } else {
        setUpdating(true);
        setUpdateError({
          visible: false,
          text: [],
        });
        setUpdateBtnText(
          <span>
            <i className="fa fa-save" /> <i>Saving...</i>{' '}
            <Spinner color="info" size="sm" />
          </span>
        );
        const itemData = { ...user };
        itemData.firstName = item.firstName;
        itemData.lastName = item.lastName;
        itemData.email = item.email;
        itemData.usergroup = usergroup.value;
        const responseData = await axios({
          method: 'put',
          url: `${APIPath}user`,
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
        const { error = [], data: rData = null, status = false } = responseData;
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
          if (user === null) {
            navigate(`/user/${rData.data._id}`);
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
        if (user !== null) {
          setTimeout(() => {
            setUpdateBtnText(
              <span>
                <i className="fa fa-save" /> Update
              </span>
            );
          }, 2000);
        }
      }
    }
  };

  const updatePassword = async (e = null) => {
    if (e !== null) {
      e.preventDefault();
    }
    if (!passwordUpdating) {
      const validate = validatePassword();
      const { status: vStatus, error: vError } = validate;
      if (!vStatus) {
        setPasswordUpdating(false);
        setPasswordUpdateBtnText(
          <span>
            <i className="fa fa-save" /> Update error{' '}
            <i className="fa fa-times" />
          </span>
        );
        setPasswordUpdateError({
          visible: true,
          text: vError,
        });
        setTimeout(() => {
          setPasswordUpdateBtnText(
            <span>
              <i className="fa fa-save" /> Update
            </span>
          );
        }, 1000);
      } else {
        setPasswordUpdating(true);
        setPasswordUpdateBtnText(
          <span>
            <i className="fa fa-save" /> <i>Updating...</i>{' '}
            <Spinner color="info" size="sm" />
          </span>
        );
        setPasswordUpdateError({
          visible: false,
          text: [],
        });
        const { _id, password = '', passwordRepeat = '' } = item;
        const cryptoPass = crypto.SHA1(password).toString();
        const cryptoPassRepeat = crypto.SHA1(passwordRepeat).toString();
        const postData = {
          _id,
          password: cryptoPass,
          passwordRepeat: cryptoPassRepeat,
        };
        const responseData = await axios({
          method: 'post',
          url: `${APIPath}user-password`,
          crossDomain: true,
          data: postData,
        })
          .then((response) => response.data)
          .catch((error) => {
            console.log(error);
          });
        const { data: rData = null } = responseData;
        const { errors = [], msg = '', status = false } = rData;
        if (status) {
          setPasswordUpdating(false);
          setPasswordUpdateBtnText(
            <span>
              <i className="fa fa-save" /> Update
            </span>
          );
          setPModalVisible(false);
          reload();
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
          setPasswordUpdating(false);
          setPasswordUpdateBtnText(
            <span>
              <i className="fa fa-save" /> Update error{' '}
              <i className="fa fa-times" />
            </span>
          );
          setPasswordUpdateError({
            visible: true,
            text: errorArr,
          });
        }
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

  const usergroupsOptions = usergroups.map((ug) => {
    const { _id: ugoId, label: ugoLabel } = ug;
    return { value: ugoId, label: ugoLabel };
  });
  const {
    firstName = '',
    lastName = '',
    email = '',
    password = '',
    passwordRepeat = '',
  } = item;

  const { text: pText = null, visible: pVisible = false } = passwordUpdateError;
  const passwordErrorContainerClass = pVisible ? '' : ' hidden';

  const passwordErrorContainer = (
    <div className={`error-container${passwordErrorContainerClass}`}>
      {pText}
    </div>
  );

  const editPasswordModal = (
    <Modal isOpen={pModalVisible} toggle={togglePasswordModal}>
      <ModalHeader toggle={togglePasswordModal}>Update password</ModalHeader>
      <ModalBody>
        {passwordErrorContainer}
        <Form onSubmit={(e) => updatePassword(e)}>
          <FormGroup>
            <Label for="password">Password</Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Password..."
              value={password}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="passwordRepeat">Password repeat</Label>
            <Input
              type="password"
              name="passwordRepeat"
              id="passwordRepeat"
              placeholder="Password repeat..."
              value={passwordRepeat}
              onChange={handleChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter className="flex justify-content-between">
        <Button
          type="button"
          color="secondary"
          outline
          size="sm"
          onClick={togglePasswordModal}
        >
          Cancel
        </Button>
        <Button
          onClick={() => updatePassword()}
          type="submit"
          color="info"
          outline
          size="sm"
        >
          {passwordUpdateBtnText}
        </Button>
      </ModalFooter>
    </Modal>
  );

  const editPasswordToggle =
    user !== null ? (
      <div className="pull-right">
        <UncontrolledDropdown direction="right">
          <DropdownToggle className="more-toggle" outline>
            <i className="fa fa-ellipsis-v" />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={() => togglePasswordModal()}>
              Edit password
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    ) : null;

  return (
    <>
      <Card>
        <CardBody>
          {editPasswordToggle}
          {errorContainer}
          <Form onSubmit={formSubmit}>
            <FormGroup>
              <Label for="firstName">First Name</Label>
              <Input
                type="text"
                name="firstName"
                id="firstName"
                placeholder="First Name..."
                value={firstName}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="lastName">Last Name</Label>
              <Input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Last Name..."
                value={lastName}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input
                type="email"
                name="email"
                id="email"
                placeholder="Email..."
                value={email}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>User group</Label>
              <Select
                value={usergroup}
                onChange={(value) => updateUsergroup(value)}
                options={usergroupsOptions}
              />
            </FormGroup>
            <div className="flex justify-content-between">
              {deleteBtn}
              {updateBtn}
            </div>
          </Form>
        </CardBody>
      </Card>
      {editPasswordModal}
    </>
  );
}

Details.defaultProps = {
  item: null,
  usergroups: [],
};
Details.propTypes = {
  delete: PropTypes.func.isRequired,
  item: PropTypes.object,
  usergroups: PropTypes.array,
  reload: PropTypes.func.isRequired,
};
