// Firebase functions for business logic
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from './firebaseClient.js';

// Calculate shipping using local calculation (no external API dependency)
import { calculateLocalShipping } from './localShipping.js';

export const calculateShipping = async (address, items) => {
  try {
    // Calculate total quantity
    let totalQuantity = 0;
    items.forEach(item => {
      totalQuantity += item.quantity || 1;
    });

    // Use local shipping calculation
    const quotes = calculateLocalShipping(
      address.cep?.replace(/\D/g, '') || '00000000',
      totalQuantity
    );

    // Return the cheapest option
    const cheapestQuote = quotes
      .filter(quote => !quote.has_error && quote.price)
      .sort((a, b) => (a.price || 0) - (b.price || 0))[0];

    if (cheapestQuote) {
      return {
        cost: cheapestQuote.price || 0,
        estimatedDays: cheapestQuote.delivery_time || 3,
        carrier: cheapestQuote.company?.name || 'Correios',
        quotes: quotes // Return all quotes for more options
      };
    }

    // Fallback to basic calculation
    const baseShipping = 15;
    const quantityMultiplier = 2;
    const shippingCost = baseShipping + (totalQuantity * quantityMultiplier);
    
    return {
      cost: shippingCost,
      estimatedDays: 3,
      carrier: 'Correios',
      quotes: []
    };
  } catch (error) {
    console.error('Error calculating shipping:', error);
    
    // Fallback calculation
    const baseShipping = 15;
    const quantityMultiplier = 2;
    let totalQuantity = 0;
    items.forEach(item => {
      totalQuantity += item.quantity || 1;
    });
    
    const shippingCost = baseShipping + (totalQuantity * quantityMultiplier);
    
    return {
      cost: shippingCost,
      estimatedDays: 3,
      carrier: 'Correios',
      quotes: []
    };
  }
};

// Create checkout session (simplified version)
export const createCheckoutSession = async (orderData) => {
  try {
    // Add order to Firestore
    const ordersRef = collection(db, 'orders');
    const orderDoc = await addDoc(ordersRef, {
      ...orderData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // In a real implementation, you would integrate with a payment provider
    // For now, we'll just return the order ID
    return {
      sessionId: orderDoc.id,
      orderId: orderDoc.id,
      status: 'pending'
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Handle payment webhook (simplified version)
export const handleStripeWebhook = async (webhookData) => {
  try {
    const { orderId, status, paymentIntentId } = webhookData;
    
    // Update order status in Firestore
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: status === 'succeeded' ? 'paid' : 'failed',
      paymentIntentId,
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
};

// Stripe handler (simplified version)
export const stripeHandler = {
  // Create payment intent
  createPaymentIntent: async (amount, currency = 'BRL') => {
    // In a real implementation, this would call Stripe API
    // For now, return a mock payment intent
    return {
      id: `pi_${Date.now()}`,
      amount: amount * 100, // Stripe uses cents
      currency,
      status: 'requires_payment_method'
    };
  },
  
  // Confirm payment
  confirmPayment: async (paymentIntentId) => {
    // In a real implementation, this would confirm with Stripe
    return {
      id: paymentIntentId,
      status: 'succeeded'
    };
  }
};