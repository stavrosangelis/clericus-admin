import React, {Component} from 'react';
import {
  Button,
  Input, InputGroup, InputGroupAddon,
  UncontrolledDropdown,
  DropdownToggle, DropdownMenu, DropdownItem
  } from 'reactstrap';
import MainPagination from './pagination';

export default class PageActions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paginationItems: []
    };
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

    let systemTypesDropdownItems = [];
    let defaultActive = false;
    if (this.state.activeSystemType===null) {
      defaultActive = true;
    }
    let defaultItem = <DropdownItem active={defaultActive} onClick={this.props.setActiveSystemType.bind(this,null)} key={0}>All</DropdownItem>;
    systemTypesDropdownItems.push(defaultItem);
    for (let st=0;st<this.props.systemTypes.length; st++) {
      let dc=st+1;
      let systemType = this.props.systemTypes[st];
      let active = false;
      if (this.props.activeSystemType===systemType._id) {
        active = true;
      }
      let dropdownItem = <DropdownItem active={active} onClick={this.props.setActiveSystemType.bind(this,systemType._id )} key={dc}><span className="first-cap">{systemType.label}</span></DropdownItem>;
      systemTypesDropdownItems.push(dropdownItem);
    }
    let systemTypesDropdown = <UncontrolledDropdown>
      <DropdownToggle color="secondary" outline caret size="sm">
        Select type
      </DropdownToggle>
      <DropdownMenu right>
        {systemTypesDropdownItems}
      </DropdownMenu>
    </UncontrolledDropdown>

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
            {systemTypesDropdown}
          </div>

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

          <div className="filter-item search">
            <UncontrolledDropdown>
              <DropdownToggle caret size="sm" outline>
                Search
              </DropdownToggle>
              <DropdownMenu className="dropdown-center">
                <DropdownItem tag="li" toggle={false} className="search-dropdown">

                  <form onSubmit={this.props.search}>
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
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
        </div>
      </div>
    </div>

    )
  }

}
