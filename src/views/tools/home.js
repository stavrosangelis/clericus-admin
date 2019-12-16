import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { Card, CardBody } from 'reactstrap';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { Link } from 'react-router-dom';

export class ToolsHome extends Component {

  render() {
    return(
      <div>
        <Row>
          <Col xs="12">
            <h2>Tools Home</h2>
          </Col>
        </Row>
        <Row>
          <Col xs="12">
            <div className="text-center">
              <Card>
                <CardBody>
                <ListGroup>
                  <ListGroupItem><Link to="/parse-class-pieces" href="/parse-class-pieces">Parse class pieces</Link></ListGroupItem>
                  <ListGroupItem>
                    <Link to="/associate-people-names" href="/associate-people-names">Associate people with names</Link>
                  </ListGroupItem>
                </ListGroup>
                </CardBody>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}
