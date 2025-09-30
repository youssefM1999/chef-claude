import Header from "./components/Header"
import Main from "./components/Main"
import supabase from "../utils/supabase"
import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"

export default function App() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for existing session on app load
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    getInitialSession()
  }, [])

  const handleSignOut = async () => {
    // Set user to null immediately for responsive UI
    setUser(null)
    
    // Sign out from Supabase in the background
    supabase.auth.signOut().catch(error => {
      console.error('Supabase signOut error:', error);
    });
  }

  return (
    <>
      <Header user={user} onSignOut={handleSignOut} />
      <Main user={user} onAuthChange={setUser} onSignOut={handleSignOut} />
    </>
  )
}

