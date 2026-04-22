import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiSearch, FiClock, FiDatabase, FiImage, FiChevronRight } from 'react-icons/fi';
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import { InstantSearch, SearchBox, Hits, Stats, Highlight, Pagination, Configure } from "react-instantsearch";
import "instantsearch.css/themes/satellite.css";

const SearchInterface = () => {
  const [indexes, setIndexes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [adapter, setAdapter] = useState(null);

  // 1. Setup Adapter helper
  const createAdapter = (collectionName) => {
    return new TypesenseInstantSearchAdapter({
      server: {
        apiKey: "xyz", // Ensure this matches your Typesense API Key
        nodes: [{ host: "localhost", port: 8108, protocol: "http" }],
      },
      additionalSearchParameters: {
        query_by: "name", // Ensure your schema has a 'name' field
      },
    });
  };

  // 2. Fetch Indexes from DB
  useEffect(() => {
    const fetchIndexes = async () => {
      try {
        const res = await api.get('/indexes');
        const items = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.indexes || []);
        setIndexes(items);
        
        // Auto-select first index or "products"
        const defaultIdx = items.find(i => i.name === 'products') || items[0];
        if (defaultIdx) {
          setSelectedIndex(defaultIdx);
          setAdapter(createAdapter(defaultIdx.name));
        }
      } catch (error) {
        toast.error('Failed to load search indexes');
      }
    };
    fetchIndexes();
  }, []);

  const handleIndexChange = (e) => {
    const idx = indexes.find(i => i.id.toString() === e.target.value);
    if (idx) {
      setSelectedIndex(idx);
      setAdapter(createAdapter(idx.name));
    }
  };

  // Custom UI for each result
  const ProductHit = ({ hit }) => (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all flex flex-col h-full">
      <div className="h-52 bg-gray-50 flex items-center justify-center p-4">
        <img 
          src={hit.default_image || 'https://via.placeholder.com/200'} 
          alt={hit.name} 
          className="max-w-full max-h-full object-contain"
          onError={(e) => e.target.src = 'https://via.placeholder.com/200?text=No+Image'}
        />
      </div>
      <div className="p-5 flex-grow">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 h-10">
          <Highlight attribute="name" hit={hit} />
        </h3>
        <p className="text-emerald-600 font-bold">${hit.sales || "0.00"}</p>
      </div>
    </div>
  );

  if (!adapter || !selectedIndex) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 font-sans">
        <FiDatabase size={48} className="mb-4 animate-pulse" />
        <p>No active search index found. Create one in Index Manager.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-center py-10 gap-6">
        <h1 className="text-3xl font-black text-gray-900 italic">Lumina Search</h1>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200">
          <span className="text-xs font-bold text-gray-400 pl-2 uppercase">Index:</span>
          <select
            value={selectedIndex.id}
            onChange={handleIndexChange}
            className="text-sm font-bold text-blue-600 outline-none pr-4 bg-transparent cursor-pointer"
          >
            {indexes.map(idx => <option key={idx.id} value={idx.id}>{idx.name}</option>)}
          </select>
        </div>
      </div>

      {/* InstantSearch now uses the DYNAMIC indexName and adapter */}
      <InstantSearch indexName={selectedIndex.name} searchClient={adapter.searchClient}>
        <Configure hitsPerPage={12} />
        
        <div className="flex flex-col gap-8">
          <div className="max-w-3xl mx-auto w-full">
            <SearchBox 
              placeholder={`Search in ${selectedIndex.name}...`} 
              autoFocus
            />
            <div className="mt-2 text-xs text-gray-400 flex justify-between">
                <Stats />
                <span className="flex items-center gap-1"><FiClock /> Local Server</span>
            </div>
          </div>

          <Hits 
            hitComponent={ProductHit} 
            classNames={{
              list: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
              item: 'list-none'
            }}
          />

          <div className="mt-12 flex justify-center border-t pt-8">
            <Pagination />
          </div>
        </div>
      </InstantSearch>

      <style>{`
        .ais-SearchBox-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem !important;
          border-radius: 1rem !important;
          border: 1px solid #ddd !important;
          outline: none;
        }
        .ais-SearchBox-submit { left: 1rem !important; }
        .ais-Pagination-list { display: flex; gap: 8px; list-style: none; }
        .ais-Pagination-link { padding: 8px 12px; border: 1px solid #eee; border-radius: 8px; text-decoration: none; color: #333; }
        .ais-Pagination-item--selected .ais-Pagination-link { background: #2563eb; color: white; border-color: #2563eb; }
        .ais-Highlight-highlighted { background: #ffeb3b; color: black; }
      `}</style>
    </div>
  );
};

export default SearchInterface;