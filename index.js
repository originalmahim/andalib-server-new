const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.jfdcirb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const ordersFile = client.db('TotalOrders').collection('OrdersInfos');
const WebsitSummaryFile = client.db('TotalOrders').collection('WebsitSummary');

app.get('/allordersstate', async (req, res) => {
  try {
    const result = await WebsitSummaryFile.find().toArray()
    res.send(result)
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error')
  }
})

 app.get('/orders/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const queary = { date: date };
    const result = await ordersFile.find(queary).toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/deleteorder/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: id };
    console.log(query);
    const result = await ordersFile.deleteOne(query);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.patch('/cancelled/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: id };
    const update = { $set: { status: "Cancelled" } }; 
    const options = { returnOriginal: false }; 
    const result = await ordersFile.updateOne(query, update, options);
    res.send(result)
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/', (req, res) => {
  res.send('Hello World its Bangladesh!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})