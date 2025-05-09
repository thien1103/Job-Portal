import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Home from './components/Home';
import Jobs from './components/Jobs';
import CareerHandbook from './components/CareerHandbook';
import Profile from './components/Profile';
import JobDescription from './components/JobDescription';
import Companies from './components/recruiter/Companies';
import CompanyCreate from './components/recruiter/CompanyCreate';
import CompanySetup from './components/recruiter/CompanySetup';
import RecruiterJobs from "./components/recruiter/RecruiterJobs";
import PostJob from './components/recruiter/PostJob';
import Applicants from './components/recruiter/Applicants';
import ProtectedRoute from './components/recruiter/ProtectedRoute';
import MyCV from './components/MyCV';
import ProtectedApplicantRoute from "./components/ProtectedApplicantRoute";
import LoginAdmin from "./components/admin/LoginAdmin";
import LayoutAdmin from "./components/admin/LayoutAdmin";
import ProtectedRouteAdmin from "./components/admin/ProtectedRouteAdmin";
import JobsAdmin from "./components/admin/Jobs";
import CompaniesAdmin from "./components/admin/Companies";
import ApplicantsAdmin from "./components/admin/Applicant";
import RecruitersAdmin from "./components/admin/Recruiter";
import Statistics from "./components/admin/Statistics";
import EditJob from "./components/recruiter/EditRecruiterJob";
import VisitUserPage from './components/recruiter/VisitUserPage';
import VisitCompanyPage from './components/VisitCompanyPage';

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: "/jobs",
    element: <Jobs />,
  },
  {
    path: "/job/:id",
    element: <JobDescription />,
  },
  {
    path: "/careerHandbook",
    element: <CareerHandbook />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/company/:companyId",
    element: <VisitCompanyPage />,
  },
  {
    path: "/myCV",
    element: (
      <ProtectedApplicantRoute>
        <MyCV />
      </ProtectedApplicantRoute>
    ),
  },

  // RECRUITER SECTION
  {
    path: "/recruiter/companies",
    element: <ProtectedRoute><Companies /></ProtectedRoute>,
  },
  {
    path: "/recruiter/companies/create",
    element: <ProtectedRoute><CompanyCreate /></ProtectedRoute>,
  },
  {
    path: "/recruiter/companies/:id",
    element: <ProtectedRoute><CompanySetup /></ProtectedRoute>,
  },
  {
    path: "/recruiter/jobs",
    element: <ProtectedRoute><RecruiterJobs /></ProtectedRoute>,
  },
  {
    path: "/recruiter/jobs/create",
    element: <ProtectedRoute><PostJob /></ProtectedRoute>,
  },
  {
    path: "/recruiter/jobs/:id/applicants",
    element: <ProtectedRoute><Applicants /></ProtectedRoute>,
  },
  {
    path: "/recruiter/jobs/edit/:id",
    element: <ProtectedRoute><EditJob /></ProtectedRoute>,
  },
  {
    path: "/visit-user/:userId",
    element: <ProtectedRoute><VisitUserPage /></ProtectedRoute>,
  },

  // ADMIN SECTION
  {
    path: "/admin/login",
    element: <LoginAdmin />,
  },
  {
    path: "/admin/",
    element: (
      <ProtectedRouteAdmin>
        <LayoutAdmin />
      </ProtectedRouteAdmin>
    ),
    children: [
      {
        path: "", // Default route for /admin
        element: <Statistics />, // Default to Statistics
      },
      {
        path: "users",
        children: [
          {
            path: "", // Default route for /admin/users
            element: <ApplicantsAdmin />,
          },
          {
            path: "applicants",
            element: <ApplicantsAdmin />,
          },
          {
            path: "recruiters",
            element: <RecruitersAdmin />,
          },
        ],
      },
      {
        path: "companies",
        element: <CompaniesAdmin />,
      },
      {
        path: "jobs",
        element: <JobsAdmin />,
      },
      {
        path: "statistics",
        element: <Statistics />,
      },
    ],
  },
]);

function App() {
  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
}

export default App;