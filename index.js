const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// test route
app.get('/', (req, res) => {
  res.send('PostFlow server running..');
});

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const db = client.db('swiftcart-db');
    const itemsCollection = db.collection('items');

    //----------API----------

    // post api
    app.post('/items', async (req, res) => {
      try {
        const item = req.body;

        if (!item || Object.keys(item).length === 0) {
          return res.status(400).json({ message: 'item is required' });
        }

        item.createdAt = new Date();
        const result = await itemsCollection.insertOne(item);
        res.status(201).json(result);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
      }
    });

    // get api
    app.get('/items', async (req, res) => {
      try {
        const result = await itemsCollection.find().sort({ createdAt: -1 }).toArray();
        res.status(200).json(result);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
      }
    });

    app.get('/items/:id', async (req, res) => {
      try {
        const { id } = req.params;

        const query = { _id: new ObjectId(id) };

        const item = await itemsCollection.findOne(query);

        if (!item) {
          return res.status(404).json({ message: 'Item not found' });
        }

        res.send(item);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
      }
    });

    // await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`SwiftCart listening on port ${port}`);
});
