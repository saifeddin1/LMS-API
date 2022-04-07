
const { Kafka } = require('kafkajs');
const User = require('./models/user.model');
var ObjectId = require('mongodb').ObjectId;


const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092', 'localhost:9092']
  })
  
  const consumer = kafka.consumer({ groupId: 'kafka1' })
  
  
const run = async (req ,res) => {
    
    await consumer.connect()
    await consumer.subscribe({ topic: 'my-topic1'})
   
  
    await consumer.run({
     
      eachMessage: async ({ topic, partition, message }) => {
        
       
        
        const obj = JSON.parse(message.value);
        
        try{
            
              const response= await User.updateOne( {"_id": ObjectId(obj._id)}, {$set:obj}, {upsert: true})
              
              if(response){
                  console.log("Executing wihout problems...")
              }
              
                }catch(e){
                    console.log("catch : "+e)
                }
        
       
      },
    })
   
      
    }
  
  
  module.exports = run;