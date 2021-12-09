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

import '../../assets/scss/import.scss';

const Breadcrumbs = lazy(() => import('../../components/breadcrumbs'));

function scrollTo(containerParam = null, elementParam = null) {
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
    container.scrollTo({
      left,
      behaviour: 'smooth',
    });
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

  // refs
  const containerRef = useRef(null);
  const fileBlockRef = useRef(null);
  const columnsBlockRef = useRef(null);
  const dataCleaningBlockRef = useRef(null);
  const importPlanBlockRef = useRef(null);
  const fileBlockButtonRef = useRef(null);
  const columnsBlockButtonRef = useRef(null);
  const dataCleaningBlockButtonRef = useRef(null);
  const importPlanBlockButtonRef = useRef(null);

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
    setImportRulesLoading(false);
    const responseData = await getData(`import-plan-rules`, {
      importId: _id,
      limit: 100,
    });
    const { data } = responseData.data;
    setImportRulesData(data);
  }, [_id]);

  const load = useCallback(async () => {
    setLoading(false);
    const responseData = await getData(`import`, { _id });
    const { data } = responseData;
    setItem(data);
    setLabel(data.label);
    const relations = data.relations || [];
    const parsedRelations = relations.map((r) => JSON.parse(r));
    setImportRulesRelations(parsedRelations);
  }, [_id]);

  const reloadImportRules = () => {
    setImportRulesLoading(true);
  };
  const reloadImportRelations = () => {
    setLoading(true);
  };

  useEffect(() => {
    if (importRulesLoading) {
      loadImportRules();
    }
  }, [importRulesLoading, loadImportRules]);

  useEffect(() => {
    if (loading) {
      load();
      loadImportRules();
    }
  }, [loading, load, loadImportRules]);

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
      default:
        col = fileBlockRef.current;
        break;
    }
    if (col !== null) {
      scrollTo(containerRef.current, col);
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
    }
    setStep(newStep);
    setTimeout(() => updateActive(newStep), 500);
  }, [item, colData, dataCleaningLength]);

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

  const fileBlock = (
    <div className={`column${active0}`} ref={fileBlockRef}>
      <Fileblock item={item} update={reload} />
    </div>
  );
  const columnsBlock =
    step > 0 ? (
      <div className={`column${active1}`} ref={columnsBlockRef}>
        <Columns
          importId={_id}
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
      </div>
    </div>
  );
};
Import.defaultProps = {
  match: null,
};
Import.propTypes = {
  match: PropTypes.object,
};
export default Import;
