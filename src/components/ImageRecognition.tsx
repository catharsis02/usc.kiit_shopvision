import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Scan, Check, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { fruitInventory, aiRecognitionResults } from "@/lib/data";
import { Progress } from "@/components/ui/progress";

interface RecognitionResult {
  label: string;
  confidence: number;
}

interface ImageRecognitionProps {
  onRecognized?: (item: typeof fruitInventory[0] | null, results: RecognitionResult[]) => void;
}

export function ImageRecognition({ onRecognized }: ImageRecognitionProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<RecognitionResult[] | null>(null);
  const [recognizedItem, setRecognizedItem] = useState<typeof fruitInventory[0] | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setResults(null);
        setRecognizedItem(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
  });

  const handleScan = async () => {
    if (!image) return;
    
    setIsScanning(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate AI recognition with random fruit selection
    const randomIndex = Math.floor(Math.random() * fruitInventory.length);
    const detected = fruitInventory[randomIndex];
    
    const mockResults: RecognitionResult[] = [
      { label: detected.name, confidence: 0.92 + Math.random() * 0.07 },
      { label: fruitInventory[(randomIndex + 1) % fruitInventory.length].name, confidence: 0.02 + Math.random() * 0.03 },
      { label: fruitInventory[(randomIndex + 2) % fruitInventory.length].name, confidence: 0.01 + Math.random() * 0.02 },
      { label: fruitInventory[(randomIndex + 3) % fruitInventory.length].name, confidence: Math.random() * 0.01 },
    ];
    
    setResults(mockResults);
    setRecognizedItem(detected);
    onRecognized?.(detected, mockResults);
    setIsScanning(false);
  };

  const handleReset = () => {
    setImage(null);
    setResults(null);
    setRecognizedItem(null);
  };

  return (
    <Card className="overflow-hidden bg-card shadow-medium">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl gradient-fresh">
            <Scan className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg">AI Recognition</h3>
            <p className="text-muted-foreground text-sm">Upload a fruit image for instant identification</p>
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
                  {isDragActive ? 'Drop your image here' : 'Drag & drop a fruit image'}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  or click to browse • PNG, JPG up to 10MB
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video">
              <img 
                src={image} 
                alt="Uploaded fruit" 
                className="w-full h-full object-contain"
              />
              {isScanning && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-b from-primary/60 to-transparent animate-scan-line" />
                  </div>
                  <div className="bg-card/90 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="font-medium">Analyzing image...</span>
                  </div>
                </div>
              )}
            </div>
            
            {results && recognizedItem && (
              <div className="animate-slide-up space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="p-2 rounded-full bg-primary">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      Detected: {recognizedItem.emoji} {recognizedItem.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Price: ${recognizedItem.price.toFixed(2)}/{recognizedItem.unit}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Confidence Scores</p>
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
              {!results && (
                <Button 
                  onClick={handleScan} 
                  className="flex-1"
                  variant="hero"
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4" />
                      Identify Fruit
                    </>
                  )}
                </Button>
              )}
              <Button onClick={handleReset} variant="outline" className={results ? 'flex-1' : ''}>
                {results ? 'Scan Another' : 'Remove'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
