import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from 'react';
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
  Spinner,
} from 'reactstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { renderLoader } from '../helpers';

const ArticleImageBrowser = lazy(() =>
  import('../components/Article.image.browser')
);
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const DeleteModal = lazy(() => import('../components/Delete.modal'));
const Editor = lazy(() => import('../components/LazyEditor'));

const { REACT_APP_APIPATH: APIPath } = process.env;

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
export default function Article() {
  // state
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('private');
  const [updating, setUpdating] = useState(false);
  const [updateBtn, setUpdateBtn] = useState(
    <span>
      <i className="fa fa-save" /> Update
    </span>
  );
  const [stateError, setError] = useState({ visible: false, text: [] });
  const [formData, setFormdata] = useState(defaultForm);
  const [uploading, setUploading] = useState(false);
  const [imagesReload, setImagesReload] = useState(false);
  const [articleLabel, setArticleLabel] = useState('');

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [featuredModal, setFeaturedModal] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImageDetails, setFeaturedImageDetails] = useState(null);
  const prevFeaturedImage = useRef(null);
  const toggleFeatured = () => setFeaturedModal(!featuredModal);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const { _id } = useParams();
  const prevId = useRef(null);

  const navTo = useNavigate();

  const toggleDeleteModal = () => {
    setDeleteModalVisible(!deleteModalVisible);
  };

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const loadCategories = async () => {
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
      if (!unmounted) {
        const prepareCategories = (items, sepParam = '') => {
          let newItems = [];
          const { length } = items;
          for (let i = 0; i < length; i += 1) {
            const item = items[i];
            const { _id: iId, label: iLabel, children = [] } = item;
            const sepOutput = `${sepParam} `;
            const output = {
              _id: iId,
              label: `${sepOutput}${iLabel}`,
              clean: iLabel,
            };
            newItems.push(output);
            if (children.length > 0) {
              let sep = sepParam;
              sep += '-';
              newItems = [...newItems, ...prepareCategories(children, sep)];
            }
          }
          return newItems;
        };
        const categories = prepareCategories(newData);
        const options = [{ value: '', label: '-- select category --' }];
        const { length } = categories;
        for (let i = 0; i < length; i += 1) {
          const { _id: cId, label: cLabel } = categories[i];
          options.push({ value: cId, label: cLabel });
        }
        setCategoryOptions(options);
        setLoading(true);
      }
    };
    loadCategories();
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
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
      prevId.current = _id;
      if (_id === 'new') {
        setLoading(false);
      } else {
        const responseData = await axios({
          method: 'get',
          url: `${APIPath}article`,
          crossDomain: true,
          params: { _id },
          signal: controller.signal,
        })
          .then((response) => {
            const { data: rData = null } = response;
            return rData;
          })
          .catch((error) => {
            console.log(error);
            return { data: null };
          });
        if (!unmounted) {
          setLoading(false);
          const { status: respStatus, data: rData } = responseData;
          if (respStatus) {
            const {
              category,
              content,
              featuredImage: rFeaturedImage,
              featuredImageDetails: rFeaturedImageDetails,
              highlight,
              highlightOrder,
              label,
              permalink,
              status: rStatus,
              teaser,
              _id: rId,
            } = rData;
            const data = {
              category: prepareCategoriesOutput(category),
              content,
              highlight,
              highlightOrder,
              label,
              permalink,
              status: rStatus,
              teaser,
              _id: rId,
            };
            setArticleLabel(label);
            setFormdata(data);
            prevFeaturedImage.current = rFeaturedImage;
            setFeaturedImage(rFeaturedImage);
            setFeaturedImageDetails(rFeaturedImageDetails);
            setStatus(rStatus);
          }
        }
      }
    };
    if (loading) {
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading, _id, categoryOptions]);

  useEffect(() => {
    if (!loading && prevId.current !== _id) {
      prevId.current = _id;
      setLoading(true);
      setFormdata(defaultForm);
    }
  }, [_id, loading]);

  const reload = () => {
    setLoading(true);
  };

  const redirectToList = () => {
    navTo('/articles');
  };

  const featuredImageFn = (newId) => {
    setFeaturedImage(newId);
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
    const { length: contentLength } = postData;
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

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const form = { ...formData };
    form[name] = value;
    setFormdata(form);
  };

  const select2Change = (selectedOption, element = null) => {
    if (element !== null) {
      const form = { ...formData };
      form[element] = selectedOption;
      setFormdata(form);
    }
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
    async (e = null) => {
      if (e !== null) {
        e.preventDefault();
      }
      if (!updating) {
        const preparePostCategories = (values) => {
          const newValues = values.map((v) => Number(v.value)) || [];
          return newValues;
        };
        setUpdating(true);
        const postData = { ...formData };
        if (featuredImage !== null) {
          postData.featuredImage = featuredImage;
        }
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
              navTo(`/article/${update.data._id}`);
            } else {
              reload();
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
      }
    },
    [_id, featuredImage, formData, navTo, updating]
  );

  useEffect(() => {
    if (featuredImage !== null && prevFeaturedImage.current !== featuredImage) {
      formSubmit();
    }
  }, [featuredImage, formSubmit]);

  // render
  let heading = 'Add new article';
  if (_id !== 'new') {
    heading = articleLabel;
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
      <Suspense fallback={null}>
        <DeleteModal
          _id={_id}
          label={articleLabel}
          path="article"
          params={{ _id }}
          visible={deleteModalVisible}
          toggle={toggleDeleteModal}
          update={redirectToList}
        />
      </Suspense>
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

    const errorContainerClass = stateError.visible ? '' : ' hidden';
    const errorContainer = (
      <div className={`error-container${errorContainerClass}`}>
        {stateError.text}
      </div>
    );

    let featuredImgBlock = [];
    if (_id !== 'new') {
      featuredImgBlock = (
        <FormGroup>
          <div>
            <Label>Featured Image</Label>
          </div>
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
                <Suspense fallback={renderLoader()}>
                  <Editor
                    element="teaser"
                    init={teaserEditorSettings}
                    value={formData.teaser}
                    onEditorChange={handleEditorChange}
                    plugins={teaserEditorPlugins}
                    toolbar={teaserEditorToolbar}
                  />
                </Suspense>
              </FormGroup>
              <FormGroup>
                <Label>Content</Label>
                <Suspense fallback={renderLoader()}>
                  <Editor
                    element="content"
                    init={contentEditorSettings}
                    value={formData.content}
                    onEditorChange={handleEditorChange}
                    plugins={contentEditorPlugins}
                    toolbar={contentEditorToolbar}
                  />
                </Suspense>
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
        <Suspense fallback={[]}>
          <ArticleImageBrowser
            modal={featuredModal}
            toggle={toggleFeatured}
            featuredImgFn={featuredImageFn}
            reload={imagesReload}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div>
      <Suspense fallback={null}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <div className="row">
        <div className="col-12">
          <h2>{heading}</h2>
        </div>
      </div>
      {content}
    </div>
  );
}
