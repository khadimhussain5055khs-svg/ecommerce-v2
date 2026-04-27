import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "../components/RootLayout";
import { HomePage } from "../components/HomePage";
import { ProductListingPage } from "../components/ProductListingPage";
import { ProductDetailPage } from "../components/ProductDetailPage";
import { CartPage } from "../components/CartPage";
import { CheckoutPage } from "../components/CheckoutPage";
import { AdminRoute } from "../components/AdminRoute";
import { AdminDashboardPage } from "../components/AdminDashboardPage";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { MyOrdersPage } from "../components/MyOrdersPage";
import { NotFound } from "../components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "products/:category", Component: ProductListingPage },
      { path: "product/:id", Component: ProductDetailPage },
      { path: "cart", Component: CartPage },
      {
        Component: ProtectedRoute,
        children: [
          { path: "checkout", Component: CheckoutPage },
          { path: "my-orders", Component: MyOrdersPage },
        ],
      },
      {
        Component: AdminRoute,
        children: [{ path: "admin", Component: AdminDashboardPage }],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
