import { useEffect, useState } from "react";
import { pingApi } from "./api";
export default function App() {
  const [msg, setMsg] = useState("…");
  useEffect(() => { pingApi().then(setMsg).catch(() => setMsg("API down")); }, []);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">FiveMarket</h1>
      <p className="mt-2">API health: <span className="font-mono">{msg}</span></p>
    </div>
  );
}
