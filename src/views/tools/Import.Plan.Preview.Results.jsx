import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Button, Card, CardBody, Collapse, Input, Spinner } from 'reactstrap';
import PropTypes from 'prop-types';
import { getData } from '../../helpers';
import ImportPlanPreviewRows from '../../components/import-data/Import.Plan.Preview.Rows';
import '../../assets/scss/import-plan-preview.scss';

const Breadcrumbs = lazy(() => import('../../components/breadcrumbs'));

const ImportPlanPreviewResults = (props) => {
  // props
  const { match } = props;
  const { _id } = match.params;

  // state
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [label, setLabel] = useState('');
  const [collapseOpen, setCollapseOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([2]);

  const toggleCollapse = () => {
    setCollapseOpen(!collapseOpen);
  };

  const addSelectedRow = () => {
    if (selectedRows.length < 10) {
      const copy = [...selectedRows];
      copy.push(0);
      setSelectedRows(copy);
    }
  };

  const removeSelectedRow = (e, idx = -1) => {
    e.preventDefault();
    if (selectedRows.length > 1) {
      const copy = [...selectedRows];
      copy.splice(idx, 1);
      setSelectedRows(copy);
    }
  };

  const updateSelectedRows = (e, idx = -1) => {
    const { value: valueParam } = e.target;
    const value = valueParam !== '' ? Number(valueParam) : '';
    const copy = [...selectedRows];
    copy[idx] = value;
    setSelectedRows(copy);
  };

  const load = useCallback(async () => {
    setLoading(false);
    const responseData = await getData(`import-plan-preview-results`, {
      _id,
      rows: selectedRows,
    });
    const { data } = responseData;
    setItem(data);
    setLabel(data.label);
  }, [_id, selectedRows]);

  useEffect(() => {
    if (loading) {
      load();
    }
  }, [loading, load]);

  const breadcrumbsItems = [
    {
      label: 'Import Data Plans',
      icon: 'fa fa-database',
      active: false,
      path: '/import-plans',
    },
    {
      label,
      icon: 'fa fa-file-text',
      active: false,
      path: `/import-plan/${_id}`,
    },
    {
      label: `${label} preview results`,
      icon: 'fa fa-eye',
      active: true,
      path: '',
    },
  ];

  let rows = [];
  if (item !== null) {
    rows = (
      <ImportPlanPreviewRows
        columns={item.columns}
        rows={item.rows}
        rules={item.parsedRules}
        relations={item.relations}
        selectedRows={selectedRows}
      />
    );
  }

  const outputSelectedRows = selectedRows.map((s, i) => {
    const key = `sr.${i}`;
    return (
      <div className="import-plan-preview-selected-row" key={key}>
        <Input
          type="number"
          name="selected-row[]"
          value={s}
          onChange={(e) => updateSelectedRows(e, i)}
        />
        <Button
          size="sm"
          color="secondary"
          outline
          className="import-plan-preview-selected-row-remove"
          onClick={(e) => removeSelectedRow(e, i)}
        >
          <i className="fa fa-minus" />
        </Button>
      </div>
    );
  });

  const content = loading ? (
    <div className="row">
      <div className="col-12">
        <div style={{ padding: '40pt', textAlign: 'center' }}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
  ) : (
    rows
  );

  return (
    <div>
      <Suspense fallback={[]}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <div className="row">
        <div className="col">
          <h2>{label}</h2>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <Card>
            <CardBody className="spatials-card">
              <Button
                onClick={() => toggleCollapse()}
                color="secondary"
                size="sm"
                style={{ marginBottom: '15px' }}
              >
                Select rows
              </Button>
              <Collapse isOpen={collapseOpen}>
                {outputSelectedRows}
                <div style={{ marginBottom: '10px' }}>
                  <Button
                    color="primary"
                    outline
                    size="sm"
                    onClick={() => addSelectedRow()}
                  >
                    Add row <i className="fa fa-plus" />
                  </Button>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => setLoading(true)}
                  >
                    Update preview <i className="fa fa-refresh" />
                  </Button>
                </div>
              </Collapse>
              {content}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
ImportPlanPreviewResults.defaultProps = {
  match: null,
};
ImportPlanPreviewResults.propTypes = {
  match: PropTypes.object,
};
export default ImportPlanPreviewResults;
