var mqtt = require('mqtt')
// var arduinoCOMPort = "/dev/ttyUSB0";
// var arduinoport = new SerialPort(arduinoCOMPort, {baudRate: 9600}).setEncoding('utf8');
var MongoClient=require('mongodb').MongoClient, assert = require('assert');;
const { Console } = require('console');
var yesterdayStart = new Date(new Date(new Date().setHours(new Date().getHours()-1,00,00 )) );
var yesterdayEnd = new Date(new Date(new Date().setHours(new Date().getHours(),00,00 )) );
var lasttime = yesterdayStart.toLocaleString('zh-hant', { timeZone: 'Asia/Taipei' })
var nowtime = yesterdayEnd.toLocaleString('zh-hant', { timeZone: 'Asia/Taipei' })
var right_fan_db,left_fan_db
const client  = mqtt.connect('mqtt://10.20.0.19')
// console.log(lasttime)
// console.log(nowtime)
// arduinoport.on("open", (err) => {  
//   console.log('serial port open'); //成功連接時印出port open
//   if(err){
//       console.log("no serial device found")//失敗時印出 device not found
//   }
// },20);
client.on('connect', function () {
    client.subscribe('rpi_left');
    client.subscribe('rpi_right');
    client.subscribe('Storage_data')
  });
client.on('message', function (topic, message){
switch(topic) {
    case 'rpi_left':
    // console.log(message)
    Arduno_data = JSON.parse(message);
    Sensor_data = Object.values(Arduno_data)
    Sensor_key = Object.keys(Arduno_data)
    // console.log(Sensor_key)
    // console.log(Sensor_data)  
  for(var i=0 ; i<Sensor_key.length;i++){
    switch (Sensor_key[i]) {
      case 'CO2':
        // console.log(Sensor_data[i])
        client.publish('CO2_left', JSON.stringify(Sensor_data[i]))
        // Sensor_data[i]
        break;
      case 'TVOC':
        // console.log(Sensor_data[i])
        client.publish('TVOC_left', JSON.stringify(Sensor_data[i]))
        break;
      case 'Temperature':
        // console.log(Sensor_data[i])
        client.publish('tempareture_left', JSON.stringify(Sensor_data[i]))
        break;
      case 'Humidity':
        // console.log(Sensor_data[i])
        client.publish('humid_left', JSON.stringify(Sensor_data[i]))
        break;
      case '風扇1':
        let fan_data = [Sensor_data[i],Sensor_data[i+1]]
        // console.log(fan_data)
        client.publish('7F_FAN',JSON.stringify(fan_data))
      default:
        // console.log('pass');
      
    }
    
    let udate = new Date();
    let time = udate.toLocaleString('zh-hant', { timeZone: 'Asia/Taipei' })
    // console.log('connection success')
    // console.log(time)
    left_fan_db.collection('data',async function(err,collection){
        var db_table = left_fan_db.collection(Sensor_key[i])
        db_table.insertOne({ time:time, name:Sensor_key[i], data:Sensor_data[i] });
    });
    }
    break;
    case 'rpi_right':
        // console.log(message)
        Arduno_data = JSON.parse(message);
        Sensor_data = Object.values(Arduno_data)
        Sensor_key = Object.keys(Arduno_data)
        // console.log(Sensor_key)
        // console.log(Sensor_data)  
      for(var i=0 ; i<Sensor_key.length;i++){
        switch (Sensor_key[i]) {
          case 'CO2':
            // console.log(Sensor_data[i])
            client.publish('CO2_right', JSON.stringify(Sensor_data[i]))
            // Sensor_data[i]
            break;
          case 'TVOC':
            // console.log(Sensor_data[i])
            client.publish('TVOC_right', JSON.stringify(Sensor_data[i]))
            break;
          case 'Temperature':
            // console.log(Sensor_data[i])
            client.publish('tempareture_right', JSON.stringify(Sensor_data[i]))
            break;
          case 'Humidity':
            // console.log(Sensor_data[i])
            client.publish('humid_right', JSON.stringify(Sensor_data[i]))
            break;
          case '風扇3':
            let fan_data2 = [Sensor_data[i],Sensor_data[i+1]]
            // console.log(fan_data2)
            client.publish('7F_FAN_2', JSON.stringify(fan_data2))
          default:
            // console.log('pass');
          
        }
        let udate = new Date();
        let time = udate.toLocaleString('zh-hant', { timeZone: 'Asia/Taipei' })
        // console.log('connection success')
        right_fan_db.collection('data',async function(err,collection){
            var db_table = right_fan_db.collection(Sensor_key[i])
            db_table.insertOne({ time:time, name:Sensor_key[i], data:Sensor_data[i] });
        });
        }
    break;
    case 'Storage_data':
      console.log(message)
      Arduno_data = JSON.parse(message);
      Sensor_data = Object.values(Arduno_data)
      Sensor_key = Object.keys(Arduno_data)
      console.log(Sensor_key)
      console.log(Sensor_data)
      client.publish('Storage',JSON.stringify(Sensor_data))  
    for(var i=0 ; i<Sensor_key.length;i++){
      let udate = new Date();
      let time = udate.toLocaleString('zh-hant', { timeZone: 'Asia/Taipei' })
      // console.log('connection success')
      Storage_data_db.collection('data',async function(err,collection){
          var db_table = Storage_data_db.collection(Sensor_key[i])
          db_table.insertOne({ time:time, name:Sensor_key[i], data:Sensor_data[i] });
      });
      }
    break;
  }
})
MongoClient.connect("mongodb://127.0.0.1:27017", function(err,client){
if(err){
    console.log(err);
    console.log('connecting fail');
    return;
}
console.log('connecting');
left_fan_db = client.db('rpi_left')
right_fan_db = client.db('rpi_right')
Storage_data_db = client.db('Storage_data')
})
// setInterval(function(){
// arduinoport.write('g')
// },5000)
