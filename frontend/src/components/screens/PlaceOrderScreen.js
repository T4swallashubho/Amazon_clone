import React, { useContext, useEffect, useReducer } from 'react';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import { Helmet } from 'react-helmet-async';
import CheckoutSteps from '../main_components/CheckoutSteps';
import { Store } from '../../Store';
import { Link, useNavigate } from 'react-router-dom';
import ListGroup from 'react-bootstrap/ListGroup';
import axios from 'axios';
import { getError } from '../main_components/utils.js';
import Loader from '../main_components/Loader.js';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'Create_Request': {
      return { ...state, loading: true };
    }

    case 'Create_Success': {
      return { ...state, loading: false };
    }

    case 'Create_Fail': {
      return { ...state, loading: false };
    }

    default: {
      return state;
    }
  }
};

function PlaceOrderScreen() {
  const {
    state,
    state: { cart, userInfo },
    dispatch: ctxDispatch,
  } = useContext(Store);

  const [{ loading }, dispatch] = useReducer(reducer, { loading: false });

  const navigate = useNavigate();

  const {
    cart: { shippingAddress, paymentMethod, cartItems },
  } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23

  cart.itemsPrice = round2(
    cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );

  cart.taxPrice = round2(0.15 * cart.itemsPrice);

  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);

  cart.totalPrice = cart.itemsPrice + cart.taxPrice + cart.shippingPrice;

  useEffect(() => {
    if (!paymentMethod) {
      navigate('/payment');
    } else if (!userInfo) {
      navigate('/signin');
    }
  }, [navigate, cart, userInfo,paymentMethod]);

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: 'Create_Request' });
      const { data } = await axios.post(
        '/api/orders',
        {
          orderItems: cartItems,
          shippingAddress,
          paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: 'Bearer ' + userInfo.token,
          },
        }
      );

      // once data is fetched dispatch two actions to the reducer one in the component itself and another in
      // Context Store that we have setup.

      dispatch({ type: 'Create_Success' });
      ctxDispatch({ type: 'Cart_Clear' });

      // to clear the cart for new order.
      localStorage.removeItem('cart_items');

      // navigate to the order screen or order details page.
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'Create_Fail' });
    }
  };
  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Place Order</title>
      </Helmet>

      <h1 className="mb-3">Preview Order</h1>

      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {shippingAddress.fullName}
                <br />
                <strong>Address: </strong> {shippingAddress.address},
                {shippingAddress.city}, {shippingAddress.postalCode},{' '}
                {shippingAddress.country}
              </Card.Text>

              <Link to="/shipping">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>

              <Card.Text>
                <strong>Method: </strong>
                {paymentMethod}
              </Card.Text>

              <Link to="/payment">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link to={`/product/${item.slug}`}>{item.slug}</Link>
                      </Col>
                      <Col md={3}>
                        {' '}
                        <span>{item.quantity}</span>{' '}
                      </Col>
                      <Col md={3}>${item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <Link to="/cart">Edit</Link>
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
                    <Col>${cart.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${cart.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${cart.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>
                      {' '}
                      <strong>Order</strong>{' '}
                    </Col>
                    <Col>${cart.totalPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      className="btn btn-primary"
                      onClick={placeOrderHandler}
                      disabled={cartItems.length === 0}
                    >
                      Place Order
                    </Button>
                  </div>

                  {loading && <Loader />}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default PlaceOrderScreen;
