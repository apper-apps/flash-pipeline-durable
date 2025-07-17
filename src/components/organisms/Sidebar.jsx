import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import NavItem from "@/components/molecules/NavItem";
import Button from "@/components/atoms/Button";

const Sidebar = ({ isOpen, onClose }) => {
const navigationItems = [
    { to: "/", icon: "BarChart3", label: "Dashboard" },
    { to: "/contacts", icon: "Users", label: "Contacts" },
    { to: "/deals", icon: "Target", label: "Deals" },
    { to: "/tasks", icon: "CheckSquare", label: "Tasks" },
    { to: "/emails", icon: "Mail", label: "Email Client" },
    { to: "/reports", icon: "TrendingUp", label: "Reports" },
    { to: "/settings", icon: "Settings", label: "Settings" }
  ];

const quickActions = [
    { icon: "UserPlus", label: "Add Contact", action: "contact" },
    { icon: "Plus", label: "New Deal", action: "deal" },
    { icon: "Calendar", label: "Schedule Task", action: "task" },
    { icon: "Sliders", label: "Custom Fields", action: "fields" }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-surface-200 h-screen">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="BarChart3" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Pipeline Pro</h1>
              <p className="text-xs text-surface-600">CRM Dashboard</p>
            </div>
          </div>
          
          <nav className="space-y-2 mb-8">
            {navigationItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </nav>
          
          <div className="border-t border-surface-200 pt-6">
            <h3 className="text-sm font-medium text-surface-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.action}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start px-4 py-2 text-surface-700 hover:bg-surface-100"
                >
                  <ApperIcon name={action.icon} className="w-4 h-4 mr-3" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface-900 bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="relative flex flex-col w-80 bg-white shadow-elevated"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <ApperIcon name="BarChart3" className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold gradient-text">Pipeline Pro</h1>
                    <p className="text-xs text-surface-600">CRM Dashboard</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </Button>
              </div>
              
              <nav className="space-y-2 mb-8">
                {navigationItems.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    onClick={onClose}
                  />
                ))}
              </nav>
              
              <div className="border-t border-surface-200 pt-6">
                <h3 className="text-sm font-medium text-surface-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.action}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start px-4 py-2 text-surface-700 hover:bg-surface-100"
                      onClick={onClose}
                    >
                      <ApperIcon name={action.icon} className="w-4 h-4 mr-3" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;