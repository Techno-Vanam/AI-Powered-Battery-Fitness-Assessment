import React from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart3,
  Bell,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileText,
  House,
  Info,
  ListChecks,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  ScrollText,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  User,
  Wifi,
  WifiOff,
  X,
  XCircle,
} from 'lucide-react-native';

export type SFSymbolName =
  | 'house'
  | 'house.fill'
  | 'list.bullet.rectangle'
  | 'chart.bar'
  | 'chart.bar.fill'
  | 'doc.text'
  | 'doc.text.fill'
  | 'person.crop.circle'
  | 'person.crop.circle.fill'
  | 'bell'
  | 'bell.fill'
  | 'lock'
  | 'lock.fill'
  | 'eye'
  | 'eye.fill'
  | 'eye.slash'
  | 'eye.slash.fill'
  | 'arrow.left'
  | 'xmark'
  | 'xmark.circle'
  | 'checkmark'
  | 'checkmark.circle'
  | 'checkmark.circle.fill'
  | 'chevron.right'
  | 'chevron.down'
  | 'arrow.clockwise'
  | 'shield.checkmark'
  | 'creditcard'
  | 'magnifyingglass'
  | 'exclamationmark.circle'
  | 'info.circle'
  | 'square.and.arrow.up'
  | 'arrow.down.doc'
  | 'sparkles'
  | 'award'
  | 'wifi'
  | 'wifi.slash'
  | 'rectangle.portrait.and.arrow.right'
  | 'square.and.pencil'
  | 'plus';

type Props = {
  name: SFSymbolName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

/**
 * SF Symbol Component for Cross-Platform React Native.
 * Maps Apple SF Symbol icon names to native SVG vector symbol representations.
 */
export default function SFSymbol({
  name,
  size = 22,
  color = '#111827',
  strokeWidth = 2,
}: Props) {
  switch (name) {
    case 'house':
    case 'house.fill':
      return <House size={size} color={color} strokeWidth={strokeWidth} />;

    case 'list.bullet.rectangle':
      return <ListChecks size={size} color={color} strokeWidth={strokeWidth} />;

    case 'chart.bar':
    case 'chart.bar.fill':
      return <BarChart3 size={size} color={color} strokeWidth={strokeWidth} />;

    case 'doc.text':
    case 'doc.text.fill':
      return <ScrollText size={size} color={color} strokeWidth={strokeWidth} />;

    case 'person.crop.circle':
    case 'person.crop.circle.fill':
      return <User size={size} color={color} strokeWidth={strokeWidth} />;

    case 'bell':
    case 'bell.fill':
      return <Bell size={size} color={color} strokeWidth={strokeWidth} />;

    case 'lock':
    case 'lock.fill':
      return <Lock size={size} color={color} strokeWidth={strokeWidth} />;

    case 'eye':
    case 'eye.fill':
      return <Eye size={size} color={color} strokeWidth={strokeWidth} />;

    case 'eye.slash':
    case 'eye.slash.fill':
      return <EyeOff size={size} color={color} strokeWidth={strokeWidth} />;

    case 'arrow.left':
      return <ArrowLeft size={size} color={color} strokeWidth={strokeWidth} />;

    case 'xmark':
      return <X size={size} color={color} strokeWidth={strokeWidth} />;

    case 'xmark.circle':
      return <XCircle size={size} color={color} strokeWidth={strokeWidth} />;

    case 'checkmark':
      return <Check size={size} color={color} strokeWidth={strokeWidth} />;

    case 'checkmark.circle':
    case 'checkmark.circle.fill':
      return <CheckCircle size={size} color={color} strokeWidth={strokeWidth} />;

    case 'chevron.right':
      return <ChevronRight size={size} color={color} strokeWidth={strokeWidth} />;

    case 'chevron.down':
      return <ChevronDown size={size} color={color} strokeWidth={strokeWidth} />;

    case 'arrow.clockwise':
      return <RefreshCw size={size} color={color} strokeWidth={strokeWidth} />;

    case 'shield.checkmark':
      return <ShieldCheck size={size} color={color} strokeWidth={strokeWidth} />;

    case 'creditcard':
      return <CreditCard size={size} color={color} strokeWidth={strokeWidth} />;

    case 'magnifyingglass':
      return <Search size={size} color={color} strokeWidth={strokeWidth} />;

    case 'exclamationmark.circle':
      return <AlertCircle size={size} color={color} strokeWidth={strokeWidth} />;

    case 'info.circle':
      return <Info size={size} color={color} strokeWidth={strokeWidth} />;

    case 'square.and.arrow.up':
      return <Share2 size={size} color={color} strokeWidth={strokeWidth} />;

    case 'arrow.down.doc':
      return <Download size={size} color={color} strokeWidth={strokeWidth} />;

    case 'sparkles':
      return <Sparkles size={size} color={color} strokeWidth={strokeWidth} />;

    case 'award':
      return <Award size={size} color={color} strokeWidth={strokeWidth} />;

    case 'wifi':
      return <Wifi size={size} color={color} strokeWidth={strokeWidth} />;

    case 'wifi.slash':
      return <WifiOff size={size} color={color} strokeWidth={strokeWidth} />;

    case 'rectangle.portrait.and.arrow.right':
      return <LogOut size={size} color={color} strokeWidth={strokeWidth} />;

    case 'square.and.pencil':
      return <Save size={size} color={color} strokeWidth={strokeWidth} />;

    case 'plus':
      return <Plus size={size} color={color} strokeWidth={strokeWidth} />;

    default:
      return <FileText size={size} color={color} strokeWidth={strokeWidth} />;
  }
}
