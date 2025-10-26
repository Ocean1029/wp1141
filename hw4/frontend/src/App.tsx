// Main App component
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { router } from './router';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;

