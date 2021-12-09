import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
import { Redirect } from 'react-router-dom';
import Rule from '../../components/import-data/Data.cleaning.rule';
import OutputResults from '../../components/import-data/Output.Results';
import DeleteModal from '../../components/Delete.Modal';
import { getData, putData, returnLetter } from '../../helpers';

const Breadcrumbs = lazy(() => import('../../components/breadcrumbs'));

const defaultRuleValues = {
  type: '',
  columns: [],
  entityType: '',
};

const DataCleaning = (props) => {
  // props
  const { match } = props;
  const { importId, _id } = match.params;

  // state
  const [loading, setLoading] = useState(true);
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
  const [redirect, setRedirect] = useState(false);

  const loadImportData = useCallback(async () => {
    // import data
    const responseData = await getData(`import`, { _id: importId });
    const { data } = responseData;
    setImportData(data);
  }, [importId]);

  const load = useCallback(async () => {
    if (loading) {
      loadImportData();
    }

    setLoading(false);
    // item data
    const itemResponseData = await getData(`data-cleaning-instance`, { _id });
    const { data: itemData } = itemResponseData;
    setItem(itemData);
    if (itemData.rule !== null) {
      setRuleValues(itemData.rule);
      const completed = itemData.completed || false;
      if (completed) {
        setRunning(false);
        setOutputData(JSON.parse(itemData.outputData));
        setExecBtn(
          <span>
            Completed successfully <i className="fa fa-check" />
          </span>
        );
        setTimeout(() => {
          setExecBtn(
            <span>
              Execute <i className="fa fa-chevron-right" />
            </span>
          );
        }, 2000);
      }
    }
    setLabel(itemData.label);
  }, [_id, loadImportData, loading]);

  useEffect(() => {
    let interval = null;
    if (loading) {
      load();
    }
    if (running && interval === null) {
      setResultsLoading(true);
      interval = setInterval(() => {
        load();
      }, 10000);
    }
    if (interval !== null) {
      return () => clearInterval(interval);
    }
    return false;
  }, [running, loading, load]);

  useEffect(() => {
    if (outputData.length > 0) {
      setResultsLoading(false);
    }
  }, [outputData]);

  useEffect(() => {
    if (redirect) {
      setRedirect(false);
    }
  }, [redirect]);

  useEffect(() => {
    if (item !== null && item._id === null) {
      setRedirect(true);
    }
  }, [item]);

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
      path: `/import-plan/${importId}`,
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
      importId,
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
      importId,
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

  const redirectElem = redirect ? (
    <Redirect to={`/import-plan/${importId}`} />
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
    <div>
      {redirectElem}
      <Suspense fallback={[]}>
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
              <CardFooter className="text-right">
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

      <DeleteModal
        _id={_id}
        label={label}
        path="data-cleaning-instance"
        params={{ _id }}
        visible={deleteModalVisible}
        toggle={toggleDeleteModal}
        update={reload}
      />
    </div>
  );
};

DataCleaning.defaultProps = {
  match: null,
};
DataCleaning.propTypes = {
  match: PropTypes.object,
};

export default DataCleaning;
