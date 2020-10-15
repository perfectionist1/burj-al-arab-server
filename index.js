const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();


const port = 5000;

const app = express();

app.use(cors());
app.use(bodyParser.json());


var serviceAccount = require("./react-burj-al-arab-3f9e0-firebase-adminsdk-jc5gs-9dcad6464d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://react-burj-al-arab-3f9e0.firebaseio.com"
});


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.plevr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
client.connect(err => {
  const booking = client.db("burj-al-arab").collection("hotels");
  // perform actions on the collection object
  
  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;

    booking.insertOne(newBooking)
    .then( result => {
      // console.log(result);
      res.send( result.insertedCount > 0);
    })
    console.log(newBooking);
  })

  app.get('/booking', (req, res) => {
    // console.log(req.query.email);
    // console.log(req.headers.authorization);
    const bearers = req.headers.authorization;
    if( bearers && bearers.startsWith('Bearer ')){
      const idToken = bearers.split(' ')[1];
      console.log({idToken});
      admin.auth().verifyIdToken(idToken)
      .then(function(decodedToken) {
        const tokenEmail = decodedToken.email;
        const queryEmail = req.query.email;
        console.log(tokenEmail, queryEmail);
        if(tokenEmail == req.query.email){
          booking.find({email: req.query.email})
          .toArray((err, documents) => {
            res.send(documents);
          })
        }
        // ...
      }).catch(function(error) {
        // Handle error
      });
    }

    // booking.find({email: req.query.email})
    // .toArray((err, documents) => {
    //   res.send(documents);
    // })
  })


});



// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

app.listen(process.env.PORT || port)