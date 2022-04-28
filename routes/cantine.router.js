const express = require('express');
const router = express.Router();
const cantineController=require('../controllers/Cantine.controller')


router.get('/getCantines',cantineController.getAllCantines);
router.get('/getCantinebyId/:id',cantineController.getCantineById);
router.post('/addCantine',cantineController.createCantine);
router.delete('/deleteCantine/:id',cantineController.deleteCantine);
router.put('/editCantine/:id', cantineController.updateCantine);




module.exports=router;
