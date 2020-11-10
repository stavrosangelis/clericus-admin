import React, {useState, useEffect} from 'react';
import {
  Card, CardBody,
  Button,
  Form, FormGroup, Label, Input,
  Spinner,
} from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import axios from 'axios';

const APIPath = process.env.REACT_APP_APIPATH;

const Settings = props => {
  const [loading, setLoading] = useState(true);
  let defaultForm = {
    email: "",
  }
  const [formData, setFormData] = useState(defaultForm);
  const [updating, setUpdating] = useState(false);
  const [updateBtn, setUpdateBtn] = useState(<span><i className="fa fa-save" /> Update</span>);

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let settings = await axios({
        method: 'get',
        url: APIPath+'app-settings',
        crossDomain: true,
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      let data = {
        email: settings.email,
      }
      setFormData(data);

    }
    if (loading) {
      load();
    }
  },[loading]);

  const formSubmit = async(e) => {
    e.preventDefault();
    if (updating) {
      return false;
    }
    let postData = {
      email: formData.email,
    };
    setUpdating(true);
    let update = await axios({
      method: 'post',
      url: APIPath+'app-settings',
      crossDomain: true,
      data: postData
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error)
    });
    if (update.status) {
      setUpdateBtn(<span><i className="fa fa-save" /> Update success <i className="fa fa-check" /></span>);
    }
    else {
      setUpdateBtn(<span><i className="fa fa-save" /> Update error <i className="fa fa-times" /></span>);
    }
    setUpdating(false);
    setTimeout(function() {
      setUpdateBtn(<span><i className="fa fa-save" /> Update</span>);
    },2000);
  }

  const handleChange = (e) => {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    let form = Object.assign({},formData);
    form[name] = value;
    setFormData(form);
  }

  /*const testConfiguration = async() => {
    let test = await axios({
      method: 'get',
      url: APIPath+'test-contact',
      crossDomain: true,
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error)
    });
    console.log(test)
  }*/

  // render
  let content = <div className="row">
    <div className="col-12">
      <div style={{padding: '40pt',textAlign: 'center'}}>
        <Spinner type="grow" color="info" /> <i>loading...</i>
      </div>
    </div>
  </div>;

  if (!loading) {
    content = <div className="items-container">
      <Card>
        <CardBody>
          <label>Contact settings</label>
          <Form onSubmit={formSubmit}>
            <FormGroup>
              <Label>Email</Label>
              <Input onChange={handleChange} type="email" name="email" value={formData.email} />
            </FormGroup>
            <div className="text-right">
              {/*<Button type="button" className="pull-left" color="primary" outline size="sm" onClick={()=>testConfiguration()}>Test settings</Button>*/}
              <Button type="submit" outline size="sm">{updateBtn}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  }
  let heading = "Settings";
  let breadcrumbsItems = [{label: heading, icon: "pe-7s-settings", active: true, path: ""}];
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
export default Settings;
