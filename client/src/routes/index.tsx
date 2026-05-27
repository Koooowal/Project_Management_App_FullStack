import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProjectsPage from '../pages/ProjectsPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import NotFoundPage from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Navigate to="/projects" replace />,
          },
          {
            path: 'projects',
            element: <ProjectsPage />,
          },
          {
            path: 'projects/:id',
            element: <ProjectDetailPage />,
          },
        ],
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
