import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  title = "No data available",
  message = "Get started by creating your first item.",
  actionLabel = "Create New",
  onAction,
  icon = "Inbox",
  showAction = true 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="w-20 h-20 mb-6 bg-gradient-to-br from-surface-100 to-surface-200 rounded-full flex items-center justify-center">
        <ApperIcon name={icon} className="w-10 h-10 text-surface-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-surface-900 mb-2">{title}</h3>
      <p className="text-surface-600 mb-8 max-w-md">{message}</p>
      
      {showAction && onAction && (
        <Button
          onClick={onAction}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <ApperIcon name="Zap" className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h4 className="font-medium text-surface-900 mb-1">Quick Start</h4>
            <p className="text-sm text-surface-600">Create your first item in seconds</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-100 to-accent-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <ApperIcon name="Target" className="w-4 h-4 text-accent-600" />
          </div>
          <div>
            <h4 className="font-medium text-surface-900 mb-1">Stay Organized</h4>
            <p className="text-sm text-surface-600">Keep everything in one place</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <ApperIcon name="TrendingUp" className="w-4 h-4 text-secondary-600" />
          </div>
          <div>
            <h4 className="font-medium text-surface-900 mb-1">Track Progress</h4>
            <p className="text-sm text-surface-600">Monitor your success metrics</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Empty;