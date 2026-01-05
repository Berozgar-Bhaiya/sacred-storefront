-- Add return_requested status to order_status enum
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'return_requested';

-- Create return_requests table to track return requests
CREATE TABLE public.return_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create return requests for their orders"
ON public.return_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own return requests"
ON public.return_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all return requests"
ON public.return_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all return requests"
ON public.return_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_return_requests_updated_at
BEFORE UPDATE ON public.return_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();