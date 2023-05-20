require('dotenv').config()
const express= require('express');
const cors= require('cors');
const app= express();
const port= process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.em3fb5a.mongodb.net/?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());


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
    const toyCollection = client.db("toyCollection");
    const toys = toyCollection.collection("toys");


    app.get('/mytoys',async(req,res)=>{
      const email= req.query.email;
      const sort_by= req.query.sort;
      const query = { sellerEmail: email };
      const cursor = await toys.find(query).sort({price:sort_by}).toArray();
      res.send(cursor)
     }) 

     app.get('/toysbycat/:cat',async(req,res)=>{
      const cat= req.params.cat;
      const query = { category: cat };
      const cursor = await toys.find(query).toArray();
      res.send(cursor)
     }) 
   
   app.get('/details/:id',async(req,res)=>{
    const id= req.params.id;
    const query = { _id: new ObjectId(id) };
    const data = await toys.findOne(query);
    res.send(data)
   }) 

    app.get('/search',async(req,res)=>{
      const text= req.query.search;
      const cursor= await toys.find({ tname: { $regex: text, $options: 'i' } });
      const data=await cursor.toArray();
      res.send(data);
      
      
    })

    app.post('/addtoy',async(req,res)=>{
    const data=req.body
    const result = await toys.insertOne(data);
    res.send(result.acknowledged)
  });

  app.post('/updatetoy',async(req,res)=>{
    const data=req.body;
    const filter = { _id: new ObjectId(data.id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        tname: data.tname,
        quantity: data.quantity,
        price: data.price,
        desc: data.desc
      },
    };

    const result = await toys.updateOne(filter, updateDoc, options);

    res.send(result)
    
  });

  app.delete('/deletetoy/:id',async(req,res)=>{
    const id=req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await toys.deleteOne(query);
    res.send(result)
   
    
    
  });

  app.get('/alltoy',async(req,res)=>{
   const cursor = toys.find();
   const data= await cursor.toArray();
    res.send(data);
  })

  app.get('/alltoywithlim',async(req,res)=>{
    const limit=parseInt(req.query.limit) || 2;
    const page=parseInt(req.query.page) || 1 ;
    const skip=(page-1)*limit
   const cursor = toys.find().limit(limit).skip(skip);
   const data= await cursor.toArray();
    res.send(data);
  })

  app.get('/mytoywithlim',async(req,res)=>{
    const limit=parseInt(req.query.limit) || 2;
    const page=parseInt(req.query.page) || 1 ;
    const email=parseInt(req.query.email);
    const query = { sellerEmail: email };
    const skip=(page-1)*limit
   const cursor = toys.find(query).limit(limit).skip(skip);
   const data= await cursor.toArray();
    res.send(data);
  })
   
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
   //await client.close();
  }
}
run().then(()=>{
  app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`)
})

}).catch(console.dir);

app.get('/',(req,res)=>{
    res.send('Backend is Running');

});

