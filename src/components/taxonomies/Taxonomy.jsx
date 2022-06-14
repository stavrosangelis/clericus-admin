import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Label,
  Spinner,
} from 'reactstrap';
import { addGenericReference, getData, putData } from '../../helpers';
import TaxonomyTerm from './Taxonomy.Term';
import DeleteModal from '../Delete.modal';

const TaxonomyTermModal = lazy(() => import('./Taxonomy.Term.Modal'));

function Taxonomy(props) {
  // state
  const [taxonomy, setTaxonomy] = useState(null);
  const [taxonomyTerms, setTaxonomyTerms] = useState([]);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState([]);
  const [saveBtn, setSaveBtn] = useState(
    <span>
      <i className="fa fa-save" /> Save
    </span>
  );
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // term modal
  const [termModalErrorVisible, setTermModalErrorVisible] = useState(false);
  const [termModalErrorText, setTermModalErrorText] = useState([]);
  const [termId, setTermId] = useState(null);
  const [termSubmitBtnText, setTermSubmitBtnText] = useState(
    <span>
      <i className="fa fa-save" /> Save
    </span>
  );
  const [term, setTerm] = useState(null);
  const [termModalVisible, setTermModalVisible] = useState(false);
  const [termSaving, setTermSaving] = useState(false);

  // props
  const { _id, loading, reload, setLoading, setTaxonomyId } = props;

  const mounted = useRef(false);

  const flattenItems = useCallback(
    (items = [], parentIds = null, parentId = null) => {
      let newItems = [];
      const { length } = items;
      for (let i = 0; i < length; i += 1) {
        const item = items[i];
        if (parentIds !== null) {
          item.parentIds = parentIds;
        }
        if (parentId !== null) {
          item.parentId = parentId;
        }
        const itemCopy = { ...item };
        itemCopy.hasChildren = false;
        itemCopy.visible = true;
        if (typeof item.children !== 'undefined' && item.children.length > 0) {
          delete itemCopy.children;
          itemCopy.hasChildren = true;
        }
        newItems.push(itemCopy);
        let newParentIds = [];
        if (parentIds === null) {
          newParentIds.push(item._id);
        } else {
          newParentIds = [...parentIds, item._id];
          itemCopy.visible = false;
        }
        if (item.children?.length > 0) {
          newItems = [
            ...newItems,
            ...flattenItems(item.children, newParentIds, item._id),
          ];
        }
      }
      return newItems;
    },
    []
  );

  const loadItem = useCallback(async () => {
    const result = await getData(`taxonomy`, { _id });
    const { data: item = null } = result;
    return item;
  }, [_id]);

  useEffect(() => {
    mounted.current = true;
    const load = async () => {
      setLoading(false);
      if (_id === null) {
        setTaxonomy(null);
        setTaxonomyTerms([]);
        setLabel('');
        setDescription('');
        setErrorVisible(false);
        setErrorText([]);
        setLoading(false);
        return false;
      }
      const item = await loadItem();
      if (mounted.current) {
        setTaxonomy(item);
        setLabel(item?.label);
        setDescription(item?.description);
        setTaxonomyTerms(flattenItems(item?.taxonomyterms));
      }
      return true;
    };
    if (loading) {
      load();
    }
    return () => {
      mounted.current = false;
    };
  }, [flattenItems, _id, loading, loadItem, setLoading]);

  const toggleDeleteModal = () => {
    setDeleteModalVisible(!deleteModalVisible);
  };

  const save = useCallback(async () => {
    if (saving) {
      return false;
    }
    let timeout = null;
    setSaving(true);
    if (label === '') {
      setSaving(false);
      setSaveBtn(
        <span>
          <i className="fa fa-save" /> Save error <i className="fa fa-times" />
        </span>
      );
      setErrorVisible(true);
      setErrorText(<div>Please enter a Label to continue</div>);
      timeout = setTimeout(() => {
        setSaveBtn(
          <span>
            <i className="fa fa-save" /> Save
          </span>
        );
      }, 2000);

      return false;
    }
    const postData = {
      label,
      description,
    };
    if (_id !== null) {
      postData._id = _id;
    }
    const responseData = await putData('taxonomy', postData);
    if (responseData.status) {
      const { _id: newId = null } = responseData.data;
      if (_id !== newId) {
        setTaxonomyId(newId);
      }
      setSaving(false);
      setSaveBtn(
        <span>
          <i className="fa fa-save" /> Save success{' '}
          <i className="fa fa-check" />{' '}
        </span>
      );
      await reload();
    } else {
      const { error: errorMsg } = responseData;
      const errorOutput = [];
      const { length: eLength } = errorMsg;
      for (let i = 0; i < eLength; i += 1) {
        errorOutput.push(<div key={i}>{errorMsg[i]}</div>);
      }
      setSaving(false);
      setSaveBtn(
        <span>
          <i className="fa fa-save" /> Save error <i className="fa fa-times" />
        </span>
      );
      setErrorVisible(true);
      setErrorText(errorOutput);
    }
    timeout = setTimeout(() => {
      if (mounted.current) {
        setSaveBtn(
          <span>
            <i className="fa fa-save" /> Save
          </span>
        );
      }
    }, 2000);
    return () => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
    };
  }, [description, _id, label, reload, saving, setTaxonomyId]);

  const formSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      await save();
    },
    [save]
  );

  const handleChange = useCallback((e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    switch (name) {
      case 'taxonomyLabel':
        setLabel(value);
        break;
      case 'taxonomyDescription':
        setDescription(value);
        break;
      default:
        break;
    }
  }, []);

  // term modal actions
  const loadTerm = useCallback(
    async (termIdParam = null) => {
      if (termIdParam !== null) {
        const params = { _id: termIdParam };
        switch (taxonomy.labelId) {
          case 'EventTypes':
            params.entityType = 'event';
            break;
          case 'OrganisationTypes':
            params.entityType = 'organisation';
            break;
          case 'PersonTypes':
            params.entityType = 'person';
            break;
          case 'ResourceSystemTypes':
            params.entityType = 'resource';
            break;
          default:
            break;
        }
        const result = await getData(`taxonomy-term`, params);
        if (result.status) {
          return result.data;
        }
        return null;
      }
      return null;
    },
    [taxonomy]
  );

  const linkNewTermToTaxonomy = useCallback(
    async (newTermId) => {
      const newReference = {
        items: [
          { _id: taxonomy._id, type: 'Taxonomy' },
          { _id: newTermId, type: 'TaxonomyTerm' },
        ],
        taxonomyTermLabel: 'hasChild',
      };
      const addReference = await addGenericReference(newReference);
      return addReference;
    },
    [taxonomy]
  );

  const toggleTermModal = useCallback(
    async (item = null) => {
      setTermModalVisible(!termModalVisible);
      setTermModalErrorVisible(false);
      setTermModalErrorText([]);
      if (!termModalVisible) {
        const nTermId = item?._id || null;
        const termData = await loadTerm(nTermId);
        setTerm(termData);
        setTermId(nTermId);
      } else {
        setTerm(null);
        setTermId(null);
      }
    },
    [loadTerm, termModalVisible]
  );

  const submitTerm = useCallback(
    async (postDataParams = null) => {
      if (termSaving) {
        return false;
      }
      let timeout = null;
      let timeout2 = null;
      setTermSaving(true);
      const postData = postDataParams;
      let labelError = false;
      let labelErrorText = '';
      if (postData.label === '') {
        labelError = true;
        labelErrorText = 'Please enter a Label to continue';
      } else if (postData.inverseLabel === '') {
        labelError = true;
        labelErrorText = 'Please enter an Inverse Label to continue';
      }
      const postParentRef = postData.parentRef || null;
      postData.parentRef = null;
      delete postData.parentRef;

      if (labelError) {
        setTermSaving(false);
        setTermSubmitBtnText(
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        );
        setTermModalErrorVisible(true);
        setTermModalErrorText([<div key={0}>{labelErrorText}</div>]);
        timeout = setTimeout(() => {
          setTermSubmitBtnText(
            <span>
              <i className="fa fa-save" /> Save
            </span>
          );
        }, 2000);
        return false;
      }
      if (termModalErrorVisible) {
        setTermModalErrorVisible(false);
        setTermModalErrorText([]);
      }
      const responseData = await putData('taxonomy-term', postData);
      if (responseData.status) {
        const { _id: newId } = responseData.data;
        // if this is a new term link it to the taxonomy
        if (typeof postData._id === 'undefined' || postData._id === null) {
          await linkNewTermToTaxonomy(newId);
        }
        if (postParentRef !== null && postParentRef !== '') {
          const newReference = {
            items: [
              { _id: postParentRef, type: 'TaxonomyTerm' },
              { _id: newId, type: 'TaxonomyTerm' },
            ],
            taxonomyTermLabel: 'hasChild',
          };
          await addGenericReference(newReference);
        }
        setTermSaving(false);
        setTermSubmitBtnText(
          <span>
            <i className="fa fa-save" /> Save success{' '}
            <i className="fa fa-check" />{' '}
          </span>
        );
        timeout = setTimeout(() => {
          if (mounted.current) {
            setTermSubmitBtnText(
              <span>
                <i className="fa fa-save" /> Save
              </span>
            );
            toggleTermModal();
          }
        }, 1500);
        timeout2 = setTimeout(() => {
          if (mounted.current) {
            setLoading(true);
          }
        }, 2000);
      } else {
        const { error: errorMsg } = responseData;
        const errorOutput = [];
        const { length: eLength } = errorMsg;
        for (let i = 0; i < eLength; i += 1) {
          errorOutput.push(<div key={i}>{errorMsg[i]}</div>);
        }
        setTermSaving(false);
        setTermSubmitBtnText(
          <span>
            <i className="fa fa-save" /> Save error{' '}
            <i className="fa fa-times" />
          </span>
        );
        setTermModalErrorVisible(true);
        setTermModalErrorText(errorOutput);
        timeout = setTimeout(() => {
          if (mounted.current) {
            setTermSubmitBtnText(
              <span>
                <i className="fa fa-save" /> Save
              </span>
            );
          }
        }, 2000);
      }
      return () => {
        if (timeout !== null) {
          clearTimeout(timeout);
        }
        if (timeout2 !== null) {
          clearTimeout(timeout);
        }
      };
    },
    [
      linkNewTermToTaxonomy,
      termModalErrorVisible,
      termSaving,
      toggleTermModal,
      setLoading,
    ]
  );

  const reloadTaxonomy = () => {
    if (termModalVisible) {
      toggleTermModal();
    }
    setLoading(true);
  };

  const renderTaxonomyTerms = () => {
    let termsOutput = [];
    const terms = [];
    const { length } = taxonomyTerms;
    if (length > 0) {
      for (let i = 0; i < length; i += 1) {
        const t = taxonomyTerms[i];
        terms.push(
          <TaxonomyTerm
            key={t._id}
            item={t}
            taxonomyTerms={taxonomyTerms}
            updateTerms={setTaxonomyTerms}
            termModalToggle={toggleTermModal}
          />
        );
      }
      termsOutput = <ul className="taxonomy-terms">{terms}</ul>;
    }

    return termsOutput;
  };

  let taxonomyOutput = (
    <div>
      <div className="row">
        <div className="col-12">
          <div style={{ padding: '40pt', textAlign: 'center' }}>
            <Spinner type="grow" color="info" /> <i>loading...</i>
          </div>
        </div>
      </div>
    </div>
  );

  const deleteUpdate = () => {
    setTaxonomyId(null);
    reload();
  };

  if (!loading) {
    const errorContainerClass = errorVisible ? '' : ' hidden';
    const errorContainer = (
      <div className={`error-container${errorContainerClass}`}>{errorText}</div>
    );

    const deleteBtn =
      _id !== null ? (
        <Button
          size="sm"
          className="pull-left"
          color="danger"
          outline
          onClick={() => toggleDeleteModal()}
          aria-label="Delete taxonomy"
        >
          <i className="fa fa-trash-o" /> Delete
        </Button>
      ) : (
        []
      );

    const termsOutput = renderTaxonomyTerms();

    const termsFooter =
      _id !== null ? (
        <div className="footer-box">
          <Button size="sm" color="info" onClick={() => toggleTermModal()}>
            Add term <i className="fa fa-plus" />
          </Button>
        </div>
      ) : (
        []
      );

    taxonomyOutput = (
      <Card>
        <CardBody>
          <div className="row">
            <div className="col-xs-12 col-sm-6 col-md-8">
              {termsOutput}
              {termsFooter}
            </div>
            <div className="col-xs-12 col-sm-6 col-md-4">
              {errorContainer}
              <Form onSubmit={(e) => formSubmit(e)}>
                <FormGroup>
                  <Label for="labelInput">Label</Label>
                  <Input
                    type="text"
                    name="taxonomyLabel"
                    id="labelInput"
                    placeholder="Taxonomy label..."
                    value={label}
                    onChange={(e) => handleChange(e)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="descriptionInput">Description</Label>
                  <Input
                    type="textarea"
                    name="taxonomyDescription"
                    id="descriptionInput"
                    placeholder="Taxonomy description..."
                    value={description}
                    onChange={(e) => handleChange(e)}
                  />
                </FormGroup>
              </Form>
              <div className="footer-box">
                <Button
                  size="sm"
                  type="button"
                  onClick={(e) => formSubmit(e)}
                  color="info"
                  outline
                  aria-label="Save taxonomy"
                >
                  {saveBtn}
                </Button>
                {deleteBtn}
              </div>
            </div>
          </div>

          <Suspense fallback={[]}>
            <TaxonomyTermModal
              errorVisible={termModalErrorVisible}
              errorText={termModalErrorText}
              _id={termId}
              loadTerm={loadTerm}
              submit={submitTerm}
              submitBtnText={termSubmitBtnText}
              term={term}
              terms={taxonomyTerms}
              toggle={toggleTermModal}
              visible={termModalVisible}
              reload={reloadTaxonomy}
            />
          </Suspense>

          <DeleteModal
            _id={_id}
            label={label}
            path="taxonomy"
            params={{ _id }}
            visible={deleteModalVisible}
            toggle={toggleDeleteModal}
            update={deleteUpdate}
          />
        </CardBody>
      </Card>
    );
  }
  return taxonomyOutput;
}

Taxonomy.defaultProps = {
  _id: null,
};
Taxonomy.propTypes = {
  _id: PropTypes.string,
  reload: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  setLoading: PropTypes.func.isRequired,
  setTaxonomyId: PropTypes.func.isRequired,
};
export default Taxonomy;
