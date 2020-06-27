import axios from "axios";

import authHeader from "./auth-header";
import config from "../config";

const API_URL = config.REACT_APP_API_URL;

class UserService {
  getPublicContent() {
    return axios.get(`${API_URL}role/all`);
  }

  getUserBoard() {
    return axios.get(`${API_URL}role/user`, { headers: authHeader() });
  }

  getAdminBoard() {
    return axios.get(`${API_URL}role/admin`, { headers: authHeader() });
  }
}

let userServiceInstance = new UserService();
export default userServiceInstance;
