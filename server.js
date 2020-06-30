let express = require('express');
let app = express();
let server = app.listen(3000, console.log("socket server on"));
let io = require('socket.io')(server);
let fs = require('fs');
let ip = JSON.parse(fs.readFileSync('user_info.json', 'utf-8'));

let ipValue;
let arr1_name = ['용맹한','비겁한','날뛰는','변절한','광기의','더러운','아름다운','타락한','승리의','저주 받은'];
let arr2_name = ['아서스','리치왕','스랄','말퓨리온','실바나스','데스윙','전승지기 초','제이나','말리고스','라그나로스','일리단','밀하우스'];




app.get('/',function(req, res){

  ipValue = req.headers['x-forwarded-for'] ||
  req.connection.remoteAddress ||
  req.socket.remoteAddress ||
  (req.connection.socket ? req.connection.socket.remoteAddress : null);
  console.log(ipValue + "에서 접속");
  if(ip.hasOwnProperty(ipValue)){
    console.log("전에 접속했던 사람.")

  }else{
    console.log("처음 접속한 사람.")
    ip[ipValue] = arr1_name[getRndInteger(0,arr1_name.length-1)] +" "+  arr2_name[getRndInteger(0,arr2_name.length-1)];
    fs.writeFile('user_info.json',JSON.stringify(ip,null,2),'utf-8',function(err){
      if (err) throw err;
    });

  }

  res.sendFile(__dirname+'/client.html');

});



io.on('connection',function(socket){


  console.log('user connected: ',socket.id);
  let name = ip[ipValue];

  io.emit('init name',name);


  socket.on('disconnect',function(){

    console.log('user disconnected: ',socket.id);
  });

  socket.on('send message', function(name,text,col,origin_name){

    origin_name = ip[ipValue];
    if(origin_name !== name){
      console.log("아이디변경");
      ip[ipValue] = name;
      fs.writeFileSync('user_info.json',JSON.stringify(ip,null,2),'utf-8',function(err){
        if (err) throw err;
      });
    }

    console.log(text,col);
    io.emit('receive message', text, col, name, origin_name);
  });
});

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}
