-- Migration 0004: Product Master Fields
-- Adds availability column to products, and seo_title, seo_description to product_i18n

ALTER TABLE products ADD COLUMN availability TEXT DEFAULT 'unknown';
ALTER TABLE product_i18n ADD COLUMN seo_title TEXT;
ALTER TABLE product_i18n ADD COLUMN seo_description TEXT;