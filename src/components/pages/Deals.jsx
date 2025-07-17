import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import SearchBar from "@/components/molecules/SearchBar";
import DealForm from "@/components/organisms/DealForm";
import PipelineBoard from "@/components/organisms/PipelineBoard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { dealService } from "@/services/api/dealService";

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [viewMode, setViewMode] = useState("pipeline");

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dealService.getAll();
      setDeals(data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeal = () => {
    setSelectedDeal(null);
    setShowForm(true);
  };

  const handleEditDeal = (deal) => {
    setSelectedDeal(deal);
    setShowForm(true);
  };

  const handleDeleteDeal = async (deal) => {
    if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      try {
        await dealService.delete(deal.Id);
        setDeals(prev => prev.filter(d => d.Id !== deal.Id));
        toast.success("Deal deleted successfully");
      } catch (error) {
        toast.error("Failed to delete deal");
      }
    }
  };

  const handleSaveDeal = async (dealData) => {
    try {
      if (selectedDeal) {
        const updatedDeal = await dealService.update(selectedDeal.Id, dealData);
        setDeals(prev => prev.map(d => d.Id === selectedDeal.Id ? updatedDeal : d));
      } else {
        const newDeal = await dealService.create(dealData);
        setDeals(prev => [...prev, newDeal]);
      }
    } catch (error) {
      throw new Error("Failed to save deal");
    }
  };

  const calculateTotalValue = () => {
    return deals.reduce((total, deal) => total + deal.value, 0);
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
    return <Loading type="pipeline" />;
  }

  if (error) {
    return (
      <Error
        title="Failed to Load Deals"
        message={error}
        onRetry={loadDeals}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Sales Pipeline</h1>
          <p className="text-surface-600">
            Track and manage your sales opportunities
          </p>
        </div>
        <Button onClick={handleAddDeal} className="mt-4 sm:mt-0">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="Target" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {deals.length}
          </div>
          <div className="text-sm text-surface-600">Total Deals</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="DollarSign" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {formatCurrency(calculateTotalValue())}
          </div>
          <div className="text-sm text-surface-600">Pipeline Value</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="TrendingUp" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {deals.filter(d => d.stage === "Closed").length}
          </div>
          <div className="text-sm text-surface-600">Closed Deals</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ApperIcon name="Percent" className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">
            {deals.length > 0 ? ((deals.filter(d => d.stage === "Closed").length / deals.length) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-sm text-surface-600">Win Rate</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <SearchBar
              placeholder="Search deals..."
              value={searchTerm}
              onSearch={setSearchTerm}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "pipeline" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("pipeline")}
            >
              <ApperIcon name="BarChart3" className="w-4 h-4 mr-2" />
              Pipeline
            </Button>
            <Button
              variant={viewMode === "list" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <ApperIcon name="List" className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {deals.length === 0 ? (
          <Empty
            title="No deals in pipeline"
            message="Start building your sales pipeline by adding your first deal."
            actionLabel="Add Deal"
            onAction={handleAddDeal}
            icon="Target"
          />
        ) : (
          <PipelineBoard
            onEditDeal={handleEditDeal}
            onDeleteDeal={handleDeleteDeal}
          />
        )}
      </Card>

      <DealForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSaveDeal}
        deal={selectedDeal}
        title={selectedDeal ? "Edit Deal" : "Add Deal"}
      />
    </motion.div>
  );
};

export default Deals;