"use client";

import { useRouter } from "next/navigation";
import { AppRouter } from "@/AppRouter";
import { useState } from "react";
import styles from "../../app/(withHeaderFooter)/catalog/[slug]/slug.module.scss";

type Props = {
	estateId: number;
};

export const AddToCartButton = ({ estateId }: Props) => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [added, setAdded] = useState(false);

	const handleClick = async () => {
		const jwt = localStorage.getItem("jwt");
		if (!jwt) {
			router.push(AppRouter.login);
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/api/cart", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${jwt}`,
				},
				body: JSON.stringify({ estateId }),
			});
			if (res.ok) {
				setAdded(true);
				setTimeout(() => setAdded(false), 3000);
			} else {
				const data = await res.json();
				if (data.message === "Already in cart") {
					setAdded(true);
					setTimeout(() => setAdded(false), 3000);
				}
			}
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	};

	return (
		<button className="btn btn-purple" onClick={handleClick} disabled={loading}>
			{loading ? "..." : added ? "В корзине ✓" : "В корзину"}
		</button>
	);
};
