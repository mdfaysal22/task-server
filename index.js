const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
app.use(cors());
app.use(express.json());
dotenv.config();

app.get('/', (req,res) => {
    res.send("server of Task Manager")
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.k8emzbd.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try{
        const tasks = client.db("task-manager").collection("tasks");
        app.post('/tasks', async(req, res) => {
            const task = req.body;
            const result = await tasks.insertOne(task);
            res.send(result);
        })

        app.get('/tasks', async(req, res) => {
            const query = {};
            const result = await tasks.find(query).toArray();
            res.send(result);
        })

        app.delete("/tasks/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const result = await tasks.deleteOne(query);
            res.send(result);
        })
        app.put('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const getTask = await tasks.findOne(query);
            const {complete} = getTask;
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    complete: !complete,
                },
            };
            const result = await tasks.updateOne(query, updateDoc, options);
            res.send(result);

        })


        
    }
    finally{}
}

run().catch(err => console.error);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})