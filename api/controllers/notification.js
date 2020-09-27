const db = require("../models");

const Notification = db.notification;

exports.getNotifications = (req, res) => {
  let where = { UserId: req.userId, isRead: false};
  if (req.query.read == "true") {
    where = {UserId: req.userId};
  }

  Notification.findAll({order: [['id', 'DESC']], where: where}).then(notifications => {
    return res.status(200).send({notifications});
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 1 });
  });
}

exports.updateNotification = (req, res) => {
  let where = {};
  if (req.body.id === "all") {
    where = {UserId: req.userId};
  } else {
    where = {id: req.body.id};
  }
  Notification.findAll({where: where}).then(async notifications => {
    if (notifications) {
      if (notifications[0].UserId != req.userId) {
        return res.status(404).send({ message: "You dont have the permission to do this" });
      }
      await Notification.update({isRead: true}, {where: where});
      const newNotifications = await Notification.findAll({where: {UserId: req.userId, isRead: false}});
      console.log(newNotifications.length);
      return res.status(200).send({ message: 'Updated', notifications: newNotifications});
    }
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: "Unknown Error", code: 1 });
  });
}
