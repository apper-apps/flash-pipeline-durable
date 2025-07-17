import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import TaskItem from "@/components/molecules/TaskItem";
import TaskForm from "@/components/organisms/TaskForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { taskService } from "@/services/api/taskService";
import { contactService } from "@/services/api/contactService";
import { isToday, isPast, isThisWeek, format } from "date-fns";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksData, contactsData] = await Promise.all([
        taskService.getAll(),
        contactService.getAll()
      ]);
      setTasks(tasksData);
      setContacts(contactsData);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    switch (filterStatus) {
      case "today":
        filtered = filtered.filter(task => 
          task.dueDate && isToday(new Date(task.dueDate))
        );
        break;
      case "overdue":
        filtered = filtered.filter(task => 
          task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && !task.completed
        );
        break;
      case "upcoming":
        filtered = filtered.filter(task => 
          task.dueDate && isThisWeek(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))
        );
        break;
      case "completed":
        filtered = filtered.filter(task => task.completed);
        break;
      case "active":
        filtered = filtered.filter(task => !task.completed);
        break;
    }

    // Sort by due date
    filtered.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    setFilteredTasks(filtered);
  };

  const getContactById = (contactId) => {
    return contacts.find(contact => contact.Id === contactId);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await taskService.delete(task.Id);
        setTasks(prev => prev.filter(t => t.Id !== task.Id));
        toast.success("Task deleted successfully");
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await taskService.update(task.Id, updatedTask);
      setTasks(prev => prev.map(t => t.Id === task.Id ? updatedTask : t));
      toast.success(updatedTask.completed ? "Task completed!" : "Task marked as incomplete");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (selectedTask) {
        const updatedTask = await taskService.update(selectedTask.Id, taskData);
        setTasks(prev => prev.map(t => t.Id === selectedTask.Id ? updatedTask : t));
      } else {
        const newTask = await taskService.create(taskData);
        setTasks(prev => [...prev, newTask]);
      }
    } catch (error) {
      throw new Error("Failed to save task");
    }
  };

  const getTaskStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const todayTasks = tasks.filter(t => 
      t.dueDate && isToday(new Date(t.dueDate))
    ).length;
    const overdueTasks = tasks.filter(t => 
      t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && !t.completed
    ).length;

    return { totalTasks, completedTasks, todayTasks, overdueTasks };
  };

  const filterOptions = [
    { value: "all", label: "All Tasks", icon: "List" },
    { value: "today", label: "Today", icon: "Calendar" },
    { value: "overdue", label: "Overdue", icon: "AlertTriangle" },
    { value: "upcoming", label: "Upcoming", icon: "Clock" },
    { value: "completed", label: "Completed", icon: "CheckCircle" },
    { value: "active", label: "Active", icon: "Circle" }
  ];

  if (loading) {
    return <Loading type="tasks" />;
  }

  if (error) {
    return (
      <Error
        title="Failed to Load Tasks"
        message={error}
        onRetry={loadData}
      />
    );
  }

  const stats = getTaskStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Tasks</h1>
          <p className="text-surface-600">
            Manage your tasks and activities
          </p>
        </div>
        <Button onClick={handleAddTask} className="mt-4 sm:mt-0">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="List" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {stats.totalTasks}
          </div>
          <div className="text-sm text-surface-600">Total Tasks</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="CheckCircle" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {stats.completedTasks}
          </div>
          <div className="text-sm text-surface-600">Completed</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="Calendar" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {stats.todayTasks}
          </div>
          <div className="text-sm text-surface-600">Due Today</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="AlertTriangle" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {stats.overdueTasks}
          </div>
          <div className="text-sm text-surface-600">Overdue</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <SearchBar
              placeholder="Search tasks..."
              value={searchTerm}
              onSearch={setSearchTerm}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filterStatus === option.value ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(option.value)}
              >
                <ApperIcon name={option.icon} className="w-4 h-4 mr-2" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Empty
              title="No tasks found"
              message={searchTerm || filterStatus !== "all" ? "No tasks match your current filters." : "Start organizing your work by creating your first task."}
              actionLabel="Add Task"
              onAction={handleAddTask}
              icon="CheckSquare"
            />
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.Id}
                task={task}
                contact={getContactById(task.contactId)}
                onToggle={handleToggleTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </div>
      </Card>

      <TaskForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSaveTask}
        task={selectedTask}
        title={selectedTask ? "Edit Task" : "Add Task"}
      />
    </motion.div>
  );
};

export default Tasks;