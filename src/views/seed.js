import React, { Component } from 'react';
import {
  Form, FormGroup, Label, Input,
  Button,
  Card, CardHeader, CardBody,
  Container, Row, Col,
  Alert, Spinner
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
    }
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  async submit(e) {
    e.preventDefault();
    if (this.state.seeding) {
      return false;
    }
    this.setState({
      seeding: true,
      btn: <span>Seeding database <Spinner size="sm" color="light" /></span>,
    })
    let error = false;
    let errorText = "";
    let emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (this.state.email.search(emailRegEx) === -1) {
      error = true;
      errorText = "Please provide a valid email address to continue";
    }
    else if (this.state.password.trim().length<5) {
      error = true;
      errorText = "Please provide your password to continue";
    }
    else if (this.state.password.trim()!==this.state.passwordRepeat.trim()) {
      error = true;
      errorText = "The provided password and password repeat don't match. Please try again."
    }
    if (error) {
      this.setState({
        error: true,
        errorText: errorText,
        seeding: false,
        btn: <span>Seeding database error <i className="fa fa-times"/></span>
      });
      let component = this;
      setTimeout(()=> {
        component.setState({btn: <span>Seed database</span>});
      },2000);
      return false;
    }
    let cryptoPass = crypto.SHA1(this.state.password).toString();
    let postData = {
      email: this.state.email,
      password: cryptoPass,
    }
    let seed = await axios({
      method: 'post',
      url: APIPath+'seed-db',
      crossDomain: true,
      data: postData,
    })
    .then(function (response) {
      let responseData = response.data;
      return responseData;
    })
    .catch(function (error) {
      console.log(error)
    });

    if (seed.status) {
      this.setState({
        seeding: false,
        btn: <span>Seeding database completed <i className="fa fa-check"/></span>
      });

      let component = this;
      setTimeout(()=> {
        component.setState({
          btn: <span>Seed database</span>,
          seeded: true,
        });
      },2000);
    }

  }

  render() {
    let errorClass = "hidden";
    if (this.state.error) {
      errorClass = "";
    }
    let errorContainer = <Alert style={{margin: "20px 0"}} className={errorClass} color="danger"><i className="fa fa-times" /> {this.state.errorText}</Alert>;

    let content = [];
    if (this.state.seeded) {
      content =
      <CardBody>
        <p>Your admin use account has been setup successfully and the database has been seeded. To start using your new system account please click the login button below or refresh this page.</p>
        <div className="text-center">
          <a href="/admin/login" className="btn btn-secondary">Login</a>
        </div>
      </CardBody>;
    }
    else {
      content =
      <CardBody>
        <p>Welcome to <b>Clericus</b>. Before you continue you must first set the admin user credentials and seed the database.</p>
        {errorContainer}
        <Form onSubmit={(e)=>this.submit(e)}>
          <FormGroup>
             <Label for="email">Email</Label>
             <Input type="email" name="email" id="email" placeholder="Email..." onChange={this.handleChange} invalid={this.state.emailValid}/>
           </FormGroup>
           <FormGroup>
            <Label for="password">Password</Label>
            <Input type="password" name="password" id="password" placeholder="Password..." onChange={this.handleChange} />
          </FormGroup>
          <FormGroup>
           <Label>Password Repeat</Label>
           <Input type="password" name="passwordRepeat" placeholder="Password Repeat..." onChange={this.handleChange} />
         </FormGroup>
          <div className="text-center">
            <Button onClick={(e)=>this.submit(e)}>{this.state.btn}</Button>
          </div>
        </Form>
      </CardBody>
    }
    return(
      <div className="wrapper">
        <div className="login-container">
          <Container>
            <Row>
              <Col sm="12" md={{ size: 10, offset: 1 }} lg={{ size: 8, offset: 2 }}>

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
