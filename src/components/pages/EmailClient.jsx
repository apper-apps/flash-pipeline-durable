import { motion } from "framer-motion";
import EmailClient from "@/components/organisms/EmailClient";

const EmailClientPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-surface-900 mb-2">Email Client</h1>
        <p className="text-surface-600">
          Manage and send emails directly from your CRM
        </p>
      </div>
      
      <EmailClient isOpen={true} onClose={() => {}} />
    </motion.div>
  );
};

export default EmailClientPage;