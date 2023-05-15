const express = require('express');
const https = require("https")
require('dotenv').config()
const bodyParser = require('body-parser');
const crudHandlers = require('./handlers/comment.crud.handlers');
const fs = require('fs')

const app = express();
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}


app.use(bodyParser.json());

// CORS HEADERS MIDDLEWARE
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, apikey");
  res.header(
    'Access-Control-Expose-Headers',
    'x-access-token, x-refresh-token'
    );
    next();
});

/** 
 * GET /comments
 * Purpost: get all the comments parent comments with the child comments
 */ 
app.get("/comments", crudHandlers.getAllParentCommentsHandler )

/** 
 * POST /comments
 * Purpost: get all the comments parent comments with the child comments
 */ 
 app.post("/comments", crudHandlers.createCommentHandler)

 /**
 * DELETE /comments/:id
 * Purpose: deletes a comment with specific id
 */
app.delete('/comments/:id', crudHandlers.deleteCommentHandler)

 /**
 * PATCH /comments/:id
 * Purpose: updates a comment with specific id
 */
app.patch('/comments/:id', crudHandlers.updateCommentHandler)



const PORT = process.env.PORT || 9090

https.createServer(options, app).listen(PORT, console.log(`server runs on port ${PORT}`))


