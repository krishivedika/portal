const Sequelize = require("sequelize");

const db = require("../models");

const Op = Sequelize.Op;
const Farm = db.farm;
const Survey = db.survey;

// Farm Record End Points
exports.farmRecords = (req, res) => {
  let where = {
    isActive: true,
    [Op.or]: [
      { name: { [Op.like]: `%${req.query.search}%` } },
      { streetAddress: { [Op.like]: `%${req.query.search}%` } },
    ],
  };
  Farm.findAll({
    where: where,
  })
    .then((farms) => {
      console.log(farms);
      if (!farms) {
        return res.status(404).send({ message: "No Farm Records exist" });
      }
      return res.status(200).send({farms: farms});
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};

exports.addFarmRecord = (req, res) => {
  let farmRecords = { ...req.body };
  farmRecords.isActive = true;
  Farm.create(farmRecords)
    .then(() => {
      return res.status(200).send({
        message: "Farm Record Created Successfully!",
      });
    })
    .catch(() => {
      res.status(500).send({ message: "Unknown Error", code: 2 });
    });
};

exports.updateFarmRecord = (req, res) => {
  let farmRecords = { ...req.body };
  Farm.findOne({
    where: {
      id: req.body.id,
    },
  })
    .then((farm) => {
      if (!farm) {
        res.status(404).send({ message: "Farm Record doesn't exist" });
      }
      farm.update(farmRecords).then((farm) => {
        return res.send({ farm: farm });
      });
    })
    .catch(() => {
      res.status(500).send({ message: "Unknown Error", code: 2 });
    });
};

exports.deleteFarmRecord = (req, res) => {
  Farm.findOne({
    where: {
      id: req.params.id,
    },
  })
    .then((farm) => {
      if (!farm) {
        res.status(404).send({ message: "Farm Record doesn't exist" });
      }
      farm.update({isActive: false}).then(() => {
        return res.send({ message: "Farm Record Successfully Deleted!" });
      });
    })
    .catch(() => {
      res.status(500).send({ message: "Unknown Error", code: 2 });
    });
};

// Survey Endpoints
exports.addSurveyRecord = (req, res) => {
  let surveyRecord = { ...req.body };
  surveyRecord.isActive = true;
  Survey.create(surveyRecord)
    .then(() => {
      return res.status(200).send({
        message: "Survey Created Successfully!",
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ message: "Unknown Error", code: 2 });
    });
};

exports.surveys = (req, res) => {
  Survey.findAll({
    where: {
      FarmId: req.params.FarmId,
      isActive: true,
    },
  })
    .then((surveys) => {
      if (!surveys) {
        return res.status(404).send({ message: "No Survey Records exist" });
      }
      return res.status(200).send({
        surveys: surveys,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};

exports.updateSurveyRecord = (req, res) => {
  let surveyRecord = { ...req.body };
  Survey.findOne({
    where: {
      id: req.body.id,
    },
  }).then((survey) => {
    if (!survey) {
      res.status(404).send({ message: "Survey Record not found" });
    }
    survey
      .update(surveyRecord)
      .then(() => {
        res.status(200).send({ message: "Survey Updated Successfully" });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({ message: "Unknown Error", code: 2 });
      });
  });
};

exports.deleteSurveyRecord = (req, res) => {
  Survey.findOne({
    where: {
      id: req.params.id,
    },
  })
    .then((survey) => {
      if (!survey) {
        res.status(404).send({ message: "Survey doesn't exist" });
      }
      survey.updated({isActive: false}).then(() => {
        return res.send({ message: "Survey Successfully Deleted!" });
      });
    })
    .catch(() => {
      res.status(500).send({ message: "Unknown Error", code: 2 });
    });
};
