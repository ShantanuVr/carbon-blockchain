'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function IssuancePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [projectsRes, classesRes] = await Promise.all([
        api.get('/projects/list'),
        api.get('/classes'),
      ]);
      setProjects(projectsRes.data);
      setClasses(classesRes.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      }
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await api.post('/classes', {
        projectId: formData.get('projectId'),
        vintage: parseInt(formData.get('vintage') as string),
        quantity: parseInt(formData.get('quantity') as string),
      });
      alert(`Class created! ID: ${res.data.id}`);
      e.currentTarget.reset();
      fetchData(); // Refresh classes list
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
        <h1 className="text-3xl font-bold mb-6">Credit Issuance</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Credit Class</h2>
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div>
              <label className="block mb-1">Project</label>
              <select
                name="projectId"
                required
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">Select project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.code} ({project.type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Vintage</label>
              <input
                name="vintage"
                type="number"
                required
                min="2000"
                max="2100"
                className="w-full px-4 py-2 border rounded"
                placeholder="2024"
                defaultValue={new Date().getFullYear()}
              />
            </div>
            <div>
              <label className="block mb-1">Quantity</label>
              <input
                name="quantity"
                type="number"
                required
                min="1"
                className="w-full px-4 py-2 border rounded"
                placeholder="10000"
              />
            </div>
            <button
              type="submit"
              className="bg-registry text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Create Class
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Credit Classes</h2>
          {classes.length === 0 ? (
            <p className="text-gray-600">No credit classes yet. Create one above.</p>
          ) : (
            <div className="space-y-4">
              {classes.map((cls) => (
                <div key={cls.id} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {cls.project.code} - Vintage {cls.vintage}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {cls.quantity} credits
                      </p>
                      <p className="text-sm text-gray-600">
                        Serials: {cls.serialBase} - {cls.serialTop}
                      </p>
                      <p className="text-xs text-gray-500">Class ID: {cls.id}</p>
                    </div>
                    {cls.tokenId && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Token: {cls.tokenId}
                      </span>
                    )}
                  </div>
                  {cls.holdings && cls.holdings.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-gray-500">Holdings:</p>
                      {cls.holdings.map((h: any) => (
                        <p key={h.id} className="text-xs text-gray-600">
                          {h.orgId}: {h.quantity} credits
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

