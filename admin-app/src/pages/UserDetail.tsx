import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById } from "../api/user";
import { getContractsByUser, updateContract } from "../api/contract";
import { getClaimsByUser, updateClaimStatus } from "../api/claim";
import "./UserDetail.css";

type Tab = "contracts" | "claims";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>("contracts");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [u, c, cl] = await Promise.all([
          getUserById(id!),
          getContractsByUser(id!),
          getClaimsByUser(id!),
        ]);
        setUser(u);
        setContracts(c);
        setClaims(cl);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleContractStatus = async (contractId: string, status: string) => {
    const updated = await updateContract(contractId, { status });
    setContracts((prev) => prev.map((c) => (c.id === contractId ? updated : c)));
  };

  const handleClaimStatus = async (claimId: string, status: string) => {
    const updated = await updateClaimStatus(claimId, status);
    setClaims((prev) => prev.map((c) => (c.id === claimId ? updated : c)));
  };

  if (loading) return <div className="detail-loading">Loading...</div>;
  if (!user) return <div className="detail-loading">User not found.</div>;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate("/")}>← Back</button>

      <div className="user-card">
        <div className="user-avatar">{user.firstName?.[0]}{user.lastName?.[0]}</div>
        <div className="user-info">
          <h2>{user.firstName} {user.lastName}</h2>
          <p>{user.email}</p>
          <span className="employee-badge">{user.employeeId}</span>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === "contracts" ? "tab active" : "tab"} onClick={() => setTab("contracts")}>
          Contracts ({contracts.length})
        </button>
        <button className={tab === "claims" ? "tab active" : "tab"} onClick={() => setTab("claims")}>
          Claims ({claims.length})
        </button>
      </div>

      {tab === "contracts" && (
        <table className="detail-table">
          <thead>
            <tr>
              <th>Contract #</th>
              <th>Type</th>
              <th>Status</th>
              <th>Start</th>
              <th>End</th>
              <th>Premium</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr><td colSpan={7} className="no-data">No contracts</td></tr>
            ) : contracts.map((c) => (
              <tr key={c.id}>
                <td>{c.contractNumber}</td>
                <td>{c.type}</td>
                <td><span className={`badge badge-${c.status?.toLowerCase()}`}>{c.status}</span></td>
                <td>{c.startDate}</td>
                <td>{c.endDate}</td>
                <td>${c.premium}</td>
                <td>
                  <select
                    value={c.status}
                    onChange={(e) => handleContractStatus(c.id, e.target.value)}
                  >
                    <option>ACTIVE</option>
                    <option>PENDING</option>
                    <option>EXPIRED</option>
                    <option>CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "claims" && (
        <table className="detail-table">
          <thead>
            <tr>
              <th>Claim #</th>
              <th>Description</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Submitted</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {claims.length === 0 ? (
              <tr><td colSpan={6} className="no-data">No claims</td></tr>
            ) : claims.map((c) => (
              <tr key={c.id}>
                <td>{c.claimNumber}</td>
                <td>{c.description}</td>
                <td><span className={`badge badge-${c.status?.toLowerCase()}`}>{c.status}</span></td>
                <td>${c.amount}</td>
                <td>{new Date(c.submittedAt).toLocaleDateString()}</td>
                <td>
                  <select
                    value={c.status}
                    onChange={(e) => handleClaimStatus(c.id, e.target.value)}
                  >
                    <option>SUBMITTED</option>
                    <option>UNDER_REVIEW</option>
                    <option>APPROVED</option>
                    <option>REJECTED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
