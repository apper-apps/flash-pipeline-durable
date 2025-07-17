import tasksData from "@/services/mockData/tasks.json";

let tasks = [...tasksData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const taskService = {
  async getAll() {
    await delay(300);
    return [...tasks];
  },

  async getById(id) {
    await delay(200);
    const task = tasks.find(t => t.Id === id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }
    return { ...task };
  },

  async create(taskData) {
    await delay(400);
    const newTask = {
      ...taskData,
      Id: Math.max(...tasks.map(t => t.Id)) + 1,
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    return { ...newTask };
  },

  async update(id, taskData) {
    await delay(400);
    const index = tasks.findIndex(t => t.Id === id);
    if (index === -1) {
      throw new Error(`Task with ID ${id} not found`);
    }
    const updatedTask = {
      ...tasks[index],
      ...taskData,
      Id: id
    };
    tasks[index] = updatedTask;
    return { ...updatedTask };
  },

  async delete(id) {
    await delay(300);
    const index = tasks.findIndex(t => t.Id === id);
    if (index === -1) {
      throw new Error(`Task with ID ${id} not found`);
    }
    tasks.splice(index, 1);
    return true;
  }
};