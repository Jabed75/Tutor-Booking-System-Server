const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])
const express = require('express')

const dotenv = require('dotenv') 
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');


dotenv.config(); 
const uri = process.env.MONGODB_URI;

const app = express();

const PORT = process.env.PORT || 5000; 

// app.use(cors())
const allowedOrigins = [
  'https://sports-arena-client.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json())

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const JWKS = createRemoteJWKSet(
new URL("http://localhost:3000/api/auth/jwks")
)

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization
  if(!authHeader){
    return res.status(401).json({ message: "Unauthorized"});
  }
 const token = authHeader.split(" ")[1]
 if(!token){
   return res.status(401).json({ message: "Unauthorized"});
 }
try{
  const {payload} = await jwtVerify(token, JWKS)
  next()
} catch (error){
  return res.status(403).json({message:"Forbidden"});
}

};

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
// middleware verifytoken likbo id er por
   



app.patch('/tutor/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
console.log(id, updatedData)
  const result = await tutorCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData }
  );
  res.json(result);
});


app.delete('/tutor/:id', async (req, res) => {
  const { id } = req.params;
  const result = await tutorCollection.deleteOne({
    _id: new ObjectId(id),
  });
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