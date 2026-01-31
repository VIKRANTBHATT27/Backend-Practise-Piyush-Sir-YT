const { nanoid } = require('nanoid');
const urlModel = require('../models/url');

const handleGenerateShortUrl = async (req, res) => {
     if (!req.body || Object.keys(req.body).length === 0)
          return res.status(400).json({ err: 'no data is provided' });

     const { url } = req.body;
     if (!url) return res.status(400).json({ err: `no url provided in the request's body` });

     try {
          new URL(url);
     } catch (e) {
          return res.status(400).json({ err: 'invalid URL' });
     }

     // check if exists or not 
     try {
          const redirectingUrl = url[url.length-1] != '/' ? url + '/' : url;
          const response = await urlModel.findOne({ redirectingUrl });
          
          if (response !== null) {
               return res.status(200).json(
                    {
                         msg: "URL already exists in DB",
                         id: response.shortId,
                         link: `http:localhost:${process.env.PORT}/${response.shortId}`
                    }
               );
          }

     } catch (err) {
          console.log(err);
          return res.status(500).json({ err: 'internal server error' });
     }

     const shortId = nanoid(10);
     try {
          const response = await urlModel.insertOne({
               shortId,
               redirectingUrl: url[url.length - 1] != '/' ? url + '/' : url,
               visitHistory: []
          });

          return res.status(200).json(
               {
                    msg: "new document created",
                    id: shortId,
                    link: `http:localhost:${process.env.PORT}/${response.shortId}` 
               }
          );
     } catch (err) {
          console.log(err);
          return res.status(500).json({ err: 'internal server error' });
     }
};

const handleRedirectingUrl = async (req, res) => {
     const URL = req.params.url;

     try {
          const result = await urlModel.findOneAndUpdate(
               { shortId: URL },
               {
                    $push: {
                         visitHistory: { timestamps: new Date().toString() }
                    }
               }
          );

          if (result === null) return res.status(400).json({ msg: 'invalid short Id' });
          else return res.redirect(result.redirectingUrl);
     } catch (err) {
          console.log(err);
          return res.status(500).json({ err: 'internal server error' });
     }
};

const handleGetAnalytics = async (req, res) => {
     const shortId = req.params.shortId;

     // check and get document in DB
     try {
          const document = await urlModel.findOne({ shortId });
          
          if (document === null) return res.status(400).json({ msg: 'wrong shortId provided' });
          return res.status(200).json({
               clicks: document.visitHistory.length,
               analytics: document.visitHistory
          });
     } catch (error) {
          console.log(error);
          return res.status(500).json({ err: 'internal server error' });
     }
};

module.exports = {
     handleGenerateShortUrl,
     handleRedirectingUrl,
     handleGetAnalytics
}