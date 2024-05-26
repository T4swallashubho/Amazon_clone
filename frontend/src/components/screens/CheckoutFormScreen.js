import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Store } from '../../Store.js';
import { getError } from '../main_components/utils.js';

function CheckoutFormScreen(props) {
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState('');

  const stripe = useStripe();
  const elements = useElements();

  const { state, dispatch } = useContext(Store);

  const { userInfo } = state;
  const { order } = props;
  const { shippingAddress } = order;
  const { city, postalCode, fullName } = shippingAddress;

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const fetchPaymentIntent = async () => {
      try {
        const { data } = await axios.post(
          '/api/stripe/create-payment-intent',
          { order },
          {
            headers: {
              authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
        setClientSecret(data.clientSecret);
      } catch (err) {
        getError(err);
      }
    };
    fetchPaymentIntent();
  }, [userInfo]);

  const cardStyle = {
    hidePostalCode: true,
    style: {
      base: {
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '1.15rem',
        '::placeholder': {
          color: '#32325d',
        },
      },
      invalid: {
        fontFamily: 'Arial, sans-serif',
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  const handleChange = async (e) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(e.empty);
    setError(e.error ? e.error.message : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    dispatch({ type: 'Pay_Request_Order' });

    // finalise the card payment using the payment intent and the client secret associated with it.
    await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: fullName,
          email: userInfo.email,
          address: { city, postal_code: postalCode },
        },
      },
    });


    // retrieve the payment intent and confirm payment status.
    const { paymentIntent, error } = await stripe.retrievePaymentIntent(
      clientSecret
    );

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      dispatch({ type: 'Pay_Success_Order', payload: paymentIntent });
      setError(null);
      setProcessing(false);
      setSucceeded(true);
    } else if (paymentIntent.last_payment_error || error) {
      dispatch({
        type: 'Pay_Fail_Order',
        payload: getError(paymentIntent.last_payment_error || error),
      });
      setError(
        `Payment failed ${
          paymentIntent.last_payment_error.message || error.message
        }`
      );
      setProcessing(false);
    }

  };

  return (
    <>
      <form
        id="payment-form"
        className="checkout-form py-5"
        onSubmit={handleSubmit}
      >
        <h5 className="payment">Pay Here</h5>

        <CardElement
          className="mb-3"
          id="card-element"
          options={cardStyle}
          onChange={handleChange}
        />

        <button
          className="btn btn-primary"
          disabled={processing || disabled || succeeded}
          id="submit"
        >
          <span id="button-text">
            {processing ? (
              <div className="spinner" id="spinner"></div>
            ) : (
              'Pay now'
            )}
          </span>
        </button>

        {/* Show any error that happens when processing the payment */}

        {error && (
          <div className="card-error" role="alert">
            {error}
          </div>
        )}

        {/* Show a success message upon completion */}

        <p className={succeeded ? 'result-message' : 'result-message hidden'}>
          Payment succeeded, see the result in your
          <a href={`https://dashboard.stripe.com/test/payments`}>
            {' '}
            Stripe dashboard.
          </a>{' '}
        </p>
      </form>
    </>
  );
}

export default CheckoutFormScreen;
