import emailsData from "@/services/mockData/emails.json";

let emails = [...emailsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const emailService = {
  async getAll() {
    await delay(300);
    return [...emails].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getById(id) {
    await delay(200);
    const email = emails.find(e => e.Id === id);
    if (!email) {
      throw new Error(`Email with ID ${id} not found`);
    }
    return { ...email };
  },

  async getByContactId(contactId) {
    await delay(300);
    return [...emails]
      .filter(e => e.contactId === contactId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async create(emailData) {
    await delay(400);
    const newEmail = {
      ...emailData,
      Id: Math.max(...emails.map(e => e.Id)) + 1,
      createdAt: new Date().toISOString(),
      attachments: emailData.attachments || []
    };
    emails.push(newEmail);
    return { ...newEmail };
  },

  async update(id, emailData) {
    await delay(400);
    const index = emails.findIndex(e => e.Id === id);
    if (index === -1) {
      throw new Error(`Email with ID ${id} not found`);
    }
    const updatedEmail = {
      ...emails[index],
      ...emailData,
      Id: id
    };
    emails[index] = updatedEmail;
    return { ...updatedEmail };
  },

  async delete(id) {
    await delay(300);
    const index = emails.findIndex(e => e.Id === id);
    if (index === -1) {
      throw new Error(`Email with ID ${id} not found`);
    }
    emails.splice(index, 1);
    return true;
  }
};