import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import NotFoundPage from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // routes will be added here in upcoming issues
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
