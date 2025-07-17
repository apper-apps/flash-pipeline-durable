import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Error = ({ 
  title = "Something went wrong",
  message = "We encountered an error while loading your data. Please try again.",
  onRetry,
  showRetry = true 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="w-16 h-16 mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
        <ApperIcon name="AlertCircle" className="w-8 h-8 text-red-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-surface-900 mb-2">{title}</h3>
      <p className="text-surface-600 mb-6 max-w-md">{message}</p>
      
      {showRetry && onRetry && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 transform hover:scale-105"
          >
            <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-surface-300 text-surface-700 rounded-lg hover:bg-surface-50 transition-all duration-200"
          >
            <ApperIcon name="RotateCcw" className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      )}
      
      <div className="mt-8 text-sm text-surface-500">
        <p>If the problem persists, please contact support.</p>
      </div>
    </motion.div>
  );
};

export default Error;