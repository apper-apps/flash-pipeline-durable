import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Modal from "@/components/molecules/Modal";
import ApperIcon from "@/components/ApperIcon";

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
    position: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        position: contact.position || ""
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        position: ""
      });
    }
    setErrors({});
  }, [contact, isOpen]);

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