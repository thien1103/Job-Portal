import React, { useEffect, useState } from "react";
import { TextEffectOne } from "react-text-animate";
import { useDispatch, useSelector } from "react-redux";
import { setAdminUser, setAdminLoading } from "@/redux/adminAuthSlice";
import { USER_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import axios from "axios";

function LoginAdmin() {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const { loading, adminUser } = useSelector((store) => store.authAdmin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(setAdminLoading(true));
      const res = await axios.post(
        `${USER_API_END_POINT}/login`,
        { ...input, role: "admin" }, 
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setAdminUser(res.data.user));
        toast.success("Login successful!");

        // No longer saving to localStorage

        navigate("/admin/");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      dispatch(setAdminLoading(false));
    }
  };

  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminUser");
    if (storedAdmin) {
      dispatch(setAdminUser(JSON.parse(storedAdmin)));
      navigate("/admin/");
    }
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpM722T0T1P4KeZconZY8NT-hoDGQqybYuA49fcGUQapNPqTjnYOH-qnrZavx5TgofbXg&usqp=CAU')",
      }}
    >
      <div className="flex flex-col items-center">
        <div className="text-3xl font-semibold bg-gradient-to-tr from-red-900 to-black bg-clip-text text-transparent">
          <TextEffectOne text="WELCOME BACK" />
        </div>

        <div className="bg-white shadow-lg rounded-xl flex max-w-4xl w-full overflow-hidden mt-6">
          <div className="hidden md:flex items-center justify-center w-1/2 bg-gradient-to-tr from-purple-500 to-green-300 p-10">
            <img
              src="https://www.kasempit.ac.th/images/pic_key.png"
              alt="Login Illustration"
              className="w-80 h-auto"
            />
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12 bg-white bg-opacity-90">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Login as an Admin User
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  name="email"
                  value={input.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="••••••••"
                  name="password"
                  value={input.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {loading ? (
                <button
                  type="button"
                  className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg flex justify-center items-center"
                  disabled
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                  wait...
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                >
                  LOGIN
                </button>
              )}
            </form>

            <p className="text-xs text-center text-gray-500 mt-6">
              Product owned by tuhaothien51@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginAdmin;