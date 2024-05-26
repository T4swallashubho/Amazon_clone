import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../main_components/Loader';
import Message from '../../main_components/Message';
import axios from 'axios';
import { Store } from '../../../Store';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../../main_components/Product';
import { getError } from '../../main_components/utils';
import Card from 'react-bootstrap/Card';
import Rating from '../../main_components/Rating';

const reducer = (state, action) => {
  switch (action.type) {
    case 'Fetch_Request': {
      return { ...state, loading: true };
    }
    case 'Fetch_Success': {
      return {
        ...state,
        products: action.payload.products,
        loading: false,
        error: '',
      };
    }
    case 'Fetch_Fail': {
      return { ...state, loading: false, error: action.payload };
    }
  }
};

function SellerScreen() {
  const params = useParams();
  const { id } = params;

  const { state } = useContext(Store);

  const { userInfo } = state;

  const navigate = useNavigate();

  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    loading: true,
    error: false,
  });

  useEffect(() => {
    if (!userInfo) {
      navigate('/signin');
    }

    const sellerProducts = async () => {
      try {
        dispatch({ type: 'Fetch_Request' });
        const { data } = await axios.get(
          `/api/products?seller=${userInfo._id}`
        );
        dispatch({ type: 'Fetch_Success', payload: data });
      } catch (err) {
        dispatch({ type: 'Fetch_Fail', error: getError(err) });
      }
    };

    sellerProducts();
  }, [userInfo]);

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error}</Message>
  ) : (
    <div>
      <Helmet>
        <title>Seller {id}</title>
      </Helmet>

      <Row>
        <Col md={3} className="mb-3">
          <Card>
            <Card.Body>
              <Row>
                <Col>
                  <img
                    className="img-thumbnail mx-2"
                    src={userInfo.seller.logo}
                    alt={userInfo.seller.name}
                  />
                  <strong>{userInfo.seller.name}</strong>
                </Col>
              </Row>

              <Rating
                rating={userInfo.seller.rating}
                numReviews={userInfo.seller.numReviews}
              />

              <a href={`mailto:${userInfo.email}`}>Contact Seller</a>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          {products.length === 0 && <Message>No Product Found</Message>}

          <Row>
            {products.map((product) => (
              <Col className="mb-3" key={product._id} md={5} lg={3}>
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
}

export default SellerScreen;
