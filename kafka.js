
const { Kafka } = require('kafkajs');
const User = require('./models/user.model');
var ObjectId = require('mongodb').ObjectId;


const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092', 'localhost:9092']
  })
  
  const consumer = kafka.consumer({ groupId: 'kafka' })
  
  
const run = async (req ,res) => {
    
    await consumer.connect()
    await consumer.subscribe({ topic: 'test', fromBeginning: true })
  
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        // console.log({
        //   partition,
        //   offset: message.offset,
        //   value: message.value,
        
        // })
       
        
        const obj = JSON.parse(message.value);
        console.log(obj)
        try{
            //const user = await User.findOne({email: obj.email});
           // if(user){
              //   if(obj.enabled == false){
              //       user.enabled = false;
              //       await user.save();
              //       console.log("successfully updated")
              //   }else{
              const response= await User.updateOne( {"_id": ObjectId(obj._id)}, {$set:obj}, {upsert: true})
              
              if(response){
                  console.log("send message successfully...")
              }
              
                }catch(e){
                    console.log("catch : "+e)
                }
          //  }
       
      },
    })
   
      
    }
  
  
  module.exports = run;