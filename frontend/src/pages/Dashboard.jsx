import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiDatabase, FiLayers, FiSearch } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const cards = [
    {
      title: 'Database Connections',
      description: 'Manage sources like MySQL or PostgreSQL.',
      icon: FiDatabase,
      href: '/connections',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Search Indexes',
      description: 'Create and configure search indexes.',
      icon: FiLayers,
      href: '/indexes',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Search Console',
      description: 'Run search queries and test relevance.',
      icon: FiSearch,
      href: '/search',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Search-Product',
      description: 'Run search queries and test relevance.',
      icon: FiSearch,
      href: '/instant-search',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Add-Product',
      description: 'Run search queries and test relevance.',
      icon: FiSearch,
      href: '/add',
      color: 'bg-blue-50 text-blue-600',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name || 'User'}!</h1>
        <p className="mt-2 text-gray-600">
          This is the Lumina Search testing console. Configure your connections, build indexes, and test your search queries.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className="block p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex p-3 rounded-lg ${card.color} mb-4`}>
              <card.icon size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-sm text-gray-500">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;





// import React, { useContext, useEffect, useState } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { Link, useNavigate } from "react-router-dom";
// import { FiDatabase, FiLayers, FiSearch } from "react-icons/fi";

// const Dashboard = () => {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     setIsLoggedIn(!!token);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     setIsLoggedIn(false);
//     window.location.reload();
//   };

//   const cards = [
//     {
//       title: "Database Connections",
//       description: "Manage MySQL / PostgreSQL connections",
//       icon: FiDatabase,
//       href: "/connections",
//     },
//     {
//       title: "Search Indexes",
//       description: "Create & manage indexes",
//       icon: FiLayers,
//       href: "/indexes",
//     },
//     {
//       title: "Search Console",
//       description: "Test search queries",
//       icon: FiSearch,
//       href: "/search",
//     },
//     {
//       title: "Product Search",
//       description: "Instant search UI",
//       icon: FiSearch,
//       href: "/instant-search",
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-black text-white">

//       {/* 🔷 Navbar */}
//       <nav className="flex justify-between items-center px-8 py-5 border-b border-zinc-900">
//         <h1 className="text-2xl font-bold">
//           Lumina<span className="text-blue-500">.</span>
//         </h1>

//         <div className="flex gap-4">
//           {!isLoggedIn ? (
//             <button onClick={() => navigate("/login")} className="px-4 py-2 border border-zinc-700 rounded-full">
//               Login
//             </button>
//           ) : (
//             <button onClick={handleLogout} className="px-4 py-2 border border-red-500 text-red-400 rounded-full">
//               Logout
//             </button>
//           )}
//           <button className="bg-blue-600 px-5 py-2 rounded-full">
//             Get Started
//           </button>
//         </div>
//       </nav>

//       {/* 🔥 Hero Section */}
//       <section className="grid md:grid-cols-2 gap-10 px-10 py-20 items-center">
//         <div>
//           <h2 className="text-6xl font-extrabold leading-tight">
//             Agentic <br />
//             Generative <br />
//             <span className="text-blue-500">Search</span>
//           </h2>

//           <p className="mt-6 text-zinc-400 max-w-md">
//             Build powerful AI-based search experiences with real-time indexing
//             and blazing-fast performance.
//           </p>

//           <button className="mt-6 bg-blue-600 px-6 py-3 rounded-xl">
//             Explore Platform
//           </button>
//         </div>

//         {/* Search Mock UI */}
//         <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl">
//           <input
//             placeholder="Search products..."
//             className="w-full p-4 rounded-xl bg-black border border-zinc-800 outline-none"
//           />

//           <div className="mt-6 grid grid-cols-2 gap-4">
//             {["Shoes", "Sneakers", "Hoodies", "Jackets"].map((item, i) => (
//               <div key={i} className="p-4 bg-black border border-zinc-800 rounded-xl">
//                 <p className="font-semibold">{item}</p>
//                 <p className="text-sm text-zinc-500">$99</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* 📊 Feature Cards */}
//       <section className="px-10 pb-20">
//         <h2 className="text-2xl font-bold mb-8">
//           Welcome, {user?.name || "User"} 👋
//         </h2>

//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {cards.map((card) => (
//             <Link
//               key={card.title}
//               to={card.href}
//               className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-blue-500 transition"
//             >
//               <card.icon size={28} className="mb-4 text-blue-500" />
//               <h3 className="font-semibold text-lg">{card.title}</h3>
//               <p className="text-sm text-zinc-500 mt-2">
//                 {card.description}
//               </p>
//             </Link>
//           ))}
//         </div>
//       </section>

//       {/* ⚡ Footer */}
//       <footer className="border-t border-zinc-900 text-center py-6 text-zinc-600 text-sm">
//         © 2026 Lumina Search
//       </footer>
//     </div>
//   );
// };

// export default Dashboard;