'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function RetirePage() {
  const router = useRouter();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [retirements, setRetirements] = useState<any[]>([]);
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
      
      // Get holdings
      const holdingsRes = await api.get(`/holdings?orgId=${userData.orgId}`);
      setHoldings(holdingsRes.data.filter((h: any) => h.quantity > 0));

      // Get retirements for this org
      const retirementsRes = await api.get(`/retirements?orgId=${userData.orgId}`);
      setRetirements(retirementsRes.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    }
  };

  const handleRetire = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    try {
      const purpose = formData.get('purpose') as string;
      const beneficiary = formData.get('beneficiary') as string;
      
      // Convert strings to hex hashes (browser-compatible)
      const purposeHex = Array.from(new TextEncoder().encode(purpose))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 62);
      const beneficiaryHex = Array.from(new TextEncoder().encode(beneficiary))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 62);

      const res = await api.post('/retirements', {
        orgId: userData.orgId,
        classId: formData.get('classId'),
        quantity: parseInt(formData.get('quantity') as string),
        purposeHash: '0x' + purposeHex,
        beneficiaryHash: '0x' + beneficiaryHex,
      });
      alert(`Credits retired! Certificate ID: ${res.data.certificateId}`);
      e.currentTarget.reset();
      fetchData();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Retire Credits</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Retire (Burn) Credits</h2>
          <form onSubmit={handleRetire} className="space-y-4">
            <div>
              <label className="block mb-1">Credit Class</label>
              <select
                name="classId"
                required
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">Select class...</option>
                {holdings.map((holding) => (
                  <option key={holding.classId} value={holding.classId}>
                    {holding.class.project.code} - Vintage {holding.class.vintage} 
                    (Available: {holding.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Quantity to Retire</label>
              <input
                name="quantity"
                type="number"
                required
                min="1"
                className="w-full px-4 py-2 border rounded"
                placeholder="50"
              />
            </div>

            <div>
              <label className="block mb-1">Purpose</label>
              <textarea
                name="purpose"
                required
                rows={3}
                className="w-full px-4 py-2 border rounded"
                placeholder="e.g., Offset 2024 Q1 company emissions"
              />
            </div>

            <div>
              <label className="block mb-1">Beneficiary</label>
              <input
                name="beneficiary"
                type="text"
                required
                className="w-full px-4 py-2 border rounded"
                placeholder="e.g., Company Name Inc"
              />
            </div>

            <button
              type="submit"
              className="bg-token text-white px-6 py-2 rounded hover:bg-purple-600"
            >
              🔥 Retire Credits
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Retirement History</h2>
          {retirements.length === 0 ? (
            <p className="text-gray-600">No retirements yet</p>
          ) : (
            <div className="space-y-4">
              {retirements.map((retirement) => (
                <div key={retirement.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Certificate: {retirement.certificateId}</h3>
                      <p className="text-sm text-gray-600">
                        {retirement.quantity} credits retired
                      </p>
                      <p className="text-sm text-gray-600">
                        Serials: {retirement.serialStart} - {retirement.serialEnd}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(retirement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {retirement.chainBurnTx && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Token Burned
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
