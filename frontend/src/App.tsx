import UserPage from "@/components/app/user-page"
import { Toaster } from "@/components/ui/sonner"
import { UserProvider } from "@/contexts/UserContext";

function App() {

  return (
  <UserProvider>  
    <UserPage />
    <Toaster />
  </UserProvider>
  )
}

export default App
