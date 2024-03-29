import React, { useState } from 'react';
import {
  Collapse,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  InputGroup,
  Button,
  UncontrolledDropdown,
} from 'reactstrap';
import PropTypes from 'prop-types';
import MainPagination from './Pagination';
import AdvancedSearchFormRow from './advanced-search-row';

import '../assets/scss/page.actions.scss';

function PageActions(props) {
  // props
  const {
    activeType,
    advancedSearch,
    classpieceClearSearch,
    classpieceItems,
    classpieceSearch,
    classpieceSearchInput,
    clearAdvancedSearch: propsClearAdvancedSearch,
    clearSearch,
    defaultLimit,
    gotoPage,
    gotoPageValue,
    handleChange,
    limit,
    orderField,
    orderDesc,
    page,
    pageType,
    reload,
    searchElements,
    searchInput,
    setActiveType,
    setAdvancedSearch,
    setStatus,
    status,
    types,
    updateAdvancedSearchInputs,
    updateLimit,
    updateSort,
    updatePage,
    totalPages,
  } = props;

  // state
  const advancedSearchElement =
    searchElements.length > 0 ? searchElements[0].element : null;
  const [advancedSearchRows, setAdvancedSearchRows] = useState([
    {
      _id: 'default',
      select: advancedSearchElement,
      input: '',
      default: true,
    },
  ]);

  const handleAdvancedSearchChange = (e, rowId) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const copy = [...advancedSearchRows];
    const advancedSearchRow = copy.find((el) => el._id === rowId);
    const index = copy.indexOf(advancedSearchRow);
    advancedSearchRow[name] = value;
    copy[index] = advancedSearchRow;
    setAdvancedSearchRows(copy);
    updateAdvancedSearchInputs(copy);
  };

  const toggleSearch = () => {
    setAdvancedSearch(!advancedSearch);
  };

  const randomString = (length) => {
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
    randomString(length);
    return false;
  };

  const addAdvancedSearchRow = () => {
    const newId = randomString(7);
    const copy = [...advancedSearchRows];
    const defaultRow = copy.find((el) => el._id === 'default');
    const defaultRowIndex = copy.indexOf(defaultRow);
    const newRow = {
      _id: newId,
      select: defaultRow.select,
      input: defaultRow.input,
      default: false,
    };
    defaultRow.select = searchElements[0].element;
    defaultRow.input = '';
    copy[defaultRowIndex] = defaultRow;
    copy.push(newRow);
    setAdvancedSearchRows(copy);
    updateAdvancedSearchInputs(copy);
  };

  const removeAdvancedSearchRow = (rowId) => {
    const copy = [...advancedSearchRows];
    const advancedSearchRowsFiltered = copy.filter((el) => el._id !== rowId);
    setAdvancedSearchRows(advancedSearchRowsFiltered);
    updateAdvancedSearchInputs(advancedSearchRowsFiltered);
  };

  const clearAdvancedSearch = () => {
    const defaultAdvancedSearchRows = [
      { _id: 'default', select: '', input: '', default: true },
    ];
    setAdvancedSearchRows(defaultAdvancedSearchRows);
    updateAdvancedSearchInputs(defaultAdvancedSearchRows);
    propsClearAdvancedSearch();
  };

  const paginationHTML =
    totalPages > 1 ? (
      <MainPagination
        currentPage={page}
        totalPages={totalPages}
        paginationFn={updatePage}
      />
    ) : null;

  const parsePropTypes = (typesParam, sep = '', parentI = null) => {
    const typesDropdownItems = typesParam.map((item, i) => {
      let active = activeType === item.label;
      if (pageType === 'organisations') {
        active = activeType === item.labelId;
      }
      if (['resources', 'articles'].indexOf(pageType) > -1) {
        active = activeType === item._id;
      }
      const key = parentI !== null ? `${parentI}-${i}` : i;
      const sepOut =
        sep !== '' ? <span style={{ padding: '0 5px' }}>{sep}</span> : '';

      let activeTypeValue = '';
      switch (pageType) {
        case 'organisations':
          activeTypeValue = item.labelId;
          break;
        case 'resources':
          activeTypeValue = item._id;
          break;
        case 'articles':
          activeTypeValue = item._id;
          break;
        case 'events':
          activeTypeValue = item._id;
          break;
        default:
          activeTypeValue = item.label;
          break;
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
        const childrenItems = parsePropTypes(item.children, newSep);
        returnItem.push(childrenItems);
      }
      return returnItem;
    });
    return typesDropdownItems;
  };

  const submitSearch = (e) => {
    e.preventDefault();
    reload();
  };

  const submitGotoPage = (e) => {
    e.preventDefault();
    gotoPage(e);
  };

  // limit filter
  const limit1 = defaultLimit;
  const limit2 = defaultLimit * 2;
  const limit3 = defaultLimit * 4;
  const limit4 = defaultLimit * 20;
  const limitActive0 = limit === limit1;
  const limitActive1 = limit === limit2;
  const limitActive2 = limit === limit3;
  const limitActive3 = limit === limit4;
  const limitFilter = (
    <div className="filter-item">
      <UncontrolledDropdown direction="down">
        <DropdownToggle caret size="sm" outline>
          Limit
        </DropdownToggle>
        <DropdownMenu end>
          <DropdownItem
            active={limitActive0}
            onClick={() => updateLimit(limit1)}
          >
            {defaultLimit}
          </DropdownItem>
          <DropdownItem
            active={limitActive1}
            onClick={() => updateLimit(limit2)}
          >
            {limit2}
          </DropdownItem>
          <DropdownItem
            active={limitActive2}
            onClick={() => updateLimit(limit3)}
          >
            {limit3}
          </DropdownItem>
          <DropdownItem
            active={limitActive3}
            onClick={() => updateLimit(limit4)}
          >
            {limit4}
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </div>
  );
  let searchDropdown = null;
  let classpieces = null;
  let sortDropdown = null;
  let typesDropdownFilter = null;
  let statusDropdown = null;

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
    const advancedSearchRowsOutput = advancedSearchRows.map((rParam, i) => {
      const r = rParam;
      if (r.select === null) {
        r.select = '';
      }
      const key = `advanced-${i}`;
      return (
        <AdvancedSearchFormRow
          key={key}
          default={r.default}
          availableElements={availableElements}
          rowId={r._id}
          handleAdvancedSearchChange={handleAdvancedSearchChange}
          addAdvancedSearchRow={addAdvancedSearchRow}
          removeAdvancedSearchRow={removeAdvancedSearchRow}
          searchInput={r.input}
          searchSelect={r.select}
        />
      );
    });

    const searchDropdownActive = searchInput !== '' ? ' active' : '';

    searchDropdown = (
      <div className={`filter-item search${searchDropdownActive}`}>
        <UncontrolledDropdown direction="down">
          <DropdownToggle caret size="sm" outline>
            Search
          </DropdownToggle>
          <DropdownMenu className="dropdown-center">
            <DropdownItem tag="li" toggle={false} className="search-dropdown">
              <Collapse isOpen={!advancedSearch}>
                <form onSubmit={submitSearch}>
                  <InputGroup size="sm" className="search-dropdown-inputgroup">
                    <Input
                      name="searchInput"
                      onChange={handleChange}
                      placeholder="Search..."
                      value={searchInput}
                    />
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
                  </InputGroup>
                </form>
                <div
                  className="toggle-search"
                  onClick={() => toggleSearch()}
                  onKeyDown={() => false}
                  role="button"
                  tabIndex={0}
                  aria-label="toggle search"
                >
                  Advanced search <i className="fa fa-chevron-down" />
                </div>
              </Collapse>

              <Collapse isOpen={advancedSearch}>
                <form onSubmit={submitSearch}>
                  {advancedSearchRowsOutput}

                  <div style={{ padding: '15px 0' }}>
                    <Button
                      type="button"
                      size="sm"
                      color="secondary"
                      outline
                      onClick={clearAdvancedSearch}
                    >
                      <i className="fa fa-times-circle" /> Clear
                    </Button>{' '}
                    <Button
                      type="submit"
                      size="sm"
                      color="secondary"
                      className="pull-right"
                      onClick={submitSearch}
                    >
                      <i className="fa fa-search" /> Search
                    </Button>
                  </div>
                </form>
                <div
                  className="toggle-search"
                  onClick={() => toggleSearch()}
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
                    onChange={handleChange}
                    placeholder="Search classpiece..."
                    value={classpieceSearchInput}
                  />
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
  } else {
    const searchDropdownActive = searchInput !== '' ? ' active' : '';

    searchDropdown = (
      <div className={`filter-item search${searchDropdownActive}`}>
        <UncontrolledDropdown direction="down">
          <DropdownToggle caret size="sm" outline>
            Search
          </DropdownToggle>
          <DropdownMenu className="dropdown-center">
            <DropdownItem tag="li" toggle={false} className="search-dropdown">
              <form onSubmit={submitSearch}>
                <InputGroup size="sm" className="search-dropdown-inputgroup">
                  <Input
                    name="searchInput"
                    onChange={handleChange}
                    placeholder="Search..."
                    value={searchInput}
                  />
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
                </InputGroup>
              </form>
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    );
  }

  if (pageType === 'resources') {
    const labelActive = orderField === 'label';
    const statusActive = orderField === 'status';
    const createdAtActive = orderField === 'createdAt';
    const updatedAtActive = orderField === 'updatedAt';

    let labelIcon = [];
    if (orderField === 'label' && orderDesc) {
      labelIcon = <i className="fa fa-caret-up pull-right" />;
    } else if (orderField === 'label' && !orderDesc) {
      labelIcon = <i className="fa fa-caret-down pull-right" />;
    }
    let statusIcon = [];
    if (orderField === 'status' && orderDesc) {
      statusIcon = <i className="fa fa-caret-up pull-right" />;
    } else if (orderField === 'status' && !orderDesc) {
      statusIcon = <i className="fa fa-caret-down pull-right" />;
    }
    let createdAtIcon = [];
    if (orderField === 'createdAt' && orderDesc) {
      createdAtIcon = <i className="fa fa-caret-up pull-right" />;
    } else if (orderField === 'createdAt' && !orderDesc) {
      createdAtIcon = <i className="fa fa-caret-down pull-right" />;
    }
    let updatedAtIcon = [];
    if (orderField === 'updatedAt' && orderDesc) {
      updatedAtIcon = <i className="fa fa-caret-up pull-right" />;
    } else if (orderField === 'updatedAt' && !orderDesc) {
      updatedAtIcon = <i className="fa fa-caret-down pull-right" />;
    }
    sortDropdown = (
      <div className="filter-item">
        <UncontrolledDropdown direction="down">
          <DropdownToggle outline caret size="sm">
            Sort
          </DropdownToggle>
          <DropdownMenu end>
            <DropdownItem
              active={labelActive}
              onClick={() => updateSort('label')}
              key="default"
            >
              <span className="first-cap">label</span>
              {labelIcon}
            </DropdownItem>
            <DropdownItem
              active={statusActive}
              onClick={() => updateSort('status')}
            >
              <span className="first-cap">status</span>
              {statusIcon}
            </DropdownItem>
            <DropdownItem
              active={createdAtActive}
              onClick={() => updateSort('createdAt')}
            >
              <span className="first-cap">createdAt</span>
              {createdAtIcon}
            </DropdownItem>
            <DropdownItem
              active={updatedAtActive}
              onClick={() => updateSort('updatedAt')}
            >
              <span className="first-cap">updatedAt</span>
              {updatedAtIcon}
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    );
  }

  if (typeof types !== 'undefined' && types.length > 0) {
    const typesDropdownItems = parsePropTypes(types);
    const allActive = activeType === null;
    const typesDropdown = (
      <UncontrolledDropdown direction="down">
        <DropdownToggle outline caret size="sm">
          Select type
        </DropdownToggle>
        <DropdownMenu end>
          <DropdownItem
            active={allActive}
            onClick={() => setActiveType('')}
            key="default"
          >
            <span className="first-cap">All</span>
          </DropdownItem>
          {typesDropdownItems}
        </DropdownMenu>
      </UncontrolledDropdown>
    );

    typesDropdownFilter = <div className="filter-item">{typesDropdown}</div>;
  }

  const noStatus = [
    'temporals',
    'spatials',
    'contact-forms',
    'users',
    'usergroups',
    'imports',
  ];

  if (noStatus.indexOf(pageType) === -1 && typeof status !== 'undefined') {
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
        onClick={() => setStatus('')}
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
          <DropdownMenu end>{statusDropdownFilter}</DropdownMenu>
        </UncontrolledDropdown>
      </div>
    );
  }

  const gotoPageOutput =
    totalPages > 1 ? (
      <div className="go-to-page">
        <form onSubmit={(e) => submitGotoPage(e)}>
          <InputGroup size="sm">
            <Input
              name="gotoPage"
              type="text"
              onChange={handleChange}
              value={gotoPageValue}
              placeholder="0"
            />
            <div className="total-pages">/ {totalPages}</div>
            <Button
              type="submit"
              outline
              color="secondary"
              className="go-to-page-btn"
            >
              <i className="fa fa-angle-right" />
            </Button>
          </InputGroup>
        </form>
      </div>
    ) : null;

  const paginationBlock =
    totalPages > 1 ? (
      <div className="page-actions">
        {gotoPageOutput}
        {paginationHTML}
      </div>
    ) : null;
  return (
    <div className="row">
      <div className="col-12">
        <div className="page-actions">
          {searchDropdown}
          {classpieces}
          {typesDropdownFilter}
          {statusDropdown}
          {limitFilter}
          {sortDropdown}
        </div>
        {paginationBlock}
      </div>
    </div>
  );
}

PageActions.defaultProps = {
  activeType: '',
  advancedSearch: false,
  classpieceClearSearch: () => {},
  classpieceItems: [],
  classpieceSearch: () => {},
  classpieceSearchInput: '',
  clearAdvancedSearch: () => {},
  clearSearch: () => {},
  gotoPage: () => {},
  limit: 25,
  orderDesc: false,
  orderField: '',
  page: 1,
  reload: () => {},
  searchElements: [],
  searchInput: '',
  setActiveType: () => {},
  setAdvancedSearch: () => {},
  setStatus: () => {},
  status: '',
  totalPages: 0,
  types: [],
  updateAdvancedSearchInputs: () => {},
  updateSort: () => {},
};

PageActions.propTypes = {
  activeType: PropTypes.string,
  advancedSearch: PropTypes.bool,
  classpieceClearSearch: PropTypes.func,
  classpieceItems: PropTypes.array,
  classpieceSearch: PropTypes.func,
  classpieceSearchInput: PropTypes.string,
  clearAdvancedSearch: PropTypes.func,
  clearSearch: PropTypes.func,
  defaultLimit: PropTypes.number.isRequired,
  gotoPage: PropTypes.func,
  gotoPageValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  handleChange: PropTypes.func.isRequired,
  limit: PropTypes.number,
  orderDesc: PropTypes.bool,
  orderField: PropTypes.string,
  page: PropTypes.number,
  pageType: PropTypes.string.isRequired,
  reload: PropTypes.func,
  searchElements: PropTypes.array,
  searchInput: PropTypes.string,
  setActiveType: PropTypes.func,
  setAdvancedSearch: PropTypes.func,
  setStatus: PropTypes.func,
  status: PropTypes.string,
  totalPages: PropTypes.number,
  types: PropTypes.array,
  updateAdvancedSearchInputs: PropTypes.func,
  updateLimit: PropTypes.func.isRequired,
  updateSort: PropTypes.func,
  updatePage: PropTypes.func.isRequired,
};

export default PageActions;
