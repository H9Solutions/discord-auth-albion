import express from "express";
import cors from "cors";

import bodyParser from "body-parser";
import wada9 from "./src/bot"

const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors())
app.use(express.json())

wada9()

app.listen(3000, () => {
  console.log("Server running!")
}); 
