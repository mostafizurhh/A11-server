const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config() /* to hide DB credential */

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`listening from port ${port}`)
})

/*--------------------
  mongoDB connection 
  -------------------*/
/* hide DB credential */
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mniec4l.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        /* create a DB in mongoDB for all services */
        const serviceCollection = client.db('dr-shihan').collection('services');

        /* to show DB's data to UI */
        /* API to get all services */
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.limit(3).toArray()
            res.send(services)
        });
        app.get('/allservices', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        });

        /* API to get a specific service/data */
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service)
        });



        /* create a DB in mongoDB for all reviews */
        const reviewCollection = client.db('dr-shihan').collection('reviews');

        /* (CREATE)create single single data from client side info */
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        /* (READ)create API to get all reviews data from DB*/
        app.get('/reviews', async (req, res) => {
            let query = {}
            /* find specific user's review with email */
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query)
            const reviews = await cursor.toArray()
            res.send(reviews)
        });

        /* (DELETE) create API to delete a specific review data from server and DB */
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        });
    }
    finally {

    }
}
run().catch(error => console.error(error))