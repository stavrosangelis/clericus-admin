import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { renderLoader } from '../helpers';
import '../assets/scss/add.relations.scss';

const AddRelation = lazy(() => import('../components/add-relations'));
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const DeleteModal = lazy(() => import('../components/Delete.modal'));
const Details = lazy(() => import('../components/resource/Details'));
const File = lazy(() => import('../components/resource/File'));
const MetadataBlock = lazy(() => import('../components/resource/Metadata'));
const RelatedEntitiesBlock = lazy(() =>
  import('../components/Related.entities')
);

const { REACT_APP_APIPATH: APIPath } = process.env;

export default function Resource() {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [relatedEntityOpen, setRelatedEntityOpen] = useState(false);
  const [relatedEntityRel, setRelatedEntityRel] = useState(null);
  const [relatedEntityRelType, setRelatedEntityRelType] = useState(null);

  const { _id } = useParams();
  const prevId = useRef(null);

  const navTo = useNavigate();

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
          url: `${APIPath}resource`,
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
  }, [loading, _id]);

  useEffect(() => {
    if (!loading && prevId.current !== _id) {
      prevId.current = _id;
      setLoading(true);
      setItem(null);
    }
  }, [_id, loading]);

  const reload = () => {
    setLoading(true);
  };

  const redirectToList = () => {
    navTo('/resources');
  };

  const toggleDeleteModal = () => {
    setDeleteModalOpen(!deleteModalOpen);
  };

  const relatedEntitiesToggle = (rel = null, type = null) => {
    setRelatedEntityOpen(!relatedEntityOpen);
    setRelatedEntityRel(rel);
    setRelatedEntityRelType(type);
  };

  const referencesLabels = [];
  const referencesTypes = [];

  let heading = 'Add new resource';
  const breadcrumbsItems = [
    {
      label: 'Resources',
      icon: 'pe-7s-photo',
      active: false,
      path: '/resources',
    },
  ];
  const loader = (
    <div className="row">
      <div className="col-12">
        <div style={{ padding: '40pt', textAlign: 'center' }}>
          <Spinner type="grow" color="info" /> <i>loading...</i>
        </div>
      </div>
    </div>
  );
  let deleteModal = null;
  let addRelation = null;
  let metadataBlock = null;
  let relatedEntitiesBlock = null;

  if (item !== null) {
    const { label = '' } = item;
    heading = label;
    breadcrumbsItems.push({
      label: heading,
      icon: 'pe-7s-photo',
      active: true,
      path: '',
    });

    const ref = {
      type: 'Resource',
      ref: _id,
    };
    deleteModal = (
      <Suspense fallback={null}>
        <DeleteModal
          _id={_id}
          label={label}
          path="resource"
          params={{ _id }}
          visible={deleteModalOpen}
          toggle={toggleDeleteModal}
          update={redirectToList}
        />
      </Suspense>
    );

    addRelation = (
      <Suspense fallback={null}>
        <AddRelation
          reload={reload}
          reference={ref}
          item={item}
          referencesLabels={referencesLabels}
          referencesTypes={referencesTypes}
          type="resource"
          toggleOpen={relatedEntitiesToggle}
          open={relatedEntityOpen}
          rel={relatedEntityRel}
          relType={relatedEntityRelType}
        />
      </Suspense>
    );

    const { metadata = null } = item;

    metadataBlock =
      metadata !== null && Object.entries(metadata).length > 0 ? (
        <Suspense fallback={null}>
          <MetadataBlock metadata={metadata} />
        </Suspense>
      ) : null;
    relatedEntitiesBlock = (
      <Suspense fallback={null}>
        <RelatedEntitiesBlock
          item={item}
          itemType="Resource"
          reload={reload}
          toggleRel={relatedEntitiesToggle}
        />
      </Suspense>
    );
  } else {
    breadcrumbsItems.push({
      label: 'Add new resource',
      icon: 'pe-7s-photo',
      active: true,
      path: '',
    });
  }

  return (
    <div className="container-fluid">
      <Suspense fallback={null}>
        <Breadcrumbs items={breadcrumbsItems} />
      </Suspense>
      <div className="row">
        <div className="col-12">
          <h2>Resource &quot;{heading}&quot;</h2>
        </div>
      </div>
      {loading ? (
        loader
      ) : (
        <>
          <div className="row">
            <div className="col-xs-12 col-sm-6 text-center">
              <Suspense fallback={renderLoader()}>
                <File resource={item} reload={reload} />
              </Suspense>
            </div>
            <div className="col-xs-12 col-sm-6">
              <Suspense fallback={renderLoader()}>
                <Details
                  delete={toggleDeleteModal}
                  reload={reload}
                  resource={item}
                />
              </Suspense>
              {metadataBlock}
              {relatedEntitiesBlock}
            </div>
          </div>
          {addRelation}
          {deleteModal}
        </>
      )}
    </div>
  );
}
