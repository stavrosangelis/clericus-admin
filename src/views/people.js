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
import BatchActions from '../components/add-batch-relations'

import {connect} from "react-redux";
import {
  setPaginationParams
} from "../redux/actions/main-actions";

const APIPath = process.env.REACT_APP_APIPATH;
const mapStateToProps = state => {
  return {
    peoplePagination: state.peoplePagination,
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
      page: this.props.peoplePagination.page,
      gotoPage: this.props.peoplePagination.page,
      limit: this.props.peoplePagination.limit,
      totalPages: 0,
      totalItems: 0,
      allChecked: false,

      searchInput: '',
      advancedSearchInputs: [],
      simpleSearch: false,
      advancedSearch: false,
    }
    this.load = this.load.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.updateLimit = this.updateLimit.bind(this);
    this.gotoPage = this.gotoPage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.peopleTableRows = this.peopleTableRows.bind(this);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.toggleSelectedAll = this.toggleSelectedAll.bind(this);
    this.deleteSelected = this.deleteSelected.bind(this);
    this.updateStorePagination = this.updateStorePagination.bind(this);
    this.simpleSearch = this.simpleSearch.bind(this);
    this.advancedSearch = this.advancedSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.clearAdvancedSearch = this.clearAdvancedSearch.bind(this);
    this.updateAdvancedSearchInputs = this.updateAdvancedSearchInputs.bind(this);
    this.removeSelected = this.removeSelected.bind(this);
  }

  load() {
    this.setState({
      tableLoading: true
    })
    let context = this;
    let params = {
      page: this.state.page,
      limit: this.state.limit
    };
    if (this.state.simpleSearch) {
      params.label = this.state.searchInput;
    }
    else if (this.state.advancedSearch) {
      for (let i=0; i<this.state.advancedSearchInputs.length; i++) {
        let searchInput = this.state.advancedSearchInputs[i];
        params[searchInput.select] = searchInput.input;
      }
    }
    let url = APIPath+'people';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
      let people = responseData.data;
      let newPeople = [];
      for (let i=0;i<people.length; i++) {
        let person = people[i];
        person.checked = false;
        newPeople.push(person);
      }
      let currentPage = 1;
      if (responseData.currentPage>0) {
        currentPage = responseData.currentPage;
      }
      // normalize the page number when the selected page is empty for the selected number of items per page
      if (currentPage>1 && responseData.data.length===0) {
        context.setState({
          page: currentPage-1
        });
        setTimeout(function() {
          context.load();
        },10)
      }
      else {
        context.setState({
          loading: false,
          tableLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          people: newPeople
        });
      }
	  })
	  .catch(function (error) {
	  });
  }

  simpleSearch(e) {
    e.preventDefault();
    if (this.state.searchInput<2) {
      return false;
    }
    this.setState({
      tableLoading: true
    })
    let context = this;
    let params = {
      page: this.state.page,
      limit: this.state.limit,
      label: this.state.searchInput,
    }
    let url = APIPath+'people';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
      let people = responseData.data;
      let newPeople = [];
      for (let i=0;i<people.length; i++) {
        let person = people[i];
        person.checked = false;
        newPeople.push(person);
      }
      let currentPage = 1;
      if (responseData.currentPage>0) {
        currentPage = responseData.currentPage;
      }
      // normalize the page number when the selected page is empty for the selected number of items per page
      if (currentPage>1 && responseData.data.length===0) {
        context.setState({
          page: currentPage-1
        });
        setTimeout(function() {
          context.load();
        },10)
      }
      else {
        context.setState({
          loading: false,
          tableLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          people: newPeople,
          simpleSearch: true,
          advancedSearch: false,
        });
      }
	  })
	  .catch(function (error) {
	  });
  }

  advancedSearch(e) {
    e.preventDefault();
    this.setState({
      tableLoading: true
    })
    let context = this;
    let params = {
      page: this.state.page,
      limit: this.state.limit,
    }
    for (let i=0; i<this.state.advancedSearchInputs.length; i++) {
      let searchInput = this.state.advancedSearchInputs[i];
      params[searchInput.select] = searchInput.input;
    }
    let url = APIPath+'people';
    axios({
      method: 'get',
      url: url,
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data.data;
      let people = responseData.data;
      let newPeople = [];
      for (let i=0;i<people.length; i++) {
        let person = people[i];
        person.checked = false;
        newPeople.push(person);
      }
      let currentPage = 1;
      if (responseData.currentPage>0) {
        currentPage = responseData.currentPage;
      }
      // normalize the page number when the selected page is empty for the selected number of items per page
      if (currentPage>1 && responseData.data.length===0) {
        context.setState({
          page: currentPage-1
        });
        setTimeout(function() {
          context.load();
        },10)
      }
      else {
        context.setState({
          loading: false,
          tableLoading: false,
          page: responseData.currentPage,
          totalPages: responseData.totalPages,
          people: newPeople,
          simpleSearch: false,
          advancedSearch: true,
        });
      }
	  })
	  .catch(function (error) {
	  });
  }

  clearSearch() {
    return new Promise((resolve)=> {
      this.setState({
        searchInput: '',
        simpleSearch: false,
      })
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

  updatePage(e) {
    if (e>0 && e!==this.state.page) {
      this.setState({
        page: e,
        gotoPage: e,
      })
      this.updateStorePagination(null,e);
      let context = this;
      setTimeout(function(){
        context.load();
      },100);
    }
  }

  updateStorePagination(limit=null, page=null) {
    if (limit===null) {
      limit = this.state.limit;
    }
    if (page===null) {
      page = this.state.page;
    }
    let payload = {
      limit:limit,
      page:page,
    }
    this.props.setPaginationParams("people", payload);
  }

  gotoPage(e) {
    e.preventDefault();
    let gotoPage = this.state.gotoPage;
    let page = this.state.page;
    if (gotoPage>0 && gotoPage!==page) {
      this.setState({
        page: gotoPage
      })
      this.updateStorePagination(null,gotoPage);
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
    this.updateStorePagination(limit,null);
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

      let thumbnailImage = [];
      let thumbnailURL = getThumbnailURL(person);
      if (thumbnailURL!==null) {
        thumbnailImage = <img src={thumbnailURL} className="people-list-thumbnail img-fluid img-thumbnail" alt={label} />
      }
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

  deleteSelected() {
    let selectedPeople = this.state.people.filter(item=>{
      return item.checked;
    }).map(item=>item._id);
    let context = this;
    let data = {
      _ids: selectedPeople,
    }
    let url = APIPath+'delete-people';
    axios({
      method: 'post',
      url: url,
      crossDomain: true,
      data: data
    })
	  .then(function (response) {
      context.setState({
        allChecked: false
      })
      context.load();
	  })
	  .catch(function (error) {
      console.log(error)
	  });
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
      limit={this.state.limit}
      current_page={this.state.page}
      gotoPageValue={this.state.gotoPage}
      total_pages={this.state.totalPages}
      updatePage={this.updatePage}
      gotoPage={this.gotoPage}
      handleChange={this.handleChange}
      updateLimit={this.updateLimit}
      pageType="people"
      searchElements={searchElements}
      searchInput={this.state.searchInput}
      simpleSearch={this.simpleSearch}
      advancedSearch={this.advancedSearch}
      clearSearch={this.clearSearch}
      clearAdvancedSearch={this.clearAdvancedSearch}
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
        <td colSpan={6}><Spinner type="grow" color="info" /> <i>loading...</i></td>
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
      />


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
                      <th>First Name</th>
                      <th>Last Name</th>
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
                      <th>First Name</th>
                      <th>Last Name</th>
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
            <h2>{heading}</h2>
          </div>
        </div>
        {content}
      </div>
    );
  }
}
export default People = connect(mapStateToProps, mapDispatchToProps)(People);
