import mongoose from "mongoose";
import dotenv from "dotenv"; // Importing dotenv to load environment variables
dotenv.config(); // Load environment variables from a .env file
import config from "config"; // Importing config for application configuration management

class MongooseConnection {
  constructor() {
    this.connection = null;
    this.uri = config.get("mongoURI"); // MongoDB connection URI
  }

  // Connect to the database
  async connect() {
    if (!this.connection) {
      try {
        this.connection = await mongoose.connect(this.uri);
        console.log("Connected to MongoDB with Mongoose");
      } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
      }
    }
    return this.connection;
  }

  // Close the Mongoose connection
  async close() {
    if (this.connection) {
      await mongoose.connection.close();
      this.connection = null;
      console.log("Mongoose connection closed");
    }
  }

  // Static method to get the singleton instance
  static getInstance() {
    if (!MongooseConnection.instance) {
      MongooseConnection.instance = new MongooseConnection();
    }
    return MongooseConnection.instance;
  }
}

export default MongooseConnection;
