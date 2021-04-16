import { Badge } from 'reactstrap';
import React, { useDispatch, useSelector } from 'react-redux';
import Breadcrumbs from '../components/breadcrumbs';
import QueryBlock from '../components/query-builder/query.block';
import List from '../components/query-builder/list';
import { toggleQueryBlock } from '../redux/actions';

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
      <Breadcrumbs items={breadcrumbsItems} />
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
      <QueryBlock />
      <List />
    </div>
  );
};

export default QueryBuilder;
