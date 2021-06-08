import React, { useEffect, useState } from 'react';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import PropTypes from 'prop-types';

const MainPagination = (props) => {
  // props
  const {
    currentPage,
    totalPages,
    pagination_function: paginationFunction,
  } = props;

  // state
  const [paginationItems, setPaginationItems] = useState([]);

  useEffect(() => {
    const createPagination = () => {
      let prevPage = 0;
      let nextPage = 0;

      if (currentPage < totalPages) {
        nextPage = currentPage + 1;
      }
      if (currentPage > 1) {
        prevPage = currentPage - 1;
      }
      const newPaginationItems = [];
      const paginationFirstItem = (
        <li key="first">
          <PaginationLink
            className="href-btn"
            onClick={() => paginationFunction(1)}
          >
            <i className="fa-step-backward fa" />
          </PaginationLink>
        </li>
      );
      const paginationPrevItem = (
        <li key="prev">
          <PaginationLink
            className="href-btn"
            onClick={() => paginationFunction(prevPage)}
          >
            <i className="fa-backward fa" />
          </PaginationLink>
        </li>
      );
      newPaginationItems.push(paginationFirstItem);
      newPaginationItems.push(paginationPrevItem);

      for (let j = 0; j < Number(totalPages); j += 1) {
        const pageNum = j + 1;
        const pageActive = currentPage === pageNum ? 'active' : '';

        let paginationItem = (
          <PaginationItem key={pageNum} className={pageActive}>
            <PaginationLink
              className="href-btn"
              onClick={() => paginationFunction(pageNum)}
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        );
        if (pageActive === 'active') {
          paginationItem = (
            <PaginationItem key={pageNum} className={pageActive}>
              <PaginationLink>{pageNum}</PaginationLink>
            </PaginationItem>
          );
        }

        // normalize first page
        if (currentPage < 6 && j < 9) {
          newPaginationItems.push(paginationItem);
        }
        // normalize last page
        else if (currentPage >= totalPages - 4 && j > totalPages - 10) {
          newPaginationItems.push(paginationItem);
        }
        // the rest
        else if (j > currentPage - 6 && j < currentPage + 4) {
          newPaginationItems.push(paginationItem);
        }
      }

      const paginationNextItem = (
        <PaginationItem key="next">
          <PaginationLink
            className="href-btn"
            onClick={() => paginationFunction(nextPage)}
          >
            <i className="fa-forward fa" />
          </PaginationLink>
        </PaginationItem>
      );
      const paginationLastItem = (
        <PaginationItem key="last">
          <PaginationLink
            className="href-btn"
            onClick={() => paginationFunction(totalPages)}
          >
            <i className="fa-step-forward fa" />
          </PaginationLink>
        </PaginationItem>
      );
      newPaginationItems.push(paginationNextItem);
      newPaginationItems.push(paginationLastItem);

      return newPaginationItems;
    };
    setPaginationItems(createPagination());
  }, [currentPage, totalPages, paginationFunction]);

  return (
    <div className="pagination-container">
      <Pagination>{paginationItems}</Pagination>
    </div>
  );
};

MainPagination.defaultProps = {
  currentPage: 1,
  totalPages: 1,
  pagination_function: () => {},
};

MainPagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  pagination_function: PropTypes.func,
};

export default MainPagination;
