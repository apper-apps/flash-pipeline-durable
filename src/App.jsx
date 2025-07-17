import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import Dashboard from "@/components/pages/Dashboard";
import Contacts from "@/components/pages/Contacts";
import Deals from "@/components/pages/Deals";
import Tasks from "@/components/pages/Tasks";
import EmailClientPage from "@/components/pages/EmailClient";
import Reports from "@/components/pages/Reports";
import CustomFieldConfiguration from "@/components/pages/CustomFieldConfiguration";

function App() {
  return (
    <div className="min-h-screen bg-white">
<Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
<Route path="contacts" element={<Contacts />} />
          <Route path="deals" element={<Deals />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="emails" element={<EmailClientPage />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<CustomFieldConfiguration />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}

export default App;