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
  CardFooter,
  Container,
  Row,
  Col,
  Alert,
} from 'reactstrap';
import crypto from 'crypto-js';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { login } from '../redux/actions';
import logosrc from '../assets/img/cos-logo-bw.png';

const mapStateToProps = (state) => ({
  loginError: state.loginError,
  loginErrorText: state.loginErrorText,
  sessionActive: state.sessionActive,
});

function mapDispatchToProps(dispatch) {
  return {
    login: (email, password) => dispatch(login(email, password)),
  };
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      loginError: false,
      loginErrorText: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.showError = this.showError.bind(this);
    this.postLogin = this.postLogin.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { loginError } = this.props;
    if (prevProps.loginError !== loginError) {
      this.showError();
    }
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  showError() {
    const { loginError, loginErrorText } = this.props;
    this.setState({
      loginError,
      loginErrorText,
    });
  }

  postLogin(e) {
    e.preventDefault();
    const { email, password } = this.state;
    const emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (email.search(emailRegEx) === -1) {
      this.setState({
        loginError: true,
        loginErrorText: 'Please provide a valid email address to continue',
      });
      return false;
    }
    if (password.trim().length < 5) {
      this.setState({
        loginError: true,
        loginErrorText: 'Please provide your password to continue',
      });
      return false;
    }
    const cryptoPass = crypto.SHA1(password).toString();
    const { login: loginFn } = this.props;
    loginFn(email, cryptoPass);
    return false;
  }

  render() {
    const { loginError, loginErrorText, emailValid } = this.state;
    const { sessionActive } = this.props;
    const errorClass = loginError ? '' : 'hidden';
    const errorContainer = (
      <Alert style={{ margin: '20px 0' }} className={errorClass} color="danger">
        <i className="fa fa-times" /> {loginErrorText}
      </Alert>
    );

    let loggedInRedirect = [];
    if (sessionActive) {
      loggedInRedirect = <Redirect to="/" />;
    }
    return (
      <div className="wrapper">
        {loggedInRedirect}
        <div className="login-container">
          <Container>
            <Row>
              <Col sm="12" md={{ size: 6, offset: 3 }}>
                <Card className="login-box">
                  <CardHeader>
                    <div className="login-logo">
                      <img
                        src={logosrc}
                        className="login-logo-img"
                        alt="Clericus logo"
                      />
                      {/* <div className="simple-text icon">
                      <div className="logo-container">
                        <div className="triangle-left"></div>
                        <div className="triangle-left-inner"></div>
                        <div className="triangle-right"></div>
                        <div className="triangle-right-inner"></div>
                      </div>
                    </div> */}
                      <div className="simple-text logo-normal">Clericus</div>
                    </div>
                  </CardHeader>

                  <Form onSubmit={(e) => this.postLogin(e)}>
                    <CardBody>
                      {errorContainer}
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
                    </CardBody>
                    <CardFooter>
                      <Button block onClick={(e) => this.postLogin(e)}>
                        Submit
                      </Button>
                    </CardFooter>
                  </Form>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}

Login.defaultProps = {
  loginError: false,
  loginErrorText: [],
  sessionActive: false,
  login: () => {},
};
Login.propTypes = {
  loginError: PropTypes.bool,
  loginErrorText: PropTypes.array,
  sessionActive: PropTypes.bool,
  login: PropTypes.func,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(Login);
