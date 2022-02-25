import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Tooltip } from 'reactstrap';
import PropTypes from 'prop-types';
import { getData } from '../../helpers';
import Fileblock from '../../components/import-data/File.block';
import Columns from '../../components/import-data/Columns';
import Datacleaning from '../../components/import-data/Data.cleaning.block';
import ImportPlanRulesEntities from '../../components/import-data/Import.plan.rules.entities.block';
import ImportPlanRulesRelations from '../../components/import-data/Import.plan.rules.relations.block';
import IngestDataBlock from '../../components/import-data/Ingest.Data.Block';

import '../../assets/scss/import.scss';

const Breadcrumbs = lazy(() => import('../../components/breadcrumbs'));

function scrollToElem(containerParam = null, elementParam = null) {
  const container = containerParam;
  const element = elementParam;
  if (container !== null && element !== null) {
    const { left: elLeft } = element.getBoundingClientRect();
    const { left: cLeft } = container.getBoundingClientRect();
    const { scrollLeft } = container;
    const style = getComputedStyle(element);
    const marginLeft = style['margin-left'].replace('px', '');
    const marginNum = Number(marginLeft) || 0;
    const left = elLeft + scrollLeft - cLeft - marginNum;
    if (typeof container.scrollTo !== 'undefined') {
      container.scrollTo({
        left,
        behaviour: 'smooth',
      });
    }
  }
}

const Import = (props) => {
  // props
  const { match } = props;
  const { _id } = match.params;

  // state
  const [loading, setLoading] = useState(true);
  // const [stateError, setError] = useState({ visible: false, text: [] });
  const [item, setItem] = useState(null);
  const [label, setLabel] = useState('');
  const [colData, setColData] = useState([]);
  const [updateColumnsStatus, setUpdateColumnsStatus] = useState(false);
  const [step, setStep] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [tooltips, setTooltips] = useState({
    fileBlock: false,
    columnsBlock: false,
    dataCleaningBlock: false,
  });
  const [dataCleaningLength, setDatacleaningLength] = useState(0);
  const [importRulesData, setImportRulesData] = useState([]);
  const [importRulesLoading, setImportRulesLoading] = useState(true);
  const [importRulesRelations, setImportRulesRelations] = useState([]);
  const [completeInterval, setCompleteInterval] = useState(false);
  const [ingestionStatus, setIngestionStatus] = useState({
    _id: '',
    msg: '',
    progress: 0,
    started: '',
    status: 0,
  });

  // refs
  const mounted = useRef(false);
  const containerRef = useRef(null);
  const fileBlockRef = useRef(null);
  const columnsBlockRef = useRef(null);
  const dataCleaningBlockRef = useRef(null);
  const importPlanBlockRef = useRef(null);
  const ingestBlockRef = useRef(null);
  const fileBlockButtonRef = useRef(null);
  const columnsBlockButtonRef = useRef(null);
  const dataCleaningBlockButtonRef = useRef(null);
  const importPlanBlockButtonRef = useRef(null);
  const ingestBlockButtonRef = useRef(null);

  const toggleTooltips = (value) => {
    const copy = {
      fileBlock: false,
      columnsBlock: false,
      dataCleaningBlock: false,
      importPlanBlock: false,
    };
    copy[value] = !tooltips[value];
    setTooltips(copy);
  };

  const loadImportRules = useCallback(async () => {
    const responseData = await getData(`import-plan-rules`, {
      importPlanId: _id,
      limit: 500,
    });
    const { data } = responseData.data;
    return data;
  }, [_id]);

  const load = useCallback(async () => {
    const responseData = await getData(`import-plan`, { _id });
    const { data } = responseData;
    return data;
  }, [_id]);

  const loadImportStatus = useCallback(async () => {
    const { data } = await getData(`import-plan-status`, { _id });
    const { progress = 0 } = data;
    data.progress = Number(progress);
    return data;
  }, [_id]);

  const reloadImportRules = () => {
    setImportRulesLoading(true);
  };
  const reloadImportRelations = () => {
    setLoading(true);
  };

  useEffect(() => {
    mounted.current = true;
    const updateRules = async () => {
      const rules = await loadImportRules();
      if (mounted.current) {
        setImportRulesLoading(false);
        setImportRulesData(rules);
      }
    };
    if (importRulesLoading) {
      updateRules();
    }
    return () => {
      mounted.current = false;
    };
  }, [importRulesLoading, loadImportRules]);

  useEffect(() => {
    mounted.current = true;
    const updateData = async () => {
      const data = await load();
      const rules = await loadImportRules();
      if (mounted.current) {
        setLoading(false);
        setItem(data);
        setLabel(data.label);
        const relations = data.relations || [];
        const parsedRelations = relations.map((r) => JSON.parse(r));
        setImportRulesRelations(parsedRelations);

        setImportRulesData(rules);
      }
    };
    if (loading) {
      updateData();
    }
    return () => {
      mounted.current = false;
    };
  }, [loading, load, loadImportRules]);

  useEffect(() => {
    mounted.current = true;
    let interval = null;
    const status = item?.ingestionStatus || 0;

    if (status === 1 && interval === null && !completeInterval) {
      interval = setInterval(async () => {
        const data = await loadImportStatus();
        if (mounted.current) {
          setIngestionStatus(data);
          if (data.status !== 1) {
            setCompleteInterval(true);
          }
        }
      }, 2000);
    } else {
      setIngestionStatus({
        _id: '',
        msg: '',
        progress: 0,
        started: '',
        status: Number(item?.ingestionStatus),
      });
    }
    if (interval !== null) {
      return () => clearInterval(interval);
    }
    return () => {
      mounted.current = false;
    };
  }, [item, loadImportStatus, completeInterval]);

  const updateActive = (value = 0) => {
    setActiveStep(value);
    let col = null;
    switch (value) {
      case 0:
        col = fileBlockRef.current;
        break;
      case 1:
        col = columnsBlockRef.current;
        break;
      case 2:
        col = dataCleaningBlockRef.current;
        break;
      case 3:
        col = importPlanBlockRef.current;
        break;
      case 4:
        col = ingestBlockRef.current;
        break;
      default:
        col = fileBlockRef.current;
        break;
    }
    if (col !== null) {
      if (containerRef.current !== null) {
        scrollToElem(containerRef.current, col);
      }
    }
  };

  useEffect(() => {
    let newStep = 0;
    if (
      item !== null &&
      typeof item.uploadedFile !== 'undefined' &&
      item.uploadedFile !== null
    ) {
      newStep = 1;
      if (colData.length > 0) {
        newStep = 3;
      }
      if (dataCleaningLength > 0) {
        newStep = 3;
      }
      if (importRulesData.length > 0 && importRulesRelations.length > 0) {
        newStep = 4;
      }
    }
    setStep(newStep);
    setTimeout(() => updateActive(newStep), 500);
  }, [
    item,
    colData,
    dataCleaningLength,
    importRulesData,
    importRulesRelations,
  ]);

  const reload = () => {
    setLoading(true);
    setUpdateColumnsStatus(true);
  };

  const updateColumns = (data) => {
    setColData(data);
  };

  useEffect(() => {
    if (updateColumnsStatus) {
      setUpdateColumnsStatus(false);
    }
  }, [updateColumnsStatus]);

  const breadcrumbsItems = [
    {
      label: 'Import Data Plans',
      icon: 'fa fa-database',
      active: false,
      path: '/import-plans',
    },
    { label, icon: 'fa fa-file-text', active: true, path: '' },
  ];

  const active0 = activeStep === 0 ? ' active' : '';
  const active1 = activeStep === 1 ? ' active' : '';
  const active2 = activeStep === 2 ? ' active' : '';
  const active3 = activeStep === 3 ? ' active' : '';
  const active4 = activeStep === 4 ? ' active' : '';

  const fileBlock = (
    <div className={`column${active0}`} ref={fileBlockRef}>
      <Fileblock item={item} update={reload} />
    </div>
  );
  const columnsBlock =
    step > 0 ? (
      <div className={`column${active1}`} ref={columnsBlockRef}>
        <Columns
          importPlanId={_id}
          updateColumns={updateColumns}
          update={updateColumnsStatus}
        />
      </div>
    ) : (
      []
    );
  const dataCleaningBlock =
    step > 1 ? (
      <div className={`column${active2}`} ref={dataCleaningBlockRef}>
        <Datacleaning
          _id={item._id}
          columns={colData}
          updateLength={setDatacleaningLength}
        />
      </div>
    ) : (
      []
    );
  const ingestBlock =
    step > 3 ? (
      <div className={`column${active4}`} ref={ingestBlockRef}>
        <IngestDataBlock
          _id={_id}
          ingestionStatus={ingestionStatus}
          reload={reload}
        />
      </div>
    ) : (
      []
    );
  const importPlanBlock =
    step > 2 ? (
      <div className={`column${active3}`} ref={importPlanBlockRef}>
        <ImportPlanRulesEntities
          _id={item._id}
          columns={colData}
          items={importRulesData}
          reloadFn={reloadImportRules}
        />
        <ImportPlanRulesRelations
          _id={item._id}
          columns={colData}
          rules={importRulesData}
          items={importRulesRelations}
          reloadFn={reloadImportRelations}
        />
      </div>
    ) : (
      []
    );
  const fileBlockButtonArrow =
    step > 0 ? <i className="fa fa-angle-right" /> : [];
  const columnsBlockButtonArrow =
    step > 1 ? <i className="fa fa-angle-right" /> : [];
  const columnsBlockButton =
    step > 0 ? (
      <span>
        <button
          type="button"
          className={`progress-nav-item${active1}`}
          onClick={() => updateActive(1)}
          ref={columnsBlockButtonRef}
          onFocus={() => toggleTooltips('columnsBlock')}
          onBlur={() => toggleTooltips('columnsBlock')}
          onMouseEnter={() => toggleTooltips('columnsBlock')}
          onMouseLeave={() => toggleTooltips('columnsBlock')}
        >
          <i className="fa fa-columns" />
        </button>
        {columnsBlockButtonArrow}
        {columnsBlockButtonRef.current !== null ? (
          <Tooltip
            placement="top"
            isOpen={tooltips.columnsBlock}
            target={columnsBlockButtonRef.current}
            toggle={() => toggleTooltips('columnsBlock')}
          >
            <small>File Columns</small>
          </Tooltip>
        ) : (
          []
        )}
      </span>
    ) : (
      []
    );
  const dataCleaningBlockButtonArrow =
    step > 2 ? <i className="fa fa-angle-right" /> : [];
  const dataCleaningBlockButton =
    step > 1 ? (
      <span>
        <button
          type="button"
          className={`progress-nav-item${active2}`}
          onClick={() => updateActive(2)}
          ref={dataCleaningBlockButtonRef}
          onFocus={() => toggleTooltips('dataCleaningBlock')}
          onBlur={() => toggleTooltips('dataCleaningBlock')}
          onMouseEnter={() => toggleTooltips('dataCleaningBlock')}
          onMouseLeave={() => toggleTooltips('dataCleaningBlock')}
        >
          <i className="fa fa-check-circle-o" />
        </button>
        {dataCleaningBlockButtonArrow}
        {dataCleaningBlockButtonRef.current !== null ? (
          <Tooltip
            placement="top"
            isOpen={tooltips.dataCleaningBlock}
            target={dataCleaningBlockButtonRef.current}
            toggle={() => toggleTooltips('dataCleaningBlock')}
          >
            <small>Data cleaning / disambiguation</small>
          </Tooltip>
        ) : (
          []
        )}
      </span>
    ) : (
      []
    );
  const importPlanBlockButtonArrow =
    step > 3 ? <i className="fa fa-angle-right" /> : [];
  const importPlanBlockButton =
    step > 2 ? (
      <span>
        <button
          type="button"
          className={`progress-nav-item${active3}`}
          onClick={() => updateActive(3)}
          ref={importPlanBlockButtonRef}
          onFocus={() => toggleTooltips('importPlanBlock')}
          onBlur={() => toggleTooltips('importPlanBlock')}
          onMouseEnter={() => toggleTooltips('importPlanBlock')}
          onMouseLeave={() => toggleTooltips('importPlanBlock')}
        >
          <i className="fa fa-file-text-o" />
        </button>
        {importPlanBlockButtonArrow}
        {importPlanBlockButtonRef.current !== null ? (
          <Tooltip
            placement="top"
            isOpen={tooltips.importPlanBlock}
            target={importPlanBlockButtonRef.current}
            toggle={() => toggleTooltips('importPlanBlock')}
          >
            <small>Import plan rules</small>
          </Tooltip>
        ) : (
          []
        )}
      </span>
    ) : (
      []
    );
  const ingestBlockButtonArrow =
    step > 4 ? <i className="fa fa-angle-right" /> : [];
  const ingestBlockButton =
    step > 3 ? (
      <span>
        <button
          type="button"
          className={`progress-nav-item${active4}`}
          onClick={() => updateActive(4)}
          ref={ingestBlockButtonRef}
          onFocus={() => toggleTooltips('ingestBlock')}
          onBlur={() => toggleTooltips('ingestBlock')}
          onMouseEnter={() => toggleTooltips('ingestBlock')}
          onMouseLeave={() => toggleTooltips('ingestBlock')}
        >
          <i className="fa fa-eye" />
        </button>
        {ingestBlockButtonArrow}
        {ingestBlockButtonRef.current !== null ? (
          <Tooltip
            placement="top"
            isOpen={tooltips.ingestBlock}
            target={ingestBlockButtonRef.current}
            toggle={() => toggleTooltips('ingestBlock')}
          >
            <small>Preview results</small>
          </Tooltip>
        ) : (
          []
        )}
      </span>
    ) : (
      []
    );

  const progressNav = (
    <div className="progress-nav">
      <span>
        <button
          type="button"
          className={`progress-nav-item${active0}`}
          onClick={() => updateActive(0)}
          ref={fileBlockButtonRef}
          onFocus={() => toggleTooltips('fileBlock')}
          onBlur={() => toggleTooltips('fileBlock')}
          onMouseEnter={() => toggleTooltips('fileBlock')}
          onMouseLeave={() => toggleTooltips('fileBlock')}
        >
          <i className="fa fa-file-excel-o" />
        </button>
        {fileBlockButtonArrow}
        {fileBlockButtonRef.current !== null ? (
          <Tooltip
            placement="top"
            isOpen={tooltips.fileBlock}
            target={fileBlockButtonRef.current}
            toggle={() => toggleTooltips('fileBlock')}
          >
            <small>File details</small>
          </Tooltip>
        ) : (
          []
        )}
      </span>
      {columnsBlockButton}
      {dataCleaningBlockButton}
      {importPlanBlockButton}
      {ingestBlockButton}
    </div>
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
        <div className="col">{progressNav}</div>
      </div>
      <div className="scrollable-row" ref={containerRef}>
        {fileBlock}
        {columnsBlock}
        {dataCleaningBlock}
        {importPlanBlock}
        {ingestBlock}
      </div>
    </div>
  );
};
Import.defaultProps = {
  match: null,
};
Import.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      _id: PropTypes.string,
    }),
  }),
};
export default Import;
