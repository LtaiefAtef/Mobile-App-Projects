import { useEffect, useState } from 'react';
import type { Claim } from '../constants/appData';
import './Claim.css';
import { getAllClaims } from '../api/claim';

export default function Claims() {
    const [selected, setSelected] = useState<Claim | null>(null)
    const [search, setSearch] = useState('')
    const [claims, setClaims] = useState<Claim[]>([]);

    useEffect(() => {
        async function getClaims() {
            await getAllClaims().then((data) => {
                setClaims(data);
            }).catch((err) => {
                console.log("Error claims", err);
            })
        }
        getClaims();
    }, []);

    const filtered = claims.filter(c =>
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.driver.driverA.fullName.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="claim">
            {/* Claim header */}
            <div className="claim-header">
                <div>
                    <h1 className="claim-title">Claims</h1>
                    <p className="claim-subtitle">Claims Management for clients</p>
                </div>
            </div>

            {/* Claim body */}
            <div className="claim-body">
                <div className="claim-toolbar">
                    <div className="claim-section-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 2 L14 2 L20 8 L20 22 L4 22 Z" />
                            <path d="M14 2 L14 8 L20 8" />
                            <line x1="8" y1="13" x2="16" y2="13" />
                            <line x1="8" y1="17" x2="16" y2="17" />
                        </svg>
                        <span>Claims Management</span>
                        <span className="claim-count">{filtered.length} saved claim(s)</span>
                    </div>
                    <div className="claim-search-wrap">
                        <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            className="claim-search"
                            placeholder="Search Claim"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <table className="claim-table">
                    <thead>
                        <tr>
                            <th>Claim N°</th>
                            <th>Accident Date</th>
                            <th>Location</th>
                            <th>Driver A</th>
                            <th>Driver B</th>
                            <th>Injuries</th>
                            <th>Submitted At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(c => (
                            <tr key={c.id} className="claim-row">
                                <td><span className="claim-id">{c.id}</span></td>
                                <td>{c.accidentDate}</td>
                                <td>{c.accidentLocation}</td>
                                <td>{c.driver.driverA.fullName}</td>
                                <td>{c.driver.driverB.fullName}</td>
                                <td>
                                    <span className={`claim-status ${c.injuries.anyInjuries ? 'status-suspended' : 'status-active'}`}>
                                        {c.injuries.anyInjuries ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td>{c.submittedAt}</td>
                                <td>
                                    <button className="btn-view" onClick={() => setSelected(c)}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Claim modal */}
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Claim {selected.id}</h2>
                                <span
                                    className={`claim-status ${selected.injuries.anyInjuries ? 'status-suspended' : 'status-active'}`}
                                    style={{ marginTop: '8px', display: 'inline-flex' }}
                                >
                                    {selected.injuries.anyInjuries ? 'Injuries Reported' : 'No Injuries'}
                                </span>
                            </div>
                            <button className="modal-close" onClick={() => setSelected(null)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* ── Section: Accident Info ── */}
                        <div className="modal-section">
                            <div className="modal-section-header">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                Accident Info
                            </div>
                            <div className="modal-grid">
                                <div className="modal-field">
                                    <span className="field-label">Accident Date</span>
                                    <span className="field-value">{selected.accidentDate}</span>
                                </div>
                                <div className="modal-field">
                                    <span className="field-label">Submitted At</span>
                                    <span className="field-value">{selected.submittedAt}</span>
                                </div>
                                <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                                    <span className="field-label">Location</span>
                                    <span className="field-value">{selected.accidentLocation}</span>
                                </div>
                                <div className="modal-field">
                                    <span className="field-label">Injuries</span>
                                    <span className="field-value">{selected.injuries.anyInjuries ? 'Yes' : 'No'}</span>
                                </div>
                                {selected.injuries.injuryDetails && (
                                    <div className="modal-field">
                                        <span className="field-label">Injury Details</span>
                                        <span className="field-value">{selected.injuries.injuryDetails}</span>
                                    </div>
                                )}
                                <div className="modal-field">
                                    <span className="field-label">Other Vehicles Involved</span>
                                    <span className="field-value">{selected.otherVehiclesDamaged.otherVehicleInvolved ? 'Yes' : 'No'}</span>
                                </div>
                                {selected.otherVehiclesDamaged.numberOfVehicles && (
                                    <div className="modal-field">
                                        <span className="field-label">Number of Vehicles</span>
                                        <span className="field-value">{selected.otherVehiclesDamaged.numberOfVehicles}</span>
                                    </div>
                                )}
                                <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                                    <span className="field-label">Visible Damage</span>
                                    <span className="field-value">{selected.visibleDamage}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Section: Drivers ── */}
                        <div className="modal-section">
                            <div className="modal-section-header">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                Drivers
                            </div>
                            <div className="modal-grid">
                                <div className="modal-field">
                                    <span className="field-label">Driver A — Full Name</span>
                                    <span className="field-value">{selected.driver.driverA.fullName}</span>
                                </div>
                                <div className="modal-field">
                                    <span className="field-label">Driver A — License</span>
                                    <span className="field-value">{selected.driver.driverA.license}</span>
                                </div>
                                <div className="modal-field">
                                    <span className="field-label">Driver A — Date of Birth</span>
                                    <span className="field-value">{selected.driver.driverA.dateOfBirth}</span>
                                </div>
                                <div className="modal-field">
                                    <span className="field-label">Driver A — Address</span>
                                    <span className="field-value">{selected.driver.driverA.address}</span>
                                </div>

                                <div className="modal-divider" />

                                <div className="modal-field">
                                    <span className="field-label">Driver B — Full Name</span>
                                    <span className="field-value">{selected.driver.driverB.fullName}</span>
                                </div>
                                <div className="modal-field">
                                    <span className="field-label">Driver B — License</span>
                                    <span className="field-value">{selected.driver.driverB.license}</span>
                                </div>
                                <div className="modal-field">
                                    <span className="field-label">Driver B — Date of Birth</span>
                                    <span className="field-value">{selected.driver.driverB.dateOfBirth}</span>
                                </div>
                                <div className="modal-field">
                                    <span className="field-label">Driver B — Address</span>
                                    <span className="field-value">{selected.driver.driverB.address}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Section: Insurance ── */}
                        <div className="modal-section">
                            <div className="modal-section-header">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                Insurance
                            </div>
                            <div className="modal-grid">
                                <div className="modal-field">
                                    <span className="field-label">Vehicle A — Company</span>
                                    <span className="field-value">{selected.insuranceCompany.vehicleA.companyName}</span>
                                </div>
                                <div className="modal-field">
                                    <span className="field-label">Vehicle A — Contract N°</span>
                                    <span className="field-value">{selected.insuranceCompany.vehicleA.contractNumber}</span>
                                </div>
                                <div className="modal-field">
                                    <span className="field-label">Vehicle B — Company</span>
                                    <span className="field-value">{selected.insuranceCompany.vehicleB.companyName}</span>
                                </div>
                                <div className="modal-field">
                                    <span className="field-label">Vehicle B — Contract N°</span>
                                    <span className="field-value">{selected.insuranceCompany.vehicleB.contractNumber}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Section: Perspectives ── */}
                        <div className="modal-section">
                            <div className="modal-section-header">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                Accident Perspectives
                            </div>
                            <div className="modal-grid">
                                <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                                    <span className="field-label">Driver A</span>
                                    <span className="field-value">{selected.accidentPerspective.driverA}</span>
                                </div>
                                <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                                    <span className="field-label">Driver B</span>
                                    <span className="field-value">{selected.accidentPerspective.driverB}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Section: Signatures & Witnesses ── */}
                        <div className="modal-section">
                            <div className="modal-section-header">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                                    <path d="M9 13h6M9 17h3" />
                                </svg>
                                Signatures & Witnesses
                            </div>
                            <div className="modal-grid">
                                <div className="modal-field">
                                    <span className="field-label">Vehicle A — Signed</span>
                                    <span className="field-value">
                                        {selected.signatures.vehicleA.signed ? `Yes — ${selected.signatures.vehicleA.signedAt}` : 'No'}
                                    </span>
                                </div>
                                <div className="modal-field">
                                    <span className="field-label">Vehicle B — Signed</span>
                                    <span className="field-value">
                                        {selected.signatures.vehicleB.signed ? `Yes — ${selected.signatures.vehicleB.signedAt}` : 'No'}
                                    </span>
                                </div>
                                {selected.witnesses.length > 0 && (
                                    <div className="modal-field" style={{ gridColumn: 'span 2' }}>
                                        <span className="field-label">Witnesses</span>
                                        {selected.witnesses.map((w, i) => (
                                            <span key={i} className="field-value">{w.fullName} — {w.address}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}