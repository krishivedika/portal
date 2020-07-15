import axios from "axios";

class AuthService {
  login(data) {
    return axios.post(`/signin`, data);
  }

  staffLogin(data) {
    return axios.post(`/signin/staff`, data);
  }

  forgotPassword(data) {
    return axios.post(`/forgot`, data);
  }

  resetPassword(data) {
    return axios.post(`/reset`, data);
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(data) {
    return axios.post(`/signup`, data);
  }

  requestNewOtp(data) {
    return axios.post(`/otp/new`, data);
  }

  requestLoginOtp(data) {
    return axios.post(`/otp/signin`, data);
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
