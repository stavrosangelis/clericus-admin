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
    }
    this.loadDashboard = this.loadDashboard.bind(this);
  }

  loadDashboard = () => {
    let context = this;
    axios({
        method: 'get',
        url: APIPath+'dashboard',
        crossDomain: true,
      })
    .then(function (response) {
      let responseData = response.data.data;
      context.setState({
        countPeople: responseData.people,
        countResources: responseData.resources,
      })
    })
    .catch(function (error) {
    });
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
        </Row>
      </div>
    );
  }
}

export default Dashboard;
