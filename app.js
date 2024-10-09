import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";
import path from "path";
import cookieParser from "cookie-parser";
import ChatController from "./src/controllers/chat.controller.js";

class App {
  constructor() {
    // Initialize express application
    this.app = express();

    // Create HTTP server
    this.server = http.createServer(this.app);

    // Initialize Socket.io
    this.io = new Server(this.server, {
      cors: {
        origin: "*", // replace with your allowed origins
        methods: ["GET", "POST"],
      },
    });

    // Set up middleware
    this.setupMiddleware();

    // Initialize ChatController
    this.chatController = new ChatController(this.io);

    // Set up error handling
    this.setupErrorHandling();
  }

  setupMiddleware() {
    this.app.use(express.static(path.join(path.resolve(), "public"))); // Serve static files
    this.app.use(cookieParser()); // Cookie parser middleware
  }

  setupErrorHandling() {
    this.app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send("Something broke!");
    });
  }

  getServers() {
    return this.server;
  }
}

// Export the server if needed
export default new App().getServers();
