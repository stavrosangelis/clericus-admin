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
} from 'reactstrap';
import { Redirect } from 'react-router-dom';
import Rule from '../../components/import-data/Import.plan.rule';
import DeleteModal from '../../components/Delete.Modal';
import { getData, putData, returnLetter } from '../../helpers';

const Breadcrumbs = lazy(() => import('../../components/breadcrumbs'));

const defaultRuleValues = {
  columns: [],
  entityType: '',
};

const ImportPlanRule = (props) => {
  // props
  const { match } = props;
  const { importPlanId, _id } = match.params;

  // state
  const [loading, setLoading] = useState(true);
  const [importData, setImportData] = useState(null);
  const [item, setItem] = useState(null);
  const [label, setLabel] = useState('');
  const [ruleValues, setRuleValues] = useState(defaultRuleValues);
  const [saving, setSaving] = useState(false);
  const [updateBtn, setUpdateBtn] = useState(
    <span>
      <i className="fa fa-save" /> Save Rules
    </span>
  );
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const loadImportData = useCallback(async () => {
    // import data
    const responseData = await getData(`import-plan`, { _id: importPlanId });
    const { data } = responseData;
    setImportData(data);
  }, [importPlanId]);

  const load = useCallback(async () => {
    if (loading) {
      loadImportData();
    }
    setLoading(false);
    // item data
    const itemResponseData = await getData(`import-plan-rule`, { _id });
    const { data: itemData } = itemResponseData;
    setItem(itemData);
    if (itemData.rule !== null) {
      setRuleValues(itemData.rule);
    } else {
      const resetRuleValues = {
        columns: [],
        entityType: '',
      };
      setRuleValues(resetRuleValues);
    }
    setLabel(itemData.label);
  }, [_id, loadImportData, loading]);

  useEffect(() => {
    if (loading) {
      load();
    }
  }, [loading, load]);

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

  const reload = () => {
    setLoading(true);
  };

  const validate = () => {
    const { entityType = '' } = ruleValues;
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
    } else if (entityType === '') {
      newErrorText.push(
        <div key={0}>Please select an &quot;entity type&quot; to continue.</div>
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
    const update = await putData(`import-plan-rule`, updateData);
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

  const toggleDeleteModal = () => {
    setDeleteModalVisible(!deleteModalVisible);
  };

  const errorContainerClass = errorVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );

  const redirectElem = redirect ? (
    <Redirect to={`/import-plan/${importPlanId}`} />
  ) : (
    []
  );

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
                <div className="cl-xs-12 col-sm-6">
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
              </CardFooter>
            </CardBody>
          </Card>
        </div>
      </div>

      <DeleteModal
        _id={_id}
        label={label}
        path="import-plan-rule"
        params={{ _id }}
        visible={deleteModalVisible}
        toggle={toggleDeleteModal}
        update={reload}
      />
    </div>
  );
};

ImportPlanRule.defaultProps = {
  match: null,
};
ImportPlanRule.propTypes = {
  match: PropTypes.object,
};

export default ImportPlanRule;
