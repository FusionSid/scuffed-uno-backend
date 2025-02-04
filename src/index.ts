import "dotenv/config";
import http from "http";

import express from "express";
import morgan from "morgan";
import { Server } from "socket.io";

import { logger } from "./core/logger/logger";
import { errorHandler } from "./core/errors/handler";

// Import Routes
// auth
import { login } from "./core/auth/authenticate";
import { refreshTokenRoute } from "./core/auth/refresh";

// post
import { verifyUser } from "./routes/user/create/verifyUser";
import { postUser } from "./routes/user/create/postUser";

// Server
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
   cors: {
      origin: "*",
   },
});

// Middleware
app.use(morgan("dev"));
app.use(express.json());

// Use Routes
// auth
app.use("/v1/api/auth/login", login);
app.use("/v1/api/auth/refresh", refreshTokenRoute);

// get

// post
app.use("/v1/api/user", postUser);
app.use("/v1/api/user/verify", verifyUser);

import { authorizeRequest } from "./core/auth/authorize";
app.get("/test", authorizeRequest, (req, res) => {
   return res.send({ detail: "hello world", user: req.user });
});
// Index Route
app.all("/", (req, res) => {
   return res.sendStatus(200);
});

app.all("*", (req, res) => {
   return res
      .status(404)
      .send({ errorCode: 404, detail: "This route does not exist" });
});

io.on("connection", (socket) => {
   console.log(socket);
});

httpServer.listen(3000, () => {
   logger.info("API is running on port 3000");
});

app.use(errorHandler);
