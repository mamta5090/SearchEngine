import express from "express";
import cors from "cors";
import authRouter from "./router/authRouter.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

app.use("/api/auth",authRouter);
const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`);
})

