import Image from 'next/image';
import styles from './navbar.module.css';
import Link from 'next/link';

export default function Navbar() {
  return (
    <div>
      <h1>Navbar</h1>
      <nav className={styles.nav}>
        <Link href="/">
            <Image src="/youtube-logo.svg" alt="Youtube Logo" width={90} height={20} />
        </Link>
      </nav>
    </div>
  );
}