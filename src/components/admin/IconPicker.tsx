import React, { useState } from 'react';
import {
  Package,
  ShoppingBag,
  MapPin,
  Award,
  Building2,
  FileText,
  MessageSquare,
  Camera,
  Navigation,
  Wrench,
  Shield,
  Lock,
  Home,
  Store,
  Factory,
  Car,
  Truck,
  Smartphone,
  Laptop,
  Monitor,
  Server,
  Wifi,
  Zap,
  Settings,
  Users,
  Briefcase,
  Heart,
  Star,
  Tag,
  Grid,
  List,
  Box,
  Archive,
  Folder,
  Image as ImageIcon,
  Video,
  Music,
  Book,
  GraduationCap,
  Stethoscope,
  Utensils,
  Coffee,
  ShoppingCart,
  CreditCard,
  DollarSign,
  TrendingUp,
  BarChart,
  PieChart,
  Activity,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Link,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  Bell,
  User,
  UserPlus,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Minus,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  MoreHorizontal
} from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

// All available icons from Lucide
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Package,
  ShoppingBag,
  MapPin,
  Award,
  Building2,
  FileText,
  MessageSquare,
  Camera,
  Navigation,
  Wrench,
  Shield,
  Lock,
  Home,
  Store,
  Factory,
  Car,
  Truck,
  Smartphone,
  Laptop,
  Monitor,
  Server,
  Wifi,
  Zap,
  Settings,
  Users,
  Briefcase,
  Heart,
  Star,
  Tag,
  Grid,
  List,
  Box,
  Archive,
  Folder,
  Image: ImageIcon,
  Video,
  Music,
  Book,
  GraduationCap,
  Stethoscope,
  Utensils,
  Coffee,
  ShoppingCart,
  CreditCard,
  DollarSign,
  TrendingUp,
  BarChart,
  PieChart,
  Activity,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Link,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  Bell,
  User,
  UserPlus,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Minus,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  MoreHorizontal
};

const iconNames = Object.keys(iconMap);

export default function IconPicker({ value, onChange, label = 'Icon' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = iconNames.filter((name) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SelectedIcon = value && iconMap[value] ? iconMap[value] : null;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          {SelectedIcon ? (
            <>
              <SelectedIcon className="w-4 h-4" />
              <span>{value}</span>
            </>
          ) : (
            <span className="text-gray-500">Select icon...</span>
          )}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Clear
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto p-3 grid grid-cols-6 gap-2">
              {filteredIcons.map((iconName) => {
                const IconComponent = iconMap[iconName];
                const isSelected = value === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`p-2 rounded-md border-2 transition-colors ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                    }`}
                    title={iconName}
                  >
                    <IconComponent className="w-5 h-5 mx-auto" />
                  </button>
                );
              })}
            </div>
            {filteredIcons.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">No icons found</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

