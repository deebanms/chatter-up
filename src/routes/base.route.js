import { Router } from "express"; // Import the Router class from Express for creating router instances

// Define a base router class to handle common routing functionality
class BaseRouter {
  constructor() {
    this.router = Router(); // Initialize the router instance
  }

  // Method to retrieve the configured router instance
  getRouter() {
    return this.router; // Return the router instance
  }

  // Method to set up error handling middleware
  handleErrors() {
    // Middleware function to handle errors in the application
    this.router.use((err, req, res, next) => {
      console.error("Error:", err.message); // Log the error message to the console for debugging

      // Send a JSON response with the error details
      res.status(err.status || 500).json({
        success: false, // Indicate that the response is unsuccessful
        message: err.message || "Internal Server Error", // Provide the error message or a generic message
      });
    });
  }
}

export default BaseRouter; // Export the BaseRouter class for use in other modules
