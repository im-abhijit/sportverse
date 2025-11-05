import { Search, MapPin } from "lucide-react";
import { useState } from "react";
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

  const triggerSearch = () => {
    onSearch?.(city.trim(), sport);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-background rounded-3xl shadow-xl border">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Select onValueChange={(v) => setCity(v)}>
            <SelectTrigger className="pl-10 h-12 rounded-2xl border-none bg-muted">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-[1000]">
              <SelectItem value="Bareilly">Bareilly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Select onValueChange={(v) => setSport(v)}>
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
        
        <Button
          variant="hero"
          size="lg"
          className="md:w-auto w-full"
          onClick={triggerSearch}
        >
          <Search className="h-5 w-5 mr-2" />
          Search Venues
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
