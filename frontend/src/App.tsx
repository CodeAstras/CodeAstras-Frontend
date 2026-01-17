import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import MeetingRoom from "./pages/MeetingRoom";
import TeamWorkspace from "./pages/TeamWorkspace";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RequireAuth from "./auth/RequireAuth";
import OAuthSuccessPage from "./pages/0AuthSuccessPage";
import CodeEditor from "./components/workspace/CodeEditor";
import { Outlet } from "react-router-dom";
import { CollaborationProvider } from "./context/CollaborationContext";
import { VoiceProvider } from "./context/VoiceContext";
import { VoiceControlPanel } from "./components/workspace/VoiceControlPanel";
import MyProjects from "./pages/MyProjects";
import Rooms from "./pages/Rooms";
import Teams from "./pages/Teams";
import Friends from "./pages/Friends";
import DashboardLayout from "./components/layouts/DashboardLayout";




export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />


        {/* Authenticated Routes with Collaboration Provider */}


        <Route element={
          <RequireAuth>
            <CollaborationProvider>
              <VoiceProvider>
                <DashboardLayout />
              </VoiceProvider>
            </CollaborationProvider>
          </RequireAuth>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/workspace/:projectId" element={<Workspace />} />
          <Route path="/room" element={<MeetingRoom />} />
          <Route path="/team" element={<TeamWorkspace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/editor/:projectId" element={<Workspace />} />
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/friends" element={<Friends />} />
        </Route>

        {/* Auth (public) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* OAuth callback (public) */}
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />
      </Routes>
    </BrowserRouter>
  );
}
