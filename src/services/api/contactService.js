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
  },

  async getContactsWithScoring() {
    await delay(350);
    return contacts.map(contact => ({ ...contact }));
  },

  async updateContactScore(id, score, temperature) {
    await delay(200);
    const index = contacts.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error(`Contact with ID ${id} not found`);
    }
    
    const updatedContact = {
      ...contacts[index],
      leadScore: score,
      temperature: temperature,
      lastScoreUpdate: new Date().toISOString()
    };
    
    contacts[index] = updatedContact;
    return { ...updatedContact };
  },

  async getContactsByTemperature(temperature) {
    await delay(300);
    return contacts.filter(c => c.temperature === temperature).map(contact => ({ ...contact }));
  },

  async getHighPriorityContacts(minScore = 70) {
    await delay(250);
    return contacts.filter(c => (c.leadScore || 0) >= minScore).map(contact => ({ ...contact }));
  }
};