const express = require('express');
const app = express();

const User = require('./models/user.js');
const userRouters = require('./routes/user.js');

const { connectMongoDb } = require('./connection.js');
const { logRequestResponse } = require('./middlewares');

require('dotenv').config();


// db name => 27017/:dbName => here youtube-practice
connectMongoDb(`${process.env.MONGO_URL}/youtube-practice`)
     .then(() => console.log("MongoDB Connected!"))
     .catch(err => console.log("CONNECTION FAILED!!", err));


// MIDDLEWARES
app.use(logRequestResponse("./logs.txt"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ extended: false }));


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
app.use('/api/users', userRouters);

app.listen(process.env.PORT, () => console.log(`Backend is live on port ${process.env.PORT}`));