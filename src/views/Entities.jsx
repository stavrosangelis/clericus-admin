import React, { useEffect, useState, Suspense, lazy } from 'react';
import axios from 'axios';
import { Button, Card, CardBody, Spinner } from 'reactstrap';

const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const DeleteModal = lazy(() => import('../components/Delete.modal'));
const Details = lazy(() => import('../components/entities/Details'));

const { REACT_APP_APIPATH: APIPath } = process.env;
const heading = 'Entities';
const breadcrumbsItems = [
  { label: heading, icon: 'pe-7s-share', active: true, path: '' },
];

export default function Entities() {
  // state
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taxonomyTerms, setTaxonomyTerms] = useState([]);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    if (loading) {
      const load = async () => {
        const loadData = async () => {
          const responseData = await axios({
            method: 'get',
            url: `${APIPath}entities`,
            crossDomain: true,
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
        const responseData = await loadData();
        if (!unmounted) {
          setLoading(false);
          const { data } = responseData;
          setItems(data.data);
        }
      };
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading]);

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const loadTaxonomy = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}taxonomy`,
        crossDomain: true,
        params: {
          systemType: 'relationsTypes',
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
      if (!unmounted) {
        const { data } = responseData;
        const { taxonomyterms } = data;
        setTaxonomyTerms(taxonomyterms);
      }
    };
    loadTaxonomy();
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, []);

  const reload = () => {
    setLoading(true);
  };

  const toggleDeleteModal = () => {
    setDeleteModalOpen(!deleteModalOpen);
  };

  const loadEntity = (_id = '') => {
    if (_id !== '') {
      setSelectedId(_id);
    }
  };

  const reloadEntity = () => {
    const copy = selectedId;
    setSelectedId('');
    setSelectedId(copy);
  };

  const list = (entities, parentKey = null) => {
    const output = [];
    const { length } = entities;
    for (let i = 0; i < length; i += 1) {
      const entity = entities[i];
      const { _id, label = '', children = [] } = entity;
      const item = (
        <li key={_id}>
          <Button
            type="button"
            outline
            color="secondary"
            onClick={() => loadEntity(_id)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="load entity"
            active={selectedId === _id}
          >
            {label}
          </Button>
        </li>
      );
      output.push(item);
      if (children.length > 0) {
        const outputChildren = list(children, i);
        output.push(outputChildren);
      }
    }
    let itemKey = 0;
    if (parentKey !== null) {
      itemKey = parentKey;
    }
    return (
      <ul className="entities-list" key={`list-${itemKey}`}>
        {output}
      </ul>
    );
  };

  const content = loading ? (
    <div className="row">
      <div className="col-12">
        <div style={{ padding: '40pt', textAlign: 'center' }}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
  ) : (
    <div className="row">
      <div className="col-xs-12 col-sm-6">{list(items)}</div>
      <div className="col-xs-12 col-sm-6">
        {selectedId !== '' ? (
          <Suspense fallback={null}>
            <Details
              _id={selectedId}
              delete={toggleDeleteModal}
              entities={items}
              reload={reload}
              reloadEntity={reloadEntity}
              updateLabel={setSelectedLabel}
              taxonomyTerms={taxonomyTerms}
            />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
  return (
    <>
      <Suspense fallback={null}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <div className="row">
        <div className="col-12">
          <h2>{heading}</h2>
        </div>
      </div>
      <Card>
        <CardBody>{content}</CardBody>
      </Card>
      <Suspense fallback={null}>
        <DeleteModal
          _id={selectedId}
          label={selectedLabel}
          path="entity"
          params={{ _id: selectedId }}
          visible={deleteModalOpen}
          toggle={toggleDeleteModal}
          update={null}
        />
      </Suspense>
    </>
  );
}
