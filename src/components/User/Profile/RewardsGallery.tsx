import { Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketZoneLabel } from '@/collections/Events/constants'

interface Reward {
  id: string
  label: TicketZoneLabel
  type: "giftTicket"
  expiresAt: string
}

interface RewardsGalleryProps {
  rewards: Reward[];
  className: string;
}

const typeConfig = {
  product: {
    color: "bg-blue-500/10 text-blue-700 border-blue-200",
    label: "Product",
    imageUrl: "https://via.placeholder.com/400x200/007bff/ffffff?text=Product"
  },
  giftTicket: {
    color: "bg-purple-500/10 text-purple-700 border-purple-200",
    label: "Ticket",
    imageUrl: "/images/ticket-gift.jpg"
  },
  discount: {
    color: "bg-green-500/10 text-green-700 border-green-200", 
    label: "Discount",
    imageUrl: "https://via.placeholder.com/400x200/28a745/ffffff?text=Discount"
  }
};

export function RewardsGallery({ rewards, className }: RewardsGalleryProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Gift className="w-5 h-5" />
          VIP Rewards Collection
        </CardTitle>
        <p className="text-sm text-muted-foreground">Your exclusive benefits showcase</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {rewards.map((reward, index) => {
            const config = typeConfig[reward.type];
            const imageUrl = config.imageUrl
            
            return (
              <div 
                key={reward.id}
                className="h-64 group relative overflow-hidden rounded-lg border bg-gradient-subtle hover:shadow-md transition-all duration-300"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="h-40 bg-muted relative overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={reward.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-white/90 border-white/50">
                      <Check className="w-3 h-3 mr-1 text-green-600" />
                      Claimed
                    </Badge>
                  </div> */}
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {reward.label}
                    </h3>
                    <Badge variant="outline" className={config.color}>
                      {config.label}
                    </Badge>
                  </div>
                  
                  {/* <p className="text-sm text-muted-foreground truncate">
                    {reward.description}
                  </p> */}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      Expires at: {reward.expiresAt}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {rewards.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No rewards claimed yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start earning points to unlock amazing rewards!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}