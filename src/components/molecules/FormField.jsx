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