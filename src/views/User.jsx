import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { renderLoader } from '../helpers';

const Breadcrumbs = lazy(() => import('../components/Breadcrumbs'));
const DeleteModal = lazy(() => import('../components/Delete.modal'));
const Details = lazy(() => import('../components/user/Details'));

const { REACT_APP_APIPATH: APIPath } = process.env;

export default function User() {
  const [loading, setLoading] = useState(false);
  const [usergroupsLoading, setUsergroupsLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [usergroups, setUsergroups] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { _id } = useParams();
  const prevId = useRef(null);

  const navTo = useNavigate();

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    const load = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}user-groups`,
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
      if (!unmounted) {
        setUsergroupsLoading(false);
        setLoading(true);
        const { data = null } = responseData;
        if (data !== null) {
          setUsergroups(data.data);
        }
      }
    };
    if (usergroupsLoading) {
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [usergroupsLoading]);

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
          url: `${APIPath}user`,
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
      setUsergroupsLoading(true);
      setLoading(true);
      setItem(null);
    }
  }, [_id, loading]);

  const reload = () => {
    setLoading(true);
  };

  const redirectToList = () => {
    navTo('/users');
  };

  const toggleDeleteModal = () => {
    setDeleteModalOpen(!deleteModalOpen);
  };

  let heading = 'Add new user';
  const breadcrumbsItems = [
    {
      label: 'Users',
      icon: 'pe-7s-users',
      active: false,
      path: '/users',
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

  if (item !== null) {
    const { firstName = '', lastName = '', email = '' } = item;
    let label = '';
    if (firstName !== '') {
      label += firstName;
    }
    if (lastName !== '') {
      if (label !== '') {
        label += ' ';
      }
      label += lastName;
    }
    if (label === '') {
      label = email;
    }
    heading = label;
    breadcrumbsItems.push({
      label: heading,
      icon: 'pe-7s-user',
      active: true,
      path: '',
    });

    deleteModal = (
      <Suspense fallback={null}>
        <DeleteModal
          _id={_id}
          label={label}
          path="user"
          params={{ _id }}
          visible={deleteModalOpen}
          toggle={toggleDeleteModal}
          update={redirectToList}
        />
      </Suspense>
    );
  } else {
    breadcrumbsItems.push({
      label: 'Add new user',
      icon: 'pe-7s-user',
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
              <Suspense fallback={renderLoader()}>
                <Details
                  delete={toggleDeleteModal}
                  reload={reload}
                  item={item}
                  usergroups={usergroups}
                />
              </Suspense>
            </div>
          </div>
          {deleteModal}
        </>
      )}
    </div>
  );
}
