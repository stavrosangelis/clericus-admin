import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Button,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Spinner,
} from 'reactstrap';
import classnames from 'classnames';
import axios from 'axios';
// import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';

const APIPath = process.env.REACT_APP_APIPATH;

const ArticleImageBrowser = (props) => {
  // props
  const { featuredImgFn, toggle, reload, modal } = props;

  // state
  const [loading, setLoading] = useState(true);
  const [dir, setDir] = useState('');
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const [featuredImage, setFeaturedImage] = useState(null);

  const loadDir = (value) => {
    let newDir = value;
    if (!newDir.endsWith('/')) {
      newDir += '/';
    }
    setDir(newDir);
    setLoading(true);
  };

  const selectFile = (_id) => {
    setFeaturedImage(_id);
  };

  const returnFile = (_id = null) => {
    let copyId = _id;
    if (copyId === null) {
      copyId = featuredImage;
    }
    featuredImgFn(copyId);
    toggle();
  };

  /* const moveUp = () => {
    let dirs = dir.split("/");
    dirs.pop();
    dirs.pop();
    let newDir = dirs.join("/");
    setDir(`${newDir}/`);
    setLoading(true);
  } */

  const blob = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newBlob = new Blob([new Uint8Array(e.target.result)], {
        type: file.type,
      });
      return newBlob;
    };
    reader.readAsArrayBuffer(file);
    return file;
  };

  const uploadFile = async (file) => {
    if (uploading) {
      return false;
    }
    setUploading(true);
    const url = `${APIPath}upload-file`;
    const postData = new FormData();
    postData.append('file', blob(file), file.name);
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
    setUploaded(true);
    toggleTab('1');
    return responseData;
  };

  const deleteFile = async (_id) => {
    const data = { _id };
    const responseData = await axios({
      method: 'delete',
      url: `${APIPath}uploaded-file`,
      crossDomain: true,
      data,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      setLoading(true);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(false);
      const params = {};
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}uploaded-files`,
        crossDomain: true,
        params,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      setItems(responseData.data);
    };
    if (loading) {
      load();
    }
    if (uploaded) {
      load();
      setUploaded(false);
    }
    if (reload) {
      load();
    }
  }, [loading, dir, uploaded, reload]);

  /* const onDrop = (acceptedFiles) => {
    uploadFile(acceptedFiles[0]);
  }; */

  // const { getRootProps } = useDropzone({ onDrop });

  const openFileDialog = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = null;
      inputRef.current.click();
    }
  }, []);

  const handleFileChange = (e) => {
    const { target } = e;
    const value = target.files;
    uploadFile(value[0]);
  };

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
    const itemsHTML = items.map((item, i) => {
      let active = '';
      if (featuredImage === item._id) {
        active = 'active';
      }
      const thumbPath = item.paths.find((p) => p.pathType === 'thumbnail').path;
      const fullPath = item.paths.find((p) => p.pathType === 'source').path;
      const itemHTML = (
        <div
          className={`col-xs-12 col-sm-3 col-lg-2 image-file ${active}`}
          key={item._id}
          onDoubleClick={() => returnFile(item._id)}
        >
          <a
            href={fullPath}
            target="_blank"
            rel="noopener noreferrer"
            className="show-featured-image btn btn-outline-primary"
          >
            <i className="fa fa-eye" />
          </a>
          <div
            style={{ display: 'inline-block' }}
            onClick={() => selectFile(item._id)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="select file"
          >
            <img src={thumbPath} alt="" className="img-fluid" />
          </div>
          <Button
            outline
            color="danger"
            size="sm"
            onClick={() => deleteFile(item._id)}
            className="remove-featured-image"
          >
            <i className="fa fa-trash-o" />
          </Button>
          <Label onClick={() => selectFile(item._id)}>{item.filename}</Label>
        </div>
      );
      return itemHTML;
    });

    content = (
      <div>
        <Nav tabs className="uploaded-files-tabs">
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '1' })}
              onClick={() => {
                toggleTab('1');
              }}
            >
              Browse
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '2' })}
              onClick={() => {
                toggleTab('2');
              }}
            >
              Upload new
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <div className="row">
              <div className="col-12">
                <div className="images-browser row">{itemsHTML}</div>
              </div>
            </div>
          </TabPane>
          <TabPane tabId="2">
            <div className="dropzone-container">
              <div
                className="browse-img-btn"
                onClick={() => openFileDialog()}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="open file dialog"
              >
                Browse for an Image
              </div>
              <input
                type="file"
                style={{ display: 'none' }}
                ref={inputRef}
                onChange={(e) => handleFileChange(e)}
              />
              <div className="browse-img-or">OR</div>
              {/* <div {...getRootProps()} className="dropzone-box">
                <p>DROP AN IMAGE HERE</p>
              </div> */}
            </div>
          </TabPane>
        </TabContent>
      </div>
    );
  }

  const dirPathItemPath = (i) => {
    const dirs = dir.split('/');
    let newDir = '';
    for (let j = 0; j < i; j += 1) {
      const d = dirs[j];
      newDir += d;
      if (!newDir.endsWith('/')) {
        newDir += '/';
      }
    }
    return newDir;
  };

  const dirs = dir.split('/');
  const dirHTML = [];
  for (let i = 0; i < dirs.length; i += 1) {
    const d = dirs[i];
    const newDir = dirPathItemPath(i);
    let icon = [];
    if (i > 0 && i < dirs.length - 1) {
      icon = <i className="fa fa-chevron-right" />;
    }
    const newPathItem = (
      <div key={i} className="dir-path-item">
        {icon}{' '}
        <span
          onClick={() => loadDir(newDir)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="open directory"
        >
          {d}
        </span>
      </div>
    );
    dirHTML.push(newPathItem);
  }
  return (
    <Modal
      isOpen={modal}
      toggle={toggle}
      className="images-browser-modal"
      size="lg"
    >
      <ModalHeader toggle={toggle}>Browse images</ModalHeader>
      <ModalBody className="uploaded-files-modal-body">{content}</ModalBody>
      <ModalFooter className="text-left">
        <Button color="secondary" size="sm" onClick={toggle}>
          Cancel
        </Button>
        <Button
          className="pull-right"
          color="info"
          size="sm"
          onClick={() => returnFile(null)}
        >
          Ok
        </Button>
      </ModalFooter>
    </Modal>
  );
};

ArticleImageBrowser.defaultProps = {
  featuredImgFn: () => {},
  toggle: () => {},
  reload: false,
  modal: false,
};

ArticleImageBrowser.propTypes = {
  featuredImgFn: PropTypes.func,
  toggle: PropTypes.func,
  reload: PropTypes.bool,
  modal: PropTypes.bool,
};

export default ArticleImageBrowser;
