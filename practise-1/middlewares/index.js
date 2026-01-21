const fs = require("fs");

function logRequestResponse(filename) {
     return (req, res, next) => {
          console.log('created logs');

          const DateandTime = new Date().toLocaleString();
          const msg = (
               `${req.method} request: ${req.url}\nTime: ${DateandTime}\nIP Address: ${req.ip}\nId: ${req.query.userId || "unknown"}\n\n`
          );
          fs.appendFile(filename, msg, (err, data) => {
               next();
          });
     };
};

module.exports = {
     logRequestResponse
};