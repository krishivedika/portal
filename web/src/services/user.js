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
}

let userServiceInstance = new UserService();
export default userServiceInstance;
