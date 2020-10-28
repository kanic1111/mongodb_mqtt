var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://127.0.0.1:1883')
const Readline = require('@serialport/parser-readline')
var SerialPort = require("serialport");
const parser = new Readline()
var arduinoCOMPort = "/dev/ttyUSB0";
var arduinoport = new SerialPort(arduinoCOMPort, {baudRate: 9600}).setEncoding('utf8');
var MongoClient=require('mongodb').MongoClient, assert = require('assert');;
const { Console } = require('console');
var yesterdayStart = new Date(new Date(new Date().setHours(new Date().getHours()-1,00,00 )) );
var yesterdayEnd = new Date(new Date(new Date().setHours(new Date().getHours(),00,00 )) );
var lasttime = yesterdayStart.toLocaleString('zh-hant', { timeZone: 'Asia/Taipei' })
var nowtime = yesterdayEnd.toLocaleString('zh-hant', { timeZone: 'Asia/Taipei' })
var db_client
console.log(lasttime)
console.log(nowtime)
arduinoport.on("open", (err) => {  
  console.log('serial port open'); //成功連接時印出port open
  if(err){
      console.log("no serial device found")//失敗時印出 device not found
  }
},20);
arduinoport.pipe(parser)
parser.on('data', line =>{
  console.log(line)
  Arduno_data = JSON.parse(line);
  Sensor_data = Object.values(Arduno_data)
  Sensor_key = Object.keys(Arduno_data)
  console.log(Sensor_key)
  console.log(Sensor_data)
  for(var i=0 ; i<Sensor_key.length;i++){
    switch (Sensor_key[i]) {
      case 'CO2':
        console.log(Sensor_data[i])
        client.publish('CO2', JSON.stringify(Sensor_data[i]))
        // Sensor_data[i]
        break;
      case 'TVOC':
        console.log(Sensor_data[i])
        client.publish('TVOC', JSON.stringify(Sensor_data[i]))
        break;
      case 'tempareture':
        console.log(Sensor_data[i])
        client.publish('tempareture', JSON.stringify(Sensor_data[i]))
        break;
      case 'humid':
        console.log(Sensor_data[i])
        client.publish('humid', JSON.stringify(Sensor_data[i]))
        break;
      case '風扇1':
        console.log(Sensor_data[i]+Sensor_data[i+1])
        client.publish('7F_FAN',JSON.stringify(Sensor_data[i],Sensor_data[i+1]))
      case '風扇3':
        console.log(Sensor_data[i])
        client.publish('7F_FAN2', JSON.stringify(Sensor_data[i],Sensor_data[i+1]))
      default:
        console.log('pass');
    }
    let udate = new Date();
    let time = udate.toLocaleString('zh-hant', { timeZone: 'Asia/Taipei' })
    // console.log('connection success')
    db_client.collection('data',async function(err,collection){
        var db_table = db_client.collection(Sensor_key[i])
        db_table.insertOne({ time:time, name:Sensor_key[i], data:Sensor_data[i] });
    });
}

})
MongoClient.connect("mongodb://127.0.0.1:27017/test", function(err,client){
if(err){
    console.log(err);
    console.log('connecting fail');
    return;
}
console.log('connecting');
db_client = client.db('data_test')
})
setInterval(function(){
arduinoport.write('g')
},5000)