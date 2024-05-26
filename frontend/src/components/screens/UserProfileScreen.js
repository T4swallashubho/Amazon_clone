import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../../Store';
import Loader from '../main_components/Loader';
import { getError } from '../main_components/utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'Update_Request': {
      return { ...state, loadingUpdate: true };
    }

    case 'Update_Success': {
      return { ...state, loadingUpdate: false };
    }
    case 'Update_Fail': {
      return { ...state, loadingUpdate: false };
    }

    default: {
      return state;
    }
  }
};

function UserProfileScreen() {
  const { state, dispatch: cxtDispatch } = useContext(Store);
  const { userInfo } = state;

  const navigate = useNavigate();

  const [name, setName] = useState(userInfo ? userInfo.name : '');
  const [email, setEmail] = useState(userInfo ? userInfo.email : '');
  const [password, setPassword] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [button, setButton] = useState('Update');

  // for sellers portion.
  const [sellerName, setSellerName] = useState(
    userInfo.isSeller ? userInfo.seller.name : ''
  );
  const [sellerLogo, setSellerLogo] = useState(
    userInfo.isSeller ? userInfo.seller.logo : ''
  );
  const [sellerDescription, setSellerDescription] = useState(
    userInfo.isSeller ? userInfo.seller.description : ''
  );

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== cPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      dispatch({ type: 'Update_Request' });
      setButton('Processing...');

      const { data } = await axios.put(
        '/api/users/profile',
        { name, email, password, sellerName, sellerLogo, sellerDescription },
        {
          headers: {
            authorization: 'Bearer ' + userInfo.token,
          },
        }
      );

      dispatch({ type: 'Update_Success' });
      setButton('Update');
      cxtDispatch({ type: 'User_SignedIn', payload: data });

      localStorage.setItem('userInfo', JSON.stringify(data));
      setPassword('');
      setCPassword('');

      toast.success('User updated successfully');
    } catch (err) {
      dispatch({ type: 'Update_Fail' });
      toast.error(getError(err));
      setButton('Update');
    }
  };

  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/profile');
    }
  }, [userInfo, navigate]);

  return (
    <div>
      <Helmet>
        <title>User Profile</title>
      </Helmet>

      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
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
            value={email}
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
            value={password}
            required
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="password1">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            value={cPassword}
            required
            onChange={(e) => {
              setCPassword(e.target.value);
            }}
          />
        </Form.Group>

        {userInfo && userInfo.isSeller && (
          <>
            <h2>Seller</h2>

            <Form.Group className="mb-3" controlId="sellerName">
              <Form.Label>Seller Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Seller name"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="sellerLogo">
              <Form.Label>Seller Logo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Seller Logo"
                value={sellerLogo}
                onChange={(e) => setSellerLogo(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="sellerDescription">
              <Form.Label>Seller Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Seller Description"
                value={sellerDescription}
                onChange={(e) => setSellerDescription(e.target.value)}
              />
            </Form.Group>
          </>
        )}

        <div className="mb-3">
          <Button type="submit">{button}</Button>
          {loadingUpdate && <Loader />}
        </div>
      </Form>
    </div>
  );
}

export default UserProfileScreen;
