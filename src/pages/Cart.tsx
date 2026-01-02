import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();

  const totalPrice = getTotalPrice();
  const deliveryCharge = totalPrice >= 499 ? 0 : 49;
  const finalTotal = totalPrice + deliveryCharge;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Your cart is empty
            </h1>
            <p className="mt-2 text-muted-foreground">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link to="/products">
              <Button variant="saffron" size="lg" className="mt-6">
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground md:text-4xl">
          Shopping Cart
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4 md:p-6"
                >
                  {/* Image */}
                  <Link to={`/products/${item.slug}`} className="flex-shrink-0">
                    <div className="h-24 w-24 overflow-hidden rounded-xl md:h-32 md:w-32">
                      <img
                        src={item.image || "https://via.placeholder.com/200"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link to={`/products/${item.slug}`}>
                        <h3 className="font-display text-lg font-semibold text-foreground hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="mt-1 text-xl font-bold text-primary">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart */}
            <Button variant="ghost" className="mt-4 text-destructive" onClick={clearCart}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                  <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className={deliveryCharge === 0 ? "text-green-600" : ""}>
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Add ₹{499 - totalPrice} more for free delivery
                  </p>
                )}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-semibold text-foreground">
                    <span>Total</span>
                    <span className="text-primary">₹{finalTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Including all taxes</p>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mt-6">
                <div className="flex gap-2">
                  <Input placeholder="Coupon code" />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>

              {/* Checkout Button */}
              <Link to="/checkout" className="block mt-6">
                <Button variant="saffron" size="xl" className="w-full">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>🔒 Secure</span>
                <span>🇮🇳 Made in India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
