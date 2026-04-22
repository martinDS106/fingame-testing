import { createBrowserRouter, Navigate } from "react-router";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { Dashboard } from "./components/Dashboard";
import { CourseScreen } from "./components/CourseScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { RewardMarketplace } from "./components/RewardMarketplace";
import { SimulationHub } from "./components/SimulationHub";
import { BankingDashboard } from "./components/simulations/BankingDashboard";
import { SavingsGoal } from "./components/simulations/SavingsGoal";
import { ScenarioChallenge } from "./components/simulations/ScenarioChallenge";
import { PortfolioOverview } from "./components/simulations/PortfolioOverview";
import { MarketScreen } from "./components/simulations/MarketScreen";
import { StockDetail } from "./components/simulations/StockDetail";
import { OrderExecution } from "./components/simulations/OrderExecution";
import { CreditDashboard } from "./components/simulations/CreditDashboard";
import { GoldTrading } from "./components/simulations/GoldTrading";
import { BusinessSimulation } from "./components/simulations/BusinessSimulation";
import { StreakCalendar } from "./components/StreakCalendar";
import { FinTok } from "./components/FinTok";
import { EnhancedMarketplace } from "./components/EnhancedMarketplace";
import { MarketplaceHome } from "./components/marketplace/MarketplaceHome";
import { CreditCardListing } from "./components/marketplace/CreditCardListing";
import { ProductDetail } from "./components/marketplace/ProductDetail";
import { LoanCalculator } from "./components/marketplace/LoanCalculator";
import { ApplicationTracking } from "./components/marketplace/ApplicationTracking";
import { ProductComparison } from "./components/marketplace/ProductComparison";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <WelcomeScreen />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/course",
    element: <CourseScreen />,
  },
  {
    path: "/profile",
    element: <ProfileScreen />,
  },
  {
    path: "/rewards",
    element: <RewardMarketplace />,
  },
  {
    path: "/simulation-hub",
    element: <SimulationHub />,
  },
  // Banking Simulation
  {
    path: "/simulation/banking",
    element: <BankingDashboard />,
  },
  {
    path: "/simulation/banking/savings-goal",
    element: <SavingsGoal />,
  },
  {
    path: "/simulation/banking/challenge",
    element: <ScenarioChallenge />,
  },
  // Investment Simulation
  {
    path: "/simulation/investment",
    element: <PortfolioOverview />,
  },
  {
    path: "/simulation/investment/market",
    element: <MarketScreen />,
  },
  {
    path: "/simulation/investment/stock",
    element: <StockDetail />,
  },
  {
    path: "/simulation/investment/order",
    element: <OrderExecution />,
  },
  // Credit Score Simulation
  {
    path: "/simulation/credit",
    element: <CreditDashboard />,
  },
  // Gold & Silver Simulation
  {
    path: "/simulation/gold",
    element: <GoldTrading />,
  },
  // Business Simulation
  {
    path: "/simulation/business",
    element: <BusinessSimulation />,
  },
  // Community Features
  {
    path: "/streak-calendar",
    element: <StreakCalendar />,
  },
  {
    path: "/fintok",
    element: <FinTok />,
  },
  {
    path: "/marketplace",
    element: <EnhancedMarketplace />,
  },
  // Financial Marketplace
  {
    path: "/marketplace-home",
    element: <MarketplaceHome />,
  },
  {
    path: "/marketplace/credit-cards",
    element: <CreditCardListing />,
  },
  {
    path: "/marketplace/compare",
    element: <ProductComparison />,
  },
  {
    path: "/marketplace/product/:id",
    element: <ProductDetail />,
  },
  {
    path: "/marketplace/loan-calculator",
    element: <LoanCalculator />,
  },
  {
    path: "/marketplace/application-tracking",
    element: <ApplicationTracking />,
  },
  // Catch all
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
