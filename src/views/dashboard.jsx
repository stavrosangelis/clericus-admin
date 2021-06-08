import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardFooter, CardTitle, Row, Col } from 'reactstrap';
import Plot from '../components/month-chart';
import '../assets/scss/dashboard.scss';

const APIPath = process.env.REACT_APP_APIPATH;

const Dashboard = () => {
  const [countPeople, setCountPeople] = useState(0);
  const [countResources, setCountResources] = useState(0);
  const [countOrganisations, setCountOrganisations] = useState(0);
  const [countEvents, setCountEvents] = useState(0);
  const [countSpatial, setCountSpatial] = useState(0);
  const [countTemporal, setCountTemporal] = useState(0);

  useEffect(() => {
    const load = async () => {
      const data = await axios({
        method: 'get',
        url: `${APIPath}dashboard`,
        crossDomain: true,
      })
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
        });
      setCountPeople(data.people);
      setCountResources(data.resources);
      setCountOrganisations(data.organisations);
      setCountEvents(data.events);
      setCountSpatial(data.spatial);
      setCountTemporal(data.temporal);
    };
    load();
  }, []);

  return (
    <Row>
      <Col xs={12} sm={6} md={4}>
        <Card className="card-stats">
          <CardBody>
            <Row>
              <Col xs={5} md={4}>
                <div className="icon-big text-center">
                  <i className="pe-7s-photo text-success" />
                </div>
              </Col>
              <Col xs={7} md={8}>
                <div className="numbers">
                  <p className="card-category">Resources count</p>
                  <CardTitle tag="p">{countResources}</CardTitle>
                </div>
              </Col>
            </Row>
          </CardBody>
          <CardFooter>
            <hr />
            <Link to="/resources" href="/resources">
              View resources
            </Link>
          </CardFooter>
        </Card>
      </Col>
      <Col xs={12} sm={6} md={4}>
        <Card className="card-stats">
          <CardBody>
            <Row>
              <Col xs={5} md={4}>
                <div className="icon-big text-center">
                  <i className="pe-7s-id text-danger" />
                </div>
              </Col>
              <Col xs={7} md={8}>
                <div className="numbers">
                  <p className="card-category">People count</p>
                  <CardTitle tag="p">{countPeople}</CardTitle>
                </div>
              </Col>
            </Row>
          </CardBody>
          <CardFooter>
            <hr />
            <Link to="/people" href="/people">
              View people
            </Link>
          </CardFooter>
        </Card>
      </Col>
      <Col xs={12} sm={6} md={4}>
        <Card className="card-stats">
          <CardBody>
            <Row>
              <Col xs={5} md={4}>
                <div className="icon-big text-center">
                  <i className="pe-7s-culture text-danger" />
                </div>
              </Col>
              <Col xs={7} md={8}>
                <div className="numbers">
                  <p className="card-category">Organisations count</p>
                  <CardTitle tag="p">{countOrganisations}</CardTitle>
                </div>
              </Col>
            </Row>
          </CardBody>
          <CardFooter>
            <hr />
            <Link to="/organisations" href="/organisations">
              View organisations
            </Link>
          </CardFooter>
        </Card>
      </Col>
      <Col xs={12} sm={6} md={4}>
        <Card className="card-stats">
          <CardBody>
            <Row>
              <Col xs={5} md={4}>
                <div className="icon-big text-center">
                  <i className="pe-7s-date text-danger" />
                </div>
              </Col>
              <Col xs={7} md={8}>
                <div className="numbers">
                  <p className="card-category">Events count</p>
                  <CardTitle tag="p">{countEvents}</CardTitle>
                </div>
              </Col>
            </Row>
          </CardBody>
          <CardFooter>
            <hr />
            <Link to="/events" href="/events">
              View events
            </Link>
          </CardFooter>
        </Card>
      </Col>

      <Col xs={12} sm={6} md={4}>
        <Card className="card-stats">
          <CardBody>
            <Row>
              <Col xs={5} md={4}>
                <div className="icon-big text-center">
                  <i className="pe-7s-clock text-danger" />
                </div>
              </Col>
              <Col xs={7} md={8}>
                <div className="numbers">
                  <p className="card-category">Temporal count</p>
                  <CardTitle tag="p">{countTemporal}</CardTitle>
                </div>
              </Col>
            </Row>
          </CardBody>
          <CardFooter>
            <hr />
            <Link to="/temporals" href="/temporals">
              View temporal
            </Link>
          </CardFooter>
        </Card>
      </Col>

      <Col xs={12} sm={6} md={4}>
        <Card className="card-stats">
          <CardBody>
            <Row>
              <Col xs={5} md={4}>
                <div className="icon-big text-center">
                  <i className="pe-7s-map text-danger" />
                </div>
              </Col>
              <Col xs={7} md={8}>
                <div className="numbers">
                  <p className="card-category">Spatial count</p>
                  <CardTitle tag="p">{countSpatial}</CardTitle>
                </div>
              </Col>
            </Row>
          </CardBody>
          <CardFooter>
            <hr />
            <Link to="/spatials" href="/spatials">
              View spatial
            </Link>
          </CardFooter>
        </Card>
      </Col>

      <Col xs={12}>
        <Card>
          <CardBody>
            <Plot />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Dashboard;
