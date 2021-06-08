import React, { useState } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardBody,
  Spinner,
} from 'reactstrap';
import axios from 'axios';
import Breadcrumbs from '../../components/breadcrumbs';

const APIPath = process.env.REACT_APP_APIPATH;

const DocumentOCR = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(null);
  const [uploadBtn, setUploadBtn] = useState(
    <span>
      <i className="fa fa-upload" /> Upload
    </span>
  );

  const handleChange = (e) => {
    const { target } = e;
    const newFile = target.files[0];
    setFile(newFile);
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    if (uploading || file === null) {
      return false;
    }
    setUploading(true);
    setUploadBtn(
      <span>
        <i className="fa fa-upload" /> <i>Uploading...</i>{' '}
        <Spinner size="sm" color="light" />
      </span>
    );
    const url = `${APIPath}ocr-document`;
    const postData = new FormData();
    postData.append('file', file);
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
      .then(() => true)
      .catch((response) => {
        console.log(response);
      });
    if (responseData) {
      setUploading(false);
      setUploadBtn(
        <span>
          <i className="fa fa-upload" /> Upload success{' '}
          <i className="fa fa-check" />
        </span>
      );
      setTimeout(() => {
        setUploadBtn(
          <span>
            <i className="fa fa-upload" /> Upload
          </span>
        );
      }, 1000);
    }
    return false;
  };

  const heading = 'OCR Document';
  const breadcrumbsItems = [
    {
      label: heading,
      icon: 'pe-7s-tools',
      active: false,
      path: '/ocr-document',
    },
  ];
  let previewImg = [];
  if (file !== null) {
    previewImg = <img src={file} alt="" />;
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
              <div className="preview">{previewImg}</div>
              <Form onSubmit={(e) => uploadFile(e)}>
                <FormGroup>
                  <Label>
                    <Button color="secondary" outline>
                      Select file
                    </Button>
                  </Label>
                  <Input
                    type="file"
                    name="file"
                    onChange={(e) => handleChange(e)}
                  />
                </FormGroup>
                <Button color="secondary">{uploadBtn}</Button>
              </Form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentOCR;
