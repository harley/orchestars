import { Calendar, ShoppingBag, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from '@/utilities/formatMoney'

type RewardsTimeline = {
  id: number
  description: string
  date: string
  pointsEarned: number
  amount: number
  type: "purchase" | "bonus"
}[]

interface OrderHistoryProps {
  orders: RewardsTimeline
  className: string
}

const typeConfig = {
  purchase: {
    icon: ShoppingBag,
    label: "purchase",
    color: "bg-blue-500/10 text-blue-700 border-blue-200"
  },
  bonus: {
    icon: TrendingUp,
    label: "bonus",
    color: "bg-green-500/10 text-green-700 border-green-200"
  },
};

export function OrderHistory({ orders, className }: OrderHistoryProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="w-5 h-5" />
          Exclusive Rewards Timeline
        </CardTitle>
        <p className="text-sm text-muted-foreground">Your premium earning journey</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {orders?.map((order, index) => {
            const config = typeConfig[order.type];
            const Icon = config.icon;
            
            return (
              <div 
                key={order.id}
                className="h-28 flex items-center gap-1 justify-between p-4 rounded-lg border hover:shadow-md transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{order.description}</p>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-1">
                  <Badge variant="outline" className={config.color}>
                    {config.label}
                  </Badge>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold">+{order.pointsEarned}</span>
                    <span className="text-sm text-muted-foreground">{formatMoney(order.amount)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          { orders.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No rewards history available.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}