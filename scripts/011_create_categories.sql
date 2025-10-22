-- NEW FEATURE - Categories and Subcategories System
-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT, -- Icon name from lucide-react
  color TEXT DEFAULT '#007AFF', -- Hex color for the category
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- Add category and subcategory to projects table
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id),
  ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_subcategory ON projects(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);

-- Insert default categories
INSERT INTO categories (name, slug, icon, color, description) VALUES
  ('Design & Multimídia', 'design-multimidia', 'Palette', '#FF6B6B', 'Design gráfico, identidade visual, edição de vídeo e mais'),
  ('Programação & Tecnologia', 'programacao-tecnologia', 'Code', '#4ECDC4', 'Desenvolvimento de sites, apps, automação e banco de dados'),
  ('Redação & Tradução', 'redacao-traducao', 'FileText', '#95E1D3', 'Copywriting, tradução, revisão de textos'),
  ('Marketing & Vendas', 'marketing-vendas', 'TrendingUp', '#F38181', 'Mídias sociais, SEO, estratégia digital')
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for Design & Multimídia
INSERT INTO subcategories (category_id, name, slug, description)
SELECT id, 'Design Gráfico', 'design-grafico', 'Criação de logos, banners, posts para redes sociais'
FROM categories WHERE slug = 'design-multimidia'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, description)
SELECT id, 'Identidade Visual', 'identidade-visual', 'Desenvolvimento de marca completa'
FROM categories WHERE slug = 'design-multimidia'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, description)
SELECT id, 'Edição de Vídeo', 'edicao-video', 'Edição profissional de vídeos'
FROM categories WHERE slug = 'design-multimidia'
ON CONFLICT DO NOTHING;

-- Insert subcategories for Programação & Tecnologia
INSERT INTO subcategories (category_id, name, slug, description)
SELECT id, 'Sites e Apps', 'sites-apps', 'Desenvolvimento web e mobile'
FROM categories WHERE slug = 'programacao-tecnologia'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, description)
SELECT id, 'Automação', 'automacao', 'Scripts e automação de processos'
FROM categories WHERE slug = 'programacao-tecnologia'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, description)
SELECT id, 'Banco de Dados', 'banco-dados', 'Modelagem e otimização de bancos de dados'
FROM categories WHERE slug = 'programacao-tecnologia'
ON CONFLICT DO NOTHING;

-- Insert subcategories for Redação & Tradução
INSERT INTO subcategories (category_id, name, slug, description)
SELECT id, 'Copywriting', 'copywriting', 'Textos persuasivos para vendas'
FROM categories WHERE slug = 'redacao-traducao'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, description)
SELECT id, 'Tradução', 'traducao', 'Tradução de textos e documentos'
FROM categories WHERE slug = 'redacao-traducao'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, description)
SELECT id, 'Revisão de Texto', 'revisao-texto', 'Revisão ortográfica e gramatical'
FROM categories WHERE slug = 'redacao-traducao'
ON CONFLICT DO NOTHING;

-- Insert subcategories for Marketing & Vendas
INSERT INTO subcategories (category_id, name, slug, description)
SELECT id, 'Mídias Sociais', 'midias-sociais', 'Gestão de redes sociais'
FROM categories WHERE slug = 'marketing-vendas'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, description)
SELECT id, 'SEO', 'seo', 'Otimização para mecanismos de busca'
FROM categories WHERE slug = 'marketing-vendas'
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name, slug, description)
SELECT id, 'Estratégia Digital', 'estrategia-digital', 'Planejamento de marketing digital'
FROM categories WHERE slug = 'marketing-vendas'
ON CONFLICT DO NOTHING;

-- Update trigger for categories
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

CREATE TRIGGER subcategories_updated_at
  BEFORE UPDATE ON subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();
