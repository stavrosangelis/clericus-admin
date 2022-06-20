import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Button, Card, CardBody, Collapse, Input, Spinner } from 'reactstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ImportPlanPreviewRows from '../../components/import-data/Import.Plan.Preview.Rows';
import '../../assets/scss/import.plan.preview.scss';

const Breadcrumbs = lazy(() => import('../../components/Breadcrumbs'));
const { REACT_APP_APIPATH: APIPath } = process.env;

export default function ImportPlanPreviewResults() {
  // state
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [label, setLabel] = useState('');
  const [collapseOpen, setCollapseOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([2]);

  const { _id } = useParams();
  const prevId = useRef(null);

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

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      prevId.current = _id;
      const loadData = async () => {
        const responseData = await axios({
          method: 'get',
          url: `${APIPath}import-plan-preview-results`,
          crossDomain: true,
          params: {
            _id,
            rows: selectedRows,
          },
          signal: controller.signal,
        })
          .then((response) => {
            const { data: rData = null } = response;
            return rData;
          })
          .catch((error) => {
            console.log(error);
            return { data: null };
          });
        return responseData;
      };
      const { data = null } = await loadData();
      if (!unmounted) {
        setLoading(false);
        setItem(data);
        setLabel(data.label);
      }
    };

    if (loading) {
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading, _id, selectedRows]);

  useEffect(() => {
    if (!loading && prevId.current !== _id) {
      prevId.current = _id;
      setLoading(true);
      setItem(null);
    }
  }, [_id, loading]);

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
    const {
      columns: iColumns = [],
      rows: iRows = [],
      parsedRules: iParsedRules = null,
      relations: iRelations = [],
    } = item;
    rows = (
      <ImportPlanPreviewRows
        columns={iColumns}
        rows={iRows}
        rules={iParsedRules}
        relations={iRelations}
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
}
