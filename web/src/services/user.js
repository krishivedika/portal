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

  createProfile(data) {
    return axios.post(`/user/member/create`, data);
  }

  updateProfile(data) {
    return axios.post(`/user/member/update`, data);
  }

  deleteUser(data) {
    return axios.post(`/user/member/delete`, data);
  }

  uploadMembersCheck(data, config) {
    return axios.post(`/user/member/bulk/check`, data, config);
  }

  uploadMembers(data, config) {
    return axios.post(`/user/member/bulk`, data, config);
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

  restoreFarmRecords(data) {
    return axios.post(`/farm/restore`, data)
  }

  deleteFarmRecords(data) {
    return axios.delete(`/farm/delete/${data}`)
  }

  partitionFarmRecords(data) {
    return axios.post(`/farm/partition`, data);
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
    return axios.post(`/farm/survey/delete`, data);
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
