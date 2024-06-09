import React, { useContext } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { Store } from '../../Store';
import axios from 'axios';
import { toast } from 'react-toastify';

function Product(props) {
  const { product } = props;

  const {
    state,
    dispatch: ctxDispatch,
    state: { userInfo },
  } = useContext(Store);

  const { cart } = state;

  const { cartItems } = cart;

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);

    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }

    if (cartItems.length > 0 && data.seller._id !== cartItems[0].seller._id) {
      ctxDispatch({
        type: 'Cart_Add_Item_Fail',
        payload: `Can't Add To Cart. Buy only from ${cartItems[0].seller.seller.name} in this order`,
      });

      toast.error('Can Purchase items only from one seller');
    } else {
      ctxDispatch({ type: 'Cart_Add_item', payload: { ...item, quantity } });
    }
  };

  return (
    <Card>
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} className="card-img-top" alt={product.name} />
      </Link>

      <Card.Body>
        <Link to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>

        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>
          <strong>${product.price}</strong>
        </Card.Text>

        {product.seller&& product.seller.seller && (
          <Card.Text>
            {userInfo && userInfo.isSeller ? (
              <Link to={`/seller/${product.seller._id}`}>
                {product.seller.seller.name}
              </Link>
            ) : (
              `${product.seller.seller.name}`
            )}
          </Card.Text>
        )}

        {product.countInStock === 0
          ? userInfo && (
              <Button variant="light" disabled>
                Out of Stock
              </Button>
            )
          : userInfo && (
              <Button onClick={() => addToCartHandler(product)}>
                Add to cart
              </Button>
            )}
      </Card.Body>
    </Card>
  );
}
export default Product;
