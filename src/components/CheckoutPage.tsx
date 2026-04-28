import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { formatPKR } from '../lib/currency';

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'credit' | 'online'>('cod');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      const existing = document.querySelector('script[data-razorpay-sdk]');
      if (existing) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.setAttribute('data-razorpay-sdk', 'true');
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const isFormValid = Object.values(formData).every(value => value.trim() !== '');
    if (!isFormValid) {
      alert('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    if (paymentMethod === 'credit') {
      const isCardValid = Object.values(cardDetails).every(value => value.trim() !== '');
      if (!isCardValid) {
        alert('Please fill in all card details');
        setSubmitting(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('auth_token');
      const method = paymentMethod === 'online' ? 'razorpay' : 'cod';
      const checkoutResponse = await apiRequest<any>('/orders/checkout', {
        method: 'POST',
        token,
        body: {
          shippingAddress: formData,
          paymentMethod: method,
        },
      });

      if (method === 'cod') {
        alert('Order placed successfully! Thank you for your purchase.');
        clearCart();
        navigate('/');
        return;
      }

      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded || !(window as any).Razorpay) {
        alert('Unable to load Razorpay checkout');
        return;
      }

      const razorpay = checkoutResponse.razorpay;
      const razorpayInstance = new (window as any).Razorpay({
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: 'PreLounge',
        description: `Order #${checkoutResponse.order.id}`,
        order_id: razorpay.orderId,
        handler: async (response: any) => {
          await apiRequest('/orders/verify-razorpay', {
            method: 'POST',
            token,
            body: {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            },
          });
          alert('Payment successful. Order confirmed.');
          clearCart();
          navigate('/');
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
      });

      razorpayInstance.open();
    } catch (error: any) {
      alert(error?.message ?? 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">No Items in Cart</h1>
        <p className="text-gray-600 mb-8">Add items to your cart before checkout</p>
        <button
          onClick={() => navigate('/')}
          className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="w-5 h-5"
                />
                <Banknote className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold">Cash on Delivery</p>
                  <p className="text-sm text-gray-600">Pay when you receive your order</p>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="credit"
                  checked={paymentMethod === 'credit'}
                  onChange={() => setPaymentMethod('credit')}
                  className="w-5 h-5"
                />
                <CreditCard className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold">Credit/Debit Card</p>
                  <p className="text-sm text-gray-600">Pay securely with your card</p>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="w-5 h-5"
                />
                <Smartphone className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-semibold">Online Payment</p>
                  <p className="text-sm text-gray-600">UPI, Net Banking, Wallets</p>
                </div>
              </label>

              {paymentMethod === 'credit' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required={paymentMethod === 'credit'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cardholder Name *</label>
                    <input
                      type="text"
                      name="cardName"
                      value={cardDetails.cardName}
                      onChange={handleCardInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required={paymentMethod === 'credit'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleCardInputChange}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        required={paymentMethod === 'credit'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV *</label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardInputChange}
                        placeholder="123"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        required={paymentMethod === 'credit'}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="font-semibold text-red-600">
                      {formatPKR(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatPKR(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-semibold">{formatPKR(totalPrice * 0.1)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-xl font-bold text-red-600">
                    {formatPKR(totalPrice * 1.1)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors mt-6"
            >
              {submitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
