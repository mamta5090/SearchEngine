import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiRefreshCw } from 'react-icons/fi';

const ConnectionsManager = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('mysql');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(3306);
  const [username, setUsername] = useState('root');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('');

  const fetchConnections = async () => {
    try {
      const res = await api.get('/connections');
      setConnections(res.data.data.connections);
    } catch (error) {
      toast.error('Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleTest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/connections/test', {
        type, host, port: Number(port), username, password, database
      });
      toast.success('Connection successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Connection test failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/connections', {
        name, type, host, port: Number(port), username, password, database
      });
      toast.success('Connection created');
      setShowForm(false);
      setName('');
      fetchConnections();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create connection');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this connection?')) return;
    try {
      await api.delete(`/connections/${id}`);
      toast.success('Connection deleted');
      fetchConnections();
    } catch (error) {
      toast.error('Failed to delete connection');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Connections</h1>
          <p className="text-sm text-gray-500">Manage your external database sources.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <FiPlus /> Add Connection
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">New Connection</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Production DB" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="mysql">MySQL</option>
                  <option value="postgres">PostgreSQL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                <input type="text" required value={host} onChange={e => setHost(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                <input type="number" required value={port} onChange={e => setPort(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Database</label>
              <input type="text" required value={database} onChange={e => setDatabase(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={handleTest} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition text-sm font-medium flex items-center gap-2">
                <FiRefreshCw /> Test Connection
              </button>
              <button type="button" onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium">
                Save Connection
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading...</div>
      ) : (
        <div className="bg-white border flex flex-col border-gray-200 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Host:Port</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Database</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {connections.map((conn) => (
                <tr key={conn.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{conn.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {conn.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{conn.host}:{conn.port}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{conn.database}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                    <button onClick={() => handleDelete(conn.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConnectionsManager;
