import React, { useState, useEffect, useRef, useReducer, useCallback } from 'react';
import {
  Button,
  //Card, CardBody, CardHeader,
  Form, FormGroup, Label, Input,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Spinner,
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import axios from 'axios';
import {
  getResourceFullsizeURL,
} from '../helpers/helpers';
import AnnotationsLayer from '../components/annotation-tool/annotations-layer';
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
import Notification from "../components/notification";

const APIPath = process.env.REACT_APP_APIPATH;

const AnnotateTool = props => {
  const [item, setItem] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgLoading, setImgLoading] = useState(true);
  const [dimensionsLoaded, setDimensionsLoaded] = useState(false);
  const itemState = {
    dragging: false,
    scale: 1,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  }
  const [state, setState] = useReducer(
    (state, newState) => (
    {...state, ...newState}
  ),itemState);
  const [contextMenuState, setContextMenuState] = useState({
    visible: false,
    top: 0,
    left: 0
  });
  const [itemContextMenuState, setItemContextMenuState] = useState({
    visible: false,
    top: 0,
    left: 0,
    itemId: 0,
    index: -1
  });
  const resourcesTypes = useSelector(state => state.resourcesTypes);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editItemObj, setEditItemObj] = useState(null);
  const [editItemState, setEditItemState] = useState({
    _id: 0,
    label: "",
    systemType: null,
    description: "",
  });
  const [editItemSaving, setEditItemSaving] = useState(false);
  const [editItemUpdateBtn, setEditItemUpdateBtn] = useState(<span><i className="fa fa-save" /> Update</span>);
  const toggleEditModal = () => {
    setEditModalVisible(!editModalVisible);
  }
  const [editItemMeta, setEditItemMeta] = useState(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [notificationState, setNotificationState] = useState({visible:false,content: [], color: "info"});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const load = useCallback(()=> {
    let loadData = async() => {
      let _id = props.match.params._id;
      setLoading(false);
      let params = {_id:_id}
      let responseData = await axios({
        method: 'get',
        url: APIPath+'resource',
        crossDomain: true,
        params: params
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      setItem(responseData);
      let itemResources = responseData.resources.filter(r=>r.term.label==="hasPart");
      setResources(itemResources); 
    }
    return loadData();
  },[props.match.params._id]);

  useEffect(()=> {
    if (loading) {
      load();
    }
  },[loading, load]);

  const imgLoaded = () => {
    setImgLoading(false);
  }

  const imgDimensions = () => {
    let img = imgRef.current.querySelector("img");
    if (img!==null) {
      setState({
        left: 0,
        top: 0,
        scale: 1,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setDimensionsLoaded(true);
    }
  }

  const imgDragStart = (e) => {
    if (e.type==="mousedown" || e.type==="click") {
      if (contextMenuState.visible) {
        setContextMenuState({
          visible: false,
          top: 0,
          left: 0,
        });
      }
      if (itemContextMenuState.visible) {
        setItemContextMenuState({
          visible: false,
          top: itemContextMenuState.top,
          left: itemContextMenuState.left,
          itemId: itemContextMenuState.itemId,
          index: itemContextMenuState.index
        });
      }
      setState({
        dragging: true,
        x:e.pageX,
        y:e.pageY
      });
    }
  }

  const imgDragEnd = (e) => {
    e.stopPropagation();
    setState({
      dragging: false,
      x:0,
      y:0
    });
  }

  const updateZoom = (value) => {
    let newScale = parseFloat(state.scale,10).toFixed(1);
    if (value==="plus") {
      if (newScale<2){
        newScale = parseFloat(newScale,10)+0.1;
      }
    }
    if (value==="minus") {
      if (newScale>0.1){
        newScale = parseFloat(newScale,10) - 0.1;
      }
    }

    setState({scale:newScale});
  }

  const updatePan = (direction) => {
    let add = 50;
    let top = state.top;
    let left = state.left;
    let newTop = top;
    let newLeft= left;
    if (direction==="up") {
      if (typeof top==="string") {
        newTop = top.replace("px", "");
      }
      newTop = parseFloat(top,10)-add;
    }

    if (direction==="right") {
      if (typeof left==="string") {
        newLeft = left.replace("px", "");
      }
      newLeft = parseFloat(left,10)+add;
    }

    if (direction==="down") {
      if (typeof top==="string") {
        newTop = top.replace("px", "");
      }
      newTop = parseFloat(top,10)+add;
    }

    if (direction==="left") {
      if (typeof left==="string") {
        newLeft = left.replace("px", "");
      }
      newLeft = parseFloat(left,10)-add;
    }
    setState({
      top: newTop,
      left: newLeft,
    });
  }

  // calc img dimensions
  useEffect(()=> {
    if (!loading && !imgLoading && !dimensionsLoaded) {
      imgDimensions();
    }
  });

  // img drag effect
  useEffect(()=> {
    const imgDrag = (e) => {
      e.stopPropagation();
      if (!state.dragging) {
        return false;
      }
      if (contextMenuState.visible) {
        setContextMenuState({visible: false});
      }
      if (itemContextMenuState.visible) {
        setItemContextMenuState({
          visible: false,
          top: itemContextMenuState.top,
          left: itemContextMenuState.left,
          itemId: itemContextMenuState.itemId,
          index: itemContextMenuState.index
        });
      }
      let x = state.x;
      let y = state.y;
      let container = containerRef.current;
      let containerRect = container.getBoundingClientRect();
      let leftX = containerRect.x;
      let rightX = containerRect.right;
      let topY = containerRect.y;
      let bottomY = containerRect.y+containerRect.bottom;
      if (containerRect.y<0) {
        bottomY = containerRect.bottom;
      }
      let img = imgRef.current;
      let newX = e.pageX-x;
      let newY = e.pageY-y;
      let newStyle = img.style;
      let transform = newStyle.transform.split(" ");
      let translateX = transform[0];
      let translateY = transform[1];
      translateX = translateX.replace("translateX(", "");
      translateX = translateX.replace(")px", "");
      translateX = parseFloat(translateX, 10);
      translateY = translateY.replace("translateY(", "");
      translateY = translateY.replace(")px", "");
      translateY = parseFloat(translateY, 10);

      let newTranslateX = translateX+newX;
      let newTranslateY = translateY+newY;

      if (e.pageX<=leftX || e.pageX>=rightX  || e.pageY<= topY || e.clientY===0 || e.clientY>=bottomY ) {
        setState({
          dragging: false,
          x: 0,
          y: 0,
        });
      }
      else {
        setState({
          x: e.pageX,
          y: e.pageY,
          left:newTranslateX,
          top:newTranslateY,
        });
      }
    }
    window.addEventListener("mousemove", imgDrag);
    window.addEventListener("mouseup", imgDragEnd);
    return () => {
      window.removeEventListener("mousemove", imgDrag);
      window.removeEventListener("mouseup", imgDragEnd);
    }
  }, [state.dragging, state.x, state.y, contextMenuState.visible, itemContextMenuState]);

  // contextMenu
  const contextMenuShow = (e) => {
    e.preventDefault();
    setState({dragging: false});
    let html = document.querySelector("html");
    let top = e.clientY;
    let left = e.clientX;
    if (html.classList.contains("nav-open") && window.innerWidth<992) {
      left -= 260;
      let container = containerRef.current;
      let rect = container.getBoundingClientRect();
      let rectTop = rect.top;
      let offsetTop = container.offsetTop;
      if (rectTop<0) {
        top += Math.abs(rect.top);
      }
      else {
        top -= Math.abs(rect.top);
      }
      top += offsetTop;
    }
    setContextMenuState({
      visible: true,
      top: top,
      left: left,
    });
  }

  // itemcontextMenu
  const itemContextMenuShow = (state) => {
    setState({dragging: false});
    setItemContextMenuState(state);
  }

  // hide context menus on click || scroll
  useEffect(()=> {
    const hideContextMenu = (e) => {
      if (contextMenuState.visible) {
        setTimeout(()=> {
          setContextMenuState({visible: false});
        },250);
      }
      if (itemContextMenuState.visible) {
        setTimeout(()=> {
          setItemContextMenuState({
            visible: false,
            top: itemContextMenuState.top,
            left: itemContextMenuState.left,
            itemId: itemContextMenuState.itemId,
            index: itemContextMenuState.index
          });
        },250);
      }
    }
    document.addEventListener("mousedown", hideContextMenu);
    document.addEventListener('scroll', hideContextMenu);
    return () => {
      document.removeEventListener('mousedown', hideContextMenu);
      document.removeEventListener('scroll', hideContextMenu);
    }
  },[contextMenuState.visible, itemContextMenuState]);

  // edit/delete modal
  const loadEditItem = async() => {
    let params = {_id:itemContextMenuState.itemId}
    let responseData = await axios({
      method: 'get',
      url: APIPath+'resource',
      crossDomain: true,
      params: params
    })
    .then(function (response) {
      return response.data.data;
    })
    .catch(function (error) {
    });
    if (responseData.description===null) {
      responseData.description = "";
    }
    return responseData;
  }

  const editItem = async () => {
    let responseData = await loadEditItem();
    setEditItemObj(responseData);
    setEditItemState({
      _id: responseData._id,
      label: responseData.label,
      systemType: responseData.systemType,
      description: responseData.description,
    });
    toggleEditModal();
    setItemContextMenuState(false);
  }

  const updateEditItem = async (e) => {
    e.preventDefault();
    if (editItemSaving) {
      return false;
    }
    setEditItemSaving(true);
    let resource = Object.assign({}, editItemObj);
    if (typeof editItemState._id!=="undefined") {
      resource._id = editItemState._id;
    }
    if (typeof editItemState.label!=="undefined") {
      resource.label = editItemState.label;
    }
    if (typeof editItemState.systemType!=="undefined") {
      resource.systemType = editItemState.systemType;
    }
    if (typeof editItemState.description!=="undefined") {
      resource.description = editItemState.description;
    }
    let postData = {
      resource: resource
    }
    let responseData = await axios({
      method: 'put',
      url: APIPath+'resource',
      crossDomain: true,
      data: postData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
    setEditItemSaving(false);
    if (responseData.status) {
      setEditItemUpdateBtn(<span><i className="fa fa-save" /> Update success <i className="fa fa-check" /></span>);
      setTimeout(function() {
        setEditItemUpdateBtn(<span><i className="fa fa-save" /> Update</span>);
      },2000);
    }
    else {
      setEditItemUpdateBtn(<span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>);
      setTimeout(function() {
        setEditItemUpdateBtn(<span><i className="fa fa-save" /> Update</span>);
      },2000);
    }
  }

  const returnValues = (values) => {
    setEditItemMeta(values);
  }

  const updateEditItemDimensions = async() => {
    if (editItemSaving) {
      return false;
    }
    setEditItemSaving(true);
    setNotificationState({visible: true,content: <div><span style={{fontStyle:'italic'}}>Saving changes...</span> <Spinner color="info" style={{ width: '16px', height: '16px' }} /></div>, color: "info"});
    let resource = null;
    if (itemContextMenuState.itemId!==null) {
      let itemData = await loadEditItem();
      resource = Object.assign({}, itemData);
      resource.metadata.image.default.height = editItemMeta.height;
      resource.metadata.image.default.width = editItemMeta.width;
      resource.metadata.image.default.x = editItemMeta.x;
      resource.metadata.image.default.y = editItemMeta.y;
      resource.metadata.image.default.rotate = editItemMeta.rotate;
    }
    else {
      let selectedItem = resources[itemContextMenuState.index];
      let systemType = resourcesTypes.find(rt=>rt.labelId==="Thumbnail");
      resource = {
        label: `Temp ${itemContextMenuState.index}`,
        metadata: selectedItem.ref.metadata,
        resourceType: "image",
        systemType: systemType._id
      };
      resource.metadata.image.default.height = editItemMeta.height;
      resource.metadata.image.default.width = editItemMeta.width;
      resource.metadata.image.default.x = editItemMeta.x;
      resource.metadata.image.default.y = editItemMeta.y;
      resource.metadata.image.default.rotate = editItemMeta.rotate;
    }

    // save new coordinates
    let postData = {
      resource: resource
    }
    let responseData = await axios({
      method: 'put',
      url: APIPath+'resource',
      crossDomain: true,
      data: postData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
    .then(function (response) {
      resource._id = response.data.data.data._id;
      setItemContextMenuState({itemId:resource._id});
      return response.data;
    })
    .catch(function (error) {
    });
    setEditItemSaving(false);
    // create new annotation image file
    let imageFilePostData = {
      itemId: resource._id,
      sourceId: item._id
    }
    await axios({
      method: 'put',
      url: APIPath+'update-annotation-image',
      crossDomain: true,
      data: imageFilePostData
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
    if (responseData.status) {
      setNotificationState({content: <span>Saved successfully <i className="fa fa-check"/></span>, color: "info"});
    }
    else {
      setNotificationState({content: <span>Save error <i className="fa fa-times"/></span>, color: "info"});
    }
    await load();
    setTimeout(()=> {setNotificationState({visible: false,content:[]})},2000);
  }

  const handleChange = (e) => {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    setEditItemState({
      [name]: value
    });
  }

  const addAnnotation = () => {
    let nullObject = resources.find(r=>r.ref._id===null);
    if (typeof nullObject!=="undefined") {
      setNotificationState({visible: true, color: "danger", content:<p><i className="fa fa-ban" /> You have an unsaved new annotation. <br/>Please save this annotation before adding a new one!</p>})
      setTimeout(()=> {
        setNotificationState({visible: false})
      },5000);
      return false;
    }
    setItemContextMenuState({visible: false});
    let top = contextMenuState.top;
    let left = contextMenuState.left;
    let container = containerRef.current;
    let rect = container.getBoundingClientRect();
    let rectTop = rect.top;
    let rectLeft = rect.left;
    let offsetTop = container.offsetTop;
    let scrollLeft = container.scrollLeft;
    let dragTop = state.top;
    let dragLeft = state.left;
    let windowOffsetTop = window.pageYOffset;
    left -= Math.abs(rectLeft);
    if (rectTop>0) {
      top -= Math.abs(offsetTop)-Math.abs(windowOffsetTop);
    }
    else if (rectTop<0) {
      if (Math.abs(windowOffsetTop)>Math.abs(offsetTop)) {
        top += Math.abs(windowOffsetTop)-Math.abs(offsetTop);
      }
      else {
        top += Math.abs(windowOffsetTop);
      }
    }
    if (dragTop<0) {
      top += Math.abs(dragTop);
    }
    else if (dragTop>0) {
      top -= Math.abs(dragTop);
    }
    if (scrollLeft>0) {
      left += Math.abs(scrollLeft);
    }
    else if (scrollLeft<0) {
      left -= Math.abs(scrollLeft);
    }
    if (dragLeft<0) {
      left += Math.abs(dragLeft);
    }
    else if (dragLeft>0) {
      left -= Math.abs(dragLeft);
    }
    let scale = state.scale;
    top = top/scale;
    left = left/scale;
    let newResource = {
      ref: {
        _id: null,
        metadata: {
          image: {
            default: {
              height: 100,
              width: 100,
              y: top,
              x: left,
              extension: "jpg"
            }
          }
        }
      }
    }
    let newResources = [...resources];
    newResources.push(newResource);
    setResources(newResources);
  }

  const removeItem = () => {
    let newResources = [...resources];
    newResources.splice(itemContextMenuState.index, 1);
    setResources(newResources);
  }

  const deleteItem = async() => {
    let _id = editItemState._id;
    let params = {_id: _id};
    let responseData = await axios({
      method: 'delete',
      url: APIPath+'resource',
      crossDomain: true,
      params: params
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
    if (responseData.status) {
      toggleDeleteModal();
      await load();
    }
  }

  const toggleDeleteModal = () => {
    if (!deleteModalVisible) {
      let selectedItem = resources[itemContextMenuState.index];
      let _id, label, systemType, description;
      if (typeof selectedItem.ref._id!=="undefined") {
        _id = selectedItem.ref._id;
      }
      if (typeof selectedItem.ref.label!=="undefined") {
        label = selectedItem.ref.label;
      }
      if (typeof selectedItem.ref.systemType!=="undefined") {
        systemType = selectedItem.ref.systemType;
      }
      if (typeof selectedItem.ref.description!=="undefined") {
        description = selectedItem.ref.description;
      }
      setEditItemState({
        _id: _id,
        label: label,
        systemType: systemType,
        description: description,
      });
    }
    setDeleteModalVisible(!deleteModalVisible);
  }

  // render
  let label = '';
  let _id = '';
  if (item!==null && typeof item.label!=="undefined") {
    label = item.label;
    _id = item._id;
  }
  let heading = label;
  let breadcrumbsItems = [
    {label: "Resources", icon: "pe-7s-photo", active: false, path: "/resources"},
    {label: heading, icon: "pe-7s-photo", active: false, path: `/resource/${_id}`},
    {label: "Annotation tool", icon: "fa fa-pencil", active: true, path: ""},
  ];
  let content = <div className="row">
    <div className="col-12">
      <div style={{padding: '40pt',textAlign: 'center'}}>
        <Spinner type="grow" color="info" /> <i>loading...</i>
      </div>
    </div>
  </div>
  if (!loading && item!==null) {
    let fullsizePath = getResourceFullsizeURL(item);
    let annotationsLayer = [];
    if (resources.length>0 && state.width>0 && state.height>0) {
      annotationsLayer = <AnnotationsLayer items={resources} container={containerRef} width={state.width} height={state.height} itemContextMenuShow={itemContextMenuShow} returnValues={returnValues}/>
    }

    let zoomPanel = <div className="zoom-container annotation-tool">
      <div
        className="zoom-action"
        onClick={()=>updateZoom("plus")}>
        <i className="fa fa-plus" />
      </div>
      <div
        className="zoom-action"
        onClick={()=>updateZoom("minus")}>
        <i className="fa fa-minus" />
      </div>
    </div>

    let panPanel = <div className="pan-container annotation-tool">
      <div className="pan-action up" onClick={()=>updatePan("up")}>
        <i className="fa fa-chevron-up" />
      </div>

      <div className="pan-action right" onClick={()=>updatePan("right")}>
        <i className="fa fa-chevron-right" />
      </div>

      <div className="pan-action down" onClick={()=>updatePan("down")}>
        <i className="fa fa-chevron-down" />
      </div>

      <div className="pan-action left" onClick={()=>updatePan("left")}>
        <i className="fa fa-chevron-left" />
      </div>
    </div>

    let imgStyle = {
      width: state.width,
      height: state.height,
      transform: `translateX(${state.left}px) translateY(${state.top}px) scaleX(${state.scale}) scaleY(${state.scale})`
    }
    let contextMenuDisplay = "none";
    if (contextMenuState.visible) {
      contextMenuDisplay = "block"
    }
    let contextMenuStyle = {
      top: contextMenuState.top,
      left: contextMenuState.left,
      display: contextMenuDisplay
    }

    let contextMenu = <div className="context-menu" style={contextMenuStyle}>
      <ul>
        <li onClick={()=>addAnnotation()}>Add annotation</li>
      </ul>
    </div>

    let itemContextMenuDisplay = "none";
    if (itemContextMenuState.visible) {
      itemContextMenuDisplay = "block";
    }
    let itemContextMenuStyle = {
      top: itemContextMenuState.top,
      left: itemContextMenuState.left,
      display: itemContextMenuDisplay
    }

    let gotoLink = [];
    let deleteItemLink = <li onClick={()=>removeItem()}>Remove item</li>;
    let saveChangesText = "Save new annotation";
    if (itemContextMenuState.itemId!==null) {
      gotoLink = <li><Link href={`/resource/${itemContextMenuState.itemId}`} to={`/resource/${itemContextMenuState.itemId}`} target="_blank">Go to item</Link></li>;
      deleteItemLink = <li onClick={()=>toggleDeleteModal()}>Delete item</li>
      saveChangesText = "Save changes";
    }
    let itemContextMenu = <div className="context-menu" style={itemContextMenuStyle}>
      <ul>
        {gotoLink}
        <li onClick={()=>{editItem()}}>Edit item</li>
        <li onClick={()=>{updateEditItemDimensions()}}>{saveChangesText}</li>
        {deleteItemLink}
      </ul>
    </div>

    // edit/delete item
    let resourcesTypesOptions = [];
    if (resourcesTypes.length>0) {
      for (let st=0;st<resourcesTypes.length; st++) {
        let systemType = resourcesTypes[st];
        let systemTypeOption = <option value={systemType._id} key={st}>{systemType.label}</option>;
        resourcesTypesOptions.push(systemTypeOption);
      }
    }
    let editModal = <Modal isOpen={editModalVisible} toggle={toggleEditModal}>
        <ModalHeader toggle={toggleEditModal}>Edit Item</ModalHeader>
        <ModalBody>
          <Form onSubmit={updateEditItem}>
            <FormGroup>
              <Label>Label</Label>
              <Input type="text" name="label" placeholder="Resource label..." value={editItemState.label} onChange={handleChange}/>
            </FormGroup>
            <FormGroup>
             <Label>Type</Label>
             <Input type="select" name="systemType" onChange={handleChange} value={editItemState.systemType}>
               {resourcesTypesOptions}
             </Input>
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input type="textarea" name="description" placeholder="Resource description..." value={editItemState.description} onChange={handleChange}/>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter className="text-right">
          <Button className="pull-left" size="sm" color="danger" outline onClick={()=>toggleDeleteModal()}><i className="fa fa-trash" /> Delete</Button>
          <Button color="primary" outline onClick={()=>updateEditItem()} size="sm">{editItemUpdateBtn}</Button>
        </ModalFooter>
      </Modal>

    let deleteModal = <Modal isOpen={deleteModalVisible} toggle={toggleDeleteModal}>
        <ModalHeader toggle={toggleDeleteModal}>Delete Item</ModalHeader>
        <ModalBody>
          The item "{editItemState.label}" will be deleted.<br/>
          All related <b>Resources</b> and <b>People</b> will also be deleted.<br/>
          Related <b>Events</b> and <b>Organisations</b> will not be deleted.<br/>
          Continue?
        </ModalBody>
        <ModalFooter className="text-right">
          <Button className="pull-left" size="sm" color="secondary" onClick={toggleDeleteModal}>Cancel</Button>
          <Button size="sm" color="danger" outline onClick={()=>deleteItem()}><i className="fa fa-trash" /> Delete</Button>
        </ModalFooter>
      </Modal>

    content = <div>
      <Notification visible={notificationState.visible} content={notificationState.content} color={notificationState.color}/>
      {editModal}
      {deleteModal}
      {zoomPanel}
      {panPanel}
      {contextMenu}
      {itemContextMenu}
      <div className="annotation-tool-container" ref={containerRef}>
        <div className="annotation-tool-img-container" style={imgStyle} ref={imgRef}>
          {annotationsLayer}
          <img
            className="annotation-tool-img"
            src={fullsizePath}
            alt={label}
            draggable="false"
            onContextMenu={(e)=>contextMenuShow(e)}
            onDoubleClick={()=>updateZoom("plus")}
            onLoad={()=>imgLoaded()}
            onDragStart={(e) => { e.preventDefault() }}
            onMouseDown={(e)=>imgDragStart(e)}
            onMouseUp={(e)=>imgDragEnd(e)}
            onDragEnd={(e)=>imgDragEnd(e)}
            data-type="main-image"
            />
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
    </div>
  )
}

export default AnnotateTool;
