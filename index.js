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
        const usersCollection = database.collection("users");
        const ordersCollection = database.collection("orders");
        const reviewsCollection = database.collection("reviews");

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
        //get api for single products
        app.get('/singleProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
        })
        //get api for my orders
        app.get("/myOrders/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await ordersCollection.find(query).toArray();
            res.send(result);
        });
        //get api for manage all orders
        app.get('/manageAllOrders', async (req, res) => {
            const result = await ordersCollection.find({}).toArray();
            res.send(result);
        })
        //get api for all reviews
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find({}).toArray();
            res.send(result);
        })
        //get api to check admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })
        //post api for reviews
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        })
        //post api for products
        app.post('/addProducts', async (req, res) => {
            console.log(req.body)
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        })
        //post api for orders
        app.post('/addOrders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })
        //post api for usersCollection
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        })
        //update api for users
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })
        //update api to make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)
        })
        //delete api for cancellig my order
        app.delete('/deleteMyOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        })
        //delete api for deleting order by admin
        app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        })
        //delete api for deleting product by admin
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        })
        //update api for product
        app.put('/updateProduct', async (req, res) => {
            const product = req.body;
            const filter = { _id: ObjectId(product._id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: product.name,
                    quantity: product.quantity,
                    price: product.price,
                    description: product.description,
                    image: product.image
                }
            };
            const result = await productsCollection.updateOne(filter, updateDoc, options);
            console.log(result)
            res.json(result)
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