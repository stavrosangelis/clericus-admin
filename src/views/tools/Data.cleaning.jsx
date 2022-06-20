import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  FormGroup,
  Input,
  Label,
  Spinner,
} from 'reactstrap';
import Rule from '../../components/import-data/Data.cleaning.rule';
import OutputResults from '../../components/import-data/Output.Results';
import { getData, putData, returnLetter } from '../../helpers';

const Breadcrumbs = lazy(() => import('../../components/Breadcrumbs'));
const DeleteModal = lazy(() => import('../../components/Delete.modal'));

const { REACT_APP_APIPATH: APIPath } = process.env;
const defaultRuleValues = {
  type: '',
  columns: [],
  entityType: '',
};

export default function DataCleaning() {
  // state
  const [loadingImportData, setLoadingImportData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [importData, setImportData] = useState(null);
  const [item, setItem] = useState(null);
  const [outputData, setOutputData] = useState([]);
  const [label, setLabel] = useState('');
  const [ruleValues, setRuleValues] = useState(defaultRuleValues);
  const [saving, setSaving] = useState(false);
  const [updateBtn, setUpdateBtn] = useState(
    <span>
      <i className="fa fa-save" /> Save Rules
    </span>
  );
  const [execBtn, setExecBtn] = useState(
    <span>
      Execute <i className="fa fa-chevron-right" />
    </span>
  );
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const { _id, importPlanId } = useParams();
  const prevId = useRef(null);

  const navTo = useNavigate();

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}import-plan`,
        crossDomain: true,
        params: { _id: importPlanId },
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
      if (!unmounted) {
        setLoadingImportData(false);
        const { data = null } = responseData;
        if (data !== null) {
          setImportData(data);
        }
        setLoading(true);
      }
    };
    if (loadingImportData) {
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loadingImportData, _id, importPlanId]);

  useEffect(() => {
    let unmounted = false;
    let timeout = null;
    let interval = null;
    const controller = new AbortController();
    const load = async () => {
      prevId.current = _id;
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}data-cleaning-instance`,
        crossDomain: true,
        params: { _id },
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
      if (!unmounted) {
        setLoading(false);
        const { data = null } = responseData;
        if (data !== null) {
          setItem(data);
          const {
            completed = false,
            rule = null,
            label: iLabel = '',
            outputData: iOutputData = '',
          } = data;
          if (rule !== null) {
            setRuleValues(rule);
            if (completed) {
              setRunning(false);
              setOutputData(JSON.parse(iOutputData));
              setExecBtn(
                <span>
                  Completed successfully <i className="fa fa-check" />
                </span>
              );
              timeout = setTimeout(() => {
                setExecBtn(
                  <span>
                    Execute <i className="fa fa-chevron-right" />
                  </span>
                );
              }, 2000);
            }
          }
          setLabel(iLabel);
        }
      }
    };
    if (loading) {
      load();
    }
    if (running && interval === null) {
      setResultsLoading(true);
      interval = setInterval(() => {
        load();
      }, 10000);
    }
    return () => {
      unmounted = true;
      controller.abort();
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [loading, _id, running]);

  useEffect(() => {
    if (!loading && prevId.current !== _id) {
      prevId.current = _id;
      setLoading(true);
      setItem(null);
    }
  }, [_id, loading]);

  useEffect(() => {
    if (outputData.length > 0) {
      setResultsLoading(false);
    }
  }, [outputData]);

  useEffect(() => {
    if (item !== null && item._id === null) {
      navTo(`/import-plan/${importPlanId}`);
    }
  }, [importPlanId, item, navTo]);

  const updateLabel = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setLabel(value);
  };

  const importLabel = importData !== null ? importData.label : '';
  const columns =
    importData !== null
      ? importData.columns.map(
          (c, i) => `[${returnLetter(i).toUpperCase()}] ${c}`
        )
      : [];
  const itemLabel = item !== null ? item.label : '';
  const breadcrumbsItems = [
    {
      label: 'Import Data',
      icon: 'fa fa-database',
      active: false,
      path: '/import-plans',
    },
    {
      label: importLabel,
      icon: 'fa fa-file-text',
      active: false,
      path: `/import-plan/${importPlanId}`,
    },
    {
      label: itemLabel,
      icon: 'fa fa-eraser',
      active: true,
      path: '',
    },
  ];

  const updateValues = (values) => {
    setRuleValues(values);
  };

  const returnUnique = useCallback(async () => {
    if (item !== null && item.rule !== null) {
      const params = {
        _id,
        columns: ruleValues.columns,
      };
      await getData(`data-cleaning-unique`, params);
      setRunning(true);
    }
  }, [item, _id, ruleValues]);

  const returnDBentries = useCallback(async () => {
    if (item !== null && item.rule !== null) {
      const { columns: selectedColumns, entityType } = ruleValues;
      const params = {
        _id,
        columns: selectedColumns,
        entityType,
      };
      await getData(`data-cleaning-db-entries`, params);
      setRunning(true);
    }
  }, [item, _id, ruleValues]);

  const returnWFDates = useCallback(async () => {
    if (item !== null && item.rule !== null) {
      const { columns: selectedColumns, entityType } = ruleValues;
      const params = {
        _id,
        columns: selectedColumns,
        entityType,
      };
      await getData(`data-cleaning-wf-dates`, params);
      setRunning(true);
    }
  }, [item, _id, ruleValues]);

  const reload = () => {
    setLoading(true);
  };

  const validate = () => {
    const type = ruleValues.type || '';
    const ruleColumns = ruleValues.columns || '';
    let valid = true;
    const newErrorText = [];
    if (_id === null) {
      newErrorText.push(
        <div key={0}>Please select a valid &quot;_id&quot; to continue.</div>
      );
      valid = false;
    } else if (label === '') {
      newErrorText.push(
        <div key={0}>The &quot;label&quot; must not be empty to continue.</div>
      );
      valid = false;
    } else if (type === '') {
      newErrorText.push(
        <div key={0}>Please select a &quot;type&quot; to continue.</div>
      );
      valid = false;
    } else if (type === 'unique' && ruleColumns.length === 0) {
      newErrorText.push(
        <div key={0}>Please select at least one column to continue.</div>
      );
      valid = false;
    }
    if (!valid) {
      setErrorText(newErrorText);
      setErrorVisible(true);
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Save error <i className="fa fa-times" />
        </span>
      );
      setSaving(false);
      setTimeout(() => {
        setUpdateBtn(
          <span>
            <i className="fa fa-save" /> Save Rules
          </span>
        );
      }, 2000);
    }
    return valid;
  };

  const save = async () => {
    if (saving) {
      return false;
    }
    const valid = validate();
    if (!valid) {
      return false;
    }
    setSaving(true);
    const type = ruleValues.type || '';
    const output = item.output || null;
    const updateData = {
      _id,
      label,
      type,
      importPlanId,
      rule: ruleValues,
      completed: false,
      output,
    };
    const update = await putData(`data-cleaning-instance`, updateData);
    if (update.status) {
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Save success{' '}
          <i className="fa fa-check" />
        </span>
      );
      setSaving(false);
      if (type !== '' && ruleValues?.columns?.length > 0) {
        reload();
      }
      if (errorVisible) {
        setErrorVisible(false);
      }
    } else {
      const newErrorText = [];
      for (let i = 0; i < update.errors.length; i += 1) {
        const error = update.errors[i];
        errorText.push(<div key={i}>{error.msg}</div>);
      }
      setErrorText(newErrorText);
      setErrorVisible(true);
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Save error <i className="fa fa-times" />
        </span>
      );
      setSaving(false);
    }
    setTimeout(() => {
      setUpdateBtn(
        <span>
          <i className="fa fa-save" /> Save Rules
        </span>
      );
    }, 2000);
    return true;
  };

  const saveAndExec = async () => {
    if (saving) {
      return false;
    }
    setExecBtn(
      <span>
        Executing <Spinner size="sm" color="success" />
      </span>
    );
    const valid = validate();
    if (!valid) {
      return false;
    }
    setSaving(true);
    setOutputData([]);
    const type = ruleValues.type || '';
    const output = item.output || null;
    const updateData = {
      _id,
      label,
      type,
      importPlanId,
      rule: ruleValues,
      completed: false,
      output,
    };
    const update = await putData(`data-cleaning-instance`, updateData);
    if (update.status) {
      setSaving(false);
      if (ruleValues.entityType !== '') {
        setLoading(true);
        setRunning(true);
      }
      if (errorVisible) {
        setErrorVisible(false);
      }
    } else {
      const newErrorText = [];
      for (let i = 0; i < update.errors.length; i += 1) {
        const error = update.errors[i];
        errorText.push(<div key={i}>{error.msg}</div>);
      }
      setErrorText(newErrorText);
      setErrorVisible(true);
      setExecBtn(
        <span>
          <i className="fa fa-save" /> Execution error{' '}
          <i className="fa fa-times" />
        </span>
      );
      setSaving(false);
    }
    if (type === 'unique') {
      returnUnique();
    } else if (type === 'db-entries') {
      returnDBentries();
    } else if (type === 'wf-dates') {
      returnWFDates();
    }
    return true;
  };

  const toggleDeleteModal = () => {
    setDeleteModalVisible(!deleteModalVisible);
  };

  const errorContainerClass = errorVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );

  const spinner = resultsLoading ? (
    <Card>
      <CardBody>
        <div className="row">
          <div className="col-12">
            <div style={{ padding: '40pt', textAlign: 'center' }}>
              <Spinner type="grow" color="info" /> <i>loading...</i>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  ) : (
    []
  );

  const { type: returnType } = ruleValues || null;

  let executeButton = [];
  if (
    item !== null &&
    item.rule !== null &&
    ruleValues.type !== '' &&
    ruleValues.columns.length > 0
  ) {
    executeButton = (
      <Button
        style={{ marginLeft: 20 }}
        color="success"
        outline
        size="sm"
        onClick={() => saveAndExec()}
      >
        {execBtn}
      </Button>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <div className="row">
        <div className="col-12">
          <h2>{itemLabel}</h2>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <Card>
            <CardBody>
              <div className="row">
                <div className="col">{errorContainer}</div>
              </div>
              <div className="row">
                <div className="cl-xs-12 col-sm-4">
                  <FormGroup>
                    <Label>Label</Label>
                    <Input
                      type="text"
                      name="label"
                      value={label}
                      onChange={(e) => updateLabel(e)}
                    />
                  </FormGroup>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <Rule
                    columns={columns}
                    updateValues={updateValues}
                    ruleValues={ruleValues}
                  />
                </div>
              </div>
              <CardFooter className="text-end">
                <Button
                  type="button"
                  outline
                  size="sm"
                  color="danger"
                  onClick={() => toggleDeleteModal()}
                  className="pull-left"
                >
                  <i className="fa fa-trash" /> Delete
                </Button>
                <Button
                  color="primary"
                  outline
                  size="sm"
                  onClick={() => save()}
                >
                  {updateBtn}
                </Button>
                {executeButton}
              </CardFooter>
            </CardBody>
          </Card>
          {spinner}
          <OutputResults outputData={outputData} type={returnType} />
        </div>
      </div>
      <Suspense fallback={null}>
        <DeleteModal
          _id={_id}
          label={label}
          path="data-cleaning-instance"
          params={{ _id }}
          visible={deleteModalVisible}
          toggle={toggleDeleteModal}
          update={reload}
        />
      </Suspense>
    </>
  );
}
