const generateOtp = (phone) => {
  return {status: true};
}

const verifyOtp = (phone, otp) => {
  if (otp === '123456') return true;
  return false;
}

module.exports = {
  generateOtp,
  verifyOtp,
}
