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
  const [tagInput, setTagInput] = React.useState("");

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

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTags();
    }
  };

  const addTags = () => {
    if (tagInput.trim()) {
      const newTags = tagInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && !filters.tags.includes(tag));
      
      if (newTags.length > 0) {
        onInputChange("tags", [...filters.tags, ...newTags]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onInputChange("tags", filters.tags.filter((tag: string) => tag !== tagToRemove));
  };

  const clearAllTags = () => {
    onInputChange("tags", []);
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
        {/* Distance input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
          <Input
            value={filters.location}
            onChange={handleDistanceChange}
            placeholder="e.g. 10"
            type="number"
            min={0}
          />
          {/* Tags input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {filters.tags.map((tag: string) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-pink-600 hover:text-pink-800 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
              {filters.tags.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllTags}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <Input
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Type tags and press Enter or comma"
            />
            <p className="text-xs text-gray-500 mt-1">
              Press Enter or comma to add tags
            </p>
          </div>
        </div>
      </div>
      <Button className="mt-4" onClick={onAdvancedSearch}>Advanced Search</Button>
    </div>
  );
};
