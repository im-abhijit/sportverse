import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchBarProps {
  onSearch?: (city: string, sport: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-background rounded-3xl shadow-xl border">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Enter your city"
            className="pl-10 h-12 rounded-2xl border-none bg-muted"
          />
        </div>
        
        <div className="flex-1">
          <Select>
            <SelectTrigger className="h-12 rounded-2xl border-none bg-muted">
              <SelectValue placeholder="Select Sport" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="cricket">Cricket</SelectItem>
              <SelectItem value="football">Football</SelectItem>
              <SelectItem value="badminton">Badminton</SelectItem>
              <SelectItem value="tennis">Tennis</SelectItem>
              <SelectItem value="basketball">Basketball</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="hero" size="lg" className="md:w-auto w-full">
          <Search className="h-5 w-5 mr-2" />
          Search Venues
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
