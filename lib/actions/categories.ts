// NEW FEATURE - Categories Actions
"use server"

import { createServerClient } from "@/lib/supabase/server"
import type { Category, Subcategory, CategoryWithSubcategories } from "@/lib/types/categories"

export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("[v0] Error fetching categories:", error)
    throw new Error("Erro ao buscar categorias")
  }

  return data || []
}

export async function getCategoriesWithSubcategories(): Promise<CategoryWithSubcategories[]> {
  const supabase = await createServerClient()

  const { data: categories, error: categoriesError } = await supabase.from("categories").select("*").order("name")

  if (categoriesError) {
    console.error("[v0] Error fetching categories:", categoriesError)
    throw new Error("Erro ao buscar categorias")
  }

  const { data: subcategories, error: subcategoriesError } = await supabase
    .from("subcategories")
    .select("*")
    .order("name")

  if (subcategoriesError) {
    console.error("[v0] Error fetching subcategories:", subcategoriesError)
    throw new Error("Erro ao buscar subcategorias")
  }

  // Group subcategories by category
  const categoriesWithSubs: CategoryWithSubcategories[] = (categories || []).map((category) => ({
    ...category,
    subcategories: (subcategories || []).filter((sub) => sub.category_id === category.id),
  }))

  return categoriesWithSubs
}

export async function getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("subcategories").select("*").eq("category_id", categoryId).order("name")

  if (error) {
    console.error("[v0] Error fetching subcategories:", error)
    throw new Error("Erro ao buscar subcategorias")
  }

  return data || []
}
