import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../../../Store';
import Loader from '../../main_components/Loader';
import Message from '../../main_components/Message';
import { getError } from '../../main_components/utils';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'Fetch_Request': {
      return { ...state, loading: true, error: '' };
    }

    case 'Fetch_Success': {
      return {
        ...state,
        loading: false,
        error: '',
        orders: action.payload,
      };
    }

    case 'Fetch_Fail': {
      return { ...state, error: action.payload, loading: false };
    }

    case 'Delete_Request': {
      return { ...state, loadingDelete: true };
    }

    case 'Delete_Success': {
      return { ...state, loadingDelete: false, successDelete: true, error: '' };
    }

    case 'Delete_Fail': {
      return {
        ...state,
        error: action.payload,
        loadingDelete: false,
        successDelete: false,
      };
    }

    case 'Delete_Reset': {
      return {
        ...state,
        loadingDelete: false,
        successDelete: false,
        error: '',
      };
    }

    default: {
      return state;
    }
  }
};

function OrderListScreen() {
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      error: '',
      loading: true,
    });

  const { state } = useContext(Store);
  const { userInfo } = state;

  const navigate = useNavigate();

  const { pathname } = useLocation();

  useEffect(() => {
    const fetchData = async (query = '') => {
      try {
        dispatch({ type: 'Fetch_Request' });
        const { data } = await axios.get(`/api/orders?seller=${query}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'Fetch_Success', payload: data });
      } catch (error) {
        dispatch({ type: 'Fetch_Fail', payload: getError(error) });
      }
    };
    if (successDelete) {
      dispatch({ type: 'Delete_Reset' });
    } else {
      if (pathname.includes('/seller')) {
        fetchData(userInfo._id);
      } else fetchData();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (order) => {
    if (window.confirm('Are you sure you want to delete?')) {
      try {
        dispatch({ type: 'Delete_Request' });
        const { data } = await axios.delete(`/api/orders/${order._id}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'Delete_Success' });
        toast.success('Order deleted successfully');
      } catch (err) {
        dispatch({ type: 'Delete_Fail', payload: getError(err) });
        toast.error(getError(err));
      }
    }
  };

  return (
    <div className="container">
      <Helmet>
        <title>Orders List</title>
      </Helmet>
      <h1>Orders</h1>
      {loadingDelete && <Loader />}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message>{error}</Message>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>USER</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th>DELIVERED AT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>${order.totalPrice}</td>
                  <td>{order.isPaid ? 'Yes' : 'No'}</td>
                  <td>{order.isDelivered ? 'Yes' : 'No'}</td>
                  <td>
                    {order.isDelivered
                      ? order.deliveredAt.substring(0, 10)
                      : 'NA'}
                  </td>
                  <td>
                    <Button
                      variant="light"
                      onClick={() => {
                        navigate(`/order/${order._id}`);
                      }}
                    >
                      Details
                    </Button>
                    &nbsp;
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => deleteHandler(order)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default OrderListScreen;
