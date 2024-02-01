import Image from "next/image";
import { useEffect } from 'react';


export default function Home() {
  useEffect(() => {
    // Redirect to an external URL
    window.location.href = 'https://banny.eth.limo';
  }, []);

   return null; 
}
