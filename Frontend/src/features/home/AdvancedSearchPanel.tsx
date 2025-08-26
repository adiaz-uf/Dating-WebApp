import React from "react";
import { Slider } from "./Slider";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

interface AdvancedSearchPanelProps {
  filters: any;
  onInputChange: (field: string, value: any) => void;
  onAdvancedSearch: () => void;
}

export const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({ filters, onInputChange, onAdvancedSearch }) => {
  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (val === "") {
      onInputChange("location", "");
    } else {
      const num = Number(val);
      if (!isNaN(num) && num >= 0) {
        onInputChange("location", num);
      } else {
        onInputChange("location", "");
      }
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.trim() === "") {
      onInputChange("tags", []);
    } else {
      onInputChange("tags", val.split(",").map((t: string) => t.trim()).filter(Boolean));
    }
  };

  return (
    <div className="w-full max-w-6xl bg-white shadow-md rounded-3xl p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Advanced search</h2>
      <div className="flex flex-wrap justify-around gap-4">
        {/* Age slider */}
        <div>
          <Slider
            label="Min Age"
            min={18}
            max={filters.ageRange[1]}
            value={filters.ageRange[0]}
            onChange={(val) => onInputChange("ageRange", [val, filters.ageRange[1]])}
          />
          <Slider
            label="Max Age"
            min={filters.ageRange[0]}
            max={99}
            value={filters.ageRange[1]}
            onChange={(val) => onInputChange("ageRange", [filters.ageRange[0], val])}
          />
        </div>
        {/* Fame slider */}
        <div>
          <Slider
            label="Min Fame"
            min={0}
            max={filters.fameRating[1]}
            value={filters.fameRating[0]}
            onChange={(val) => onInputChange("fameRating", [val, filters.fameRating[1]])}
          />
          <Slider
            label="Max Fame"
            min={filters.fameRating[0]}
            max={100}
            value={filters.fameRating[1]}
            onChange={(val) => onInputChange("fameRating", [filters.fameRating[0], val])}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
          <Input
            value={filters.location}
            onChange={handleDistanceChange}
            placeholder="e.g. 10"
            type="number"
            min={0}
          />
      
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Tags</label>
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">(comma separated)</label>
          <Input
            value={filters.tags.join(", ")}
            placeholder="e.g. pets"
            onChange={handleTagsChange}
          />
        </div>
      </div>
      <Button className="mt-4" onClick={onAdvancedSearch}>Advanced Search</Button>
    </div>
  );
};
