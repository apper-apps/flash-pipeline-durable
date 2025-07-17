import mockCustomFields from '@/services/mockData/customFields.json';

// Simple ID counter for new fields
let nextId = Math.max(...mockCustomFields.map(field => field.Id)) + 1;

// In-memory storage for runtime modifications
let customFieldsData = [...mockCustomFields];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const customFieldService = {
  async getAll() {
    await delay(300);
    return [...customFieldsData];
  },

  async getById(id) {
    await delay(300);
    const field = customFieldsData.find(field => field.Id === parseInt(id));
    return field ? { ...field } : null;
  },

  async create(fieldData) {
    await delay(300);
    
    // Validate field data
    if (!fieldData.name || !fieldData.label || !fieldData.type || !fieldData.entity) {
      throw new Error('Missing required field data');
    }

    // Check for duplicate field names within the same entity
    const existingField = customFieldsData.find(field => 
      field.name.toLowerCase() === fieldData.name.toLowerCase() && 
      field.entity === fieldData.entity
    );
    
    if (existingField) {
      throw new Error('A field with this name already exists for this entity');
    }

    const newField = {
      Id: nextId++,
      name: fieldData.name,
      label: fieldData.label,
      type: fieldData.type,
      entity: fieldData.entity,
      required: fieldData.required || false,
      options: fieldData.options || [],
      order: customFieldsData.filter(f => f.entity === fieldData.entity).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    customFieldsData.push(newField);
    return { ...newField };
  },

  async update(id, fieldData) {
    await delay(300);
    
    const fieldIndex = customFieldsData.findIndex(field => field.Id === parseInt(id));
    if (fieldIndex === -1) {
      throw new Error('Field not found');
    }

    // Check for duplicate field names within the same entity (excluding current field)
    const existingField = customFieldsData.find(field => 
      field.name.toLowerCase() === fieldData.name.toLowerCase() && 
      field.entity === fieldData.entity &&
      field.Id !== parseInt(id)
    );
    
    if (existingField) {
      throw new Error('A field with this name already exists for this entity');
    }

    const updatedField = {
      ...customFieldsData[fieldIndex],
      ...fieldData,
      Id: parseInt(id), // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    customFieldsData[fieldIndex] = updatedField;
    return { ...updatedField };
  },

  async delete(id) {
    await delay(300);
    
    const fieldIndex = customFieldsData.findIndex(field => field.Id === parseInt(id));
    if (fieldIndex === -1) {
      throw new Error('Field not found');
    }

    customFieldsData.splice(fieldIndex, 1);
    return { success: true };
  },

  // Utility methods
  async getByEntity(entity) {
    await delay(300);
    return customFieldsData.filter(field => field.entity === entity);
  },

  async reorder(fieldIds) {
    await delay(300);
    
    fieldIds.forEach((id, index) => {
      const fieldIndex = customFieldsData.findIndex(field => field.Id === parseInt(id));
      if (fieldIndex !== -1) {
        customFieldsData[fieldIndex].order = index;
      }
    });

    return { success: true };
  }
};