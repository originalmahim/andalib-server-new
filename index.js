const axios = require('axios');
const express = require('express');
const app = express();
const cors = require('cors');
const FormData = require('form-data');
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


 app.get('/orders', async (req, res) => {
  try {
    const result = await ordersFile.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.post('/orders', async (req,res) => {
  try {
        const newOrder = req.body;
        const result = await ordersFile.insertOne(newOrder);
        res.send(result)
  } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
  }
});

 app.get('/orders/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const queary = { date: date };
    const result = await ordersFile.find(queary).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/deleteorder/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    console.log(query);
    const result = await ordersFile.deleteOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/singleitem/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await ordersFile.findOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.patch('/cancelled/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const update = { $set: { status: "Cancelled" } }; 
    const options = { returnOriginal: false }; 
    const result = await ordersFile.updateOne(query, update, options);
    res.send(result)
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});
app.patch('/pending/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const update = { $set: { status: "Pending" } }; 
    const options = { returnOriginal: false }; 
    const result = await ordersFile.updateOne(query, update, options);
    res.send(result)
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});
app.patch('/delivered/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const update = { $set: { status: "Shipped" } }; 
    const options = { returnOriginal: false }; 
    const result = await ordersFile.updateOne(query, update, options);
    res.send(result)
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});


// app.post("/payment", async(req, res)=>{

//   const { full_name, email, amount , orderedData } = req.body;

//   const options = {
//       method: 'POST',
//       url: 'https://sandbox.uddoktapay.com/api/checkout-v2',
//       headers: {
//           'Accept': 'application/json',
//           'RT-UDDOKTAPAY-API-KEY': '982d381360a69d419689740d9f2e26ce36fb7a50',
//           'Content-Type': 'application/json'
//       },
//       data: {
//           full_name,
//           email,
//           amount,
//           metadata: orderedData,
//           redirect_url: 'https://itsok.andalib.xyz/thankyou/bb',
//           cancel_url: 'https://itsok.andalib.xyz/Payment/Cancelled',
//           webhook_url: '',
//           return_type:'GET'
//       }
//   };
//   axios.request(options)
//   .then(function (response) {
//     res.json(response.data);
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     console.error(error);
//   });
//   }
//   )


app.post("/payment", async (req, res) => {
  const { cus_name, cus_email, amount, orderedData } = req.body;

  const options = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://pay.walletmaxpay.com/checkout/payment/create',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded', 
      'app-key': 'Sandbox12345', 
            'client-key': 'sandbox1234567', 
             'client-secret': 'sandbox123456789', 
            'client-position': 'sandbox.rentcpanel.com', 
            'Cookie': '',
      'success_url': 'https://itsok.andalib.xyz/thankyou/bb',
      'cancel_url': 'https://itsok.andalib.xyz/Payment/Cancelled'
    },
    data: new URLSearchParams({
      cus_name,
      cus_email,
      amount,
      'orderedData': JSON.stringify(orderedData),
      'success_url': 'https://itsok.andalib.xyz/thankyou/bb',
      'cancel_url': 'https://itsok.andalib.xyz/Payment/Cancelled'
    }).toString()
  };

  try {
    const response = await axios.request(options);
    res.json(response.data);
    console.log(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the payment.' });
  }
});

 app.post('/verify-payment', async (req, res) => {
    const invoice_id = req.query.invoice_id
    try {
        const options = {
            method: 'POST',
            url: 'https://sandbox.uddoktapay.com/api/verify-payment',
            headers: {
                'Accept': 'application/json',
                'RT-UDDOKTAPAY-API-KEY': '982d381360a69d419689740d9f2e26ce36fb7a50',
                'Content-Type': 'application/json'
            },
            data: {
                invoice_id
            }
        };

        const response = await axios.request(options);
        
        res.json(response.data);
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ status: 'ERROR', message: 'Error verifying payment' });
    }
});


app.get('/', (req, res) => {
  res.send('Hello World its Bangladesh!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})