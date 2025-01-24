import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home';
import UserJoinPage from './pages/user-join';
import {ThemeProvider} from "@mui/material";
import {appTheme} from "./themes/theme";
import NavBar from "./components/NavBar/NavBar";

const App = () => {
   return (
       <ThemeProvider theme={appTheme}>
     <BrowserRouter>
        <NavBar />
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/user/join" element={<UserJoinPage />} />
        </Routes>
     </BrowserRouter>
       </ThemeProvider>
   );
};

export default App;
