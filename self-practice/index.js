const express = require("express");
const app = express();
const PORT = 8000;

app.get('/users/:id', 
     (req, res, next) => {
          console.log('middleware-1: security check');
          next();
     },
     (req, res, next) => {
          req.usersUserId = req.params.id;
          console.log('middleware-2: attach userId');

          if (req.usersUserId === '0') {
               // VIP detected → skip rest of this stack
               return next('route');
          }

          next();
     },
     (req, res, next) => {
          // DB check user is in db
          console.log('middleware-3: check DB');
          next();
     }
);

app.get('/users/:id', (req, res, next) => {
     if (req.usersUserId !== '0') {
          console.log(`Normal user flow for ${req.usersUserId}`);
          res.send(`User ${req.usersUserId} checked in DB`);
     }
     else next('route');
})

// VIP route handler (skipped to when id === 0)
app.get('/users/:id', (req, res) => {
     console.log('VIP user detected, no DB check');
     res.send('Welcome VIP user!');
})

app.listen(PORT, console.log('Backend server is live on port => ', PORT));