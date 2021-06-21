import React, { Suspense, lazy } from 'react';
import { Badge } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toggleQueryBlock } from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/breadcrumbs'));
const QueryBlock = lazy(() =>
  import('../components/query-builder/query.block')
);
const List = lazy(() => import('../components/query-builder/list'));

const QueryBuilder = () => {
  const dispatch = useDispatch();
  const heading = 'Query Builder';
  const breadcrumbsItems = [
    { label: heading, icon: 'pe-7s-help1', active: true, path: '' },
  ];
  const queryBlockOpen = useSelector((state) => state.queryBlockOpen);
  const collapseOpen = queryBlockOpen ? ' open' : '';

  return (
    <div>
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <div className="row">
        <div className="col-12">
          <h2>
            {heading}
            <div className={`query-builder-collapse${collapseOpen}`}>
              <Badge
                color="secondary"
                pill
                onClick={() => dispatch(toggleQueryBlock())}
              >
                Toggle query <i className="fa fa-chevron-up" />
              </Badge>
            </div>
          </h2>
        </div>
      </div>

      <Suspense fallback={[]}>
        <QueryBlock />
      </Suspense>

      <Suspense fallback={[]}>
        <List />
      </Suspense>
    </div>
  );
};

export default QueryBuilder;
