import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { getError } from '../../main_components/utils';
import { Store } from '../../../Store';
import axios from 'axios';
import Message from '../../main_components/Message';
import Loader from '../../main_components/Loader';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'Fetch_Request': {
      return { ...state, loading: true };
    }
    case 'Fetch_Success': {
      return { ...state, loading: false };
    }
    case 'Fetch_Fail': {
      return { ...state, loading: false, error: action.payload };
    }
    case 'Update_Request': {
      return { ...state, loadingUpdate: true };
    }
    case 'Update_Success': {
      return { ...state, loadingUpdate: false };
    }
    case 'Update_Fail': {
      return { ...state, loadingUpdate: false };
    }
  }
};

function UserEditScreen() {
  // useParams hook to extract path parameters
  const params = useParams();
  const { id: userId } = params;

  // few useState hooks to manage the state of this component.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setAdmin] = useState(false);
  const [isSeller, setSeller] = useState(false);

  const navigate = useNavigate();

  const { state } = useContext(Store);

  const { userInfo } = state;

  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        dispatch({ type: 'Fetch_Request' });
        const { data } = await axios.get(`/api/users/${userId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'Fetch_Success' });
        setName(data.name);
        setEmail(data.email);
        setAdmin(data.isAdmin);
        setSeller(data.isSeller);
      } catch (err) {
        dispatch({ type: 'Fetch_Fail', payload: getError(err) });
      }
    };

    fetchUser();
  }, [userInfo, userId]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      dispatch({ type: 'Update_Request' });
      const { data } = await axios.put(
        `/api/users/${userId}`,
        { _id: userId, name, email, isAdmin, isSeller },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );

      dispatch({ type: 'Update_Success' });
      toast.success('User updated successfully');
      navigate('/admin/users');
    } catch (err) {
      dispatch({ type: 'Update_Fail' });
      toast.error(getError(err));
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Edit User {`${userId}`}</title>
      </Helmet>

      <h1>Edit User {`${userId}`}</h1>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={name}
              type="text"
              onChange={(e) => {
                setName(e.target.value);
              }}
              required
              placeholder="Enter your Name"
            ></Form.Control>
          </Form.Group>

          <Form.Group className="mb-3" controlId="slug">
            <Form.Label>Email</Form.Label>
            <Form.Control
              value={email}
              type="email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              placeholder="Enter your Email"
              required
            ></Form.Control>
          </Form.Group>

          <Form.Check
            className="mb-3"
            type="checkbox"
            id="isSeller"
            label="isSeller"
            checked={isSeller}
            onChange={(e) => setSeller(e.target.checked)}
          ></Form.Check>

          <Form.Check
            className="mb-3"
            type="checkbox"
            id="isAdmin"
            label="isAdmin"
            checked={isAdmin}
            onChange={(e) => setAdmin(e.target.checked)}
          ></Form.Check>

          <div>
            <Button type="submit">Update</Button>
            {loadingUpdate && <Loader />}
          </div>
        </Form>
      )}
    </Container>
  );
}

export default UserEditScreen;
