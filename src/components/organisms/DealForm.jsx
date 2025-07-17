import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Modal from "@/components/molecules/Modal";
import ApperIcon from "@/components/ApperIcon";
import { contactService } from "@/services/api/contactService";
import { customFieldService } from "@/services/api/customFieldService";

const DealForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  deal = null,
  title = "Add Deal" 
}) => {
const [formData, setFormData] = useState({
    title: "",
    value: "",
    stage: "Lead",
    contactId: "",
    probability: 25,
    expectedClose: "",
    customFields: {}
  });

const [contacts, setContacts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [customFields, setCustomFields] = useState([]);

  const stages = [
    { value: "Lead", label: "Lead" },
    { value: "Qualified", label: "Qualified" },
    { value: "Proposal", label: "Proposal" },
    { value: "Negotiation", label: "Negotiation" },
    { value: "Closed", label: "Closed" }
  ];

useEffect(() => {
    if (isOpen) {
      loadContacts();
      loadCustomFields();
    }
  }, [isOpen]);

useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || "",
        value: deal.value || "",
        stage: deal.stage || "Lead",
        contactId: deal.contactId || "",
        probability: deal.probability || 25,
        expectedClose: deal.expectedClose ? new Date(deal.expectedClose).toISOString().split('T')[0] : "",
        customFields: deal.customFields || {}
      });
    } else {
      setFormData({
        title: "",
        value: "",
        stage: "Lead",
        contactId: "",
        probability: 25,
        expectedClose: "",
        customFields: {}
      });
    }
    setErrors({});
  }, [deal, isOpen]);

const loadContacts = async () => {
    try {
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (error) {
      toast.error("Failed to load contacts");
    }
  };

  const loadCustomFields = async () => {
    try {
      const allFields = await customFieldService.getAll();
      const dealFields = allFields.filter(field => field.entity === 'deal');
      setCustomFields(dealFields);
    } catch (error) {
      toast.error("Failed to load custom fields");
    }
  };

const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Deal title is required";
    }
    
    if (!formData.value || formData.value <= 0) {
      newErrors.value = "Deal value must be greater than 0";
    }
    
    if (!formData.contactId) {
      newErrors.contactId = "Please select a contact";
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
      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability),
        expectedClose: formData.expectedClose ? new Date(formData.expectedClose).toISOString() : null
      };
      
      await onSave(dealData);
      toast.success(deal ? "Deal updated successfully!" : "Deal created successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to save deal. Please try again.");
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
          label="Deal Title"
          required
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          error={errors.title}
          placeholder="Enter deal title"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Deal Value"
            type="number"
            required
            value={formData.value}
            onChange={(e) => handleChange("value", e.target.value)}
            error={errors.value}
            placeholder="0"
          />
          
          <FormField
            label="Probability (%)"
            type="number"
            min="0"
            max="100"
            value={formData.probability}
            onChange={(e) => handleChange("probability", e.target.value)}
            placeholder="25"
          />
        </div>
        
        <FormField
          label="Contact"
          required
          error={errors.contactId}
        >
          <select
            value={formData.contactId}
            onChange={(e) => handleChange("contactId", e.target.value)}
            className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select a contact</option>
            {contacts.map((contact) => (
              <option key={contact.Id} value={contact.Id}>
                {contact.name} - {contact.company}
              </option>
            ))}
          </select>
        </FormField>
        
        <FormField
          label="Stage"
          error={errors.stage}
        >
          <select
            value={formData.stage}
            onChange={(e) => handleChange("stage", e.target.value)}
            className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {stages.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </FormField>
        
        <FormField
          label="Expected Close Date"
          type="date"
          value={formData.expectedClose}
          onChange={(e) => handleChange("expectedClose", e.target.value)}
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
                {deal ? "Update" : "Create"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DealForm;