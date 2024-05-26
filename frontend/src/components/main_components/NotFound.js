import React from 'react';
import Message from './Message';

function NotFound() {
  return (
    <div className="container d-flex flex-column">
      <Message variant="danger">Oops!! 404 Not Found</Message>
      <img className="img-fluid align-self-center" width={200} src="images/cute_dog.jpg" />
    </div>
  );
}

export default NotFound;
