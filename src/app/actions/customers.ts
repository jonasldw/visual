'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api-client'
import type { CustomerCreate, CustomerUpdate } from '@/lib/api-client'

export interface ActionState {
  success: boolean
  error?: string
  message?: string
  customer?: any
}

function extractCustomerData(formData: FormData): CustomerCreate {
  return {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    email: formData.get('email') as string || undefined,
    phone: formData.get('phone') as string || undefined,
    mobile: formData.get('mobile') as string || undefined,
    date_of_birth: formData.get('date_of_birth') as string || undefined,
    address_street: formData.get('address_street') as string || undefined,
    address_city: formData.get('address_city') as string || undefined,
    address_postal_code: formData.get('address_postal_code') as string || undefined,
    address_country: formData.get('address_country') as string || undefined,
    insurance_provider: formData.get('insurance_provider') as string || undefined,
    insurance_type: formData.get('insurance_type') as any || undefined,
    insurance_number: formData.get('insurance_number') as string || undefined,
    last_exam_date: formData.get('last_exam_date') as string || undefined,
    next_appointment: formData.get('next_appointment') as string || undefined,
    prescription_sphere_right: formData.get('prescription_sphere_right') ? Number(formData.get('prescription_sphere_right')) : undefined,
    prescription_sphere_left: formData.get('prescription_sphere_left') ? Number(formData.get('prescription_sphere_left')) : undefined,
    prescription_cylinder_right: formData.get('prescription_cylinder_right') ? Number(formData.get('prescription_cylinder_right')) : undefined,
    prescription_cylinder_left: formData.get('prescription_cylinder_left') ? Number(formData.get('prescription_cylinder_left')) : undefined,
    prescription_axis_right: formData.get('prescription_axis_right') ? Number(formData.get('prescription_axis_right')) : undefined,
    prescription_axis_left: formData.get('prescription_axis_left') ? Number(formData.get('prescription_axis_left')) : undefined,
    prescription_addition: formData.get('prescription_addition') ? Number(formData.get('prescription_addition')) : undefined,
    prescription_pd: formData.get('prescription_pd') ? Number(formData.get('prescription_pd')) : undefined,
    allergies: formData.get('allergies') as string || undefined,
    medical_notes: formData.get('medical_notes') as string || undefined,
    frame_preferences: formData.get('frame_preferences') as string || undefined,
    contact_preference: formData.get('contact_preference') as string || undefined,
    status: formData.get('status') as any || 'aktiv',
  }
}

export async function createCustomerAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const customerData = extractCustomerData(formData)
    
    // Basic validation
    if (!customerData.first_name || !customerData.last_name) {
      return {
        success: false,
        error: 'Vor- und Nachname sind erforderlich'
      }
    }

    const customer = await api.customers.create(customerData)
    revalidatePath('/')
    
    return {
      success: true,
      customer,
      message: 'Kunde erfolgreich erstellt'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Erstellen des Kunden'
    }
  }
}

export async function updateCustomerAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const customerId = formData.get('customer_id')
    if (!customerId) {
      return {
        success: false,
        error: 'Kunden-ID fehlt'
      }
    }

    const customerData = extractCustomerData(formData)
    
    // Basic validation
    if (!customerData.first_name || !customerData.last_name) {
      return {
        success: false,
        error: 'Vor- und Nachname sind erforderlich'
      }
    }

    const customer = await api.customers.update(Number(customerId), customerData)
    revalidatePath('/')
    
    return {
      success: true,
      customer,
      message: 'Kunde erfolgreich aktualisiert'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Kunden'
    }
  }
}