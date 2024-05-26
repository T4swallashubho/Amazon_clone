import React from 'react';
import Rating from '../Rating';
import ListGroup from 'react-bootstrap/ListGroup';

function ReviewsPaginate({ currentItems }) {
  return (
    <>
      {currentItems &&
        currentItems.map((review) => (
          <ListGroup.Item className="mb-3" key={review._id}>
            <strong>{review.name}</strong>
            <Rating rating={review.rating} caption=""></Rating>
            <p>{review.createdAt.substring(0, 10)}</p>
            <p>{review.comment}</p>
          </ListGroup.Item>
        ))}
    </>
  );
}

export default ReviewsPaginate;
