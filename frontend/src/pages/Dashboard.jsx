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
