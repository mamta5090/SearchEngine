import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiUpload, FiRefreshCw, FiDatabase, FiTag } from "react-icons/fi";

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
  const [isUploading, setIsUploading] = useState(false);

  const fetchIndexes = async () => {
    setLoading(true);
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

  // Helper to safely display searchable/filterable fields
  const formatFields = (fieldData) => {
    try {
      if (!fieldData) return "None";
      // Handle if backend returns a JSON string or an actual Array
      const parsed = typeof fieldData === 'string' ? JSON.parse(fieldData) : fieldData;
      return Array.isArray(parsed) ? parsed.join(", ") : String(parsed);
    } catch (e) {
      return String(fieldData);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const m = {
        title: identifyingFields.split(",").map((s) => s.trim())[0] || "name",
        body: searchableFields.split(",").map((s) => s.trim())[0] || "description",
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
      
      toast.success("Index created successfully");
      setShowForm(false);
      setName("");
      setSearchableFields("");
      setFilterableFields("");
      setIdentifyingFields("");
      fetchIndexes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create index");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this index? All data inside Typesense for this index will be lost.")) return;
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

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const isJson = file.name.endsWith(".json");
    const endpoint = `/indexes/${uploadIndexId}/ingest/${isJson ? "json" : "csv"}`;

    try {
      await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Ingestion started! Data will appear in search shortly.");
      setFile(null);
      setUploadIndexId(null);
      fetchIndexes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Index Management</h1>
          <p className="text-gray-500">Define schemas and import data into Typesense.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm"
        >
          <FiPlus /> {showForm ? "Close Form" : "New Index"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg mb-10 transition-all">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Create New Search Index</h2>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Index Name (Collection Name)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. products"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Identify Field (Primary Title)</label>
                <input
                  type="text"
                  required
                  value={identifyingFields}
                  onChange={(e) => setIdentifyingFields(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Searchable Fields (comma separated)</label>
                <input
                  type="text"
                  required
                  value={searchableFields}
                  onChange={(e) => setSearchableFields(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="name, description, category"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filterable Fields (Facets)</label>
                <input
                  type="text"
                  value={filterableFields}
                  onChange={(e) => setFilterableFields(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="brand, category, color"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-md">
                Create Index
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-gray-500 font-medium hover:text-gray-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <FiRefreshCw className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {indexes.map((idx) => (
            <div key={idx.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col hover:shadow-md transition-all relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FiDatabase /></div>
                  <h3 className="text-xl font-bold text-gray-900">{idx.name}</h3>
                </div>
                <button onClick={() => handleDelete(idx.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <FiTrash2 size={18} />
                </button>
              </div>

              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiTag className="text-gray-400" />
                  <span className="font-medium text-gray-800">Searchable:</span>
                  <span className="truncate">{formatFields(idx.searchable_fields)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiTag className="text-gray-400" />
                  <span className="font-medium text-gray-800">Filterable:</span>
                  <span className="truncate">{formatFields(idx.filterable_fields)}</span>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-100">
                {uploadIndexId === idx.id ? (
                  <form onSubmit={handleUpload} className="space-y-3">
                    <input
                      type="file"
                      accept=".json,.csv"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <div className="flex gap-2">
                      <button disabled={!file || isUploading} type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-emerald-700">
                        {isUploading ? "Uploading..." : "Confirm Upload"}
                      </button>
                      <button type="button" onClick={() => setUploadIndexId(null)} className="px-3 py-2 text-gray-500 text-xs font-medium">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setUploadIndexId(idx.id)}
                    className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition text-sm font-bold flex items-center justify-center gap-2 border border-gray-200"
                  >
                    <FiUpload /> Import JSON/CSV
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