import { FruitItem } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useState } from "react";

interface FruitCardProps {
  fruit: FruitItem;
  onAddToCart?: (fruit: FruitItem, quantity: number) => void;
}

export function FruitCard({ fruit, onAddToCart }: FruitCardProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    onAddToCart?.(fruit, quantity);
    setQuantity(1);
  };

  return (
    <Card className="group relative overflow-hidden bg-card shadow-card hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
      <div className="absolute top-3 right-3 z-10">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          fruit.stock > 50 
            ? 'bg-primary/10 text-primary' 
            : fruit.stock > 20 
            ? 'bg-secondary/10 text-secondary' 
            : 'bg-destructive/10 text-destructive'
        }`}>
          {fruit.stock > 50 ? 'In Stock' : fruit.stock > 20 ? 'Low Stock' : 'Limited'}
        </span>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-center h-28 mb-4">
          <span className="text-7xl group-hover:scale-110 transition-transform duration-300 group-hover:animate-float">
            {fruit.emoji}
          </span>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-display font-semibold text-lg text-foreground">
            {fruit.name}
          </h3>
          <p className="text-muted-foreground text-sm capitalize">
            {fruit.category}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-primary">
              ${fruit.price.toFixed(2)}
            </span>
            <span className="text-muted-foreground text-sm">/{fruit.unit}</span>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={handleAdd} 
            className="flex-1"
            variant="default"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}
