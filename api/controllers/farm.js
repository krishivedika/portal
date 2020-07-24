const Sequelize = require("sequelize");

const db = require("../models");
const { storage } = require("../utils");
const config = require("../config");

const Op = Sequelize.Op;
const Farm = db.farm;
const Survey = db.survey;
const SurveyFile = db.surveyFile;

// Farm Record End Points
exports.farmRecords = (req, res) => {
  console.log(req);
  let where = {
    userId: req.userId,
    isActive: true,
    [Op.or]: [
      { name: { [Op.like]: `%${req.query.search}%` } },
      { streetAddress: { [Op.like]: `%${req.query.search}%` } },
    ],
  };
  Farm.findAll({
    where: where,
    include: [
      {
        model: Survey,
        required: false,
        where: { isActive: true},
        include: [{ model: SurveyFile, where: {isActive: true}, required: false}],
      },
    ]
  }).then((farms) => {
    if (!farms) {
      return res.status(404).send({ message: "No Farm Records exist" });
    }
    return res.status(200).send({ farms: farms });
  }).catch((err) => {
    console.log(err);
    return res.status(500).send({ message: err.message });
  });
};

exports.addFarmRecord = (req, res) => {
  let farmRecords = { ...req.body };
  farmRecords.isActive = true;
  farmRecords.userId = req.userId;
  Farm.create(farmRecords).then(() => {
    return res.status(200).send({
      message: "Farm Record Created Successfully!",
    });
  }).catch(() => {
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.updateFarmRecord = (req, res) => {
  let farmRecords = { ...req.body };
  Farm.findOne({
    where: {
      id: req.body.id,
    },
  }).then((farm) => {
    if (!farm) {
      return res.status(404).send({ message: "Farm Record doesn't exist" });
    }
    farm.update(farmRecords).then((farm) => {
      return res.send({ farm: farm });
    });
  }).catch(() => {
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.deleteFarmRecord = (req, res) => {
  Farm.findOne({
    where: {
      id: req.params.id,
    },
  }).then((farm) => {
    if (!farm) {
      return res.status(404).send({ message: "Farm Record doesn't exist" });
    }
    farm.update({ isActive: false }).then(() => {
      return res.send({ message: "Farm Record Successfully Deleted!" });
    });
  }).catch(() => {
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

// Survey Endpoints
exports.addSurveyRecord = (req, res) => {
  let surveyRecord = { ...req.body };
  surveyRecord.isActive = true;
  Survey.create(surveyRecord).then(() => {
    return res.status(200).send({
      message: "Survey Created Successfully!",
    });
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.surveys = (req, res) => {
  Survey.findAll({
    where: {
      FarmId: req.params.FarmId,
      isActive: true,
    },
    include: [{ model: SurveyFile, where: { isActive: true}}],
  }).then((surveys) => {
    if (!surveys) {
      return res.status(404).send({ message: "No Survey Records exist" });
    }
    return res.status(200).send({
      surveys: surveys,
    });
  }).catch((err) => {
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
      return res.status(404).send({ message: "Survey Record not found" });
    }
    survey.update(surveyRecord).then(() => {
      return res.status(200).send({ message: "Survey Updated Successfully" });
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: "Unknown Error", code: 2 });
    });
  });
};

exports.deleteSurveyRecord = (req, res) => {
  Survey.findOne({
    where: {
      id: req.params.id,
    },
  }).then((survey) => {
    if (!survey) {
      return res.status(404).send({ message: "Survey doesn't exist" });
    }
    survey.updated({ isActive: false }).then(() => {
      return res.send({ message: "Survey Successfully Deleted!" });
    });
  }).catch(() => {
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};

exports.fileUpload = (req, res) => {
  const surveyContainer = config.STORAGE_ACCOUNT_SURVEYS;
  try {
    const path = `${req.body.survey}/${req.file.originalname}`;
    const fileName = req.file.originalname;
    storage.fileUpload(surveyContainer, path, req.file.buffer, req.file.buffer.length, (error, response, result) => {
      if (!error) {
        const surveyFileObj = {
          path: path,
          SurveyId: req.body.survey,
          isActive: true,
          filename: fileName,
          filetype: fileName.split('.').pop(),
        }
        SurveyFile.create(surveyFileObj).then(surveyFile => {
          return res.status(200).send({ id: surveyFile.id, url: storage.downloadFileUrl(surveyContainer, surveyFile.path) });
        }).catch(err => {
          console.log(err);
          return res.status(500).send({ message: err.message });
        });
      } else {
        return res.status(400).send({ message: 'Unable to update field' });
      }
    });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: err.message });
  }
};

exports.deleteUpload = (req, res) => {
  SurveyFile.findOne({
    where: {
      id: req.body.survey,
      isActive: true,
    },
  }).then((surveyFile) => {
    if (!surveyFile) {
      return res.status(404).send({ message: "Survey File doesn't exist" });
    }
    surveyFile.update({ isActive: false }).then(() => {
      return res.send({ message: "Survey File Successfully Deleted!" });
    });
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 2 });
  });
};
