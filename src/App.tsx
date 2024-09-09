import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Convo from "./pages/Convo";
import Profile from "./pages/Profile";
import CreateGroupChat from "./components/CreateGroupChat";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthProvider";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { OnlineUsersProvider } from "./contexts/OnlineUsersContext";

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <OnlineUsersProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/conversation/:conversationId"
                element={
                  <ProtectedRoute>
                    <Convo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/group-chat"
                element={
                  <ProtectedRoute>
                    <CreateGroupChat/>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </OnlineUsersProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;
