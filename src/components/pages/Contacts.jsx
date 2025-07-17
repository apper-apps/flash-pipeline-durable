import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import SearchBar from "@/components/molecules/SearchBar";
import ContactCard from "@/components/molecules/ContactCard";
import ContactForm from "@/components/organisms/ContactForm";
import EmailClient from "@/components/organisms/EmailClient";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { contactService } from "@/services/api/contactService";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showEmailClient, setShowEmailClient] = useState(false);
  const [emailContact, setEmailContact] = useState(null);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    if (!searchTerm) {
      setFilteredContacts(contacts);
      return;
    }

    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContacts(filtered);
  };

  const handleAddContact = () => {
    setSelectedContact(null);
    setShowForm(true);
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setShowForm(true);
  };

  const handleDeleteContact = async (contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      try {
        await contactService.delete(contact.Id);
        setContacts(prev => prev.filter(c => c.Id !== contact.Id));
        toast.success("Contact deleted successfully");
      } catch (error) {
        toast.error("Failed to delete contact");
      }
    }
  };

  const handleSaveContact = async (contactData) => {
    try {
      if (selectedContact) {
        const updatedContact = await contactService.update(selectedContact.Id, contactData);
        setContacts(prev => prev.map(c => c.Id === selectedContact.Id ? updatedContact : c));
      } else {
        const newContact = await contactService.create(contactData);
        setContacts(prev => [...prev, newContact]);
      }
    } catch (error) {
      throw new Error("Failed to save contact");
    }
  };

  const handleCall = (contact) => {
    toast.info(`Calling ${contact.name} at ${contact.phone}`);
  };

const handleEmail = (contact) => {
    setEmailContact(contact);
    setShowEmailClient(true);
  };

  if (loading) {
    return <Loading type="table" />;
  }

  if (error) {
    return (
      <Error
        title="Failed to Load Contacts"
        message={error}
        onRetry={loadContacts}
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
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Contacts</h1>
          <p className="text-surface-600">
            Manage your customer relationships and contact information
          </p>
        </div>
        <Button onClick={handleAddContact} className="mt-4 sm:mt-0">
          <ApperIcon name="UserPlus" className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchBar
              placeholder="Search contacts..."
              value={searchTerm}
              onSearch={setSearchTerm}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <ApperIcon name="Grid3X3" className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "primary" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <ApperIcon name="List" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mt-6">
          {filteredContacts.length === 0 ? (
            <Empty
              title="No contacts found"
              message={searchTerm ? "No contacts match your search criteria." : "Start building your contact database by adding your first contact."}
              actionLabel="Add Contact"
              onAction={handleAddContact}
              icon="Users"
            />
          ) : (
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            }`}>
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.Id}
                  contact={contact}
                  onEdit={handleEditContact}
                  onDelete={handleDeleteContact}
                  onCall={handleCall}
                  onEmail={handleEmail}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

<ContactForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSaveContact}
        contact={selectedContact}
        title={selectedContact ? "Edit Contact" : "Add Contact"}
      />

      <EmailClient
        isOpen={showEmailClient}
        onClose={() => setShowEmailClient(false)}
        contact={emailContact}
      />
    </motion.div>
  );
};

export default Contacts;