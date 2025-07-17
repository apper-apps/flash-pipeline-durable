import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import { cn } from "@/utils/cn";

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendLabel, 
  className,
  gradient = "from-primary-500 to-secondary-500",
  temperature,
  isScore = false
}) => {
  const isPositiveTrend = trend > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
<Card className={cn("p-6 relative overflow-hidden", className)}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient} relative`}>
            <ApperIcon name={icon} className="w-6 h-6 text-white" />
            {temperature === 'hot' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center space-x-1 ${isPositiveTrend ? 'text-accent-600' : 'text-red-600'}`}>
              <ApperIcon 
                name={isPositiveTrend ? "TrendingUp" : "TrendingDown"} 
                className="w-4 h-4" 
              />
              <span className="text-sm font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-3xl font-bold gradient-text">{value}</h3>
            {isScore && (
              <div className="text-sm text-surface-500">/100</div>
            )}
          </div>
          <p className="text-surface-600 text-sm font-medium">{title}</p>
          {trendLabel && (
            <p className="text-xs text-surface-500">{trendLabel}</p>
          )}
        </div>
        
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-surface-100 to-surface-50 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
      </Card>
    </motion.div>
  );
};

export default MetricCard;