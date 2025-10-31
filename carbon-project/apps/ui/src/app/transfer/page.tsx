'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function TransferPage() {
  const router = useRouter();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Get holdings for current user's org
      const holdingsRes = await api.get(`/holdings?orgId=${userData.orgId}`);
      setHoldings(holdingsRes.data);

      // Get all orgs for transfer dropdown
      const orgsRes = await api.get('/explorer/credits');
      // Extract unique orgs from projects
      const orgMap = new Map();
      orgsRes.data.projects?.forEach((p: any) => {
        if (!orgMap.has(p.orgId)) {
          orgMap.set(p.orgId, { id: p.orgId, name: p.org?.name || 'Unknown' });
        }
      });
      setOrgs(Array.from(orgMap.values()));
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    try {
      const res = await api.post('/transfers', {
        fromOrgId: userData.orgId,
        toOrgId: formData.get('toOrgId'),
        classId: formData.get('classId'),
        quantity: parseInt(formData.get('quantity') as string),
      });
      alert(`Transfer successful! Transaction ID: ${res.data.id}`);
      e.currentTarget.reset();
      fetchData(); // Refresh holdings
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Transfer Credits</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Transfer Credits</h2>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block mb-1">From Organization</label>
              <input
                type="text"
                value={user?.email || 'Current User'}
                disabled
                className="w-full px-4 py-2 border rounded bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block mb-1">To Organization</label>
              <select
                name="toOrgId"
                required
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">Select organization...</option>
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Credit Class</label>
              <select
                name="classId"
                required
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">Select class...</option>
                {holdings
                  .filter((h) => h.quantity > 0)
                  .map((holding) => (
                    <option key={holding.classId} value={holding.classId}>
                      {holding.class.project.code} - Vintage {holding.class.vintage} 
                      (Available: {holding.quantity})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Quantity</label>
              <input
                name="quantity"
                type="number"
                required
                min="1"
                className="w-full px-4 py-2 border rounded"
                placeholder="100"
              />
            </div>

            <button
              type="submit"
              className="bg-registry text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Transfer Credits
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">My Holdings</h2>
          {holdings.length === 0 ? (
            <p className="text-gray-600">No holdings available</p>
          ) : (
            <div className="space-y-4">
              {holdings.map((holding) => (
                <div key={holding.id} className="border rounded p-4">
                  <h3 className="font-semibold">
                    {holding.class.project.code} - Vintage {holding.class.vintage}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Available: {holding.quantity} credits
                  </p>
                  <p className="text-xs text-gray-500">
                    Class ID: {holding.classId}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
