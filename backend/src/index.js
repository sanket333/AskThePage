import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import routes from "./routes.js";

// Store page context in memory (for demo; use session/db for production)
let pageContext = "";

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Endpoint to initialize page context
app.post("/api/init", (req, res) => {
  const { page_content } = req.body;
  if (!page_content) {
    return res.status(400).json({ error: "page_content is required" });
  }
  pageContext = page_content;
  res.json({ status: "Page context stored" });
});

// Make pageContext available to controllers/services
app.locals.pageContext = () => pageContext;

//routes
app.use("/api", routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
