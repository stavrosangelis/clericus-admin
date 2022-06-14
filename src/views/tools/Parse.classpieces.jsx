import React, { Component, Suspense, lazy } from 'react';
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
const APIPath = process.env.REACT_APP_APIPATH;

export default class ParseClassPieces extends Component {
  static fileOutput(i, file) {
    const parseUrl = `/parse-class-piece/${file.name}`;
    const newFileOutput = (
      <div key={i} className="col-12 col-sm-6 col-md-3">
        <Card style={{ marginBottom: '15px' }}>
          <Link to={parseUrl} href={parseUrl}>
            <CardImg src={file.thumbnail} alt={file.name} />
          </Link>
          <CardBody>
            <CardText className="text-center">
              <Label>
                <Link to={parseUrl} href={parseUrl}>
                  {file.name}
                </Link>
              </Label>
            </CardText>
          </CardBody>
        </Card>
      </div>
    );
    return newFileOutput;
  }

  constructor(props) {
    super(props);

    this.state = {
      files: [],
      updateThumbnailsText: <span>Import files</span>,
      updateThumbnailsText1: <span>Import</span>,
      importStatus: false,
    };
    this.loadFiles = this.loadFiles.bind(this);
    this.updateThumbnails = this.updateThumbnails.bind(this);
  }

  componentDidMount() {
    this.loadFiles();
  }

  async loadFiles() {
    const data = await axios({
      method: 'get',
      url: `${APIPath}list-class-pieces`,
      crossDomain: true,
    })
      .then((response) => response.data.data)
      .catch((error) => {
        console.log(error);
      });

    const filesOutput = data.map((file, i) =>
      this.constructor.fileOutput(i, file)
    );
    this.setState({
      files: filesOutput,
    });
  }

  async updateThumbnails() {
    const { importStatus } = this.state;
    if (importStatus) {
      return false;
    }
    this.setState({
      updateThumbnailsText: (
        <span>
          <i>Importing...</i> <Spinner color="secondary" size="sm" />
        </span>
      ),
      importStatus: true,
    });

    const updateThumbs = await axios({
      method: 'get',
      url: `${APIPath}create-thumbnails`,
      crossDomain: true,
    })
      .then((response) => response)
      .catch((error) => {
        console.log(error);
      });
    if (updateThumbs.data.status) {
      this.loadFiles();
      this.setState({
        updateThumbnailsText: (
          <span>
            Import complete <i className="fa fa-check" />
          </span>
        ),
        importStatus: false,
      });
      const context = this;
      setTimeout(() => {
        context.setState({
          updateThumbnailsText: <span>Import files</span>,
        });
      }, 2000);
    } else {
      this.setState({
        updateThumbnailsText: (
          <span>
            Import error <i className="fa fa-times" />
          </span>
        ),
        importStatus: false,
      });
      const context = this;
      setTimeout(() => {
        context.setState({
          updateThumbnailsText: <span>Import files</span>,
        });
      }, 2000);
    }
    return false;
  }

  render() {
    const { updateThumbnailsText1, files, updateThumbnailsText } = this.state;
    let importFilesBtn = (
      <div className="col-12">
        <div className="text-center">
          <div style={{ fontSize: '15pt' }}>Import files to begin</div>
          <div style={{ padding: '15px' }}>
            <Button
              outline
              color="secondary"
              size="lg"
              onClick={() => this.updateThumbnails(1)}
            >
              {updateThumbnailsText1}
            </Button>
          </div>
        </div>
      </div>
    );
    if (files.length > 0) {
      importFilesBtn = [];
    }
    const heading = 'Parse Class Pieces';
    const breadcrumbsItems = [
      { label: heading, icon: 'pe-7s-tools', active: true, path: '' },
    ];
    return (
      <div>
        <Suspense fallback={[]}>
          <Breadcrumbs items={breadcrumbsItems} />
        </Suspense>
        <div className="row">
          <div className="col-12">
            <h2>{heading}</h2>
          </div>
        </div>
        <div className="box-tools text-end">
          <div className="row">
            <div className="col-xs-12 col-sm-8" />
            <div className="col-xs-12 col-sm-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => this.updateThumbnails()}
              >
                {updateThumbnailsText}
              </button>
            </div>
          </div>
        </div>
        <div className="classpieces-container">
          <div className="row">
            {files}
            {importFilesBtn}
          </div>
        </div>
      </div>
    );
  }
}
