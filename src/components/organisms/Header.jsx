import { useState } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";

const Header = ({ onMenuToggle, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-surface-200 px-4 py-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden p-2"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="BarChart3" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Pipeline Pro</h1>
              <p className="text-xs text-surface-600">CRM Dashboard</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block w-64">
            <SearchBar
              placeholder="Search contacts, deals..."
              onSearch={handleSearch}
              value={searchTerm}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 relative"
            >
              <ApperIcon name="Bell" className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ApperIcon name="Settings" className="w-5 h-5" />
            </Button>
            
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="md:hidden mt-3">
        <SearchBar
          placeholder="Search contacts, deals..."
          onSearch={handleSearch}
          value={searchTerm}
        />
      </div>
    </motion.header>
  );
};

export default Header;