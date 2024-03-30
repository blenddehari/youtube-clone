'use client';

import Image from 'next/image';
import styles from './navbar.module.css';
import Link from 'next/link';
import SignIn from './sign-in';
import { onAuthStateChangedHelper } from '../firebase/firebase';
import { User } from 'firebase/auth';
import { SetStateAction, use, useEffect, useState } from 'react';
import Upload from './upload';

export default function Navbar() {
    // Init user state
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChangedHelper((user: SetStateAction<User | null>) => {
            setUser(user);
        });

        // Cleanup subscription on unmount
        return unsubscribe;
    });

  return (
    <div>
      <h1>Navbar</h1>
      <nav className={styles.nav}>
        <Link href="/">
            <Image src="/youtube-logo.svg" alt="Youtube Logo" width={90} height={20} />
        </Link>
        {
            user && <Upload />
        }
        <SignIn user={user} />
      </nav>
    </div>
  );
}