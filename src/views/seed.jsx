import React, { Component } from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
} from 'reactstrap';
import crypto from 'crypto-js';
import axios from 'axios';

const APIPath = process.env.REACT_APP_APIPATH;

class Seed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      passwordRepeat: '',
      error: false,
      errorText: '',
      seeding: false,
      seeded: false,
      btn: <span>Seed database</span>,
    };
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  async submit(e) {
    e.preventDefault();
    const { seeding, email, password, passwordRepeat } = this.state;
    if (seeding) {
      return false;
    }
    this.setState({
      seeding: true,
      btn: (
        <span>
          Seeding database <Spinner size="sm" color="light" />
        </span>
      ),
    });
    let error = false;
    let errorText = '';
    const emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (email.search(emailRegEx) === -1) {
      error = true;
      errorText = 'Please provide a valid email address to continue';
    } else if (password.trim().length < 5) {
      error = true;
      errorText = 'Please provide your password to continue';
    } else if (password.trim() !== passwordRepeat.trim()) {
      error = true;
      errorText =
        "The provided password and password repeat don't match. Please try again.";
    }
    if (error) {
      this.setState({
        error: true,
        errorText,
        seeding: false,
        btn: (
          <span>
            Seeding database error <i className="fa fa-times" />
          </span>
        ),
      });
      const component = this;
      setTimeout(() => {
        component.setState({ btn: <span>Seed database</span> });
      }, 2000);
      return false;
    }
    const cryptoPass = crypto.SHA1(password).toString();
    const postData = {
      email,
      password: cryptoPass,
    };
    const seed = await axios({
      method: 'post',
      url: `${APIPath}seed-db`,
      crossDomain: true,
      data: postData,
    })
      .then((response) => {
        const responseData = response.data;
        return responseData;
      })
      .catch((err) => {
        console.log(err);
      });

    if (seed.status) {
      this.setState({
        seeding: false,
        btn: (
          <span>
            Seeding database completed <i className="fa fa-check" />
          </span>
        ),
      });

      const component = this;
      setTimeout(() => {
        component.setState({
          btn: <span>Seed database</span>,
          seeded: true,
        });
      }, 2000);
    }
    return false;
  }

  render() {
    const { error: err, errorText, seeded, emailValid, btn } = this.state;
    const errorClass = err ? '' : 'hidden';
    const errorContainer = (
      <Alert style={{ margin: '20px 0' }} className={errorClass} color="danger">
        <i className="fa fa-times" /> {errorText}
      </Alert>
    );

    let content = [];
    if (seeded) {
      content = (
        <CardBody>
          <p>
            Your admin use account has been setup successfully and the database
            has been seeded. To start using your new system account please click
            the login button below or refresh this page.
          </p>
          <div className="text-center">
            <a href="/admin/login" className="btn btn-secondary">
              Login
            </a>
          </div>
        </CardBody>
      );
    } else {
      content = (
        <CardBody>
          <p>
            Welcome to <b>Clericus</b>. Before you continue you must first set
            the admin user credentials and seed the database.
          </p>
          {errorContainer}
          <Form onSubmit={(e) => this.submit(e)}>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input
                type="email"
                name="email"
                id="email"
                placeholder="Email..."
                onChange={this.handleChange}
                invalid={emailValid}
              />
            </FormGroup>
            <FormGroup>
              <Label for="password">Password</Label>
              <Input
                type="password"
                name="password"
                id="password"
                placeholder="Password..."
                onChange={this.handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Password Repeat</Label>
              <Input
                type="password"
                name="passwordRepeat"
                placeholder="Password Repeat..."
                onChange={this.handleChange}
              />
            </FormGroup>
            <div className="text-center">
              <Button onClick={(e) => this.submit(e)}>{btn}</Button>
            </div>
          </Form>
        </CardBody>
      );
    }
    return (
      <div className="wrapper">
        <div className="login-container">
          <Container>
            <Row>
              <Col
                sm="12"
                md={{ size: 10, offset: 1 }}
                lg={{ size: 8, offset: 2 }}
              >
                <Card className="login-box">
                  <CardHeader>
                    <div className="login-logo">
                      <div className="simple-text icon">
                        <div className="logo-container">
                          <div className="triangle-left" />
                          <div className="triangle-left-inner" />
                          <div className="triangle-right" />
                          <div className="triangle-right-inner" />
                        </div>
                      </div>
                      <div className="simple-text logo-normal">Clericus</div>
                    </div>
                  </CardHeader>
                  {content}
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}
export default Seed;
