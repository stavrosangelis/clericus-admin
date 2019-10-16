import React, { useState } from 'react';
import {
  Button, Form, FormGroup, Label, Input,
  Card, CardBody,
  Spinner
} from 'reactstrap';
import {Breadcrumbs} from '../../components/breadcrumbs';
import axios from 'axios';
const APIPath = process.env.REACT_APP_APIPATH;

const DocumentOCR = (props) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(null);
  const [uploadBtn, setUploadBtn] = useState(<span><i className="fa fa-upload" /> Upload</span>);

  const handleChange = (e) => {
    let target = e.target;
    let newFile = target.files[0];
    setFile(newFile);
  }

  const uploadFile = (e) => {
    e.preventDefault();
    if (uploading || file===null) {
      return false;
    }
    setUploading(true);
    setUploadBtn(<span><i className="fa fa-upload" /> <i>Uploading...</i> <Spinner size="sm" color="light" /></span>);
    let url = APIPath+"ocr-document";
    let postData = new FormData();
    postData.append("file",file);
    let contentLength = postData.length;
    axios({
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
      setUploading(false);
      setUploadBtn(<span><i className="fa fa-upload" /> Upload success <i className="fa fa-check" /></span>)
      setTimeout(function() {
        setUploadBtn(<span><i className="fa fa-upload" /> Upload</span>)
      },1000);

    })
    .catch(function (response) {
        console.log(response);
    });
  }

  let heading = "OCR Document";
  let breadcrumbsItems = [
    {label: heading, icon: "pe-7s-tools", active: false, path: "/ocr-document"},
  ];
  let previewImg = [];
  if (file!==null) {
    previewImg = <img src={file} alt="" />
  }
  return (
    <div>
      <Breadcrumbs items={breadcrumbsItems} />
      <div className="row">
        <div className="col-12">
          <h2>{heading}</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <Card>
            <CardBody>
              <div className="preview">
                {previewImg}
              </div>
              <Form onSubmit={(e)=>uploadFile(e)}>
                <FormGroup>
                  <Label><Button color="secondary" outline>Select file</Button></Label>
                  <Input type="file" name="file" onChange={(e)=>handleChange(e)}/>
                </FormGroup>
                <Button color="secondary">{uploadBtn}</Button>
              </Form>
            </CardBody>
          </Card>
        </div>
      </div>

    </div>
  )
}

export default DocumentOCR;
