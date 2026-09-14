"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neup/components/ui/select";
import { Input } from "@neup/components/ui/input";
import { Button } from "@neup/components/ui/button";
import { X } from "lucide-react";

interface TourFiltersProps {
  filters: {
    search: string;
    region: string;
    difficulty: string;
  };
  setFilters: (filters: TourFiltersProps["filters"]) => void;
  regions: string[];
  difficulties: string[];
}

export function TourFilters({ filters, setFilters, regions, difficulties }: TourFiltersProps) {

  const handleReset = () => {
    setFilters({
      search: '',
      region: '',
      difficulty: '',
    });
  }

  const isFiltered = !!filters.search || !!filters.region || !!filters.difficulty;

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        <Input
          placeholder="Search by name..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="lg:col-span-2"
        />
        <Select
          value={filters.region}
          onValueChange={(value) => setFilters({ ...filters, region: value === 'all' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.difficulty}
          onValueChange={(value) => setFilters({ ...filters, difficulty: value === 'all' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            {difficulties.map((difficulty) => (
              <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {isFiltered && (
            <div className="lg:col-start-4">
                <Button variant="ghost" onClick={handleReset} className="w-full">
                    <X className="mr-2 h-4 w-4" /> Reset Filters
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
