import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { taskService } from "@/services/api/taskService";
import { activityService } from "@/services/api/activityService";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";

const Reports = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dealsData, contactsData, tasksData, activitiesData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll(),
        taskService.getAll(),
        activityService.getAll()
      ]);
      
      setDeals(dealsData);
      setContacts(contactsData);
      setTasks(tasksData);
      setActivities(activitiesData);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  const getPeriodInterval = (period) => {
    const now = new Date();
    switch (period) {
      case "thisMonth":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case "last3Months":
        return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const getFilteredData = (data, dateField) => {
    const interval = getPeriodInterval(selectedPeriod);
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return isWithinInterval(itemDate, interval);
    });
  };

  const calculateSalesMetrics = () => {
    const periodDeals = getFilteredData(deals, "createdAt");
    const closedDeals = periodDeals.filter(deal => deal.stage === "Closed");
    
    const totalDeals = periodDeals.length;
    const totalValue = periodDeals.reduce((sum, deal) => sum + deal.value, 0);
    const closedValue = closedDeals.reduce((sum, deal) => sum + deal.value, 0);
    const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;
    const winRate = totalDeals > 0 ? (closedDeals.length / totalDeals) * 100 : 0;
    
    return {
      totalDeals,
      totalValue,
      closedValue,
      avgDealValue,
      winRate,
      closedDeals: closedDeals.length
    };
  };

  const calculateActivityMetrics = () => {
    const periodActivities = getFilteredData(activities, "timestamp");
    const periodTasks = getFilteredData(tasks, "createdAt");
    const completedTasks = periodTasks.filter(task => task.completed);
    
    const totalActivities = periodActivities.length;
    const totalTasks = periodTasks.length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    const activityTypes = periodActivities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalActivities,
      totalTasks,
      completedTasks: completedTasks.length,
      taskCompletionRate,
      activityTypes
    };
  };

  const getTopPerformers = () => {
    const contactDeals = {};
    const contactValues = {};
    
    deals.forEach(deal => {
      if (deal.contactId) {
        contactDeals[deal.contactId] = (contactDeals[deal.contactId] || 0) + 1;
        contactValues[deal.contactId] = (contactValues[deal.contactId] || 0) + deal.value;
      }
    });
    
    const topContacts = Object.entries(contactValues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([contactId, value]) => ({
        contact: contacts.find(c => c.Id === parseInt(contactId)),
        value,
        dealCount: contactDeals[contactId] || 0
      }));
    
    return topContacts;
  };

  const getStageDistribution = () => {
    const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed"];
    return stages.map(stage => ({
      stage,
      count: deals.filter(deal => deal.stage === stage).length,
      value: deals.filter(deal => deal.stage === stage).reduce((sum, deal) => sum + deal.value, 0)
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <Loading type="dashboard" />;
  }

  if (error) {
    return (
      <Error
        title="Failed to Load Reports"
        message={error}
        onRetry={loadReportsData}
      />
    );
  }

  const salesMetrics = calculateSalesMetrics();
  const activityMetrics = calculateActivityMetrics();
  const topPerformers = getTopPerformers();
  const stageDistribution = getStageDistribution();

  const periodOptions = [
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "last3Months", label: "Last 3 Months" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Reports & Analytics</h1>
          <p className="text-surface-600">
            Analyze your sales performance and business metrics
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          {periodOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedPeriod === option.value ? "primary" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="DollarSign" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {formatCurrency(salesMetrics.totalValue)}
          </div>
          <div className="text-sm text-surface-600">Total Pipeline Value</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="TrendingUp" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {formatCurrency(salesMetrics.closedValue)}
          </div>
          <div className="text-sm text-surface-600">Closed Deals Value</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="Target" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {salesMetrics.winRate.toFixed(1)}%
          </div>
          <div className="text-sm text-surface-600">Win Rate</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="BarChart3" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {formatCurrency(salesMetrics.avgDealValue)}
          </div>
          <div className="text-sm text-surface-600">Avg Deal Value</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Distribution */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-surface-900 mb-4">Pipeline Distribution</h2>
          <div className="space-y-4">
            {stageDistribution.map((stage, index) => {
              const percentage = deals.length > 0 ? (stage.count / deals.length) * 100 : 0;
              return (
                <div key={stage.stage} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                      index === 0 ? 'from-blue-500 to-blue-600' :
                      index === 1 ? 'from-yellow-500 to-yellow-600' :
                      index === 2 ? 'from-cyan-500 to-cyan-600' :
                      index === 3 ? 'from-pink-500 to-pink-600' :
                      'from-green-500 to-green-600'
                    }`}></div>
                    <span className="font-medium text-surface-900">{stage.stage}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-surface-900">{stage.count} deals</div>
                    <div className="text-xs text-surface-600">{formatCurrency(stage.value)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Activity Summary */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-surface-900 mb-4">Activity Summary</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text mb-1">
                {activityMetrics.totalActivities}
              </div>
              <div className="text-sm text-surface-600">Total Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text mb-1">
                {activityMetrics.taskCompletionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-surface-600">Task Completion</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-surface-900">Activity Types</h3>
            {Object.entries(activityMetrics.activityTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" size="sm">{type}</Badge>
                </div>
                <span className="text-sm font-medium text-surface-900">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-surface-900 mb-4">Top Performing Contacts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="text-left py-3 px-4 font-medium text-surface-900">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-surface-900">Company</th>
                <th className="text-right py-3 px-4 font-medium text-surface-900">Deals</th>
                <th className="text-right py-3 px-4 font-medium text-surface-900">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.map((performer, index) => (
                <tr key={index} className="border-b border-surface-100">
                  <td className="py-3 px-4">
                    <div className="font-medium text-surface-900">
                      {performer.contact?.name || "Unknown"}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-surface-600">
                    {performer.contact?.company || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="primary" size="sm">
                      {performer.dealCount}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-surface-900">
                    {formatCurrency(performer.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};

export default Reports;