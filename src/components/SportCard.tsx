import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SportCardProps {
  name: string;
  icon: LucideIcon;
  onClick?: () => void;
}

const SportCard = ({ name, icon: Icon, onClick }: SportCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover-lift group"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
        <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <p className="font-medium text-center">{name}</p>
      </CardContent>
    </Card>
  );
};

export default SportCard;
