import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import DealCard from "@/components/molecules/DealCard";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";

const PipelineBoard = ({ onEditDeal, onDeleteDeal }) => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const stages = [
    { name: "Lead", color: "from-blue-500 to-blue-600", bgColor: "stage-lead" },
    { name: "Qualified", color: "from-yellow-500 to-yellow-600", bgColor: "stage-qualified" },
    { name: "Proposal", color: "from-cyan-500 to-cyan-600", bgColor: "stage-proposal" },
    { name: "Negotiation", color: "from-pink-500 to-pink-600", bgColor: "stage-negotiation" },
    { name: "Closed", color: "from-green-500 to-green-600", bgColor: "stage-closed" }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load pipeline data");
    } finally {
      setLoading(false);
    }
  };

  const getContactById = (contactId) => {
    return contacts.find(contact => contact.Id === contactId);
  };

  const getDealsByStage = (stage) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const getStageValue = (stage) => {
    const stageDeals = getDealsByStage(stage);
    return stageDeals.reduce((total, deal) => total + deal.value, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDragStart = (e, deal) => {
    e.dataTransfer.setData("application/json", JSON.stringify(deal));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    
    try {
      const dealData = JSON.parse(e.dataTransfer.getData("application/json"));
      
      if (dealData.stage === newStage) {
        return;
      }
      
      const updatedDeal = {
        ...dealData,
        stage: newStage
      };
      
      await dealService.update(dealData.Id, updatedDeal);
      
      setDeals(prev => prev.map(deal => 
        deal.Id === dealData.Id ? { ...deal, stage: newStage } : deal
      ));
      
      toast.success(`Deal moved to ${newStage}`);
    } catch (error) {
      toast.error("Failed to update deal stage");
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {stages.map((stage, index) => (
          <div key={index} className="bg-surface-50 rounded-lg p-4">
            <div className="shimmer h-6 w-full rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="bg-white rounded-lg p-3">
                  <div className="shimmer h-4 w-2/3 rounded mb-2"></div>
                  <div className="shimmer h-3 w-1/3 rounded mb-2"></div>
                  <div className="shimmer h-4 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mb-4 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <ApperIcon name="AlertCircle" className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-surface-900 mb-2">Error Loading Pipeline</h3>
        <p className="text-surface-600 mb-4">{error}</p>
        <Button onClick={loadData}>
          <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {stages.map((stage) => {
        const stageDeals = getDealsByStage(stage.name);
        const stageValue = getStageValue(stage.name);
        
        return (
          <motion.div
            key={stage.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stages.indexOf(stage) * 0.1 }}
            className={`${stage.bgColor} rounded-lg p-4`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.name)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-surface-900">{stage.name}</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${stage.color} text-white`}>
                {stageDeals.length}
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-surface-600">Total Value</p>
              <p className="text-lg font-bold gradient-text">
                {formatCurrency(stageValue)}
              </p>
            </div>
            
            <div className="space-y-3 min-h-[400px]">
              {stageDeals.map((deal) => (
                <div
                  key={deal.Id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal)}
                  className="cursor-move"
                >
                  <DealCard
                    deal={deal}
                    contact={getContactById(deal.contactId)}
                    onEdit={onEditDeal}
                    onDelete={onDeleteDeal}
                  />
                </div>
              ))}
              
              {stageDeals.length === 0 && (
                <div className="text-center py-8 text-surface-500">
                  <ApperIcon name="Target" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No deals in this stage</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PipelineBoard;