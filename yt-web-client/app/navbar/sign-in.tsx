// Whenever we need interactivity in elements such as the sign-in button, we need to explicitly declare this component as a client-side component, otherwise it will be rendered on the server-side and will not work as expected.
'use client'

import { Fragment } from "react";
import { signInWithGoogle, signOut } from "../firebase/firebase"; 
import styles from "./sign-in.module.css";
import { User } from "firebase/auth";

interface SignInProps {
    user: User | null;
}

export default function SignIn({ user }: SignInProps) {
    return (
        <Fragment>
            { user ?
            (
                <button className={styles.signin} onClick={signOut}>Sign Out</button>
            ) : (
                <button className={styles.signin} onClick={signInWithGoogle}>Sign In</button>
            )
        }
        </Fragment>
    );
}