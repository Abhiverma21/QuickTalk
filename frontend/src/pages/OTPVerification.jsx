import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const email = location.state?.email || "";

  // Handle OTP input - only numbers, max 6 digits
  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
      setError("");
    }
  };

  // Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      setSuccess("Email verified successfully!");
      login(response.data);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post("/auth/resend-otp", {
        email,
      });
      setSuccess("OTP sent to your email");
      setOtp("");
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-slate-500 px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-12">
        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
          Verify Your Email
        </h2>
        <p className="text-gray-600 text-sm mb-2 leading-relaxed">
          Enter the 6-digit OTP sent to:
        </p>
        
        {/* Email Display */}
        <p className="text-blue-700 font-bold text-base mb-8 break-all">
          {email}
        </p>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP Input */}
          <input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={handleOtpChange}
            maxLength="6"
            className="w-full px-4 py-4 text-xl text-center font-semibold letter-spacing tracking-widest border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100 bg-gray-50 focus:bg-white transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={loading}
          />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-600 p-3 rounded-lg">
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-blue-900 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-55 disabled:cursor-not-allowed text-base tracking-wide"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Resend Button */}
        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="w-full py-2 px-4 mt-4 border-2 border-blue-700 text-blue-700 font-semibold rounded-xl hover:bg-blue-50 hover:border-blue-900 hover:text-blue-900 active:bg-blue-100 transition-all duration-300 disabled:opacity-55 disabled:cursor-not-allowed text-sm"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;
