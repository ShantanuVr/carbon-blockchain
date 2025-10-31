'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string>('');

  const handleSeed = async () => {
    if (!confirm('This will seed the database with demo data. Continue?')) {
      return;
    }

    setLoading(true);
    setOutput('Seeding database...\n');
    
    try {
      // Note: In production, this would be an API endpoint
      // For now, we'll just show a message
      setOutput('Seed functionality requires running: pnpm seed\n\nThis feature will be available via API in a future update.');
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSmoke = async () => {
    setLoading(true);
    setOutput('Running smoke tests...\n');
    
    try {
      // Note: In production, this would be an API endpoint
      setOutput('Smoke test functionality requires running: pnpm smoke\n\nThis feature will be available via API in a future update.');
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('This will reset the demo data. Are you sure?')) {
      return;
    }
    setOutput('Reset functionality coming soon...');
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Tools</h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Database</h2>
            <div className="space-y-3">
              <button
                onClick={handleSeed}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Seed Demo Data
              </button>
              <button
                onClick={handleSmoke}
                disabled={loading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                Run Smoke Tests
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                Reset Demo Data
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">System Info</h2>
            <div className="space-y-2 text-sm">
              <p><strong>API:</strong> http://localhost:4000</p>
              <p><strong>UI:</strong> http://localhost:3000</p>
              <p><strong>Chain:</strong> http://127.0.0.1:8545</p>
              <p className="mt-4 text-xs text-gray-500">
                Note: Seed and smoke tests must be run from the terminal:
                <br />
                <code className="bg-gray-100 px-2 py-1 rounded">pnpm seed</code>
                <br />
                <code className="bg-gray-100 px-2 py-1 rounded">pnpm smoke</code>
              </p>
            </div>
          </div>
        </div>

        {output && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Output</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/projects"
              className="text-center bg-blue-50 hover:bg-blue-100 p-4 rounded border-2 border-blue-200"
            >
              Go to Projects
            </a>
            <a
              href="/issuance"
              className="text-center bg-green-50 hover:bg-green-100 p-4 rounded border-2 border-green-200"
            >
              Go to Issuance
            </a>
            <a
              href="/transfer"
              className="text-center bg-green-50 hover:bg-green-100 p-4 rounded border-2 border-green-200"
            >
              Go to Transfer
            </a>
            <a
              href="/explorer"
              className="text-center bg-purple-50 hover:bg-purple-100 p-4 rounded border-2 border-purple-200"
            >
              Go to Explorer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
