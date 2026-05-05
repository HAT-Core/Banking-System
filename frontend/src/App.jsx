import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './ProtectedRoutes';
import PublicRoute from './PublicRoute'

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCatalogs from './pages/admin/AdminCatalogs';
import EmployeePerformance from './pages/admin/EmployeePerformance';

import CustomerLayout from './pages/customer/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import TransactionHistory from './pages/customer/TransactionHistory';
import Transfers from './pages/customer/Transfers';
import CustomerLoans      from './pages/customer/CustomerLoans';
import CustomerBilling    from './pages/customer/CustomerBilling';
import AccountStatement from './pages/customer/AccountStatement';

import EmployeeLayout      from './pages/employee/EmployeeLayout';
import EmployeeKycQueue    from './pages/employee/EmployeeKycQueue';
import EmployeeCreateLoan  from './pages/employee/EmployeeCreateLoan';
import EmployeeDelinquent  from './pages/employee/EmployeeDelinquent';

import EmployeeBranchTeller from './pages/employee/EmployeeBranchTeller';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="catalogs" element={<AdminCatalogs />} />
          <Route path="performance" element={<EmployeePerformance />} />
        </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
        <Route element={<CustomerLayout />}>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/transfers" element={<Transfers />} />
	        <Route path="/loans" element={<CustomerLoans />} />
          <Route path="/billing" element={<CustomerBilling />} />
          <Route path="/statement" element={<AccountStatement />} />
        </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<Navigate to="kyc" replace />} />
          <Route path="kyc" element={<EmployeeKycQueue />} />
          <Route path="loans/create" element={<EmployeeCreateLoan />} />
          <Route path="teller" element={<EmployeeBranchTeller />} />
          <Route path="delinquent" element={<EmployeeDelinquent />} />
        </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
