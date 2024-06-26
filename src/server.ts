import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { router } from "./routes/UserRoutes";
import connectDB from "./db/connection";
const app = express();
const port = 3000;
connectDB();
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.static("public"));
app.use(bodyParser.json());

//routes
app.use("/users", router);
app.get("/", (req: any, res: any) => {
  res.send("Olá, este é o meu servidor Express!\n");
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}/`);
});
