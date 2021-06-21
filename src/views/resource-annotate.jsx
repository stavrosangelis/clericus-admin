import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  useCallback,
  lazy,
  Suspense,
} from 'react';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { getResourceFullsizeURL, renderLoader } from '../helpers';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));
const AnnotationsLayer = lazy(() =>
  import('../components/annotation-tool/annotations-layer')
);
const ContextMenu = lazy(() =>
  import('../components/annotation-tool/context-menu')
);
const ItemContextMenu = lazy(() =>
  import('../components/annotation-tool/item-context-menu')
);
const EditModal = lazy(() =>
  import('../components/annotation-tool/edit-modal')
);
const DeleteModal = lazy(() =>
  import('../components/annotation-tool/delete-modal')
);
const Notification = lazy(() => import('../components/notification'));

const APIPath = process.env.REACT_APP_APIPATH;

const AnnotateTool = (props) => {
  // state
  const [item, setItem] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resourcesLoading, setResourcesLoading] = useState(false);
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
  };
  const [state, setState] = useReducer(
    (curState, newState) => ({ ...curState, ...newState }),
    itemState
  );
  const [editItemState, setEditItemState] = useState({
    _id: 0,
    label: '',
    systemType: '',
    description: '',
  });
  const [contextMenuState, setContextMenuState] = useState({
    visible: false,
    top: 0,
    left: 0,
  });
  const [itemContextMenuState, setItemContextMenuState] = useState({
    visible: false,
    top: 0,
    left: 0,
    itemId: 0,
    index: -1,
  });
  const resourcesTypes = useSelector((rstate) => rstate.resourcesTypes);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editItemObj, setEditItemObj] = useState(null);
  const [editItemSaving, setEditItemSaving] = useState(false);
  const [editItemUpdateBtn, setEditItemUpdateBtn] = useState(
    <span>
      <i className="fa fa-save" /> Update
    </span>
  );
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [notificationState, setNotificationState] = useState({
    visible: false,
    content: null,
    color: 'info',
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // props
  const { match } = props;
  const { _id } = match.params;

  const toggleEditModal = () => {
    setEditModalVisible(!editModalVisible);
  };

  // load item and referenced "hasPart" resources as annotations
  const load = useCallback(() => {
    const loadData = async () => {
      setLoading(false);
      const params = { _id };
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}resource`,
        crossDomain: true,
        params,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      setItem(responseData);
      const itemResources = responseData.resources.filter(
        (r) => r.term.label === 'hasPart'
      );
      setResources(itemResources);
    };
    return loadData();
  }, [_id]);

  // execute loading
  useEffect(() => {
    if (loading) {
      load();
    }
  }, [loading, load]);

  // refresh resources
  useEffect(() => {
    const loadResources = async () => {
      const params = { _id };
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}resource`,
        crossDomain: true,
        params,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      const itemResources = responseData.resources.filter(
        (r) => r.term.label === 'hasPart'
      );
      setResources(itemResources);
    };
    if (resourcesLoading) {
      loadResources();
      setResourcesLoading(false);
    }
  }, [resourcesLoading, _id]);

  // load thumbnail as default systemType value
  useEffect(() => {
    if (resourcesTypes.length > 0 && editItemState.systemType === '') {
      const defaultType =
        resourcesTypes.find((r) => r.label === 'Thumbnail')._id || '';
      const editItemStateCopy = { ...editItemState };
      editItemStateCopy.systemType = defaultType;
      setEditItemState(editItemStateCopy);
    }
  }, [resourcesTypes, editItemState]);

  // image finished loading
  const imgLoaded = () => {
    setImgLoading(false);
  };

  // extract loaded image dimensions
  const imgDimensions = () => {
    const img = imgRef.current.querySelector('img');
    if (img !== null) {
      setState({
        left: 0,
        top: 0,
        scale: 1,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setDimensionsLoaded(true);
    }
  };

  // capture image drag action
  const imgDragStart = (e) => {
    if (e.type === 'mousedown' || e.type === 'click') {
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
          index: itemContextMenuState.index,
        });
      }
      setState({
        dragging: true,
        x: e.pageX,
        y: e.pageY,
      });
    }
  };

  // capture image drag end event
  const imgDragEnd = (e) => {
    e.stopPropagation();
    setState({
      dragging: false,
      x: 0,
      y: 0,
    });
  };

  // update image zoom
  const updateZoom = (value) => {
    let newScale = parseFloat(state.scale, 10).toFixed(1);
    if (value === 'plus') {
      if (newScale < 2) {
        newScale = parseFloat(newScale, 10) + 0.1;
      }
    }
    if (value === 'minus') {
      if (newScale > 0.1) {
        newScale = parseFloat(newScale, 10) - 0.1;
      }
    }

    setState({ scale: newScale });
  };

  // update image panning
  const updatePan = (direction) => {
    const add = 50;
    const { top } = state;
    const { left } = state;
    let newTop = top;
    let newLeft = left;
    if (direction === 'up') {
      if (typeof top === 'string') {
        newTop = top.replace('px', '');
      }
      newTop = parseFloat(top, 10) - add;
    }

    if (direction === 'right') {
      if (typeof left === 'string') {
        newLeft = left.replace('px', '');
      }
      newLeft = parseFloat(left, 10) + add;
    }

    if (direction === 'down') {
      if (typeof top === 'string') {
        newTop = top.replace('px', '');
      }
      newTop = parseFloat(top, 10) + add;
    }

    if (direction === 'left') {
      if (typeof left === 'string') {
        newLeft = left.replace('px', '');
      }
      newLeft = parseFloat(left, 10) - add;
    }
    setState({
      top: newTop,
      left: newLeft,
    });
  };

  // if image and it's dimensions finished loading set the dimensions to the state
  useEffect(() => {
    if (!loading && !imgLoading && !dimensionsLoaded) {
      imgDimensions();
    }
  });

  // img drag effect
  useEffect(() => {
    const imgDrag = (e) => {
      e.stopPropagation();
      if (!state.dragging) {
        return false;
      }
      if (contextMenuState.visible) {
        setContextMenuState({ visible: false });
      }
      if (itemContextMenuState.visible) {
        setItemContextMenuState({
          visible: false,
          top: itemContextMenuState.top,
          left: itemContextMenuState.left,
          itemId: itemContextMenuState.itemId,
          index: itemContextMenuState.index,
        });
      }
      const { x, y } = state;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const leftX = containerRect.x;
      const rightX = containerRect.right;
      const topY = containerRect.y;
      let bottomY = containerRect.y + containerRect.bottom;
      if (containerRect.y < 0) {
        bottomY = containerRect.bottom;
      }
      const img = imgRef.current;
      const newX = e.pageX - x;
      const newY = e.pageY - y;
      const newStyle = img.style;
      const transform = newStyle.transform.split(' ');
      let translateX = transform[0];
      let translateY = transform[1];
      translateX = translateX.replace('translateX(', '');
      translateX = translateX.replace(')px', '');
      translateX = parseFloat(translateX, 10);
      translateY = translateY.replace('translateY(', '');
      translateY = translateY.replace(')px', '');
      translateY = parseFloat(translateY, 10);

      const newTranslateX = translateX + newX;
      const newTranslateY = translateY + newY;

      if (
        e.pageX <= leftX ||
        e.pageX >= rightX ||
        e.pageY <= topY ||
        e.clientY === 0 ||
        e.clientY >= bottomY
      ) {
        setState({
          dragging: false,
          x: 0,
          y: 0,
        });
      } else {
        setState({
          x: e.pageX,
          y: e.pageY,
          left: newTranslateX,
          top: newTranslateY,
        });
      }
      return false;
    };
    window.addEventListener('mousemove', imgDrag);
    window.addEventListener('mouseup', imgDragEnd);
    return () => {
      window.removeEventListener('mousemove', imgDrag);
      window.removeEventListener('mouseup', imgDragEnd);
    };
  }, [
    state.dragging,
    state.x,
    state.y,
    contextMenuState.visible,
    itemContextMenuState,
    state,
  ]);

  // calculate contextMenu position and show
  const contextMenuShow = (e) => {
    e.preventDefault();
    setState({ dragging: false });
    const html = document.querySelector('html');
    let top = e.clientY;
    let left = e.clientX;
    if (html.classList.contains('nav-open')) {
      left -= 260;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const rectTop = rect.top;
      const { offsetTop } = container;
      if (rectTop < 0) {
        top += Math.abs(rect.top);
      } else {
        top -= Math.abs(rect.top);
      }
      top += offsetTop;
    }
    setContextMenuState({
      visible: true,
      top,
      left,
    });
  };

  // calculate itemcontextMenu position and show
  const itemContextMenuShow = (value) => {
    setState({ dragging: false });
    setItemContextMenuState(value);
  };

  // hide context menus on click || scroll
  useEffect(() => {
    const hideContextMenu = () => {
      if (contextMenuState.visible) {
        setTimeout(() => {
          setContextMenuState({ visible: false });
        }, 250);
      }
      if (itemContextMenuState.visible) {
        setTimeout(() => {
          setItemContextMenuState({
            visible: false,
            top: itemContextMenuState.top,
            left: itemContextMenuState.left,
            itemId: itemContextMenuState.itemId,
            index: itemContextMenuState.index,
          });
        }, 250);
      }
    };
    document.addEventListener('mousedown', hideContextMenu);
    document.addEventListener('scroll', hideContextMenu);
    return () => {
      document.removeEventListener('mousedown', hideContextMenu);
      document.removeEventListener('scroll', hideContextMenu);
    };
  }, [contextMenuState.visible, itemContextMenuState]);

  // load item to edit/delete modal
  const loadEditItem = async (newId = null) => {
    const itemId = newId !== null ? newId : itemContextMenuState.itemId;
    const params = { _id: itemId };
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}resource`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.data.description === null) {
      responseData.data.description = '';
    }
    return responseData;
  };

  // load item data and open edit modal
  const editItem = async () => {
    const responseData = await loadEditItem();
    if (responseData.status) {
      const newEditItem = responseData.data;
      setEditItemObj(newEditItem);
      setEditItemState({
        _id: Number(newEditItem._id),
        label: newEditItem.label,
        systemType: newEditItem.systemType,
        description: newEditItem.description,
      });
    }
    toggleEditModal();
    const itemContextMenuStateCopy = itemContextMenuState;
    itemContextMenuStateCopy.visible = false;
    setItemContextMenuState(itemContextMenuStateCopy);
  };

  // update item
  const updateEditItem = async (e) => {
    if (typeof e !== 'undefined') {
      e.preventDefault();
    }
    if (editItemSaving) {
      return false;
    }
    setEditItemSaving(true);
    const resource = { ...editItemObj };
    if (typeof editItemState._id !== 'undefined') {
      resource._id = editItemState._id;
    } else {
      resource._id = null;
    }
    if (typeof editItemState.label !== 'undefined') {
      resource.label = editItemState.label;
    }
    if (typeof editItemState.systemType !== 'undefined') {
      resource.systemType = editItemState.systemType;
    }
    if (typeof editItemState.description !== 'undefined') {
      resource.description = editItemState.description;
    }
    const postData = {
      resource,
    };
    const responseData = await axios({
      method: 'put',
      url: `${APIPath}resource`,
      crossDomain: true,
      data: postData,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    setEditItemSaving(false);
    if (responseData.status) {
      setEditItemUpdateBtn(
        <span>
          <i className="fa fa-save" /> Update success{' '}
          <i className="fa fa-check" />
        </span>
      );
      setTimeout(() => {
        setEditItemUpdateBtn(
          <span>
            <i className="fa fa-save" /> Update
          </span>
        );
      }, 2000);
    } else {
      setEditItemUpdateBtn(
        <span>
          <i className="fa fa-save" /> Update error{' '}
          <i className="fa fa-times" />
        </span>
      );
      setTimeout(() => {
        setEditItemUpdateBtn(
          <span>
            <i className="fa fa-save" /> Update
          </span>
        );
      }, 2000);
    }
    return false;
  };

  // handle form updates
  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const editItemStateCopy = { ...editItemState };
    editItemStateCopy[name] = value;
    setEditItemState(editItemStateCopy);
  };

  // save annotation item
  const saveResource = async (newResource = null, type = 'add') => {
    if (editItemSaving) {
      return false;
    }
    setEditItemSaving(true);
    setNotificationState({
      visible: true,
      content: (
        <div>
          <span style={{ fontStyle: 'italic' }}>Adding resource...</span>{' '}
          <Spinner color="info" style={{ width: '16px', height: '16px' }} />
        </div>
      ),
      color: 'info',
    });
    let resource = newResource;
    if (type === 'add') {
      const systemType = resourcesTypes.find(
        (rt) => rt.labelId === 'Thumbnail'
      );
      const count = resources.length;
      resource = {
        label: `Temp ${count}`,
        metadata: newResource.ref.metadata,
        resourceType: 'image',
        systemType: systemType._id,
      };
    }
    // save new coordinates
    const postData = {
      resource,
    };
    const responseData = await axios({
      method: 'put',
      url: `${APIPath}resource`,
      crossDomain: true,
      data: postData,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    const newId = Number(responseData.data.data._id);
    const newIndex = resources.length;
    const itemContextMenuStateCopy = itemContextMenuState;
    itemContextMenuStateCopy.itemId = newId;
    itemContextMenuStateCopy.visible = false;
    itemContextMenuStateCopy.index = newIndex;
    setItemContextMenuState(itemContextMenuStateCopy);
    setEditItemSaving(false);
    // create new annotation image file
    const imageFilePostData = {
      itemId: newId,
      sourceId: item._id,
    };
    await axios({
      method: 'put',
      url: `${APIPath}update-annotation-image`,
      crossDomain: true,
      data: imageFilePostData,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      setNotificationState({
        content: (
          <span>
            Saved successfully <i className="fa fa-check" />
          </span>
        ),
        color: 'info',
      });
    } else {
      setNotificationState({
        content: (
          <span>
            Save error <i className="fa fa-times" />
          </span>
        ),
        color: 'info',
      });
    }
    setResourcesLoading(true);
    setTimeout(() => {
      setNotificationState({ visible: false, content: [] });
    }, 2000);
    return false;
  };

  // when item interaction completes return updated values
  const returnValues = async (values) => {
    const { height, rotate, width, x, y, _id: itemId } = values;
    // calculate coordinates
    let top = y;
    let left = x;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const rectTop = rect.top;
    const rectLeft = rect.left;
    const { offsetTop, scrollLeft } = container;
    const dragTop = state.top;
    const dragLeft = state.left;
    const windowOffsetTop = window.pageYOffset;
    left -= Math.abs(rectLeft);
    if (rectTop > 0) {
      top -= Math.abs(offsetTop) - Math.abs(windowOffsetTop);
    } else if (rectTop < 0) {
      if (Math.abs(windowOffsetTop) > Math.abs(offsetTop)) {
        top += Math.abs(windowOffsetTop) - Math.abs(offsetTop);
      } else {
        top += Math.abs(windowOffsetTop);
      }
    }
    if (dragTop < 0) {
      top += Math.abs(dragTop);
    } else if (dragTop > 0) {
      top -= Math.abs(dragTop);
    }
    if (scrollLeft > 0) {
      left += Math.abs(scrollLeft);
    } else if (scrollLeft < 0) {
      left -= Math.abs(scrollLeft);
    }
    if (dragLeft < 0) {
      left += Math.abs(dragLeft);
    } else if (dragLeft > 0) {
      left -= Math.abs(dragLeft);
    }
    const { scale } = state;
    top /= scale;
    left /= scale;
    let resource = null;
    const itemData = await loadEditItem(itemId);
    resource = { ...itemData.data };
    resource.metadata.image.default.height = height;
    resource.metadata.image.default.width = width;
    resource.metadata.image.default.x = left;
    resource.metadata.image.default.y = top;
    resource.metadata.image.default.rotate = rotate;
    await saveResource(resource, 'update');
  };

  // add new annotation item
  const addAnnotation = async () => {
    const nullObject = resources.find((r) => r.ref._id === null);
    if (typeof nullObject !== 'undefined') {
      setNotificationState({
        visible: true,
        color: 'danger',
        content: (
          <p>
            <i className="fa fa-ban" /> You have an unsaved new annotation.{' '}
            <br />
            Please save this annotation before adding a new one!
          </p>
        ),
      });
      setTimeout(() => {
        setNotificationState({ visible: false });
      }, 5000);
      return false;
    }
    let { top } = contextMenuState;
    let { left } = contextMenuState;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const rectTop = rect.top;
    const rectLeft = rect.left;
    const { offsetTop, scrollLeft } = container;
    const dragTop = state.top;
    const dragLeft = state.left;
    const windowOffsetTop = window.pageYOffset;
    left -= Math.abs(rectLeft);
    if (rectTop > 0) {
      top -= Math.abs(offsetTop) - Math.abs(windowOffsetTop);
    } else if (rectTop < 0) {
      if (Math.abs(windowOffsetTop) > Math.abs(offsetTop)) {
        top += Math.abs(windowOffsetTop) - Math.abs(offsetTop);
      } else {
        top += Math.abs(windowOffsetTop);
      }
    }
    if (dragTop < 0) {
      top += Math.abs(dragTop);
    } else if (dragTop > 0) {
      top -= Math.abs(dragTop);
    }
    if (scrollLeft > 0) {
      left += Math.abs(scrollLeft);
    } else if (scrollLeft < 0) {
      left -= Math.abs(scrollLeft);
    }
    if (dragLeft < 0) {
      left += Math.abs(dragLeft);
    } else if (dragLeft > 0) {
      left -= Math.abs(dragLeft);
    }
    const { scale } = state;
    top /= scale;
    left /= scale;
    const newResource = {
      ref: {
        _id: null,
        metadata: {
          image: {
            default: {
              height: 100,
              width: 100,
              y: top,
              x: left,
              extension: 'jpg',
            },
          },
        },
      },
    };
    // store new resource
    await saveResource(newResource, 'add');
    return false;
  };

  const toggleDeleteModal = () => {
    if (!deleteModalVisible) {
      const selectedItem = resources[itemContextMenuState.index];
      let refId;
      let label;
      let systemType;
      let description;
      if (typeof selectedItem.ref._id !== 'undefined') {
        refId = selectedItem.ref._id;
      }
      if (typeof selectedItem.ref.label !== 'undefined') {
        label = selectedItem.ref.label;
      }
      if (typeof selectedItem.ref.systemType !== 'undefined') {
        systemType = selectedItem.ref.systemType;
      }
      if (typeof selectedItem.ref.description !== 'undefined') {
        description = selectedItem.ref.description;
      }
      setEditItemState({
        refId,
        label,
        systemType,
        description,
      });
    }
    setDeleteModalVisible(!deleteModalVisible);
  };

  const deleteItem = async () => {
    const itemId = Number(editItemState.refId);
    const responseData = await axios({
      method: 'delete',
      url: `${APIPath}resource`,
      crossDomain: true,
      params: { _id: itemId },
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      if (editModalVisible) {
        toggleEditModal();
      }
      toggleDeleteModal();
      setResourcesLoading(true);
    }
  };

  // render
  let label = '';
  if (item !== null && typeof item.label !== 'undefined') {
    label = item.label;
  }
  const heading = label;
  const breadcrumbsItems = [
    {
      label: 'Resources',
      icon: 'pe-7s-photo',
      active: false,
      path: '/resources',
    },
    {
      label: heading,
      icon: 'pe-7s-photo',
      active: false,
      path: `/resource/${_id}`,
    },
    { label: 'Annotation tool', icon: 'fa fa-pencil', active: true, path: '' },
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
  if (!loading && item !== null) {
    const fullsizePath = getResourceFullsizeURL(item);
    let annotationsLayer = [];
    if (resources.length > 0 && state.width > 0 && state.height > 0) {
      annotationsLayer = (
        <Suspense fallback={[]}>
          <AnnotationsLayer
            items={resources}
            container={containerRef}
            width={state.width}
            height={state.height}
            itemContextMenuShow={itemContextMenuShow}
            returnValues={returnValues}
          />
        </Suspense>
      );
    }

    const zoomPanel = (
      <div className="zoom-container annotation-tool">
        <div
          className="zoom-action"
          onClick={() => updateZoom('plus')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="zoom plus"
        >
          <i className="fa fa-plus" />
        </div>
        <div
          className="zoom-action"
          onClick={() => updateZoom('minus')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="zoom minus"
        >
          <i className="fa fa-minus" />
        </div>
      </div>
    );

    const panPanel = (
      <div className="pan-container annotation-tool">
        <div
          className="pan-action up"
          onClick={() => updatePan('up')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="pan up"
        >
          <i className="fa fa-chevron-up" />
        </div>

        <div
          className="pan-action right"
          onClick={() => updatePan('right')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="pan right"
        >
          <i className="fa fa-chevron-right" />
        </div>

        <div
          className="pan-action down"
          onClick={() => updatePan('down')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="pan down"
        >
          <i className="fa fa-chevron-down" />
        </div>

        <div
          className="pan-action left"
          onClick={() => updatePan('left')}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="pan left"
        >
          <i className="fa fa-chevron-left" />
        </div>
      </div>
    );

    const imgStyle = {
      width: state.width,
      height: state.height,
      transform: `translateX(${state.left}px) translateY(${state.top}px) scaleX(${state.scale}) scaleY(${state.scale})`,
    };

    const contextMenu = (
      <Suspense fallback={[]}>
        <ContextMenu
          top={contextMenuState.top}
          left={contextMenuState.left}
          visible={contextMenuState.visible}
          onClickFn={addAnnotation}
        />
      </Suspense>
    );
    const itemContextMenu = (
      <Suspense fallback={[]}>
        <ItemContextMenu
          top={itemContextMenuState.top}
          left={itemContextMenuState.left}
          visible={itemContextMenuState.visible}
          itemId={itemContextMenuState.itemId}
          toggleDeleteModalFn={toggleDeleteModal}
          onClickFn={editItem}
        />
      </Suspense>
    );

    // edit/delete item
    const editModal = (
      <Suspense fallback={[]}>
        <EditModal
          visible={editModalVisible}
          toggleFn={toggleEditModal}
          submitFn={updateEditItem}
          itemState={editItemState}
          handleChangeFn={handleChange}
          resourcesTypes={resourcesTypes}
          toggleDeleteModalFn={toggleDeleteModal}
          editItemUpdateBtn={editItemUpdateBtn}
        />
      </Suspense>
    );

    const deleteModal = (
      <Suspense fallback={[]}>
        <DeleteModal
          visible={deleteModalVisible}
          toggleFn={toggleDeleteModal}
          itemState={editItemState}
          deleteFn={deleteItem}
        />
      </Suspense>
    );

    content = (
      <div>
        <Suspense fallback={[]}>
          <Notification
            visible={notificationState.visible}
            content={notificationState.content}
            color={notificationState.color}
          />
        </Suspense>
        {editModal}
        {deleteModal}
        {zoomPanel}
        {panPanel}
        {contextMenu}
        {itemContextMenu}
        <div className="annotation-tool-container" ref={containerRef}>
          <div
            className="annotation-tool-img-container"
            style={imgStyle}
            ref={imgRef}
          >
            {annotationsLayer}
            <div
              draggable="false"
              onContextMenu={(e) => contextMenuShow(e)}
              onDoubleClick={() => updateZoom('plus')}
              onLoad={() => imgLoaded()}
              onDragStart={(e) => {
                e.preventDefault();
              }}
              onMouseDown={(e) => imgDragStart(e)}
              onMouseUp={(e) => imgDragEnd(e)}
              onDragEnd={(e) => imgDragEnd(e)}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="image viewer"
            >
              <img
                className="annotation-tool-img"
                src={fullsizePath}
                alt={label}
                data-type="main-image"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <Suspense fallback={renderLoader()}>
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
};

AnnotateTool.defaultProps = {
  match: null,
};
AnnotateTool.propTypes = {
  match: PropTypes.object,
};

export default AnnotateTool;
