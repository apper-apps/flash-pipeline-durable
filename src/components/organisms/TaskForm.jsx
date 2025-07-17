import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Modal from "@/components/molecules/Modal";
import ApperIcon from "@/components/ApperIcon";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";

const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  task = null,
  title = "Add Task" 
}) => {
  const [formData, setFormData] = useState({
    title: "",
    type: "task",
    dueDate: "",
    contactId: "",
    dealId: "",
    notes: ""
  });

  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const taskTypes = [
    { value: "call", label: "Call" },
    { value: "email", label: "Email" },
    { value: "meeting", label: "Meeting" },
    { value: "follow-up", label: "Follow-up" },
    { value: "task", label: "Task" }
  ];

  useEffect(() => {
    if (isOpen) {
      loadContacts();
      loadDeals();
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        type: task.type || "task",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
        contactId: task.contactId || "",
        dealId: task.dealId || "",
        notes: task.notes || ""
      });
    } else {
      setFormData({
        title: "",
        type: "task",
        dueDate: "",
        contactId: "",
        dealId: "",
        notes: ""
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const loadContacts = async () => {
    try {
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (error) {
      toast.error("Failed to load contacts");
    }
  };

  const loadDeals = async () => {
    try {
      const dealsData = await dealService.getAll();
      setDeals(dealsData);
    } catch (error) {
      toast.error("Failed to load deals");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
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
      const taskData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        contactId: formData.contactId || null,
        dealId: formData.dealId || null
      };
      
      await onSave(taskData);
      toast.success(task ? "Task updated successfully!" : "Task created successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to save task. Please try again.");
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
          label="Task Title"
          required
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          error={errors.title}
          placeholder="Enter task title"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Type"
            error={errors.type}
          >
            <select
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {taskTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </FormField>
          
          <FormField
            label="Due Date"
            type="date"
            required
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
            error={errors.dueDate}
          />
        </div>
        
        <FormField
          label="Contact"
          error={errors.contactId}
        >
          <select
            value={formData.contactId}
            onChange={(e) => handleChange("contactId", e.target.value)}
            className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select a contact (optional)</option>
            {contacts.map((contact) => (
              <option key={contact.Id} value={contact.Id}>
                {contact.name} - {contact.company}
              </option>
            ))}
          </select>
        </FormField>
        
        <FormField
          label="Related Deal"
          error={errors.dealId}
        >
          <select
            value={formData.dealId}
            onChange={(e) => handleChange("dealId", e.target.value)}
            className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select a deal (optional)</option>
            {deals.map((deal) => (
              <option key={deal.Id} value={deal.Id}>
                {deal.title}
              </option>
            ))}
          </select>
        </FormField>
        
        <FormField
          label="Notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Add any additional notes"
        >
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows="3"
            className="flex w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="Add any additional notes"
          />
        </FormField>
        
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
                {task ? "Update" : "Create"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;