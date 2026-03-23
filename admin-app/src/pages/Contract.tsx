import { useEffect, useState } from 'react'
import './Contract.css'
import { getContractsByUser } from '../api/contract'
import type { Contract } from '../constants/appData'

const typeColors: Record<string, string> = {
  Auto: 'type-auto',
  Habitation: 'type-hab',
  Santé: 'type-sante',
}

export default function ContractPage() {
  const [selected, setSelected] = useState<Contract | null>(null)
  const [search, setSearch] = useState('')
  const [contracts, setContracts] = useState<Contract[]>([]);
  useEffect(() => {
    // Simulate an API call to fetch contracts
    async function getContracts(){
      getContractsByUser('12345678').then(data => {
        console.log('Fetched contracts:', data);
        setContracts(data);
      }).catch(err => {
        console.error('Error fetching contracts:', err)
      })
    }
    getContracts();
  }, [])

  const filtered = contracts.filter(
    c =>
      c.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.client.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="contract">
        {/* Contract header */}
      <div className="contract-header">
        <div>
          <h1 className="contract-title">Contrats</h1>
          <p className="contract-subtitle">Contract Management for clients</p>
        </div>
      </div>
        {/* Contract body */}
      <div className="contract-body">
        <div className="contract-toolbar">
          <div className="contract-section-title">
            {/* Contract icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 2 L14 2 L20 8 L20 22 L4 22 Z"/>
              <path d="M14 2 L14 8 L20 8"/>
              <line x1="8" y1="13" x2="16" y2="13"/>
              <line x1="8" y1="17" x2="16" y2="17"/>
            </svg>
            <span>Contract Management</span>
            <span className="contract-count">{filtered.length} saved contrat(s)</span>
          </div>
          {/* Contract Search */}
          <div className="contract-search-wrap">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="contract-search"
              placeholder="Rechercher client ou contrat..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <table className="contract-table">
          <thead>
            <tr>
              <th>Contract N°</th>
              <th>Client</th>
              <th>Type</th>
              <th>Payment Method</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.contractNumber} className="contract-row">
                <td><span className="contract-id">{c.contractNumber}</span></td>
                <td>{c.client}</td>
                <td>
                  <span className={`contract-type ${typeColors[c.type]}`}>
                    {c.type}
                  </span>
                </td>
                <td>{c.paymentMethod.toString()}</td>
                <td>{c.startDate}</td>
                <td>{c.endDate}</td>
                <td>
                  <span className={`contract-status ${c.status === 'En cours' ? 'status-active' : c.status === 'Expiré' ? 'status-expired' : 'status-suspended'}`}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <button className="btn-view" onClick={() => setSelected(c)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        {/* Contract modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Contrat {selected.contractNumber}</h2>
                <span className={`contract-type ${typeColors[selected.type]}`} style={{marginTop: '8px', display:'inline-flex'}}>
                  {selected.type}
                </span>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="modal-grid">
              <div className="modal-field">
                <span className="field-label">Client</span>
                <span className="field-value">{selected.client}</span>
              </div>
              {/* <div className="modal-field">
                <span className="field-label">Payment Method</span>
                <span className="field-value">{selected.pack}</span>
              </div> */}
              <div className="modal-field">
                <span className="field-label">Status</span>
                <span className={`contract-status ${selected.status === 'En cours' ? 'status-active' : 'status-expired'}`}>{selected.status}</span>
              </div>
              <div className="modal-field">
                <span className="field-label">Payment Method</span>
                <span className="field-value">{selected.paymentMethod}</span>
              </div>
              <div className="modal-field">
                <span className="field-label">Start Date</span>
                <span className="field-value">{selected.startDate}</span>
              </div>
              <div className="modal-field">
                <span className="field-label">End Date</span>
                <span className="field-value">{selected.endDate}</span>
              </div>
              <div className="modal-field">
                <span className="field-label">Net Premium</span>
                <span className="field-value">{selected.netPremium}</span>
              </div>
              <div className="modal-field">
                <span className="field-label">Fees</span>
                <span className="field-value">{selected.fees}</span>
              </div>
              <div className="modal-field">
                <span className="field-label">Taxes</span>
                <span className="field-value">{selected.taxes}</span>
              </div>
              <div className="modal-field">
                <span className="field-label">FG</span>
                <span className="field-value">{selected.fg}</span>
              </div>
              <div className="modal-field">
                <span className="field-label">Total Premium</span>
                <span className="field-value highlight">{selected.totalPremium}</span>
              </div>
              {selected.brand && (
                <div className="modal-field">
                  <span className="field-label">Brand</span>
                  <span className="field-value">{selected.brand}</span>
                </div>
              )}
              {selected.registration && (
                <div className="modal-field">
                  <span className="field-label">Registration</span>
                  <span className="field-value">{selected.registration}</span>
                </div>
              )}
              {selected.marketValue && (
                <div className="modal-field">
                  <span className="field-label">Market Value</span>
                  <span className="field-value">{selected.marketValue}</span>
                </div>
              )}
              {selected.drivingLicenseNumber && (
                <div className="modal-field">
                  <span className="field-label">Driving License N°</span>
                  <span className="field-value">{selected.drivingLicenseNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}