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

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/workspace" element={<RequireAuth><Workspace /></RequireAuth>} />
                <Route path="/room" element={<RequireAuth><MeetingRoom /></RequireAuth>} />
                <Route path="/team" element={<RequireAuth><TeamWorkspace /></RequireAuth>} />
                <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />


                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Dynamic project route */}
                <Route path="/editor/:projectId" element={<Workspace />} />

            </Routes>
        </BrowserRouter>
    );
}
