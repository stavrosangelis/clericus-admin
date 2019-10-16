import React, { Component } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import axios from 'axios';
import crypto from 'crypto-js';

import {connect} from "react-redux";

const APIPath = process.env.REACT_APP_APIPATH;
const mapStateToProps = state => {
  return {
    entitiesLoaded: state.entitiesLoaded,
    eventEntity: state.eventEntity,
   };
};

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reload: false,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    }
    this.handleChange = this.handleChange.bind(this);
    this.postRegister = this.postRegister.bind(this);
  }

  handleChange(e){
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    });
  }

  postRegister(e) {
    e.preventDefault();
    let cryptoPass = crypto.SHA1(this.state.password).toString();
    let postData = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      password: cryptoPass
    }
    axios({
        method: 'post',
        url: APIPath+'register',
        crossDomain: true,
        data: postData
      })
    .then(function (response) {
      let responseData = response.data
      console.log(responseData);
    })
    .catch(function (error) {
    });
  }

  render() {
    return(
      <div>
        <Form onSubmit={this.postRegister}>
          <FormGroup>
            <Label for="firstName">First Name</Label>
            <Input type="text" name="firstName" id="firstName" placeholder="First name..." onChange={this.handleChange}/>
          </FormGroup>
          <FormGroup>
            <Label for="lastName">Last Name</Label>
            <Input type="text" name="lastName" id="lastName" placeholder="Last name..." onChange={this.handleChange}/>
          </FormGroup>
          <FormGroup>
             <Label for="email">Email</Label>
             <Input type="email" name="email" id="email" placeholder="Email..." onChange={this.handleChange}/>
           </FormGroup>
           <FormGroup>
            <Label for="password">Password</Label>
            <Input type="password" name="password" id="password" placeholder="Password..." onChange={this.handleChange} />
          </FormGroup>
          <Button>Submit</Button>
        </Form>
      </div>
    );
  }
}
export default Login = connect(mapStateToProps, [])(Login);
