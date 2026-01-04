-- Add estimated delivery date column to orders
ALTER TABLE public.orders 
ADD COLUMN estimated_delivery_date date;