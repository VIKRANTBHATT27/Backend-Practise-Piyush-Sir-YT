const mongoose = require('mongoose');
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 8080;

require('dotenv').config();

const allUsers = require('./MOCK_DATA.json');
const { type } = require('os');

const { ObjectId } = mongoose.Types;

// connection with mongoose
// this returns a promise
// db name => 27017/:dbName => here youtube-practice
mongoose
  .connect(`${process.env.MONGO_URL}/youtube-practice`)
  .then(() => console.log("MongoDB Connected!"))
  .catch(err => console.log("CONNECTION FAILED!!", err));

// Schema
const userSchema = new mongoose.Schema({
     first_name: {
          type: String,
          required: true
     },
     last_name: {
          type: String,
     },
     email: {
          type: String,
          required: true,
          unique: true
     },
     gender: {
          type: String,
          enum: [ "Male", "Female" ],
          required: true
     },
     job_title: {
          type: String,
     }
}, { timestamps: true });

// using schema create a model with model name as 'user'
const User = mongoose.model("user", userSchema);

// middleware -> to handle urlencoded data and json data (without this req.body = undefined)
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ extended: false }));

// CUSTOMIZATION MIDDLEWARE
app.use((req, res, next) => {
     console.log('created logs');

     const DateandTime = new Date().toLocaleString();
     const msg = (
          `${req.method} request: ${req.url}\nTime: ${DateandTime}\nIP Address: ${req.ip}\nId: ${req.query.userId || "unknown"}\n\n`
     );
     fs.appendFile('./logs.txt', msg, (err, data) => {
          next();
     });
});


//Routes
app.get('/users', async (req, res) => {
     const allDbUsers = await User.find({});

     const html = `
          <ul>
          ${allDbUsers.map((user) => `<li>${user.first_name}: ${user.email}</li>`).join('')}
          </ul>
     `;

     res.send(html);
});

//RESTAPI
app.get('/api/users', async (req, res) => {

     const allDbUsers = await User.find({});

     // console.log(req.headers);
     res.setHeader("X-backendEngineer", "VIKRANT");

     return res.json(allDbUsers);
});

app.route('/api/users/:id')
     .get( async(req, res) => {
          const Id = req.params.id;
          const user = await User.findOne({ _id: Id });

          if (!user) return res.status(404).send({ error: `no user found with id: ${Id}` });

          return res.json(user);
     })
     .patch( async (req, res) => {
          try {
               const Id = req.params.id;

               if (!ObjectId.isValid(Id)) {
                    return res.status(400).send({ msg: "Invalid request, invalid Id" });
               }

               const existingUser = await User.findOne({ _id: Id });
               if (existingUser !== null) {
                    
                    if (!req.body) return res.status(400).send({ error: 'No update data provided' });
                    
                    const updatedData = await User.findByIdAndUpdate(
                         Id,
                         { $set: req.body },
                         { new: true }
                    );

                    return res.status(200).send({ msg: "succesfully updated the user", id: Id, lastUpdated: updatedData.updatedAt.toLocaleString() });
               }
               else {
                    return res.status(404).send({ msg: "no user found in DB", id: Id });
               }
               
          } catch (err) {
               console.error('Error Occurred: ', err);
               res.status(500).json({ error: 'Internal server error' });
          }
     })
     .delete( async (req, res) => {   
          try {
               const Id = req.params.id;
     
               if (!ObjectId.isValid(Id)) {
                    return res.status(400).send({ msg: "invalid user id" });
               }

               const deletedUser = await User.findByIdAndDelete(Id);

               if (!deletedUser) return res.status(404).send({ message: 'User not found, check the Id again' });

               return res.status(200).send({ status: "successfully deleted the user" });

          } catch (err) {
               return res.status(500).send({ status: "Internal Server Error", err });
          }

          res.json({ status: "successfully deleted the user" });
     })

app.post('/api/users', async (req, res) => {
     const user = req.body;

     if ( !user || !user.first_name || !user.gender || !user.email ) {
          return res.status(400).send({ msg: 'all fields are required' });
     }

     const existingUser = await User.findOne({ email: user.email.trim().toLowerCase() });
     if (existingUser) {
          return res.status(409).send({ msg: "email Id is not unique" });
     }

     const result = await User.create({
          first_name: user.first_name.trim(),
          last_name: user.last_name.trim(),
          gender: user.gender.trim(),
          email: user.email.trim().toLowerCase(),
          job_title: user.job_title.trim()
     });

     res.status(201).send({ msg: "successfully created user", id: result._id });
});

app.listen(PORT, () => console.log(`Backend is live on port ${PORT}`));