import chefClaudeLogo from "../assets/chef-claude.png"
import type { User } from "@supabase/supabase-js";

interface HeaderProps {
    user: User | null;
    onSignOut: () => void;
}

export default function Header(props: HeaderProps) {
    return (
        <header>
            <div className="header-left">
                <img src={chefClaudeLogo}/>
                <h1>Chef Claude</h1>
            </div>
            {props.user && 
                <div className="header-right">
                    <button onClick={props.onSignOut}>Sign Out</button>
                </div>
            }
        </header>
    )
}
