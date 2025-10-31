'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface HealthStatus {
  ok: boolean;
  services?: {
    db: boolean;
    chain: boolean;
    evidence: boolean;
    ipfs?: boolean;
  };
}

export default function ServiceHub() {
  const router = useRouter();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const fetchHealth = async () => {
    try {
      const res = await api.get('/health');
      setHealth(res.data);
    } catch {
      setHealth({ ok: false });
    }
  };

  const StatusIcon = ({ status }: { status?: boolean }) => (
    <span className={`text-xl ${status ? '✅' : '❌'}`} />
  );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">🌿 Carbon Credits Classroom</h1>
            <p className="text-gray-600 mb-8">Service Hub - Complete Carbon Credit Workflow</p>
          </div>
          {user && (
            <div className="text-right">
              <p className="text-sm text-gray-600">{user.email}</p>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  router.push('/login');
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Health Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <StatusIcon status={health?.services?.db} />
              <span>Database</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={health?.services?.chain} />
              <span>Blockchain</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={health?.services?.evidence} />
              <span>Evidence Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon status={health?.services?.ipfs} />
              <span>IPFS</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            title="Projects & Evidence"
            description="Create projects and upload evidence artifacts"
            href="/projects"
            color="evidence"
          />
          <FeatureCard
            title="Issuance"
            description="Create credit classes and finalize issuance"
            href="/issuance"
            color="registry"
          />
          <FeatureCard
            title="Transfer"
            description="Transfer credits between organizations"
            href="/transfer"
            color="registry"
          />
          <FeatureCard
            title="Retire"
            description="Retire credits and generate certificates"
            href="/retire"
            color="token"
          />
          <FeatureCard
            title="Explorer"
            description="Browse credits, tokens, and anchors"
            href="/explorer"
            color="evidence"
          />
          <FeatureCard
            title="Admin"
            description="Seed data and run smoke tests"
            href="/admin"
            color="token"
          />
        </div>

        {/* Authority Banner */}
        <div className="mt-8 bg-gradient-to-r from-green-100 via-purple-100 to-blue-100 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Authority Sources:</strong> Registry (Green) | Tokens (Purple) | Evidence (Blue)
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  href,
  color,
}: {
  title: string;
  description: string;
  href: string;
  color: 'registry' | 'token' | 'evidence';
}) {
  const colorClasses = {
    registry: 'border-green-500 bg-green-50 hover:bg-green-100',
    token: 'border-purple-500 bg-purple-50 hover:bg-purple-100',
    evidence: 'border-blue-500 bg-blue-50 hover:bg-blue-100',
  };

  return (
    <Link
      href={href}
      className={`block p-6 rounded-lg border-2 ${colorClasses[color]} transition-colors`}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}

