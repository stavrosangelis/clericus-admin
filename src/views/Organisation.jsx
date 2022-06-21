import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getThumbnailsURL, renderLoader } from '../helpers';
import '../assets/scss/add.relations.scss';

const AddRelation = lazy(() => import('../components/add-relations'));
const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const DeleteModal = lazy(() => import('../components/Delete.modal'));
const Details = lazy(() => import('../components/organisation/Details'));
const RelatedEntitiesBlock = lazy(() =>
  import('../components/Related.entities')
);

const { REACT_APP_APIPATH: APIPath } = process.env;

export default function Organisation() {
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
          url: `${APIPath}organisation`,
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
    navTo('/organisations');
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

  let heading = 'Add new organisation';
  const breadcrumbsItems = [
    {
      label: 'Organisations',
      icon: 'pe-7s-culture',
      active: false,
      path: '/organisations',
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
      icon: 'pe-7s-culture',
      active: true,
      path: '',
    });

    const ref = {
      type: 'Organisation',
      ref: _id,
    };
    deleteModal = (
      <Suspense fallback={null}>
        <DeleteModal
          _id={_id}
          label={label}
          path="organisation"
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
          type="organisation"
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
          itemType="Organisation"
          reload={reload}
          toggleRel={relatedEntitiesToggle}
        />
      </Suspense>
    );
  } else {
    breadcrumbsItems.push({
      label: 'Add new organisation',
      icon: 'pe-7s-culture',
      active: true,
      path: '',
    });
  }

  const renderThumbnails = () => {
    if (item !== null) {
      const { label = '' } = item;
      const thumbnails = getThumbnailsURL(item);
      const { length = 0 } = thumbnails;
      const images =
        length > 0
          ? thumbnails.map((t) => (
              <img
                key={t}
                src={t}
                className="img-fluid img-thumbnail"
                alt={label}
              />
            ))
          : null;
      return images;
    }
    return null;
  };
  const thumbnails = (
    <div className="thumbnails-container">{renderThumbnails()}</div>
  );

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
            <div className="col-xs-12 col-sm-6 text-center">{thumbnails}</div>
            <div className="col-xs-12 col-sm-6">
              <Suspense fallback={renderLoader()}>
                <Details
                  delete={toggleDeleteModal}
                  reload={reload}
                  item={item}
                />
              </Suspense>
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
