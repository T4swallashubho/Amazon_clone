import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import seedRouter from "./routes/seedRoutes.js";
import productsRoutes from "./routes/productRoutes.js";
import userRouter from "./routes/usersRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import path from "path";
import stripeRouter from "./routes/stripeRoutes.js";
import ExpressMongoSanitize from "express-mongo-sanitize";
import uploadRouter from "./routes/uploadRoutes.js";
import { Server } from "socket.io";
import http from "http";

// dotenv configuration. To Load Environment Variables from the process object and env object.
dotenv.config();

// connecting to the database.
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(`Connected to db.`);
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();

app.use(ExpressMongoSanitize());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/seed", seedRouter);

app.use("/api/products", productsRoutes);

app.use("/api/orders", orderRouter);

app.use("/api/users", userRouter);

app.use("/api/stripe", stripeRouter);

app.use("/api/upload", uploadRouter);

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "/frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/frontend/build/index.html"));
});

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

//port bty default if there is any or else server would be listening at opened port 5000.
const port = process.env.PORT || 5000;

const httpServer = http.Server(app);

// socket.io installation and works.
const io = new Server(httpServer, { cors: { origin: "*" } });

// users on the chatapp.
const users = [];

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    // find the user
    const user = users.find((x) => x.socketId === socket.id);

    if (user) {
      user.online = false;
      console.log("Offline", user.name);

      // if the user is admin and the admin is online.
      const admin = users.find((x) => x.isAdmin && x.online);

      // if true
      if (admin) {
        io.to(admin.socketId).emit("updateUser", user);
      }
      // else nothing to do in this event.
    }
  });

  // when the user logs in the chat app.
  socket.on("onLogin", (user) => {
    // user should be updated if exists or it's a new user.
    const updatedUser = {
      ...user,
      online: true,
      socketId: socket.id,
      messages: [],
    };

    const existUser = users.find((x) => x._id === updatedUser._id);

    if (existUser) {
      existUser.online = true;
      existUser.socketId = socket.id;
    }

    //new user
    else {
      users.push(updatedUser);
    }
    console.log("Online", user.name);

    const admin = users.find((x) => x.isAdmin && x.online);

    // if true
    if (admin) {
      io.to(admin.socketId).emit("updateUser", updatedUser);
    }

    // the the updatedUser in the chat system is admin then list all users to him.
    if (updatedUser.isAdmin) {
      io.to(updatedUser.socketId).emit("listUsers", users);
    }
  });

  // this will be emiitted by the admin.
  socket.on("onUserSelected", (user) => {
    // returns the first element
    const admin = users.find((x) => x.isAdmin && x.online);

    if (admin) {
      const existUser = users.find((x) => x._id === user._id);

      // user will definitely exist
      // emit this event to the admin room with the current user parameter.
      io.to(admin.socketId).emit("selectUser", existUser);
    }
  });

  // on messaging

  // the message by admin sent to a user will
  socket.on("onMessage", (message) => {
    if (message.isAdmin) {
      // if we find the user whom this message is directed to by the admin then
      const user = users.find((x) => x._id === message._id && x.online);
      if (user) {
        // message will be emitted to the user.
        io.to(user.socketId).emit("message", message);
        // message history of the particular user.

        user.messages.push(message);
      }
    } else {
      // if message is sent to the admin by some user
      const admin = users.find((x) => x.isAdmin && x.online);
      // if the admin is online
      if (admin) {
        io.to(admin.socketId).emit("message", message);
        const user = users.find((x) => x._id === message._id && x.online);
        user.messages.push(message);
      }
      // if the admin is not online
      else {
        // emit message to the particular user who tried to reach out to the admin.
        io.to(socket.id).emit("message", {
          name: "Admin",
          body: `Sorry I'm not online right now`,
        });
      }
    }
  });
});

// actual listening/starting the happens here.
httpServer.listen(port, () => {
  console.log(`Server is listening at the port http://localhost:${port}`);
});
