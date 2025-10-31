'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

type TabType = 'credits' | 'tokens' | 'anchors';

export default function ExplorerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('credits');
  const [credits, setCredits] = useState<any>(null);
  const [tokens, setTokens] = useState<any>(null);
  const [anchors, setAnchors] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab: TabType) => {
    setLoading(true);
    try {
      if (tab === 'credits') {
        const res = await api.get('/explorer/credits');
        setCredits(res.data);
      } else if (tab === 'tokens') {
        const res = await api.get('/explorer/tokens');
        setTokens(res.data);
      } else if (tab === 'anchors') {
        const res = await api.get('/explorer/anchors');
        setAnchors(res.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Explorer</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('credits')}
            className={`pb-2 px-4 font-semibold ${
              activeTab === 'credits'
                ? 'border-b-2 border-registry text-registry'
                : 'text-gray-600'
            }`}
          >
            Credits
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`pb-2 px-4 font-semibold ${
              activeTab === 'tokens'
                ? 'border-b-2 border-token text-token'
                : 'text-gray-600'
            }`}
          >
            Tokens
          </button>
          <button
            onClick={() => setActiveTab('anchors')}
            className={`pb-2 px-4 font-semibold ${
              activeTab === 'anchors'
                ? 'border-b-2 border-evidence text-evidence'
                : 'text-gray-600'
            }`}
          >
            Anchors
          </button>
        </div>

        {/* Credits Tab */}
        {activeTab === 'credits' && (
          <div className="space-y-6">
            {/* Projects */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Projects</h2>
              {loading ? (
                <p>Loading...</p>
              ) : credits?.projects?.length > 0 ? (
                <div className="space-y-4">
                  {credits.projects.map((project: any) => (
                    <div key={project.id} className="border rounded p-4">
                      <h3 className="font-semibold">{project.code}</h3>
                      <p className="text-sm text-gray-600">Type: {project.type}</p>
                      <p className="text-sm text-gray-600">
                        Evidence: {project.evidence?.length || 0} files
                      </p>
                      <p className="text-sm text-gray-600">
                        Classes: {project.classes?.length || 0}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No projects found</p>
              )}
            </div>

            {/* Credit Classes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Credit Classes</h2>
              {credits?.classes?.length > 0 ? (
                <div className="space-y-4">
                  {credits.classes.map((cls: any) => (
                    <div key={cls.id} className="border rounded p-4">
                      <h3 className="font-semibold">
                        {cls.project.code} - Vintage {cls.vintage}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {cls.quantity} | Serials: {cls.serialBase}-{cls.serialTop}
                      </p>
                      {cls.tokenId && (
                        <p className="text-sm text-purple-600">Token ID: {cls.tokenId}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No classes found</p>
              )}
            </div>

            {/* Retirements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Retirements</h2>
              {credits?.retirements?.length > 0 ? (
                <div className="space-y-4">
                  {credits.retirements.map((ret: any) => (
                    <div key={ret.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                      <h3 className="font-semibold">Certificate: {ret.certificateId}</h3>
                      <p className="text-sm text-gray-600">
                        {ret.quantity} credits retired | Serials: {ret.serialStart}-{ret.serialEnd}
                      </p>
                      <p className="text-sm text-gray-600">
                        Project: {ret.class.project.code}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No retirements found</p>
              )}
            </div>
          </div>
        )}

        {/* Tokens Tab */}
        {activeTab === 'tokens' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">On-Chain Tokens</h2>
            {loading ? (
              <p>Loading...</p>
            ) : tokens?.tokens?.length > 0 ? (
              <div className="space-y-4">
                {tokens.tokens.map((token: any) => (
                  <div key={token.tokenId} className="border rounded p-4">
                    <h3 className="font-semibold">Token ID: {token.tokenId}</h3>
                    <p className="text-sm text-gray-600">Class ID: {token.classId}</p>
                    <p className="text-sm text-gray-600">
                      Mints: {token.mints?.length || 0}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No tokens found</p>
            )}
          </div>
        )}

        {/* Anchors Tab */}
        {activeTab === 'anchors' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Evidence Anchors</h2>
            {loading ? (
              <p>Loading...</p>
            ) : anchors?.anchors?.length > 0 ? (
              <div className="space-y-4">
                {anchors.anchors.map((anchor: any) => (
                  <div key={anchor.hash} className="border rounded p-4">
                    <p className="font-mono text-sm break-all">{anchor.hash}</p>
                    <p className="text-sm text-gray-600">URI: {anchor.uri}</p>
                    {anchor.txHash && (
                      <p className="text-sm text-blue-600">Tx: {anchor.txHash}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(anchor.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No anchors found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
