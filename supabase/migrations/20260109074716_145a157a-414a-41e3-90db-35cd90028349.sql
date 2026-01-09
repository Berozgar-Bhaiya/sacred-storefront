-- Add returnable column to products table
ALTER TABLE public.products 
ADD COLUMN returnable boolean NOT NULL DEFAULT true;