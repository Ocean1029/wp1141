"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalMessages: number;
  todayMessages: number;
  totalUsers: number;
  totalGames: number;
}

interface Message {
  id: string;
  content: string;
  sender: "USER" | "BOT" | "SYSTEM";
  createdAt: string;
  user?: {
    displayName: string;
    pictureUrl: string | null;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timeout")), 10000)
      );

      const [statsRes, msgsRes] = await Promise.race([
        Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/messages?limit=50"),
        ]),
        timeoutPromise,
      ]) as [Response, Response];

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        const errorData = await statsRes.json().catch(() => ({ error: "Failed to fetch stats" }));
        console.error("Stats API error:", errorData);
        const errorMsg = errorData.details 
          ? `${errorData.error}: ${errorData.details}` 
          : (errorData.error || "Failed to fetch stats");
        setError(errorMsg);
      }

      if (msgsRes.ok) {
        const data = await msgsRes.json();
        setMessages(data.data || []);
      } else {
        const errorData = await msgsRes.json().catch(() => ({ error: "Failed to fetch messages" }));
        console.error("Messages API error:", errorData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">Loading Dashboard...</div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchData();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🤖 Avalon Bot Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Messages" value={stats?.totalMessages || 0} />
          <StatCard title="Today's Messages" value={stats?.todayMessages || 0} color="bg-blue-500" />
          <StatCard title="Total Users" value={stats?.totalUsers || 0} color="bg-green-500" />
          <StatCard title="Total Games" value={stats?.totalGames || 0} color="bg-purple-500" />
        </div>

        {/* Live Logs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Live Logs (Last 50)</h2>
            <span className="text-sm text-gray-500 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live Updating
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          msg.sender === "BOT"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {msg.sender === "BOT" ? "🤖 AI" : msg.user?.displayName || "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                      {msg.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color = "bg-indigo-500" }: { title: string; value: number; color?: string }) {
  return (
    <div className="bg-white overflow-hidden rounded-lg shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`rounded-md p-3 ${color}`}>
              {/* Icon placeholder */}
              <div className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-3xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}


