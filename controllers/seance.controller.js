let Seance = require("../models/seance.model");
let SeanceNiv = require("../models/seanceNiv.model");
const { connection } = require('../connection');
const ObjectId = require('mongoose').Types.ObjectId;
const { ADMIN, STUDENT, INSTRUCTOR } = require("../constants/roles.constant");
let OffreModel = require("../models/offre.model");
connection.once("open", () => {
  console.log("*** SEANCE CONTROLLER ***");
});

const CalendarView = {
  Month: "month",
  Week: "week",
  Day: "day"
}

/**
 * GET all seances
 * @return all seances
 */
exports.getAll = async (req, res) => {
  try {
    console.log("getAll")
    const { page, limit, text } = req.query;
    var pageNumber = 0;
    var limitNumber = 10;
    var pageText = "";
    if (page) pageNumber = Number(page);
    if (limit) limitNumber = Number(limit);
    if (text && text != ""
      && text != undefined
      && text != "undefined"
      && text != null
      && text != "null") pageText = text;
    console.log("pageText : ", pageText);
    console.log("req.query : ", { page, limit });
    Seance.aggregate([
      {
        '$match': text && text != "" ? {
          '$or': [
            { 'name': { '$regex': text.trim(), '$options': 'i' } },
            { 'description': { '$regex': text.trim(), '$options': 'i' } },
          ]
        } : {},
      },
      {
        '$facet': {
          'totalData': [
            {
              '$sort': { '_id': -1 }
            },
            {
              '$skip': Math.floor(pageNumber * limitNumber),
            },
            {
              '$limit': limitNumber,
            },
          ],
          'totalCount': [
            {
              '$count': 'count',
            },
          ],
        },
      },
      {
        '$unwind': {
          'path': '$totalCount',
          'preserveNullAndEmptyArrays': false
        }
      }
    ])
      .then((seances) => {
        res.json(seances && seances.length ? seances[0] : null)
      })
      .catch((err) => res.status(400).json(`Error: ${err}`));
  } catch (error) {
    console.error({ 'service': "seance.controller.js", 'method': this.getAll.name, 'type': "Error", 'error': error })
  }
};

/**
 * GET all seances for student
 * @return seances[] 
 */
exports.getAllByNivMat = async (req, res) => {
  console.log("getAllByNivMat")
  const { user } = req
  var { viewType } = req.query
  var { viewDate } = req.params

  if (!viewType) viewType = CalendarView.Month
  var dateQuery = {
    startDate: null,
    endDate: null,
  }
  switch (viewType) {
    case CalendarView.Day:
      // start of the day
      dateQuery.startDate = new Date(new Date(viewDate).setUTCHours(0, 0, 0, 0));
      // end of the day
      dateQuery.endDate = new Date(new Date(viewDate).setUTCHours(23, 59, 59, 999));
      break;
    case CalendarView.Week:
      var curr = new Date(viewDate); // get current date
      const start = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
      const end = start + 6; // last day is the first day + 6
      // assign dates
      dateQuery.startDate = new Date(curr.setDate(start));
      dateQuery.endDate = new Date(curr.setDate(end));
      break;
    case CalendarView.Month:
    default:
      var date = new Date(viewDate);
      dateQuery.startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      dateQuery.endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      break;
  }
  if (user.type == STUDENT && user.studentOffreId) {
    console.log("user.type == STUDENT");
    const offre = await OffreModel.findById(user.studentOffreId)
    if (offre) {
      console.log("offre :", offre);
      if (!offre.withLive) {
        res.status(403).json({ code: "WITHLIVE" })
      }
    }
  } else if (user.type == STUDENT && !user.studentOffreId) {
    return []
  }
  console.log("dateQuery :", dateQuery);
  dateQuery = {
    '$match': {
      '$expr': {
        '$and': [
          { $gte: [{ $toDate: '$seance.startDate' }, dateQuery.startDate] },
          { $lte: [{ $toDate: '$seance.endDate' }, dateQuery.endDate] }
        ]
      }
    }
  }
  var sNivQuery = {}
  var seanceQuery = [{ '$eq': ['$_id', '$$id'] }]
  if (user && user.type == STUDENT && user.studentNiveauId) {
    sNivQuery = {
      'niveauId': user.studentNiveauId ? new ObjectId(user.studentNiveauId) : "",
    }
  } else if (user && user.type == INSTRUCTOR) {
    seanceQuery.push({ '$eq': ['$userId', new ObjectId(user._id)] })
  }
  var instructorUrlRestriction = []
  if (user && user.type == STUDENT) {
    instructorUrlRestriction = [{ '$unset': "urlAuthInstructor" }]
  }
  console.log("Building aggregation ...")
  const aggregation = [
    {
      '$match': sNivQuery
    },
    {
      '$lookup': {
        'from': 'seances',
        'let': {
          'id': '$seanceId'
        },
        'pipeline': [
          {
            '$match': {
              '$expr': {
                '$and': seanceQuery
              }
            }
          },
          ...instructorUrlRestriction,
          {
            '$lookup': {
              'from': 'seancenivs',
              'pipeline': [
                { '$match': { '$expr': { '$eq': ['$seanceId', '$$id'] } } },
                {
                  '$lookup': {
                    'from': 'niveaus',
                    'let': { 'niveauId': '$niveauId' },
                    'pipeline': [
                      { '$match': { '$expr': { '$eq': ['$_id', '$$niveauId'] } } },
                      { '$project': { 'name': 1 } }
                    ],
                    'as': 'niveau'
                  }
                },
                { '$unwind': { 'path': '$niveau' } },
                { '$project': { 'name': "$niveau.name" } }
              ],
              'as': 'seanceniv'
            }
          },
        ],
        'as': 'seance'
      }
    },
    {
      '$unwind': {
        'path': '$seance'
      }
    },
    dateQuery,
    {
      '$replaceRoot': {
        'newRoot': '$seance'
      }
    },
    {
      '$lookup': {
        'from': 'mediaassigns',
        'let': {
          'id': '$_id'
        },
        'pipeline': [
          {
            '$match': {
              '$expr': {
                '$eq': [
                  '$assignId', '$$id'
                ]
              }
            }
          }, {
            '$lookup': {
              'from': 'mediaassignfiles',
              'let': {
                'id': '$_id'
              },
              'pipeline': [
                {
                  '$match': {
                    '$expr': {
                      '$eq': [
                        '$mediaAssignId', '$$id'
                      ]
                    }
                  }
                }, {
                  '$lookup': {
                    'from': 'media',
                    'localField': 'mediaId',
                    'foreignField': '_id',
                    'as': 'media'
                  }
                }, {
                  '$unwind': {
                    'path': '$media',
                    'preserveNullAndEmptyArrays': true
                  }
                }
              ],
              'as': 'files'
            }
          }
        ],
        'as': 'mediaAssigns'
      }
    },
    {
      '$group': {
        '_id': '$_id',
        'root': {
          '$first': '$$ROOT'
        }
      }
    }, {
      '$replaceRoot': {
        'newRoot': '$root'
      }
    },
  ]
  console.log("aggregation : ", JSON.stringify(aggregation));
  SeanceNiv.aggregate(aggregation).then((seances) => {
    console.log("seances : ", seances)
    res.status(200).json(seances)
  })
    .catch((err) => res.status(400).json(`Error: ${err}`));
};

/**
 * GET seance by id
 * @param id: seance id
 * @return seance
 */
exports.findById = async (req, res) => {
  Seance.findById(req.params.id)
    .then((seance) => {
      if (!seance) return res.status(404).json("Seance Not Found");
      res.json(seance);
    })
    .catch((err) => res.status(404).json(err));
};

/**
* GET seances by search query
* @param query the search query
* @return array of seances that satisfy the query
*
*/
exports.search = async (req, res) => {
  const { query } = req.params;
  Seance.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } }
    ]
  }).then((seances) => {
    res.json(seances);
  }).catch((err) => res.status(404).json(err));
};

/**
 * POST new seance
 * @param req { name, description, url, startDate, endDate, niveauId }
 * @return seance
 */
exports.create = async (req, res) => {
  const { name, description, url, urlInstructor, urlAuthInstructor, startDate, endDate, userId, niveaux } = req.body;
  const newSeance = new Seance({
    name,
    description,
    url,
    urlInstructor,
    urlAuthInstructor,
    startDate,
    endDate,
    userId,
    niveaux
  });
  newSeance
    .save()
    .then(() => res.json(newSeance))
    .catch((err) => res.status(400).json(err));
};

/**
 * PUT update seance
 * @param req { _id, name, description }
 * @param _id seance id
 * @return seance
 */
exports.updateById = async (req, res) => {
  Seance.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((seance) => res.status(200).json(seance))
    .catch((err) => res.status(404).json(err));
};

/**
 * Delete seance
 * @param _id seance id
 * @return seance
 */
exports.deleteById = async (req, res) => {
  Seance.findByIdAndDelete({ _id: req.params.id })
    .then((seance) => res.status(200).json(seance))
    .catch((err) => res.status(404).json(err));
};