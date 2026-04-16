import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiUpload, FiRefreshCw } from "react-icons/fi";

const IndexManager = () => {
  const [indexes, setIndexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Create index state
  const [name, setName] = useState("");
  const [connectionId, setConnectionId] = useState("");
  const [targetTable, setTargetTable] = useState("");
  const [searchableFields, setSearchableFields] = useState("");
  const [filterableFields, setFilterableFields] = useState("");
  const [identifyingFields, setIdentifyingFields] = useState("");

  // File upload state for selected index
  const [uploadIndexId, setUploadIndexId] = useState(null);
  const [file, setFile] = useState(null);

  const fetchIndexes = async () => {
    try {
      const res = await api.get("/indexes");
      const items = Array.isArray(res.data.data)
        ? res.data.data
        : res.data.data?.indexes || [];
      setIndexes(items);
    } catch (error) {
      toast.error("Failed to fetch indexes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndexes();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const m = {
        title: identifyingFields.split(",").map((s) => s.trim())[0] || "title",
        body: searchableFields.split(",").map((s) => s.trim())[0] || "body",
      };

      await api.post("/indexes", {
        name,
        connectionId: connectionId ? parseInt(connectionId) : null,
        targetTable: targetTable || null,
        searchableFields: searchableFields
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        filterableFields: filterableFields
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        mappings: m,
      });
      toast.success("Index created");
      setShowForm(false);
      setName("");
      fetchIndexes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create index");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this index?")) return;
    try {
      await api.delete(`/indexes/${id}`);
      toast.success("Index deleted");
      fetchIndexes();
    } catch (error) {
      toast.error("Failed to delete index");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !uploadIndexId) return;

    const formData = new FormData();
    formData.append("file", file);

    const isJson = file.name.endsWith(".json");
    const endpoint = `/indexes/${uploadIndexId}/ingest/${isJson ? "json" : "csv"}`;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5020/api/v1${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload');

      toast.success("File uploaded and ingestion job started!");
      setFile(null);
      setUploadIndexId(null);
    } catch (error) {
      toast.error(error.message || "Failed to upload file");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Indexes</h1>
          <p className="text-sm text-gray-500">
            Manage structure and ingestion sets for search.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <FiPlus /> New Index
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">Create Index</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Index Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. products"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connection ID (Optional)
                </label>
                <input
                  type="number"
                  value={connectionId}
                  onChange={(e) => setConnectionId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Leave blank if manually importing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Table (Optional)
                </label>
                <input
                  type="text"
                  value={targetTable}
                  onChange={(e) => setTargetTable(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Leave blank if manually importing"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Searchable Fields (comma separated)
                </label>
                <input
                  type="text"
                  value={searchableFields}
                  onChange={(e) => setSearchableFields(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="title, description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filterable Fields (comma separated)
                </label>
                <input
                  type="text"
                  value={filterableFields}
                  onChange={(e) => setFilterableFields(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="category, brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Identifying Field (for titles)
                </label>
                <input
                  type="text"
                  value={identifyingFields}
                  onChange={(e) => setIdentifyingFields(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="name"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
              >
                Save Index
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {indexes.map((idx) => (
            <div
              key={idx.id}
              className="bg-white border text-sm border-gray-200 rounded-xl shadow-sm p-5 relative group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {idx.name}
                </h3>
                <button
                  onClick={() => handleDelete(idx.id)}
                  className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <FiTrash2 />
                </button>
              </div>

              <div className="text-gray-600 space-y-1 mb-4">
                <p>
                  <span className="font-medium text-gray-900">ID:</span>{" "}
                  {idx.id}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Fields:</span>{" "}
                  {(() => {
                    try {
                      const parsed = JSON.parse(idx.searchable_fields);
                      return Array.isArray(parsed) ? parsed.join(", ") : parsed;
                    } catch {
                      return idx.searchable_fields || "";
                    }
                  })()}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Rows:</span>{" "}
                  <span className="bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-xs font-bold">
                    Document Count Here (todo)
                  </span>
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-auto">
                {uploadIndexId === idx.id ? (
                  <form onSubmit={handleUpload} className="flex gap-2">
                    <input
                      type="file"
                      accept=".json,.csv"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="text-xs flex-1 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                      type="submit"
                      disabled={!file}
                      className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadIndexId(null)}
                      className="text-gray-500 px-2 py-1 text-xs"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setUploadIndexId(idx.id)}
                    className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md transition text-xs font-medium flex items-center justify-center gap-2 border border-gray-200"
                  >
                    <FiUpload /> Upload JSON/CSV
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IndexManager;
