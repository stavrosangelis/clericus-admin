import React from "react";
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Row,
  Col,
} from "reactstrap";


const APIPath = process.env.REACT_APP_APIPATH;
class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      countPeople: 0,
      countResources: 0,
      countOrganisations: 0,
      countEvents: 0,
    }
    this.loadDashboard = this.loadDashboard.bind(this);
  }

  loadDashboard = async() => {
    let data = await axios({
        method: 'get',
        url: APIPath+'dashboard',
        crossDomain: true,
      })
    .then(function (response) {
      return response.data.data;
    })
    .catch(function (error) {
    });
    this.setState({
      countPeople: data.people,
      countResources: data.resources,
      countOrganisations: data.organisations,
      countEvents: data.events,
    })
  }

  componentDidMount() {
    this.loadDashboard();
  }

  render() {
    return (
      <div className="content">
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
                      <CardTitle tag="p">{this.state.countResources}</CardTitle>
                    </div>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <hr />
                <Link to="/resources" href="/resources">View resources</Link>
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
                      <CardTitle tag="p">{this.state.countPeople}</CardTitle>
                    </div>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <hr />
                <Link to="/people" href="/people">View people</Link>
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
                      <CardTitle tag="p">{this.state.countOrganisations}</CardTitle>
                    </div>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <hr />
                <Link to="/organisations" href="/organisations">View organisations</Link>
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
                      <CardTitle tag="p">{this.state.countEvents}</CardTitle>
                    </div>
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <hr />
                <Link to="/events" href="/events">View events</Link>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Dashboard;
