import { useState } from 'react'
import './CreateContract.css'
import { createContract } from '../api/contract'

const CONTRACT_TYPES = ['Auto', 'Home', 'Health'] as const
const PAYMENT_METHODS = ['Bank Transfer', 'Check', 'Direct Debit', 'Cash'] as const
const STATUS_OPTIONS = ['Active', 'Expired', 'Suspended'] as const

type ContractType = typeof CONTRACT_TYPES[number]

interface FormData {
  contractNumber: string
  client: string
  type: ContractType | ''
  paymentMethod: string
  startDate: string
  endDate: string
  status: string
  netPremium: string
  fees: string
  taxes: string
  fg: string
  brand: string
  registration: string
  marketValue: string
  drivingLicenseNumber: string
}

const initialForm: FormData = {
  contractNumber: '',
  client: '',
  type: '',
  paymentMethod: '',
  startDate: '',
  endDate: '',
  status: 'Active',
  netPremium: '',
  fees: '',
  taxes: '',
  fg: '',
  brand: '',
  registration: '',
  marketValue: '',
  drivingLicenseNumber: '',
}

const typeColors: Record<string, string> = {
  Auto: 'type-auto',
  Home: 'type-home',
  Health: 'type-health',
}

export default function CreateContractPage() {
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const set = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const totalPremium = () => {
    const n = parseFloat(form.netPremium) || 0
    const f = parseFloat(form.fees) || 0
    const t = parseFloat(form.taxes) || 0
    const g = parseFloat(form.fg) || 0
    return (n + f + t + g).toFixed(2)
  }

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.contractNumber.trim()) e.contractNumber = 'Required'
    if (!form.client.trim()) e.client = 'Required'
    if (!form.type) e.type = 'Required'
    if (!form.paymentMethod) e.paymentMethod = 'Required'
    if (!form.startDate) e.startDate = 'Required'
    if (!form.endDate) e.endDate = 'Required'
    if (!form.netPremium) e.netPremium = 'Required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }
    const contract = { ...form, totalPremium: totalPremium() }
    console.log('Submitting contract:', contract)
    const res = createContract(contract)
    console.log('Response for created contract:', JSON.stringify(res))
    setSubmitted(true)
  }

  const handleReset = () => {
    setForm(initialForm)
    setErrors({})
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="contract">
        <div className="contract-header">
          <div>
            <h1 className="contract-title">New Contract</h1>
            <p className="contract-subtitle">Create a new insurance contract</p>
          </div>
        </div>
        <div className="contract-body">
          <div className="create-success">
            <div className="success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="7,12 10,15 17,9"/>
              </svg>
            </div>
            <h2 className="success-title">Contract Created Successfully</h2>
            <p className="success-sub">
              Contract <span className="success-id">{form.contractNumber}</span> has been saved for <strong>{form.client}</strong>.
            </p>
            <div className="success-summary">
              <div className="summary-row">
                <span className="field-label">Type</span>
                <span className={`contract-type ${typeColors[form.type]}`}>{form.type}</span>
              </div>
              <div className="summary-row">
                <span className="field-label">Total Premium</span>
                <span className="field-value highlight">{totalPremium()} TND</span>
              </div>
              <div className="summary-row">
                <span className="field-label">Period</span>
                <span className="field-value">{form.startDate} → {form.endDate}</span>
              </div>
            </div>
            <button className="btn-primary" onClick={handleReset}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="2" x2="8" y2="14"/>
                <line x1="2" y1="8" x2="14" y2="8"/>
              </svg>
              Create Another Contract
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="contract">
      <div className="contract-header">
        <div>
          <h1 className="contract-title">New Contract</h1>
          <p className="contract-subtitle">Create a new insurance contract</p>
        </div>
      </div>

      <div className="contract-body">
        {/* Toolbar */}
        <div className="contract-toolbar">
          <div className="contract-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 2 L14 2 L20 8 L20 22 L4 22 Z"/>
              <path d="M14 2 L14 8 L20 8"/>
              <line x1="8" y1="13" x2="16" y2="13"/>
              <line x1="8" y1="17" x2="16" y2="17"/>
            </svg>
            <span>New Contract</span>
            {form.type && (
              <span className={`contract-type ${typeColors[form.type]}`}>{form.type}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-ghost" onClick={handleReset}>Reset</button>
            <button className="btn-primary" onClick={handleSubmit}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="2" x2="8" y2="14"/>
                <line x1="2" y1="8" x2="14" y2="8"/>
              </svg>
              Save Contract
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="create-form">
          {/* Identification Section */}
          <div className="form-section">
            <div className="form-section-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              Identification
            </div>
            <div className="form-grid">
              <div className={`form-field ${errors.contractNumber ? 'has-error' : ''}`}>
                <label className="form-label">Contract No <span className="required">*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. CTR-2024-001"
                  value={form.contractNumber}
                  onChange={e => set('contractNumber', e.target.value)}
                />
                {errors.contractNumber && <span className="error-msg">{errors.contractNumber}</span>}
              </div>
              <div className={`form-field ${errors.client ? 'has-error' : ''}`}>
                <label className="form-label">Client <span className="required">*</span></label>
                <input
                  className="form-input"
                  placeholder="Full Name"
                  value={form.client}
                  onChange={e => set('client', e.target.value)}
                />
                {errors.client && <span className="error-msg">{errors.client}</span>}
              </div>
              <div className={`form-field ${errors.type ? 'has-error' : ''}`}>
                <label className="form-label">Type <span className="required">*</span></label>
                <div className="type-selector">
                  {CONTRACT_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`type-btn ${form.type === t ? `active ${typeColors[t]}` : ''}`}
                      onClick={() => set('type', t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {errors.type && <span className="error-msg">{errors.type}</span>}
              </div>
              <div className="form-field">
                <label className="form-label">Status</label>
                <select
                  className="form-input form-select"
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dates & Payment Section */}
          <div className="form-section">
            <div className="form-section-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Dates & Payment
            </div>
            <div className="form-grid">
              <div className={`form-field ${errors.startDate ? 'has-error' : ''}`}>
                <label className="form-label">Start Date <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={form.startDate}
                  onChange={e => set('startDate', e.target.value)}
                />
                {errors.startDate && <span className="error-msg">{errors.startDate}</span>}
              </div>
              <div className={`form-field ${errors.endDate ? 'has-error' : ''}`}>
                <label className="form-label">End Date <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={form.endDate}
                  onChange={e => set('endDate', e.target.value)}
                />
                {errors.endDate && <span className="error-msg">{errors.endDate}</span>}
              </div>
              <div className={`form-field ${errors.paymentMethod ? 'has-error' : ''}`} style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Payment Method <span className="required">*</span></label>
                <div className="payment-selector">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m}
                      type="button"
                      className={`payment-btn ${form.paymentMethod === m ? 'active' : ''}`}
                      onClick={() => set('paymentMethod', m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {errors.paymentMethod && <span className="error-msg">{errors.paymentMethod}</span>}
              </div>
            </div>
          </div>

          {/* Premium Breakdown Section */}
          <div className="form-section">
            <div className="form-section-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              Premium Breakdown
            </div>
            <div className="form-grid">
              <div className={`form-field ${errors.netPremium ? 'has-error' : ''}`}>
                <label className="form-label">Net Premium <span className="required">*</span></label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={form.netPremium}
                    onChange={e => set('netPremium', e.target.value)}
                  />
                  <span className="input-unit">TND</span>
                </div>
                {errors.netPremium && <span className="error-msg">{errors.netPremium}</span>}
              </div>
              <div className="form-field">
                <label className="form-label">Fees</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={form.fees}
                    onChange={e => set('fees', e.target.value)}
                  />
                  <span className="input-unit">TND</span>
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Taxes</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={form.taxes}
                    onChange={e => set('taxes', e.target.value)}
                  />
                  <span className="input-unit">TND</span>
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">FG</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={form.fg}
                    onChange={e => set('fg', e.target.value)}
                  />
                  <span className="input-unit">TND</span>
                </div>
              </div>
            </div>
            <div className="total-bar">
              <span className="total-label">Total Premium</span>
              <span className="total-value">{totalPremium()} <span className="total-currency">TND</span></span>
            </div>
          </div>

          {/* Vehicle Details Section (Auto Only) */}
          {form.type === 'Auto' && (
            <div className="form-section form-section-auto">
              <div className="form-section-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="8" width="22" height="10" rx="2"/>
                  <path d="M5 8V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/>
                  <circle cx="7" cy="18" r="2"/>
                  <circle cx="17" cy="18" r="2"/>
                </svg>
                Vehicle Details
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Brand</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Toyota"
                    value={form.brand}
                    onChange={e => set('brand', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Registration</label>
                  <input
                    className="form-input"
                    placeholder="e.g. 123 TUN 4567"
                    value={form.registration}
                    onChange={e => set('registration', e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Market Value</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0.00"
                      value={form.marketValue}
                      onChange={e => set('marketValue', e.target.value)}
                    />
                    <span className="input-unit">TND</span>
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Driving License No</label>
                  <input
                    className="form-input"
                    placeholder="License number"
                    value={form.drivingLicenseNumber}
                    onChange={e => set('drivingLicenseNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}