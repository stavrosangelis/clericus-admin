import React, { useEffect, useState, useReducer } from 'react';
import {
  Card, CardBody,
  Input, Button
} from 'reactstrap';
import { Spinner } from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';
import Select from 'react-select';
import {Link} from 'react-router-dom';

import axios from 'axios';
const APIPath = process.env.REACT_APP_APIPATH;

const Highlights = props => {
  const [loading, setLoading] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);

  const [items, setItems] = useState([]);
  const [articles, setArticles] = useState([]);

  const [saving, setSaving] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  const defaultFormData = {
    _id: null,
    order: 0
  }
  const [formData, setFormData] = useReducer(
    (formData, newFormData) => (
    {...formData, ...newFormData}
  ),defaultFormData);

  useEffect(()=> {
    const load = async() => {
      setLoading(false);
      let responseData = await axios({
        method: 'get',
        url: APIPath+'highlights',
        crossDomain: true,
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      setItems(responseData);
    }
    if (loading) {
      load();
    }
  },[loading]);

  useEffect(()=> {
    const load = async() => {
      setLoadingArticles(false);
      let params = {
        page: 1,
        limit: 500,
        orderField: "label",
        status: 'public',
      };
      let responseData = await axios({
        method: 'get',
        url: APIPath+'articles',
        crossDomain: true,
        params: params
      })
      .then(function (response) {
        return response.data.data;
      })
      .catch(function (error) {
      });
      setArticles(responseData.data);
    }
    if (loadingArticles) {
      load();
    }
  },[loadingArticles]);

  const select2Change = (selectedOption, element=null) => {
    if (element===null) {
      return false;
    }
    setFormData({
      [element]: selectedOption
    });
  }
  const handleChange = (e) => {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    setFormData({
      [name]: value
    });
  }

  const addNew = async () => {
    if (saving || formData._id===null) {
      return false;
    }
    setSaving(true);
    let postData = {
      _id: formData._id.value,
      order: formData.order
    };
    let responseData = await axios({
      method: 'put',
      url: APIPath+'highlight',
      crossDomain: true,
      data: postData
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
    });
    setSaving(false);
    if(responseData.status) {
      setLoading(true);
      setFormData({
        _id: null,
        order: 0
      });
    }
  }
  
  const removeHighlight = async (_id) => {
    if (_id===null) {
      return false;
    }
    let responseData = await axios({
      method: 'delete',
      url: APIPath+'highlight',
      crossDomain: true,
      data: {
        _id: _id
      }
    })
    .then(function (response) {
      return response.data.data;
    })
    .catch(function (error) {
    });
    if(responseData.status) {
      setLoading(true);
    }
  }

  const heading = "Highlights";
  let breadcrumbsItems = [
    {label: heading, icon: "pe-7s-browser", active: true, path: ""}
  ];

  const updateOrder = async(_id, direction) => {
    if (updatingOrder) {
      return false;
    }
    setUpdatingOrder(true);
    let item = items.find(i=>i._id===_id);
    if (typeof item!=="undefined") {
      let index = items.indexOf(item);
      let newIndex = index+direction;
      let otherItem = items[newIndex];
      if (typeof otherItem==="undefined") {
        setUpdatingOrder(false);
        return false;
      }
      let newItemOrder = Number(item.highlightOrder)+direction;
      let newOtherItemOrder = Number(otherItem.highlightOrder)-direction;
      let responseData = await axios({
        method: 'put',
        url: APIPath+'highlights',
        crossDomain: true,
        data: {
          item: {
            _id: _id,
            order: newItemOrder
          },
          otherItem: {
            _id: otherItem._id,
            order: newOtherItemOrder
          }
        }
      })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
      });
      if(responseData.status) {
        setLoading(true);
      }
    }
    setUpdatingOrder(false);
  }

  let content = <div className="row">
    <div className="col-12">
      <div style={{padding: '40pt',textAlign: 'center'}}>
        <Spinner type="grow" color="info" /> <i>loading...</i>
      </div>
    </div>
  </div>;
  if (!loading && !loadingArticles) {
    let articlesOptions = [];
    if (articles.length>0) {
      articlesOptions = articles.map(a=>{return{value:a._id,label:a.label}})
    }
    let itemsHTML=items.map((item,i)=>{
      let order = Number(item.highlightOrder);
      let _id = item._id;
      let updateOrderUp = <div className="up" onClick={()=>updateOrder(_id,-1)}>
        <i className="fa fa-caret-up" />
      </div>;
      let updateOrderDown = <div className="down" onClick={()=>updateOrder(_id,+1)}>
        <i className="fa fa-caret-down" />
      </div>;
      if (i===0) {
        updateOrderUp = [];
      }
      if (i===items.length-1) {
        updateOrderDown = [];
      }
      return <tr key={i}>
        <td><small>{i+1}</small>.</td>
        <td><Link href={`/article/${_id}`} to={`/article/${_id}`}>{item.label}</Link></td>
        <td>{order}</td>
        <td style={{width: "20px"}}>
          <div className="update-direction-container">
            {updateOrderUp}
            {updateOrderDown}
          </div>
        </td>
        <td>
          {" "}<Button color="danger" outline size="sm" className="edit-item" onClick={()=>removeHighlight(item._id)}>
            <i className="fa fa-trash" />
          </Button>
        </td>
      </tr>
    })
    content = <div className="items-container">
      <Card>
        <CardBody>
          <div className="row" style={{borderBottom: "1px solid #ddd",marginBottom: "10px",paddingBottom: "10px"}}>
            <div className="col-12 col-sm-8">
              <Select
                name="_id"
                value={formData._id}
                onChange={(selectedOption)=>select2Change(selectedOption, "_id")}
                options={articlesOptions}
              />
            </div>
            <div className="col-12 col-sm-4">
              <Input type="number" name="order" value={formData.order} onChange={handleChange} placeholder="0" style={{height: "38px",width:"70px",display: "inline-block",marginRight: "10px"}}/>
              <Button type="button" color="info" size="sm" onClick={()=>addNew()}>Add new <i className="fa fa-plus" /></Button>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{width: "20px"}}>#</th>
                    <th>Label</th>
                    <th style={{width: "20px"}}>Order</th>
                    <th style={{width: "40px"}}></th>
                    <th style={{width: "40px"}}></th>
                  </tr>
                </thead>
                <tbody>
                  {itemsHTML}
                </tbody>
                <tfoot>
                  <tr>
                    <th>#</th>
                    <th>Label</th>
                    <th>Order</th>
                    <th></th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  }
  return(
    <div>
    <Breadcrumbs items={breadcrumbsItems} />
      <div className="row">
        <div className="col-12">
          <h2>{heading} <small>({items.length})</small></h2>
        </div>
      </div>
      {content}
    </div>
  );
}
export default Highlights;
