const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wvayw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("baby_lotion");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection("orders");

        //get api for all products of explore page
        app.get('/allProducts', async (req, res) => {
            const result = await productsCollection.find({}).toArray();
            res.send(result);
        })
        //get api for six products of home page
        app.get('/sixProducts', async (req, res) => {
            const result = await productsCollection.find({}).limit(6).toArray();
            res.send(result);
        })
        //get api for all products of explore page
        app.get('/singleProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
        })
    }
    finally {
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Baby Lotion!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})