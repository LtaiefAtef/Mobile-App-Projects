import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../api/user";
import "./Dashboard.css";

export default function Dashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const filtered = [];

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

  return (
    <div className="dashboard">
        {/* Dashboard header */}
        <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Dashboard</h1>
              <p className="dashboard-subtitle">Overall view of the application</p>
            </div>
        </div>
        {/* Dashboard Search */}
        {/* <div className="dashboard-body">
            <div className="dashboard-search-wrap">
              <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="dashboard-search"
                placeholder="Rechercher client ou contrat..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
        </div> */}
    </div>
  );
}
