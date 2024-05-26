import React, { useContext, useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { Store } from '../../Store.js';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../main_components/CheckoutSteps.js';
import { toast } from 'react-toastify';

function ShippingScreen() {
  const navigate = useNavigate();

  const { fullBox, state, dispatch: ctxDispatch } = useContext(Store);

  const {
    cart: { shippingAddress },
    userInfo,
  } = state;

  // used to run side effects after the DOM has loaded.
  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/shipping');
    }
  }, [userInfo, navigate]);

  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  );
  const [country, setCountry] = useState(shippingAddress.country || '');

  const submitHandler = (e) => {
    e.preventDefault();

    ctxDispatch({
      type: 'shippingAddress',
      payload: {
        fullName,
        address,
        city,
        postalCode,
        country,
        location: shippingAddress.location,
      },
    });

    localStorage.setItem(
      'shippingAddress',
      JSON.stringify({
        fullName,
        address,
        city,
        postalCode,
        country,
        location: shippingAddress.location,
      })
    );

    navigate('/payment');
    toast.info('PayPal disabled for the moment.');
  };

  useEffect(() => {
    ctxDispatch({ type: 'Set_FullBox_Off' });
  }, [ctxDispatch, fullBox]);

  return (
    <>
      <div className="container small-container">
        <CheckoutSteps step1 step2 />
        <h1 className="my-3">Shipping</h1>
        <Helmet>
          <title>Shipping Address</title>
        </Helmet>

        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="fullName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              value={fullName}
              placeholder="Enter Full Name"
              onChange={(e) => {
                setFullName(e.target.value);
              }}
              required
            ></Form.Control>
          </Form.Group>

          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              placeholder="Enter Address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
              }}
              required
            ></Form.Control>
          </Form.Group>

          <Form.Group className="mb-3" controlId="city">
            <Form.Label>City</Form.Label>
            <Form.Control
              placeholder="Enter City"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
              }}
              required
            ></Form.Control>
          </Form.Group>

          <Form.Group className="mb-3" controlId="postalCode">
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              placeholder="Enter Postal Code"
              value={postalCode}
              onChange={(e) => {
                setPostalCode(e.target.value);
              }}
              required
            ></Form.Control>
          </Form.Group>

          <Form.Group className="mb-3" controlId="country">
            <Form.Label>Country</Form.Label>
            <Form.Control
              placeholder="Enter country"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
              }}
              required
            ></Form.Control>
          </Form.Group>

          <div className="mb-3">
            <Button
              id="chooseOnMap"
              type="button"
              variant="light"
              onClick={() => {
                navigate('/map');
              }}
            >
              Choose Location on Map
            </Button>

            {shippingAddress.location && shippingAddress.location.lat ? (
              <div className="mt-3">
                LAT: {shippingAddress.location.lat} LNG:{' '}
                {shippingAddress.location.lng}
              </div>
            ) : (
              <div className="mt-3">No Location Found</div>
            )}
          </div>

          <div className="mb-3">
            <Button variant="primary" type="submit">
              Continue
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}

export default ShippingScreen;
