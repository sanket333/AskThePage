import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import routes from "./routes.js";

const app = express();
app.use(cors());
app.use(express.json());

//routes
app.use("/api", routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
