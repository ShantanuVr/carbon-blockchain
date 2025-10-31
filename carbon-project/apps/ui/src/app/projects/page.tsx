'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProjects();
  }, [router]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/list');
      setProjects(res.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      }
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await api.post('/projects', {
        code: formData.get('code'),
        type: formData.get('type'),
        metadata: {},
      });
      alert('Project created!');
      e.currentTarget.reset();
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Projects & Evidence</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Project</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block mb-1">Project Code</label>
              <input
                name="code"
                type="text"
                required
                className="w-full px-4 py-2 border rounded"
                placeholder="PRJ-WIND-001"
              />
            </div>
            <div>
              <label className="block mb-1">Project Type</label>
              <select name="type" className="w-full px-4 py-2 border rounded" required>
                <option value="WIND">Wind</option>
                <option value="SOLAR">Solar</option>
                <option value="HYDRO">Hydro</option>
                <option value="RENEWABLE_ENERGY">Renewable Energy</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-evidence text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Create Project
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-600">No projects yet. Create one above.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded p-4">
                  <h3 className="font-semibold">{project.code}</h3>
                  <p className="text-sm text-gray-600">Type: {project.type}</p>
                  <p className="text-sm text-gray-600">Evidence: {project.evidence?.length || 0} files</p>
                  <p className="text-sm text-gray-600">Classes: {project.classes?.length || 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

