import { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";
import { cn } from "@/utils/cn";

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  className,
  value,
  onChange 
}) => {
  const [searchTerm, setSearchTerm] = useState(value || "");

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (onChange) {
      onChange(newValue);
    }
    if (onSearch) {
      onSearch(newValue);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    if (onChange) {
      onChange("");
    }
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <ApperIcon name="Search" className="h-4 w-4 text-surface-400" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        className="pl-10 pr-10"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-400 hover:text-surface-600 transition-colors"
        >
          <ApperIcon name="X" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;