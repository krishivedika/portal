const axios = require('axios').default;

const config = require("../config");

const hostname = "https://api.msg91.com";
const baseURL = "/api/v5/otp";

const generateOtp = (phone) => {
  return axios.get(`${hostname}${baseURL}`, {params: {mobile: `+91${phone}`, template_id: config.TEMPLATEID, authkey: config.AUTHKEY}});
};

const verifyOtp = (phone, otp) => {
  return axios.post(`${hostname}${baseURL}/verify`, {}, {params: {mobile: `+91${phone}`, otp: otp, authkey: config.AUTHKEY}});
};

const resendOtp = (phone, otp) => {
  return axios.post(`${hostname}${baseURL}/retry`, {}, {params: {mobile: `+91${phone}`, authkey: config.AUTHKEY, retrytype: 'text'}});
};

module.exports = {
  generateOtp,
  verifyOtp,
  resendOtp,
}
