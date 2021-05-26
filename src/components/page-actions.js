import React, { Component } from 'react';
import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Collapse,
} from 'reactstrap';
import PropTypes from 'prop-types';
import MainPagination from './pagination';
import AdvancedSearchFormRow from './advanced-search-row';

export default class PageActions extends Component {
  constructor(props) {
    super(props);
    const { searchElements } = this.props;
    let advancedSearchElement = null;
    if (searchElements.length > 0) {
      advancedSearchElement = searchElements[0].element;
    }
    this.state = {
      simpleSearchVisible: true,
      advancedSearchVisible: false,
      advancedSearchRows: [
        {
          _id: 'default',
          select: advancedSearchElement,
          input: '',
          default: true,
        },
      ],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleAdvancedSearchChange = this.handleAdvancedSearchChange.bind(
      this
    );
    this.toggleSearch = this.toggleSearch.bind(this);
    this.addAdvancedSearchRow = this.addAdvancedSearchRow.bind(this);
    this.removeAdvancedSearchRow = this.removeAdvancedSearchRow.bind(this);
    this.randomString = this.randomString.bind(this);
    this.clearAdvancedSearch = this.clearAdvancedSearch.bind(this);
    this.parsePropTypes = this.parsePropTypes.bind(this);
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  handleAdvancedSearchChange(e, rowId) {
    const { updateAdvancedSearchInputs } = this.props;
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const { advancedSearchRows } = this.state;
    const advancedSearchRow = advancedSearchRows.find((el) => el._id === rowId);
    const index = advancedSearchRows.indexOf(advancedSearchRow);
    advancedSearchRow[name] = value;
    advancedSearchRows[index] = advancedSearchRow;
    this.setState({
      advancedSearchRows,
    });
    updateAdvancedSearchInputs(advancedSearchRows);
  }

  toggleSearch() {
    const { simpleSearchVisible, advancedSearchVisible } = this.state;
    this.setState({
      simpleSearchVisible: !simpleSearchVisible,
      advancedSearchVisible: !advancedSearchVisible,
    });
  }

  addAdvancedSearchRow() {
    const { searchElements, updateAdvancedSearchInputs } = this.props;
    const newId = this.randomString(7);
    const { advancedSearchRows } = this.state;
    const defaultRow = advancedSearchRows.find((el) => el._id === 'default');
    const defaultRowIndex = advancedSearchRows.indexOf(defaultRow);
    const newRow = {
      _id: newId,
      select: defaultRow.select,
      input: defaultRow.input,
      default: false,
    };
    defaultRow.select = searchElements[0].element;
    defaultRow.input = '';
    advancedSearchRows[defaultRowIndex] = defaultRow;
    advancedSearchRows.push(newRow);
    this.setState({
      advancedSearchRows,
    });
    updateAdvancedSearchInputs(advancedSearchRows);
  }

  randomString(length) {
    const { advancedSearchRows } = this.state;
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const exists = advancedSearchRows.find((el) => el.id === result);
    if (typeof exists === 'undefined') {
      return result;
    }
    this.randomString(length);
    return false;
  }

  removeAdvancedSearchRow(rowId) {
    const { advancedSearchRows } = this.state;
    const { updateAdvancedSearchInputs } = this.props;
    const advancedSearchRowsFiltered = advancedSearchRows.filter(
      (el) => el._id !== rowId
    );
    this.setState({
      advancedSearchRows: advancedSearchRowsFiltered,
    });
    updateAdvancedSearchInputs(advancedSearchRows);
  }

  clearAdvancedSearch() {
    const { clearAdvancedSearch } = this.props;
    const advancedSearchRows = [
      { _id: 'default', select: '', input: '', default: true },
    ];
    this.setState({
      advancedSearchRows,
    });
    clearAdvancedSearch();
  }

  parsePropTypes(types, sep = '', parentI = null) {
    const { activeType, pageType, setActiveType } = this.props;
    const typesDropdownItems = types.map((item, i) => {
      let active = false;
      if (activeType === item.label) {
        active = true;
      }
      let key = i;
      if (parentI !== null) {
        key = `${parentI}-${i}`;
      }
      let sepOut = '';
      if (sep !== '') {
        sepOut = <span style={{ padding: '0 5px' }}>{sep}</span>;
      }

      let activeTypeValue = item.label;
      if (pageType === 'organisations') {
        activeTypeValue = item.labelId;
      }
      const returnItem = [
        <DropdownItem
          active={active}
          onClick={() => setActiveType(activeTypeValue)}
          key={key}
        >
          <span className="first-cap">
            {sepOut}
            {item.label}
          </span>
        </DropdownItem>,
      ];
      if (typeof item.children !== 'undefined' && item.children.length > 0) {
        const newSep = `${sep}-`;
        const childrenItems = this.parsePropTypes(item.children, newSep);
        returnItem.push(childrenItems);
      }
      return returnItem;
    });
    return typesDropdownItems;
  }

  render() {
    const {
      limit,
      pageType,
      searchElements,
      simpleSearch,
      handleChange,
      searchInput,
      clearSearch,
      advancedSearch,
      classpieceSearch,
      classpieceSearchInput,
      handleChange: propsHandleChange,
      classpieceClearSearch,
      classpieceItems,
      orderField,
      orderDesc,
      updateOrdering,
      types,
      setActiveType,
      status,
      setStatus,
      updateLimit,
      current_page: currentPage,
      total_pages: totalPages,
      updatePage,
      gotoPage,
      gotoPageValue,
    } = this.props;
    const {
      advancedSearchRows: stateAdvancedSearchRows,
      simpleSearchVisible,
      advancedSearchVisible,
    } = this.state;
    const limitActive0 = limit === 25 ? 'active' : '';
    const limitActive1 = limit === 50 ? 'active' : '';
    const limitActive2 = limit === 100 ? 'active' : '';
    const limitActive3 = limit === 500 ? 'active' : '';
    let searchDropdown = [];
    let classpieces = [];
    let sortDropdown = [];
    if (pageType === 'people') {
      const availableElements = [];
      for (let e = 0; e < searchElements.length; e += 1) {
        const searchElement = searchElements[e];
        availableElements.push(
          <option key={e} value={searchElement.element}>
            {searchElement.label}
          </option>
        );
      }
      const advancedSearchRows = [];
      for (let ar = 0; ar < stateAdvancedSearchRows.length; ar += 1) {
        const advancedSearchRow = stateAdvancedSearchRows[ar];
        if (advancedSearchRow.select === null) {
          advancedSearchRow.select = '';
        }
        const row = (
          <AdvancedSearchFormRow
            key={ar}
            default={advancedSearchRow.default}
            availableElements={availableElements}
            rowId={advancedSearchRow._id}
            handleAdvancedSearchChange={this.handleAdvancedSearchChange}
            addAdvancedSearchRow={this.addAdvancedSearchRow}
            removeAdvancedSearchRow={this.removeAdvancedSearchRow}
            searchInput={advancedSearchRow.input}
            searchSelect={advancedSearchRow.select}
          />
        );
        advancedSearchRows.push(row);
      }

      searchDropdown = (
        <div className="filter-item search">
          <UncontrolledDropdown direction="down">
            <DropdownToggle caret size="sm" outline>
              Search
            </DropdownToggle>
            <DropdownMenu className="dropdown-center">
              <DropdownItem tag="li" toggle={false} className="search-dropdown">
                <Collapse isOpen={simpleSearchVisible}>
                  <form onSubmit={simpleSearch}>
                    <InputGroup
                      size="sm"
                      className="search-dropdown-inputgroup"
                    >
                      <Input
                        name="searchInput"
                        onChange={handleChange}
                        placeholder="Search..."
                        value={searchInput}
                      />
                      <InputGroupAddon addonType="append">
                        <Button
                          size="sm"
                          outline
                          type="button"
                          onClick={clearSearch}
                          className="clear-search"
                        >
                          <i className="fa fa-times-circle" />
                        </Button>
                        <Button size="sm" type="submit">
                          <i className="fa fa-search" />
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  </form>
                  <div
                    className="toggle-search"
                    onClick={() => this.toggleSearch()}
                    onKeyDown={() => false}
                    role="button"
                    tabIndex={0}
                    aria-label="toggle search"
                  >
                    Advanced search <i className="fa fa-chevron-down" />
                  </div>
                </Collapse>

                <Collapse isOpen={advancedSearchVisible}>
                  <form onSubmit={advancedSearch}>
                    {advancedSearchRows}

                    <div style={{ padding: '15px 0' }}>
                      <Button
                        type="button"
                        size="sm"
                        color="secondary"
                        outline
                        onClick={this.clearAdvancedSearch}
                      >
                        <i className="fa fa-times-circle" /> Clear
                      </Button>{' '}
                      <Button
                        type="submit"
                        size="sm"
                        color="secondary"
                        className="pull-right"
                        onClick={advancedSearch}
                      >
                        <i className="fa fa-search" /> Search
                      </Button>
                    </div>
                  </form>
                  <div
                    className="toggle-search"
                    onClick={() => this.toggleSearch()}
                    onKeyDown={() => false}
                    role="button"
                    tabIndex={0}
                    aria-label="toggle search"
                  >
                    Simple search <i className="fa fa-chevron-up" />
                  </div>
                </Collapse>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      );

      classpieces = (
        <div className="filter-item search">
          <UncontrolledDropdown direction="down">
            <DropdownToggle caret size="sm" outline>
              Classpiece
            </DropdownToggle>
            <DropdownMenu className="dropdown-center">
              <DropdownItem tag="li" toggle={false} className="search-dropdown">
                <form onSubmit={classpieceSearch}>
                  <InputGroup size="sm" className="search-dropdown-inputgroup">
                    <Input
                      name="classpieceSearchInput"
                      onChange={propsHandleChange}
                      placeholder="Search classpiece..."
                      value={classpieceSearchInput}
                    />
                    <InputGroupAddon addonType="append">
                      <Button
                        size="sm"
                        outline
                        type="button"
                        onClick={classpieceClearSearch}
                        className="clear-search"
                      >
                        <i className="fa fa-times-circle" />
                      </Button>
                      <Button size="sm" type="submit">
                        <i className="fa fa-search" />
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </form>
                <div className="classpiece-results-container">
                  {classpieceItems}
                </div>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      );
    }

    if (pageType === 'resources') {
      let labelSortIcon = [];
      let createdAtSortIcon = [];
      let updatedAtSortIcon = [];
      if (orderField === 'label' || orderField === '') {
        if (orderDesc) {
          labelSortIcon = <i className="fa fa-caret-down" />;
        } else {
          labelSortIcon = <i className="fa fa-caret-up" />;
        }
      }
      if (orderField === 'createdAt' || orderField === '') {
        if (orderDesc) {
          createdAtSortIcon = <i className="fa fa-caret-down" />;
        } else {
          createdAtSortIcon = <i className="fa fa-caret-up" />;
        }
      }
      if (orderField === 'updatedAt' || orderField === '') {
        if (orderDesc) {
          updatedAtSortIcon = <i className="fa fa-caret-down" />;
        } else {
          updatedAtSortIcon = <i className="fa fa-caret-up" />;
        }
      }
      sortDropdown = (
        <div className="filter-item">
          <UncontrolledDropdown direction="down">
            <DropdownToggle caret size="sm" outline>
              Sort
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem onClick={() => updateOrdering('label')}>
                Label {labelSortIcon}
              </DropdownItem>
              <DropdownItem
                onClick={() => updateOrdering('createdAt')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="update ordering"
              >
                Created {createdAtSortIcon}
              </DropdownItem>
              <DropdownItem
                onClick={() => updateOrdering('updatedAt')}
                onKeyDown={() => false}
                role="button"
                tabIndex={0}
                aria-label="update ordering"
              >
                Updated {updatedAtSortIcon}
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      );
    }
    if (pageType !== 'people') {
      searchDropdown = (
        <div className="filter-item search">
          <UncontrolledDropdown direction="down">
            <DropdownToggle caret size="sm" outline>
              Search
            </DropdownToggle>
            <DropdownMenu className="dropdown-center">
              <DropdownItem tag="li" toggle={false} className="search-dropdown">
                <form onSubmit={simpleSearch}>
                  <InputGroup size="sm" className="search-dropdown-inputgroup">
                    <Input
                      name="searchInput"
                      onChange={propsHandleChange}
                      placeholder="Search..."
                      value={searchInput}
                    />
                    <InputGroupAddon addonType="append">
                      <Button
                        size="sm"
                        outline
                        type="button"
                        onClick={clearSearch}
                        className="clear-search"
                      >
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
      );
    }

    let typesDropdownFilter = [];
    if (typeof types !== 'undefined' && types.length > 0) {
      const typesDropdownItems = this.parsePropTypes(types);
      const typesDropdown = (
        <UncontrolledDropdown direction="down">
          <DropdownToggle outline caret size="sm">
            Select type
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem onClick={() => setActiveType(null)} key="default">
              <span className="first-cap">All</span>
            </DropdownItem>
            {typesDropdownItems}
          </DropdownMenu>
        </UncontrolledDropdown>
      );

      typesDropdownFilter = <div className="filter-item">{typesDropdown}</div>;
    }

    let statusDropdown = [];
    if (typeof status !== 'undefined') {
      let statusDropdownActive0 = true;
      let statusDropdownActive1 = false;
      let statusDropdownActive2 = false;
      if (status === 'private') {
        statusDropdownActive0 = false;
        statusDropdownActive1 = true;
      }
      if (status === 'public') {
        statusDropdownActive0 = false;
        statusDropdownActive2 = true;
      }
      const statusDropdownFilter = [
        <DropdownItem
          active={statusDropdownActive0}
          onClick={() => setStatus(null)}
          key={0}
        >
          All
        </DropdownItem>,
        <DropdownItem
          active={statusDropdownActive1}
          onClick={() => setStatus('private')}
          key={1}
        >
          Private
        </DropdownItem>,
        <DropdownItem
          active={statusDropdownActive2}
          onClick={() => setStatus('public')}
          key={2}
        >
          Public
        </DropdownItem>,
      ];
      statusDropdown = (
        <div className="filter-item">
          <UncontrolledDropdown direction="down">
            <DropdownToggle color="secondary" outline caret size="sm">
              Select status
            </DropdownToggle>
            <DropdownMenu right>{statusDropdownFilter}</DropdownMenu>
          </UncontrolledDropdown>
        </div>
      );
    }

    return (
      <div className="row">
        <div className="col-12">
          <div className="page-actions">
            {searchDropdown}

            {typesDropdownFilter}

            {statusDropdown}

            <div className="filter-item">
              <UncontrolledDropdown direction="down">
                <DropdownToggle caret size="sm" outline>
                  Limit
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem
                    className={limitActive0}
                    onClick={() => updateLimit(25)}
                  >
                    25
                  </DropdownItem>
                  <DropdownItem
                    className={limitActive1}
                    onClick={() => updateLimit(50)}
                  >
                    50
                  </DropdownItem>
                  <DropdownItem
                    className={limitActive2}
                    onClick={() => updateLimit(100)}
                  >
                    100
                  </DropdownItem>
                  <DropdownItem
                    className={limitActive3}
                    onClick={() => updateLimit(500)}
                  >
                    500
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>

            {classpieces}
            {sortDropdown}
          </div>
          <div className="page-actions pull-right">
            <MainPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pagination_function={updatePage}
            />

            <div className="go-to-page">
              <form onSubmit={gotoPage}>
                <InputGroup size="sm">
                  <Input
                    name="gotoPage"
                    type="text"
                    onChange={propsHandleChange}
                    value={gotoPageValue}
                    placeholder="0"
                  />
                  <InputGroupAddon addonType="append">
                    <div className="total-pages">/ {totalPages}</div>
                  </InputGroupAddon>
                  <InputGroupAddon addonType="append">
                    <Button
                      type="submit"
                      outline
                      color="secondary"
                      className="go-to-page-btn"
                    >
                      <i className="fa fa-angle-right" />
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

PageActions.defaultProps = {
  advancedSearch: () => {},
  clearAdvancedSearch: () => {},
  clearSearch: () => {},
  searchElements: [],
  searchInput: '',
  setStatus: () => {},
  status: '',
  simpleSearch: () => {},
  types: [],
  updateAdvancedSearchInputs: () => {},
  updateOrdering: () => {},
  activeType: '',
  setActiveType: () => {},
  classpieceSearch: () => {},
  classpieceSearchInput: '',
  classpieceClearSearch: () => {},
  classpieceItems: [],
  orderField: '',
  orderDesc: false,
};

PageActions.propTypes = {
  advancedSearch: PropTypes.func,
  clearAdvancedSearch: PropTypes.func,
  clearSearch: PropTypes.func,
  current_page: PropTypes.number.isRequired,
  gotoPage: PropTypes.func.isRequired,
  gotoPageValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  handleChange: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
  pageType: PropTypes.string.isRequired,
  searchElements: PropTypes.array,
  searchInput: PropTypes.string,
  setStatus: PropTypes.func,
  status: PropTypes.string,
  simpleSearch: PropTypes.func,
  total_pages: PropTypes.number.isRequired,
  types: PropTypes.array,
  updateLimit: PropTypes.func.isRequired,
  updatePage: PropTypes.func.isRequired,
  updateAdvancedSearchInputs: PropTypes.func,
  updateOrdering: PropTypes.func,
  activeType: PropTypes.string,
  setActiveType: PropTypes.func,
  classpieceSearch: PropTypes.func,
  classpieceSearchInput: PropTypes.string,
  classpieceClearSearch: PropTypes.func,
  classpieceItems: PropTypes.array,
  orderField: PropTypes.string,
  orderDesc: PropTypes.bool,
};
