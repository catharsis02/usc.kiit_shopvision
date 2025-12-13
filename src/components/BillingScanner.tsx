import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Scan, Check, Loader2, Plus, X, Receipt, Trash2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { fruitInventory, FruitItem } from "@/lib/data";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface RecognitionResult {
  label: string;
  confidence: number;
}

interface BillItem {
  item: FruitItem;
  quantity: number;
  confidence: number;
}

export function BillingScanner() {
  const { t } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<RecognitionResult[] | null>(null);
  const [recognizedItem, setRecognizedItem] = useState<FruitItem | null>(null);
  const [billItems, setBillItems] = useState<BillItem[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setResults(null);
        setRecognizedItem(null);
        // Auto-scan when image is dropped
        setTimeout(() => handleScan(reader.result as string), 500);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
  });

  // ML API URL - change to your deployed API URL for production
  const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000';

  const handleScan = async (imageData?: string) => {
    const imgToUse = imageData || image;
    if (!imgToUse) return;
    
    setIsScanning(true);
    
    try {
      // Create FormData with the image
      const formData = new FormData();
      
      // Convert base64 to blob
      const response = await fetch(imgToUse);
      const blob = await response.blob();
      formData.append('image', blob, 'fruit.jpg');
      
      // Call the ML API
      console.log('Sending image to ML API...');
      const apiResponse = await fetch(`${ML_API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });
      
      if (!apiResponse.ok) {
        throw new Error('Prediction failed');
      }
      
      const prediction = await apiResponse.json();
      console.log('Prediction received:', prediction);
      
      // Find matching fruit in inventory or create new one
      let detected = fruitInventory.find(f => 
        f.name.toLowerCase().includes(prediction.fruit.toLowerCase()) ||
        prediction.fruit.toLowerCase().includes(f.name.toLowerCase())
      );
      
      // If not found in inventory, create a dynamic entry
      if (!detected) {
        detected = {
          id: `fruit-${Date.now()}`,
          name: prediction.fruit,
          emoji: '🍎',
          price: prediction.price || 100,
          unit: prediction.unit || 'kg',
          color: 'bg-red-50 dark:bg-red-950',
          image: imgToUse
        };
      }
      
      const confidence = prediction.confidence / 100;
      
      // Map top predictions
      const apiResults: RecognitionResult[] = prediction.top_predictions?.map((p: any) => ({
        label: p.fruit,
        confidence: p.confidence / 100
      })) || [
        { label: prediction.fruit, confidence }
      ];
      
      setResults(apiResults);
      setRecognizedItem(detected);
      setIsScanning(false);
      
      toast.success(`${t('billing.detected')}: ${detected.emoji} ${detected.name}`, {
        description: `${t('billing.price')}: ₹${detected.price.toFixed(2)}/${detected.unit} • ${t('billing.confidence')}: ${prediction.confidence.toFixed(1)}%`
      });
      
    } catch (error) {
      console.error('Prediction error:', error);
      setIsScanning(false);
      toast.error('Failed to detect fruit. Make sure ML API is running on http://localhost:5000');
    }
  };

  const handleAddToBill = () => {
    if (!recognizedItem || !results) return;
    
    const confidence = results[0].confidence;
    
    setBillItems(prev => {
      const existing = prev.find(b => b.item.id === recognizedItem.id);
      if (existing) {
        return prev.map(b => 
          b.item.id === recognizedItem.id 
            ? { ...b, quantity: b.quantity + 1 }
            : b
        );
      }
      return [...prev, { item: recognizedItem, quantity: 1, confidence }];
    });
    
    toast.success(`${recognizedItem.emoji} ${recognizedItem.name} ${t('billing.addedToBill')}`);
    handleReset();
  };

  const handleRemoveItem = (itemId: string) => {
    setBillItems(prev => prev.filter(b => b.item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setBillItems(prev => prev.map(b => {
      if (b.item.id === itemId) {
        const newQty = Math.max(1, b.quantity + delta);
        return { ...b, quantity: newQty };
      }
      return b;
    }));
  };

  const handleReset = () => {
    setImage(null);
    setResults(null);
    setRecognizedItem(null);
  };

  const handleClearBill = () => {
    setBillItems([]);
    toast.info(t('billing.billCleared'));
  };

  const handleCompleteBill = () => {
    if (billItems.length === 0) {
      toast.error(t('billing.noItemsError'));
      return;
    }
    toast.success(`${t('billing.billCompleted')}: ₹${billTotal.toFixed(2)}`, {
      description: `${billItems.length} ${t('billing.itemsProcessed')}`
    });
    setBillItems([]);
  };

  const billTotal = billItems.reduce((sum, b) => sum + b.item.price * b.quantity, 0);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Scanner Section */}
      <Card className="overflow-hidden bg-card shadow-medium">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl gradient-fresh shadow-glow">
              <Scan className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">{t('billing.title')}</h3>
              <p className="text-muted-foreground text-sm">{t('billing.subtitle')}</p>
            </div>
          </div>
          
          {!image ? (
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-primary bg-primary/5 scale-[1.02]' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full transition-all duration-300 ${
                  isDragActive ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <Upload className={`h-8 w-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {isDragActive ? t('billing.dropImageActive') : t('billing.dropImage')}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {t('billing.dragDrop')}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 border-primary/50">
                  <Camera className="h-4 w-4" />
                  {t('billing.useCamera')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video">
                <img 
                  src={image} 
                  alt="Scanned item" 
                  className="w-full h-full object-contain"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-b from-primary/60 to-transparent animate-scan-line" />
                    </div>
                    <div className="bg-card/90 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 shadow-glow">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="font-medium">{t('billing.identifying')}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {results && recognizedItem && (
                <div className="animate-slide-up space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-fresh/10 border-2 border-primary/30 shadow-glow">
                    <div className="p-2 rounded-full bg-gradient-fresh shadow-md">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {recognizedItem.emoji} {recognizedItem.name} – 1 {t('billing.item')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('billing.price')}: ₹{recognizedItem.price.toFixed(2)}/{recognizedItem.unit}
                      </p>
                    </div>
                    <span className="text-xl font-bold text-primary">
                      ₹{recognizedItem.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{t('billing.confidenceScores')}</p>
                    {results.map((result, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="w-24 text-sm truncate">{result.label}</span>
                        <Progress value={result.confidence * 100} className="flex-1 h-2" />
                        <span className="w-14 text-right text-sm font-medium">
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                {!results && !isScanning && (
                  <Button 
                    onClick={() => handleScan()} 
                    className="flex-1 gap-2 bg-gradient-fresh border-0 shadow-glow"
                    disabled={isScanning}
                  >
                    <Scan className="h-4 w-4" />
                    {t('billing.scanNow')}
                  </Button>
                )}
                {results && recognizedItem && (
                  <Button 
                    onClick={handleAddToBill} 
                    className="flex-1 gap-2 bg-gradient-fresh border-0 shadow-glow"
                  >
                    <Plus className="h-4 w-4" />
                    {t('billing.addToBill')}
                  </Button>
                )}
                <Button onClick={handleReset} variant="outline" className={`${results ? 'border-primary/50' : 'flex-1 border-primary/50'}`}>
                  {results ? <X className="h-4 w-4" /> : t('billing.cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Bill Section */}
      <Card className="overflow-hidden bg-gradient-card shadow-medium flex flex-col border-2 border-primary/10">
        <div className="p-6 border-b-2 border-primary/20 bg-gradient-fresh/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-warm shadow-md">
                <Receipt className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">{t('billing.currentBill')}</h3>
                <p className="text-muted-foreground text-sm">{billItems.length} {t('billing.items')}</p>
              </div>
            </div>
            {billItems.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearBill} className="text-destructive gap-1 hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
                {t('billing.clear')}
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-3 min-h-[300px] max-h-[400px]">
          {billItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <span className="text-5xl mb-4">🛒</span>
              <p className="text-muted-foreground font-medium">{t('billing.noItems')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('billing.scanFruit')}</p>
            </div>
          ) : (
            billItems.map((billItem) => (
              <div key={billItem.item.id} className="flex items-center gap-4 p-3 rounded-xl bg-gradient-card border border-primary/10 hover:shadow-soft transition-shadow">
                <span className="text-3xl">{billItem.item.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium">{billItem.item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{billItem.item.price.toFixed(2)}/{billItem.item.unit} • {(billItem.confidence * 100).toFixed(0)}% {t('billing.confidence')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleUpdateQuantity(billItem.item.id, -1)}
                  >
                    -
                  </Button>
                  <span className="w-6 text-center font-medium">{billItem.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleUpdateQuantity(billItem.item.id, 1)}
                  >
                    +
                  </Button>
                </div>
                <p className="font-semibold w-16 text-right">
                  ₹{(billItem.item.price * billItem.quantity).toFixed(2)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveItem(billItem.item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t-2 border-primary/20 space-y-4 bg-gradient-fresh/5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">कुल योग | Total</span>
            <span className="text-3xl font-bold text-gradient-fresh">₹{billTotal.toFixed(2)}</span>
          </div>
          <Button 
            className="w-full bg-gradient-fresh border-0 shadow-glow" 
            size="lg"
            onClick={handleCompleteBill}
            disabled={billItems.length === 0}
          >
            लेन-देन पूरा करें | Complete Transaction
          </Button>
        </div>
      </Card>
    </div>
  );
}
