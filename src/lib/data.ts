// Fruit/Vegetable inventory data
export interface FruitItem {
  id: string;
  name: string;
  category: 'fruit' | 'vegetable';
  price: number;
  unit: string;
  stock: number;
  image: string;
  emoji: string;
  color: string;
}

export const fruitInventory: FruitItem[] = [
  { id: '1', name: 'Apple', category: 'fruit', price: 2.99, unit: 'kg', stock: 150, image: '/placeholder.svg', emoji: '🍎', color: 'fruit-apple' },
  { id: '2', name: 'Banana', category: 'fruit', price: 1.49, unit: 'kg', stock: 200, image: '/placeholder.svg', emoji: '🍌', color: 'fruit-banana' },
  { id: '3', name: 'Orange', category: 'fruit', price: 3.49, unit: 'kg', stock: 180, image: '/placeholder.svg', emoji: '🍊', color: 'fruit-orange' },
  { id: '4', name: 'Grapes', category: 'fruit', price: 4.99, unit: 'kg', stock: 80, image: '/placeholder.svg', emoji: '🍇', color: 'fruit-grape' },
  { id: '5', name: 'Tomato', category: 'vegetable', price: 2.49, unit: 'kg', stock: 120, image: '/placeholder.svg', emoji: '🍅', color: 'fruit-tomato' },
  { id: '6', name: 'Potato', category: 'vegetable', price: 1.99, unit: 'kg', stock: 300, image: '/placeholder.svg', emoji: '🥔', color: 'fruit-banana' },
  { id: '7', name: 'Pepper', category: 'vegetable', price: 3.99, unit: 'kg', stock: 90, image: '/placeholder.svg', emoji: '🌶️', color: 'fruit-tomato' },
  { id: '8', name: 'Mango', category: 'fruit', price: 5.99, unit: 'kg', stock: 60, image: '/placeholder.svg', emoji: '🥭', color: 'fruit-orange' },
  { id: '9', name: 'Strawberry', category: 'fruit', price: 6.99, unit: 'kg', stock: 45, image: '/placeholder.svg', emoji: '🍓', color: 'fruit-apple' },
  { id: '10', name: 'Lemon', category: 'fruit', price: 2.79, unit: 'kg', stock: 110, image: '/placeholder.svg', emoji: '🍋', color: 'fruit-banana' },
  { id: '11', name: 'Watermelon', category: 'fruit', price: 4.49, unit: 'piece', stock: 25, image: '/placeholder.svg', emoji: '🍉', color: 'fruit-apple' },
  { id: '12', name: 'Carrot', category: 'vegetable', price: 1.79, unit: 'kg', stock: 160, image: '/placeholder.svg', emoji: '🥕', color: 'fruit-orange' },
];

// Customer bills data
export interface Bill {
  id: string;
  customerId: string;
  customerName: string;
  items: { item: FruitItem; quantity: number }[];
  total: number;
  date: string;
  status: 'completed' | 'pending' | 'refunded';
}

export const sampleBills: Bill[] = [
  {
    id: 'B001',
    customerId: 'C001',
    customerName: 'John Smith',
    items: [
      { item: fruitInventory[0], quantity: 2 },
      { item: fruitInventory[1], quantity: 1.5 },
    ],
    total: 8.22,
    date: '2024-12-12',
    status: 'completed',
  },
  {
    id: 'B002',
    customerId: 'C002',
    customerName: 'Sarah Johnson',
    items: [
      { item: fruitInventory[2], quantity: 1 },
      { item: fruitInventory[3], quantity: 0.5 },
      { item: fruitInventory[8], quantity: 0.3 },
    ],
    total: 8.08,
    date: '2024-12-12',
    status: 'completed',
  },
  {
    id: 'B003',
    customerId: 'C003',
    customerName: 'Mike Brown',
    items: [
      { item: fruitInventory[4], quantity: 2 },
      { item: fruitInventory[5], quantity: 3 },
    ],
    total: 10.95,
    date: '2024-12-11',
    status: 'pending',
  },
  {
    id: 'B004',
    customerId: 'C004',
    customerName: 'Emily Davis',
    items: [
      { item: fruitInventory[7], quantity: 1 },
    ],
    total: 5.99,
    date: '2024-12-11',
    status: 'completed',
  },
  {
    id: 'B005',
    customerId: 'C005',
    customerName: 'David Wilson',
    items: [
      { item: fruitInventory[10], quantity: 1 },
      { item: fruitInventory[11], quantity: 2 },
    ],
    total: 8.07,
    date: '2024-12-10',
    status: 'refunded',
  },
];

// Dashboard stats
export const dashboardStats = {
  totalRevenue: 15420.50,
  todayRevenue: 1245.80,
  totalOrders: 342,
  todayOrders: 28,
  totalCustomers: 156,
  newCustomers: 12,
  averageOrderValue: 45.10,
};

// Sales data for charts
export const salesData = [
  { name: 'Mon', sales: 2400, orders: 24 },
  { name: 'Tue', sales: 1398, orders: 13 },
  { name: 'Wed', sales: 9800, orders: 98 },
  { name: 'Thu', sales: 3908, orders: 39 },
  { name: 'Fri', sales: 4800, orders: 48 },
  { name: 'Sat', sales: 3800, orders: 38 },
  { name: 'Sun', sales: 4300, orders: 43 },
];

// Category distribution for pie chart
export const categoryData = [
  { name: 'Apples', value: 400, color: 'hsl(0, 75%, 55%)' },
  { name: 'Bananas', value: 300, color: 'hsl(48, 95%, 55%)' },
  { name: 'Oranges', value: 280, color: 'hsl(28, 90%, 55%)' },
  { name: 'Grapes', value: 200, color: 'hsl(280, 60%, 50%)' },
  { name: 'Tomatoes', value: 180, color: 'hsl(8, 85%, 50%)' },
  { name: 'Others', value: 150, color: 'hsl(142, 70%, 40%)' },
];

// Monthly revenue data
export const monthlyRevenue = [
  { month: 'Jan', revenue: 12500 },
  { month: 'Feb', revenue: 14200 },
  { month: 'Mar', revenue: 13800 },
  { month: 'Apr', revenue: 15600 },
  { month: 'May', revenue: 16200 },
  { month: 'Jun', revenue: 18500 },
  { month: 'Jul', revenue: 17800 },
  { month: 'Aug', revenue: 19200 },
  { month: 'Sep', revenue: 18900 },
  { month: 'Oct', revenue: 20100 },
  { month: 'Nov', revenue: 21500 },
  { month: 'Dec', revenue: 24800 },
];

// Stock levels for inventory chart
export const stockLevels = fruitInventory.map(item => ({
  name: item.name,
  stock: item.stock,
  emoji: item.emoji,
}));

// AI Recognition mock results
export const aiRecognitionResults = [
  { label: 'Apple', confidence: 0.96 },
  { label: 'Tomato', confidence: 0.02 },
  { label: 'Peach', confidence: 0.01 },
  { label: 'Plum', confidence: 0.01 },
];
