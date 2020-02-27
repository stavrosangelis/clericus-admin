import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, CardBody, CardFooter,
  Button, ButtonGroup,
  Form, FormGroup, Label, Input,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Spinner,
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import axios from 'axios';
import {Redirect} from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import ArticleImageBrowser from '../components/article-image-browser.js';

const APIPath = process.env.REACT_APP_APIPATH;

const Article = props => {
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState(false);
  const [reload, setReload] = useState(false);
  const [status, setStatus] = useState("private");
  const [updating, setUpdating] = useState(false);
  const [updateBtn, setUpdateBtn] = useState(<span><i className="fa fa-save" /> Update</span>);
  const [error, setError] = useState({visible:false, text: []});
  let defaultForm = {
    _id: null,
    label: "",
    category: 0,
    teaser: "",
    content: "",
    status: "private",
  }
  const [formData, setFormdata] = useState(defaultForm);
  const [newId, setNewId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagesReload, setImagesReload] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [featuredModal, setFeaturedModal] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImageDetails, setFeaturedImageDetails] = useState(null);
  const toggleFeatured = () => setFeaturedModal(!featuredModal);

  const toggleDeleteModal = () => {
    setDeleteModalVisible(!deleteModalVisible);
  }

  const [categories, setCategories] = useState([]);

  const loadCategories = useCallback(async()=> {
    const loadData = async()=> {
      let url = APIPath+'article-categories';
      let responseData = await axios({
        method: 'get',
        url: url,
        crossDomain: true
      })
  	  .then(function (response) {
        return response.data.data;
  	  })
  	  .catch(function (error) {
  	  });
      return responseData;
    }
    let newData = await loadData();
    setCategories(newData);
  },[]);

  useEffect(()=> {
    const load = async() => {
      let _id = props.match.params._id;
      setLoading(false);
      if (_id==="new") {
        return false;
      }
      else {
        let params = {_id: _id};
        let responseData = await axios({
          method: 'get',
          url: APIPath+'article',
          crossDomain: true,
          params: params
        })
        .then(function (response) {
          return response.data.data;
        })
        .catch(function (error) {
        });
        let data = {
          _id: responseData._id,
          label: responseData.label,
          category: responseData.category,
          teaser: responseData.teaser,
          content: responseData.content,
          status: responseData.status,
        }
        setFormdata(data);
        setFeaturedImage(responseData.featuredImage);
        setFeaturedImageDetails(responseData.featuredImageDetails);
        setStatus(data.status);
      }
    }
    if (loading) {
      loadCategories();
      load();
    }
  },[loading,props.match.params._id,loadCategories]);

  useEffect(()=>{
    if (redirect) {
      setRedirect(false);
    }
  },[redirect]);

  useEffect(()=>{
    if (reload) {
      setReload(false);
    }
  },[reload]);

  const featuredImageFn = (_id) => {
    setFeaturedImage(_id);
  }

  const removeFeatureImage = () => {
    setFeaturedImage(null);
    setFeaturedImageDetails(null);
  }

  const uploadFile = async(file)=> {
    if (uploading) {
      return false;
    }
    setUploading(true);
    let url = APIPath+"upload-file";
    let postData = new FormData();
    postData.append("file",file.blob(), file.filename());
    let contentLength = postData.length;
    let responseData = await axios({
      method: "post",
      url: url,
      data: postData,
      crossDomain: true,
      config: {
        headers: {
          'Content-Length': contentLength,
          'Content-Type': 'multipart/form-data'
        }
      }
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (response) {
        console.log(response);
    });
    setUploading(false);
    return responseData;
  }

  const deleteItem = async() => {
    let _id = props.match.params._id;
    let data = {_id: _id};
    let responseData = await axios({
      method: 'delete',
      url: APIPath+'article',
      crossDomain: true,
      data: data
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
    if (responseData.status) {
      setRedirect(true);
    }
  }

  const handleChange = (e)=> {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    let form = Object.assign({},formData);
    form[name] = value;
    setFormdata(form);
  }

  const updateStatus = (value) => {
    let form = Object.assign({},formData);
    form.status = value;
    setStatus(value);
    setFormdata(form);
  }

  const handleEditorChange = (value, name)=> {
    let form = Object.assign({},formData);
    form[name] = value;
    setFormdata(form);
  }

  const formSubmit = async(e) => {
    if (typeof e!=="undefined") {
      e.preventDefault();
    }
    if (updating) {
      return false;
    }
    setUpdating(true);
    let postData = Object.assign({}, formData);
    if (featuredImage!==null) {
      postData.featuredImage = featuredImage;
    }
    let _id = props.match.params._id;
    if (_id!=="new") {
      postData._id = _id;
    }
    else {
      delete postData._id;
    }
    let isValid = validateForm(postData);
    if (isValid) {
      let update = await axios({
        method: 'put',
        url: APIPath+'article',
        crossDomain: true,
        data: postData
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error)
      });
      setUpdating(false);
      if (update.status) {
        setUpdateBtn(<span><i className="fa fa-save" /> Update success <i className="fa fa-check" /></span>);
        if (_id==="new") {
          setNewId(update.data._id);
          setReload(true);
        }
        else {
          setLoading(true)
        }
      }
      else {
        let errorText = [];
        for (let i=0; i<update.errors.length; i++) {
          let error = update.errors[i];
          errorText.push(<div key={i}>{error.msg}</div>)
        }
        setError({
          visible: true,
          text: errorText
        });
        setUpdateBtn(<span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>);
      }
      setTimeout(function() {
        setUpdateBtn(<span><i className="fa fa-save" /> Update</span>);
      },2000);
    }
  }

  const validateForm = (postData) => {
    if (postData.label.length<2) {
      setUpdating(false);
      setError({visible:true, text: <div>The articles's <b>Label</b> must contain at least two (2) characters</div>});
      setUpdateBtn(<span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>);
      return false;
    }
    else {
      setError({visible:false, text: []});
      setUpdateBtn(<span><i className="fa fa-save" /> <i>Saving...</i> <Spinner color="info" size="sm"/></span>);
      return true;
    }
  }

  // render
  let heading = "Article";
  if (props.match.params._id==="new") {
    heading = "Add new article";
  }
  let breadcrumbsItems = [
    {label: "Articles", icon: "pe-7s-news-paper", active: false, path: "/articles"},
    {label: heading, icon: "", active: true, path: ""}
  ];

  let content = <div className="row">
      <div className="col-12">
        <div style={{padding: '40pt',textAlign: 'center'}}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>;

  let redirectElem = [];
  if (redirect) {
    redirectElem = <Redirect to="/articles" />;
  }
  if (reload) {
    redirectElem = <Redirect to={`/article/${newId}`} />;
  }

  if (!loading) {
    let statusPublic = "secondary";
    let statusPrivate = "secondary";
    let publicOutline = true;
    let privateOutline = false;
    if (status==="public") {
      statusPublic = "success";
      publicOutline = false;
      privateOutline = true;
    }

    let teaserEditorSettings = {
      height: 150,
      menubar:false,
      branding:false,
      statusbar:false,
    }
    let teaserEditorPlugins = [
      'link code'
    ];
    let teaserEditorToolbar = [
      'cut copy paste | undo redo | bold underline italic removeformat | link unlink | code',
    ];

    let contentEditor = null;
    let contentEditorSettings = {
      setup: editor => {
        contentEditor = editor;
      },
      height: 300,
      menubar:false,
      branding:false,
      statusbar:false,
      image_title: true,
      automatic_uploads: true,
      file_picker_types: 'image',
      file_picker_callback: function(cb, value, meta) {
        var input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.onchange = function() {
          var file = this.files[0];
          var reader = new FileReader();
          reader.onload = function () {
            var id = 'blobid' + (new Date()).getTime();
            var blobCache = contentEditor.editorUpload.blobCache;
            var base64 = reader.result.split(',')[1];
            var blobInfo = blobCache.create(id, file, base64);
            blobCache.add(blobInfo);

            // call the callback and populate the Title field with the file name
            cb(blobInfo.blobUri(), { title: file.name });
          };
          reader.readAsDataURL(file);
        };
        input.click();
      },
      images_upload_handler: async function (blobInfo, success, failure) {
        let upload = await uploadFile(blobInfo);
        if (upload.status) {
          let fullsizePath = upload.data.paths.find(p=>p.pathType==="source").path;
          success(fullsizePath);
          setImagesReload(true);
          setImagesReload(false);
        }
        else {
          failure(upload.msg);
        }
      }
    }
    let contentEditorPlugins = [
      'link image media table visualblocks lists code'
    ];
    let contentEditorToolbar = [
      'cut copy paste | styleselect | bullist numlist outdent indent | table image media',
      'undo redo | bold underline italic removeformat | alignleft aligncenter alignright | link unlink | code',
    ];

    let deleteModal = <Modal isOpen={deleteModalVisible} toggle={toggleDeleteModal}>
      <ModalHeader toggle={toggleDeleteModal}>Delete "{formData.label}"</ModalHeader>
      <ModalBody>The article "{formData.label}" will be deleted. Continue?</ModalBody>
      <ModalFooter className="text-left">
        <Button className="pull-right" color="danger" size="sm" outline onClick={deleteItem}><i className="fa fa-trash-o" /> Delete</Button>
        <Button color="secondary" size="sm" onClick={toggleDeleteModal}>Cancel</Button>
      </ModalFooter>
    </Modal>;

    let featuredImageHMTL = [];
    if (featuredImageDetails!==null) {
      let thumbPath = featuredImageDetails.paths.find(p=>p.pathType==="thumbnail");
      let fullPath = featuredImageDetails.paths.find(p=>p.pathType==="source");
      if (typeof thumbPath!=="undefined") {
        thumbPath = thumbPath.path;
        featuredImageHMTL = <div className="featured-image-container">
          <a href={fullPath.path} target="_blank" rel="noopener noreferrer" key={0} className="show-featured-image btn btn-outline-primary"><i className="fa fa-eye" /></a>
          <img src={thumbPath} className="featured-image img-thumbnail img-fluid" alt="" />
          <Button outline color="danger" size="sm" onClick={()=>removeFeatureImage()} key={1} className="remove-featured-image"><i className="fa fa-trash-o" /></Button>
        </div>;
      }

    }

    let errorContainerClass = " hidden";
    if (error.visible) {
      errorContainerClass = "";
    }
    let errorContainer = <div className={"error-container"+errorContainerClass}>{error.text}</div>

    let categoryOptionItems = [<option value="0" key={0}>-- Select category --</option>];

    for (let i=0; i<categories.length; i++) {
      let category = categories[i];
      let options = categoryOptions(category, "");
      categoryOptionItems = [...categoryOptionItems, ...options];
    }

    function categoryOptions(category, sep="") {
      let options = [<option value={category._id} key={category._id}>{sep} {category.label}</option>];
      if (category.children.length>0) {
        for (let j=0;j<category.children.length; j++) {
          sep +="-";
          let child = category.children[j];
          options.push(categoryOptions(child, sep));
        }
      }
      return options;
    }

    content = <div className="items-container">
      <Card>
        <CardBody>
          <Form onSubmit={formSubmit}>
            <div className="text-right">
              <ButtonGroup>
                <Button size="sm" outline={publicOutline} color={statusPublic} onClick={()=>updateStatus("public")}>Public</Button>
                <Button size="sm" outline={privateOutline} color={statusPrivate} onClick={()=>updateStatus("private")}>Private</Button>
              </ButtonGroup>
            </div>
            <div className="row">
              <div className="col-xs-12 col-sm-6">
                {errorContainer}
                <FormGroup>
                  <Label>Label</Label>
                  <Input type="text" name="label" placeholder="The label of the article..." value={formData.label} onChange={handleChange}/>
                </FormGroup>
                <FormGroup>
                  <Label>Category</Label>
                  <Input type="select" name="category" value={formData.category} onChange={handleChange}>
                    {categoryOptionItems}
                  </Input>
                </FormGroup>
              </div>
              <div className="col-xs-12 col-sm-6">
                <FormGroup>
                  <Label>Featured Image</Label>
                  {featuredImageHMTL}
                  <Button type="button" onClick={toggleFeatured} size="sm" style={{display: "block"}}>Select new image</Button>
                </FormGroup>
              </div>
            </div>
            <FormGroup>
              <Label>Teaser</Label>
              <Editor
                init={teaserEditorSettings}
                value={formData.teaser}
                onEditorChange={(e)=>handleEditorChange(e,"teaser")}
                plugins={teaserEditorPlugins}
                toolbar={teaserEditorToolbar}
                />
            </FormGroup>
            <FormGroup>
              <Label>Content</Label>
              <Editor
                init={contentEditorSettings}
                value={formData.content}
                onEditorChange={(e)=>handleEditorChange(e,"content")}
                plugins={contentEditorPlugins}
                toolbar={contentEditorToolbar}
                />
            </FormGroup>
          </Form>
        </CardBody>
        <CardFooter>
          <Button color="danger" onClick={toggleDeleteModal} outline type="button" size="sm"><i className="fa fa-trash-o" /> Delete</Button>
          <Button color="primary" outline type="submit" size="sm" onClick={formSubmit} className="pull-right">{updateBtn}</Button>
        </CardFooter>
      </Card>
      {deleteModal}
      <ArticleImageBrowser modal={featuredModal} toggle={toggleFeatured} featuredImgFn={featuredImageFn} reload={imagesReload}/>
    </div>
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
}

export default Article;
