import React, { useContext } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Store } from '../../Store';
import { Helmet } from 'react-helmet-async';
import Message from '../main_components/Message';
import ListGroup from 'react-bootstrap/ListGroup';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CartScreen() {
  const {
    state,
    dispatch: ctxDispatch,
    state: { userInfo },
  } = useContext(Store);

  // to navigate to other page
  const navigate = useNavigate();

  const {
    cart: { cartItems },
    error,
  } = state;

  const addToCartHandler = async (item, quantity) => {
    const { data } = await axios(`/api/products/${item._id}`);

    console.log(cartItems);

    if (data.countInStock < quantity) {
      window.alert('Sorry. product is out of Stock');
      return;
    }

    if (cartItems.length > 0 && data.seller._id !== cartItems[0].seller._id) {
      ctxDispatch({
        type: 'Cart_Add_Item_Fail',
        payload: `Can't Add To Cart. Buy only from ${cartItems[0].seller.seller.name} in this order`,
      });
    } else {
      ctxDispatch({
        type: 'Cart_Add_item',
        payload: { ...item, quantity, seller: data.seller },
      });
    }
  };

  const removeCartHandler = (item) => {
    ctxDispatch({
      type: 'Cart_Remove_item',
      payload: item,
    });
  };

  const checkoutHandler = () => {
    navigate('/signin?redirect=/shipping');
  };

  return (
    <div>
      <Helmet>
        <title>Shopping Cart</title>
      </Helmet>

      {error ? <Message variant="danger">{error}</Message> : ''}
      <h1>Shopping Cart</h1>

      <Row>
        <Col md={8}>
          {cartItems.length === 0 ? (
            <Message>
              Cart is Empty{' '}
              <Link to="/">
                {userInfo ? 'Go to Shopping' : 'Login to Shop'}
              </Link>
            </Message>
          ) : (
            <ListGroup>
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col md={4}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounded img-thumbnail"
                      ></img>{' '}
                      <Link to={`/product/${item.slug}`}>{item.name}</Link>
                    </Col>

                    <Col md={3}>
                      <Button
                        onClick={() => {
                          addToCartHandler(item, item.quantity - 1);
                        }}
                        variant="light"
                        disabled={item.quantity === 1}
                      >
                        <i className="fas fa-minus-circle"></i>
                      </Button>{' '}
                      <span>{item.quantity}</span>{' '}
                      <Button
                        onClick={() => {
                          addToCartHandler(item, item.quantity + 1);
                        }}
                        variant="light"
                        disabled={item.quantity === item.countInStock}
                      >
                        <i className="fas fa-plus-circle"></i>
                      </Button>
                    </Col>

                    <Col md={3}>${item.price}</Col>

                    <Col md={2}>
                      {' '}
                      <Button
                        onClick={() => {
                          removeCartHandler(item);
                        }}
                        variant="light"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>
                    Subtotal {cartItems.reduce((a, c) => a + c.quantity, 0)}{' '}
                    items : $
                    {cartItems.reduce((a, c) => a + c.price * c.quantity, 0)}
                  </h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      variant="primary"
                      disabled={cartItems.length === 0}
                      onClick={checkoutHandler}
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default CartScreen;
