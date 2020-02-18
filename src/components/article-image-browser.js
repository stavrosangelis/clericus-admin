import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Button,
  Modal, ModalHeader, ModalBody, ModalFooter,
  TabContent, TabPane, Nav, NavItem, NavLink,
  Spinner,
} from 'reactstrap';
import classnames from 'classnames';
import axios from 'axios';
import {useDropzone} from 'react-dropzone'

const APIPath = process.env.REACT_APP_APIPATH;

const ArticleImageBrowser = props => {
  const [loading, setLoading] = useState(true);
  const [dir, setDir] = useState("");
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const toggleTab = (tab) => {
    if(activeTab !== tab) setActiveTab(tab);
  }

  const [featuredImage, setFeaturedImage] = useState(null);

  const loadDir = (value) => {
    let newDir = value;
    if (!newDir.endsWith("/")) {
      newDir+="/";
    }
    setDir(newDir);
    setLoading(true);
  }

  const selectFile = (_id) => {
    setFeaturedImage(_id);
  }

  const returnFile = (_id=null) => {
    if (_id===null) {
      _id = featuredImage;
    }
    props.featuredImgFn(_id);
    props.toggle();
  }

  /*const moveUp = () => {
    let dirs = dir.split("/");
    dirs.pop();
    dirs.pop();
    let newDir = dirs.join("/");
    setDir(`${newDir}/`);
    setLoading(true);
  }*/

  const uploadFile = async(file)=> {
    if (uploading) {
      return false;
    }
    setUploading(true);
    let url = APIPath+"upload-file";
    let postData = new FormData();
    postData.append("file",blob(file), file.name);
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
    setUploaded(true);
    toggleTab("1");
    return responseData;
  }

  const deleteFile = async(_id) => {
    let data = {_id: _id};
    let responseData = await axios({
      method: 'delete',
      url: APIPath+'uploaded-file',
      crossDomain: true,
      data: data
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
    if (responseData.status) {
      setLoading(true);
    }
  }

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let params = {};
      let responseData = await axios({
        method: 'get',
        url: APIPath+'uploaded-files',
        crossDomain: true,
        params: params
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      setItems(responseData.data);
    }
    if (loading) {
      load();
    }
    if (uploaded) {
      load();
      setUploaded(false);
    }
    if (props.reload) {
      load();
    }
  },[loading, dir, uploaded, props.reload]);

  const onDrop = (acceptedFiles) => {
    uploadFile(acceptedFiles[0]);
  }

  const {getRootProps} = useDropzone({onDrop});

  const openFileDialog = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = null
      inputRef.current.click()
    }
  }, []);

  const handleFileChange = (e) => {
    let target = e.target;
    let value = target.files;
    uploadFile(value[0]);
  }

  const blob = (file)=>{
    let reader = new FileReader();
    reader.onload = (e) => {
      let blob = new Blob([new Uint8Array(e.target.result)], {type: file.type });
      return blob;
    }
    reader.readAsArrayBuffer(file);
    return file;
  }

  let content = <div className="row">
      <div className="col-12">
        <div style={{padding: '40pt',textAlign: 'center'}}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>;

  if (!loading) {
    let itemsHTML = items.map((item,i)=>{
      let active = "";
      if (featuredImage===item._id) {
        active = " active";
      }
      let thumbPath = item.paths.find(p=>p.pathType==="thumbnail").path;
      let fullPath = item.paths.find(p=>p.pathType==="source").path;
      let itemHTML = <div className={"image-file"+active} key={i} onDoubleClick={()=>returnFile(item._id)}>
        <a href={fullPath} target="_blank" rel="noopener noreferrer" className="show-featured-image btn btn-outline-primary"><i className="fa fa-eye" /></a>
        <img src={thumbPath} alt="" className="img-fluid" onClick={()=>selectFile(item._id)} />
        <Button outline color="danger" size="sm" onClick={()=>deleteFile(item._id)} className="remove-featured-image"><i className="fa fa-trash-o" /></Button>
        <label onClick={()=>selectFile(item._id)}>{item.filename}</label>
      </div>;
      return itemHTML;
    });

    content = <div>
      <Nav tabs className="uploaded-files-tabs">
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === '1' })}
            onClick={() => { toggleTab('1'); }}
          >Browse</NavLink>
        </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '2' })}
              onClick={() => { toggleTab('2'); }}
            >Upload new</NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <div className="row">
                <div className="col-12">
                  <div className="images-browser">
                    {itemsHTML}
                  </div>
                </div>
            </div>
          </TabPane>
          <TabPane tabId="2">
            <div className="dropzone-container">
              <div className="browse-img-btn" onClick={()=>openFileDialog()}>Browse for an Image</div>
              <input type="file" style={{display: "none"}} ref={inputRef} onChange={(e)=>handleFileChange(e)}/>
              <div className="browse-img-or">OR</div>
              <div {...getRootProps()} className="dropzone-box">
                {
                  <p>DROP AN IMAGE HERE</p>
                }
              </div>
            </div>
          </TabPane>
        </TabContent>
      </div>;
  }

  const dirPathItemPath = (i) => {
    let dirs = dir.split("/");
    let newDir = "";
    for (let j=0;j<i;j++) {
      let d = dirs[j];
      newDir +=d;
      if (!newDir.endsWith("/")) {
        newDir+="/";
      }
    }
    return newDir;
  }

  let dirs = dir.split("/");
  let dirHTML = [];
  for (let i=0;i<dirs.length; i++) {
    let d = dirs[i];
    let newDir = dirPathItemPath(i);
    let icon = [];
    if (i>0 && i<dirs.length-1) {
      icon = <i className="fa fa-chevron-right" />;
    }
    let newPathItem = <div key={i} className="dir-path-item">{icon} <span onClick={()=>loadDir(newDir)}>{d}</span></div>
    dirHTML.push(newPathItem);
  };
  return (
    <Modal isOpen={props.modal} toggle={props.toggle} className="images-browser-modal" size="lg">
      <ModalHeader toggle={props.toggle}>Browse images</ModalHeader>
      <ModalBody className="uploaded-files-modal-body">
        {content}
      </ModalBody>
      <ModalFooter className="text-left">
        <Button color="secondary" size="sm" onClick={props.toggle}>Cancel</Button>
        <Button className="pull-right" color="info" size="sm" onClick={()=>returnFile(null)}>Ok</Button>
      </ModalFooter>
    </Modal>
  )
}

export default ArticleImageBrowser;
