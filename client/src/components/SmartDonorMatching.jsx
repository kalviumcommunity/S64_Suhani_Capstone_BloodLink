import React, { useState, useEffect } from 'react';
import { donorMatchingService } from '../services/langchainService';

const SmartDonorMatching = ({ requestId }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await donorMatchingService.getSmartMatches(requestId);
        setMatches(data.recommendations || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch donor matches');
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchMatches();
    }
  }, [requestId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Smart Donor Matches</h2>
      
      {matches.length === 0 ? (
        <p className="text-gray-600">No matches found for this request.</p>
      ) : (
        <div className="grid gap-4">
          {matches.map((match, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{match.donor.name}</h3>
                  <p className="text-sm text-gray-500">Blood Type: {match.donor.bloodType}</p>
                  <p className="text-sm text-gray-500">Priority Score: {match.priorityScore}</p>
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {match.contactStrategy}
                </span>
              </div>
              
              <div className="mt-2">
                <p className="text-sm text-gray-600">{match.reasonForSelection}</p>
              </div>
              
              <div className="mt-3 flex space-x-2">
                <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                  Contact
                </button>
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  View History
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartDonorMatching; 