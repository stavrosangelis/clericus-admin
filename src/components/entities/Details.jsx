import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import axios from 'axios';
import {
  Button,
  CardTitle,
  Collapse,
  Form,
  FormGroup,
  Input,
  Label,
  Spinner,
} from 'reactstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';

const Properties = lazy(() => import('./Properties'));

const { REACT_APP_APIPATH: APIPath } = process.env;

export default function EntityDetails(props) {
  // state
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [item, setItem] = useState({
    label: '',
    definition: '',
    example: '',
    parent: null,
    properties: [],
  });
  const [updating, setUpdating] = useState(false);
  const [updateBtnText, setUpdateBtnText] = useState(
    <span>
      <i className="fa fa-save" /> Update
    </span>
  );
  const [updateError, setUpdateError] = useState({
    text: [],
    visible: false,
  });
  const [entitiesOptions, setEntitiesOptions] = useState([
    { value: '', label: '--' },
  ]);

  const {
    _id,
    delete: deleteFn,
    entities,
    reload,
    reloadEntity,
    taxonomyTerms,
    updateLabel,
  } = props;
  const prevId = useRef(null);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      prevId.current = _id;
      if (_id === 'new') {
        setLoading(false);
      } else {
        const responseData = await axios({
          method: 'get',
          url: `${APIPath}entity`,
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
            const {
              label = '',
              definition = '',
              example = '',
              parent = '',
              properties = [],
            } = data;
            setItem({
              _id,
              label,
              definition,
              example,
              parent,
              properties,
            });
            updateLabel(label);
          }
        }
      }
    };
    if (loading) {
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading, _id, updateLabel]);

  useEffect(() => {
    if (!loading && prevId.current !== _id) {
      prevId.current = _id;
      setLoading(true);
      setItem({
        label: '',
        definition: '',
        example: '',
        parent: null,
        properties: [],
      });
    }
  }, [_id, loading]);

  useEffect(() => {
    const parseEntitiesOptions = () => {
      const options = [{ value: '', label: '--' }];
      const { length } = entities;
      for (let i = 0; i < length; i += 1) {
        const { _id: eId, label: eLabel } = entities[i];
        if (eId !== _id) {
          const option = { value: eId, label: eLabel };
          options.push(option);
        }
      }
      return options;
    };
    setEntitiesOptions(parseEntitiesOptions);
  }, [entities, _id]);

  const handleChange = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    const copy = { ...item };
    copy[name] = value;
    setItem(copy);
  };

  const select2Change = (value) => {
    const copy = { ...item };
    copy.parent = value.value;
    setItem(copy);
  };

  const toggleDetails = () => {
    setDetailsOpen(!detailsOpen);
  };

  const update = async () => {
    if (!updating) {
      setUpdating(true);
      setUpdateBtnText(
        <span>
          <i className="fa fa-save" /> <i>Saving...</i>{' '}
          <Spinner color="info" size="sm" />
        </span>
      );
      const responseData = await axios({
        method: 'put',
        url: `${APIPath}entity`,
        crossDomain: true,
        data: item,
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.data)
        .catch((error) => {
          console.log(error);
        });
      const { error = [], status = false } = responseData;
      if (status) {
        setUpdating(false);
        setUpdateBtnText(
          <span>
            <i className="fa fa-save" /> Update success{' '}
            <i className="fa fa-check" />
          </span>
        );
        setUpdateError({
          text: [],
          visible: false,
        });
        reload();
      } else {
        const errorArr = error.map((e) => <div key={e}>{e}</div>);
        setUpdating(false);
        setUpdateBtnText(
          <span>
            <i className="fa fa-save" /> Update error{' '}
            <i className="fa fa-times" />
          </span>
        );
        setUpdateError({
          text: errorArr,
          visible: true,
        });
      }
      if (_id !== null) {
        setTimeout(() => {
          setUpdateBtnText(
            <span>
              <i className="fa fa-save" /> Update
            </span>
          );
        }, 2000);
      }
    }
  };

  const formSubmit = (e) => {
    e.preventDefault();
    update();
  };

  const detailsOpenActive = detailsOpen ? ' active' : '';

  const { text: errorText, visible: errorVisible } = updateError;
  const errorContainerClass = errorVisible ? '' : ' hidden';
  const errorContainer = (
    <div className={`error-container${errorContainerClass}`}>{errorText}</div>
  );

  const {
    label = '',
    definition: iDefinition = '',
    example: iExample = '',
    parent = null,
  } = item;

  const definition = iDefinition || '';
  const example = iExample || '';

  const deleteBtn = (
    <Button
      color="danger"
      onClick={() => deleteFn()}
      outline
      type="button"
      size="sm"
      className="pull-left"
    >
      <i className="fa fa-trash-o" /> Delete
    </Button>
  );
  const updateBtn = (
    <Button color="primary" outline type="submit" size="sm">
      {updateBtnText}
    </Button>
  );

  const entityParentValue =
    parent === null
      ? { value: '', label: '--' }
      : entitiesOptions.find((e) => e.value === parent);

  return (
    <>
      <CardTitle onClick={toggleDetails}>
        Details{' '}
        <Button
          type="button"
          className="pull-right"
          color="secondary"
          outline
          size="xs"
        >
          <i
            className={`collapse-toggle fa fa-angle-left${detailsOpenActive}`}
          />
        </Button>
      </CardTitle>
      {errorContainer}
      <Collapse isOpen={detailsOpen}>
        <Form onSubmit={formSubmit}>
          <FormGroup>
            <Label>Label</Label>
            <Input
              type="text"
              name="label"
              placeholder="Entity label..."
              value={label}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Definition</Label>
            <Input
              type="textarea"
              name="definition"
              placeholder="Entity definition..."
              value={definition}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Example</Label>
            <Input
              type="textarea"
              name="example"
              placeholder="Entity example..."
              value={example}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Parent entity</Label>
            <Select
              name="parent"
              value={entityParentValue}
              onChange={(value) => select2Change(value)}
              options={entitiesOptions}
            />
          </FormGroup>
          <div className="flex justify-content-between">
            {deleteBtn}
            {updateBtn}
          </div>
        </Form>
      </Collapse>

      <Suspense fallback={null}>
        <Properties
          _id={_id}
          taxonomyTerms={taxonomyTerms}
          reload={reloadEntity}
          entity={item}
          entities={entities}
        />
      </Suspense>
    </>
  );
}

EntityDetails.propTypes = {
  _id: PropTypes.string.isRequired,
  delete: PropTypes.func.isRequired,
  entities: PropTypes.array.isRequired,
  reload: PropTypes.func.isRequired,
  reloadEntity: PropTypes.func.isRequired,
  taxonomyTerms: PropTypes.array.isRequired,
  updateLabel: PropTypes.func.isRequired,
};
