import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Card, CardBody, CardHeader,
  Form, FormGroup, Label, Input,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Spinner,
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import MenuItems from '../components/menu-items-block';

import axios from 'axios';

const APIPath = process.env.REACT_APP_APIPATH;

const Menu = (props) => {
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState([]);
  const [menu, setMenu] = useState(null);
  const defaultMenuForm = {
    _id: null,
    label: "",
    templatePosition: "top",
  }
  const [menuForm, setMenuForm] = useState(defaultMenuForm);
  const [menuId, setMenuId] = useState(null);
  const [menuError, setMenuError] = useState([]);
  const [menuErrorVisible, setMenuErrorVisible] = useState(false);
  const [menuUpdating, setMenuUpdating] = useState(false);
  const [menuUpdateBtn, setMenuUpdateBtn] = useState(<span><i className="fa fa-save" /> Update</span>);

  const [loadingArticles, setLoadingArticles] = useState(true);
  const [articles, setArticles] = useState([]);
  const [loadingArticleCategories, setLoadingArticleCategories] = useState(true);
  const [articleCategories, setArticleCategories] = useState([]);

  const menuFormSubmit = async (e)=> {
    e.preventDefault();
    if (menuUpdating) {
      return false;
    }
    setMenuUpdating(true);
    setMenuUpdateBtn(<span><i className="fa fa-save" /> <i>Saving...</i> <Spinner color="info" size="sm"/></span>);
    let postData = Object.assign({},menuForm);
    let isValid = menuValidate(postData);
    if (!isValid) {
      return false;
    }
    let updateData = await axios({
        method: 'put',
        url: APIPath+'menu',
        crossDomain: true,
        data: postData
      })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
    if (updateData.status) {
      setMenuUpdating(false);
      setMenuUpdateBtn(<span><i className="fa fa-save" /> Update success <i className="fa fa-check" /></span>);
      setLoading(true);

      setTimeout(function() {
        setMenuUpdateBtn(<span><i className="fa fa-save" /> Update</span>);
      },2000);
    }
  }

  const menuValidate = (postData) => {
    if (postData.label==="") {
      setMenuUpdating(false);
      setMenuErrorVisible(true);
      setMenuError(<div>Please enter the <b>Label</b> to continue!</div>);
      setMenuUpdateBtn(<span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>);
      return false;
    }
    else {
      setMenuErrorVisible(false);
      setMenuError([]);
    }
    return true;
  }

  const handleMenuChange = (e) => {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    let form = Object.assign({},menuForm);
    form[name] = value;
    setMenuForm(form);
  }

  // load menus on page load
  useEffect(()=> {
    const load = async()=> {
      let url = APIPath+'menus';
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: url,
        crossDomain: true
      })
  	  .then(function (response) {
        return response.data.data.data;
  	  })
  	  .catch(function (error) {
  	  });

      setMenus(responseData);
      setMenuId(responseData[0]._id);
    }
    if (loading) {
      load();
    }
  }, [loading]);

  // load articles list
  useEffect(()=> {
    const load = async()=> {
      let url = APIPath+'articles-list';
      setLoadingArticles(false);
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
      setArticles(responseData);
    }
    if (loadingArticles) {
      load();
    }
  }, [loadingArticles]);

  // load article categories list
  useEffect(()=> {
    const load = async()=> {
      let url = APIPath+'article-categories';
      setLoadingArticleCategories(false);
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
      setArticleCategories(responseData);
    }
    if (loadingArticleCategories) {
      load();
    }
  }, [loadingArticleCategories]);

  // load menu on menu id change
  const loadMenu = useCallback(async()=> {
    const menuData = async()=> {
      let url = APIPath+'menu';
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: url,
        crossDomain: true,
        params: {_id: menuId}
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      return responseData;
    }
    let newData = await menuData();

    // add open toggle to menu items
    let newItems = newData.menuItems.map(item=>{
      return newItem(item);
    });

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
    newData.menuItems = newItems;
    setMenu(newData);
    let menuForm = {
      _id: newData._id,
      label: newData.label,
      templatePosition: newData.templatePosition,
    };
    setMenuForm(menuForm);
  }, [menuId]);

  useEffect(()=>{
    if(menuId!==null) {
      loadMenu(menuId);
    }
    else {
      let menuForm = {
        _id: null,
        label: "",
        templatePosition: "top",
      };
      setMenuForm(menuForm);
    }
  },[menuId,loadMenu]);

  // menu items
  const defaultMenuItemForm = {
    _id: null,
    menuId: "",
    label: "",
    order: 0,
    parentId: 0,
    type: "link",
    objectId: 0,
    link: "",
    target: "",
    status: "private",
  }
  const [menuItemForm, setMenuItemForm] = useState(defaultMenuItemForm);
  const [menuItemModal, setMenuItemModal] = useState(false);
  const [menuItem, setMenuItem] = useState(null);
  const [menuItemId, setMenuItemId] = useState(null);
  const [menuItemError, setMenuItemError] = useState([]);
  const [menuItemErrorVisible, setMenuItemErrorVisible] = useState(false);
  const [menuItemUpdating, setMenuItemUpdating] = useState(false);
  const [menuItemUpdateBtn, setMenuItemUpdateBtn] = useState(<span><i className="fa fa-save" /> Update</span>);

  const toggleMenuItemModal = (_id=null) => {
    setMenuItemId(_id);
    setMenuItemModal(!menuItemModal);
  }

  const menuItemFormSubmit = async (e)=> {
    e.preventDefault();
    if (menuItemUpdating) {
      return false;
    }
    setMenuItemUpdating(true);
    setMenuItemUpdateBtn(<span><i className="fa fa-save" /> <i>Saving...</i> <Spinner color="info" size="sm"/></span>);
    // normalize type
    if (menuItemForm.type==="link") {
      menuItemForm.objectId = 0;
    }
    delete menuItemForm.articleId;
    delete menuItemForm.categoryId;
    let postData = Object.assign({},menuItemForm);
    let isValid = menuItemValidate(postData);
    if (!isValid) {
      return false;
    }
    let updateData = await axios({
        method: 'put',
        url: APIPath+'menu-item',
        crossDomain: true,
        data: postData
      })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
    if (updateData.status) {
      setMenuItemUpdating(false);
      setMenuItemUpdateBtn(<span><i className="fa fa-save" /> Update success <i className="fa fa-check" /></span>);
      let curMenuId = menuId;
      setMenuId(null);
      setMenuId(curMenuId);
      setTimeout(function() {
        setMenuItemUpdateBtn(<span><i className="fa fa-save" /> Update</span>);
      },2000);
    }
  }

  const menuItemValidate = (postData) => {
    if (postData.label==="") {
      setMenuItemUpdating(false);
      setMenuItemErrorVisible(true);
      setMenuItemError(<div>Please enter the <b>Label</b> to continue!</div>);
      setMenuItemUpdateBtn(<span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>);
      return false;
    }
    else {
      setMenuItemErrorVisible(false);
      setMenuItemError([]);
    }
    return true;
  }

  const handleMenuItemTypeChange = (e, type) => {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let link = "";
    if (type==="article") {
      let article = articles.find(a=>a._id===value);
      if (typeof article!=="undefined") {
        link = article.permalink;
      }
    }
    if (type==="article-category") {
      let articleCategory = articleCategories.find(a=>a._id===value);
      if (typeof articleCategory!=="undefined") {
        link = articleCategory.permalink;
      }
    }
    let form = Object.assign({},menuItemForm);
    form.objectId = value;
    form.link = link;
    setMenuItemForm(form);
  }

  const handleMenuItemChange = (e) => {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    let form = Object.assign({},menuItemForm);
    form[name] = value;
    setMenuItemForm(form);
  }

  // load menu on menu id change
  const loadMenuItem = useCallback(async()=> {
    const menuItemData = async()=> {
      let url = APIPath+'menu-item';
      let responseData = await axios({
        method: 'get',
        url: url,
        crossDomain: true,
        params: {_id: menuItemId}
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      return responseData;
    }
    let newData = await menuItemData();
    setMenuItem(newData);
    let menuItemForm = {
      _id: newData._id,
      menuId: newData.menuId,
      label: newData.label,
      order: newData.order,
      parentId: newData.parentId,
      type: newData.type,
      objectId: newData.objectId,
      link: newData.link,
      target: newData.target,
      status: newData.status,
    };
    setMenuItemForm(menuItemForm);
  }, [menuItemId]);

  useEffect(()=>{
    if(menuItemId!==null) {
      loadMenuItem(menuItemId);
    }
    else {
      let menuItemForm = {
        _id: null,
        menuId: menuId,
        label: "",
        order: 0,
        parentId: 0,
        type: "link",
        objectId: 0,
        link: "",
        target: "",
        status: "private",
      };
      setMenuItemForm(menuItemForm);
    }
  },[menuItemId,loadMenuItem,menuId]);

  // render
  let heading = "Menu";
  let breadcrumbsItems = [
    {label: heading, icon: "pe-7s-menu", active: true, path: ""}
  ];

  let menusOutput = menus.map((menu, i)=> {
    return <Button className="taxonomy-btn" key={i} color="secondary" outline onClick={()=>setMenuId(menu._id)}>{menu.label}</Button>
  });

  let menuErrorClass = " hidden";
  if (menuErrorVisible) {
    menuErrorClass = "";
  }
  let menuErrorHTML = <div className={"error-container"+menuErrorClass}>{menuError}</div>

  let menuItems = [];
  if (menu!==null && menu.menuItems.length>0) {
    menuItems = <MenuItems
    items={menu.menuItems}
    toggle={toggleMenuItemModal} />
  }
  let menuItemModalTitle = "Add new menu item";
  if (menuItem!==null) {
    menuItemModalTitle = `Edit menu item "${menuItem.label}"`;
  }
  let menuItemErrorClass = " hidden";
  if (menuItemErrorVisible) {
    menuItemErrorClass = "";
  }
  let menuSelection = menus.map((m,i)=><option value={m._id} key={i}>{m.label}</option>);
  let menuItemErrorHTML = <div className={"error-container"+menuItemErrorClass}>{menuItemError}</div>

  let articleVisible = "hidden";
  let categoryVisible = "hidden";
  let linkVisible = "hidden";
  if (menuItemForm.type==="article") {
    articleVisible = "";
  }
  if (menuItemForm.type==="category") {
    categoryVisible = "";
  }
  if (menuItemForm.type==="link") {
    linkVisible = "";
  }
  let menuItemsOptions = [];
  if (menu !==null) {
    menuItemsOptions = menu.menuItems.map(item=>menuItemsOption(item));

    function menuItemsOption(item, sep="") {
      if (item.parentId>0) {
        sep = sep+"-";
      }

      let options = [];
      options.push(<option value={item._id} key={item._id}>{sep} {item.label}</option>);
      if (item.children.length>0) {
        let children = item.children.map(child=>{
          return menuItemsOption(child, sep);
        });
        for (let key in children) {
          let child = children[key];
          options.push(child)
        }

      }
      return options;
    }
  }

  // articles options list
  let articlesOptionsHTML = articles.map((article,i)=>{
    return <option value={article._id} link={article.permalink} key={i}>{article.label}</option>;
  })

  // article categories options list
  let articleCategoriesOptionsHTML = [
    <option value="0" key={0}>-- Select category --</option>
  ];

  for (let i=0; i<articleCategories.length; i++) {
    let articleCategory = articleCategories[i];
    let options = articleCategoriesOptions(articleCategory, "");
    articleCategoriesOptionsHTML = [...articleCategoriesOptionsHTML, ...options];
  }

  function articleCategoriesOptions(item, sep="") {
    let options = [<option value={item._id} link={item.permalink} key={item._id}>{sep} {item.label}</option>];
    if (item.children.length>0) {
      for (let j=0;j<item.children.length; j++) {
        sep +="-";
        let child = item.children[j];
        options.push(articleCategoriesOptions(child, sep));
      }
    }
    return options;
  }

  let menuItemModalHTML = <Modal isOpen={menuItemModal} toggle={()=>toggleMenuItemModal(null)}>
    <ModalHeader toggle={()=>toggleMenuItemModal(null)}>{menuItemModalTitle}</ModalHeader>
    <ModalBody>
      {menuItemErrorHTML}
      <Form onSubmit={menuItemFormSubmit}>
        <FormGroup>
          <Label>Label</Label>
          <Input type="text" name="label" placeholder="Label..." value={menuItemForm.label} onChange={handleMenuItemChange}/>
        </FormGroup>
        <FormGroup>
          <Label>Menu</Label>
          <Input type="select" name="menuId" value={menuItemForm.menuId} onChange={handleMenuItemChange}>
            {menuSelection}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label>Order</Label>
          <Input type="number" name="order" placeholder="0" size="3" value={menuItemForm.order} onChange={handleMenuItemChange}/>
        </FormGroup>
        <FormGroup>
          <Label>Parent Id</Label>
          <Input type="select" name="parentId" value={menuItemForm.parentId} onChange={handleMenuItemChange}>
            <option value="0">-- Root --</option>
            {menuItemsOptions}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label>Type</Label>
          <Input type="select" name="type" value={menuItemForm.type} onChange={handleMenuItemChange}>
            <option value="link">Link</option>
            <option value="article">Article</option>
            <option value="category">Article Category</option>
          </Input>
        </FormGroup>
        <FormGroup className={articleVisible}>
          <Label>Article</Label>
          <Input type="select" name="articleId" value={menuItemForm.articleId} onChange={(e)=>handleMenuItemTypeChange(e,"article")}>
            {articlesOptionsHTML}
          </Input>
        </FormGroup>
        <FormGroup className={categoryVisible}>
          <Label>Article Category</Label>
          <Input type="select" name="categoryId" value={menuItemForm.categoryId} onChange={(e)=>handleMenuItemTypeChange(e,"article-category")}>
            {articleCategoriesOptionsHTML}
          </Input>
        </FormGroup>
        <FormGroup className={linkVisible}>
          <Label>Link</Label>
          <Input type="text" name="link" value={menuItemForm.link} onChange={handleMenuItemChange}/>
        </FormGroup>
        <FormGroup className={linkVisible}>
          <Label>Target</Label>
          <Input type="select" name="target" value={menuItemForm.target} onChange={handleMenuItemChange}>
            <option value="">Same window</option>
            <option value="_blank">New window</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label>Status</Label>
          <Input type="select" name="status" value={menuItemForm.status} onChange={handleMenuItemChange}>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </Input>
        </FormGroup>
      </Form>
    </ModalBody>
    <ModalFooter>
      <Button color="primary" outline size="sm" onClick={menuItemFormSubmit}>{menuItemUpdateBtn}</Button>
      <Button className="pull-left" color="danger" outline size="sm"><i className="fa fa-trash" /> Delete</Button>
    </ModalFooter>
  </Modal>

  let content = <div className="row">
    <div className="col-12">
      <Card>
        <CardHeader>
          {menusOutput} <Button size="sm" className="pull-right" color="info" outline onClick={()=>setMenuId(null)}>Add new <i className="fa fa-plus"/></Button>
        </CardHeader>
        <CardBody>
          <div className="row">
            <div className="col-xs-12 col-sm-6 order-sm-last">
              {menuErrorHTML}
              <Form onSubmit={menuFormSubmit}>
                <FormGroup>
                  <Label>Label</Label>
                  <Input type="text" name="label" placeholder="Label..." value={menuForm.label} onChange={handleMenuChange}/>
                </FormGroup>
                <FormGroup>
                  <Label>Position</Label>
                  <Input type="select" name="templatePosition" placeholder="Template position..." value={menuForm.templatePosition} onChange={handleMenuChange}>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </Input>
                </FormGroup>
              </Form>
              <div className="footer-box">
                <Button color="primary" outline size="sm" onClick={menuFormSubmit}>{menuUpdateBtn}</Button>
                <Button className="pull-left" color="danger" outline size="sm"><i className="fa fa-trash" /> Delete</Button>
              </div>
            </div>
            <div className="col-xs-12 col-sm-6">
              <h5>Menu items</h5>
              <div>
                {menuItems}
              </div>
              <div className={"footer-box"}>
                <Button size="sm" className="pull-right" color="info" outline onClick={()=>toggleMenuItemModal(null)}>Add menu item <i className="fa fa-plus"/></Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
    {menuItemModalHTML}
  </div>



  return (
   <div>
    <Breadcrumbs items={breadcrumbsItems} />
      <div className="row">
        <div className="col-12">
          <h2>{heading}</h2>
        </div>
      </div>
      {content}
   </div>
  )
}

export default Menu;
