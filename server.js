var express = require('express');
var app = express();
var mongoose = require('mongoose');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path =require('path');

var bodyParser = require('body-parser')



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs');

const port=3000;


var Message = mongoose.model('Message',{
  name : String,
  message : String
})

var dbUrl = 'mongodb://hanh:h%40nhkenjy1221998@funchat-shard-00-00-alt40.mongodb.net:27017,funchat-shard-00-01-alt40.mongodb.net:27017,funchat-shard-00-02-alt40.mongodb.net:27017/User?ssl=true&replicaSet=funchat-shard-0&authSource=admin&retryWrites=true'

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})


app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})


app.post('/messages', async (req, res) => {
  try{
    var message = new Message(req.body);

    var savedMessage = await message.save()
      console.log('saved');

    var censored = await Message.findOne({message:'badword'});
      if(censored)
        await Message.remove({_id: censored.id})
      else
        io.emit('message', req.body);
      res.sendStatus(200);
  }
  catch (error){
    res.sendStatus(500);
    return console.log('error',error);
  }
  finally{
    console.log('Message Posted')
  }

})

io.on('connection', () =>{
  console.log('a user is connected')
})


mongoose.connect(dbUrl , (err) => { 
    console.log('mongodb connected',err);
 })



app.get('/',(req, res)=> res.render('index'))

app.listen(port,()=>console.log(`server is running at http://localhost:${port}`))


