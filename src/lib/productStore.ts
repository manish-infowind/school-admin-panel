// Product data store for managing products across the admin panel
export interface Product {
  id: number;
  name: string;
  category: string;
  status: string;
  lastModified: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
  price: string;
  features: string[];
  specifications: Record<string, string>;
  images: string[];
  isPublished: boolean;
  seoTitle: string;
  seoDescription: string;
}

// Initial products data
const initialProducts: Product[] = [
  {
    id: 1,
    name: "MedScope Pro X1",
    category: "Diagnostic Equipment",
    status: "Published",
    lastModified: "2 hours ago",
    image: "/placeholder.svg",
    shortDescription:
      "Advanced diagnostic imaging system with AI-powered analysis",
    fullDescription:
      "The MedScope Pro X1 represents the latest in diagnostic imaging technology, featuring AI-powered analysis capabilities, high-resolution imaging, and seamless integration with existing hospital systems. Built for modern healthcare facilities that demand precision and reliability.",
    price: "49,999",
    features: [
      "AI-powered diagnostic analysis",
      "4K high-resolution imaging",
      "Cloud connectivity",
      "Real-time collaboration tools",
      "Advanced noise reduction",
      "Multi-modal integration",
    ],
    specifications: {
      Resolution: "4K Ultra HD",
      Weight: "2.5 kg",
      Connectivity: "WiFi 6, Bluetooth 5.0",
      "Battery Life": "8 hours continuous use",
      Certifications: "FDA Approved, CE Marked",
      Dimensions: "30 x 20 x 15 cm",
      "Operating Temperature": "-10°C to 50°C",
    },
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    isPublished: true,
    seoTitle: "MedScope Pro X1 - Advanced Medical Imaging System",
    seoDescription:
      "Professional-grade medical imaging system with AI analysis capabilities for precise diagnostics and seamless workflow integration.",
  },
  {
    id: 2,
    name: "Advanced Imaging System",
    category: "Imaging Technology",
    status: "Draft",
    lastModified: "1 day ago",
    image: "/placeholder.svg",
    shortDescription: "Next-generation medical imaging with enhanced clarity",
    fullDescription:
      "Our Advanced Imaging System delivers unprecedented image quality with enhanced clarity and detail. Perfect for complex diagnostic procedures requiring the highest level of precision and accuracy in medical imaging.",
    price: "75,999",
    features: [
      "Ultra-high resolution imaging",
      "Advanced noise reduction",
      "Multi-modal integration",
      "Cloud-based storage",
      "Real-time processing",
      "Enhanced contrast detection",
    ],
    specifications: {
      Resolution: "8K Ultra HD",
      Weight: "3.2 kg",
      Connectivity: "WiFi 6E, Bluetooth 5.2",
      "Battery Life": "12 hours continuous use",
      Certifications: "FDA Approved, CE Marked, ISO 13485",
      Dimensions: "35 x 25 x 18 cm",
      Storage: "1TB SSD",
    },
    images: ["/placeholder.svg", "/placeholder.svg"],
    isPublished: false,
    seoTitle: "Advanced Imaging System - Ultra High Resolution Medical Device",
    seoDescription:
      "Next-generation medical imaging system with 8K resolution and advanced processing capabilities for superior diagnostic accuracy.",
  },
  {
    id: 3,
    name: "Portable Analyzer",
    category: "Lab Equipment",
    status: "Published",
    lastModified: "3 days ago",
    image: "/placeholder.svg",
    shortDescription: "Compact, portable diagnostic analyzer for field use",
    fullDescription:
      "The Portable Analyzer brings laboratory-grade diagnostic capabilities to any location. Ideal for field research, remote clinics, and emergency medical situations where immediate analysis is critical.",
    price: "12,999",
    features: [
      "Portable and lightweight design",
      "Real-time analysis",
      "Multiple test panels",
      "Wireless connectivity",
      "Long battery life",
      "Rugged construction",
    ],
    specifications: {
      Weight: "1.2 kg",
      Dimensions: "25 x 15 x 8 cm",
      "Battery Life": "24 hours continuous use",
      Connectivity: "WiFi, Bluetooth, USB-C",
      Certifications: "FDA Approved, CE Marked",
      "Operating Range": "-20°C to 60°C",
      "Water Resistance": "IP67",
    },
    images: ["/placeholder.svg"],
    isPublished: true,
    seoTitle: "Portable Medical Analyzer - Field Diagnostic Equipment",
    seoDescription:
      "Lightweight, portable diagnostic analyzer for field use with 24-hour battery life and laboratory-grade accuracy.",
  },
];

// Store state
let products = [...initialProducts];
let nextId = Math.max(...products.map((p) => p.id)) + 1;

// Event listeners for state changes
let listeners: Array<() => void> = [];

// Store API
export const productStore = {
  // Get all products
  getProducts: (): Product[] => [...products],

  // Get product by ID
  getProduct: (id: number): Product | undefined => {
    return products.find((p) => p.id === id);
  },

  // Add new product
  addProduct: (productData: Omit<Product, "id" | "lastModified">): Product => {
    const newProduct: Product = {
      ...productData,
      id: nextId++,
      lastModified: "Just now",
    };
    products.push(newProduct);
    notifyListeners();
    return newProduct;
  },

  // Update existing product
  updateProduct: (id: number, updates: Partial<Product>): Product | null => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...updates,
      lastModified: "Just now",
    };
    notifyListeners();
    return products[index];
  },

  // Delete product
  deleteProduct: (id: number): boolean => {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return false;

    products.splice(index, 1);
    notifyListeners();
    return true;
  },

  // Subscribe to changes
  subscribe: (callback: () => void): (() => void) => {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter((l) => l !== callback);
    };
  },
};

// Notify all listeners of state changes
function notifyListeners() {
  listeners.forEach((listener) => listener());
}

// Mock image upload function
export const uploadImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    // Simulate upload delay
    setTimeout(() => {
      // Create a mock URL (in real app, this would be actual uploaded image URL)
      const mockUrl = `/placeholder.svg?id=${Date.now()}&name=${file.name}`;
      resolve(mockUrl);
    }, 1000);
  });
};
