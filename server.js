//Install express server
const express = require('express');
const path = require('path');
const https = require('https')
const request = require('request')
const queryString = require('query-string')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/'))

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.post('/hipaa/create', function(req, res){
    request.post( { 
                    headers: {'Content-Type' : 'application/json', 'Accept': 'application/json'}, 
                    url: `https://${req.body.base_url}/api/1.0/index.php/${req.body.api_url}?access_token=${req.body.access_token}`, 
                    body: req.body.form
                  }
                ,
                function(error, response, body){
                  res.status(response.statusCode).send(JSON.parse(body))
                }
    )
})

app.get('/*', function(req,res) {
    
res.sendFile(path.join(__dirname,'/dist/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 5200, () => console.log('Example app listening on port !'));