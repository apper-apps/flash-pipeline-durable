import activitiesData from "@/services/mockData/activities.json";

let activities = [...activitiesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const activityService = {
  async getAll() {
    await delay(300);
    return [...activities];
  },

  async getById(id) {
    await delay(200);
    const activity = activities.find(a => a.Id === id);
    if (!activity) {
      throw new Error(`Activity with ID ${id} not found`);
    }
    return { ...activity };
  },

  async create(activityData) {
    await delay(400);
    const newActivity = {
      ...activityData,
      Id: Math.max(...activities.map(a => a.Id)) + 1,
      timestamp: new Date().toISOString()
    };
    activities.push(newActivity);
    return { ...newActivity };
  },

  async update(id, activityData) {
    await delay(400);
    const index = activities.findIndex(a => a.Id === id);
    if (index === -1) {
      throw new Error(`Activity with ID ${id} not found`);
    }
    const updatedActivity = {
      ...activities[index],
      ...activityData,
      Id: id
    };
    activities[index] = updatedActivity;
    return { ...updatedActivity };
  },

  async delete(id) {
    await delay(300);
    const index = activities.findIndex(a => a.Id === id);
    if (index === -1) {
      throw new Error(`Activity with ID ${id} not found`);
    }
    activities.splice(index, 1);
    return true;
  }
};