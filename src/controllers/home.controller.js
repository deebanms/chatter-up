class HomeController {
  // Method to render the home page
  async renderHomePage(req, res) {
    try {
      // Render the 'home' view
      res.render("chat");
    } catch (error) {
      console.log(error);
    }
  }
}

export default new HomeController();
