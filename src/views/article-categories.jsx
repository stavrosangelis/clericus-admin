import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import axios from 'axios';
import {
  Card,
  CardBody,
  Button,
  ButtonGroup,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from 'reactstrap';

const ArticleCategoriesItems = lazy(() =>
  import('../components/article-categories-block')
);
const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));

const APIPath = process.env.REACT_APP_APIPATH;

const ArticleCategories = () => {
  // state
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateBtn, setUpdateBtn] = useState(
    <span>
      <i className="fa fa-save" /> Update
    </span>
  );
  const [status, setStatus] = useState('private');
  const [error, setError] = useState({ visible: false, text: [] });
  const defaultForm = {
    _id: null,
    label: '',
    parentId: 0,
    status: 'private',
  };
  const [itemForm, setItemForm] = useState(defaultForm);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const itemValidate = (postData) => {
    if (postData.label === '') {
      setUpdating(false);
      setError({
        visible: true,
        text: (
          <div>
            Please enter the <b>Label</b> to continue!
          </div>
        ),
      });
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Update error{' '}
          <i className="fa fa-times" />
        </span>
      );
      return false;
    }

    setError({ visible: false, text: [] });

    return true;
  };

  const loadItem = async (_id) => {
    setError({ visible: false, text: [] });
    if (_id === null) {
      const newForm = {
        _id: null,
        label: '',
        parentId: 0,
        status: 'private',
      };
      setItemForm(newForm);
      setStatus('private');
      setItem(null);
    } else {
      const url = `${APIPath}article-category`;
      const responseData = await axios({
        method: 'get',
        url,
        crossDomain: true,
        params: { _id },
      })
        .then((response) => response.data.data)
        .catch((err) => {
          console.log(err);
        });
      const newForm = {
        _id: responseData._id,
        label: responseData.label,
        parentId: responseData.parentId,
        status: responseData.status,
      };
      setItemForm(newForm);
      setItem(responseData);
      setStatus(responseData.status);
    }
    setItemModalVisible(true);
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    if (updating) {
      return false;
    }
    setUpdating(true);
    setUpdateBtn(
      <span>
        <i className="fa fa-save" /> <i>Saving...</i>{' '}
        <Spinner color="info" size="sm" />
      </span>
    );
    const postData = { ...itemForm };
    const isValid = itemValidate(postData);
    if (!isValid) {
      return false;
    }
    const updateData = await axios({
      method: 'put',
      url: `${APIPath}article-category`,
      crossDomain: true,
      data: postData,
    })
      .then((response) => response.data)
      .catch((err) => {
        console.log(err);
      });
    if (updateData.status) {
      setUpdating(false);
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Update success{' '}
          <i className="fa fa-check" />
        </span>
      );
      setLoading(true);
      loadItem(updateData.data._id);

      setTimeout(() => {
        setUpdateBtn(
          <span>
            <i className="fa fa-save" /> Update
          </span>
        );
      }, 2000);
    }
    return false;
  };

  const deleteItem = async () => {
    const { _id } = itemForm;
    const data = { _id };
    const responseData = await axios({
      method: 'delete',
      url: `${APIPath}article-category`,
      crossDomain: true,
      data,
    })
      .then((response) => response.data)
      .catch((err) => {
        console.log(err);
      });
    if (responseData.status) {
      setDeleteModalVisible(false);
      setItemModalVisible(false);
      setLoading(true);
    } else {
      setDeleteModalVisible(false);
      const errorMsg = responseData.msg;
      const errorText = errorMsg.map((e, i) => {
        const key = `a${i}`;
        return <div key={key}>{e}</div>;
      });
      setError({ visible: true, text: errorText });
    }
  };

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const form = { ...itemForm };
    form[name] = value;
    setItemForm(form);
  };

  const updateStatus = (value) => {
    const form = { ...itemForm };
    form.status = value;
    setStatus(value);
    setItemForm(form);
  };

  // load categories
  const newItem = useCallback((it) => {
    const itCopy = it;
    itCopy.open = true;
    if (itCopy.children.length > 0) {
      const children = itCopy.children.map((child) => newItem(child));
      itCopy.children = children;
    }
    return itCopy;
  }, []);

  const loadItems = useCallback(async () => {
    const loadData = async () => {
      const url = `${APIPath}article-categories`;
      setLoading(false);
      const responseData = await axios({
        method: 'get',
        url,
        crossDomain: true,
      })
        .then((response) => response.data.data)
        .catch((err) => {
          console.log(err);
        });
      return responseData;
    };
    const newData = await loadData();
    // add open toggle to menu items
    const newItems = newData.map((it) => newItem(it));
    setItems(newItems);
  }, [newItem]);

  useEffect(() => {
    if (loading) {
      loadItems();
    }
  }, [loading, loadItems]);

  const toggleItemModal = () => {
    setItemModalVisible(!itemModalVisible);
  };

  const toggleDeleteModal = () => {
    setDeleteModalVisible(!deleteModalVisible);
  };

  const heading = 'Article categories';
  const breadcrumbsItems = [
    { label: heading, icon: 'fa fa-list', active: true, path: '' },
  ];

  const parentOptions = (it = null, sep = '') => {
    if (it === null) {
      return [];
    }
    const options = [];
    let newSep = sep;
    if (itemForm._id !== null) {
      if (it._id !== itemForm._id) {
        options.push(
          <option value={it._id} key={it._id}>
            {newSep} {it.label}
          </option>
        );
      }
    }
    if (it.children.length > 0) {
      newSep += '-';
      for (let j = 0; j < it.children.length; j += 1) {
        const child = it.children[j];
        options.push(parentOptions(child, newSep));
      }
    }
    return options;
  };

  let content = (
    <div>
      <div className="row">
        <div className="col-12">
          <div style={{ padding: '40pt', textAlign: 'center' }}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    </div>
  );
  let errorContainerClass = ' hidden';
  if (error.visible) {
    errorContainerClass = '';
  }
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{error.text}</div>
  );
  let itemsHTML = [];
  if (items.length > 0) {
    itemsHTML = (
      <Suspense fallback={[]}>
        <ArticleCategoriesItems items={items} toggle={loadItem} />
      </Suspense>
    );
  }

  let statusPublic = 'secondary';
  const statusPrivate = 'secondary';
  let publicOutline = true;
  let privateOutline = false;
  if (status === 'public') {
    statusPublic = 'success';
    publicOutline = false;
    privateOutline = true;
  }

  let parentIdOptions = [
    <option value="0" key={0}>
      -- Select parent --
    </option>,
  ];

  for (let i = 0; i < items.length; i += 1) {
    const it = items[i];
    const options = parentOptions(it, '');
    parentIdOptions = [...parentIdOptions, ...options];
  }

  let itemModalTitle = 'Add new article category';
  if (item !== null) {
    itemModalTitle = 'Edit article category';
  }
  const itemModal = (
    <Modal isOpen={itemModalVisible} toggle={toggleItemModal}>
      <ModalHeader toggle={toggleItemModal}>{itemModalTitle}</ModalHeader>
      <ModalBody>
        <Form onSubmit={formSubmit}>
          <div className="text-right">
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
          <div className="row">
            <div className="col-12">
              {errorContainer}
              <FormGroup>
                <Label>Label</Label>
                <Input
                  type="text"
                  name="label"
                  placeholder="The label of the article category..."
                  value={itemForm.label}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label>Parent</Label>

                <Input
                  type="select"
                  name="parentId"
                  value={itemForm.parentId}
                  onChange={handleChange}
                >
                  {parentIdOptions}
                </Input>
              </FormGroup>
            </div>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color="danger"
          onClick={toggleDeleteModal}
          outline
          type="button"
          size="sm"
          className="pull-left"
        >
          <i className="fa fa-trash-o" /> Delete
        </Button>
        <Button
          color="primary"
          outline
          type="submit"
          size="sm"
          onClick={formSubmit}
        >
          {updateBtn}
        </Button>
      </ModalFooter>
    </Modal>
  );

  const deleteModal = (
    <Modal isOpen={deleteModalVisible} toggle={toggleDeleteModal}>
      <ModalHeader toggle={toggleDeleteModal}>
        Delete &quot;{itemForm.label}&quot;
      </ModalHeader>
      <ModalBody>
        The article category &quot;{itemForm.label}&quot; will be deleted.
        Continue?
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

  if (!loading) {
    content = (
      <div>
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                {itemsHTML}
                <Button
                  type="button"
                  size="sm"
                  color="info"
                  className="pull-right"
                  outline
                  onClick={() => loadItem(null)}
                >
                  Add new <i className=" fa fa-plus" />
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <div className="row">
        <div className="col-12">
          <h2>{heading}</h2>
        </div>
      </div>
      {content}
      {itemModal}
      {deleteModal}
    </div>
  );
};
export default ArticleCategories;
