import { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaEnvelope, FaClock, FaSyncAlt } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { serverUrl } from "../../constants/constant";

export default function Dashboard() {
    const [stats, setStats] = useState<{ users: number; messages: number; uptime: string; activeUsers: number; newMessages: number; usersInfo: { username: string; lastActiveTime: string }[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await axios.get(`${serverUrl}/admin/stats`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            {loading ? (
                <p className="text-center">Loading...</p>
            ) : stats ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card bg-base-200 shadow-lg p-4 flex items-center">
                            <FaUsers className="text-3xl mr-2" />
                            <div>
                                <h2 className="text-xl font-semibold">Total Users</h2>
                                <p className="text-lg">{stats.users}</p>
                            </div>
                        </div>
                        <div className="card bg-base-200 shadow-lg p-4 flex items-center">
                            <FaEnvelope className="text-3xl mr-2" />
                            <div>
                                <h2 className="text-xl font-semibold">Messages Sent</h2>
                                <p className="text-lg">{stats.messages}</p>
                            </div>
                        </div>
                        <div className="card bg-base-200 shadow-lg p-4 flex items-center">
                            <FaClock className="text-3xl mr-2" />
                            <div>
                                <h2 className="text-xl font-semibold">Server Uptime</h2>
                                <p className="text-lg">{stats.uptime}</p>
                            </div>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold mt-6">User Activity</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.usersInfo.map(user => ({ name: user.username, lastActive: new Date(user.lastActiveTime).getTime() }))}>
                            <XAxis dataKey="name" />
                            <YAxis domain={['dataMin', 'dataMax']} tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                            <Tooltip labelFormatter={(label) => `User: ${label}`} formatter={(value) => new Date(value as number).toLocaleString()} />
                            <Line type="monotone" dataKey="lastActive" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                    <h2 className="text-xl font-bold mt-6">All Users</h2>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Last Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.usersInfo.map((user, index) => (
                                    <tr key={index}>
                                        <td>{user.username}</td>
                                        <td>{new Date(user.lastActiveTime).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <p className="text-center text-red-500">Error fetching data</p>
            )}
            <button className="btn btn-primary mt-4 flex items-center" onClick={() => window.location.reload()}>
                <FaSyncAlt className="mr-2" /> Refresh
            </button>
        </div>
    );
}
