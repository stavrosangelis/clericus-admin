import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Card,
  CardBody,
  CardFooter,
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
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import Breadcrumbs from '../components/breadcrumbs';
import ArticleImageBrowser from '../components/article-image-browser';

const APIPath = process.env.REACT_APP_APIPATH;

const Article = (props) => {
  // props
  const { match } = props;
  // state
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState(false);
  const [reload, setReload] = useState(false);
  const [status, setStatus] = useState('private');
  const [updating, setUpdating] = useState(false);
  const [updateBtn, setUpdateBtn] = useState(
    <span>
      <i className="fa fa-save" /> Update
    </span>
  );
  const [stateError, setError] = useState({ visible: false, text: [] });
  const defaultForm = {
    category: [],
    content: '',
    featuredImage: null,
    highlight: false,
    highlightOrder: 0,
    label: '',
    permalink: '',
    status: 'private',
    teaser: '',
    _id: null,
  };
  const [formData, setFormdata] = useState(defaultForm);
  const [newId, setNewId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagesReload, setImagesReload] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [featuredModal, setFeaturedModal] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImageDetails, setFeaturedImageDetails] = useState(null);
  const prevFeaturedImage = useRef(null);
  const toggleFeatured = () => setFeaturedModal(!featuredModal);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const toggleDeleteModal = () => {
    setDeleteModalVisible(!deleteModalVisible);
  };

  const prepareCategories = useCallback((items, sepParam = '') => {
    let newItems = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const sepOutput = `${sepParam} `;
      const output = {
        _id: item._id,
        label: `${sepOutput}${item.label}`,
        clean: item.label,
      };
      newItems.push(output);
      if (item.children.length > 0) {
        let sep = sepParam;
        sep += '-';
        newItems = [...newItems, ...prepareCategories(item.children, sep)];
      }
    }
    return newItems;
  }, []);

  const loadCategories = useCallback(async () => {
    const loadData = async () => {
      const url = `${APIPath}article-categories`;
      const responseData = await axios({
        method: 'get',
        url,
        crossDomain: true,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      return responseData;
    };
    const newData = await loadData();
    const categories = prepareCategories(newData);
    const options = [{ value: '', label: '-- select category --' }];
    for (let i = 0; i < categories.length; i += 1) {
      const c = categories[i];
      options.push({ value: c._id, label: c.label });
    }
    setCategoryOptions(options);
  }, [prepareCategories]);

  useEffect(() => {
    const load = async () => {
      const prepareCategoriesOutput = (values) => {
        if (typeof values === 'object') {
          const newValues =
            values.map((v) => {
              const category =
                categoryOptions.find((c) => Number(c.value) === Number(v)) ||
                null;
              const label = category !== null ? category.label : '';
              return { value: Number(v), label };
            }) || [];
          return newValues;
        }
        return [];
      };
      const { _id } = match.params;
      setLoading(false);
      if (_id === 'new') {
        return false;
      }
      const params = { _id };
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}article`,
        crossDomain: true,
        params,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      const data = {
        category: prepareCategoriesOutput(responseData.category),
        content: responseData.content,
        highlight: responseData.highlight,
        highlightOrder: responseData.highlightOrder,
        label: responseData.label,
        permalink: responseData.permalink,
        status: responseData.status,
        teaser: responseData.teaser,
        _id: responseData._id,
      };
      setFormdata(data);
      prevFeaturedImage.current = responseData.featuredImage;
      setFeaturedImage(responseData.featuredImage);
      setFeaturedImageDetails(responseData.featuredImageDetails);
      setStatus(data.status);
      return false;
    };
    if (loading) {
      loadCategories();
      if (categoryOptions.length > 0) {
        load();
      }
    }
  }, [loading, match.params, loadCategories, categoryOptions]);

  useEffect(() => {
    if (redirect) {
      setRedirect(false);
    }
  }, [redirect]);

  useEffect(() => {
    if (reload) {
      setReload(false);
    }
  }, [reload]);

  const featuredImageFn = (_id) => {
    setFeaturedImage(_id);
  };

  const removeFeatureImage = () => {
    setFeaturedImage(null);
    setFeaturedImageDetails(null);
  };

  const uploadFile = async (file) => {
    if (uploading) {
      return false;
    }
    setUploading(true);
    const url = `${APIPath}upload-file`;
    const postData = new FormData();
    postData.append('file', file.blob(), file.filename());
    const contentLength = postData.length;
    const responseData = await axios({
      method: 'post',
      url,
      data: postData,
      crossDomain: true,
      config: {
        headers: {
          'Content-Length': contentLength,
          'Content-Type': 'multipart/form-data',
        },
      },
    })
      .then((response) => response.data)
      .catch((response) => {
        console.log(response);
      });
    setUploading(false);
    return responseData;
  };

  const deleteItem = async () => {
    const { _id } = match.params;
    const data = { _id };
    const responseData = await axios({
      method: 'delete',
      url: `${APIPath}article`,
      crossDomain: true,
      data,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      setRedirect(true);
    }
  };

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const form = { ...formData };
    form[name] = value;
    setFormdata(form);
  };

  const select2Change = (selectedOption, element = null) => {
    if (element === null) {
      return false;
    }
    const form = { ...formData };
    form[element] = selectedOption;
    return setFormdata(form);
  };

  const updateStatus = (value) => {
    const form = { ...formData };
    form.status = value;
    setStatus(value);
    setFormdata(form);
  };

  const handleEditorChange = (value, name) => {
    const form = { ...formData };
    form[name] = value;
    setFormdata(form);
  };

  const validateForm = (postData) => {
    if (postData.label.length < 2) {
      setUpdating(false);
      setError({
        visible: true,
        text: (
          <div>
            The articles&apos;s <b>Label</b> must contain at least two (2)
            characters
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
    setUpdateBtn(
      <span>
        <i className="fa fa-save" /> <i>Saving...</i>{' '}
        <Spinner color="info" size="sm" />
      </span>
    );
    return true;
  };

  const formSubmit = useCallback(
    async (e) => {
      const preparePostCategories = (values) => {
        const newValues = values.map((v) => Number(v.value)) || [];
        return newValues;
      };
      if (typeof e !== 'undefined') {
        e.preventDefault();
      }
      if (updating) {
        return false;
      }
      setUpdating(true);
      const postData = { ...formData };
      if (featuredImage !== null) {
        postData.featuredImage = featuredImage;
      }
      const { _id } = match.params;
      if (_id !== 'new') {
        postData._id = _id;
      } else {
        delete postData._id;
      }
      postData.category = preparePostCategories(postData.category);
      const isValid = validateForm(postData);
      if (isValid) {
        const update = await axios({
          method: 'put',
          url: `${APIPath}article`,
          crossDomain: true,
          data: postData,
        })
          .then((response) => response.data)
          .catch((error) => {
            console.log(error);
          });
        setUpdating(false);
        if (update.status) {
          setUpdateBtn(
            <span>
              <i className="fa fa-save" /> Update success{' '}
              <i className="fa fa-check" />
            </span>
          );
          if (_id === 'new') {
            setNewId(update.data._id);
            setReload(true);
          } else {
            setLoading(true);
          }
        } else {
          const errorText = [];
          for (let i = 0; i < update.errors.length; i += 1) {
            const error = update.errors[i];
            errorText.push(<div key={i}>{error.msg}</div>);
          }
          setError({
            visible: true,
            text: errorText,
          });
          setUpdateBtn(
            <span>
              <i className="fa fa-save" /> Update error{' '}
              <i className="fa fa-times" />
            </span>
          );
        }
        setTimeout(() => {
          setUpdateBtn(
            <span>
              <i className="fa fa-save" /> Update
            </span>
          );
        }, 2000);
      }
      return false;
    },
    [featuredImage, formData, match.params, updating]
  );

  useEffect(() => {
    if (featuredImage !== null && prevFeaturedImage.current !== featuredImage) {
      formSubmit();
    }
  }, [featuredImage, formSubmit]);

  // render
  let heading = 'Article';
  if (match.params._id === 'new') {
    heading = 'Add new article';
  }
  const breadcrumbsItems = [
    {
      label: 'Articles',
      icon: 'pe-7s-news-paper',
      active: false,
      path: '/articles',
    },
    { label: heading, icon: '', active: true, path: '' },
  ];

  let content = (
    <div className="row">
      <div className="col-12">
        <div style={{ padding: '40pt', textAlign: 'center' }}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
  );

  let redirectElem = [];
  if (redirect) {
    redirectElem = <Redirect to="/articles" />;
  }
  if (reload) {
    redirectElem = <Redirect to={`/article/${newId}`} />;
  }

  if (!loading) {
    let statusPublic = 'secondary';
    const statusPrivate = 'secondary';
    let publicOutline = true;
    let privateOutline = false;
    if (status === 'public') {
      statusPublic = 'success';
      publicOutline = false;
      privateOutline = true;
    }

    const teaserEditorSettings = {
      height: 150,
      menubar: false,
      branding: false,
      statusbar: false,
    };
    const teaserEditorPlugins = ['link code'];
    const teaserEditorToolbar = [
      'cut copy paste | undo redo | bold underline italic removeformat | link unlink | code',
    ];

    let contentEditor = null;
    const contentEditorSettings = {
      setup: (editor) => {
        contentEditor = editor;
      },
      height: 300,
      menubar: false,
      branding: false,
      statusbar: false,
      image_title: true,
      automatic_uploads: true,
      file_picker_types: 'image',
      file_picker_callback(cb) {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.onchange = () => {
          const [file] = input.files;
          const reader = new FileReader();
          reader.onload = () => {
            const id = `blobid${new Date().getTime()}`;
            const { blobCache } = contentEditor.editorUpload;
            const base64 = reader.result.split(',')[1];
            const blobInfo = blobCache.create(id, file, base64);
            blobCache.add(blobInfo);

            // call the callback and populate the Title field with the file name
            cb(blobInfo.blobUri(), { title: file.name });
          };
          reader.readAsDataURL(file);
        };
        input.click();
      },
      async images_upload_handler(blobInfo, success, failure) {
        const upload = await uploadFile(blobInfo);
        if (upload.status) {
          const fullsizePath = upload.data.paths.find(
            (p) => p.pathType === 'source'
          ).path;
          success(fullsizePath);
          setImagesReload(true);
          setImagesReload(false);
        } else {
          failure(upload.msg);
        }
      },
    };
    const contentEditorPlugins = [
      'link image media table visualblocks lists code',
    ];
    const contentEditorToolbar = [
      'cut copy paste | styleselect | bullist numlist outdent indent | table image media',
      'undo redo | bold underline italic removeformat | alignleft aligncenter alignright | link unlink | code',
    ];

    const deleteModal = (
      <Modal isOpen={deleteModalVisible} toggle={toggleDeleteModal}>
        <ModalHeader toggle={toggleDeleteModal}>
          Delete &quot;{formData.label}&quot;
        </ModalHeader>
        <ModalBody>
          The article &quot;{formData.label}&quot; will be deleted. Continue?
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

    let featuredImageHMTL = [];
    if (featuredImageDetails !== null) {
      let thumbPath = featuredImageDetails.paths.find(
        (p) => p.pathType === 'thumbnail'
      );
      const fullPath = featuredImageDetails.paths.find(
        (p) => p.pathType === 'source'
      );
      if (typeof thumbPath !== 'undefined') {
        thumbPath = thumbPath.path;
        featuredImageHMTL = (
          <div className="featured-image-container">
            <a
              href={fullPath.path}
              target="_blank"
              rel="noopener noreferrer"
              key={0}
              className="show-featured-image btn btn-outline-primary"
            >
              <i className="fa fa-external-link-square" />
            </a>
            <img
              src={thumbPath}
              className="featured-image img-thumbnail img-fluid"
              alt=""
            />
            <Button
              outline
              color="danger"
              size="sm"
              onClick={() => removeFeatureImage()}
              key={1}
              className="remove-featured-image"
            >
              <i className="fa fa-trash-o" />
            </Button>
          </div>
        );
      }
    }

    let errorContainerClass = ' hidden';
    if (stateError.visible) {
      errorContainerClass = '';
    }
    const errorContainer = (
      <div className={`error-container${errorContainerClass}`}>
        {stateError.text}
      </div>
    );

    let featuredImgBlock = [];
    if (match.params._id !== 'new') {
      featuredImgBlock = (
        <FormGroup>
          <Label>Featured Image</Label>
          {featuredImageHMTL}
          <Button
            type="button"
            onClick={toggleFeatured}
            size="sm"
            style={{ display: 'block' }}
          >
            Select new image
          </Button>
        </FormGroup>
      );
    }
    content = (
      <div className="items-container">
        <Card>
          <CardBody>
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
                <div className="col-xs-12 col-sm-6">
                  {errorContainer}
                  <FormGroup>
                    <Label>Label</Label>
                    <Input
                      type="text"
                      name="label"
                      placeholder="The label of the article..."
                      value={formData.label}
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Category</Label>
                    <Select
                      type="select"
                      name="category"
                      value={formData.category}
                      onChange={(selectedOption) =>
                        select2Change(selectedOption, 'category')
                      }
                      options={categoryOptions}
                      isMulti
                    />
                  </FormGroup>
                </div>
                <div className="col-xs-12 col-sm-6">{featuredImgBlock}</div>
              </div>
              <FormGroup>
                <Label>Teaser</Label>
                <Editor
                  init={teaserEditorSettings}
                  value={formData.teaser}
                  onEditorChange={(e) => handleEditorChange(e, 'teaser')}
                  plugins={teaserEditorPlugins}
                  toolbar={teaserEditorToolbar}
                />
              </FormGroup>
              <FormGroup>
                <Label>Content</Label>
                <Editor
                  init={contentEditorSettings}
                  value={formData.content}
                  onEditorChange={(e) => handleEditorChange(e, 'content')}
                  plugins={contentEditorPlugins}
                  toolbar={contentEditorToolbar}
                />
              </FormGroup>
            </Form>
          </CardBody>
          <CardFooter>
            <Button
              color="danger"
              onClick={toggleDeleteModal}
              outline
              type="button"
              size="sm"
            >
              <i className="fa fa-trash-o" /> Delete
            </Button>
            <Button
              color="primary"
              outline
              type="submit"
              size="sm"
              onClick={formSubmit}
              className="pull-right"
            >
              {updateBtn}
            </Button>
          </CardFooter>
        </Card>
        {deleteModal}
        <ArticleImageBrowser
          modal={featuredModal}
          toggle={toggleFeatured}
          featuredImgFn={featuredImageFn}
          reload={imagesReload}
        />
      </div>
    );
  }

  return (
    <div>
      {redirectElem}
      <Breadcrumbs items={breadcrumbsItems} />
      <div className="row">
        <div className="col-12">
          <h2>{heading}</h2>
        </div>
      </div>
      {content}
    </div>
  );
};

Article.defaultProps = {
  match: null,
};
Article.propTypes = {
  match: PropTypes.object,
};
export default Article;
