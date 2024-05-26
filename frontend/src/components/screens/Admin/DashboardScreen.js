import React, { useContext, useEffect, useReducer } from 'react';
import { Store } from '../../../Store';
import { getError } from '../../main_components/utils';
import axios from 'axios';
import Loader from '../../main_components/Loader';
import Message from '../../main_components/Message';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Charts, { Chart } from 'react-google-charts';

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
        summary: action.payload,
      };
    case 'Fetch_Fail':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

function DashboardScreen() {
  const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'Fetch_Request' });
        const { data } = await axios.get('/api/orders/summary', {
          headers: {
            authorization: `Bearer ${userInfo.token}`, // authenticate the admin user.
          },
        });

        dispatch({ type: 'Fetch_Success', payload: data });
      } catch (err) {
        dispatch({ type: 'Fetch_Fail', payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo]);

  return (
    <div>
      <h1>Dashboard</h1>

      {loading ? (
        <Loader></Loader>
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Row className="mb-4">
            <Col className="mb-3" md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary && summary.users[0] && summary.users[0].countUsers}
                  </Card.Title>
                  <Card.Text>
                    {' '}
                    <strong>Users</strong>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col className="mb-3" md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary &&
                      summary.orders[0] &&
                      summary.orders[0].countOrders}
                  </Card.Title>
                  <Card.Text>
                    {' '}
                    <strong>Orders</strong>{' '}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col className="mb-3" md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    ${summary &&
                      summary.orders[0] &&
                      summary.orders[0].totalSales}
                  </Card.Title>
                  <Card.Text>
                    <strong>Sales</strong>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <h2>Sales</h2>
            {summary &&
            summary.dailyOrders[0] &&
            summary.dailyOrders[0].sales === 0 ? (
              <Col>
                <Message variant="warning">No Sales</Message>
              </Col>
            ) : (
              <Col className="mb-3">
                <Card>
                  <Chart
                    chartType="AreaChart"
                    width="100%"
                    height="400px"
                    loader={
                      <div>
                        <Loader />
                      </div>
                    }
                    data={[
                      ['Date', 'Sales'],
                      ...summary.dailyOrders.map((x) => [x._id, x.sales]),
                    ]}
                  />
                </Card>
              </Col>
            )}
          </Row>

          <Row>
            <h2>Orders</h2>
            <Col className="mb-3">
              <Card>
                <Chart
                  chartType="AreaChart"
                  width="100%"
                  height="400px"
                  loader={
                    <div>
                      <Loader />
                    </div>
                  }
                  data={[
                    ['Date', 'Orders'],
                    ...summary.dailyOrders.map((x) => [x._id, x.orders]),
                  ]}
                />
              </Card>
            </Col>
          </Row>

          <Row>
            <h2>Categories</h2>
            <Col className="mb-3">
              <Card>
                <Chart
                  chartType="PieChart"
                  data={[
                    ['Shirts', 'Pants'],
                    ...summary.productCategories.map((x) => [x._id, x.count]),
                  ]}
                  width="100%"
                  height="400px"
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}

export default DashboardScreen;
