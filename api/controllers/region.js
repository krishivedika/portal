const db = require("../models");

const Region = db.region;

exports.getRegions = (req, res) => {
  Region.scope('withoutDates').findAll({where: {state: req.query.state}}).then(regions => {
    return res.status(200).send({regions: regions});
  }).catch(err => {
    return res.status(500).send({ message: "Unknown Error", code: 1 });
  });
}
