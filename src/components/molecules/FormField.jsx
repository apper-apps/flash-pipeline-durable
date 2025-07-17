import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  type = "text", 
  required = false, 
  error, 
  children, 
  className,
  ...props 
}) => {
const renderInput = () => {
    if (children) {
      return children;
    }
    
    if (type === "select") {
      return <Select {...props} />;
    }
    
    if (type === "textarea") {
      return (
        <textarea
          {...props}
          className="flex min-h-[80px] w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
        />
      );
    }
    
    if (type === "checkbox") {
      return (
        <input
          type="checkbox"
          {...props}
          className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
        />
      );
    }
    
    return <Input type={type} {...props} />;
  };

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {renderInput()}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;