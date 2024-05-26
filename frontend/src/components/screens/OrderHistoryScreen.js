import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { Store } from '../../Store';
import Loader from '../main_components/Loader';
import Message from '../main_components/Message';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

const reducer = (state, action) => {
  switch (action.type) {
    case 'Fetch_Request':
      return { ...state, loading: true, error: '' };
    case 'Fetch_Success':
      return { ...state, loading: false, orders: action.payload, error: '' };
    case 'Fetch_Fail':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

function OrderHistoryScreen() {
  // in order to manage the complex state of this component
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    orders: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'Fetch_Request' });

      try {
        const { data } = await axios.get('/api/orders/mine', {
          headers: {
            authorization: 'Bearer ' + userInfo.token,
          },
        });
        dispatch({ type: 'Fetch_Success', payload: data });
      } catch (err) {
        dispatch({ type: 'Fetch_Request', payload: err.message });
      }
    };

    if (!userInfo) {
      navigate('/signin?redirect=/orderhistory');
    }

    fetchData();
  }, [userInfo, navigate]);

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error}</Message>
  ) : (
    <div>
      <Helmet>
        <title>Order History Screen</title>
      </Helmet>

      <h1>Order History</h1>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>DATE</th>
            <th>TOTAL</th>
            <th>PAID</th>
            <th>DELIVERED</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.createdAt.substring(0, 10)}</td>
              <td>${order.totalPrice.toFixed(2)}</td>
              <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
              <td>
                {order.isDelivered ? order.deliveredAt.substring(0, 10) : 'No'}
              </td>

              <td>
                <Button
                  type="button"
                  variant="light"
                  onClick={() => {
                    navigate(`/order/${order._id}`);
                  }}
                >
                  Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderHistoryScreen;
