import { Search, MapPin } from "lucide-react";
import { useState, useCallback } from "react";
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
  const [city, setCity] = useState("");
  const [sport, setSport] = useState("");

  const triggerSearch = useCallback(() => {
    onSearch?.(city.trim(), sport);
  }, [city, sport, onSearch]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 p-3 md:p-4 bg-background rounded-2xl md:rounded-3xl shadow-xl border">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          <Select onValueChange={(v) => setCity(v)}>
            <SelectTrigger 
              className="pl-9 md:pl-10 h-11 md:h-12 rounded-xl md:rounded-2xl border-none bg-muted"
              aria-label="Select city"
            >
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-[1000]">
              <SelectItem value="Bareilly">Bareilly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Select onValueChange={(v) => setSport(v)}>
            <SelectTrigger 
              className="h-11 md:h-12 rounded-xl md:rounded-2xl border-none bg-muted"
              aria-label="Select sport"
            >
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
        
        <Button
          variant="hero"
          size="lg"
          className="sm:w-auto w-full h-11 md:h-12 text-sm md:text-base transition-all duration-200 hover:scale-105"
          onClick={triggerSearch}
          aria-label="Search venues"
        >
          <Search className="h-4 w-4 md:h-5 md:w-5 mr-2" />
          Search Venues
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
