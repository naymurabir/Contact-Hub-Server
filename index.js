const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


//Middleware 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cgjyfgp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const usersCollection = client.db("contactsHubDB").collection("users")

        const contactsCollection = client.db("contactsHubDB").collection("contacts")

        //------------------Users related APIs-------------------
        app.post('/users', async (req, res) => {
            const user = req.body
            const query = { email: user.email }
            const existUser = await usersCollection.findOne(query)
            if (existUser) {
                return res.send({ message: "User already exists.", insertedId: null })
            } else {
                const result = await usersCollection.insertOne(user)
                res.send(result)
            }
        })


        //------------------Contacts related APIs-------------------
        app.post('/contacts', async (req, res) => {
            const newContact = req.body
            const result = await contactsCollection.insertOne(newContact)
            res.send(result)
        })

        app.get('/allContacts', async (req, res) => {
            let query = {}
            if (req.query?.email) {
                query = { email: req.query?.email }
            }
            const result = await contactsCollection.find(query).toArray()
            res.send(result)
        })

        app.delete('/allContacts/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await contactsCollection.deleteOne(query)
            res.send(result)
        })

        app.get('/updateContact/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await contactsCollection.findOne(query)
            res.send(result)
        })

        app.put('/updateContact/:id', async (req, res) => {
            const id = req.params.id;
            const updateContact = req.body
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    name: updateContact.name,
                    contact_email: updateContact.contact_email,
                    phone: updateContact.phone,
                    address: updateContact.address,
                    image: updateContact.image
                }
            }
            console.log(updateDoc);
            const result = await contactsCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.put('/markFavorite', async (req, res) => {
            const filter = { _id: new ObjectId(req.query.id) }
            const updatedDoc = {
                $set: {
                    status: "favorite"
                }
            }
            const result = await contactsCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        app.put('/markFavorite/remove', async (req, res) => {
            const filter = { _id: new ObjectId(req.query.id) }
            const updatedDoc = {
                $set: {
                    status: "general"
                }
            }
            const result = await contactsCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("The Contact Hub server is running successfully...")
})

app.listen(port, () => {
    console.log(`The server is running on port: ${port}`);
})