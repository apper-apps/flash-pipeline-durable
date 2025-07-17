import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { leadScoringService } from "@/services/api/leadScoringService";
import { format, isThisWeek, isToday } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Contacts from "@/components/pages/Contacts";
import Deals from "@/components/pages/Deals";
import TaskItem from "@/components/molecules/TaskItem";
import MetricCard from "@/components/molecules/MetricCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import { taskService } from "@/services/api/taskService";
import { dealService } from "@/services/api/dealService";
import { activityService } from "@/services/api/activityService";
import { contactService } from "@/services/api/contactService";

const Dashboard = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [prioritizedLeads, setPrioritizedLeads] = useState([]);
  const [leadScoreDistribution, setLeadScoreDistribution] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dealsData, contactsData, tasksData, activitiesData, prioritizedLeadsData, scoreDistribution] = await Promise.all([
        dealService.getAll(),
        contactService.getAll(),
        taskService.getAll(),
        activityService.getAll(),
        leadScoringService.getTopPerformingLeads(10),
        leadScoringService.getLeadScoreDistribution()
      ]);
      
      setDeals(dealsData);
      setContacts(contactsData);
      setTasks(tasksData);
      setActivities(activitiesData);
      setPrioritizedLeads(prioritizedLeadsData);
      setLeadScoreDistribution(scoreDistribution);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getContactById = (contactId) => {
    return contacts.find(contact => contact.Id === contactId);
  };

const calculateMetrics = () => {
    const totalPipelineValue = deals.reduce((total, deal) => total + deal.value, 0);
    const closedDeals = deals.filter(deal => deal.stage === "Closed");
    const closedValue = closedDeals.reduce((total, deal) => total + deal.value, 0);
    const conversionRate = deals.length > 0 ? (closedDeals.length / deals.length) * 100 : 0;
    const avgDealValue = deals.length > 0 ? totalPipelineValue / deals.length : 0;
    
    return {
      totalPipelineValue,
      closedValue,
      conversionRate,
      avgDealValue,
      totalDeals: deals.length,
      totalContacts: contacts.length,
      activeTasks: tasks.filter(task => !task.completed).length,
      hotLeads: leadScoreDistribution.hot || 0,
      avgLeadScore: leadScoreDistribution.averageScore || 0
    };
  };

  const getUpcomingTasks = () => {
    return tasks
      .filter(task => !task.completed && task.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  };

  const getRecentActivities = () => {
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  };

  const getTodaysTasks = () => {
    return tasks.filter(task => 
      !task.completed && 
      task.dueDate && 
      isToday(new Date(task.dueDate))
    );
  };

  const getThisWeekTasks = () => {
    return tasks.filter(task => 
      !task.completed && 
      task.dueDate && 
      isThisWeek(new Date(task.dueDate))
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleTaskToggle = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await taskService.update(task.Id, updatedTask);
      setTasks(prev => prev.map(t => t.Id === task.Id ? updatedTask : t));
      toast.success(updatedTask.completed ? "Task completed!" : "Task marked as incomplete");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  if (loading) {
    return <Loading type="dashboard" />;
  }

  if (error) {
    return (
      <Error
        title="Dashboard Error"
        message={error}
        onRetry={loadDashboardData}
      />
    );
  }

  const metrics = calculateMetrics();
  const upcomingTasks = getUpcomingTasks();
const recentActivities = getRecentActivities();
  const todaysTasks = getTodaysTasks();
  const topLeads = prioritizedLeads.slice(0, 5);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Dashboard</h1>
          <p className="text-surface-600">Welcome back! Here's your CRM overview.</p>
        </div>
        <Button className="hidden md:inline-flex">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Quick Add
        </Button>
      </div>

{/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Total Pipeline Value"
          value={formatCurrency(metrics.totalPipelineValue)}
          icon="DollarSign"
          trend={12}
          trendLabel="vs last month"
          gradient="from-primary-500 to-primary-600"
        />
        <MetricCard
          title="Hot Leads"
          value={metrics.hotLeads}
          icon="Flame"
          trend={15}
          trendLabel="vs last week"
          gradient="from-red-500 to-red-600"
          temperature="hot"
        />
        <MetricCard
          title="Avg Lead Score"
          value={Math.round(metrics.avgLeadScore)}
          icon="Award"
          trend={8}
          trendLabel="vs last month"
          gradient="from-amber-500 to-amber-600"
          isScore={true}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          icon="Target"
          trend={-2}
          trendLabel="vs last month"
          gradient="from-secondary-500 to-secondary-600"
        />
        <MetricCard
          title="Active Tasks"
          value={metrics.activeTasks}
          icon="CheckSquare"
          trend={5}
          trendLabel="vs last week"
          gradient="from-yellow-500 to-yellow-600"
        />
      </div>
      {/* Pipeline Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-surface-900">Pipeline Overview</h2>
          <Button variant="outline" size="sm">
            <ApperIcon name="BarChart3" className="w-4 h-4 mr-2" />
            View Full Pipeline
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {["Lead", "Qualified", "Proposal", "Negotiation", "Closed"].map((stage) => {
            const stageDeals = deals.filter(deal => deal.stage === stage);
            const stageValue = stageDeals.reduce((total, deal) => total + deal.value, 0);
            
            return (
              <div key={stage} className="text-center">
                <div className="bg-gradient-to-r from-surface-100 to-surface-50 rounded-lg p-4 mb-2">
                  <div className="text-2xl font-bold gradient-text">
                    {stageDeals.length}
                  </div>
                  <div className="text-sm text-surface-600">{stage}</div>
                </div>
                <div className="text-xs text-surface-500">
                  {formatCurrency(stageValue)}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Leads */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-surface-900">Priority Leads</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-surface-600">{topLeads.length} leads</span>
              <Button variant="outline" size="sm">
                <ApperIcon name="Users" className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {topLeads.length > 0 ? (
              topLeads.map((lead) => (
                <div key={lead.Id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      lead.temperature === 'hot' ? 'bg-red-500' :
                      lead.temperature === 'warm' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-surface-900">{lead.name}</p>
                      <p className="text-sm text-surface-600">{lead.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-surface-900">{lead.score}</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.temperature === 'hot' ? 'bg-red-100 text-red-800' :
                        lead.temperature === 'warm' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {lead.temperature}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-surface-500">
                <ApperIcon name="Users" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No priority leads available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Today's Tasks */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-surface-900">Today's Tasks</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-surface-600">{todaysTasks.length} tasks</span>
              <Button variant="outline" size="sm">
                <ApperIcon name="Plus" className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {todaysTasks.length > 0 ? (
              todaysTasks.map((task) => (
                <TaskItem
                  key={task.Id}
                  task={task}
                  contact={getContactById(task.contactId)}
                  onToggle={handleTaskToggle}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))
            ) : (
              <div className="text-center py-8 text-surface-500">
                <ApperIcon name="Calendar" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks scheduled for today</p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-surface-900">Recent Activities</h2>
            <Button variant="outline" size="sm">
              <ApperIcon name="Activity" className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const contact = getContactById(activity.contactId);
                return (
                  <div key={activity.Id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <ApperIcon name="MessageCircle" className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-surface-900">
                        {activity.type} with {contact?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-surface-600 mt-1">
                        {activity.notes}
                      </p>
                      <p className="text-xs text-surface-500 mt-1">
                        {format(new Date(activity.timestamp), "MMM dd, h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-surface-500">
                <ApperIcon name="Activity" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activities</p>
              </div>
            )}
          </div>
        </Card>
</div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="Users" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {metrics.totalContacts}
          </div>
          <div className="text-sm text-surface-600">Total Contacts</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="Target" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {metrics.totalDeals}
          </div>
          <div className="text-sm text-surface-600">Active Deals</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="DollarSign" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {formatCurrency(metrics.avgDealValue)}
          </div>
          <div className="text-sm text-surface-600">Avg Deal Value</div>
        </Card>
      </div>
    </motion.div>
  );
};

export default Dashboard;