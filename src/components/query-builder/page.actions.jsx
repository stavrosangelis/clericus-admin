import React from 'react';
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import MainPagination from '../pagination';
import {
  setPaginationParams,
  toggleQueryBuilderSubmit,
} from '../../redux/actions';

const PageActions = () => {
  // redux store
  const dispatch = useDispatch();
  const paginationParams = useSelector((state) => state.queryBuilderPagination);
  const totalPages = useSelector(
    (state) => state.queryBuildResults.totalPages || 0
  );

  const updateStorePagination = ({
    limit = null,
    page = null,
    orderField = '',
    orderDesc = false,
    status = null,
  }) => {
    let limitCopy = limit;
    let pageCopy = page;
    let orderFieldCopy = orderField;
    let orderDescCopy = orderDesc;
    if (limit === null) {
      limitCopy = paginationParams.limit;
    }
    if (page === null) {
      pageCopy = paginationParams.page;
    }
    if (orderField === '') {
      orderFieldCopy = paginationParams.orderField;
    }
    if (orderDesc === false) {
      orderDescCopy = paginationParams.orderDesc;
    }
    const payload = {
      limit: limitCopy,
      page: pageCopy,
      orderField: orderFieldCopy,
      orderDesc: orderDescCopy,
      status,
    };
    dispatch(setPaginationParams('queryBuilder', payload));
    dispatch(toggleQueryBuilderSubmit(true));
  };

  const updatePage = (value) => {
    if (value > 0 && value !== paginationParams.page) {
      updateStorePagination({ page: value });
    }
  };

  const paginationHTML = (
    <MainPagination
      currentPage={paginationParams.page}
      totalPages={totalPages}
      pagination_function={updatePage}
    />
  );

  // limit filter
  const limitActive0 = paginationParams.limit === 25;
  const limitActive1 = paginationParams.limit === 50;
  const limitActive2 = paginationParams.limit === 100;
  const limitActive3 = paginationParams.limit === 500;
  const limitFilter = (
    <div className="filter-item">
      <UncontrolledDropdown direction="down">
        <DropdownToggle caret size="sm" outline>
          Limit
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem
            active={limitActive0}
            onClick={() => updateStorePagination({ limit: 25 })}
          >
            25
          </DropdownItem>
          <DropdownItem
            active={limitActive1}
            onClick={() => updateStorePagination({ limit: 50 })}
          >
            50
          </DropdownItem>
          <DropdownItem
            active={limitActive2}
            onClick={() => updateStorePagination({ limit: 100 })}
          >
            100
          </DropdownItem>
          <DropdownItem
            active={limitActive3}
            onClick={() => updateStorePagination({ limit: 500 })}
          >
            500
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </div>
  );

  return (
    <div className="row">
      <div className="col-12">
        <div className="page-actions pull-right">
          {limitFilter}
          {paginationHTML}
        </div>
      </div>
    </div>
  );
};

export default PageActions;
