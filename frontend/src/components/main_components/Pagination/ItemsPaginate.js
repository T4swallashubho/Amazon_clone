import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Product from '../Product';

function ItemsPaginate({ currentItems }) {
  return (
    <>
      <Row>
        {currentItems &&
          currentItems.map((item) => (
            <Col key={item.slug} sm={6} md={4} lg={3} className="mb-3">
              <Product product={item} />
            </Col>
          ))}
      </Row>
    </>
  );
}

export default ItemsPaginate;
