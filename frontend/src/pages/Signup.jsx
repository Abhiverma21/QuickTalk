import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";
const Signup = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword , setShowPassword] = useState(false);

  async function submitForm(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await api.post("/auth/signup", formData);
      login(res.data);
      navigate("/");
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong");
    }
  }

  function handleInput(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  }

  function validate() {
    let newErrors = {};

    if (!formData.name) newErrors.name = "Name is Required";
    else if (formData.name.length < 3)
      newErrors.name = "Name must be greater than 3 characters";

    if (!formData.email) newErrors.email = "Email is Required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.phone) newErrors.phone = "Phone number is Required";
    else if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Phone number is invalid";

    if (!formData.password) newErrors.password = "Password is Required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(formData.password))
      newErrors.password =
        "Password must contain uppercase, lowercase, number, and special character";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-4">
     <form
        onSubmit={submitForm}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
      >
        <img
    src="/logo.png"  
    alt="App Logo"
    className="w-10 h-10 md:w-20 md:h-20 object-contain mx-auto"
  /> 
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Create Account
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          name="name"
          value={formData.name}
          onChange={handleInput}
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

        <input
          type="text"
          placeholder="Email Address"
          name="email"
          value={formData.email}
          onChange={handleInput}
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

       <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    name="password"
    value={formData.password}
    onChange={handleInput}
    className="border p-2 pr-16 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-500 font-medium"
  >
    {showPassword ? "Hide" : "Show"}
  </button>
</div>

{errors.password && (
  <p className="text-red-500 text-sm">{errors.password}</p>
)}

        <input
          type="text"
          placeholder="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleInput}
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

        {serverError && (
          <p className="text-red-500 text-sm text-center">{serverError}</p>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
        >
          Create Account
        </button>
        <GoogleLoginButton/>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </form>

    </main>
  );
};

export default Signup;