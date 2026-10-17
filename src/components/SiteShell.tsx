// src/components/SiteShell.tsx
import type { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

export default function SiteShell({ children }: { children: ReactNode }) {
	return (
		<>
			<Header />
			{children}
			<Footer />
		</>
	);
}
