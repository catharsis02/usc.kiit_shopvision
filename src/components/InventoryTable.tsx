import { fruitInventory, FruitItem } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import { useState } from "react";

interface InventoryTableProps {
  items?: FruitItem[];
}

export function InventoryTable({ items = fruitInventory }: InventoryTableProps) {
  const [inventory, setInventory] = useState(items);

  const getStockStatus = (stock: number) => {
    if (stock > 100) return { label: 'In Stock', color: 'bg-primary/10 text-primary border-primary/20' };
    if (stock > 30) return { label: 'Low Stock', color: 'bg-secondary/10 text-secondary border-secondary/20' };
    if (stock > 0) return { label: 'Very Low', color: 'bg-accent/10 text-accent border-accent/20' };
    return { label: 'Out of Stock', color: 'bg-destructive/10 text-destructive border-destructive/20' };
  };

  return (
    <Card className="overflow-hidden bg-card shadow-card">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-lg">Inventory Management</h3>
          <p className="text-sm text-muted-foreground">Manage your fruit and vegetable stock</p>
        </div>
        <Button variant="default" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => {
              const stockStatus = getStockStatus(item.stock);
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {item.category}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${item.price.toFixed(2)}/{item.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.stock} units
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={stockStatus.color}
                    >
                      {stockStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
