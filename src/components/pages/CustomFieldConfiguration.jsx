import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import Modal from "@/components/molecules/Modal";
import ApperIcon from "@/components/ApperIcon";
import { customFieldService } from "@/services/api/customFieldService";

const CustomFieldConfiguration = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [activeTab, setActiveTab] = useState('contact');

  const [formData, setFormData] = useState({
    name: "",
    label: "",
    type: "text",
    entity: "contact",
    required: false,
    options: []
  });

  const [newOption, setNewOption] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "select", label: "Select" },
    { value: "boolean", label: "Yes/No" },
    { value: "textarea", label: "Text Area" }
  ];

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      setLoading(true);
      setError(null);
      const fieldsData = await customFieldService.getAll();
      setFields(fieldsData);
    } catch (err) {
      setError("Failed to load custom fields");
      toast.error("Failed to load custom fields");
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    setEditingField(null);
    setFormData({
      name: "",
      label: "",
      type: "text",
      entity: activeTab,
      required: false,
      options: []
    });
    setFormErrors({});
    setNewOption("");
    setIsFormOpen(true);
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      label: field.label,
      type: field.type,
      entity: field.entity,
      required: field.required,
      options: field.options || []
    });
    setFormErrors({});
    setNewOption("");
    setIsFormOpen(true);
  };

  const handleDeleteField = async (fieldId) => {
    if (!confirm("Are you sure you want to delete this field? This action cannot be undone.")) {
      return;
    }

    try {
      await customFieldService.delete(fieldId);
      setFields(prev => prev.filter(field => field.Id !== fieldId));
      toast.success("Field deleted successfully");
    } catch (error) {
      toast.error("Failed to delete field");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Field name is required";
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.name)) {
      errors.name = "Field name must start with a letter and contain only letters, numbers, and underscores";
    } else {
      // Check for duplicate names
      const existingField = fields.find(field => 
        field.name.toLowerCase() === formData.name.toLowerCase() && 
        field.entity === formData.entity &&
        field.Id !== editingField?.Id
      );
      if (existingField) {
        errors.name = "A field with this name already exists";
      }
    }

    if (!formData.label.trim()) {
      errors.label = "Field label is required";
    }

    if (formData.type === "select" && formData.options.length === 0) {
      errors.options = "Select fields must have at least one option";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const fieldData = {
        ...formData,
        name: formData.name.trim(),
        label: formData.label.trim()
      };

      if (editingField) {
        const updatedField = await customFieldService.update(editingField.Id, fieldData);
        setFields(prev => prev.map(field => 
          field.Id === editingField.Id ? updatedField : field
        ));
        toast.success("Field updated successfully");
      } else {
        const newField = await customFieldService.create(fieldData);
        setFields(prev => [...prev, newField]);
        toast.success("Field created successfully");
      }

      setIsFormOpen(false);
    } catch (error) {
      toast.error("Failed to save field");
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption("");
    }
  };

  const handleRemoveOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleMoveField = (fieldId, direction) => {
    const currentIndex = fields.findIndex(field => field.Id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];
    setFields(newFields);
  };

  const filteredFields = fields.filter(field => field.entity === activeTab);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <ApperIcon name="Loader2" className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-surface-600 mb-4">{error}</p>
          <Button onClick={loadFields}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 mb-2">Custom Fields</h1>
        <p className="text-surface-600">Configure custom fields for contacts and deals to capture industry-specific information.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-surface-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contact'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
            }`}
          >
            Contact Fields
          </button>
          <button
            onClick={() => setActiveTab('deal')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'deal'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
            }`}
          >
            Deal Fields
          </button>
        </nav>
      </div>

      {/* Add Field Button */}
      <div className="mb-6">
        <Button onClick={handleAddField} className="inline-flex items-center">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Custom Field
        </Button>
      </div>

      {/* Fields List */}
      <div className="space-y-4">
        {filteredFields.length === 0 ? (
          <Card className="text-center py-12">
            <ApperIcon name="Database" className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-surface-900 mb-2">No custom fields</h3>
            <p className="text-surface-600 mb-4">
              Create custom fields to capture {activeTab === 'contact' ? 'contact' : 'deal'}-specific information.
            </p>
            <Button onClick={handleAddField} variant="outline">
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Add Your First Field
            </Button>
          </Card>
        ) : (
          filteredFields.map((field, index) => (
            <Card key={field.Id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-surface-900">{field.label}</h3>
                    <span className="px-2 py-1 text-xs bg-surface-100 text-surface-700 rounded">
                      {fieldTypes.find(t => t.value === field.type)?.label}
                    </span>
                    {field.required && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-surface-600 mt-1">
                    Field name: {field.name}
                  </p>
                  {field.type === 'select' && field.options && (
                    <p className="text-sm text-surface-600 mt-1">
                      Options: {field.options.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveField(field.Id, 'up')}
                    disabled={index === 0}
                  >
                    <ApperIcon name="ArrowUp" className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMoveField(field.Id, 'down')}
                    disabled={index === filteredFields.length - 1}
                  >
                    <ApperIcon name="ArrowDown" className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditField(field)}
                  >
                    <ApperIcon name="Edit" className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteField(field.Id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Field Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingField ? "Edit Custom Field" : "Add Custom Field"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Field Name"
            required
            value={formData.name}
            onChange={(e) => handleFormChange("name", e.target.value)}
            error={formErrors.name}
            placeholder="e.g., industry_type"
            disabled={!!editingField}
          />

          <FormField
            label="Field Label"
            required
            value={formData.label}
            onChange={(e) => handleFormChange("label", e.target.value)}
            error={formErrors.label}
            placeholder="e.g., Industry Type"
          />

          <FormField
            label="Field Type"
            required
            error={formErrors.type}
          >
            <select
              value={formData.type}
              onChange={(e) => handleFormChange("type", e.target.value)}
              className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {fieldTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Entity"
            required
            error={formErrors.entity}
          >
            <select
              value={formData.entity}
              onChange={(e) => handleFormChange("entity", e.target.value)}
              className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={!!editingField}
            >
              <option value="contact">Contact</option>
              <option value="deal">Deal</option>
            </select>
          </FormField>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="required"
              checked={formData.required}
              onChange={(e) => handleFormChange("required", e.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="required" className="text-sm text-surface-700">
              Required field
            </label>
          </div>

          {formData.type === 'select' && (
            <div>
              <label className="block text-sm font-medium text-surface-900 mb-2">
                Options
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Add option"
                    className="flex-1 h-10 rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    disabled={!newOption.trim()}
                  >
                    <ApperIcon name="Plus" className="w-4 h-4" />
                  </Button>
                </div>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center justify-between bg-surface-50 px-3 py-2 rounded">
                    <span className="text-sm">{option}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="X" className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {formErrors.options && (
                <p className="text-sm text-red-600 mt-1">{formErrors.options}</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              <ApperIcon name="Save" className="w-4 h-4 mr-2" />
              {editingField ? "Update Field" : "Create Field"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomFieldConfiguration;