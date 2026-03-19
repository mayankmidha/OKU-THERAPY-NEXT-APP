import { redirect } from 'next/navigation'

export default function LegacyTherapistDashboardPage() {
  redirect('/practitioner/dashboard')
}
