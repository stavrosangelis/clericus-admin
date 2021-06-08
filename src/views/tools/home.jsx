import React from 'react';
import { Row, Col, Card, CardBody, ListGroup, ListGroupItem } from 'reactstrap';

import { Link } from 'react-router-dom';

const ToolsHome = () => (
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
                <ListGroupItem>
                  <Link to="/parse-class-pieces" href="/parse-class-pieces">
                    Parse class pieces
                  </Link>
                </ListGroupItem>
                <ListGroupItem>
                  <Link
                    to="/associate-people-names"
                    href="/associate-people-names"
                  >
                    Associate people with names
                  </Link>
                </ListGroupItem>
              </ListGroup>
            </CardBody>
          </Card>
        </div>
      </Col>
    </Row>
  </div>
);

export default ToolsHome;
