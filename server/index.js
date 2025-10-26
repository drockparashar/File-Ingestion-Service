import express from "express";
import cors from "cors";
import uploadRouter from "./routes/uploadRoutes.js";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "API is running ...." });
});

app.use("/upload", uploadRouter);

app.listen(5000, () => console.log("App is running on prot: 50000"));
