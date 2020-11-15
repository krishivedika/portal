import axios from "axios";
class AuthService {
  login(data) {
    return axios.post(`/signin`, data);
  }

  staffLogin(data) {
    return axios.post(`/signin/staff`, data);
  }

  forgotPasswordCheck(data) {
    return axios.post(`/forgot/check`, data);
  }

  forgotPassword(data) {
    return axios.post(`/forgot`, data);
  }

  resetPassword(data) {
    return axios.post(`/reset`, data);
  }

  logout() {
    let isLocal = document.location.href.includes("localhost");
    let domain = isLocal ? "localhost" : ".krishivedika.com";
    document.cookie=`user=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=${domain}`;
    return axios.post(`/logout`);
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
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };
    const user = getCookie("user");
    if(!user) return undefined;
    return JSON.parse(getCookie("user"));
  }
}

let authServiceInstance = new AuthService();
export default authServiceInstance;
