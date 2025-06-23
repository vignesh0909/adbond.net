// Common icons used throughout the application
export {
    // Navigation & UI
    Menu,
    X,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    ArrowRight,
    Home,
    Search,
    
    // User & Auth
    User,
    Users,
    UserPlus,
    LogIn,
    LogOut,
    Shield,
    
    // Dashboard & Admin
    LayoutDashboard,
    Settings,
    BarChart3,
    PieChart,
    TrendingUp,
    Activity,
    
    // Actions
    Plus,
    Edit,
    Trash2,
    Save,
    Download,
    Upload,
    Share,
    Copy,
    
    // Notifications & Status
    Bell,
    BellRing,
    CheckCircle,
    AlertCircle,
    XCircle,
    Info,
    
    // Theme & UI
    Sun,
    Moon,
    Eye,
    EyeOff,
    Heart,
    Star,
    
    // Business & Commerce
    DollarSign,
    CreditCard,
    ShoppingCart,
    Package,
    Truck,
    
    // Communication
    Mail,
    MessageSquare,
    Phone,
    Send,
    
    // Content & Media
    Image,
    Video,
    File,
    FileText,
    Download as DownloadIcon,
    
    // Location & Navigation
    MapPin,
    Globe,
    Navigation,
    
    // Social & Network
    Link,
    ExternalLink,
    Wifi,
    WifiOff,
    
    // Time & Calendar
    Calendar,
    Clock,
    
    // Data & Analytics
    Database,
    Filter,
    SortAsc,
    SortDesc,
    
  } from 'lucide-react';
  
  // Custom icon wrapper component for consistent styling
  export const Icon = ({ 
    icon: IconComponent, 
    size = 'md', 
    className = '', 
    ...props 
  }) => {
    const sizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4', 
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
      '2xl': 'w-10 h-10',
    };
    
    return (
      <IconComponent 
        className={`${sizeClasses[size]} ${className}`} 
        {...props} 
      />
    );
  };
  
  // Commonly used icon combinations
  export const StatusIcons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };
  
  export const ActionIcons = {
    add: Plus,
    edit: Edit,
    delete: Trash2,
    save: Save,
    cancel: X,
  };
  
  export const NavigationIcons = {
    home: Home,
    dashboard: LayoutDashboard,
    settings: Settings,
    profile: User,
    logout: LogOut,
  };
  