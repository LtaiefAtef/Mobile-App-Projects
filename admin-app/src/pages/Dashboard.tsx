import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../api/user";
import "./Dashboard.css";

export default function Dashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async (keyword?: string) => {
    try {
      setLoading(true);
      const data = await getUsers(keyword);
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchUsers(val || undefined);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="search-bar">
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="no-data">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.employeeId}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/users/${user.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
