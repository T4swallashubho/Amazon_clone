import React, { useContext, useEffect, useReducer, useRef } from 'react';
import axios from 'axios';
import logger from 'use-reducer-logger';
import { Helmet } from 'react-helmet-async';
import Loader from '../main_components/Loader';
import Message from '../main_components/Message';
import { getError } from '../main_components/utils.js';
import { Link } from 'react-router-dom';
import { Store } from '../../Store';
import { toast } from 'react-toastify';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import Paginated from '../main_components/Pagination/Paginated';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';

function reducer(state, action) {
  // second option that by default is passed to the reducer is action and the first is initial state.
  switch (action.type) {
    case 'Fetch_Request':
      return {
        ...state,
        loading: true, // we can show the loading box here
      };
    case 'Fetch_Success':
      return {
        ...state,
        loading: false,
        products: action.payload.products,
      };
    case 'Fetch_Request_Brand':
      return {
        ...state,
        loadingBrand: false,
      };

    case 'Fetch_Success_Brand':
      return {
        ...state,
        loadingBrand: false,
        brand: action.payload,
      };
    case 'Fetch_Fail':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

function HomeScreen() {
  const { state, dispatch: cxtDispatch } = useContext(Store);

  const { loadingSellers, users: sellers, errorSellers } = state;

  const scrollRef = useRef(null);

  const [{ loading, error, products, brand }, dispatch] = useReducer(
    process.env.NODE_ENV === 'development' ? logger(reducer) : reducer,
    {
      products: [],
      loading: true,
      error: '',
    }
  );

  const topSellers = async () => {
    cxtDispatch({ type: 'User_Topsellers_List_Request' });

    try {
      const { data } = await axios.get('/api/users/top-sellers');
      cxtDispatch({ type: 'User_Topsellers_List_Success', payload: data });
    } catch (err) {
      cxtDispatch({
        type: 'User_Topsellers_List_Fail',
        payload: getError(err),
      });

      toast.error(getError(err));
    }
  };

  // repilcating componentDidMount();
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'Fetch_Request', loading: true });

      try {
        const { data } = await axios.get('/api/products');

        dispatch({
          type: 'Fetch_Success',
          loading: false,
          payload: data,
          error: '',
        });
      } catch (err) {
        dispatch({ type: 'Fetch_Fail', payload: getError(err) });
      }
    };
    // here we call fetch data.
    fetchData();

    topSellers();

    const fetchTopBrands = async () => {
      dispatch({ type: 'Fetch_Request_Brand', loading: true });

      try {
        const { data } = await axios.get('/api/products/top-sales-brand');

        dispatch({
          type: 'Fetch_Success_Brand',
          payload: data,
        });
      } catch (err) {
        dispatch({ type: 'Fetch_Fail', payload: getError(err) });
      }
    };

    fetchTopBrands();
  });

  // we use JSX fragment.

  return (
    <>
      <Helmet>
        <title>Amazona</title>
      </Helmet>

      <div
        className="container-fluid main-homescreen-image mb-5"
        style={{ padding: '0' }}
      >
        <img
          className="image-home"
          src="\images\ecommerce\HomeScreenImage.png"
          style={{ height: '680px', padding: '0px' }}
          alt="home"
        />

        <div
          ref={scrollRef}
          className="scroll-down"
          onClick={() => {
            window.scrollTo({
              behavior: 'smooth',
              top: scrollRef.current.offsetTop,
            });
          }}
        >
          <span className="tooltiptext badge badge-secondary">
            Scroll Below
          </span>
        </div>
      </div>
{/* 
      {loadingSellers ? (
        <Loader />
      ) : errorSellers ? (
        <Message variant="danger">{errorSellers}</Message>
      ) : (
        <>
          {sellers.length === 0 && (
            <Message variant="warning">No Seller Found</Message>
          )}
          <Carousel
            showArrows
            autoPlay
            infiniteLoop
            showThumbs={false}
            interval={6000}
            className="home-sceen-carousel"
          >
            {sellers.map((seller) => (
              <div key={seller._id}>
                <Link to={`/seller/${seller._id}`}>
                  <img src={seller.seller.logo} alt={seller.name} />
                  <p className="legend">{seller.name}</p>
                </Link>
              </div>
            ))}
          </Carousel>
        </>
      )} */}

      <h1>Featured products</h1>

      <h5>Top Brands</h5>
{/* 
      <Row>
        {brand &&
          brand.map((item) => (
            <Col key={item._id}>
              <ListGroup variant="flush">
                <ListGroup.Item>{item._id}</ListGroup.Item>
              </ListGroup>
            </Col>
          ))}
      </Row>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Paginated products={products} itemsPerPage={4} />
        </>
      )} */}
    </>
  );
}

export default HomeScreen;
