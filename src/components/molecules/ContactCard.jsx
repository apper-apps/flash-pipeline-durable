import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Avatar from "@/components/atoms/Avatar";
import Badge from "@/components/atoms/Badge";
import { format } from "date-fns";

const ContactCard = ({ contact, onEdit, onDelete, onCall, onEmail }) => {
  const formatLastContact = (date) => {
    if (!date) return "Never";
    return format(new Date(date), "MMM dd, yyyy");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar
              alt={contact.name}
              fallback={contact.name}
              size="lg"
            />
            <div>
              <h3 className="font-semibold text-surface-900">{contact.name}</h3>
              <p className="text-sm text-surface-600">{contact.position}</p>
              <p className="text-sm text-surface-500">{contact.company}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onCall(contact)}
              className="p-2 text-surface-600 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
            >
              <ApperIcon name="Phone" className="w-4 h-4" />
            </button>
<button
              onClick={() => onEmail(contact)}
              className="p-2 text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Open Email Client"
            >
              <ApperIcon name="Mail" className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(contact)}
              className="p-2 text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors"
            >
              <ApperIcon name="Edit" className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(contact)}
              className="p-2 text-surface-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <ApperIcon name="Trash2" className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-surface-600">
            <ApperIcon name="Mail" className="w-4 h-4" />
            <span>{contact.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-surface-600">
            <ApperIcon name="Phone" className="w-4 h-4" />
            <span>{contact.phone}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" size="sm">
            Last contact: {formatLastContact(contact.lastContact)}
          </Badge>
          <div className="flex items-center space-x-2 text-xs text-surface-500">
            <ApperIcon name="Calendar" className="w-3 h-3" />
            <span>Added {format(new Date(contact.createdAt), "MMM dd")}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ContactCard;