import dotenv from "dotenv";
dotenv.config(); // Load environment variables
import config from "config";
import app from "./app.js";
import MongooseConnection from "./src/config/mongoose.connection.js";

const PORT = config.get("port");

app.listen(PORT, () => {
  console.log(`ChatterUp application is running on port ${PORT}`);
  const mongooseConnection = MongooseConnection.getInstance();
  mongooseConnection.connect().catch((error) => {
    console.error("Database connection error:", error);
  });
});
