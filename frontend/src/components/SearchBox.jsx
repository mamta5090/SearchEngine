import { useState, useEffect } from "react";
import axios from "axios";
import { ServerUrl } from "../App";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      fetchResults();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5020/search?q=${encodeURIComponent(query)}`
        //  `${serverUrl}/search?q=${encodeURIComponent(query)}`,
       // `https://untagged-deplored-sadness.ngrok-free.dev` + `/search?q=${encodeURIComponent(query)}`
      );
      setResults(res.data.hits || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto mt-16">
      <div className="flex items-center bg-white shadow-lg rounded-full px-5 py-3 border border-gray-200">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full outline-none text-gray-700 text-sm"
        />
      </div>

      {(query || loading) && (
        <div className="absolute w-full bg-white mt-2 rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {loading && <p className="p-4 text-gray-500 text-sm">Searching...</p>}

          {!loading && results.length === 0 && (
            <p className="p-4 text-gray-500 text-sm">No results found</p>
          )}

          {results.map((item) => (
            <div
              key={item.document.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition"
            >
              <img
                src={item.document.default_image}
  alt={item.document.name}
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "/placeholder.png";
  }}
                className="w-12 h-12 object-cover rounded-lg border"
              />

              <div className="flex flex-col">
                <p className="text-sm font-semibold text-gray-800">
                  {item.document.name}
                </p>
                <span className="text-xs text-gray-500">
                  Sales: {item.document.sales}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}