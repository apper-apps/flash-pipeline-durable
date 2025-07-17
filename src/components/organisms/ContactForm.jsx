import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Modal from "@/components/molecules/Modal";
import ApperIcon from "@/components/ApperIcon";
import { customFieldService } from "@/services/api/customFieldService";

const ContactForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  contact = null,
  title = "Add Contact" 
}) => {
const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    customFields: {}
  });

const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [customFields, setCustomFields] = useState([]);

useEffect(() => {
    if (isOpen) {
      loadCustomFields();
    }
  }, [isOpen]);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        position: contact.position || "",
        customFields: contact.customFields || {}
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        customFields: {}
      });
    }
    setErrors({});
  }, [contact, isOpen]);

  const loadCustomFields = async () => {
    try {
      const allFields = await customFieldService.getAll();
      const contactFields = allFields.filter(field => field.entity === 'contact');
      setCustomFields(contactFields);
    } catch (error) {
      toast.error("Failed to load custom fields");
    }
  };

const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }
    
    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    }

    // Validate custom fields
    customFields.forEach(field => {
      if (field.required) {
        const value = formData.customFields[field.name];
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[`custom_${field.name}`] = `${field.label} is required`;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      toast.success(contact ? "Contact updated successfully!" : "Contact created successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to save contact. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldName]: value
      }
    }));
    
    const errorKey = `custom_${fieldName}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ""
      }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Full Name"
          required
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          placeholder="Enter full name"
        />
        
        <FormField
          label="Email Address"
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          placeholder="Enter email address"
        />
        
        <FormField
          label="Phone Number"
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          error={errors.phone}
          placeholder="Enter phone number"
        />
        
        <FormField
          label="Company"
          required
          value={formData.company}
          onChange={(e) => handleChange("company", e.target.value)}
          error={errors.company}
          placeholder="Enter company name"
        />
        
        <FormField
          label="Position"
          value={formData.position}
          onChange={(e) => handleChange("position", e.target.value)}
          error={errors.position}
          placeholder="Enter job title"
/>
        
        {/* Custom Fields */}
        {customFields.map(field => {
          const value = formData.customFields[field.name] || '';
          const errorKey = `custom_${field.name}`;
          
          if (field.type === 'select') {
            return (
              <FormField
                key={field.Id}
                label={field.label}
                required={field.required}
                error={errors[errorKey]}
              >
                <select
                  value={value}
                  onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </FormField>
            );
          }
          
          if (field.type === 'boolean') {
            return (
              <FormField
                key={field.Id}
                label={field.label}
                required={field.required}
                error={errors[errorKey]}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value === true}
                    onChange={(e) => handleCustomFieldChange(field.name, e.target.checked)}
                    className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-surface-700">Yes</span>
                </div>
              </FormField>
            );
          }
          
          return (
            <FormField
              key={field.Id}
              label={field.label}
              type={field.type}
              required={field.required}
              value={value}
              onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
              error={errors[errorKey]}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          );
        })}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                {contact ? "Update" : "Create"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContactForm;