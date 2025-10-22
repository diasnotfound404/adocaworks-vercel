// NEW FEATURE - Category Selection Component
"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category, Subcategory } from "@/lib/types/categories"

interface CategorySelectProps {
  categoryId?: string
  subcategoryId?: string
  onCategoryChange: (categoryId: string) => void
  onSubcategoryChange: (subcategoryId: string) => void
  categories: Category[]
  subcategories: Subcategory[]
}

export function CategorySelect({
  categoryId,
  subcategoryId,
  onCategoryChange,
  onSubcategoryChange,
  categories,
  subcategories,
}: CategorySelectProps) {
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([])

  useEffect(() => {
    if (categoryId) {
      const filtered = subcategories.filter((sub) => sub.category_id === categoryId)
      setFilteredSubcategories(filtered)
    } else {
      setFilteredSubcategories([])
    }
  }, [categoryId, subcategories])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="category">Categoria *</Label>
        <Select value={categoryId} onValueChange={onCategoryChange}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {categoryId && filteredSubcategories.length > 0 && (
        <div>
          <Label htmlFor="subcategory">Subcategoria</Label>
          <Select value={subcategoryId} onValueChange={onSubcategoryChange}>
            <SelectTrigger id="subcategory">
              <SelectValue placeholder="Selecione uma subcategoria (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {filteredSubcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
