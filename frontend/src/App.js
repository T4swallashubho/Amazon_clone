import React, { useContext, useEffect, useState } from 'react';
import { Store } from './Store.js';
import HomeScreen from './components/screens/HomeScreen';
import ProductScreen from './components/screens/ProductScreen';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Link, Routes, Route } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Badge from 'react-bootstrap/Badge';
import CartScreen from './components/screens/CartScreen';
import SigninScreen from './components/screens/SigninScreen';
import NavDropdown from 'react-bootstrap/NavDropdown';
import ShippingScreen from './components/screens/ShippingScreen.js';
import SignupScreen from './components/screens/SignupScreen.js';
import PaymentScreen from './components/screens/PaymentScreen.js';
import PlaceOrderScreen from './components/screens/PlaceOrderScreen.js';
import OrderScreen from './components/screens/OrderScreen.js';
import OrderHistoryScreen from './components/screens/OrderHistoryScreen.js';
import UserProfileScreen from './components/screens/UserProfileScreen.js';
import CheckoutSuccess from './components/main_components/CheckoutSuccess.js';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { getError } from './components/main_components/utils.js';
import SearchBox from './components/main_components/SearchBox.js';
import NotFound from './components/main_components/NotFound.js';
import SearchScreen from './components/screens/SearchScreen.js';
import DashboardScreen from './components/screens/Admin/DashboardScreen.js';
import AdminRouteMain from './components/screens/Admin/AdminRouteMain.js';
import ProductListScreen from './components/screens/Admin/ProductListScreen.js';
import ProductEditScreen from './components/screens/Admin/ProductEditScreen.js';
import OrderListScreen from './components/screens/Admin/OrderListScreen.js';
import UserListScreen from './components/screens/Admin/UserListScreen.js';
import UserEditScreen from './components/screens/Admin/UserEditScreen.js';
import MapScreen from './components/screens/MapScreen.js';
import SellerRouteMain from './components/screens/Seller/SellerRouteMain.js';
import SellerScreen from './components/screens/Seller/SellerScreen.js';
import SupportScreen from './components/screens/Admin/SupportScreen.js';
import ChatBox from './components/screens/ChatBox.js';

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { fullBox, cart, userInfo } = state;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // signout from the application.
  const signoutHandler = () => {
    ctxDispatch({ type: 'User_SignedOut' });
    toast.success('Successfully signed out', {
      theme: 'colored',
    });

    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('paymentMethod');
  };

  // componentdidmount replicate
  useEffect(() => {
    try {
      const fetchCategory = async () => {
        const { data } = await axios.get('/api/products/categories');
        setCategories(data);
      };

      fetchCategory();
    } catch (err) {
      toast.error(getError(err));
    }
  }, []);

  return (
    <Router>
      <div
        className={
          sidebarOpen
            ? fullBox
              ? 'd-flex flex-column site-container active-cont fullBox'
              : 'd-flex flex-column site-container active-cont'
            : fullBox
            ? 'd-flex flex-column site-container fullBox'
            : 'd-flex flex-column site-container'
        }
      >
        <header>
          <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
              <Button
                variant="dark"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <i className="fas fa-bars"></i>
              </Button>
              <LinkContainer to="/">
                <Navbar.Brand>amazona</Navbar.Brand>
              </LinkContainer>
              <ToastContainer position="top-center" limit={1} />
              <Navbar.Toggle aria-controls="basic-control-nav" />
              <Navbar.Collapse id="basic-control-nav">
                <SearchBox />
                <Nav className="me-auto w-100 justify-content-end">
                  <Link
                    to="/cart"
                    className="nav-link"
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    Cart
                    {cart.cartItems.length > 0 && (
                      <Badge pill bg="danger">
                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>

                  {userInfo ? (
                    <NavDropdown
                      title={userInfo.name}
                      id="basic-nav-dropdown"
                      className="nav-link"
                      to="/signin"
                    >
                      <LinkContainer to="/profile">
                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                      </LinkContainer>

                      <LinkContainer to="/orderhistory">
                        <NavDropdown.Item>Order History</NavDropdown.Item>
                      </LinkContainer>

                      <NavDropdown.Divider />

                      <Link
                        className="dropdown-item"
                        onClick={signoutHandler}
                        to="#signout"
                      >
                        Sign Out
                      </Link>
                    </NavDropdown>
                  ) : (
                    <Link className="nav-link" to="/signin">
                      Sign In
                    </Link>
                  )}

                  {/*For Seller dropdowns*/}
                  {userInfo && userInfo.isSeller && (
                    <NavDropdown
                      title="Seller"
                      id="basic-nav-dropdown"
                      className="nav-link"
                    >
                      <LinkContainer to="/seller/productslist">
                        <NavDropdown.Item>Products</NavDropdown.Item>
                      </LinkContainer>

                      <LinkContainer to="/seller/orderslist">
                        <NavDropdown.Item>Orders</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}

                  {/*For Admin dropdowns*/}
                  {userInfo && userInfo.isAdmin && (
                    <NavDropdown
                      title="Admin"
                      id="basic-nav-dropdown"
                      className="nav-link"
                    >
                      <LinkContainer to="/admin/dashboard">
                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                      </LinkContainer>

                      <LinkContainer to="/admin/products">
                        <NavDropdown.Item>Products</NavDropdown.Item>
                      </LinkContainer>

                      <LinkContainer to="/admin/orders">
                        <NavDropdown.Item>Orders</NavDropdown.Item>
                      </LinkContainer>

                      <LinkContainer to="/admin/users">
                        <NavDropdown.Item>Users</NavDropdown.Item>
                      </LinkContainer>

                      <LinkContainer to="/admin/support">
                        <NavDropdown.Item>Support</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>

        <div
          className={
            sidebarOpen
              ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column'
              : 'side-navbar d-flex justify-content-between flex-wrap flex-column'
          }
        >
          <Nav className="flex-column text-white w-100 p-2">
            <Nav.Item>
              <strong>Categories</strong>
            </Nav.Item>

            {categories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer
                  to={`/search?category=${category}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Nav.Link>{category}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
          </Nav>
        </div>

        <main>
          <Container className="mt-3">
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/product/:slug" element={<ProductScreen />} />
              <Route path="/cart" element={<CartScreen />} />
              <Route path="/signin" element={<SigninScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/shipping" element={<ShippingScreen />} />
              <Route path="/payment" element={<PaymentScreen />} />
              <Route path="/placeorder" element={<PlaceOrderScreen />} />
              <Route path="/order/:id" element={<OrderScreen />} />
              <Route path="/orderhistory" element={<OrderHistoryScreen />} />
              <Route path="/profile" element={<UserProfileScreen />} />
              <Route path="/checkoutsuccess" element={<CheckoutSuccess />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/map" element={<MapScreen />} />
              <Route path="*" element={<NotFound />} />

              {/**Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRouteMain>
                    <DashboardScreen />
                  </AdminRouteMain>
                }
              />

              <Route
                path="/admin/products/"
                element={
                  <AdminRouteMain>
                    <ProductListScreen />
                  </AdminRouteMain>
                }
              />
              <Route
                path="/admin/product/:id"
                element={
                  <AdminRouteMain>
                    <ProductEditScreen />
                  </AdminRouteMain>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <AdminRouteMain>
                    <OrderListScreen />
                  </AdminRouteMain>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <AdminRouteMain>
                    <UserListScreen />
                  </AdminRouteMain>
                }
              />

              <Route
                path="/admin/user/:id"
                element={
                  <AdminRouteMain>
                    <UserEditScreen />
                  </AdminRouteMain>
                }
              />
              <Route
                path="/admin/support"
                element={
                  <AdminRouteMain>
                    <SupportScreen />
                  </AdminRouteMain>
                }
              />

              {/*Seller Route main*/}
              <Route
                path="/seller/productslist"
                element={
                  <SellerRouteMain>
                    <ProductListScreen />
                  </SellerRouteMain>
                }
              />
              <Route
                path="/seller/orderslist"
                element={
                  <SellerRouteMain>
                    <OrderListScreen />
                  </SellerRouteMain>
                }
              />

              <Route
                path="/seller/productslist/:id"
                element={
                  <SellerRouteMain>
                    <ProductEditScreen />
                  </SellerRouteMain>
                }
              />

              <Route
                path="/seller/:id"
                element={
                  <SellerRouteMain>
                    <SellerScreen />
                  </SellerRouteMain>
                }
              />
            </Routes>
          </Container>
        </main>

        <footer>
          {userInfo && !userInfo.isAdmin && (
            <ChatBox userInfo={userInfo}/>
          )}
          <div className="text-center">All rights Reserved</div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
