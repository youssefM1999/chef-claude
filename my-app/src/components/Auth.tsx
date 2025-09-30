import { useState, useEffect } from "react";
import supabase from "../../utils/supabase";
import type { User } from "@supabase/supabase-js";
import { postProfileToDatabase, type Profile } from "../../utils/profile";

interface AuthProps {
    user: User | null;
    onAuthChange: (user: User | null) => void;
    onSignOut: () => void;
}

export default function Auth({ user, onAuthChange, onSignOut }: AuthProps) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState("");


    const checkAndCreateProfile = async (user: User) => {
        try {
            // Check if we've already attempted to create a profile for this user
            const profileKey = `profile_created_${user.id}`;
            if (localStorage.getItem(profileKey)) {
                return;
            }
            
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                return;
            }

            // Try to create profile - backend will handle duplicates
            // Use the name from user metadata (set during signup), otherwise generate from email
            const finalName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
            
            const profile: Profile = {
                id: user.id,
                name: finalName,
                email: user.email || '',
            };
            
            try {
                await postProfileToDatabase(profile);
                localStorage.setItem(profileKey, 'true');
            } catch (profileError: any) {
                if (profileError.message?.includes('already exists') || 
                    profileError.message?.includes('Email already exists') ||
                    profileError.message?.includes('Profile already exists')) {
                    localStorage.setItem(profileKey, 'true');
                } else if (profileError.message?.includes('User not authenticated') ||
                           profileError.message?.includes('Invalid token')) {
                    onSignOut();
                } else {
                    console.error('Error creating profile:', profileError);
                }
            }
        } catch (error) {
            console.error('Error in checkAndCreateProfile:', error);
        }
    };

    useEffect(() => {

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            onAuthChange(session?.user || null);
            
            // When user signs in, check and create profile if needed
            if (session?.user && _event === 'SIGNED_IN') {
                await checkAndCreateProfile(session.user);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [onAuthChange]);

    const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name
                        }
                    }
                });

                if (error) throw error;
                
                // Note: Profile will be saved after email confirmation when user signs in
                console.log('Signup successful. User needs to confirm email before profile can be saved.');
                
                setError("Check your email for a confirmation link!");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                
                console.log('User signed in, profile will be checked in auth state change callback');
            }

        } catch (error: any) {
            console.error(error);
            setError(error.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (user) {
        return (
            <div className="auth-container">
                <div className="user-welcome">
                    <h1>Welcome back!</h1>
                    <p>{user.email}</p>
                </div>
                <button className="sign-out-btn" onClick={onSignOut}>
                    Sign Out
                </button>
            </div>
        )
    }

    return (
        <div className="auth-container">
            <h1>{isSignUp ? "Create Account" : "Welcome Back"}</h1>
            <form onSubmit={handleAuth}>
                {isSignUp && (
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name || ""}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                )}
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                <button type="submit" disabled={loading}>
                    {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
                </button>
                <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                </button>
            </form>
        </div>
    );
}