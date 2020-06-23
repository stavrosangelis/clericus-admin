import React, { Component } from 'react';
import {
  Table,
  Card, CardBody,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import {Breadcrumbs} from '../components/breadcrumbs';

import axios from 'axios';
import PageActions from '../components/page-actions';
import {getThumbnailURL} from '../helpers/helpers';
import BatchActions from '../components/add-batch-relations';
import {getResourceThumbnailURL} from '../helpers/helpers';
import defaultThumbnail from '../assets/img/spcc.jpg';

import {connect} from "react-redux";
import {
  setPaginationParams
} from "../redux/actions/main-actions";

const APIPath = process.env.REACT_APP_APIPATH;
const mapStateToProps = state => {
  return {
    peoplePagination: state.peoplePagination,
    resourcesTypes: state.resourcesTypes
   };
};

function mapDispatchToProps(dispatch) {
  return {
    setPaginationParams: (type,params) => dispatch(setPaginationParams(type,params))
  }
}

class People extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      tableLoading: true,
      people: [],
      orderField: this.props.peoplePagination.orderField,
      orderDesc: this.props.peoplePagination.orderDesc,
      page: this.props.peoplePagination.page,
      gotoPage: this.props.peoplePagination.page,
      limit: this.props.peoplePagination.limit,
      status: this.props.peoplePagination.status,
      totalPages: 0,
      totalItems: 0,
      allChecked: false,

      searchInput: this.props.peoplePagination.searchInput,
      advancedSearchInputs: this.props.peoplePagination.advancedSearchInputs,
      simpleSearch: false,
      advancedSearch: false,
      classpieceSearchInput: '',
      classpieceItems: [],
      classpieceId: null,
    }
    this.load = this.load.bind(this);
    this.updateOrdering = this.updateOrdering.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.peopleTableRows = this.peopleTableRows.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleSelectedAll = this.toggleSelectedAll.bind(this);
    this.deleteSelected = this.deleteSelected.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.advancedSearch = this.advancedSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.classpieceClearSearch = this.classpieceClearSearch.bind(this);
    this.classpieceSearch = this.classpieceSearch.bind(this);
    this.selectClasspiece = this.selectClasspiece.bind(this);
    this.clearAdvancedSearch = this.clearAdvancedSearch.bind(this);
    this.updateAdvancedSearchInputs = this.updateAdvancedSearchInputs.bind(this);
    this.removeSelected = this.removeSelected.bind(this);

    // hack to kill load promise on unmount
    this.cancelLoad=false;
  }

  async load() {
    this.setState({
      tableLoading: true
    })
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      orderField: this.state.orderField,
      orderDesc: this.state.orderDesc,
      status: this.state.status,
    };
    if (this.state.classpieceId!==null) {
      params.classpieceId = this.state.classpieceId;
    }
    if (this.state.searchInput!=="" && !this.state.advancedSearch) {
      params.label = this.state.searchInput;
    }
    else if (this.state.advancedSearchInputs.length>0 && !this.state.search) {
      for (let i=0; i<this.state.advancedSearchInputs.length; i++) {
        let searchInput = this.state.advancedSearchInputs[i];
        params[searchInput.select] = searchInput.input;
      }
    }
    let url = APIPath+'people';
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
	  });
    if (this.cancelLoad) {
      return false;
    }
    let people = responseData.data.map((person)=>{
      person.checked = false;
      return person;
    });
    let currentPage = 1;
    if (responseData.currentPage>0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage>1 && currentPage>responseData.totalPages) {
      this.setState({
        page: responseData.totalPages
      },()=> {
        this.load();
      });
    }
    else {
      this.setState({
        loading: false,
        tableLoading: false,
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        people: people
      });
    }
  }

  async simpleSearch(e) {
    e.preventDefault();
    if (this.state.searchInput<2) {
      return false;
    }
    this.updateStorePagination({searchInput:this.state.searchInput});
    this.setState({
      tableLoading: true
    });
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      label: this.state.searchInput,
      orderField: this.state.orderField,
      orderDesc: this.state.orderDesc,
      status: this.state.status,
    }
    let url = APIPath+'people';
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
	  });

    let people = responseData.data;
    let newPeople = people.map((person)=>{
      person.checked = false;
      return person;
    });
    let currentPage = 1;
    if (responseData.currentPage>0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage>1 && currentPage>responseData.totalPages) {
      this.setState({
        page: responseData.totalPages
      },()=> {
        this.load();
      });
    }
    else {
      this.setState({
        loading: false,
        tableLoading: false,
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        people: newPeople,
        simpleSearch: true,
        advancedSearch: false,
      });
    }
  }

  async advancedSearch(e) {
    e.preventDefault();
    this.updateStorePagination({advancedSearchInputs:this.state.advancedSearchInputs});
    this.setState({
      tableLoading: true
    });
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      orderField: this.state.orderField,
      orderDesc: this.state.orderDesc,
      status: this.state.status,
    }
    for (let i=0; i<this.state.advancedSearchInputs.length; i++) {
      let searchInput = this.state.advancedSearchInputs[i];
      params[searchInput.select] = searchInput.input;
    }
    let url = APIPath+'people';
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
	  });
    let people = responseData.data;
    let newPeople = people.map((person)=>{
      person.checked = false;
      return person;
    });
    let currentPage = 1;
    if (responseData.currentPage>0) {
      currentPage = responseData.currentPage;
    }
    // normalize the page number when the selected page is empty for the selected number of items per page
    if (currentPage>1 && currentPage>responseData.totalPages) {
      this.setState({
        page: responseData.totalPages
      },() => {
        this.load();
      })
    }
    else {
      this.setState({
        loading: false,
        tableLoading: false,
        page: responseData.currentPage,
        totalPages: responseData.totalPages,
        totalItems: responseData.totalItems,
        people: newPeople,
        simpleSearch: false,
        advancedSearch: true,
      });
    }
  }

  clearSearch() {
    return new Promise((resolve)=> {
      this.setState({
        searchInput: '',
        simpleSearch: false,
      });
      this.updateStorePagination({searchInput:""});
      resolve(true)
    })
    .then(()=> {
      this.load();
    });
  }

  async classpieceSearch(e) {
    let classpieceType = "";
    if (this.props.resourcesTypes.length>0) {
      classpieceType = this.props.resourcesTypes.find(t=>t.labelId==="Classpiece")._id;
    }
    e.preventDefault();
    if (this.state.classpieceSearchInput<2) {
      return false;
    }
    let params = {
      page: 1,
      limit: 25,
      label: this.state.classpieceSearchInput,
      systemType: classpieceType
    }
    let url = APIPath+'resources';
    let responseData = await axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data;
	  })
	  .catch(function (error) {
	  });
    if(responseData.status) {
      let items = responseData.data.data.map(item=>{
        let thumbnailImage = <img src={defaultThumbnail} alt={item.label} className="person-default-thumbnail"/>;
        let thumbnailPath = getResourceThumbnailURL(item);
        if (thumbnailPath!==null) {
          thumbnailImage = <img src={thumbnailPath} alt={item.label} />
        }
        return <div className="classpiece-result" key={item._id} onClick={()=>this.selectClasspiece(item._id)}>
          {thumbnailImage} <label>{item.label}</label>
        </div>;
      });
      this.setState({
        classpieceItems: items
      });
    }
  }

  selectClasspiece(classpieceId) {
    return new Promise((resolve)=> {
      this.setState({
        classpieceId: classpieceId
      });
      resolve(true)
    })
    .then(()=> {
      this.load();
    });
  }

  classpieceClearSearch() {
    return new Promise((resolve)=> {
      this.setState({
        classpieceSearchInput: '',
        classpieceItems: [],
        classpieceId: null
      });
      resolve(true)
    })
    .then(()=> {
      this.load();
    });
  }

  clearAdvancedSearch() {
    return new Promise((resolve)=> {
      this.setState({
        advancedSearchInputs: [],
        advancedSearch: false,
      })
      this.updateStorePagination({advancedSearchInputs:[]});
      resolve(true)
    })
    .then(()=> {
      this.load();
    });
  }

  updateAdvancedSearchInputs(advancedSearchInputs) {
    this.setState({
      advancedSearchInputs: advancedSearchInputs,
    })
  }

  updateOrdering(orderField="") {
    let orderDesc = false;
    if (orderField === this.state.orderField) {
      orderDesc = !this.state.orderDesc;
    }
    this.setState({
      orderField: orderField,
      orderDesc: orderDesc
    });
    this.updateStorePagination({orderField:orderField,orderDesc:orderDesc});
    let context = this;
    setTimeout(function(){
      context.load();
    },100);
  }

  updatePage(e) {
    if (e>0 && e!==this.state.page) {
      this.setState({
        page: e,
        gotoPage: e,
      })
      this.updateStorePagination({page:e});
      let context = this;
      setTimeout(function(){
        context.load();
      },100);
    }
  }

  updateStorePagination({limit=null, page=null, orderField="", orderDesc=false, status=null, searchInput="", advancedSearchInputs=[]}) {
    if (limit===null) {
      limit = this.state.limit;
    }
    if (page===null) {
      page = this.state.page;
    }
    if (orderField==="") {
      orderField = this.state.orderField;
    }
    if (orderDesc===false) {
      orderDesc = this.state.orderDesc;
    }
    if (status===null) {
      status = this.state.status;
    }
    if (searchInput==="") {
      searchInput = this.state.searchInput;
    }
    if (advancedSearchInputs.length===0) {
      advancedSearchInputs = this.state.advancedSearchInputs;
    }
    let payload = {
      limit:limit,
      page:page,
      orderField:orderField,
      orderDesc:orderDesc,
      status:status,
      searchInput:searchInput,
      advancedSearchInputs:advancedSearchInputs,
    }
    this.props.setPaginationParams("people", payload);
  }

  gotoPage(e) {
    e.preventDefault();
    let gotoPage = parseInt(this.state.gotoPage,10);
    let page = this.state.page;
    if (gotoPage>0 && gotoPage!==page) {
      this.setState({
        page: gotoPage
      })
      this.updateStorePagination({page:gotoPage});
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
    this.updateStorePagination({limit:limit});
    let context = this;
    setTimeout(function(){
      context.load();
    },100)
  }

  setStatus(status=null) {
    this.setState({
      status: status
    })
    this.updateStorePagination({status:status});
    let context = this;
    setTimeout(function() {
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

  peopleTableRows() {
    let people = this.state.people;
    let rows = [];
    for (let i=0;i<people.length; i++) {
      let person = people[i];
      let countPage = parseInt(this.state.page,10)-1;
      let count = (i+1) + (countPage*this.state.limit);
      let label = person.firstName;
      if (person.lastName!=="") {
        label +=" "+person.lastName;
      }

      let thumbnailImage = <img src={defaultThumbnail} alt={label} className="person-default-thumbnail" />;
      let thumbnailURL = getThumbnailURL(person);
      if (thumbnailURL!==null) {
        thumbnailImage = <img src={thumbnailURL} className="people-list-thumbnail img-fluid img-thumbnail" alt={label} />
      }
      let affiliation = null;
      let organisation = "";
      if (person.affiliations.length>0 && typeof person.affiliations[0].ref!=="undefined") {
        affiliation = person.affiliations[0].ref;
        organisation = <Link href={`/organisation/${affiliation._id}`} to={`/organisation/${affiliation._id}`}>{affiliation.label}</Link>;
      }
      let createdAt = <div><small>{person.createdAt.split("T")[0]}</small><br/><small>{person.createdAt.split("T")[1]}</small></div>;
      let updatedAt = <div><small>{person.updatedAt.split("T")[0]}</small><br/><small>{person.updatedAt.split("T")[1]}</small></div>;
      let row = <tr key={i}>
        <td>
          <div className="select-checkbox-container">
            <input type="checkbox" value={i} checked={person.checked} onChange={() => {return false}}/>
            <span className="select-checkbox" onClick={()=>this.toggleSelected(i)}></span>
          </div>
        </td>
        <td>{count}</td>
        <td><Link href={"/person/"+person._id} to={"/person/"+person._id}>{thumbnailImage}</Link></td>
        <td><Link href={"/person/"+person._id} to={"/person/"+person._id}>{person.firstName}</Link></td>
        <td><Link href={"/person/"+person._id} to={"/person/"+person._id}>{person.lastName}</Link></td>
        <td>{organisation}</td>
        <td>{createdAt}</td>
        <td>{updatedAt}</td>
        <td><Link href={"/person/"+person._id} to={"/person/"+person._id} className="edit-item"><i className="fa fa-pencil" /></Link></td>
      </tr>
      rows.push(row);
    }
    return rows;
  }

  toggleSelected(i) {
    let people = this.state.people;
    let newPersonChecked = !people[i].checked;
    people[i].checked = newPersonChecked;
    this.setState({
      people: people
    });
  }

  toggleSelectedAll() {
    let allChecked = !this.state.allChecked;
    let people = this.state.people;
    let newPeople = [];
    for (let i=0;i<people.length; i++) {
      let person = people[i];
      person.checked = allChecked;
      newPeople.push(person);
    }
    this.setState({
      people: newPeople,
      allChecked: allChecked
    })
  }

  async deleteSelected() {
    let selectedPeople = this.state.people.filter(item=>{
      return item.checked;
    }).map(item=>item._id);
    let data = {
      _ids: selectedPeople,
    }
    let url = APIPath+'people';
    await axios({
      method: 'delete',
      url: url,
      crossDomain: true,
      data: data
    })
	  .then(function (response) {
      return true;
	  })
	  .catch(function (error) {
      console.log(error)
	  });
    this.setState({
      allChecked: false
    })
    this.load();
  }

  removeSelected(_id=null) {
    if (_id==null) {
      return false;
    }
    let newPeople = this.state.people.map(item=> {
      if (item._id===_id) {
        item.checked = false;
      }
      return item;
    });
    this.setState({
      people: newPeople
    });
  }

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    this.cancelLoad=true;
  }

  render() {
    let heading = "People";
    let breadcrumbsItems = [
      {label: heading, icon: "pe-7s-users", active: true, path: ""}
    ];

    let searchElements = [
      {element: "firstName", label: "First name"},
      {element: "lastName", label: "Last name"},
      {element: "fnameSoundex", label: "First name soundex"},
      {element: "lnameSoundex", label: "Last name soundex"},
      {element: "description", label: "Description"},
    ];

    let pageActions = <PageActions
      advancedSearch={this.advancedSearch}
      classpieceClearSearch={this.classpieceClearSearch}
      classpieceItems={this.state.classpieceItems}
      classpieceSearch={this.classpieceSearch}
      classpieceSearchInput={this.state.classpieceSearchInput}
      clearAdvancedSearch={this.clearAdvancedSearch}
      clearSearch={this.clearSearch}
      current_page={this.state.page}
      gotoPage={this.gotoPage}
      gotoPageValue={this.state.gotoPage}
      handleChange={this.handleChange}
      limit={this.state.limit}
      pageType="people"
      searchElements={searchElements}
      searchInput={this.state.searchInput}
      setStatus={this.setStatus}
      status={this.state.status}
      simpleSearch={this.simpleSearch}
      total_pages={this.state.totalPages}
      types={[]}
      updateLimit={this.updateLimit}
      updatePage={this.updatePage}
      updateAdvancedSearchInputs={this.updateAdvancedSearchInputs}
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
      let addNewBtn = <Link className="btn btn-outline-secondary add-new-item-btn" to="/person/new" href="/person/new"><i className="fa fa-plus" /></Link>;

      let tableLoadingSpinner = <tr>
        <td colSpan={8}><Spinner type="grow" color="info" /> <i>loading...</i></td>
      </tr>;
      let peopleRows = [];
      if (this.state.tableLoading) {
        peopleRows = tableLoadingSpinner;
      }
      else {
        peopleRows = this.peopleTableRows();
      }
      let allChecked = "";
      if (this.state.allChecked) {
        allChecked = "checked";
      }

      let selectedPeople = this.state.people.filter(item=>{
          return item.checked;
      });

      let batchActions = <BatchActions
        items={selectedPeople}
        removeSelected={this.removeSelected}
        type="Person"
        relationProperties={[]}
        deleteSelected={this.deleteSelected}
        selectAll={this.toggleSelectedAll}
        allChecked={this.state.allChecked}
      />

      // ordering
      let firstNameOrderIcon = [];
      let lastNameOrderIcon = [];
      let createdOrderIcon = [];
      let updatedOrderIcon = [];
      if (this.state.orderField==="firstName" || this.state.orderField==="") {
        if (this.state.orderDesc) {
          firstNameOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          firstNameOrderIcon = <i className="fa fa-caret-up" />
        }
      }
      if (this.state.orderField==="lastName") {
        if (this.state.orderDesc) {
          lastNameOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          lastNameOrderIcon = <i className="fa fa-caret-up" />
        }
      }
      if (this.state.orderField==="createdAt") {
        if (this.state.orderDesc) {
          createdOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          createdOrderIcon = <i className="fa fa-caret-up" />
        }
      }
      if (this.state.orderField==="updatedAt") {
        if (this.state.orderDesc) {
          updatedOrderIcon = <i className="fa fa-caret-down" />
        }
        else {
          updatedOrderIcon = <i className="fa fa-caret-up" />
        }
      }

      content = <div className="people-container">
        {pageActions}
        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody className="people-card">
                <div className="pull-right">
                  {batchActions}
                </div>
                <Table hover className="people-table">
                  <thead>
                    <tr>
                      <th style={{width: "30px"}}>
                        <div className="select-checkbox-container default">
                          <input type="checkbox" checked={allChecked} onChange={() => {return false}}/>
                          <span className="select-checkbox" onClick={this.toggleSelectedAll}></span>
                        </div>
                      </th>
                      <th style={{width: '40px'}}>#</th>
                      <th>Thumbnail</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("firstName")}>First Name {firstNameOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("lastName")}>Last Name {lastNameOrderIcon}</th>
                      <th>Organisation</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("createdAt")}>Created {createdOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("updatedAt")}>Updated {updatedOrderIcon}</th>
                      <th style={{width: '30px'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {peopleRows}
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
                      <th>Thumbnail</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("firstName")}>First Name {firstNameOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("lastName")}>Last Name {lastNameOrderIcon}</th>
                      <th>Organisation</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("createdAt")}>Created {createdOrderIcon}</th>
                      <th className="ordering-label" onClick={()=>this.updateOrdering("updatedAt")}>Updated {updatedOrderIcon}</th>
                      <th></th>
                    </tr>
                  </tfoot>
                </Table>
                <div className="pull-right">
                  {batchActions}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
        {pageActions}
        {addNewBtn}
      </div>
    }

    return(
      <div>
      <Breadcrumbs items={breadcrumbsItems} />
        <div className="row">
          <div className="col-12">
            <h2>{heading} <small>({this.state.totalItems})</small></h2>
          </div>
        </div>
        {content}
      </div>
    );
  }
}
export default People = connect(mapStateToProps, mapDispatchToProps)(People);
