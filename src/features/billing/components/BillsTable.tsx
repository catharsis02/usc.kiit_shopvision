import { sampleBills } from "@/lib/data";
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

export function BillsTable() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'pending':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'refunded':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="overflow-hidden bg-card shadow-card">
      <div className="p-6 border-b border-border">
        <h3 className="font-display font-semibold text-lg">Recent Bills</h3>
        <p className="text-sm text-muted-foreground">All customer transactions</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleBills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">{bill.id}</TableCell>
                <TableCell>{bill.customerName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {bill.items.slice(0, 3).map((item, idx) => (
                      <span key={idx}>{item.item.emoji}</span>
                    ))}
                    {bill.items.length > 3 && (
                      <span className="text-muted-foreground text-sm">
                        +{bill.items.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  ${bill.total.toFixed(2)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {bill.date}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`capitalize ${getStatusColor(bill.status)}`}
                  >
                    {bill.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
