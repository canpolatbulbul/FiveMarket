import './App.css'
import Routes from './routes/Routes.jsx'
import { Toaster } from "@/components/ui/sonner"

export default function App() {
  return (
    <>
      <Routes />
      <Toaster richColors/>
    </>
  );
}
