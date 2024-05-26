// create a  context store to ue for global state.
import { useReducer, createContext } from 'react';
import logger from 'use-reducer-logger';

// this gives us a Context Object and store it inside the Store variable.
export const Store = createContext();

const initialState = {
  fullBox: false,

  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,

  cart: {
    cartItems: localStorage.getItem('cart_items')
      ? JSON.parse(localStorage.getItem('cart_items'))
      : [],
    paymentMethod: localStorage.getItem('paymentMethod')
      ? localStorage.getItem('paymentMethod')
      : 'Stripe',
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : { location: {} },
  },

  // special case for Order screen.
  loadingSellers: false,
  errorSellers: '',
  users: [],
  loading: true,
  error: '',
  loadingPay: false,
  successPay: false,
  order: {},
};

// reducer function first takes a state argument and second is the action object which updates the state(UI) using useReducer.
function reducer(state, action) {
  switch (action.type) {
    case 'Cart_Add_item':
      // add to cartItems

      const newItem = action.payload;

      const existItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );

      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item._id === existItem._id ? newItem : item
          )
        : [...state.cart.cartItems, newItem];

      localStorage.setItem('cart_items', JSON.stringify(cartItems));

      return {
        ...state,
        cart: {
          ...state.cart,
          cartItems,
        },
      };

    case 'Cart_Remove_item': {
      const cartItems = state.cart.cartItems.filter(
        (item) => action.payload._id !== item._id
      );
      localStorage.setItem('cart_items', JSON.stringify(cartItems));

      return {
        ...state,
        cart: {
          ...state.cart,
          cartItems,
        },
      };
    }

    // if owner is not the same.
    case 'Cart_Add_Item_Fail':
      return { ...state, error: action.payload };

    // for authentication
    case 'User_SignedIn': {
      return { ...state, userInfo: action.payload };
    }

    case 'User_SignedOut': {
      localStorage.setItem('cart_items', JSON.stringify([]));

      return {
        ...state,
        userInfo: null,
        cart: {
          shippingAddress: {},
          cartItems: [],
          paymentMethod: '',
        },
      };
    }

    // for saving shipping address
    case 'shippingAddress': {
      return {
        ...state,
        cart: { ...state.cart, shippingAddress: action.payload },
      };
    }

    case 'Save_Shipping_Address_Map_Location': {
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: {
            ...state.cart.shippingAddress,
            location: action.payload,
          },
        },
      };
    }

    // for saving payment method type
    case 'Save_Payment_method': {
      return {
        ...state,
        cart: { ...state.cart, paymentMethod: action.payload },
      };
    }

    // to clear the cart
    case 'Cart_Clear': {
      return {
        ...state,
        cart: { ...state.cart, cartItems: [] },
      };
    }

    // for orders
    case 'Fetch_Request_Order':
      return { ...state, loading: true, error: '' };

    case 'Fetch_Success_Order':
      return { ...state, loading: false, order: action.payload, error: '' };

    case 'Fetch_Fail_Order':
      return { ...state, loading: false, error: action.payload };

    // for payment of orders
    case 'Pay_Request_Order':
      return { ...state, loadingPay: true };

    case 'Pay_Success_Order':
      return {
        ...state,
        successPay: true,
        payment: action.payload,
        loadingPay: false,
      };

    case 'Pay_Fail_Order':
      return {
        ...state,
        successPay: false,
        loadingPay: false,
        error: action.payload,
      };

    case 'Pay_Reset_Order': {
      return { ...state, successPay: false, loadingPay: false, error: '' };
    }

    // for maps
    case 'Set_FullBox_On': {
      return { ...state, fullBox: true };
    }
    case 'Set_FullBox_Off': {
      return { ...state, fullBox: false };
    }

    // for topSellers
    case 'User_Topsellers_List_Request':
      return { ...state, loadingSellers: true };

    case 'User_Topsellers_List_Success':
      return { ...state, loadingSellers: false, users: [...action.payload] };

    case 'User_Topsellers_List_Fail':
      return { ...state, loadingSellers: false, errorSellers: action.payload };

    default:
      return state;
  }
}
// every state& action defined  in the reducer function above updates the state& UI.

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(logger(reducer), initialState); // this takes a reducer function and a initial state
  //and returns a state and dispatch function and is seperate from the Store. which uses context api to give access to this state and dispatch function.

  // this is to be passed to the <Store.Provider/>
  const value = { state, dispatch };

  // this would provide access of the Context store to the entire component tree encapsulated within from it's nearest Provider.
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
