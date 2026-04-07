import axios from 'axios';
import React,  {  useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';

const Signup = () => {
    const navigate = useNavigate();
    const [data,setData]=useState({
        name:"",
        email:"",
        password:"",
    });
    const handleSignup=async (e)=>{
        e.preventDefault();
        try {
            const res=await axios.post(`${serverUrl}/auth/signup`, data)
            console.log(res.data);
                if(res.data.success){
                    navigate("/login")
                }
        } catch (error) {
            console.log(error.response.data.message);
        }
    }
  return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="bg-slate-900 p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>

        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={data.name}
              onChange={(e)=>setData({...data,name:e.target.value})}
              className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={data.email}
              onChange={(e)=>setData({...data,email:e.target.value})}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={data.password}
              onChange={(e)=>setData({...data,password:e.target.value})}
              placeholder="Create a password"
              className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
           
            className="w-full bg-blue-600 py-2 rounded-xl hover:bg-blue-500 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-4">
          Already have an account? <span className="text-blue-500 cursor-pointer" onClick={()=>navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
};
export default Signup
