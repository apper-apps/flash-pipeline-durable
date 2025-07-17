import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import { format, isToday, isPast } from "date-fns";

const TaskItem = ({ task, contact, onToggle, onEdit, onDelete }) => {
  const formatDate = (date) => {
    if (!date) return "No due date";
    const taskDate = new Date(date);
    if (isToday(taskDate)) return "Today";
    if (isPast(taskDate)) return "Overdue";
    return format(taskDate, "MMM dd");
  };

  const getDateColor = (date) => {
    if (!date) return "text-surface-500";
    const taskDate = new Date(date);
    if (isPast(taskDate) && !isToday(taskDate)) return "text-red-600";
    if (isToday(taskDate)) return "text-accent-600";
    return "text-surface-600";
  };

  const getPriorityColor = (type) => {
    const colors = {
      'call': 'success',
      'email': 'primary',
      'meeting': 'warning',
      'follow-up': 'secondary',
      'task': 'default'
    };
    return colors[type] || 'default';
  };

  const getTaskIcon = (type) => {
    const icons = {
      'call': 'Phone',
      'email': 'Mail',
      'meeting': 'Calendar',
      'follow-up': 'ArrowRight',
      'task': 'CheckSquare'
    };
    return icons[type] || 'CheckSquare';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200 ${
        task.completed 
          ? 'bg-surface-50 border-surface-200 opacity-60' 
          : 'bg-white border-surface-200 hover:border-primary-300 hover:shadow-md'
      }`}
    >
      <button
        onClick={() => onToggle(task)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
          task.completed
            ? 'bg-gradient-to-r from-accent-500 to-accent-600 border-accent-500'
            : 'border-surface-300 hover:border-primary-500'
        }`}
      >
        {task.completed && (
          <ApperIcon name="Check" className="w-3 h-3 text-white" />
        )}
      </button>
      
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <ApperIcon name={getTaskIcon(task.type)} className="w-4 h-4 text-surface-600" />
          <h3 className={`font-medium ${task.completed ? 'line-through text-surface-500' : 'text-surface-900'}`}>
            {task.title}
          </h3>
          <Badge variant={getPriorityColor(task.type)} size="sm">
            {task.type}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <ApperIcon name="User" className="w-3 h-3 text-surface-500" />
            <span className="text-surface-600">{contact?.name || "No contact"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ApperIcon name="Calendar" className="w-3 h-3 text-surface-500" />
            <span className={getDateColor(task.dueDate)}>{formatDate(task.dueDate)}</span>
          </div>
        </div>
        
        {task.notes && (
          <p className="text-sm text-surface-600 mt-2">{task.notes}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(task)}
          className="p-2 text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors"
        >
          <ApperIcon name="Edit" className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="p-2 text-surface-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <ApperIcon name="Trash2" className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskItem;