import axios from "axios";

class AuthService {
  login(data) {
    return axios.post(`/signin`, data);
  }

  staffLogin(data) {
    return axios.post(`/signin/staff`, data);
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(data) {
    return axios.post(`/signup`, data);
  }

  requestOtp(data) {
    return axios.post(`/otp`, data);
  }

  resendOtp(data) {
    return axios.post(`/otp/resend`, data);
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}

let authServiceInstance = new AuthService();
export default authServiceInstance;
