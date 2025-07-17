import { motion } from "framer-motion";

const Loading = ({ type = "dashboard" }) => {
  const SkeletonCard = ({ className = "" }) => (
    <div className={`bg-surface-50 rounded-lg p-6 ${className}`}>
      <div className="space-y-4">
        <div className="shimmer h-6 w-1/3 rounded"></div>
        <div className="shimmer h-4 w-2/3 rounded"></div>
        <div className="shimmer h-8 w-full rounded"></div>
      </div>
    </div>
  );

  const SkeletonTable = () => (
    <div className="bg-white rounded-lg shadow-card p-6">
      <div className="shimmer h-8 w-1/4 rounded mb-6"></div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="shimmer h-10 w-10 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="shimmer h-4 w-1/4 rounded"></div>
              <div className="shimmer h-3 w-1/3 rounded"></div>
            </div>
            <div className="shimmer h-4 w-20 rounded"></div>
            <div className="shimmer h-4 w-16 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const SkeletonPipeline = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-surface-50 rounded-lg p-4">
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

  const renderLoadingContent = () => {
    switch (type) {
      case "table":
        return <SkeletonTable />;
      case "pipeline":
        return <SkeletonPipeline />;
      case "tasks":
        return (
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="shimmer h-8 w-1/4 rounded mb-6"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="shimmer h-5 w-5 rounded"></div>
                  <div className="flex-1">
                    <div className="shimmer h-4 w-2/3 rounded mb-2"></div>
                    <div className="shimmer h-3 w-1/3 rounded"></div>
                  </div>
                  <div className="shimmer h-6 w-16 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="animate-pulse"
    >
      {renderLoadingContent()}
    </motion.div>
  );
};

export default Loading;