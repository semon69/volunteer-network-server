const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000


app.use(express.json())
app.use(cors())

app.get('/', (req, res)=> {
    res.send('Volunteer Network is running')
})



const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.kyulyzl.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const worksCollection = client.db('volunteerDB').collection('works')
    const bookingsCollection = client.db('volunteerDB').collection('bookings')
    const eventsCollection = client.db('volunteerDB').collection('events')

    app.get('/works', async(req, res)=> {
        const result = await worksCollection.find().toArray()
        res.send(result)
    })

    app.get('/worksSearch/:text', async(req, res)=> {
        const searchText = req.params.text
        const query = {
            $or: [
                {title: {$regex: searchText, $options:"i"}}
            ]
        }
        console.log(searchText)
        const result = await worksCollection.find(query).toArray()
        res.send(result)
    })

    app.get('/bookings', async(req, res) => {
        let query = {}
        if(req?.query?.email){
            query = {email: req.query.email}
        }
        const result = await bookingsCollection.find(query).toArray()
        res.send(result)
    })


    app.post('/bookings', async(req, res)=> {
        const booking = req.body;
        const result = await bookingsCollection.insertOne(booking)
        res.send(result)
    })

    app.delete('/bookings/:id', async(req, res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await bookingsCollection.deleteOne(query)
        res.send(result)

    })

    app.get('/events', async(req, res)=> {
        const result = await eventsCollection.find().toArray()
        res.send(result)
    })

    app.post('/events', async(req, res)=> {
        const events = req.body;
        const result = await eventsCollection.insertOne(events)
        res.send(result)
    })






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, ()=> {
    console.log(`Volunteer network is running on port ${port}`)
})