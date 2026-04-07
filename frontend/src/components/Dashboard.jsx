import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for token on mount to toggle buttons
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    console.log("Logged out");
    // Reloading is optional if you manage state, but kept for your logic
    window.location.reload(); 
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-zinc-700">
      {/* --- Navbar --- */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-black tracking-tighter italic">
            SEARCH<span className="text-blue-600">.</span>AI
          </h1>
          <div className="hidden md:flex gap-6 text-xs uppercase tracking-widest text-zinc-500 font-medium">
            <span className="cursor-pointer hover:text-white transition">Products</span>
            <span className="cursor-pointer hover:text-white transition">Solutions</span>
            <span className="cursor-pointer hover:text-white transition">Pricing</span>
            <span className="cursor-pointer hover:text-white transition">API Docs</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
         
            <button 
              className="text-sm font-medium px-5 py-2 rounded-full border border-red-900/50 text-gray-500 hover:bg-red-950 transition-all"
              onClick={handleLogout}
            >
              Logout
            </button>
        
          <button className="bg-blue-600 text-white text-sm font-bold px-6 py-2 rounded-full hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all"               onClick={() => navigate("/login")}>
            Get Started
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto">
        {/* --- Hero Section --- */}
        <section className="grid md:grid-cols-2 gap-12 px-8 py-20 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-full border border-zinc-800 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
              v4.0 Algorithm Live
            </div>
            <h2 className="text-6xl font-extrabold leading-[1.1] tracking-tighter">
              The Next Era of <br />
              <span className="text-blue-600">Neural Search.</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-md leading-relaxed">
              Build blazing fast search experiences with modern AI-powered
              interfaces, vector embeddings, and real-time indexing.
            </p>
            <div className="flex gap-4 pt-4">
              <button className="bg-white text-black font-bold px-8 py-4 rounded-2xl hover:bg-zinc-200 transition-all">
                Explore Platform
              </button>
              <button className="border border-zinc-800 px-8 py-4 rounded-2xl hover:bg-zinc-900 transition-all">
                View Demo
              </button>
            </div>
          </div>

          {/* Interactive Search Mockup */}
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-5 py-4 rounded-2xl bg-black border border-zinc-800 focus:border-blue-600 focus:outline-none transition-all placeholder:text-zinc-600"
              />
              <div className="absolute right-4 top-4 text-zinc-500 font-mono text-xs">⌘ K</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { name: "Running Shoes", price: "$120", type: "Active" },
                { name: "Sneakers", price: "$90", type: "Casual" },
                { name: "Hiking Boots", price: "$150", type: "Outdoor" },
                { name: "Casual Wear", price: "$70", type: "Lifestyle" }
              ].map((item, idx) => (
                <div key={idx} className="bg-black border border-zinc-900 p-5 rounded-2xl hover:border-zinc-700 transition-colors cursor-pointer group/item">
                  <h3 className="font-bold text-zinc-200 group-hover/item:text-blue-500 transition-colors">{item.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-zinc-500">{item.type}</p>
                    <p className="text-sm font-mono text-white">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Stats Section --- */}
        <section className="px-8 pb-24">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group bg-zinc-950 border border-zinc-900 p-8 rounded-3xl hover:border-zinc-700 transition-all">
              <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Total Requests</h3>
              <p className="text-5xl font-black mt-4 tracking-tighter">1.2M</p>
              <div className="h-1 w-full bg-zinc-900 mt-6 overflow-hidden rounded-full">
                <div className="h-full bg-blue-600 w-[85%]" />
              </div>
            </div>

            <div className="group bg-zinc-950 border border-zinc-900 p-8 rounded-3xl hover:border-zinc-700 transition-all">
              <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Success Rate</h3>
              <p className="text-5xl font-black mt-4 tracking-tighter text-blue-500">94.2%</p>
              <div className="h-1 w-full bg-zinc-900 mt-6 overflow-hidden rounded-full">
                <div className="h-full bg-white w-[94%]" />
              </div>
            </div>

            <div className="group bg-zinc-950 border border-zinc-900 p-8 rounded-3xl hover:border-zinc-700 transition-all">
              <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Latency (avg)</h3>
              <p className="text-5xl font-black mt-4 tracking-tighter">12<span className="text-2xl text-zinc-600">ms</span></p>
              <p className="text-xs text-zinc-600 mt-6 font-mono italic underline decoration-blue-600/50 underline-offset-4">Top 1% of global indexes</p>
            </div>
          </div>
        </section>

        {/* --- Footer --- */}
        <footer className="px-8 py-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-600 text-xs font-mono uppercase">
            © 2026 SearchUI Algorithms Ltd.
          </p>
          <div className="flex gap-8 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Security</a>
            <a href="#" className="hover:text-white">Status</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;