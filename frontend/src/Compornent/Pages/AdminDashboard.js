import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Admin.css";

const TABS = ["Overview", "Users", "Products", "Reports"];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState({ users: 0, activeListings: 0, completedDeals: 0, reportedConversations: 0 });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const getToken = () => localStorage.getItem("unimart_token");

  const apiFetch = async (path, options = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, u, p, r] = await Promise.all([
        apiFetch("/admin/stats"),
        apiFetch("/users?limit=50"),
        apiFetch("/admin/products/pending"),
        apiFetch("/admin/reports"),
      ]);
      setStats(s);
      setUsers(u.users || []);
      setProducts(p || []);
      setReports(r || []);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    setActionLoading(userId);
    try {
      await apiFetch(`/users/${userId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, status } : u));
    } catch (err) { console.error(err); }
    finally { setActionLoading(""); }
  };

  const approveProduct = async (productId) => {
    setActionLoading(productId);
    try {
      await apiFetch(`/admin/products/${productId}/approve`, { method: "PATCH" });
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) { console.error(err); }
    finally { setActionLoading(""); }
  };

  const StatCard = ({ icon, label, value, color }) => (
    <div className={`admin-stat-card admin-stat-card--${color}`}>
      <div className="admin-stat-icon">{icon}</div>
      <div>
        <p className="admin-stat-value">{loading ? "..." : value}</p>
        <p className="admin-stat-label">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage UniMart Marketplace</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchAll}>Refresh</button>
        </div>

        <div className="admin-tabs">
          {TABS.map(t => (
            <button key={t} className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t === "Reports" && reports.length > 0 && <span className="tab-alert">{reports.length}</span>}
              {t === "Products" && products.length > 0 && <span className="tab-alert tab-alert--orange">{products.length}</span>}
              {t}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="fade-in">
            <div className="admin-stats-grid">
              <StatCard icon="👥" label="Total Users" value={stats.users} color="blue" />
              <StatCard icon="🛍️" label="Active Listings" value={stats.activeListings} color="orange" />
              <StatCard icon="✅" label="Completed Deals" value={stats.completedDeals} color="green" />
              <StatCard icon="🚩" label="Reported Chats" value={stats.reportedConversations} color="red" />
            </div>
            <div className="admin-overview-grid">
              <div className="admin-card">
                <div className="admin-card__header">
                  <h3>Recent Users</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab("Users")}>View All</button>
                </div>
                {users.slice(0, 5).map(u => (
                  <div key={u._id} className="admin-row">
                    <div className="admin-row__avatar">{u.name?.charAt(0)}</div>
                    <div className="admin-row__info"><p>{u.name}</p><small>{u.email}</small></div>
                    <span className={`badge ${u.role === "admin" ? "badge-orange" : "badge-blue"}`}>{u.role}</span>
                    <span className={`badge ${u.status === "active" ? "badge-green" : "badge-red"}`}>{u.status}</span>
                  </div>
                ))}
                {users.length === 0 && !loading && <p className="admin-empty">No users found.</p>}
              </div>
              <div className="admin-card">
                <div className="admin-card__header">
                  <h3>Pending Approvals</h3>
                  <span className="badge badge-orange">{products.length} pending</span>
                </div>
                {products.length === 0
                  ? <p className="admin-empty">No pending approvals</p>
                  : products.slice(0, 5).map(p => (
                    <div key={p._id} className="admin-row">
                      <div className="admin-row__img">📦</div>
                      <div className="admin-row__info"><p>{p.title}</p><small>{p.seller?.name} · Rs. {p.price?.toLocaleString()}</small></div>
                      <button className="btn btn-green btn-sm" disabled={actionLoading === p._id} onClick={() => approveProduct(p._id)}>
                        {actionLoading === p._id ? "..." : "Approve"}
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {tab === "Users" && (
          <div className="admin-card fade-in">
            <div className="admin-card__header"><h3>All Users ({users.length})</h3></div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>User</th><th>Email</th><th>Faculty</th><th>Role</th><th>Seller</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td><div className="table-user"><div className="table-avatar">{u.name?.charAt(0)}</div><span>{u.name}</span></div></td>
                      <td><span className="table-email">{u.email}</span></td>
                      <td><span className="table-small">{u.faculty || "—"}</span></td>
                      <td><span className={`badge ${u.role === "admin" ? "badge-orange" : "badge-blue"}`}>{u.role}</span></td>
                      <td>{u.isSeller ? <span className="badge badge-green">Yes</span> : <span className="badge badge-gray">No</span>}</td>
                      <td><span className={`badge ${u.status === "active" ? "badge-green" : "badge-red"}`}>{u.status}</span></td>
                      <td><span className="table-small">{new Date(u.createdAt).toLocaleDateString()}</span></td>
                      <td>
                        {u.status === "active"
                          ? <button className="btn btn-ghost btn-sm" style={{color:"var(--danger)"}} disabled={actionLoading === u._id} onClick={() => updateUserStatus(u._id, "suspended")}>
                              {actionLoading === u._id ? "..." : "Suspend"}
                            </button>
                          : <button className="btn btn-ghost btn-sm" style={{color:"var(--green)"}} disabled={actionLoading === u._id} onClick={() => updateUserStatus(u._id, "active")}>
                              {actionLoading === u._id ? "..." : "Activate"}
                            </button>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "Products" && (
          <div className="admin-card fade-in">
            <div className="admin-card__header"><h3>Pending Approvals ({products.length})</h3></div>
            {products.length === 0
              ? <p className="admin-empty" style={{padding:"40px", textAlign:"center"}}>All products approved!</p>
              : <div style={{display:"flex", flexDirection:"column", gap:12}}>
                  {products.map(p => (
                    <div key={p._id} className="admin-product-row">
                      <div className="admin-product-img">📦</div>
                      <div className="admin-product-info">
                        <p className="admin-product-title">{p.title}</p>
                        <div className="admin-product-meta">
                          <span>👤 {p.seller?.name}</span>
                          <span>Rs. {p.price?.toLocaleString()}</span>
                          <span className="badge badge-blue">{p.category}</span>
                        </div>
                      </div>
                      <div className="admin-product-actions">
                        <button className="btn btn-green btn-sm" disabled={actionLoading === p._id} onClick={() => approveProduct(p._id)}>
                          {actionLoading === p._id ? "..." : "Approve"}
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{color:"var(--danger)"}}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {tab === "Reports" && (
          <div className="admin-card fade-in">
            <div className="admin-card__header"><h3>Reported Conversations ({reports.length})</h3></div>
            {reports.length === 0
              ? <p className="admin-empty" style={{padding:"40px", textAlign:"center"}}>No reported conversations!</p>
              : <div style={{display:"flex", flexDirection:"column", gap:12}}>
                  {reports.map(r => (
                    <div key={r._id} className="admin-report-row">
                      <div>
                        <p className="admin-report-title">About: <strong>{r.product?.title || "Unknown"}</strong></p>
                        <p className="admin-report-participants">Participants: {r.participants?.map(p => p.name).join(", ")}</p>
                        {r.reportReason && <p className="admin-report-reason">Reason: {r.reportReason}</p>}
                      </div>
                      <div style={{display:"flex", gap:8, flexShrink:0}}>
                        <button className="btn btn-ghost btn-sm">Review</button>
                        <button className="btn btn-ghost btn-sm" style={{color:"var(--danger)"}}>Ban</button>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;