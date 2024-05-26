import React, { useContext, useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getError } from '../main_components/utils.js';
import { Store } from '../../Store.js';
import { toast } from 'react-toastify';

function SigninScreen() {
  const { search } = useLocation();
  const redirectURL = new URLSearchParams(search).get('redirect'); // '/shipping';
  const redirect = redirectURL ? redirectURL : '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { state, dispatch: ctxDispatch } = useContext(Store);

  const { userInfo } = state;

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    // we will send AJAX request here.
    try {
      const { data } = await axios.post('/api/users/signin', {
        email,
        password,
      });

      // if valid password& Email then we change the global state of the application.
      localStorage.setItem('userInfo', JSON.stringify(data));
      ctxDispatch({ type: 'User_SignedIn', payload: data });
      navigate(redirect || '/');
      toast.success('Successfully signed in', {
        theme: 'dark',
      });
    } catch (err) {
      toast.error(getError(err), { theme: 'dark' });
    }
  };

  // would run when an update occurs.
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign In</title>
      </Helmet>

      <h1 className="my-3">Sign In</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your Email"
            required
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            placeholder="Enter your Password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </Form.Group>

        <div className="mb-3">
          <Button type="submit">Sign In</Button>
        </div>

        <div className="mb-3">
          New customer?{' '}
          <Link to={`/signup?redirect=${redirect}`}>Create your account</Link>
        </div>
      </Form>
    </Container>
  );
}

export default SigninScreen;
