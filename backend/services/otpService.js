// OTP generate karne ka function
export const generateOTP = () => {
  // 6-digit ka random number generate karega
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};