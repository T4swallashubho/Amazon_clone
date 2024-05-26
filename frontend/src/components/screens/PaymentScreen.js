import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import CheckoutSteps from '../main_components/CheckoutSteps.js';
import { Store } from '../../Store.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function PaymentScreen() {
  const navigate = useNavigate();

  const { state, dispatch: ctxDispatch } = useContext(Store); // returns anything stored as a value.

  const {
    cart: { shippingAddress, paymentMethod },
  } = state;

  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethod || 'PayPal'
  );
  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({ type: 'Save_Payment_method', payload: paymentMethodName });
    localStorage.setItem('paymentMethod', paymentMethodName);
    navigate('/placeorder');
  };

  function checkProceed() {
    toast.dismiss();
  }

  // once the component has mounted then it will run.
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [navigate, shippingAddress]);

  return (
    <>
      <div className="container small-container">
        <Helmet>
          <title>Payment Method</title>
        </Helmet>
        <CheckoutSteps step1 step2 step3 />

        <h1 className="my-3">Payment Method</h1>

        <Form onSubmit={submitHandler}>
          <Form.Check
            label="PayPal"
            type="radio"
            id="PayPal"
            value="PayPal"
            disabled={true}
            checked={paymentMethodName === 'PayPal'}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
            }}
          />
          <Form.Check
            label="Stripe"
            type="radio"
            id="Stripe"
            value="Stripe"
            checked={paymentMethodName === 'Stripe'}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
            }}
          />

          <div className="my-3">
            <Button variant="primary" type="submit" onClick={checkProceed}>
              Proceed
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}

export default PaymentScreen;
