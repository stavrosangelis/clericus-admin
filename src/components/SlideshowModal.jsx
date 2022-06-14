import React, { useReducer, useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  ButtonGroup,
} from 'reactstrap';
import PropTypes from 'prop-types';
import { getData, putData, deleteData } from '../helpers';
import ArticleImageBrowser from './Article.image.browser';

const defaultState = {
  _id: null,
  label: '',
  caption: '',
  order: '',
  url: '',
  status: '',
  image: '',
};

function SlideshowModal(props) {
  // props
  const { _id, visible, toggle, reload } = props;

  // state
  const [state, setState] = useReducer(
    (curState, newState) => ({ ...curState, ...newState }),
    defaultState
  );
  const [updateBtn, setUpdateBtn] = useState(
    <span>
      <i className="fa fa-save" /> Update
    </span>
  );
  const [saving, setSaving] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState([]);
  const [imageModal, setImageModal] = useState(false);
  const [imageDetails, setImageDetails] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const loadItem = useCallback(async () => {
    if (_id === 'new') {
      setState(defaultState);
      setImageDetails(null);
    } else if (_id !== null) {
      const responseData = await getData(`slideshow-item`, { _id });
      if (responseData.status) {
        const { data } = responseData;
        const form = {
          _id: data._id,
          label: data.label,
          caption: data.caption,
          order: data.order,
          url: data.url,
          status: data.status,
          image: data.image,
        };
        setState(form);
        setImageDetails(data.imageDetails);
      }
    }
  }, [_id]);

  useEffect(() => {
    if (visible) {
      loadItem();
    }
  }, [loadItem, visible, _id]);

  const toggleImage = () => {
    setImageModal(!imageModal);
  };

  const imageFn = (imageId) => {
    const stateCopy = { ...state };
    stateCopy.image = imageId;
    setState(stateCopy);
  };

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    setState({
      [name]: value,
    });
  };

  const modalTitle =
    state._id !== null ? 'Edit slideshow item' : 'Add new slideshow item';
  const errorContainerClass = errorVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );

  const toggleDeleteModal = () => {
    setDeleteModalVisible(!deleteModalVisible);
  };

  const deleteItem = async () => {
    const data = { _id };
    const responseData = await deleteData(`slideshow-item`, data);
    if (responseData.status) {
      toggleDeleteModal();
      toggle(null);
      reload();
    }
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    if (saving) {
      return false;
    }
    setSaving(true);

    const update = await putData(`slideshow-item`, state);
    if (update.status) {
      const stateCopy = { ...state };
      stateCopy._id = update.data._id;
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Update success{' '}
          <i className="fa fa-check" />
        </span>
      );
      setSaving(false);
      reload();
    } else {
      const newErrorText = [];
      for (let i = 0; i < update.errors.length; i += 1) {
        const error = update.errors[i];
        errorText.push(<div key={i}>{error.msg}</div>);
      }
      setErrorText(newErrorText);
      setErrorVisible(true);
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Update error{' '}
          <i className="fa fa-times" />
        </span>
      );
      setSaving(false);
    }
    setTimeout(() => {
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Update
        </span>
      );
    }, 2000);
    return true;
  };

  let statusPublic = 'secondary';
  const statusPrivate = 'secondary';
  let publicOutline = true;
  let privateOutline = false;
  if (state.status === 'public') {
    statusPublic = 'success';
    publicOutline = false;
    privateOutline = true;
  }
  let imagePreview = [];
  if (imageDetails !== null) {
    const image = imageDetails;
    const imagePath = image.paths.find((p) => p.pathType === 'source').path;
    imagePreview = <img className="slideshow-preview" alt="" src={imagePath} />;
  }

  const deleteModal = (
    <Modal isOpen={deleteModalVisible} toggle={toggleDeleteModal}>
      <ModalHeader toggle={toggleDeleteModal}>
        Delete &quot;{state.label}&quot;
      </ModalHeader>
      <ModalBody>
        The slideshow item &quot;{state.label}&quot; will be deleted. Continue?
      </ModalBody>
      <ModalFooter className="text-left">
        <Button
          className="pull-right"
          color="danger"
          size="sm"
          outline
          onClick={deleteItem}
        >
          <i className="fa fa-trash-o" /> Delete
        </Button>
        <Button color="secondary" size="sm" onClick={toggleDeleteModal}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );

  const deleteBtn =
    _id !== null && _id !== 'new' ? (
      <Button
        color="danger"
        outline
        size="sm"
        onClick={() => toggleDeleteModal()}
        className="pull-left"
      >
        <i className="fa fa-trash" /> Delete
      </Button>
    ) : (
      []
    );

  return (
    <div>
      <Modal isOpen={visible} toggle={() => toggle(null)} size="lg">
        <ModalHeader toggle={() => toggle(null)}>{modalTitle}</ModalHeader>
        <ModalBody>
          <Form onSubmit={formSubmit}>
            <div className="text-end">
              <ButtonGroup>
                <Button
                  size="sm"
                  outline={publicOutline}
                  color={statusPublic}
                  onClick={() =>
                    setState({
                      status: 'public',
                    })
                  }
                >
                  Public
                </Button>
                <Button
                  size="sm"
                  outline={privateOutline}
                  color={statusPrivate}
                  onClick={() =>
                    setState({
                      status: 'private',
                    })
                  }
                >
                  Private
                </Button>
              </ButtonGroup>
            </div>
            {errorContainer}
            <FormGroup>
              <Label>Label</Label>
              <Input
                type="text"
                name="label"
                placeholder="The label of this slideshow item..."
                value={state.label}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Caption</Label>
              <Input
                type="textarea"
                name="caption"
                placeholder="The caption of this slideshow item..."
                value={state.caption}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Order</Label>
              <Input
                type="number"
                style={{ width: '70px' }}
                name="order"
                placeholder="0"
                value={state.order}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>URL</Label>
              <Input
                type="text"
                name="url"
                placeholder="The url of this slideshow item..."
                value={state.url}
                onChange={handleChange}
              />
            </FormGroup>
          </Form>
          <FormGroup>
            <Label>Image</Label>
            <Button
              type="button"
              onClick={() => toggleImage()}
              size="xs"
              style={{ marginLeft: '5px' }}
            >
              Select image
            </Button>
            <div className="img-preview-container">{imagePreview}</div>
          </FormGroup>
          <ArticleImageBrowser
            modal={imageModal}
            toggle={toggleImage}
            featuredImgFn={imageFn}
          />
        </ModalBody>
        <ModalFooter>
          {deleteBtn}
          <Button
            color="primary"
            outline
            size="sm"
            onClick={(e) => formSubmit(e)}
          >
            {updateBtn}
          </Button>
        </ModalFooter>
      </Modal>
      {deleteModal}
    </div>
  );
}
SlideshowModal.defaultProps = {
  _id: null,
};

SlideshowModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  _id: PropTypes.string,
  toggle: PropTypes.func.isRequired,
  reload: PropTypes.func.isRequired,
};
export default SlideshowModal;
