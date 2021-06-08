import React, { useEffect, useState, useReducer } from 'react';
import { Card, CardBody, Input, Button, Spinner } from 'reactstrap';

import Select from 'react-select';
import { Link } from 'react-router-dom';

import axios from 'axios';
import Breadcrumbs from '../components/breadcrumbs';

const APIPath = process.env.REACT_APP_APIPATH;

const Highlights = () => {
  const [loading, setLoading] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);

  const [items, setItems] = useState([]);
  const [articles, setArticles] = useState([]);

  const [saving, setSaving] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  const defaultFormData = {
    _id: null,
    order: 0,
  };
  const [formData, setFormData] = useReducer(
    (curFormData, newFormData) => ({ ...curFormData, ...newFormData }),
    defaultFormData
  );

  useEffect(() => {
    const load = async () => {
      setLoading(false);
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}highlights`,
        crossDomain: true,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      setItems(responseData);
    };
    if (loading) {
      load();
    }
  }, [loading]);

  useEffect(() => {
    const load = async () => {
      setLoadingArticles(false);
      const params = {
        page: 1,
        limit: 500,
        orderField: 'label',
        status: 'public',
      };
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}articles`,
        crossDomain: true,
        params,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      setArticles(responseData.data);
    };
    if (loadingArticles) {
      load();
    }
  }, [loadingArticles]);

  const select2Change = (selectedOption, element = null) => {
    if (element === null) {
      return false;
    }
    setFormData({
      [element]: selectedOption,
    });
    return false;
  };

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    setFormData({
      [name]: value,
    });
  };

  const addNew = async () => {
    if (saving || formData._id === null) {
      return false;
    }
    setSaving(true);
    const postData = {
      _id: formData._id.value,
      order: formData.order,
    };
    const responseData = await axios({
      method: 'put',
      url: `${APIPath}highlight`,
      crossDomain: true,
      data: postData,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    setSaving(false);
    if (responseData.status) {
      setLoading(true);
      setFormData({
        _id: null,
        order: 0,
      });
    }
    return false;
  };

  const removeHighlight = async (_id) => {
    if (_id === null) {
      return false;
    }
    const responseData = await axios({
      method: 'delete',
      url: `${APIPath}highlight`,
      crossDomain: true,
      data: {
        _id,
      },
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      setLoading(true);
    }
    return false;
  };

  const heading = 'Highlights';
  const breadcrumbsItems = [
    { label: heading, icon: 'pe-7s-browser', active: true, path: '' },
  ];

  const updateOrder = async (_id, direction) => {
    if (updatingOrder) {
      return false;
    }
    setUpdatingOrder(true);
    const item = items.find((i) => i._id === _id);
    if (typeof item !== 'undefined') {
      const index = items.indexOf(item);
      const newIndex = index + direction;
      const otherItem = items[newIndex];
      if (typeof otherItem === 'undefined') {
        setUpdatingOrder(false);
        return false;
      }
      const newItemOrder = Number(item.highlightOrder) + direction;
      const newOtherItemOrder = Number(otherItem.highlightOrder) - direction;
      const responseData = await axios({
        method: 'put',
        url: `${APIPath}highlights`,
        crossDomain: true,
        data: {
          item: {
            _id,
            order: newItemOrder,
          },
          otherItem: {
            _id: otherItem._id,
            order: newOtherItemOrder,
          },
        },
      })
        .then((response) => response.data)
        .catch((error) => {
          console.log(error);
        });
      if (responseData.status) {
        setLoading(true);
      }
    }
    setUpdatingOrder(false);
    return false;
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
  if (!loading && !loadingArticles) {
    let articlesOptions = [];
    if (articles.length > 0) {
      articlesOptions = articles.map((a) => ({ value: a._id, label: a.label }));
    }
    const itemsHTML = items.map((item, i) => {
      const order = Number(item.highlightOrder);
      const { _id } = item;
      let updateOrderUp = (
        <div
          className="up"
          onClick={() => updateOrder(_id, -1)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="update ordering desc"
        >
          <i className="fa fa-caret-up" />
        </div>
      );
      let updateOrderDown = (
        <div
          className="down"
          onClick={() => updateOrder(_id, +1)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="update ordering asc"
        >
          <i className="fa fa-caret-down" />
        </div>
      );
      if (i === 0) {
        updateOrderUp = [];
      }
      if (i === items.length - 1) {
        updateOrderDown = [];
      }
      const key = `a${i}`;
      return (
        <tr key={key}>
          <td>
            <small>{i + 1}</small>.
          </td>
          <td>
            <Link href={`/article/${_id}`} to={`/article/${_id}`}>
              {item.label}
            </Link>
          </td>
          <td>{order}</td>
          <td style={{ width: '20px' }}>
            <div className="update-direction-container">
              {updateOrderUp}
              {updateOrderDown}
            </div>
          </td>
          <td>
            {' '}
            <Button
              color="danger"
              outline
              size="sm"
              className="edit-item"
              onClick={() => removeHighlight(item._id)}
            >
              <i className="fa fa-trash" />
            </Button>
          </td>
        </tr>
      );
    });
    content = (
      <div className="items-container">
        <Card>
          <CardBody>
            <div
              className="row"
              style={{
                borderBottom: '1px solid #ddd',
                marginBottom: '10px',
                paddingBottom: '10px',
              }}
            >
              <div className="col-12 col-sm-8">
                <Select
                  name="_id"
                  value={formData._id}
                  onChange={(selectedOption) =>
                    select2Change(selectedOption, '_id')
                  }
                  options={articlesOptions}
                />
              </div>
              <div className="col-12 col-sm-4">
                <Input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  placeholder="0"
                  style={{
                    height: '38px',
                    width: '70px',
                    display: 'inline-block',
                    marginRight: '10px',
                  }}
                />
                <Button
                  type="button"
                  color="info"
                  size="sm"
                  onClick={() => addNew()}
                >
                  Add new <i className="fa fa-plus" />
                </Button>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '20px' }}>#</th>
                      <th>Label</th>
                      <th style={{ width: '20px' }}>Order</th>
                      <th style={{ width: '40px' }} aria-label="text" />
                      <th style={{ width: '40px' }} aria-label="edit" />
                    </tr>
                  </thead>
                  <tbody>{itemsHTML}</tbody>
                  <tfoot>
                    <tr>
                      <th>#</th>
                      <th>Label</th>
                      <th>Order</th>
                      <th aria-label="text" />
                      <th aria-label="edit" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
  return (
    <div>
      <Breadcrumbs items={breadcrumbsItems} />
      <div className="row">
        <div className="col-12">
          <h2>
            {heading} <small>({items.length})</small>
          </h2>
        </div>
      </div>
      {content}
    </div>
  );
};
export default Highlights;
