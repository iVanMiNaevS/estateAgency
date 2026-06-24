import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337/api";
const API_TOKEN = process.env.API_TOKEN;

async function getStrapiUserEmail(userJwt: string): Promise<string | null> {
	try {
		const res = await fetch(`${API_URL}/users/me`, {
			headers: { Authorization: `Bearer ${userJwt}` },
		});
		if (!res.ok) return null;
		const user = await res.json();
		return user.email || null;
	} catch {
		return null;
	}
}

async function getCartItemId(userEmail: string, estateId: number): Promise<number | null> {
	const res = await fetch(
		`${API_URL}/cart-items?filters[userEmail][$eq]=${userEmail}&filters[estate][id][$eq]=${estateId}`,
		{
			headers: { Authorization: `Bearer ${API_TOKEN}` },
		}
	);
	if (!res.ok) return null;
	const data = await res.json();
	return data.data?.[0]?.id || null;
}

export async function GET(req: NextRequest) {
	const auth = req.headers.get("authorization");
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const userEmail = await getStrapiUserEmail(auth.replace("Bearer ", ""));
	if (!userEmail) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

	const res = await fetch(
		`${API_URL}/cart-items?filters[userEmail][$eq]=${userEmail}&populate[estate]=*`,
		{
			headers: { Authorization: `Bearer ${API_TOKEN}` },
		}
	);
	const data = await res.json();
	return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
	const auth = req.headers.get("authorization");
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const userEmail = await getStrapiUserEmail(auth.replace("Bearer ", ""));
	if (!userEmail) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

	const { estateId } = await req.json();
	if (!estateId) return NextResponse.json({ error: "estateId required" }, { status: 400 });

	const existingId = await getCartItemId(userEmail, estateId);
	if (existingId) {
		return NextResponse.json({ message: "Already in cart" });
	}

	const res = await fetch(`${API_URL}/cart-items`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${API_TOKEN}`,
		},
		body: JSON.stringify({ data: { userEmail, estate: estateId } }),
	});

	const data = await res.json();
	if (!res.ok) {
		return NextResponse.json(
			{ error: data.error?.message || "Strapi error" },
			{ status: res.status }
		);
	}
	return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
	const auth = req.headers.get("authorization");
	if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const userEmail = await getStrapiUserEmail(auth.replace("Bearer ", ""));
	if (!userEmail) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

	const { estateId } = await req.json();
	if (!estateId) return NextResponse.json({ error: "estateId required" }, { status: 400 });

	const itemId = await getCartItemId(userEmail, estateId);
	if (!itemId) return NextResponse.json({ error: "Item not found" }, { status: 404 });

	const res = await fetch(`${API_URL}/cart-items/${itemId}`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${API_TOKEN}` },
	});

	if (!res.ok && res.status !== 204) {
		const errorData = await res.json().catch(() => ({}));
		return NextResponse.json(
			{ error: errorData.error?.message || "Strapi error" },
			{ status: res.status }
		);
	}
	return NextResponse.json({ message: "Removed" });
}
