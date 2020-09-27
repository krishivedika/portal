import axios from "axios";

class NotificationService {

  getNotifications(data) {
    return axios.get(`/notifications`,  { params: data });
  }

  updateNotification(data) {
    return axios.post(`/notification/update`, data);
  }
}

let NotificationServiceInstance = new NotificationService();
export default NotificationServiceInstance;
