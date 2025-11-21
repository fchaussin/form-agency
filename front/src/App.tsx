import { Layout } from "./components/Layout";
import { Routes, Route } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { FormsPage } from "./pages/FormsPage";
import { FieldTypesPage } from "./pages/FieldTypesPage";
import { SubmissionsPage } from "./pages/SubmissionsPage";
import { ConsumersPage } from "./pages/ConsumersPage";
import { UsersPage } from "./pages/UsersPage";
import { FormBuilderPage } from "./pages/FormBuilderPage"; // Import FormBuilderPage

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/forms/create" element={<FormBuilderPage />} />{" "}
        {/* Route for creating a new form */}
        <Route path="/forms/:formId/edit" element={<FormBuilderPage />} />{" "}
        {/* Route for editing a form */}
        <Route path="/field-types" element={<FieldTypesPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
        <Route path="/consumers" element={<ConsumersPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
