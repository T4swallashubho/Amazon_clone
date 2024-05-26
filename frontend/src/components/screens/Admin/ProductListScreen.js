import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../../../Store';
import Loader from '../../main_components/Loader';
import Message from '../../main_components/Message';
import { getError } from '../../main_components/utils';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
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
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
      };
    }

    case 'Fetch_Fail': {
      return { ...state, error: action.payload, loading: false };
    }
    case 'Create_Request': {
      return { ...state, loadingProduct: true, error: '' };
    }

    case 'Create_Success': {
      return {
        ...state,
        loadingProduct: false,
        product: action.payload.product,
        error: '',
      };
    }

    case 'Create_Fail': {
      return { ...state, error: action.payload, loadingProduct: false };
    }
    case 'Delete_Request': {
      return { ...state, successDelete: false, loadingDelete: true };
    }

    case 'Delete_Success': {
      return {
        ...state,
        successDelete: true,
        loadingDelete: false,
      };
    }

    case 'Delete_Fail': {
      return {
        ...state,
        successDelete: false,
        loadingDelete: false,
      };
    }
    case 'Delete_Reset': {
      return {
        ...state,
        successDelete: false,
        loadingDelete: false,
      };
    }

    default: {
      return state;
    }
  }
};

function ProductListScreen() {
  const [
    {
      loading,
      products,
      error,
      pages,
      loadingProduct,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  const { search, pathname } = useLocation();

  const sp = new URLSearchParams(search);

  const page = sp.get('page') || 1;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async (api) => {
      try {
        dispatch({ type: 'Fetch_Request' });
        const { data } = await axios.get(api, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'Fetch_Success', payload: data });
      } catch (err) {
        dispatch({ type: 'Fetch_Fail', payload: getError(err) });
      }
    };

    if (successDelete) {
      dispatch({ type: 'Delete_Reset' });
    } else {
      if (pathname.includes('/admin')) {
        fetchData(`/api/products/admin?page=${page}`);
      } else if (pathname.includes('/seller')) {
        fetchData(`/api/products?seller=${userInfo._id}&page=${page}`);
      }
    }
  }, [userInfo, page, successDelete]); // consitionally run the effect which re-renders the component.

  const deleteHandler = async (product) => {
    try {
      if (window.confirm('Are you sure you want to delete this product?')) {
        dispatch({ type: 'Delete_Request' });
        const { data } = await axios.delete(`/api/products/${product._id}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'Delete_Success' });
        toast.success(data.message);

        if (pathname.includes('/admin')) {
          navigate(`/admin/products`);
        } else if (pathname.includes('/seller')) {
          navigate(`/seller/productslist`);
        }
      } else {
        toast.error('Deletion not initiated');
      }
    } catch (err) {
      dispatch({ type: 'Delete_Fail' });
      toast.error(getError(err));
    }
  };

  const clickHandler = (e) => {
    e.preventDefault();
    const confirm = window.confirm('Would you like to create product?');

    if (confirm) {
      try {
        const createProduct = async () => {
          dispatch({ type: 'Create_Request' });
          const { data } = await axios.post(
            '/api/products',
            {},
            {
              headers: { authorization: `Bearer ${userInfo.token}` },
            }
          );

          dispatch({ type: 'Create_Success', payload: data });

          pathname.includes('/admin')
            ? navigate(`/admin/product/${data.product._id}`)
            : navigate(`/seller/productslist/${data.product._id}`);
        };
        createProduct();
      } catch (err) {
        dispatch({ type: 'Create_Fail', error: getError(err) });
        toast.error(getError(err));
      }
    } else {
      toast.error('Product creation aborted');
    }
  };

  return (
    <div>
      <Row>
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className="text-end">
          <Button onClick={clickHandler}>Create Product</Button>
        </Col>
      </Row>

      {loadingProduct && <Loader />}

      {loading ? (
        <Loader></Loader>
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <Button
                      className="mx-2"
                      variant="light"
                      onClick={() => {
                        pathname.includes('/admin')
                          ? navigate(`/admin/product/${product._id}`)
                          : navigate(`/seller/productslist/${product._id}`);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="light"
                      onClick={() => {
                        deleteHandler(product);
                      }}
                    >
                      Delete
                      {loadingDelete && <Loader />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            {[...Array(pages).keys()].map((x) => (
              <Link
                className={Number(page) === x + 1 ? 'btn text-bold' : 'btn'}
                key={x + 1}
                to={
                  pathname.includes('/admin')
                    ? `/admin/products?page=${x + 1}`
                    : `/seller/productslist?page=${x + 1}`
                }
              >
                {x + 1}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ProductListScreen;