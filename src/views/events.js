import React, { Component } from 'react';
import {
  Table,
  Button,
  Card, CardBody, CardFooter,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';

import axios from 'axios';
import PageActions from '../components/page-actions';
import {getEventThumbnailURL} from '../helpers/helpers'


const APIPath = process.env.REACT_APP_APIPATH;
export default class Events extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      tableLoading: true,
      items: [],
      page: 1,
      gotoPage: 1,
      limit: 25,
      totalPages: 0,
      totalItems: 0,
      allChecked: false,
      deleteModalOpen: false
    }
    this.load = this.load.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.itemsTableRows = this.itemsTableRows.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleSelectedAll = this.toggleSelectedAll.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.deleteItemsList = this.deleteItemsList.bind(this);
    this.deleteSelected = this.deleteSelected.bind(this);
  }

  load() {
    this.setState({
      tableLoading: true
    })
    let context = this;
    let params = {
      page: this.state.page,
      limit: this.state.limit
    }
    let url = APIPath+'events';
    axios({
        method: 'get',
        url: url,
        crossDomain: true,
        params: params
      })
  	  .then(function (response) {
        let responseData = response.data.data;
        let items = responseData.data;
        let newItems = [];
        for (let i=0;i<items.length; i++) {
          let item = items[i];
          item.checked = false;
          newItems.push(item);
        }
        context.setState({
          loading: false,
          tableLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          items: newItems
        });

  	  })
  	  .catch(function (error) {
  	  });
  }

  updatePage(e) {
    if (e>0 && e!==this.state.page) {
      this.setState({
        page: e,
        gotoPage: e,
      })
      let context = this;
      setTimeout(function(){
        context.load();
      },100);
    }
  }

  gotoPage(e) {
    e.preventDefault();
    let gotoPage = this.state.gotoPage;
    let page = this.state.page;
    if (gotoPage>0 && gotoPage!==page) {
      this.setState({
        page: gotoPage
      })
      let context = this;
      setTimeout(function(){
        context.load();
      },100);
    }
  }

  updateLimit(limit) {
    this.setState({
      limit: limit
    })
    let context = this;
    setTimeout(function(){
      context.load();
    },100)
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  itemsTableRows() {
    let items = this.state.items;
    let rows = [];
    for (let i=0;i<items.length; i++) {
      let item = items[i];
      let countPage = parseInt(this.state.page,10)-1;
      let count = (i+1) + (countPage*this.state.limit);
      let label = item.label;
      let locationLabel = "";
      let timeLabel = "";
      if (typeof item.spatial!=="undefined" && item.spatial!==null) {
        if (typeof item.spatial.ref!=="undefined" && typeof item.spatial.ref.label!=="undefined") {
          locationLabel = item.spatial.ref.label;
        }
      }
      if (typeof item.temporal!=="undefined" && item.temporal!==null) {
        if (typeof item.temporal.ref!=="undefined" && typeof item.temporal.ref.label!=="undefined") {
          timeLabel = item.temporal.ref.label;
        }
      }
      let thumbnailImage = [];
      let thumbnailURL = getEventThumbnailURL(item);
      if (thumbnailURL!==null) {
        thumbnailImage = <Link href={"/event/"+item._id} to={"/event/"+item._id}><img src={thumbnailURL} className="items-list-thumbnail img-fluid img-thumbnail" alt={label} /></Link>
      }
      let row = <tr key={i}>
        <td>
          <div className="select-checkbox-container">
            <input type="checkbox" value={i} checked={items[i].checked} onChange={() => {return false}}/>
            <span className="select-checkbox" onClick={this.toggleSelected.bind(this,i)}></span>
          </div>
        </td>
        <td>{count}</td>
        <td>
          {thumbnailImage}
          <Link href={"/event/"+item._id} to={"/event/"+item._id}>{label}</Link>
        </td>
        <td>{locationLabel}</td>
        <td>{timeLabel}</td>
        <td><Link href={"/event/"+item._id} to={"/event/"+item._id} className="edit-item"><i className="fa fa-pencil" /></Link></td>
      </tr>
      rows.push(row);
    }
    return rows;
  }

  toggleSelected(i) {
    let items = this.state.items;
    let newPersonChecked = !items[i].checked;
    items[i].checked = newPersonChecked;
    this.setState({
      items: items
    });
  }

  toggleSelectedAll() {
    let allChecked = !this.state.allChecked;
    let items = this.state.items;
    let newItems = [];
    for (let i=0;i<items.length; i++) {
      let item = items[i];
      item.checked = allChecked;
      newItems.push(item);
    }
    this.setState({
      items: newItems,
      allChecked: allChecked
    })
  }

  toggleDeleteModal() {
    this.setState({
      deleteModalOpen: !this.state.deleteModalOpen
    })
  }

  deleteItemsList(){
    let items = this.state.items;
    let rows = [];
    for (let i=0;i<items.length; i++) {
      let item = items[i];
      if (item.checked) {
        let countPage = parseInt(this.state.page,10)-1;
        let count = (i+1) + (countPage*this.state.limit);
        let item = items[i];
        let label = item.label;
        let locationLabel = "";
        let timeLabel = "";
        if (typeof item.spatial!=="undefined") {
          //locationLabel = item.spatial.label;
        }
        if (typeof item.temporal!=="undefined") {
          //timeLabel = item.temporal.label;
        }
        let thumbnailImage = [];
        let thumbnailURL = getEventThumbnailURL(item);
        if (thumbnailURL!==null) {
          thumbnailImage = <img src={thumbnailURL} className="items-list-thumbnail img-fluid img-thumbnail" alt={label} />
        }
        let row = <tr key={i}>
          <td>{count}</td>
          <td>{thumbnailImage}</td>
          <td>{locationLabel}</td>
          <td>{timeLabel}</td>
        </tr>
        rows.push(row);
      }
    }
    return rows;
  }

  deleteSelected() {
    let items = this.state.items;
    let newItems = [];
    for (let i=0; i<items.length; i++) {
      let item = items[i];
      if (item.checked) {
        newItems.push(item._id)
      }
    }
    let context = this;
    let data = {
      _ids: newItems,
    }
    let url = APIPath+'items';
    axios({
        method: 'delete',
        url: url,
        crossDomain: true,
        data: data
      })
  	  .then(function (response) {
        context.setState({
          allChecked: false,
          deleteModalOpen: false,
        })
        context.load();

  	  })
  	  .catch(function (error) {
  	  });
  }

  componentDidMount() {
    this.load();
  }

  render() {
    let heading = "Events";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-users", active: true, path: ""}
    ];

    let pageActions = <PageActions
      limit={this.state.limit}
      current_page={this.state.page}
      gotoPageValue={this.state.gotoPage}
      total_pages={this.state.totalPages}
      updatePage={this.updatePage}
      gotoPage={this.gotoPage}
      handleChange={this.handleChange}
      updateLimit={this.updateLimit}
    />
    let content = <div>
      {pageActions}
      <div className="row">
        <div className="col-12">
          <div style={{padding: '40pt',textAlign: 'center'}}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
      {pageActions}
    </div>
    if (!this.state.loading) {
      let tableLoadingSpinner = <tr>
        <td colSpan={6}><Spinner type="grow" color="info" /> <i>loading...</i></td>
      </tr>;
      let itemsRows = [];
      if (this.state.tableLoading) {
        itemsRows = tableLoadingSpinner;
      }
      else {
        itemsRows = this.itemsTableRows();
      }
      let allChecked = "";
      if (this.state.allChecked) {
        allChecked = "checked";
      }

      let deleteItemsList = this.deleteItemsList();
      let deleteConfirmModal = <Modal isOpen={this.state.deleteModalOpen} toggle={this.toggleDeleteModal}>
          <ModalHeader toggle={this.toggleDeleteModal}>Confirm delete</ModalHeader>
          <ModalBody>
            <p>The following items will be deleted. Continue?</p>
            <div className="delete-items-list-container">
              <Table hover><tbody>{deleteItemsList}</tbody></Table>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={this.deleteSelected}><i className="fa fa-trash-o" /> Delete</Button>
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>;

      let addNewBtn = <Link className="btn btn-outline-secondary add-new-item-btn" to="/event/new" href="/event/new"><i className="fa fa-plus" /></Link>;

      content = <div className="items-container">
        {pageActions}
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                <Table hover>
                  <thead>
                    <tr>
                      <th>
                        <div className="select-checkbox-container default">
                          <input type="checkbox" checked={allChecked} onChange={() => {return false}}/>
                          <span className="select-checkbox" onClick={this.toggleSelectedAll}></span>
                        </div>
                      </th>
                      <th>#</th>
                      <th>Label</th>
                      <th>Location</th>
                      <th>Time</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsRows}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>
                        <div className="select-checkbox-container default">
                          <input type="checkbox" checked={allChecked} onChange={() => {return false}}/>
                          <span className="select-checkbox" onClick={this.toggleSelectedAll}></span>
                        </div>
                      </th>
                      <th>#</th>
                      <th>Label</th>
                      <th>Location</th>
                      <th>Time</th>
                      <th></th>
                    </tr>
                  </tfoot>
                </Table>
              </CardBody>
              <CardFooter>
                <div className="text-right">
                  <Button size="sm" onClick={this.toggleDeleteModal} outline color="danger"><i className="fa fa-trash-o" /> Delete selected</Button>
                </div>
              </CardFooter>

            </Card>
          </div>
        </div>
        {pageActions}
        {deleteConfirmModal}
        {addNewBtn}
      </div>
    }

    return(
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
  }
}
