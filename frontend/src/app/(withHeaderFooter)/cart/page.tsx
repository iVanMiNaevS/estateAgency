"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppRouter } from "@/AppRouter";
import styles from "./cart.module.scss";

type CartItem = {
	id: number;
	userEmail: string;
	quantity: number;
	estate: {
		id: number;
		title: string;
		price: number;
		slug: string;
	};
};

const Page = () => {
	const [items, setItems] = useState<CartItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [unauthorized, setUnauthorized] = useState(false);

	const fetchCart = useCallback(async () => {
		const jwt = localStorage.getItem("jwt");
		if (!jwt) {
			setUnauthorized(true);
			setLoading(false);
			return;
		}

		const res = await fetch("/api/cart", {
			headers: { Authorization: `Bearer ${jwt}` },
		});

		if (res.status === 401) {
			setUnauthorized(true);
			setLoading(false);
			return;
		}

		const data = await res.json();
		setItems(data.data || []);
		setLoading(false);
	}, []);

	useEffect(() => {
		fetchCart();
	}, [fetchCart]);

	const handleRemove = async (estateId: number) => {
		const jwt = localStorage.getItem("jwt");
		if (!jwt) return;

		const res = await fetch("/api/cart", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${jwt}`,
			},
			body: JSON.stringify({ estateId }),
		});

		if (res.ok) {
			setItems((prev) => prev.filter((item) => item.estate?.id !== estateId));
		}
	};

	if (loading) {
		return (
			<div className={`container ${styles.cont}`}>
				<p className={styles.empty}>Загрузка...</p>
			</div>
		);
	}

	if (unauthorized) {
		return (
			<div className={`container ${styles.cont}`}>
				<h2 className="h2">Корзина услуг</h2>
				<p className={styles.empty}>
					<Link href={AppRouter.login} className={styles.link}>Войдите</Link>, чтобы просмотреть корзину
				</p>
			</div>
		);
	}

	return (
		<div className={`container ${styles.cont}`}>
			<h2 className="h2">Корзина услуг</h2>
			{items.length === 0 ? (
				<p className={styles.empty}>Корзина пуста</p>
			) : (
				<div className={styles.list}>
					{items.map((item) => (
						<div key={item.id} className={styles.card}>
							<div className={styles.info}>
								<h4 className="h4">{item.estate?.title || "Услуга"}</h4>
								<span className={styles.price}>₽{item.estate?.price}</span>
							</div>
							<button
								className="btn btn-purple"
								onClick={() => handleRemove(item.estate?.id)}
							>
								Удалить
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Page;
