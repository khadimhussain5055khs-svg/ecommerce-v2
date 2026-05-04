import { z } from 'zod';

const addressSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(3),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
});

const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod: z.enum(['cod', 'razorpay']),
});

try {
  checkoutSchema.parse({
    shippingAddress: {
      fullName: "test",
      email: "test@example.com",
      phone: "123",
      address: "123 st",
      city: "city",
      state: "state",
      zipCode: "123",
      country: "country"
    },
    paymentMethod: "cod"
  });
  console.log("Schema is valid");
} catch (e) {
  console.error("Schema invalid", e);
}
