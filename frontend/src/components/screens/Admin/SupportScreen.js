import React, { useContext, useEffect, useRef, useState } from 'react';
import { Store } from '../../../Store';
import Message from '../../main_components/Message';
import { io } from 'socket.io-client';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Scrollbars } from 'react-custom-scrollbars';
import Card from 'react-bootstrap/Card';

// This is the page for the admin to visit.

const ENDPOINT =
  window.location.host.indexOf('localhost') >= 0
    ? 'http://127.0.0.1:5000'
    : window.location.host; // if any other host like the served in heroku.

function SupportScreen() {
  // access the state
  const { state } = useContext(Store);

  const { userInfo } = state;

  const uiMessageRef = useRef(null);

  let allUsers = [];
  let allSelectedUser = {};
  let allMessages = [];

  // multiple states set.
  const [selectedUser, setSelectedUser] = useState({});
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  const [messageBody, setMessageBody] = useState('');

  // all users in the current room
  const [users, setUsers] = useState([]);

  // run some side effects using useEffect when the page loads.
  useEffect(() => {
    if (uiMessageRef.current) {
      uiMessageRef.current.scrollBy({
        top: uiMessageRef.current.clientHeight,
        left: 0,
        behaviour: 'smooth',
      });
    }
    // if the socket does not exist
    if (!socket) {
      const sk = io(ENDPOINT); // initialise the instance of socket.
      setSocket(sk);
      sk.emit('onLogin', {
        _id: userInfo._id,
        name: userInfo.name,
        isAdmin: userInfo.isAdmin,
      });

      sk.on('message', (data) => {
        if (allSelectedUser._id === data._id) {
          allMessages = [...allMessages, data];
        } else {
          const existUser = allUsers.find((user) => user._id === data._id);

          if (existUser) {
            allUsers = allUsers.map((user) =>
              user._id === existUser._id ? { ...user, unread: true } : user
            );

            setUsers(allUsers);
          }
        }
        setMessages(allMessages);
      });

      sk.on('updateUser', (updatedUser) => {
        const existUser = allUsers.find((user) => user._id === updatedUser._id);

        if (existUser) {
          allUsers = allUsers.map((user) =>
            user._id === existUser._id ? updatedUser : user
          );
          console.log(allUsers);
          setUsers(allUsers);
        } else {
          allUsers = [...allUsers, updatedUser];
          setUsers(allUsers);
        }
      });

      sk.on('listUsers', (updatedUsers) => {
        allUsers = updatedUsers;
        setUsers(allUsers);
      });

      sk.on('selectUser', (user) => {
        allMessages = user.messages;
        setMessages(allMessages);
      });
    }
  }, [socket, users, messages]);

  const selectUser = (user) => {
    allSelectedUser = user;
    setSelectedUser(allSelectedUser);

    // select the existing user and update his uread status to read
    const existUser = allUsers.find((x) => x._id === user._id);

    if (existUser) {
      allUsers = allUsers.map((x) =>
        x._id === existUser._id ? { ...x, unread: false } : x
      );

      setUsers(allUsers);
    }

    socket.emit('onUserSelected', user);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      alert('Error. Please type a message');
    } else {
      allMessages = [
        ...allMessages,
        { body: messageBody, name: userInfo.name },
      ];

      setMessages(allMessages);
      // coming from messagebody and we set it to null
      setMessageBody('');

      setTimeout(() => {
        socket.emit('onMessage', {
          body: messageBody,
          name: userInfo.name,
          isAdmin: userInfo.isAdmin,
          _id: selectedUser._id,
        });
      }, 1000);
    }
  };

  return (
    <Row>
      <Col className="support-users" md={3}>
        {
          // for checking the length if whether any user is online or not.
          users.filter((x) => x._id !== userInfo._id).length === 0 && (
            <Message>No Users Online</Message>
          )
        }

        <ListGroup>
          {
            // filter only the non-admin users or normal users.
            users
              .filter((x) => x._id !== userInfo._id)
              .map((user) => (
                <ListGroup.Item
                  key={user._id}
                  className={user._id === selectedUser._id ? 'selected' : ''}
                >
                  <button
                    className="block"
                    type="button"
                    onClick={() => {
                      selectUser(user);
                    }}
                  >
                    {user.name}
                  </button>

                  <span
                    className={
                      user.unread
                        ? 'unread'
                        : user.online
                        ? 'online'
                        : 'offline'
                    }
                  />
                </ListGroup.Item>
              ))
          }
        </ListGroup>
      </Col>

      <Col className="support-messages">
        {!selectedUser._id ? (
          <Message>Select a user to start a chat</Message>
        ) : (
          <>
            <Card>
              <Card.Title> Chat with {selectedUser.name}</Card.Title>
            </Card>
            <ListGroup
              ref={uiMessageRef}
              variant="flush"
            >
              {messages.length === 0 && <li>No Message</li>}
              <Scrollbars style={{ width: '100%', height: 300 }}>
                {messages.map((msg, i) => (
                  <ListGroup.Item key={i}>
                    <strong>{`${msg.name}: `}</strong> {msg.body}
                  </ListGroup.Item>
                ))}
              </Scrollbars>
            </ListGroup>

            <div>
              <form onSubmit={submitHandler}>
                <input
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  type="text"
                  className="mt-3"
                  placeholder="type message.."
                />
                <Button className="mt-3" type="submit">
                  Send <i className="fa fa-arrow-right" aria-hidden="true"></i>
                </Button>
              </form>
            </div>
          </>
        )}
      </Col>
    </Row>
  );
}

export default SupportScreen;
