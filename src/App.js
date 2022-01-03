import './App.css';
import MainLayoutPage from "./pages/MainLayoutPage";
import authService from "../src/services/auth.service"
import LoginPage from "./pages/LoginPage";

function App() {
  if(authService.getCurrentUser()===null)
  {
    return <LoginPage/>
  }
  else {
    return <MainLayoutPage></MainLayoutPage>;
  }
}

export default App;
