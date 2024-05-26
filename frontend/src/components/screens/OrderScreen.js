import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { getError } from '../main_components/utils.js';
import axios from 'axios';
import Loader from '../main_components/Loader.js';
import Message from '../main_components/Message.js';
import { Store } from '../../Store';
import ListGroup from 'react-bootstrap/ListGroup';
import CheckoutFormScreen from './CheckoutFormScreen.js';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'Deliver_Request':
      return { ...state, loadingDeliver: true };
    case 'Deliver_Success':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'Deliver_Fail':
      return { ...state, loadingDeliver: false };
    case 'Deliver_Reset':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };
  }
};

function OrderScreen() {
  const params = useParams();

  const { id: orderId } = params;

  const navigate = useNavigate();

  const { state, dispatch: cxtDispatch } = useContext(Store);

  const { userInfo, loading, error, order, successPay, payment } = state;

  const [{ loadingDeliver, successDeliver }, dispatch] = useReducer(reducer, {
    loadingDeliver: false,
    successDeliver: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        cxtDispatch({ type: 'Fetch_Request_Order' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });

        cxtDispatch({ type: 'Fetch_Success_Order', payload: data });
      } catch (err) {
        cxtDispatch({ type: 'Fetch_Fail_Order', payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate('/signin');
    }

    if (
      !order._id ||
      successDeliver ||
      successPay ||
      (order._id && order._id !== orderId)
    ) {
      fetchData();

      if (successDeliver) {
        dispatch({ type: 'Deliver_Reset' });
      }
    }
  }, [userInfo, orderId, navigate, order, successPay, successDeliver]);

  useEffect(() => {
    if (successPay) {
      const payResult = async () => {
        try {
          await axios.post(
            `/api/orders/pay`,
            { orderID: order._id, payment },
            { headers: { authorization: `Bearer ${userInfo.token}` } }
          );
          cxtDispatch({ type: 'Pay_Reset_Order' });
          toast.success('Order paid successfully');
        } catch (err) {
          cxtDispatch({ type: 'Fetch_Fail_Order', payload: getError(err) });
        }
      };
      payResult();
    }
  }, [successPay]);

  const deliverOrderHandler = async () => {
    try {
      dispatch({ type: 'Deliver_Request' });
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'Deliver_Success', payload: data });
      toast.success('Order is delivered');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'Deliver_Fail' });
    }
  };

  return loading ? (
    <Loader></Loader>
  ) : error ? (
    <Message variant="danger">{error}</Message>
  ) : (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>
      <h1 className="mb-3">Order {orderId}</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong>
                {order.shippingAddress.fullName}
                <br />
                <strong>Address:</strong>
                {order.shippingAddress.address},{order.shippingAddress.city},{' '}
                {order.shippingAddress.postalCode},
                {order.shippingAddress.country}
                &nbsp;
                {order.shippingAddress.location &&
                  order.shippingAddress.location.lat && (
                    <a
                      target="_new"
                      href={`https://maps.google.com?q=${order.shippingAddress.location.lat},${order.shippingAddress.location.lng}`}
                    >
                      Show on Map
                    </a>
                  )}
              </Card.Text>
              {order.isDelivered ? (
                <Message variant="success">
                  <strong>Delivered At:</strong>{' '}
                  {order.deliveredAt.substring(0, 10)}
                </Message>
              ) : (
                <Message variant="danger">Not Delivered</Message>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>

              <Card.Text>
                <strong>Method:</strong> {order.paymentMethod}
              </Card.Text>

              {order.isPaid ? (
                <Message variant="success">
                  {' '}
                  <strong>Paid At:</strong> {order.paidAt.substring(0, 10)}
                </Message>
              ) : (
                <Message variant="danger">Not Paid</Message>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>

              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-thumbnail rounded img-fluid"
                        />{' '}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>

                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>

                      <Col md={3}>
                        <span>${item.price}</span>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>

              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>${order.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${order.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${order.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Order Total</strong>
                    </Col>
                    <Col>
                      {' '}
                      <strong>${order.totalPrice.toFixed(2)}</strong>{' '}
                    </Col>
                  </Row>
                </ListGroup.Item>

                {order &&
                  !order.isPaid &&
                  userInfo &&
                  userInfo._id === order.user && (
                    <ListGroup.Item>
                      <Row>{<CheckoutFormScreen order={order} />}</Row>
                    </ListGroup.Item>
                  )}

                {userInfo &&
                  userInfo.isAdmin &&
                  order.isPaid &&
                  !order.isDelivered && (
                    <ListGroup.Item>
                      {loadingDeliver && <Loader />}
                      <div className="d-grid">
                        <Button type="button" onClick={deliverOrderHandler}>
                          Deliver Order
                        </Button>
                      </div>
                    </ListGroup.Item>
                  )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default OrderScreen;
