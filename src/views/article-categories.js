import React, { useEffect, useState, useCallback } from "react";
import axios from 'axios';
import {
  Card, CardBody,
  Button, ButtonGroup,
  Form, FormGroup, Label, Input,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Spinner
} from "reactstrap";

import ArticleCategoriesItems from '../components/article-categories-block';
import {Breadcrumbs} from '../components/breadcrumbs';
const APIPath = process.env.REACT_APP_APIPATH;

const ArticleCategories = props => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateBtn, setUpdateBtn] = useState(<span><i className="fa fa-save" /> Update</span>);
  const [status, setStatus] = useState("private");
  const [error, setError] = useState({visible:false, text: []});
  let defaultForm = {
    _id: null,
    label: "",
    parentId: 0,
    status: "private"
  }
  const [itemForm, setItemForm] = useState(defaultForm);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const formSubmit = async (e)=> {
    e.preventDefault();
    if (updating) {
      return false;
    }
    setUpdating(true);
    setUpdateBtn(<span><i className="fa fa-save" /> <i>Saving...</i> <Spinner color="info" size="sm"/></span>);
    let postData = Object.assign({},itemForm);
    let isValid = itemValidate(postData);
    if (!isValid) {
      return false;
    }
    let updateData = await axios({
        method: 'put',
        url: APIPath+'article-category',
        crossDomain: true,
        data: postData
      })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
    if (updateData.status) {
      setUpdating(false);
      setUpdateBtn(<span><i className="fa fa-save" /> Update success <i className="fa fa-check" /></span>);
      setLoading(true);
      loadItem(updateData.data._id);

      setTimeout(function() {
        setUpdateBtn(<span><i className="fa fa-save" /> Update</span>);
      },2000);
    }
  }

  const itemValidate = (postData) => {
    if (postData.label==="") {
      setUpdating(false);
      setError({visible: true, text: <div>Please enter the <b>Label</b> to continue!</div>});
      setUpdateBtn(<span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>);
      return false;
    }
    else {
      setError({visible:false, text: []});
    }
    return true;
  }

  const deleteItem = async() => {
    let _id = itemForm._id;
    let data = {_id: _id};
    let responseData = await axios({
      method: 'delete',
      url: APIPath+'article-category',
      crossDomain: true,
      data: data
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
    if (responseData.status) {
      setDeleteModalVisible(false);
      setItemModalVisible(false);
      setLoading(true);
    }
  }

  const handleChange = (e) => {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    let form = Object.assign({},itemForm);
    form[name] = value;
    setItemForm(form);
  }

  const updateStatus = (value) => {
    let form = Object.assign({},itemForm);
    form.status = value;
    setStatus(value);
    setItemForm(form);
  }

  const loadItem = async(_id) => {
    if (_id===null) {
      let newForm = {
        _id: null,
        label: "",
        parentId: 0,
        status: "private"
      }
      setItemForm(newForm);
      setItem(null);
    }
    else {
      let url = APIPath+'article-category';
      let responseData = await axios({
        method: 'get',
        url: url,
        crossDomain: true,
        params: {_id: _id}
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      let newForm = {
        _id: responseData._id,
        label: responseData.label,
        parentId: responseData.parentId,
        status: responseData.status
      }
      setItemForm(newForm);
      setItem(responseData);
      setStatus(responseData.status);
    }
    setItemModalVisible(true);
  }

  // load categories
  const loadItems = useCallback(async()=> {
    const loadData = async()=> {
      let url = APIPath+'article-categories';
      setLoading(false);
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
    // add open toggle to menu items
    let newItems = newData.map(item=>{
      return newItem(item);
    });

    setItems(newItems);
    function newItem(item) {
      item.open = true;
      if (item.children.length>0) {
        let children = item.children.map((child, i)=>{
          return newItem(child);
        });
        item.children = children;
      }
      return item;
    }
  },[]);

  useEffect(()=> {
    if (loading) {
      loadItems();
    }
  }, [loading, loadItems]);

  const toggleItemModal = () => {
    setItemModalVisible(!itemModalVisible);
  }

  const toggleDeleteModal = () => {
    setDeleteModalVisible(!deleteModalVisible);
  }

  let heading = "Article categories";
  let breadcrumbsItems = [
    {label: heading, icon: "fa fa-list", active: true, path: ""},
  ];

  let content = <div>
    <div className="row">
      <div className="col-12">
        <div style={{padding: '40pt',textAlign: 'center'}}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
  </div>
  let errorContainerClass = " hidden";
  if (error.visible) {
    errorContainerClass = "";
  }
  let errorContainer = <div className={"error-container"+errorContainerClass}>{error.text}</div>;
  let itemsHTML = [];
  if (items.length>0) {
    itemsHTML = <ArticleCategoriesItems
      items={items}
      toggle={loadItem} />
  }

  let statusPublic = "secondary";
  let statusPrivate = "secondary";
  let publicOutline = true;
  let privateOutline = false;
  if (status==="public") {
    statusPublic = "success";
    publicOutline = false;
    privateOutline = true;
  }

  let parentIdOptions = [
    <option value="0" key={0}>-- Select parent --</option>
  ];

  for (let i=0; i<items.length; i++) {
    let item = items[i];
    let options = parentOptions(item, "");
    parentIdOptions = [...parentIdOptions, ...options];
  }

  function parentOptions(item, sep="") {
    let options = [];
    if (item._id!==itemForm._id) {
      options.push(<option value={item._id} key={item._id}>{sep} {item.label}</option>);
    }
    if (item.children.length>0) {
      sep +="-";
      for (let j=0;j<item.children.length; j++) {
        let child = item.children[j];
        options.push(parentOptions(child, sep));
      }
    }
    return options;
  }

  let itemModalTitle = "Add new article category";
  if (item!==null) {
    itemModalTitle = "Edit article category";
  }
  let itemModal = <Modal isOpen={itemModalVisible} toggle={toggleItemModal}>
      <ModalHeader toggle={toggleItemModal}>{itemModalTitle}</ModalHeader>
      <ModalBody>
        <Form onSubmit={formSubmit}>
          <div className="text-right">
            <ButtonGroup>
              <Button size="sm" outline={publicOutline} color={statusPublic} onClick={()=>updateStatus("public")}>Public</Button>
              <Button size="sm" outline={privateOutline} color={statusPrivate} onClick={()=>updateStatus("private")}>Private</Button>
            </ButtonGroup>
          </div>
          <div className="row">
            <div className="col-12">
              {errorContainer}
              <FormGroup>
                <Label>Label</Label>
                <Input type="text" name="label" placeholder="The label of the article category..." value={itemForm.label} onChange={handleChange}/>
              </FormGroup>
              <FormGroup>
                <Label>Parent</Label>

                <Input type="select" name="parentId" value={itemForm.parentId} onChange={handleChange}>
                  {parentIdOptions}
                </Input>
              </FormGroup>
            </div>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={toggleDeleteModal} outline type="button" size="sm" className="pull-left"><i className="fa fa-trash-o" /> Delete</Button>
        <Button color="primary" outline type="submit" size="sm" onClick={formSubmit}>{updateBtn}</Button>
      </ModalFooter>
    </Modal>

  let deleteModal = <Modal isOpen={deleteModalVisible} toggle={toggleDeleteModal}>
    <ModalHeader toggle={toggleDeleteModal}>Delete "{itemForm.label}"</ModalHeader>
    <ModalBody>The article category"{itemForm.label}" will be deleted. Continue?</ModalBody>
    <ModalFooter className="text-left">
      <Button className="pull-right" color="danger" size="sm" outline onClick={deleteItem}><i className="fa fa-trash-o" /> Delete</Button>
      <Button color="secondary" size="sm" onClick={toggleDeleteModal}>Cancel</Button>
    </ModalFooter>
  </Modal>;

  if (!loading) {
    content = <div>
      <div className="row">
        <div className="col-12">
          <Card>
            <CardBody>
              {itemsHTML}
              <Button type="button" size="sm" color="info" className="pull-right" outline onClick={()=>loadItem(null)}>Add new <i className=" fa fa-plus"/></Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  }
  return (
    <div>
      <Breadcrumbs items={breadcrumbsItems} />
      <div className="row">
        <div className="col-12">
          <h2>{heading}</h2>
        </div>
      </div>
      {content}
      {itemModal}
      {deleteModal}
    </div>
  )

}
export default ArticleCategories;
