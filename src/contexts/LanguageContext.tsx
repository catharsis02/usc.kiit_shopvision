import { useState, ReactNode } from 'react';
import { LanguageContext, LanguageContextType } from './LanguageContextDefinition';

type Language = 'en' | 'hi';

const translations = {
  en: {
    // Header
    'brand.name': 'BharatShop',
    'franchise.portal': 'Franchise Portal',
    
    // Dashboard
    'dashboard.title': 'Franchise Dashboard',
    'dashboard.subtitle': 'Monitor sales, inventory, and customer analytics',
    'dashboard.exportReport': 'Export Report',
    'dashboard.refreshData': 'Refresh Data',
    
    // Navigation
    'nav.billing': 'AI Billing',
    'nav.dashboard': 'Dashboard',
    'nav.inventory': 'Inventory',
    'nav.bills': 'Bills',
    
    // Stats
    'stats.totalRevenue': 'Total Revenue',
    'stats.totalRevenue.change': '+12.5% from last month',
    'stats.todaySales': "Today's Sales",
    'stats.todaySales.change': '+8.2% from yesterday',
    'stats.totalOrders': 'Total Orders',
    'stats.totalOrders.change': 'today',
    'stats.totalCustomers': 'Total Customers',
    'stats.totalCustomers.change': 'new this week',
    
    'stats.totalProducts': 'Total Products',
    'stats.totalProducts.change': 'fruits, vegetables',
    'stats.lowStock': 'Low Stock Items',
    'stats.lowStock.change': 'Needs restocking',
    'stats.outOfStock': 'Out of Stock',
    'stats.outOfStock.change': 'All items available',
    'stats.stockValue': 'Total Stock Value',
    'stats.stockValue.change': 'Estimated market value',
    
    'stats.totalBills': 'Total Bills',
    'stats.totalBills.change': 'Last 30 days',
    'stats.completed': 'Completed',
    'stats.completed.change': 'success rate',
    'stats.pending': 'Pending',
    'stats.pending.change': 'Awaiting payment',
    'stats.refunded': 'Refunded',
    'stats.refunded.change': 'refund rate',
    
    // Billing Scanner
    'billing.title': 'AI Checkout Scanner',
    'billing.subtitle': 'Place fruit → AI identifies → Auto-adds to bill',
    'billing.dropImage': 'Place fruit on tray',
    'billing.dropImageActive': 'Drop fruit image here',
    'billing.dragDrop': 'Drag & drop image or click to browse',
    'billing.useCamera': 'Use Camera',
    'billing.identifying': 'Identifying...',
    'billing.detected': 'Detected',
    'billing.price': 'Price',
    'billing.confidence': 'Confidence',
    'billing.confidenceScores': 'Confidence Scores',
    'billing.addToBill': 'Add to Bill',
    'billing.cancel': 'Cancel',
    'billing.currentBill': 'Current Bill',
    'billing.items': 'items',
    'billing.clear': 'Clear',
    'billing.noItems': 'No items scanned yet',
    'billing.scanFruit': 'Scan a fruit to add it to the bill',
    'billing.total': 'Total',
    'billing.complete': 'Complete Transaction',
    'billing.billCleared': 'Bill cleared',
    'billing.noItemsError': 'No items in bill',
    'billing.billCompleted': 'Bill completed! Total',
    'billing.itemsProcessed': 'items processed',
    'billing.addedToBill': 'added to bill',
    'billing.item': 'item',
    
    // Welcome Banner
    'banner.welcome': 'Welcome',
    'banner.subtitle': 'Indian Grocery Store Management System',
    
    // Common
    'common.and': 'and',
    'common.of': 'of',
  },
  hi: {
    // Header
    'brand.name': 'भारतShop',
    'franchise.portal': 'फ्रैंचाइज़ पोर्टल',
    
    // Dashboard
    'dashboard.title': 'फ्रैंचाइज़ डैशबोर्ड',
    'dashboard.subtitle': 'बिक्री, इन्वेंटरी और ग्राहक विश्लेषण मॉनिटर करें',
    'dashboard.exportReport': 'रिपोर्ट निर्यात करें',
    'dashboard.refreshData': 'डेटा रिफ्रेश करें',
    
    // Navigation
    'nav.billing': 'AI बिलिंग',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.inventory': 'इन्वेंटरी',
    'nav.bills': 'बिल',
    
    // Stats
    'stats.totalRevenue': 'कुल राजस्व',
    'stats.totalRevenue.change': '+12.5% पिछले महीने से',
    'stats.todaySales': 'आज की बिक्री',
    'stats.todaySales.change': '+8.2% कल से',
    'stats.totalOrders': 'कुल ऑर्डर',
    'stats.totalOrders.change': 'आज',
    'stats.totalCustomers': 'कुल ग्राहक',
    'stats.totalCustomers.change': 'इस सप्ताह',
    
    'stats.totalProducts': 'कुल उत्पाद',
    'stats.totalProducts.change': 'फल, सब्जियां',
    'stats.lowStock': 'कम स्टॉक',
    'stats.lowStock.change': 'पुनःपूर्ति की जरूरत',
    'stats.outOfStock': 'स्टॉक खत्म',
    'stats.outOfStock.change': 'सभी उपलब्ध',
    'stats.stockValue': 'स्टॉक मूल्य',
    'stats.stockValue.change': 'अनुमानित बाजार मूल्य',
    
    'stats.totalBills': 'कुल बिल',
    'stats.totalBills.change': 'पिछले 30 दिन',
    'stats.completed': 'पूर्ण',
    'stats.completed.change': 'सफलता दर',
    'stats.pending': 'लंबित',
    'stats.pending.change': 'भुगतान की प्रतीक्षा',
    'stats.refunded': 'वापसी',
    'stats.refunded.change': 'वापसी दर',
    
    // Billing Scanner
    'billing.title': 'एआई बिलिंग स्कैनर',
    'billing.subtitle': 'फल रखें → एआई पहचानता है → ऑटो-बिल में जुड़ता है',
    'billing.dropImage': 'फल को ट्रे पर रखें',
    'billing.dropImageActive': 'फल की तस्वीर यहां छोड़ें',
    'billing.dragDrop': 'खींचें और छोड़ें या ब्राउज करने के लिए क्लिक करें',
    'billing.useCamera': 'कैमरा उपयोग करें',
    'billing.identifying': 'पहजान रहे हैं...',
    'billing.detected': 'पहचाना',
    'billing.price': 'मूल्य',
    'billing.confidence': 'विश्वास',
    'billing.confidenceScores': 'विश्वास स्कोर',
    'billing.addToBill': 'बिल में जोड़ें',
    'billing.cancel': 'रद्द करें',
    'billing.currentBill': 'वर्तमान बिल',
    'billing.items': 'वस्तुएं',
    'billing.clear': 'साफ करें',
    'billing.noItems': 'अभी तक कोई वस्तु स्कैन नहीं की गई',
    'billing.scanFruit': 'बिल में जोड़ने के लिए फल स्कैन करें',
    'billing.total': 'कुल',
    'billing.complete': 'बिल पूर्ण करें',
    'billing.billCleared': 'बिल साफ हो गया',
    'billing.noItemsError': 'बिल में कोई वस्तु नहीं',
    'billing.billCompleted': 'बिल पूरा! कुल',
    'billing.itemsProcessed': 'वस्तुएं प्रोसेस की गईं',
    'billing.addedToBill': 'बिल में जोड़ा गया',
    'billing.item': 'वस्तु',
    
    // Welcome Banner
    'banner.welcome': 'स्वागत है',
    'banner.subtitle': 'भारतीय ग्रॉसरी स्टोर प्रबंधन प्रणाली',
    
    // Common
    'common.and': 'और',
    'common.of': 'का',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Export hook in separate file to avoid Fast Refresh warning
// Use: import { useLanguage } from '@/hooks/useLanguage'
