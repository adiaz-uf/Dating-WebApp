import React from "react";
import { Select } from "./Select";
import { Input } from "../../components/Input";

interface FiltersPanelProps {
  filters: any;
  onInputChange: (field: string, value: any) => void;
  onSearch: () => void;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({ filters, onInputChange, onSearch }) => {
  return (
    <div className="w-full max-w-6xl bg-white shadow-md rounded-3xl p-8 mb-6">
      <div className="flex items-center flex-col justify-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Search Profiles</h2>
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-center flex-wrap">
          <div className="flex flex-col">
            <Select
              label="Sort By"
              value={filters.sortBy}
              options={[
                { label: "Age", value: "age" },
                { label: "Location", value: "location" },
                { label: "Fame Rating", value: "fame_rating" },
                { label: "Tags", value: "tags" },
              ]}
              onChange={(val) => onInputChange("sortBy", val)}
            />
            <Select
              label="Order"
              value={filters.sortOrder}
              options={[
                { label: "Ascending", value: "asc" },
                { label: "Descending", value: "desc" },
              ]}
              onChange={(val) => onInputChange("sortOrder", val)}
            />
          </div>
          <div className="sm:m-4 m-2">
            <p className="text-lg">or</p>
          </div>
          <div className="flex flex-col items-center">
            <Select
              label="Filter By"
              value={filters.filterBy}
              options={[
                { label: "Age", value: "age" },
                { label: "Location", value: "location" },
                { label: "Fame Rating", value: "fame_rating" },
                { label: "Tag", value: "tag" },
              ]}
              
              onChange={(val) => onInputChange("filterBy", val)}
            />
            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">Type an specific: {filters.filterBy}</label>
            <Input
                value={(() => {
                  switch (filters.filterBy) {
                    case "age": return filters.specificAge;
                    case "location": return filters.specificLocation;
                    case "fame_rating": return filters.specificFame;
                    case "tag": return filters.specificTag;
                    default: return "";
                  }
                })()}
                onChange={e => {
                  switch (filters.filterBy) {
                    case "age": 
                      onInputChange("specificAge", e.target.value);
                      break;
                    case "location": 
                      onInputChange("specificLocation", e.target.value);
                      break;
                    case "fame_rating": 
                      onInputChange("specificFame", e.target.value);
                      break;
                    case "tag": 
                      onInputChange("specificTag", e.target.value);
                      break;
                  }
                }}
                className="ml-2 mb-2"
                placeholder={`Enter ${filters.filterBy}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
