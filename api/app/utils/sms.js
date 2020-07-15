const axios = require('axios').default;

const config = require("../config");

const hostname = "https://api.msg91.com";
const baseURL = "/api/v5/otp";

const generateOtp = (phone) => {
  return axios.get(`${hostname}${baseURL}`, {params: {mobile: phone, template_id: config.TEMPLATEID, authkey: config.AUTHKEY}});
};

const verifyOtp = (phone, otp) => {
  return axios.post(`${hostname}${baseURL}/verify`, {}, {params: {mobile: phone, otp: otp, authkey: config.AUTHKEY}});
};

const resendOtp = (phone, otp) => {
  return axios.post(`${hostname}${baseURL}/retry`, {}, {params: {mobile: phone, authkey: config.AUTHKEY}});
};

module.exports = {
  generateOtp,
  verifyOtp,
  resendOtp,
}
