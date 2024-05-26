import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HelmetProvider } from 'react-helmet-async';
import { StoreProvider } from './Store';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { LoadScript } from '@react-google-maps/api';


// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  'pk_test_51Kjj2QSJxaR9wFZemlzlFMaM470OJciNKcKSNqWbTPP8t4VDzjFLdUEwm31wMQWL4Py7uHZUqvQqBPUfoXilYosU00rV99Bd0e'
);

// Google Maps and LoadScript only once
const googleApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const libs = ['places'];

const appearance = {
  theme: 'stripe',
};

const options = { appearance };

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <StoreProvider>
      <HelmetProvider>
        <LoadScript libraries={libs} googleMapsApiKey={googleApiKey}>
          <Elements stripe={stripePromise} options={options}>
            <App />
          </Elements>
        </LoadScript>
      </HelmetProvider>
    </StoreProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
