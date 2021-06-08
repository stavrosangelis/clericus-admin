import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
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
import Breadcrumbs from '../components/breadcrumbs';
import MenuItems from '../components/menu-items-block';

const APIPath = process.env.REACT_APP_APIPATH;

const Menu = () => {
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState([]);
  const [menu, setMenu] = useState(null);
  const defaultMenuForm = {
    _id: null,
    label: '',
    templatePosition: 'top',
  };
  const [menuForm, setMenuForm] = useState(defaultMenuForm);
  const [menuId, setMenuId] = useState(null);
  const [menuError, setMenuError] = useState([]);
  const [menuErrorVisible, setMenuErrorVisible] = useState(false);
  const [menuUpdating, setMenuUpdating] = useState(false);
  const [menuUpdateBtn, setMenuUpdateBtn] = useState(
    <span>
      <i className="fa fa-save" /> Update
    </span>
  );
  const [deleteMenuModalVisible, setDeleteMenuModalVisible] = useState(false);

  const [loadingArticles, setLoadingArticles] = useState(true);
  const [articles, setArticles] = useState([]);
  const [loadingArticleCategories, setLoadingArticleCategories] = useState(
    true
  );
  const [articleCategories, setArticleCategories] = useState([]);

  const toggleMenuDeleteModal = () => {
    setDeleteMenuModalVisible(!deleteMenuModalVisible);
  };

  const menuValidate = (postData) => {
    if (postData.label === '') {
      setMenuUpdating(false);
      setMenuErrorVisible(true);
      setMenuError(
        <div>
          Please enter the <b>Label</b> to continue!
        </div>
      );
      setMenuUpdateBtn(
        <span>
          <i className="fa fa-save" /> Update error{' '}
          <i className="fa fa-times" />
        </span>
      );
      return false;
    }

    setMenuErrorVisible(false);
    setMenuError([]);

    return true;
  };

  const menuFormSubmit = async (e) => {
    e.preventDefault();
    if (menuUpdating) {
      return false;
    }
    setMenuUpdating(true);
    setMenuUpdateBtn(
      <span>
        <i className="fa fa-save" /> <i>Saving...</i>{' '}
        <Spinner color="info" size="sm" />
      </span>
    );
    const postData = { ...menuForm };
    const isValid = menuValidate(postData);
    if (!isValid) {
      return false;
    }
    const updateData = await axios({
      method: 'put',
      url: `${APIPath}menu`,
      crossDomain: true,
      data: postData,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (updateData.status) {
      setMenuUpdating(false);
      setMenuUpdateBtn(
        <span>
          <i className="fa fa-save" /> Update success{' '}
          <i className="fa fa-check" />
        </span>
      );
      setLoading(true);

      setTimeout(() => {
        setMenuUpdateBtn(
          <span>
            <i className="fa fa-save" /> Update
          </span>
        );
      }, 2000);
    }
    return false;
  };

  const handleMenuChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const form = { ...menuForm };
    form[name] = value;
    setMenuForm(form);
  };

  // load menus on page load
  useEffect(() => {
    const load = async () => {
      const url = `${APIPath}menus`;
      setLoading(false);
      const responseData = await axios({
        method: 'get',
        url,
        crossDomain: true,
      })
        .then((response) => response.data.data.data)
        .catch((error) => {
          console.log(error);
        });

      setMenus(responseData);
      if (responseData.length > 0) {
        setMenuId(responseData[0]._id);
      }
    };
    if (loading) {
      load();
    }
  }, [loading]);

  // load articles list
  useEffect(() => {
    const load = async () => {
      const url = `${APIPath}articles-list`;
      setLoadingArticles(false);
      const responseData = await axios({
        method: 'get',
        url,
        crossDomain: true,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      setArticles(responseData);
    };
    if (loadingArticles) {
      load();
    }
  }, [loadingArticles]);

  // load article categories list
  useEffect(() => {
    const load = async () => {
      const url = `${APIPath}article-categories`;
      setLoadingArticleCategories(false);
      const responseData = await axios({
        method: 'get',
        url,
        crossDomain: true,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      setArticleCategories(responseData);
    };
    if (loadingArticleCategories) {
      load();
    }
  }, [loadingArticleCategories]);

  // load menu on menu id change
  const loadMenu = useCallback(async () => {
    setMenuError([]);
    setMenuErrorVisible(false);
    const menuData = async () => {
      const url = `${APIPath}menu`;
      setLoading(false);
      const responseData = await axios({
        method: 'get',
        url,
        crossDomain: true,
        params: { _id: menuId },
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      return responseData;
    };
    const newData = await menuData();

    const newItem = (item) => {
      const itemCopy = item;
      itemCopy.open = true;
      if (itemCopy.children.length > 0) {
        const children = item.children.map((child) => newItem(child));
        itemCopy.children = children;
      }
      return itemCopy;
    };

    // add open toggle to menu items
    const newItems = newData.menuItems.map((item) => newItem(item));

    newData.menuItems = newItems;
    setMenu(newData);
    const menuFormParams = {
      _id: newData._id,
      label: newData.label,
      templatePosition: newData.templatePosition,
    };
    setMenuForm(menuFormParams);
  }, [menuId]);

  useEffect(() => {
    if (menuId !== null) {
      loadMenu(menuId);
    } else {
      const menuFormParams = {
        _id: null,
        label: '',
        templatePosition: 'top',
      };
      setMenuForm(menuFormParams);
    }
  }, [menuId, loadMenu]);

  // delete menu
  const deleteMenu = async () => {
    if (menuId === null || menuId <= 0) {
      return false;
    }
    const data = { _id: menuId };
    const responseData = await axios({
      method: 'delete',
      url: `${APIPath}menu`,
      crossDomain: true,
      data,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      setMenuError([]);
      setMenuErrorVisible(false);
      setLoading(true);
    } else {
      const errorMsg = responseData.msg;
      const errorText = errorMsg.map((e, i) => {
        const key = `a${i}`;
        return <div key={key}>{e}</div>;
      });
      setMenuErrorVisible(true);
      setMenuError(errorText);
    }
    return false;
  };

  // menu items
  const defaultMenuItemForm = {
    _id: null,
    menuId: '',
    label: '',
    order: 0,
    parentId: 0,
    type: 'link',
    objectId: 0,
    link: '',
    target: '',
    status: 'private',
  };
  const [menuItemForm, setMenuItemForm] = useState(defaultMenuItemForm);
  const [menuItemModal, setMenuItemModal] = useState(false);
  const [menuItem, setMenuItem] = useState(null);
  const [menuItemId, setMenuItemId] = useState(null);
  const [menuItemError, setMenuItemError] = useState([]);
  const [menuItemErrorVisible, setMenuItemErrorVisible] = useState(false);
  const [menuItemUpdating, setMenuItemUpdating] = useState(false);
  const [menuItemUpdateBtn, setMenuItemUpdateBtn] = useState(
    <span>
      <i className="fa fa-save" /> Update
    </span>
  );
  const [deleteMenuItemModalVisible, setDeleteMenuItemModalVisible] = useState(
    false
  );

  const toggleMenuItemDeleteModal = () => {
    setDeleteMenuItemModalVisible(!deleteMenuItemModalVisible);
  };

  const toggleMenuItemModal = (_id = null) => {
    setMenuItemId(_id);
    setMenuItemModal(!menuItemModal);
  };

  const menuItemValidate = (postData) => {
    if (postData.label === '') {
      setMenuItemUpdating(false);
      setMenuItemErrorVisible(true);
      setMenuItemError(
        <div>
          Please enter the <b>Label</b> to continue!
        </div>
      );
      setMenuItemUpdateBtn(
        <span>
          <i className="fa fa-save" /> Update error{' '}
          <i className="fa fa-times" />
        </span>
      );
      return false;
    }

    setMenuItemErrorVisible(false);
    setMenuItemError([]);

    return true;
  };

  const menuItemFormSubmit = async (e) => {
    e.preventDefault();
    if (menuItemUpdating) {
      return false;
    }
    setMenuItemUpdating(true);
    setMenuItemUpdateBtn(
      <span>
        <i className="fa fa-save" /> <i>Saving...</i>{' '}
        <Spinner color="info" size="sm" />
      </span>
    );
    // normalize type
    if (menuItemForm.type === 'link') {
      menuItemForm.objectId = 0;
    }
    delete menuItemForm.articleId;
    delete menuItemForm.categoryId;
    const postData = { ...menuItemForm };
    const isValid = menuItemValidate(postData);
    if (!isValid) {
      return false;
    }
    const updateData = await axios({
      method: 'put',
      url: `${APIPath}menu-item`,
      crossDomain: true,
      data: postData,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (updateData.status) {
      setMenuItemUpdating(false);
      setMenuItemUpdateBtn(
        <span>
          <i className="fa fa-save" /> Update success{' '}
          <i className="fa fa-check" />
        </span>
      );
      setMenuId(null);
      setMenuId(menuId);
      if (menuItemId === null) {
        toggleMenuItemModal(null);
      }
      setTimeout(() => {
        setMenuItemUpdateBtn(
          <span>
            <i className="fa fa-save" /> Update
          </span>
        );
      }, 2000);
    }
    return false;
  };

  const handleMenuItemTypeChange = (e, type) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    let link = '';
    if (type === 'home') {
      link = '/';
    }
    if (type === 'article') {
      const article = articles.find((a) => a._id === value);
      if (typeof article !== 'undefined') {
        link = article.permalink;
      }
    }
    if (type === 'article-category') {
      const articleCategory = articleCategories.find((a) => a._id === value);
      if (typeof articleCategory !== 'undefined') {
        link = articleCategory.permalink;
      }
    }
    if (type === 'classpieces') {
      link = '/classpieces';
    }
    if (type === 'people') {
      link = '/people';
    }
    const form = { ...menuItemForm };
    form.objectId = value;
    form.link = link;
    setMenuItemForm(form);
  };

  const handleMenuItemChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const form = { ...menuItemForm };
    form[name] = value;
    setMenuItemForm(form);
  };

  // load menu on menu id change
  const loadMenuItem = useCallback(async () => {
    setMenuItemError([]);
    setMenuItemErrorVisible(false);
    const menuItemData = async () => {
      const url = `${APIPath}menu-item`;
      const responseData = await axios({
        method: 'get',
        url,
        crossDomain: true,
        params: { _id: menuItemId },
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      return responseData;
    };
    const newData = await menuItemData();
    setMenuItem(newData);
    const menuItemFormParams = {
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
    setMenuItemForm(menuItemFormParams);
  }, [menuItemId]);

  useEffect(() => {
    if (menuItemId !== null) {
      loadMenuItem(menuItemId);
    } else {
      let newMenuId = '';
      if (menuId !== null) {
        newMenuId = menuId;
      }
      const menuItemFormParams = {
        _id: null,
        menuId: newMenuId,
        label: '',
        order: 0,
        parentId: 0,
        type: 'link',
        objectId: 0,
        link: '',
        target: '',
        status: 'private',
      };
      setMenuItemForm(menuItemFormParams);
    }
  }, [menuItemId, loadMenuItem, menuId]);

  // delete menu
  const deleteMenuItem = async () => {
    if (menuItemId === null || menuItemId <= 0) {
      return false;
    }
    const data = { _id: menuItemId };
    const responseData = await axios({
      method: 'delete',
      url: `${APIPath}menu-item`,
      crossDomain: true,
      data,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      setMenuItemError([]);
      setMenuItemErrorVisible(false);
      toggleMenuItemModal(null);
      setMenuId(null);
      setMenuId(menuId);
    } else {
      const errorMsg = responseData.msg;
      const errorText = errorMsg.map((e, i) => {
        const key = `a${i}`;
        return <div key={key}>{e}</div>;
      });
      setMenuItemErrorVisible(true);
      setMenuItemError(errorText);
    }
    toggleMenuItemDeleteModal();
    return false;
  };

  // render
  const heading = 'Menu';
  const breadcrumbsItems = [
    { label: heading, icon: 'pe-7s-menu', active: true, path: '' },
  ];

  const menusOutput = menus.map((m) => (
    <Button
      className="taxonomy-btn"
      key={m._id}
      color="secondary"
      outline
      onClick={() => setMenuId(m._id)}
    >
      {m.label}
    </Button>
  ));

  let menuErrorClass = ' hidden';
  if (menuErrorVisible) {
    menuErrorClass = '';
  }
  const menuErrorHTML = (
    <div className={`error-container${menuErrorClass}`}>{menuError}</div>
  );

  let menuItems = [];
  if (menu !== null && menu.menuItems.length > 0) {
    menuItems = (
      <MenuItems items={menu.menuItems} toggle={toggleMenuItemModal} />
    );
  }
  let menuItemModalTitle = 'Add new menu item';
  if (menuItem !== null) {
    menuItemModalTitle = `Edit menu item "${menuItem.label}"`;
  }
  let menuItemErrorClass = ' hidden';
  if (menuItemErrorVisible) {
    menuItemErrorClass = '';
  }
  const menuSelection = menus.map((m) => (
    <option value={m._id} key={m._id}>
      {m.label}
    </option>
  ));
  const menuItemErrorHTML = (
    <div className={`error-container${menuItemErrorClass}`}>
      {menuItemError}
    </div>
  );

  let articleVisible = 'hidden';
  let categoryVisible = 'hidden';
  let linkVisible = 'hidden';
  if (menuItemForm.type === 'article') {
    articleVisible = '';
  }
  if (menuItemForm.type === 'article-category') {
    categoryVisible = '';
  }
  if (menuItemForm.type === 'link') {
    linkVisible = '';
  }
  let menuItemsOptions = [];
  if (menu !== null) {
    const menuItemsOption = (item, sep = '') => {
      let sepCopy = sep;
      if (item.parentId > 0) {
        sepCopy += '-';
      }
      const options = [];
      options.push(
        <option value={item._id} key={item._id}>
          {sepCopy} {item.label}
        </option>
      );
      if (item.children.length > 0) {
        const children = item.children.map((child) =>
          menuItemsOption(child, sepCopy)
        );
        for (let k = 0; k < children.length; k += 1) {
          const child = children[k];
          options.push(child);
        }
      }
      return options;
    };

    menuItemsOptions = menu.menuItems.map((item) => menuItemsOption(item));
  }

  // articles options list
  let articlesOptionsHTML = articles.map((article) => (
    <option value={article._id} link={article.permalink} key={article._id}>
      {article.label}
    </option>
  ));
  articlesOptionsHTML = [
    ...[
      <option value="" key="0a">
        -- Select article --
      </option>,
    ],
    ...articlesOptionsHTML,
  ];

  // article categories options list
  let articleCategoriesOptionsHTML = [
    <option value="0" key={0}>
      -- Select category --
    </option>,
  ];

  for (let i = 0; i < articleCategories.length; i += 1) {
    const articleCategory = articleCategories[i];

    const articleCategoriesOptions = (item, sep = '') => {
      let sepCopy = sep;
      const options = [
        <option value={item._id} link={item.permalink} key={item._id}>
          {sepCopy} {item.label}
        </option>,
      ];
      if (item.children.length > 0) {
        for (let j = 0; j < item.children.length; j += 1) {
          sepCopy += '-';
          const child = item.children[j];
          options.push(articleCategoriesOptions(child, sepCopy));
        }
      }
      return options;
    };
    const options = articleCategoriesOptions(articleCategory, '');
    articleCategoriesOptionsHTML = [
      ...articleCategoriesOptionsHTML,
      ...options,
    ];
  }

  const deleteMenuModal = (
    <Modal isOpen={deleteMenuModalVisible} toggle={toggleMenuDeleteModal}>
      <ModalHeader toggle={toggleMenuDeleteModal}>
        Delete &quot;{menuForm.label}&quot;
      </ModalHeader>
      <ModalBody>
        {menuErrorHTML} The menu &quot;<b>{menuForm.label}</b>&quot; will be
        deleted. Continue?
      </ModalBody>
      <ModalFooter className="text-left">
        <Button
          className="pull-right"
          color="danger"
          size="sm"
          outline
          onClick={deleteMenu}
        >
          <i className="fa fa-trash-o" /> Delete
        </Button>
        <Button color="secondary" size="sm" onClick={toggleMenuDeleteModal}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );

  const deleteMenuItemModal = (
    <Modal
      isOpen={deleteMenuItemModalVisible}
      toggle={toggleMenuItemDeleteModal}
    >
      <ModalHeader toggle={toggleMenuItemDeleteModal}>
        Delete &quot;{menuItemForm.label}&quot;
      </ModalHeader>
      <ModalBody>
        {menuErrorHTML} The menu item &quot;<b>{menuItemForm.label}</b>&quot;
        will be deleted. Continue?
      </ModalBody>
      <ModalFooter className="text-left">
        <Button
          className="pull-right"
          color="danger"
          size="sm"
          outline
          onClick={deleteMenuItem}
        >
          <i className="fa fa-trash-o" /> Delete
        </Button>
        <Button color="secondary" size="sm" onClick={toggleMenuItemDeleteModal}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );

  let deleteMenuButton = [];
  if (menuId !== null) {
    deleteMenuButton = (
      <Button
        className="pull-left"
        color="danger"
        outline
        size="sm"
        onClick={() => toggleMenuDeleteModal()}
      >
        <i className="fa fa-trash" /> Delete
      </Button>
    );
  }

  const menuItemModalHTML = (
    <Modal isOpen={menuItemModal} toggle={() => toggleMenuItemModal(null)}>
      <ModalHeader toggle={() => toggleMenuItemModal(null)}>
        {menuItemModalTitle}
      </ModalHeader>
      <ModalBody>
        {menuItemErrorHTML}
        <Form onSubmit={menuItemFormSubmit}>
          <FormGroup>
            <Label>Label</Label>
            <Input
              type="text"
              name="label"
              placeholder="Label..."
              value={menuItemForm.label}
              onChange={handleMenuItemChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Menu</Label>
            <Input
              type="select"
              name="menuId"
              value={menuItemForm.menuId}
              onChange={handleMenuItemChange}
            >
              {menuSelection}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label>Order</Label>
            <Input
              type="number"
              name="order"
              placeholder="0"
              size="3"
              value={menuItemForm.order}
              onChange={handleMenuItemChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Parent Id</Label>
            <Input
              type="select"
              name="parentId"
              value={menuItemForm.parentId}
              onChange={handleMenuItemChange}
            >
              <option value="0">-- Root --</option>
              {menuItemsOptions}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label>Type</Label>
            <Input
              type="select"
              name="type"
              value={menuItemForm.type}
              onChange={handleMenuItemChange}
            >
              <option value="home">Home</option>
              <option value="link">Link</option>
              <option value="article">Article</option>
              <option value="article-category">Article Category</option>
              <option value="classpieces">Classpieces</option>
              <option value="people">People</option>
            </Input>
          </FormGroup>
          <FormGroup className={articleVisible}>
            <Label>Article</Label>
            <Input
              type="select"
              name="articleId"
              value={menuItemForm.articleId}
              onChange={(e) => handleMenuItemTypeChange(e, 'article')}
            >
              {articlesOptionsHTML}
            </Input>
          </FormGroup>
          <FormGroup className={categoryVisible}>
            <Label>Article Category</Label>
            <Input
              type="select"
              name="categoryId"
              value={menuItemForm.categoryId}
              onChange={(e) => handleMenuItemTypeChange(e, 'article-category')}
            >
              {articleCategoriesOptionsHTML}
            </Input>
          </FormGroup>
          <FormGroup className={linkVisible}>
            <Label>Link</Label>
            <Input
              type="text"
              name="link"
              value={menuItemForm.link}
              onChange={handleMenuItemChange}
            />
          </FormGroup>
          <FormGroup className={linkVisible}>
            <Label>Target</Label>
            <Input
              type="select"
              name="target"
              value={menuItemForm.target}
              onChange={handleMenuItemChange}
            >
              <option value="">Same window</option>
              <option value="_blank">New window</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label>Status</Label>
            <Input
              type="select"
              name="status"
              value={menuItemForm.status}
              onChange={handleMenuItemChange}
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </Input>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" outline size="sm" onClick={menuItemFormSubmit}>
          {menuItemUpdateBtn}
        </Button>
        <Button
          className="pull-left"
          color="danger"
          outline
          size="sm"
          onClick={() => toggleMenuItemDeleteModal()}
        >
          <i className="fa fa-trash" /> Delete
        </Button>
      </ModalFooter>
    </Modal>
  );

  const content = (
    <div className="row">
      <div className="col-12">
        <Card>
          <CardHeader>
            {menusOutput}{' '}
            <Button
              size="sm"
              className="pull-right"
              color="info"
              outline
              onClick={() => setMenuId(null)}
            >
              Add new <i className="fa fa-plus" />
            </Button>
          </CardHeader>
          <CardBody>
            <div className="row">
              <div className="col-xs-12 col-sm-6 order-sm-last">
                {menuErrorHTML}
                <Form onSubmit={menuFormSubmit}>
                  <FormGroup>
                    <Label>Label</Label>
                    <Input
                      type="text"
                      name="label"
                      placeholder="Label..."
                      value={menuForm.label}
                      onChange={handleMenuChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Position</Label>
                    <Input
                      type="select"
                      name="templatePosition"
                      placeholder="Template position..."
                      value={menuForm.templatePosition}
                      onChange={handleMenuChange}
                    >
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                    </Input>
                  </FormGroup>
                </Form>
                <div className="footer-box">
                  <Button
                    color="primary"
                    outline
                    size="sm"
                    onClick={menuFormSubmit}
                  >
                    {menuUpdateBtn}
                  </Button>
                  {deleteMenuButton}
                </div>
              </div>
              <div className="col-xs-12 col-sm-6">
                <h5>Menu items</h5>
                <div>{menuItems}</div>
                <div className="footer-box">
                  <Button
                    size="sm"
                    className="pull-right"
                    color="info"
                    outline
                    onClick={() => toggleMenuItemModal(null)}
                  >
                    Add menu item <i className="fa fa-plus" />
                  </Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      {deleteMenuModal}
      {deleteMenuItemModal}
      {menuItemModalHTML}
    </div>
  );

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
  );
};

export default Menu;
