import React, { Component } from 'react';
import {
  Form, FormGroup, Label, Input,
  Button,
  Card, CardHeader, CardBody,
  CardFooter,
  Container, Row, Col,
  Alert
} from 'reactstrap';
import crypto from 'crypto-js';
import {Redirect} from 'react-router-dom';

import {
  login
} from "../redux/actions/main-actions";

import {connect} from "react-redux";

const mapStateToProps = state => {
  return {
    loginError: state.loginError,
    loginErrorText: state.loginErrorText,
    sessionActive: state.sessionActive,
   };
};

function mapDispatchToProps(dispatch) {
  return {
    login: (email, password) => dispatch(login(email, password)),
  }
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reload: false,
      email: '',
      password: '',
      loginError: false,
      loginErrorText: '',

    }
    this.handleChange = this.handleChange.bind(this);
    this.postLogin = this.postLogin.bind(this);
  }

  handleChange(e){
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  postLogin(e) {
    e.preventDefault();
    let emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (this.state.email.search(emailRegEx) === -1) {
      this.setState({
        loginError: true,
        loginErrorText: "Please provide a valid email address to continue"
      })
      return false;
    }
    if (this.state.password.trim().length<5) {
      this.setState({
        loginError: true,
        loginErrorText: "Please provide your password to continue"
      })
      return false;
    }
    let cryptoPass = crypto.SHA1(this.state.password).toString();
    this.props.login(this.state.email, cryptoPass);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.loginError!==this.props.loginError) {
      this.setState({
        loginError: this.props.loginError,
        loginErrorText: this.props.loginErrorText,
      })
    }
  }

  render() {
    let errorClass = "hidden";
    if (this.state.loginError) {
      errorClass = "";
    }
    let errorContainer = <Alert style={{margin: "20px 0"}} className={errorClass} color="danger"><i className="fa fa-times" /> {this.state.loginErrorText}</Alert>;

    let loggedInRedirect = [];
    if (this.props.sessionActive) {
      loggedInRedirect = <Redirect to='/' />
    }
    return(
      <div className="wrapper">
      {loggedInRedirect}
        <div className="login-container">
          <Container>
            <Row>
              <Col sm="12" md={{ size: 6, offset: 3 }}>

                <Card className="login-box">
                  <CardHeader>
                  <div className="login-logo">
                    <div className="simple-text icon">
                      <div className="logo-container">
                        <div className="triangle-left"></div>
                        <div className="triangle-left-inner"></div>
                        <div className="triangle-right"></div>
                        <div className="triangle-right-inner"></div>
                      </div>
                    </div>
                    <div className="simple-text logo-normal">Clericus</div>
                  </div>
                  </CardHeader>

                  <Form onSubmit={this.postLogin}>

                    <CardBody>
                      {errorContainer}
                      <FormGroup>
                         <Label for="email">Email</Label>
                         <Input type="email" name="email" id="email" placeholder="Email..." onChange={this.handleChange} invalid={this.state.emailValid}/>
                       </FormGroup>
                       <FormGroup>
                        <Label for="password">Password</Label>
                        <Input type="password" name="password" id="password" placeholder="Password..." onChange={this.handleChange} />
                      </FormGroup>
                    </CardBody>
                    <CardFooter>
                      <Button block>Submit</Button>
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
export default Login = connect(mapStateToProps, mapDispatchToProps)(Login);
