import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate=useNavigate();
  const { login } = useContext(AuthContext);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error, setError] = useState("");
  
  const handleLogin=async(e)=>{
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      console.log(message);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="bg-slate-900 p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

        {error && <div className="mb-4 p-3 bg-red-600 rounded-lg text-sm">{error}</div>}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}

              className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
           
            className="w-full bg-blue-600 py-2 rounded-xl hover:bg-blue-500 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-4">
          Don't have an account? <span className="text-blue-500 cursor-pointer"  onClick={()=>navigate("/signup")}>Sign up</span>
        </p>
      </div>
    </div>
  );
};

export default Login
