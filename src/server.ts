import express from "express";
import { configEnv } from "./config/config";
import { matchRouter } from "./routes/matches";

const app = express();
app.use(express.json());
console.log("connected to server");
app.get("/health", (req, res) => {
  res.json({ message: "Health server running" });
});

app.use("/matches", matchRouter);
app.listen(configEnv.PORT, () => {
  console.log(`Server started on port: ${configEnv.PORT}`);
});
