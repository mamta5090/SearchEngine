import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiSearch, FiClock, FiDatabase, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const SearchInterface = () => {
  const [indexes, setIndexes] = useState([]);
  const [selectedIndexId, setSelectedIndexId] = useState('');
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchIndexes = async () => {
      try {
        const res = await api.get('/indexes');
        const items = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.indexes || []);
        setIndexes(items);
        if (items.length > 0) {
          setSelectedIndexId(items[0].id.toString());
        }
      } catch (error) {
        toast.error('Failed to fetch indexes');
      }
    };
    fetchIndexes();
  }, []);

  const handleSearch = async (e, pageOverride = null) => {
    if (e) e.preventDefault();
    if (!selectedIndexId || !query.trim()) return;

    const targetPage = pageOverride || 1;
    if (!pageOverride) setPage(1); // Reset to page 1 for new queries

    setLoading(true);
    setSearched(true);
    try {
      const t0 = performance.now();
      const res = await api.get(`/search/${selectedIndexId}?q=${encodeURIComponent(query)}&page=${targetPage}&limit=20`);
      const t1 = performance.now();
      
      const items = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.results || []);
      setResults(items);
      
      const pagination = res.data.pagination || {};
      setStats({
        timeMs: t1 - t0,
        ...pagination
      });
      
      if (pageOverride) setPage(pageOverride);
      
      // Scroll to top of results on page change
      if (pageOverride) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      toast.error('Search failed');
      setResults([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (p) => {
    if (p < 1 || p > stats?.totalPages || p === page) return;
    handleSearch(null, p);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="text-center py-10">
        <h1 className="text-4xl font-extrabold text-blue-600 mb-2 flex justify-center items-center gap-3">
          <FiSearch /> Lumina Search
        </h1>
        <p className="text-gray-500 mb-8">Fast, relevant, and typo-tolerant search testing.</p>

        <form onSubmit={(e) => handleSearch(e)} className="max-w-2xl mx-auto space-y-4">
          <div className="flex gap-2">
            <select
              value={selectedIndexId}
              onChange={e => setSelectedIndexId(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700 bg-gray-50"
              style={{ minWidth: '150px' }}
            >
              <option value="" disabled>Select Index...</option>
              {indexes.map(idx => (
                <option key={idx.id} value={idx.id}>{idx.name}</option>
              ))}
            </select>
            
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full px-4 py-3 border-y border-r border-l-0 border-gray-300 rounded-r-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
              <button
                type="submit"
                disabled={loading || !selectedIndexId}
                className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white p-2 px-4 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Searching...' : <FiSearch />}
              </button>
            </div>
          </div>
        </form>
      </div>

      {searched && (
        <div className="mt-4">
          {stats && (
            <div className="text-sm text-gray-500 mb-6 flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 font-medium text-gray-700"><FiDatabase /> {stats.total} results</span>
                <span className="flex items-center gap-1"><FiClock /> {stats.timeMs.toFixed(2)} ms</span>
              </div>
              {stats.totalPages > 1 && (
                <span className="font-medium text-blue-600">Page {page} of {stats.totalPages}</span>
              )}
            </div>
          )}

          <div className="space-y-6">
            {results.length > 0 ? (
              results.map((result, idx) => {
                const doc = result?.doc || {};
                const title = doc.title || doc.name || doc.label || doc.heading || 'Untitled Document';
                const body = doc.body || doc.description || doc.content || doc.text || doc.summary;
                
                return (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                      {title}
                    </h3>
                    
                    {body && (
                      <p className="text-gray-900 text-sm mb-4 leading-relaxed font-medium">
                        {typeof body === 'string' && body.length > 500 ? body.substring(0, 500) + '...' : body}
                      </p>
                    )}
                    
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 overflow-x-auto max-h-40">
                      <pre>{JSON.stringify(doc, null, 2)}</pre>
                    </div>
                    
                    {typeof result.score === 'number' && (
                      <div className="mt-3 text-xs font-bold text-emerald-600 inline-block px-2 py-1 bg-emerald-50 rounded">
                        Match Score: {result.score.toFixed(4)}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">No results found for your query.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {stats && stats.totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1 || loading}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FiChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(stats.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show current page, first, last, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === stats.totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg border ${
                          page === pageNum
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        } transition`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === page - 2 ||
                    pageNum === page + 2
                  ) {
                    return <span key={pageNum} className="px-1 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === stats.totalPages || loading}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInterface;
