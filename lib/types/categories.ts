// NEW FEATURE - Categories and Subcategories Types
export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  color?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  slug: string
  description?: string
  created_at: string
  updated_at: string
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[]
}
