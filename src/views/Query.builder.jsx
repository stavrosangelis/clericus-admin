import React, { Suspense, lazy } from 'react';
import { Badge } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toggleQueryBlock } from '../redux/actions';

const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const QueryBlock = lazy(() =>
  import('../components/query-builder/query.block')
);
const List = lazy(() => import('../components/query-builder/list'));

const heading = 'Query Builder';
const breadcrumbsItems = [
  { label: heading, icon: 'pe-7s-help1', active: true, path: '' },
];
function QueryBuilder() {
  const dispatch = useDispatch();
  const queryBlockOpen = useSelector((state) => state.queryBlockOpen);
  const collapseOpen = queryBlockOpen ? ' open' : '';

  return (
    <>
      <Suspense fallback={null}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <div className="row">
        <div className="col-12">
          <h2 style={{ position: 'relative', display: 'block' }}>
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

      <Suspense fallback={null}>
        <QueryBlock />
      </Suspense>

      <Suspense fallback={null}>
        <List />
      </Suspense>
    </>
  );
}

export default QueryBuilder;
