import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";




const app = express();
const port = process.env.PORT || 4000;
dotenv.config();


const MongoDBStoreSession = MongoDBStore(session);


app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false })); 



const store = new MongoDBStoreSession({
  uri: process.env.MONGODB_URL,
  collection: "sessions",
});



app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


app.use(
  session({
    secret: process.env.secretKey,
    resave: false,
    saveUninitialized: true,
    store,
  })
);







if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log("DB Connection Successful!"))
    .catch((err) => console.error("DB Connection Error:", err));

  
  app.listen(port, () => {
    console.log(`Backend server is running on port ${port}!`);
  });
}


export default app;