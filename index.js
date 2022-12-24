const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

//========= MIDDLEWARE =========//
app.use(express.json());
app.use(cors());

//=============DB CONNECTION =============//
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.0g8fcgm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function dbConnection() {
  try {
    await client.connect();
    console.log("DB connected");
  } catch (error) {
    success: false;
    message: "DB connection failed";
    console.log(error);
  }
}
dbConnection();

//============= make db and collection =============//
const db = client.db("emajhon-shoping"); // db name
const productsCollection = db.collection("products"); // collection name

//========= ROUTES =========//
app.get("/", (req, res) => {
  res.send({
    success: true,
    message: "server is running",
  });
});

//======gei all products======//
app.get("/products", async (req, res) => {
  const page = parseInt(req.query.page);
  const perPage = parseInt(req.query.perPage);
  const products = await productsCollection
    .find({})
    .skip(page * perPage)
    .limit(perPage)
    .toArray();
  const count = await productsCollection.estimatedDocumentCount();
  try {
    res.status(200).send({
      success: true,
      message: "products found",
      count: count,
      products: products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
});

app.post("/productsByIds", async (req, res) => {
  const ids = req.body;
  const objectIds = ids.map((id) => ObjectId(id));
  const products = await productsCollection
    .find({ _id: { $in: objectIds } })
    .toArray();

  try {
    res.status(200).send({
      success: true,
      message: "products found",
      products: products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
});

//======get single product======//

app.get("/products/:id", async (req, res) => {
  try {
    const id = req.params._id;
    const query = { _id: id };
    const products = await productsCollection.findOne(query);
    res.status(200).send({
      success: true,
      message: "product found",
      product: products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
});

//========= SERVER =========//

//===========Runing Port==========//
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
