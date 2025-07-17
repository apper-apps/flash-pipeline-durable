import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import { format } from "date-fns";

const DealCard = ({ deal, contact, onEdit, onDelete, isDragging = false }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStageColor = (stage) => {
    const colors = {
      'Lead': 'primary',
      'Qualified': 'warning',
      'Proposal': 'secondary',
      'Negotiation': 'danger',
      'Closed': 'success'
    };
    return colors[stage] || 'default';
  };

  const formatDate = (date) => {
    if (!date) return "No date set";
    return format(new Date(date), "MMM dd, yyyy");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: isDragging ? 1 : 1.02 }}
      transition={{ duration: 0.2 }}
      className={isDragging ? "opacity-50 rotate-2 shadow-2xl" : ""}
    >
      <Card className="p-4 cursor-move">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-surface-900 mb-1">{deal.title}</h3>
            <p className="text-sm text-surface-600">{contact?.name || "Unknown Contact"}</p>
            <p className="text-xs text-surface-500">{contact?.company || "No Company"}</p>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(deal)}
              className="p-1 text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded transition-colors"
            >
              <ApperIcon name="Edit" className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(deal)}
              className="p-1 text-surface-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <ApperIcon name="Trash2" className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold gradient-text">
              {formatCurrency(deal.value)}
            </span>
            <Badge variant={getStageColor(deal.stage)} size="sm">
              {deal.probability}%
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-surface-600">
            <ApperIcon name="Calendar" className="w-3 h-3" />
            <span>Expected: {formatDate(deal.expectedClose)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
            <span className="text-xs text-surface-500">
              Created {format(new Date(deal.createdAt), "MMM dd")}
            </span>
          </div>
          <button className="p-1 text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
            <ApperIcon name="MessageCircle" className="w-3 h-3" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

export default DealCard;