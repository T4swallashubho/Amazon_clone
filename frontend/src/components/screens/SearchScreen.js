import axios from 'axios';
import React, { useEffect, useReducer, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../main_components/Loader';
import Message from '../main_components/Message';
import Rating from '../main_components/Rating';
import { getError } from '../main_components/utils';
import Product from '../main_components/Product';
import { LinkContainer } from 'react-router-bootstrap';

const reducer = (state, action) => {
  switch (action.type) {
    case 'Fetch_Request': {
      return { ...state, loading: true };
    }

    case 'Fetch_Success': {
      return {
        ...state,
        loading: false,
        products: action.payload.products, // total products filtered or unfiltered
        page: action.payload.page, // current number
        pages: action.payload.pages, // total pages
        countProducts: action.payload.countProducts, // total product count
      };
    }
    case 'Fetch_Fail': {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    }

    default:
      return state;
  }
};

const prices = [
  { name: '$1 to $50', value: '1-50' },
  { name: '$51 to $200', value: '51-200' },
  { name: '$201 to $1000', value: '201-1000' },
];

const ratings = [
  {
    name: '4stars & up',
    rating: 4,
  },

  {
    name: '3stars & up',
    rating: 3,
  },

  {
    name: '2stars & up',
    rating: 2,
  },

  {
    name: '1stars & up',
    rating: 1,
  },
];

function SearchScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();

  const sp = new URLSearchParams(search); // /search?category=Shirts
  const category = sp.get('category') || 'all';
  const price = sp.get('price') || 'all';
  const page = sp.get('page') || 1;
  const query = sp.get('query') || 'all';
  const order = sp.get('order') || 'newest';
  const rating = sp.get('rating') || 'all';

  const [{ loading, error, products, pages, countProducts }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  // to fetch filtered data
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'Fetch_Request' });
        const { data } = await axios.get(
          `/api/products/search?page=${page}&query=${query}&category=${category}&price=${price}&order=${order}&rating=${rating}`
        );
        dispatch({ type: 'Fetch_Success', payload: data });
      } catch (err) {
        dispatch({ type: 'Fetch_Fail', payload: getError(err) });
      }
    };

    fetchData();
  }, [category, error, price, page, query, order, rating]);

  // state to fetch all categories
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/products/categories');
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);

  // function to get the filtered url.
  const getFilterURL = (filter) => {
    const filterCategory = filter.category || category;
    const filterQuery = filter.query || query;
    const sortOrder = filter.order || order;
    const filterPrice = filter.price || price;
    const filterPage = filter.page || page;
    const filterRating = filter.rating || rating;

    return `/search?category=${filterCategory}&price=${filterPrice}&page=${filterPage}&query=${filterQuery}&order=${sortOrder}&rating=${filterRating}`;
  };

  return (
    <div>
      <Helmet>
        <title>Search Products</title>
      </Helmet>

      <Row>
        <Col md={3}>
          <h3>Department</h3>

          <div>
            <ul>
              <li>
                <Link
                  className={category === 'all' ? 'text-bold' : ''}
                  to={getFilterURL({ category: 'all' })}
                >
                  Any
                </Link>
              </li>

              {categories.map((c) => (
                <li key={c}>
                  <Link
                    className={c === category ? 'text-bold' : ''}
                    to={getFilterURL({ category: c })}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Price</h3>

            <ul>
              <li>
                <Link
                  className={price === 'all' ? 'text-bold' : ''}
                  to={getFilterURL({ price: 'all' })}
                >
                  All prices
                </Link>
              </li>

              {prices.map((p) => (
                <li key={p.value}>
                  <Link
                    className={price === p.value ? 'text-bold' : ''}
                    to={getFilterURL({ price: p.value })}
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Avg. Cusomter reviews</h3>

            <ul>
              {ratings.map((r) => (
                <li key={r.name}>
                  <Link
                    className={`${rating}` === `${r.rating}` ? 'text-bold' : ''}
                    to={getFilterURL({ rating: r.rating })}
                  >
                    <Rating caption={' & up'} rating={r.rating} />
                  </Link>
                </li>
              ))}

              <li>
                <Link
                  className={rating === 'all' ? 'text-bold' : ''}
                  to={getFilterURL({ rating: 'all' })}
                >
                  <Rating caption={' & up'} rating={0} />
                </Link>
              </li>
            </ul>
          </div>
        </Col>

        <Col md={9}>
          {loading ? (
            <Loader></Loader>
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <>
              {' '}
              {/** JSX Fragment is returned */}
              <Row className="justify-content-between mb-3">
                <Col md={6}>
                  <Message variant="warning">
                    <div className="text-center">
                      {countProducts === 0 ? 'No' : countProducts} Results
                      {query !== 'all' && ' : ' + query}
                      {category !== 'all' && ' : ' + category}
                      {price !== 'all' && ' : Price ' + price}
                      {rating !== 'all' && ' : Rating ' + rating + ' & up'}
                      {query !== 'all' ||
                      category !== 'all' ||
                      rating !== 'all' ||
                      price !== 'all' ? (
                        <Button
                          className="ms-2"
                          variant="light"
                          onClick={() => navigate('/search')}
                        >
                          <i className="fas fa-times-circle"></i>
                        </Button>
                      ) : null}
                    </div>
                  </Message>
                </Col>
                <Col className="text-end">
                  Sort by{' '}
                  <select
                    value={order}
                    onChange={(e) => {
                      navigate(getFilterURL({ order: e.target.value }));
                    }}
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="lowest">Price: Low to High</option>
                    <option value="highest">Price: High to Low</option>
                    <option value="toprated">Avg. Customer Reviews</option>
                  </select>
                </Col>
              </Row>
              {products.length === 0 && <Message>No Product Found</Message>}
              <Row>
                {products.map((product) => (
                  <Col sm={6} lg={4} className="mb-3" key={product._id}>
                    <Product product={product}></Product>
                  </Col>
                ))}
              </Row>
              <div>
                {/**Convert pages into arrays and map their keys with pages */}
                {[...Array(pages).keys()].map((x) => (
                  <LinkContainer
                    key={x + 1}
                    className="mx-1"
                    to={getFilterURL({ page: x + 1 })}
                  >
                    <Button
                      className={Number(page) === x + 1 ? 'text-bold' : ''}
                      variant="light"
                    >
                      {x + 1}
                    </Button>
                  </LinkContainer>
                ))}
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default SearchScreen;
