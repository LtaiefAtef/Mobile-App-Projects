export interface Contract {
  id: string
  contractNumber: string
  insuranceCompany: string
  client: string
  type: 'Auto' | 'Habitation' | 'Santé'
  status: 'En cours' | 'Expiré' | 'Suspendu'
  pack: string
  paymentMethod: string
  startDate: string
  endDate: string
  netPremium: string
  fees: string
  taxes: string
  fg: string
  totalPremium: string
  brand?: string
  registration?: string
  marketValue?: string
  drivingLicenseNumber?: string
}
