const express = require('express')

const dotenv = require('dotenv') 
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


dotenv.config(); 
const uri = process.env.MONGODB_URL;

const app = express();

const PORT = process.env.PORT || 5000; 

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db('mediqueue')
    const tutorCollection = db.collection('tutor');
    // 1-step
    const bookingCollection = db.collection("bookings")

    app.get('/tutor', async (req, res) =>{
      const result = await
       tutorCollection.find().toArray();
      res.json(result);
    })

    app.post('/tutor', async (req, res)=>{
      const tutorData = req.body
      const result = await tutorCollection.insertOne(tutorData)
   
      res.json(result); 
    });
// middleware
   
app.get('/tutor/:id', (req, res, next)=>{

}, async (req, res) => {
    const { id } = req.params;
    const result = await tutorCollection.findOne({ _id: new ObjectId(id) });
    res.json(result);
});
app.get("/booking/:userId" , async(req, res)=>{
  const{userId} = req.params
  const result = await bookingCollection.find({userId: userId}).toArray();
  res.json(result)

})
// 1-step
app.post("/booking", async (req, res) => {
  const bookingDta = req.body;
  const result = await bookingCollection.insertOne(bookingDta)
  res.json(result);
});

app.delete('/booking/:bookingId', async (req, res)=>{
  const {bookingId} = req.params
  const result = await bookingCollection.deleteOne({_id:new ObjectId(bookingId)})
  res.json(result)
})


await client.db('admin').command({ ping: 1 });
console.log('Pinged your deployment. You successfully connected to MongoDB!');


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send("Server is running fine!")
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})