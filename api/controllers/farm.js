const Sequelize = require("sequelize");
const bcrypt = require("bcryptjs");

const db = require("../models");
const constants = require("../constants");
const config = require("../config");

const Op = Sequelize.Op;
const Farm = db.farm;
const Survey = db.survey;

// Farm Record End Points
exports.farmRecords = (req, res) => {
  let where = {
    [Op.or]: [
      { name: { [Op.like]: `%${req.query.search}%` } },
      { streetAddress: { [Op.like]: `%${req.query.search}%` } },
    ],
  };
  Farm.findAll({
    where: where,
  })
    .then((farms) => {
      if (!farms) {
        return res.status(404).send({ message: "No Farm Records exist" });
      }
      let customisedRecords = [];
      farms.forEach((farm) => {
        customisedRecords.push({
          id: farm.id,
          name: farm.name,
          streetAddress: farm.streetAddress,
          state: farm.state,
          district: farm.district,
          mandala: farm.mandala,
          panchayat: farm.panchayat,
          surveys: farm.Surveys,
          createdAt: farm.createdAt,
          updateAt: farm.updateAt,
        });
      });
      res.status(200).send({
        farms: customisedRecords,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};

exports.addFarmRecord = (req, res) => {
  let farmRecords = { ...req.body };

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
      farm.destroy().then(() => {
        return res.send({ message: "Farm Record Successfully Deleted!" });
      });
    })
    .catch(() => {
      res.status(500).send({ message: "Unknown Error", code: 2 });
    });
};

// Survey Endpoints
exports.addSurveyRecord = (req, res) => {
  let surveyRecords = { ...req.body };
  console.log(" in survey add");
  Survey.create(surveyRecords)
    .then(() => {
      return res.status(200).send({
        message: "Survey Created Successfully!",
      });
    })
    .catch(() => {
      res.status(500).send({ message: "Unknown Error", code: 2 });
    });
};

exports.surveys = (req, res) => {
  Survey.findAll({
    where: {
      FarmId: req.params.FarmId,
    },
  })
    .then((surveys) => {
      if (!surveys) {
        return res.status(404).send({ message: "No Survey Records exist" });
      }
      let customisedRecords = [];
      surveys.forEach((survey) => {
        customisedRecords.push({
          id: survey.id,
          farmId: survey.FarmId,
          name: survey.name,
          subdivision: survey.subdivision,
          extent: survey.extent,
          link: survey.link,
          comment: survey.comment,
          createdAt: survey.createdAt,
          updateAt: survey.updatedAt,
        });
      });
      res.status(200).send({
        surveys: customisedRecords,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ message: err.message });
    });
};

exports.updateSurveyRecord = (req, res) => {
  let surveyRecords = { ...req.body };
  Survey.findOne({
    where: {
      id: req.body.id,
    },
  }).then((survey) => {
    if (!survey) {
      res.status(404).send({ message: "Survey Record not found" });
    }
    survey
      .update(surveyRecords)
      .then((survey) => {
        res.status(200).send({ message: "Survey Updated Successfully" });
      })
      .catch(() => {
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
      survey.destroy().then(() => {
        return res.send({ message: "Survey Successfully Deleted!" });
      });
    })
    .catch(() => {
      res.status(500).send({ message: "Unknown Error", code: 2 });
    });
};
