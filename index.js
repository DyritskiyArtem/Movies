require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = process.env.URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

client.connect();

// async function run() {
//   try {
//     await client.connect();
//     const db = client.db("sample_mflix");
//     const collection = db.collection("users"); 

//     const findResult = await collection.find({name}).toArray();
//     console.log('Found documents =>', findResult);
//   } finally {
//     // await client.close();
//   }
// }
// run().catch(console.dir);

const app = express();
const port = 2000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/films", async (req, res) => {
  const db = client.db("movies_db");
  const collection = db.collection("movies");

  const films = await collection.find().toArray();
  res.json(films);
});

app.get('/filmsWithName', async (req, res) => {
  const db = client.db("movies_db");
  const collection = db.collection("movies");

  const {name} = req.query;

  if (!name) {return res.json({ error: 'Невказано назву фільму' });}

  const filteredFilms = await collection.find({ name: name }).toArray();
  res.json(filteredFilms);
});

app.delete('/filmsWithName', async (req, res) => {
  const db = client.db("movies_db");
  const collection = db.collection("movies");

  const {name} = req.query;

  if (!name) {return res.json({ error: 'Невказано назву фільму' });}

  const deleteResult = await collection.deleteMany({name: name});
  res.status(200).json({ message: `Фільм видалено ${deleteResult.deletedCount}` });
});

app.get('/filmsWithYear', async (req, res) => {
  const db = client.db("movies_db");
  const collection = db.collection("movies");

  const {year} = req.query;
  if (!year) {
    return res.json({ error: 'Невказано рік фільму' });
  }

  const filteredYear = await collection.find({ year: +year }).toArray();
  res.json(filteredYear);
});

app.delete('/filmsWithYear', async (req, res) => {
  const db = client.db("movies_db");
  const collection = db.collection("movies");

  const {year} = req.query;

  if (!year) {return res.json({ error: 'Невказано рік фільму' });}

  const deleteResult = await collection.deleteMany({year: +year});
  res.status(200).json({ message: `Фільм видалено ${deleteResult.deletedCount}` });
});

app.post('/films', async (req, res) => {
  const { name, year, genre } = req.body;

  if (!name) return res.status(400).json({ error: "Невказано назву фільма" });
  if (typeof name !== "string") return res.status(400).json({ error: "Вкажіть назву" });
  if (!year) return res.status(400).json({ error: "Невказано рік виходу фільма" });
  if (typeof year !== "number") return res.status(400).json({ error: "Вкажіть рік числом" });
  if (!genre) return res.status(400).json({ error: "Невказано жанр фільму" });
  if (typeof genre !== "string") return res.status(400).json({ error: "Вкажіть жанр" });

  const db = client.db("movies_db");
  const collection = db.collection("movies");

  const insertResult = await collection.insertMany([{name, year, genre}]);
  res.status(200).json({ message: `Фільм прийнято ${insertResult.insertedCount}`});
});

app.put('/films', async (req, res) => {
  const { name, year, genre, id } = req.body;

  if (id === undefined) return res.status(400).json({ error: "Вкажіть ID" });
  if (typeof name !== "string" && name !== undefined) return res.status(400).json({ error: "Вкажіть назву" });
  if (typeof year !== "number" && year !== undefined) return res.status(400).json({ error: "Вкажіть рік числом" });
  if (typeof genre !== "string" && genre !== undefined) return res.status(400).json({ error: "Вкажіть жанр" });

  const db = client.db("movies_db");
  const collection = db.collection("movies");

  const updatedObject = {};
  if (name !== undefined) {updatedObject.name = name;}
  if (year !== undefined) {updatedObject.year = year;}
  if (genre !== undefined) {updatedObject.genre = genre;}

  const updateResult = await collection.updateOne({ _id:  new ObjectId(id) }, { $set: updatedObject });
  res.status(200).json({ message: `Фільм відредаговано ${updateResult.modifiedCount}` });
});

app.delete('/films', async (req, res) => {
  const {id} = req.body;

  if (id === undefined) return res.status(400).json({ error: "Невказано ID" });

  const db = client.db("movies_db");
  const collection = db.collection("movies");

  const deleteResult = await collection.deleteMany({_id: new ObjectId(id)});
  console.log(deleteResult);

  res.status(200).json({ message: `Фільм видалено ${deleteResult.deletedCount}` });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});