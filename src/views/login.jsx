import React, { useState, useEffect } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import crypto from 'crypto-js';
import { useDispatch, useSelector } from 'react-redux';

import { login } from '../redux/actions';
import logosrc from '../assets/img/cos-logo-bw.png';
import '../assets/scss/login.scss';

function Login() {
  // redux
  const dispatch = useDispatch();
  const { loginError, loginErrorText, sessionActive } = useSelector(
    (state) => state
  );

  const { status = null } = useParams();

  // state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({
    loginError,
    loginErrorText,
  });
  const [emailInvalid, setEmailInValid] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value = '' } = e.target;
    switch (name) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      default:
        break;
    }
  };

  const postLogin = (e) => {
    e.preventDefault();
    const emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (email.search(emailRegEx) === -1) {
      setError({
        loginError: true,
        loginErrorText: ['Please provide a valid email address to continue'],
      });
      setEmailInValid(true);
      return false;
    }
    if (password.trim().length < 5) {
      setError({
        loginError: true,
        loginErrorText: ['Please provide your password to continue'],
      });
      return false;
    }
    if (emailInvalid) {
      setEmailInValid(false);
    }
    const cryptoPass = crypto.SHA1(password).toString();
    dispatch(login(email, cryptoPass));
    return false;
  };

  useEffect(() => {
    if (loginError) {
      setError({
        loginError,
        loginErrorText,
      });
    }
  }, [loginError, loginErrorText]);

  useEffect(() => {
    if (status !== null && status === 'unauthorised') {
      setError({
        loginError: true,
        loginErrorText: ['Unauthorised access. Please login to continue'],
      });
    }
  }, [status]);

  useEffect(() => {
    if (sessionActive) {
      navigate('/');
    }
  }, [sessionActive, navigate]);

  const errorClass = error.loginError ? '' : 'hidden';
  const errorText = error.loginErrorText.map((t) => <span key={t}>{t}</span>);
  const errorContainer = (
    <Alert style={{ margin: '20px 0' }} className={errorClass} color="danger">
      <i className="fa fa-times" /> {errorText}
    </Alert>
  );

  return (
    <div className="wrapper">
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
                    <div className="simple-text logo-normal">Clericus</div>
                  </div>
                </CardHeader>

                <Form onSubmit={(e) => postLogin(e)}>
                  <CardBody>
                    {errorContainer}
                    <FormGroup>
                      <Label for="email">Email</Label>
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Email..."
                        onChange={(e) => handleChange(e)}
                        invalid={emailInvalid}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="password">Password</Label>
                      <Input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Password..."
                        onChange={(e) => handleChange(e)}
                      />
                    </FormGroup>
                  </CardBody>
                  <CardFooter>
                    <Button block onClick={(e) => postLogin(e)}>
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

export default Login;
