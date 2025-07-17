import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Modal from "@/components/molecules/Modal";
import ApperIcon from "@/components/ApperIcon";
import { emailService } from "@/services/api/emailService";
import { contactService } from "@/services/api/contactService";
import { format } from "date-fns";

const EmailClient = ({ isOpen, onClose, contact = null }) => {
  const [activeTab, setActiveTab] = useState("compose");
  const [emails, setEmails] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [composeForm, setComposeForm] = useState({
    to: "",
    subject: "",
    body: "",
    attachments: []
  });
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadContacts();
      if (contact) {
        setComposeForm(prev => ({ ...prev, to: contact.email }));
        loadContactEmails(contact.Id);
      } else {
        loadAllEmails();
      }
    }
  }, [isOpen, contact]);

  const loadContacts = async () => {
    try {
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (error) {
      toast.error("Failed to load contacts");
    }
  };

  const loadContactEmails = async (contactId) => {
    try {
      setLoading(true);
      const emailsData = await emailService.getByContactId(contactId);
      setEmails(emailsData);
    } catch (error) {
      toast.error("Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  const loadAllEmails = async () => {
    try {
      setLoading(true);
      const emailsData = await emailService.getAll();
      setEmails(emailsData);
    } catch (error) {
      toast.error("Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!composeForm.to || !composeForm.subject || !composeForm.body) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      // Find contact by email
      const recipientContact = contacts.find(c => c.email === composeForm.to);
      
      const emailData = {
        ...composeForm,
        contactId: recipientContact?.Id || null,
        contactName: recipientContact?.name || composeForm.to,
        type: "sent"
      };

      await emailService.create(emailData);
      
      // Reset form
      setComposeForm({
        to: contact?.email || "",
        subject: "",
        body: "",
        attachments: []
      });
      
      toast.success("Email sent successfully!");
      
      // Refresh email list
      if (contact) {
        loadContactEmails(contact.Id);
      } else {
        loadAllEmails();
      }
      
      setActiveTab("history");
    } catch (error) {
      toast.error("Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  const handleComposeFormChange = (field, value) => {
    setComposeForm(prev => ({ ...prev, [field]: value }));
  };

  const handleViewEmail = (email) => {
    setSelectedEmail(email);
    setActiveTab("view");
  };

  const handleLogEmail = async (emailData) => {
    try {
      await emailService.create({
        ...emailData,
        contactId: contact?.Id || null,
        type: "received"
      });
      
      toast.success("Email logged successfully!");
      
      if (contact) {
        loadContactEmails(contact.Id);
      } else {
        loadAllEmails();
      }
    } catch (error) {
      toast.error("Failed to log email");
    }
  };

  const renderComposeTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">
          To <span className="text-red-500">*</span>
        </label>
        <Input
          type="email"
          value={composeForm.to}
          onChange={(e) => handleComposeFormChange("to", e.target.value)}
          placeholder="Enter recipient email"
          disabled={!!contact}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">
          Subject <span className="text-red-500">*</span>
        </label>
        <Input
          value={composeForm.subject}
          onChange={(e) => handleComposeFormChange("subject", e.target.value)}
          placeholder="Enter email subject"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={composeForm.body}
          onChange={(e) => handleComposeFormChange("body", e.target.value)}
          placeholder="Enter your message"
          rows={6}
          className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setComposeForm({
            to: contact?.email || "",
            subject: "",
            body: "",
            attachments: []
          })}
        >
          Clear
        </Button>
        <Button
          onClick={handleSendEmail}
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? (
            <>
              <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <ApperIcon name="Send" className="w-4 h-4 mr-2" />
              Send Email
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-8">
          <ApperIcon name="Loader2" className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      ) : emails.length === 0 ? (
        <div className="text-center py-8 text-surface-500">
          <ApperIcon name="Mail" className="w-12 h-12 mx-auto mb-4 text-surface-300" />
          <p>No emails found{contact ? ` for ${contact.name}` : ""}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {emails.map((email) => (
            <motion.div
              key={email.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-surface-200 rounded-lg p-4 hover:bg-surface-50 cursor-pointer transition-colors"
              onClick={() => handleViewEmail(email)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <ApperIcon
                    name={email.type === "sent" ? "ArrowUpRight" : "ArrowDownRight"}
                    className={`w-4 h-4 ${
                      email.type === "sent" ? "text-green-600" : "text-blue-600"
                    }`}
                  />
                  <span className="font-medium text-surface-900">
                    {email.type === "sent" ? "To" : "From"}: {email.contactName}
                  </span>
                </div>
                <span className="text-sm text-surface-500">
                  {format(new Date(email.createdAt), "MMM dd, yyyy HH:mm")}
                </span>
              </div>
              <h4 className="font-medium text-surface-900 mb-1">{email.subject}</h4>
              <p className="text-sm text-surface-600 line-clamp-2">
                {email.body}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderViewTab = () => (
    <div className="space-y-4">
      {selectedEmail && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("history")}
            >
              <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
              Back to History
            </Button>
            <div className="flex items-center space-x-2">
              <ApperIcon
                name={selectedEmail.type === "sent" ? "ArrowUpRight" : "ArrowDownRight"}
                className={`w-4 h-4 ${
                  selectedEmail.type === "sent" ? "text-green-600" : "text-blue-600"
                }`}
              />
              <span className="text-sm text-surface-600">
                {selectedEmail.type === "sent" ? "Sent" : "Received"} on{" "}
                {format(new Date(selectedEmail.createdAt), "MMM dd, yyyy 'at' HH:mm")}
              </span>
            </div>
          </div>
          
          <Card className="p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-surface-700">
                  {selectedEmail.type === "sent" ? "To" : "From"}
                </label>
                <p className="text-surface-900">{selectedEmail.contactName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700">Subject</label>
                <p className="text-surface-900">{selectedEmail.subject}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700">Message</label>
                <div className="mt-2 p-3 bg-surface-50 rounded-lg whitespace-pre-wrap">
                  {selectedEmail.body}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Email Client${contact ? ` - ${contact.name}` : ""}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-surface-200">
          <button
            onClick={() => setActiveTab("compose")}
            className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "compose"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <ApperIcon name="Edit" className="w-4 h-4 mr-2 inline" />
            Compose
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "history"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-surface-500 hover:text-surface-700"
            }`}
          >
            <ApperIcon name="History" className="w-4 h-4 mr-2 inline" />
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "compose" && renderComposeTab()}
          {activeTab === "history" && renderHistoryTab()}
          {activeTab === "view" && renderViewTab()}
        </div>
      </div>
    </Modal>
  );
};

export default EmailClient;