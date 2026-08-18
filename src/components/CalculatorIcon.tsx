import type { ComponentType } from "react";
import {
  Banknote,
  BarChart3,
  Building2,
  CalendarClock,
  Calculator,
  CircleDollarSign,
  DoorOpen,
  Factory,
  GitFork,
  HardHat,
  Home,
  Hotel,
  Landmark,
  LayoutGrid,
  LineChart,
  Map,
  Mountain,
  PaintRoller,
  PiggyBank,
  Ruler,
  TrendingUp,
  type LucideProps,
} from "lucide-react";
import type { CalculatorIconName } from "../config/calculators";

const ICONS: Record<CalculatorIconName, ComponentType<LucideProps>> = {
  home: Home,
  building2: Building2,
  factory: Factory,
  landmark: Landmark,
  barChart3: BarChart3,
  circleDollarSign: CircleDollarSign,
  lineChart: LineChart,
  ruler: Ruler,
  doorOpen: DoorOpen,
  hotel: Hotel,
  trendingUp: TrendingUp,
  piggyBank: PiggyBank,
  paintRoller: PaintRoller,
  gitFork: GitFork,
  banknote: Banknote,
  calendarClock: CalendarClock,
  hardHat: HardHat,
  map: Map,
  mountain: Mountain,
  layoutGrid: LayoutGrid,
  calculator: Calculator,
};

const CalculatorIcon = ({
  name,
  size = 20,
}: {
  name: CalculatorIconName;
  size?: number;
}) => {
  const Icon = ICONS[name];
  return <Icon size={size} strokeWidth={2} aria-hidden />;
};

export default CalculatorIcon;
