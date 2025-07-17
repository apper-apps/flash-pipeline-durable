import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const NavItem = ({ to, icon, label, className, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
          isActive
            ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg"
            : "text-surface-700 hover:bg-surface-100 hover:text-surface-900",
          className
        )
      }
    >
      {({ isActive }) => (
        <>
          <ApperIcon name={icon} className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{label}</span>
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 w-2 h-2 bg-white rounded-full"
            />
          )}
        </>
      )}
    </NavLink>
  );
};

export default NavItem;