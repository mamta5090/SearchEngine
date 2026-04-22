import { useState } from "react";
import axios from "axios";

export default function ProductForm() {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sales: "",
    default_image: "",
  });

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:5020/api/v1/products/manual",
        form
      );
      setMessage(res.data.message);
      setForm({
        name: "",
        slug: "",
        sales: "",
        default_image: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save product");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!file) {
      setMessage("Please choose a JSON or CSV file");
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5020/api/v1/products/import",
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessage(`${res.data.message} (${res.data.count} records)`);
      setFile(null);
    } catch (error) {
      setMessage(error.response?.data?.message || "Import failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Add Product Manually</h2>

        <form onSubmit={handleManualSubmit} className="grid md:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Product name"
            className="border rounded-lg p-3 md:col-span-2"
          />
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="Slug"
            className="border rounded-lg p-3"
          />
          <input
            name="sales"
            value={form.sales}
            onChange={handleChange}
            placeholder="Sales"
            className="border rounded-lg p-3"
          />
          <input
            name="default_image"
            value={form.default_image}
            onChange={handleChange}
            placeholder="Image URL"
            className="border rounded-lg p-3 md:col-span-2"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-4 py-3 md:col-span-2"
          >
            Save Product
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Import JSON / CSV</h2>

        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            type="file"
            accept=".json,.csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="border rounded-lg p-3"
          />

          <button
            type="submit"
            className="bg-emerald-600 text-white rounded-lg px-4 py-3"
          >
            Upload File
          </button>
        </form>
      </div>

      {message && (
        <div className="text-sm font-medium text-gray-700 bg-gray-100 p-4 rounded-lg">
          {message}
        </div>
      )}
    </div>
  );
}