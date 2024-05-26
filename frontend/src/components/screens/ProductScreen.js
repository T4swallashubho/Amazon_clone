import React, {
  useContext,
  useReducer,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ListGroup from 'react-bootstrap/ListGroup';
import Rating from '../main_components/Rating';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import Loader from '../main_components/Loader';
import Message from '../main_components/Message';
import { getError } from '../main_components/utils';
import { Store } from '../../Store';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { toast } from 'react-toastify';
import Card from 'react-bootstrap/Card';
import PaginatedReview from '../main_components/Pagination/PaginatedReview';

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
        product: action.payload,
      };
    case 'Fetch_Fail':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case 'Create_Request':
      return { ...state, loadingCreateReview: true };
    case 'Create_Success':
      return { ...state, loadingCreateReview: false };
    case 'Create_Fail':
      return { ...state, loadingCreateReview: false };

    case 'Refresh_Product':
      return { ...state, product: action.payload };

    default:
      return state;
  }
}

function ProductScreen() {
  let reviewsRef = useRef();

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);

  // the current selected image.
  const [selectedImage, setSelectedImage] = useState('');

  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;

  const [{ loading, error, product, loadingCreateReview }, dispatch] =
    useReducer(reducer, {
      product: [],
      loading: true,
      error: '',
    });

  // here second dispatch renamed for clarity purposes.
  const {
    state,
    dispatch: ctxDispatch,
    state: { userInfo },
  } = useContext(Store);

  const { cart } = state;

  const addCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);

    const quantity = existItem ? existItem.quantity + 1 : 1;

    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      window.alert('Sorry. product is out of Stock');
      return;
    }

    ctxDispatch({
      type: 'Cart_Add_item',
      payload: { ...product, quantity },
    });

    navigate('/cart');
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!comment || !rating) {
      toast.error('Comment or rating missing');
      return;
    }

    try {
      dispatch({ type: 'Create_Request' });
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment, name: userInfo.name },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );

      dispatch({ type: 'Create_Success' });
      toast.success('Review submitted successfully');

      product.reviews.unshift(data.review);
      product.numReviews = data.numReviews;
      product.rating = data.rating;

      dispatch({ type: 'Refresh_Product', payload: product });
      window.scrollTo({
        behavior: 'smooth',
        top: reviewsRef.current.offsetTop,
      });
    } catch (err) {
      toast.error(getError(error));
      dispatch({ type: 'Create_Fail' });
    }
  };

  // repilcating componentDidMount(). Used for running side effects();
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'Fetch_Request', loading: true });

      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        dispatch({
          type: 'Fetch_Success',
          loading: false,
          payload: result.data,
        });
      } catch (err) {
        // here we call fetch data.
        dispatch({ type: 'Fetch_Fail', payload: getError(err) });
      }
    };

    fetchData();
  }, [slug]); // whenever the slug changes useEffect() will be called and the component will re-render.
  // we use JSX fragment.

  return (
    <>
      <Helmet>
        <title>{product.name}</title>
      </Helmet>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div>
          <Row>
            <Col md={6}>
              <img
                className="img-large"
                src={selectedImage || product.image}
                alt={product.name}
              />
            </Col>

            <Col md={3}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h1>{product.name}</h1>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Rating
                    rating={product.rating}
                    numReviews={product.numReviews}
                  />
                </ListGroup.Item>

                <ListGroup.Item>Price:${product.price}</ListGroup.Item>

                <ListGroup.Item>
                  <p>{product.description}</p>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row xs={1} md={2} className="g-2">
                    {[product.image, ...product.images].map((image) => (
                      <Col key={image}>
                        <Card>
                          <Button
                            className="thumbnail"
                            type="button"
                            variant="light"
                            onClick={() => {
                              setSelectedImage(image);
                            }}
                          >
                            <Card.Img
                              variant="top"
                              src={image}
                              alt="product"
                            ></Card.Img>
                          </Button>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Col>

            <Col md={3}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>
                      {' '}
                      <h6>
                        Seller:{' '}
                        {userInfo && userInfo.isSeller ? (
                          <Link to={`/seller/${product.seller._id}`}>
                            {product.seller.seller.name}
                          </Link>
                        ) : (
                          `${product.seller.seller.name}`
                        )}
                      </h6>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Rating
                        numReviews={product.seller.seller.numReviews}
                        rating={product.seller.seller.rating}
                      />
                    </Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col>${product.price}</Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Status: </Col>
                    <Col>
                      {product.countInStock > 0 ? (
                        <Badge bg="success">In Stock</Badge>
                      ) : (
                        <Badge bg="danger">Unavailable</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>

                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <div className="d-grid">
                      {userInfo && (
                        <Button variant="primary" onClick={addCartHandler}>
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Col>
          </Row>

          <div className="my-3">
            <h2 ref={reviewsRef}>Reviews</h2>
            <div>
              {product.reviews.length === 0 && <Message>No reviews</Message>}
            </div>

            <ListGroup>
              <PaginatedReview product={product} itemsPerPage={2} />
            </ListGroup>

            <div className="mb-3">
              {userInfo ? (
                <Form onSubmit={onSubmitHandler}>
                  <h4>Write a customer review</h4>

                  <Form.Group className="mb-3" controlId="rating">
                    <Form.Label>Rating</Form.Label>
                    <Form.Select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="1">1- Poor</option>
                      <option value="2">2- Fair</option>
                      <option value="3">3- Good</option>
                      <option value="4">4- Very Good</option>
                      <option value="5">5- Excellent</option>
                    </Form.Select>
                  </Form.Group>

                  <FloatingLabel
                    controlId="floatingTextarea"
                    label="Comments"
                    className="mb-3"
                  >
                    <Form.Control
                      type="textarea"
                      placeholder="Leave a comment here"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></Form.Control>
                  </FloatingLabel>

                  <div className="mb-3">
                    <Button type="submit" disabled={loadingCreateReview}>
                      Submit
                    </Button>

                    {loadingCreateReview && <Loader />}
                  </div>
                </Form>
              ) : (
                <Message variant="warning">
                  Please{' '}
                  <Link to={`/signin?redirect=/product/${product.slug}`}>
                    SignIn
                  </Link>
                </Message>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductScreen;
