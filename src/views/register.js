import React, { Component } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import axios from 'axios';
import crypto from 'crypto-js';
import { connect } from 'react-redux';
import { compose } from 'redux';

const APIPath = process.env.REACT_APP_APIPATH;
const mapStateToProps = (state) => ({
  entitiesLoaded: state.entitiesLoaded,
  eventEntity: state.eventEntity,
});

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.postRegister = this.postRegister.bind(this);
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  }

  async postRegister(e) {
    e.preventDefault();
    const { password, firstName, lastName, email } = this.state;
    const cryptoPass = crypto.SHA1(password).toString();
    const postData = {
      firstName,
      lastName,
      email,
      password: cryptoPass,
    };
    const responseData = await axios({
      method: 'post',
      url: `${APIPath}register`,
      crossDomain: true,
      data: postData,
    })
      .then(() => true)
      .catch((error) => {
        console.log(error);
      });
    return responseData;
  }

  render() {
    return (
      <div>
        <Form onSubmit={this.postRegister}>
          <FormGroup>
            <Label for="firstName">First Name</Label>
            <Input
              type="text"
              name="firstName"
              id="firstName"
              placeholder="First name..."
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="lastName">Last Name</Label>
            <Input
              type="text"
              name="lastName"
              id="lastName"
              placeholder="Last name..."
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="Email..."
              onChange={this.handleChange}
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
          <Button>Submit</Button>
        </Form>
      </div>
    );
  }
}
export default compose(connect(mapStateToProps, []))(Login);
