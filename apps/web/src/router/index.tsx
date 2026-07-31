import { createBrowserRouter, Navigate } from "react-router-dom";
import { SimbaLayout } from "@/presentation/layouts/SimbaLayout";
import { StoreShellLayout } from "@/presentation/layouts/StoreShellLayout";
import { StorefrontLayout } from "@/presentation/layouts/StorefrontLayout";
import { AuthContinueRoute } from "@/presentation/guards/AuthContinueRoute";
import { GuestRoute } from "@/presentation/guards/GuestRoute";
import { OnboardingGate } from "@/presentation/guards/OnboardingGate";
import { OnboardingRoute } from "@/presentation/guards/OnboardingRoute";
import { ProtectedRoute } from "@/presentation/guards/ProtectedRoute";
import {
  AnalyticsPage,
  ConsultantPage,
  CustomersPage,
  GrowthPage,
  IssuesPage,
  OrdersPage,
  ProductsPage,
  ReviewsPage,
  TimelinePage,
} from "@/presentation/pages";
import { SignInPage, SsoCallbackPage } from "@/presentation/pages/auth/AuthPages";
import { OrderDetailPage } from "@/presentation/pages/orders/OrderDetailPage";
import { ProductFormPage } from "@/presentation/pages/products/ProductFormPage";
import { SimbaOverviewPage } from "@/presentation/pages/simba/SimbaOverviewPage";
import { GettingStartedPage } from "@/presentation/pages/onboarding/GettingStartedPage";
import { StoreCustomizePage } from "@/presentation/pages/store/StoreCustomizePage";
import { StoreDetailsPage } from "@/presentation/pages/store/StoreDetailsPage";
import { CheckoutPage } from "@/presentation/pages/storefront/CheckoutPage";
import { OrderSuccessPage } from "@/presentation/pages/storefront/OrderSuccessPage";
import { ProductDetailPage } from "@/presentation/pages/storefront/ProductDetailPage";
import { StorefrontHomePage } from "@/presentation/pages/storefront/StorefrontHomePage";
import { LegacyStorefrontRedirect } from "@/presentation/guards/LegacyStorefrontRedirect";
import { LandingRoute } from "@/presentation/guards/LandingRoute";

export const router = createBrowserRouter([
  { path: "/", element: <LandingRoute /> },
  { path: "/sign-in", element: <GuestRoute><SignInPage /></GuestRoute> },
  { path: "/sign-in/sso-callback", element: <SsoCallbackPage /> },
  { path: "/sign-up", element: <Navigate to="/sign-in" replace /> },
  {
    path: "/store/:slug",
    element: <StorefrontLayout />,
    children: [
      { index: true, element: <StorefrontHomePage /> },
      { path: "p/:productId", element: <ProductDetailPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "success", element: <OrderSuccessPage /> },
    ],
  },
  { path: "/s/:slug/*", element: <LegacyStorefrontRedirect /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/auth/continue", element: <AuthContinueRoute /> },
      { path: "/onboarding", element: <OnboardingRoute /> },
      {
        element: <OnboardingGate />,
        children: [
          {
            element: <StoreShellLayout />,
            children: [
              { path: "getting-started", element: <GettingStartedPage /> },
              { path: "store", element: <StoreDetailsPage /> },
              { path: "store/customize", element: <StoreCustomizePage /> },
              { path: "analytics", element: <AnalyticsPage /> },
              { path: "products", element: <ProductsPage /> },
              { path: "products/new", element: <ProductFormPage /> },
              { path: "products/:id/edit", element: <ProductFormPage /> },
              { path: "orders", element: <OrdersPage /> },
              { path: "orders/:id", element: <OrderDetailPage /> },
              { path: "customers", element: <CustomersPage /> },
              { path: "reviews", element: <ReviewsPage /> },
              {
                path: "simba",
                element: <SimbaLayout />,
                children: [
                  { index: true, element: <SimbaOverviewPage /> },
                  { path: "issues", element: <IssuesPage /> },
                  { path: "growth", element: <GrowthPage /> },
                  { path: "consultant", element: <ConsultantPage /> },
                  { path: "timeline", element: <TimelinePage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
