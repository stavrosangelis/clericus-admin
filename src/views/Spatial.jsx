import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { renderLoader } from '../helpers';
import '../assets/scss/add.relations.scss';

const AddRelation = lazy(() => import('../components/add-relations'));
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const DeleteModal = lazy(() => import('../components/Delete.modal'));
const Details = lazy(() => import('../components/spatial/Details'));
const Map = lazy(() => import('../components/spatial/Map'));
const RelatedEntitiesBlock = lazy(() =>
  import('../components/Related.entities')
);

const { REACT_APP_APIPATH: APIPath } = process.env;

export default function Spatial() {
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
          url: `${APIPath}spatial`,
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
    navTo('/spatials');
  };

  const toggleDeleteModal = () => {
    setDeleteModalOpen(!deleteModalOpen);
  };

  const updateMap = (data) => {
    const copy = { ...item };
    copy.label = data.label || '';
    copy.streetAddress = data.streetAddress || '';
    copy.locality = data.locality || '';
    copy.region = data.region || '';
    copy.postalCode = data.postalCode || '';
    copy.country = data.country || '';
    copy.latitude = data.latitude || '';
    copy.longitude = data.longitude || '';
    copy.locationType = data.locationType || '';
    copy.note = data.note || '';
    setItem(copy);
  };

  const relatedEntitiesToggle = (rel = null, type = null) => {
    setRelatedEntityOpen(!relatedEntityOpen);
    setRelatedEntityRel(rel);
    setRelatedEntityRelType(type);
  };

  const referencesLabels = [];
  const referencesTypes = [];

  let heading = 'Add new spatial';
  const breadcrumbsItems = [
    {
      label: 'Spatials',
      icon: 'pe-7s-map',
      active: false,
      path: '/spatials',
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
  let relatedEntitiesBlock = null;

  if (item !== null) {
    const { label = '' } = item;
    heading = label;
    breadcrumbsItems.push({
      label: heading,
      icon: 'pe-7s-map',
      active: true,
      path: '',
    });

    const ref = {
      type: 'Spatial',
      ref: _id,
    };
    deleteModal = (
      <Suspense fallback={null}>
        <DeleteModal
          _id={_id}
          label={label}
          path="spatial"
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
          type="spatial"
          toggleOpen={relatedEntitiesToggle}
          open={relatedEntityOpen}
          rel={relatedEntityRel}
          relType={relatedEntityRelType}
        />
      </Suspense>
    );

    relatedEntitiesBlock = (
      <Suspense fallback={renderLoader()}>
        <RelatedEntitiesBlock
          item={item}
          itemType="Spatial"
          reload={reload}
          toggleRel={relatedEntitiesToggle}
        />
      </Suspense>
    );
  } else {
    breadcrumbsItems.push({
      label: 'Add new spatial',
      icon: 'pe-7s-date',
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
          <h2>{heading}</h2>
        </div>
      </div>
      {loading ? (
        loader
      ) : (
        <>
          <div className="row">
            <div className="col-12">
              <Suspense fallback={null}>
                <Map item={item} updateMap={updateMap} />
              </Suspense>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-sm-6">
              <Suspense fallback={renderLoader()}>
                <Details
                  delete={toggleDeleteModal}
                  reload={reload}
                  item={item}
                  _id={_id}
                />
              </Suspense>
            </div>
            <div className="col-xs-12 col-sm-6">{relatedEntitiesBlock}</div>
          </div>
          {addRelation}
          {deleteModal}
        </>
      )}
    </div>
  );
}
