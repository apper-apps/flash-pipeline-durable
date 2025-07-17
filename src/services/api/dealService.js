import dealsData from "@/services/mockData/deals.json";

let deals = [...dealsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dealService = {
  async getAll() {
    await delay(300);
    return [...deals];
  },

  async getById(id) {
    await delay(200);
    const deal = deals.find(d => d.Id === id);
    if (!deal) {
      throw new Error(`Deal with ID ${id} not found`);
    }
    return { ...deal };
  },

  async create(dealData) {
    await delay(400);
    const newDeal = {
      ...dealData,
      Id: Math.max(...deals.map(d => d.Id)) + 1,
      createdAt: new Date().toISOString()
    };
    deals.push(newDeal);
    return { ...newDeal };
  },

  async update(id, dealData) {
    await delay(400);
    const index = deals.findIndex(d => d.Id === id);
    if (index === -1) {
      throw new Error(`Deal with ID ${id} not found`);
    }
    const updatedDeal = {
      ...deals[index],
      ...dealData,
      Id: id
    };
    deals[index] = updatedDeal;
    return { ...updatedDeal };
  },

  async delete(id) {
    await delay(300);
    const index = deals.findIndex(d => d.Id === id);
    if (index === -1) {
      throw new Error(`Deal with ID ${id} not found`);
    }
    deals.splice(index, 1);
    return true;
  }
};