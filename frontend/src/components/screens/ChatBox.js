import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Scrollbars } from 'react-custom-scrollbars';

// This is the page for the Normal User.

const ENDPOINT =
  window.location.host.indexOf('localhost') >= 0
    ? 'http://127.0.0.1:5000'
    : window.location.host; // if any other host like the served in heroku.

function ChatBox(props) {
  const { userInfo } = props;
  const [socket, setSocket] = useState(null);
  const uiMessageRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messageBody, setMessageBody] = useState('');

  // messages on the chatBox
  const [messages, setMessages] = useState([
    { name: 'Admin', body: 'Hello there, Please ask your question' },
  ]);

  const supportHandler = () => {
    setIsOpen(true);
    console.log(ENDPOINT);
    const sk = io(ENDPOINT);
    setSocket(sk); // here socket will be defined before that it will be null
  };

  const closeHandler = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (uiMessageRef.current) {
      uiMessageRef.current.scrollBy({
        top: uiMessageRef.current.clientHeight,
        left: 0,
        behavior: 'smooth',
      });
    }

    if (socket) {
      socket.emit('onLogin', {
        _id: userInfo._id,
        name: userInfo.name,
        isAdmin: userInfo.isAdmin,
      });

      // when data is received from server-side after tiggering 'onMessage'. // reugisters this handler
      socket.on('message', (data) => {
        setMessages([...messages, { body: data.body, name: data.name }]);
      });
    }
  }, [isOpen, messages, socket]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      alert('Error. Please type message.');
    } else {
      setMessages([...messages, { body: messageBody, name: userInfo.name }]);
      setMessageBody('');
      setTimeout(() => {
        // when the user enters and submits some message
        socket.emit('onMessage', {
          body: messageBody,
          name: userInfo.name,
          isAdmin: userInfo.isAdmin,
          _id: userInfo._id,
        });
      }, 1000);
    }
  };

  return (
    <div className="chatbox">
      {!isOpen ? (
        <button type="button" onClick={supportHandler}>
          <svg
            style={{ width: '90%', height: 30 }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 400c-18 0-32-14-32-32s13.1-32 32-32c17.1 0 32 14 32 32S273.1 400 256 400zM325.1 258L280 286V288c0 13-11 24-24 24S232 301 232 288V272c0-8 4-16 12-21l57-34C308 213 312 206 312 198C312 186 301.1 176 289.1 176h-51.1C225.1 176 216 186 216 198c0 13-11 24-24 24s-24-11-24-24C168 159 199 128 237.1 128h51.1C329 128 360 159 360 198C360 222 347 245 325.1 258z" />
          </svg>
        </button>
      ) : (
        // if it's open.
        <Card>
          <Card.Body>
            <Card.Title>
              <span>Support</span>
            </Card.Title>

            <Button
              variant="light"
              size="sm"
              type="button"
              onClick={closeHandler}
            >
              <svg
                style={{ width: '90%', height: 20 }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
              >
                <path d="M384 32C419.3 32 448 60.65 448 96V416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H384zM143 208.1L190.1 255.1L143 303C133.7 312.4 133.7 327.6 143 336.1C152.4 346.3 167.6 346.3 176.1 336.1L223.1 289.9L271 336.1C280.4 346.3 295.6 346.3 304.1 336.1C314.3 327.6 314.3 312.4 304.1 303L257.9 255.1L304.1 208.1C314.3 199.6 314.3 184.4 304.1 175C295.6 165.7 280.4 165.7 271 175L223.1 222.1L176.1 175C167.6 165.7 152.4 165.7 143 175C133.7 184.4 133.7 199.6 143 208.1V208.1z" />
              </svg>
            </Button>

            <ListGroup ref={uiMessageRef}>
              <Scrollbars style={{ width: '100%', height: 150 }}>
                {messages.map((msg, index) => (
                  <ListGroup.Item key={index}>
                    <strong>{`${msg.name}: `}</strong>
                    {msg.body}
                  </ListGroup.Item>
                ))}
              </Scrollbars>
            </ListGroup>

            <Form onSubmit={submitHandler} className="row">
              <Form.Control
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                type="text"
                placeholder="type message"
              />
              <Button className="mt-3" size="sm" type="submit">
                Send <i className="fa fa-arrow-right" aria-hidden="true"></i>
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default ChatBox;
