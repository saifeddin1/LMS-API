const express = require('express');
const router = express.Router();
const notificationsController=require('../controllers/notification.controller')


router.get('/getNotifications',notificationsController.getNotifications);
// router.get('/VC/getBotification/:id',notificationsController.getOneNotification);
router.post('/addNotification',notificationsController.addNotification);
router.delete('/deleteNotification/:id',notificationsController.deleteNotification);
// router.put('/VC/editNotification/:id', notificationsController.updateNotification);
router.post('/sendNotification',notificationsController.sendNotification);


module.exports=router;
