import React, {Component} from 'react';
import {
  Button,
  Input, InputGroup, InputGroupAddon,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
  Collapse
} from 'reactstrap';
import MainPagination from './pagination';
import AdvancedSearchFormRow from './advanced-search-row.js';

export default class PageActions extends Component {
  constructor(props) {
    super(props);
    let advancedSearchElement = null;
    if (typeof this.props.searchElements!=="undefined") {
      advancedSearchElement = this.props.searchElements[0].element;
    }
    this.state = {
      paginationItems: [],
      simpleSearchVisible: true,
      advancedSearchVisible: false,
      advancedSearchRows: [
        {_id: 'default', select: advancedSearchElement, input: '', default: true},
      ],
      advancedSearchElement: advancedSearchElement,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleAdvancedSearchChange = this.handleAdvancedSearchChange.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.addAdvancedSearchRow = this.addAdvancedSearchRow.bind(this);
    this.removeAdvancedSearchRow = this.removeAdvancedSearchRow.bind(this);
    this.randomString = this.randomString.bind(this);
    this.clearAdvancedSearch = this.clearAdvancedSearch.bind(this);
  }

  toggleSearch() {
    this.setState({
      simpleSearchVisible: !this.state.simpleSearchVisible,
      advancedSearchVisible: !this.state.advancedSearchVisible,
    })
  }

  addAdvancedSearchRow() {
    let newId = this.randomString(7);
    let advancedSearchRows = this.state.advancedSearchRows;
    let defaultRow = advancedSearchRows.find(el=>el._id==='default');
    let defaultRowIndex = advancedSearchRows.indexOf(defaultRow);
    let newRow = {_id: newId, select: defaultRow.select, input: defaultRow.input, default: false};
    defaultRow.select = this.props.searchElements[0].element;
    defaultRow.input = '';
    advancedSearchRows[defaultRowIndex] = defaultRow;
    advancedSearchRows.push(newRow);
    this.setState({
      advancedSearchRows: advancedSearchRows
    })
    this.props.updateAdvancedSearchInputs(advancedSearchRows)
  }

  randomString(length) {
    let result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (let i=0;i<length;i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    let exists = this.state.advancedSearchRows.find(el=>el.id===result);
    if (typeof exists==="undefined") {
      return result;
    }
    else this.randomString(length);
  }

  removeAdvancedSearchRow(rowId) {
    let advancedSearchRows = this.state.advancedSearchRows;
    let advancedSearchRowsFiltered = advancedSearchRows.filter((el)=> {
      return el._id!==rowId;
    });
    this.setState({
      advancedSearchRows: advancedSearchRowsFiltered
    })
    this.props.updateAdvancedSearchInputs(advancedSearchRows)
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleAdvancedSearchChange(e, rowId) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    let advancedSearchRows = this.state.advancedSearchRows;
    let advancedSearchRow = advancedSearchRows.find(el=>el._id===rowId);
    let index = advancedSearchRows.indexOf(advancedSearchRow);
    advancedSearchRow[name] = value;
    advancedSearchRows[index] = advancedSearchRow;
    this.setState({
      advancedSearchRows: advancedSearchRows
    });
    this.props.updateAdvancedSearchInputs(advancedSearchRows)
  }

  clearAdvancedSearch() {
    let advancedSearchRows = [
      {_id: 'default', select: '', input: '', default: true},
    ];
    this.setState({
      advancedSearchRows: advancedSearchRows
    })
    this.props.clearAdvancedSearch();
  }

  render() {
    let limitActive0 = "";
    let limitActive1 = "";
    let limitActive2 = "";
    let limitActive3 = "";
    if (this.props.limit===25) {
      limitActive0 = "active";
    }
    if (this.props.limit===50) {
      limitActive1 = "active";
    }
    if (this.props.limit===100) {
      limitActive2 = "active";
    }
    if (this.props.limit===500) {
      limitActive3 = "active";
    }
    let searchDropdown = [];
    if (this.props.pageType==="people") {

      let availableElements = [];
      for (let e=0;e<this.props.searchElements.length;e++) {
        let searchElement = this.props.searchElements[e];
        availableElements.push(<option key={e} value={searchElement.element}>{searchElement.label}</option>);
      }
      let advancedSearchRows = [];
      for (let ar=0;ar<this.state.advancedSearchRows.length;ar++) {
        let advancedSearchRow = this.state.advancedSearchRows[ar];
        let row = <AdvancedSearchFormRow
          key={ar}
          default={advancedSearchRow.default}
          availableElements={availableElements}
          rowId={advancedSearchRow._id}
          handleAdvancedSearchChange={this.handleAdvancedSearchChange}
          addAdvancedSearchRow={this.addAdvancedSearchRow}
          removeAdvancedSearchRow={this.removeAdvancedSearchRow}
          searchInput={advancedSearchRow.input}
          searchSelect={advancedSearchRow.select}
        />;
        advancedSearchRows.push(row);
      }

      searchDropdown = <div className="filter-item search">
        <UncontrolledDropdown>
          <DropdownToggle caret size="sm" outline>
            Search
          </DropdownToggle>
          <DropdownMenu className="dropdown-center">
            <DropdownItem tag="li" toggle={false} className="search-dropdown">
              <Collapse isOpen={this.state.simpleSearchVisible}>
                <form onSubmit={this.props.simpleSearch}>
                  <InputGroup size="sm" className="search-dropdown-inputgroup">
                      <Input name="searchInput" onChange={this.props.handleChange} placeholder="Search..." value={this.props.searchInput}/>
                      <InputGroupAddon addonType="append">
                        <Button size="sm" outline type="button" onClick={this.props.clearSearch} className="clear-search">
                          <i className="fa fa-times-circle" />
                        </Button>
                        <Button size="sm" type="submit">
                          <i className="fa fa-search" />
                        </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </form>
                <div className="toggle-search" onClick={()=>this.toggleSearch()}>Advanced search <i className="fa fa-chevron-down" /></div>
              </Collapse>

              <Collapse isOpen={this.state.advancedSearchVisible}>
                <form onSubmit={this.props.advancedSearch}>

                  {advancedSearchRows}

                  <div style={{padding: '15px 0'}}>
                    <Button type="button" size="sm" color="secondary" outline onClick={this.clearAdvancedSearch}>
                      <i className="fa fa-times-circle" /> Clear
                    </Button>{' '}
                    <Button
                      type="submit"
                      size="sm"
                      color="secondary"
                      className="pull-right"
                      onClick={this.props.advancedSearch}
                    >
                      <i className="fa fa-search" /> Search
                    </Button>
                  </div>
                </form>
                <div className="toggle-search" onClick={()=>this.toggleSearch()}>Simple search <i className="fa fa-chevron-up" /></div>
              </Collapse>

            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    }
    return (
      <div className="row">
      <div className="col-12">
        <div className="page-actions text-right">

          <div className="go-to-page">
            <form onSubmit={this.props.gotoPage}>
            <InputGroup size="sm">
              <Input name="gotoPage" onChange={this.props.handleChange} value={this.props.gotoPageValue} placeholder="0" />
              <InputGroupAddon addonType="append"><div className="total-pages">/ {this.props.total_pages}</div></InputGroupAddon>
              <InputGroupAddon addonType="append"><Button type="submit" outline color="secondary" className="go-to-page-btn"><i className="fa fa-angle-right"></i></Button></InputGroupAddon>
            </InputGroup>
            </form>
          </div>

          <MainPagination
            limit={this.props.limit}
            current_page={this.props.current_page}
            total_pages={this.props.total_pages}
            pagination_function={this.props.updatePage}
            />

          <div className="filter-item">
            <UncontrolledDropdown>
              <DropdownToggle caret size="sm" outline>
                Limit
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem className={limitActive0} onClick={this.props.updateLimit.bind(this,25)}>25</DropdownItem>
                <DropdownItem className={limitActive1} onClick={this.props.updateLimit.bind(this,50)}>50</DropdownItem>
                <DropdownItem className={limitActive2} onClick={this.props.updateLimit.bind(this,100)}>100</DropdownItem>
                <DropdownItem className={limitActive3} onClick={this.props.updateLimit.bind(this,500)}>500</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>

          {searchDropdown}

        </div>
      </div>
    </div>

    )
  }

}
