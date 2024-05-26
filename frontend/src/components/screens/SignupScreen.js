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

function SignupScreen() {
  const { search } = useLocation();
  const redirectURL = new URLSearchParams(search).get('redirect'); // '/shipping';
  const redirect = redirectURL ? redirectURL : '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpassword, setCPassword] = useState('');

  const { state, dispatch: ctxDispatch } = useContext(Store);

  const { userInfo } = state;

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== cpassword) {
      toast.error('Passwords do not match');
      return;
    }

    // we will send AJAX request here.
    try {
      const { data } = await axios.post('/api/users/signup', {
        name,
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
        <title>Sign Up</title>
      </Helmet>

      <h1 className="my-3">Sign Up</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your Name"
            required
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </Form.Group>

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

        <Form.Group className="mb-3" controlId="password1">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            required
            placeholder="Confirm your Password"
            onChange={(e) => {
              setCPassword(e.target.value);
            }}
          />
        </Form.Group>

        <div className="mb-3">
          <Button type="submit">Sign Up</Button>
        </div>

        <div className="mb-3">
          Already a user? <Link to={`/signin?redirect=${redirect}`}>Sign in</Link>
        </div>
      </Form>
    </Container>
  );
}

export default SignupScreen;
