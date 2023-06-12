const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.se8uzie.mongodb.net/?retryWrites=true&w=majority`;

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
      const classCollection = client.db("summer-camp-school").collection("classes")
      const userCollection = client.db("summer-camp-school").collection("users")
      const selectedCollection = client.db("summer-camp-school").collection("selected")
      const enrolledCollection = client.db("summer-camp-school").collection("enrolled")
      
    //   Add Classes
      app.post('/classes', async (req, res) => {
          const newClass = req.body;
          const result = await classCollection.insertOne(newClass)
          res.send(result)
      })

    //   Get All classes
      app.get('/classes', async (req, res) => {
          const result = await classCollection.find().toArray();
        res.send(result)
      })


      // Get class by id
      app.get('/classes/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id:new ObjectId(id)}

        const result = await classCollection.findOne(query)
      res.send(result)
    })



    app.patch('/classes/edit/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const newName = req.body.name;
      const newPrice = req.body.price;
      const newImage = req.body.image;
      const newSeats = req.body.availableSeats;
      const updateDoc = {
      $set: {
        name: newName,
        price: newPrice,
        image: newImage,
        availableSeats: newSeats
      },
    };
      const result = await classCollection.updateOne(query, updateDoc);
      res.send(result)
  console.log(result)
    })




// Get all classes by user email
  app.get('/class',async (req,res)=>{
  const email = req.query.email;
  if(!email){
    res.send([])
  } 

  const query = {instructorEmail : email}
  const result = await classCollection.find(query).toArray()
  res.send(result)
})

    // Update Class Status
    app.patch('/classes/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const newStatus = req.body.status;
      const updateDoc = {
      $set: {
        status: newStatus
      },
    };
      const result = await classCollection.updateOne(query, updateDoc);
      res.send(result)
  
    })

    // Save new user to mogodb
     app.post('/users', async (req, res) => {
       const newUser = req.body;
       const query = {email: newUser.email}
       const isExist = await userCollection.findOne(query)
       if (isExist) {
         return res.send({ message: 'User already exist'})
       }
          const result = await userCollection.insertOne(newUser)
          res.send(result)
     })
    
    // Get All users
     app.get('/users', async (req, res) => {
          const result = await userCollection.find().toArray();
        res.send(result)
      })
    // Get instructor
    app.get('/instructor', async (req, res) => {
      const query = {role:"Instructor"}
          const result = await userCollection.find(query).toArray();
        res.send(result)
      })
    // update use role

    app.patch('/users/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const newRole = req.body.role;
      const updateRole = {
      $set: {
        role: newRole
      },
    };
      const result = await userCollection.updateOne(query, updateRole);
      res.send(result)
  
    })

    // update enrolled course
     app.patch('/enrolled/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const newEnrole = req.body.newEnrolled;
      const previousEnrolled = await classCollection.findOne(query)
      const totalEnrolled = previousEnrolled.enrolled+newEnrole;
      const updateEnrole = {
      $set: {
        enrolled: totalEnrolled
      },
    };
      const result = await classCollection.updateOne(query, updateEnrole);
      res.send(result)
       console.log(req.body)
       console.log(result)
    })

    // Add class to selection list
      app.post('/selected', async (req,res)=>{
      const query = req.body;
      const result = await selectedCollection.insertOne(query)
      res.send(result)
    }) 
  // update selected classes payment status
    app.patch('/selected/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const newStatus = req.body.paymentStatus;
  
      const updateEnrole = {
      $set: {
        paymentStatus: newStatus
      },
    };
      const result = await selectedCollection.updateOne(query, updateEnrole);
      res.send(result)
    
    })
    // Delete from selected class
    app.delete('/selected/:id',async (req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await selectedCollection.deleteOne(query)
      res.send(result)
    })
    // Add class to enrolled list
    app.post('/enrolled', async (req,res)=>{
      const query = req.body;
      const result = await enrolledCollection.insertOne(query)
      res.send(result)
    }) 

    // Get selected items
  app.get('/selected',async (req,res)=>{
  const email = req.query.email;
  if(!email){
    res.send([])
  } 

  const query = {email : email}
  const result = await selectedCollection.find(query).toArray()
  res.send(result)
})

   // Get enrolled items
   app.get('/enrolled',async (req,res)=>{
    const email = req.query.email;
    if(!email){
      res.send([])
    } 
  
    const query = {email : email}
    const result = await enrolledCollection.find(query).toArray()
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

app.get('/', (req,res)=>{
    res.send('Server runnning')
})


app.listen(port,()=>{
    console.log('app is running on the port ',port)
})