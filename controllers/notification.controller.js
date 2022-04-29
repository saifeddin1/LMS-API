const Notification=require('./../models/notification.model');
const factory = require('./Factory');
const firebaseAdmin=require("firebase-admin");
const serviceAccount = require("./../mup-it-75ab2-firebase-adminsdk-m4n9l-5d17513e0a.json");
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://mup-it-75ab2-default-rtdb.firebaseio.com/",
});

// const token=""



const options={
  priority:"high",
  timeToLive:60 * 60 * 24
}



module.exports.getNotifications = factory.getAll(Notification)
// module.exports.getOneNotification = factory.getOne(Notification);
module.exports.addNotification = factory.createOne(Notification);
module.exports.deleteNotification =  factory.deleteOne(Notification);
// module.exports.updateNotification  = factory.updateOne(Notification);

module.exports.sendNotification = async (req,res)=>{

    var payload = {
        notification: {
          title: req.body.title,
          body: req.body.body,
        },
      };
      var tokens=[{token:"ebiXgTBLknoM5uDC_cp4zP:APA91bFTanlDr1EfoCNDGf6_WLUEvKp4b6ow55sSBo3hm8eJj78k8__e93lIfweBYmz13rg_DscK5C3Tw9cIKiDPjUgLEPIOpiCx1qZS0E_Mhs-ve7VKlDbzQIE1xK-e3VQP8LVFOrgs",
                      niveau:"Bac IT"},
                    {token:"cp5ks42cfkAZ4CdTaGbfq9:APA91bFAHFPpz5HV97oB7M6jxEUODsVcCU1UBBnk5o8cM7J2IqxahyUjdL-sBkKRiiqiJDOCzfwii9TPp6eYTG-OpMF_MOG4RZd7q26qU4VD7hsNT0mPuzlgGrg7_jVbLFsIUZv3TN86",
                      niveau:"baclettre"}]

      for (let i=0;i<tokens.length;i++)
          if(tokens[i].niveau===req.body.niveau){
              payload.notification.title=req.body.title
              firebaseAdmin.messaging().sendToDevice(tokens[i].token,payload,options).then(function(response){
    

              }) 
              .catch(function(error){
                  console.log("error noritification firebase")
                })
                }
                else if("All"===req.body.niveau){
                  payload.notification.title=req.body.title
                  firebaseAdmin.messaging().sendToDevice(tokens[i].token,payload,options).then(function(response){
                  console.log("notification sent to ",tokens[i].token);

                  }) 
                  .catch(function(error){
                      console.log("error noritification firebase")
                    })
                    }
            
    
      return ("sentttttt")

}
