import BaseRouter from "./base.route.js"; // Import the base router class for routing functionality
import homeController from "../controllers/home.controller.js"; // Import the home controller for handling home page requests

// Define a class for home-related routes, extending from BaseRouter
class HomeRoutes extends BaseRouter {
  constructor() {
    super(); // Call the constructor of the base router class to initialize the router
    this.initializeRoutes(); // Set up the routes specific to home-related functionality
  }

  // Method to define and initialize home-related routes
  initializeRoutes() {
    // GET route to render the home page
    this.router.get(
      "/", // Path for the home page
      homeController.renderHomePage // Controller method to handle the request and render the home page
    );
  }
}

// Export an instance of HomeRoutes and get the configured router
export default new HomeRoutes().getRouter();
