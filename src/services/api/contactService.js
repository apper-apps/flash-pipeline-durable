import contactsData from "@/services/mockData/contacts.json";

let contacts = [...contactsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const contactService = {
  async getAll() {
    await delay(300);
    return [...contacts];
  },

  async getById(id) {
    await delay(200);
    const contact = contacts.find(c => c.Id === id);
    if (!contact) {
      throw new Error(`Contact with ID ${id} not found`);
    }
    return { ...contact };
  },

  async create(contactData) {
    await delay(400);
    const newContact = {
      ...contactData,
      Id: Math.max(...contacts.map(c => c.Id)) + 1,
      lastContact: null,
      createdAt: new Date().toISOString()
    };
    contacts.push(newContact);
    return { ...newContact };
  },

  async update(id, contactData) {
    await delay(400);
    const index = contacts.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error(`Contact with ID ${id} not found`);
    }
    const updatedContact = {
      ...contacts[index],
      ...contactData,
      Id: id
    };
    contacts[index] = updatedContact;
    return { ...updatedContact };
  },

  async delete(id) {
    await delay(300);
    const index = contacts.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error(`Contact with ID ${id} not found`);
    }
    contacts.splice(index, 1);
    return true;
  }
};