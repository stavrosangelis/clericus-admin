import React, { useEffect, useState, Suspense, lazy } from 'react';
import {
  Label,
  Card,
  CardImg,
  CardText,
  CardBody,
  Button,
  Spinner,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Breadcrumbs = lazy(() => import('../../components/Breadcrumbs'));
const { REACT_APP_APIPATH: APIPath } = process.env;
const heading = 'Parse Class Pieces';
const breadcrumbsItems = [
  { label: heading, icon: 'pe-7s-tools', active: true, path: '' },
];

export default function ParseClassPieces() {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [updateThumbnailsText, setUpdateThumbnailsText] = useState(
    <span>Import files</span>
  );
  const [importing, setImporting] = useState(false);

  const fileOutput = (file) => {
    const { name = '', thumbnail = '' } = file;
    const parseUrl = `/parse-class-piece/${name}`;
    const newFileOutput = (
      <div key={thumbnail} className="col-12 col-sm-6 col-md-3">
        <Card style={{ marginBottom: '15px' }}>
          <Link to={parseUrl} href={parseUrl}>
            <CardImg src={thumbnail} alt={name} />
          </Link>
          <CardBody>
            <CardText className="text-center">
              <Label>
                <Link to={parseUrl} href={parseUrl}>
                  {name}
                </Link>
              </Label>
            </CardText>
          </CardBody>
        </Card>
      </div>
    );
    return newFileOutput;
  };

  useEffect(() => {
    let unmounted = false;
    const controller = new AbortController();
    if (loading) {
      const load = async () => {
        const loadFiles = async () => {
          const data = await axios({
            method: 'get',
            url: `${APIPath}list-class-pieces`,
            crossDomain: true,
            signal: controller.signal,
          })
            .then((response) => response.data.data)
            .catch((error) => {
              console.log(error);
            });
          return data;
        };
        const data = await loadFiles();
        if (!unmounted) {
          setLoading(false);
          const filesOutput = data.map((f) => fileOutput(f));
          setFiles(filesOutput);
        }
      };
      load();
    }
    return () => {
      unmounted = true;
      controller.abort();
    };
  }, [loading]);

  const reload = () => {
    setLoading(true);
  };

  const updateThumbnails = async () => {
    if (!importing) {
      setImporting(true);
      setUpdateThumbnailsText(
        <span>
          <i>Importing...</i> <Spinner color="secondary" size="sm" />
        </span>
      );

      const update = await axios({
        method: 'get',
        url: `${APIPath}create-thumbnails`,
        crossDomain: true,
      })
        .then((response) => response)
        .catch((error) => {
          console.log(error);
        });
      setImporting(false);
      if (update.data.status) {
        setUpdateThumbnailsText(
          <span>
            Import complete <i className="fa fa-check" />
          </span>
        );
        reload();
        setTimeout(() => {
          setUpdateThumbnailsText(<span>Import files</span>);
        }, 2000);
      } else {
        setUpdateThumbnailsText(
          <span>
            Import error <i className="fa fa-times" />
          </span>
        );
        setTimeout(() => {
          setUpdateThumbnailsText(<span>Import files</span>);
        }, 2000);
      }
    }
  };

  const importFilesBtn =
    files.length === 0 ? (
      <div className="col-12">
        <div className="text-center">
          <div style={{ fontSize: '15pt' }}>Import files to begin</div>
          <div style={{ padding: '15px' }}>
            <Button
              outline
              color="secondary"
              size="lg"
              onClick={() => updateThumbnails()}
            >
              Import
            </Button>
          </div>
        </div>
      </div>
    ) : null;

  const importFilesToolBtn =
    files.length > 0 ? (
      <div className="box-tools flex justify-content-end">
        <button
          type="button"
          className="btn btn-light"
          onClick={() => updateThumbnails()}
        >
          {updateThumbnailsText}
        </button>
      </div>
    ) : null;

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
      {importFilesToolBtn}
      <div className="classpieces-container">
        <div className="row">
          {files}
          {importFilesBtn}
        </div>
      </div>
    </>
  );
}
