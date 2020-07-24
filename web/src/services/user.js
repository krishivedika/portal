import axios from "axios";

class UserService {

  getUser(data) {
    return axios.get(`/user`, { params: data });
  }

  getUsers(data) {
    return axios.get(`/users`, { params: data });
  }

  updateRole(data) {
    return axios.post(`/user/member/onboard`, data);
  }

  updateProfile(data) {
    return axios.post(`/user/member/update`, data);
  }

  // Farm Record end points
  getFarmRecords(data) {
    return axios.get(`/farms`, { params: data })
  }

  addFarmRecords(data) {
    return axios.post(`/farm/add`, data);
  }

  updateFarmRecords(data) {
    return axios.post(`/farm/update`, data)
  }

  deleteFarmRecords(data) {
    return axios.delete(`/farm/delete/${data}`)
  }

  // Survey End Points
  getSurveys(data) {
    return axios.get(`/farms/surveys/${data}`)
  }

  addSurvey(data) {
    return axios.post(`/farm/survey/add`, data);
  }

  updateSurvey(data) {
    return axios.post(`/farm/survey/update`, data)
  }

  deleteSurvey(data) {
    return axios.delete(`/farm/survey/delete/${data}`)
  }

  uploadFile(data, config) {
    return axios.post(`/farm/survey/upload`, data, config);
  }

  deleteFile(data) {
    return axios.post(`/farm/survey/upload/delete`, data);
  }
}

let userServiceInstance = new UserService();
export default userServiceInstance;
