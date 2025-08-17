'use server'

import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api-client'
import type { ProductCreate, ProductType } from '@/lib/api-client'

export interface ActionState {
  success: boolean
  error?: string
  message?: string
  product?: unknown
}

function extractProductData(formData: FormData): ProductCreate {
  return {
    organization_id: 1,
    product_type: formData.get('product_type') as ProductType,
    sku: formData.get('sku') as string || undefined,
    name: formData.get('name') as string,
    brand: formData.get('brand') as string || undefined,
    model: formData.get('model') as string || undefined,
    frame_size: formData.get('frame_size') as string || undefined,
    frame_color: formData.get('frame_color') as string || undefined,
    lens_material: formData.get('lens_material') as string || undefined,
    lens_coating: formData.get('lens_coating') ? JSON.parse(formData.get('lens_coating') as string) as Record<string, unknown> : undefined,
    details: formData.get('details') ? JSON.parse(formData.get('details') as string) as Record<string, unknown> : undefined,
    current_price: formData.get('current_price') ? parseFloat(formData.get('current_price') as string) : 0,
    vat_rate: formData.get('vat_rate') ? parseFloat(formData.get('vat_rate') as string) / 100 : 0.19,
    insurance_eligible: formData.get('insurance_eligible') === 'true',
    active: formData.get('active') !== 'false', // Default to true unless explicitly false
  }
}

export async function createProductAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    // Debug: Log all form field names and values
    console.log('🔍 ProductForm FormData entries:')
    for (const [key, value] of formData.entries()) {
      console.log(`  "${key}": "${value}"`)
    }
    console.log(`🔍 Total FormData entries: ${Array.from(formData.entries()).length}`)
    
    const productData = extractProductData(formData)
    
    // Basic validation
    if (!productData.name || !productData.product_type) {
      return {
        success: false,
        error: 'Produktname und Produkttyp sind erforderlich'
      }
    }

    if (!productData.current_price || productData.current_price <= 0) {
      return {
        success: false,
        error: 'Ein gültiger Preis ist erforderlich'
      }
    }

    // Validate product type
    const validTypes: ProductType[] = ['frame', 'lens', 'contact_lens', 'accessory']
    if (!validTypes.includes(productData.product_type)) {
      return {
        success: false,
        error: 'Ungültiger Produkttyp'
      }
    }

    console.log('🔍 Product data to submit:', productData)
    console.log('🌐 API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
    
    const product = await api.products.create(productData)
    revalidatePath('/products')
    
    return {
      success: true,
      product,
      message: 'Produkt erfolgreich erstellt'
    }
  } catch (error) {
    console.error('❌ Server Action Error:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      type: typeof error,
      error
    })
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }
  }
}

export async function updateProductAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const productId = formData.get('product_id')
    if (!productId) {
      return {
        success: false,
        error: 'Produkt-ID fehlt'
      }
    }

    const productData = extractProductData(formData)
    
    // Basic validation
    if (!productData.name || !productData.product_type) {
      return {
        success: false,
        error: 'Produktname und Produkttyp sind erforderlich'
      }
    }

    if (!productData.current_price || productData.current_price <= 0) {
      return {
        success: false,
        error: 'Ein gültiger Preis ist erforderlich'
      }
    }

    // Validate product type
    const validTypes: ProductType[] = ['frame', 'lens', 'contact_lens', 'accessory']
    if (!validTypes.includes(productData.product_type)) {
      return {
        success: false,
        error: 'Ungültiger Produkttyp'
      }
    }

    const product = await api.products.update(Number(productId), productData, 1)
    revalidatePath('/products')
    
    return {
      success: true,
      product,
      message: 'Produkt erfolgreich aktualisiert'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Produkts'
    }
  }
}

export async function deleteProductAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const productId = formData.get('product_id')
    if (!productId) {
      return {
        success: false,
        error: 'Produkt-ID fehlt'
      }
    }

    await api.products.delete(Number(productId), 1)
    revalidatePath('/products')
    
    return {
      success: true,
      message: 'Produkt erfolgreich deaktiviert'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Deaktivieren des Produkts'
    }
  }
}