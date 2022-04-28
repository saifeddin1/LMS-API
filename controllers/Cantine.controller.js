const Cantine=require('../models/Cantine.model');
const factory = require('./Factory');

exports.getAllCantines = factory.getAll(Cantine)
exports.getCantineById = factory.getOne(Cantine);
exports.createCantine = factory.createOne(Cantine);
exports.deleteCantine =  factory.deleteOne(Cantine);
exports.updateCantine  = factory.updateOne(Cantine);

