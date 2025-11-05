import {IMeta} from "../types/meta.interface";

type typeEndPointScreen = "main-screen";
type typeEndPointObjects = "estates";
type typeFilters = "$eq" | "$contains";

export const getScreenInfo = async <T>(
	endPoint: typeEndPointScreen,
	queryValues?: string[] | []
): Promise<{data: T}> => {
	try {
		const objQuery: Record<string, string> = {};
		if (queryValues) {
			queryValues.forEach((value, index) => (objQuery[`populate[${index}]`] = value));
		}

		const queryParams = new URLSearchParams(objQuery);

		const res = await makeRequest(endPoint, queryParams);
		const resRow = await res.json();

		return {data: resRow.data};
	} catch (error) {
		console.error("Error fetch data for screen " + error);
		return {data: {} as T};
	}
};
export const getObjects = async <T>(
	endPoint: typeEndPointObjects,
	queryValues?: string[] | [],
	filters?: {filter: typeFilters; field: string; value: string}[],
	pagination?: {params: "page" | "pageSize"; value: number}[]
): Promise<{data: T[]; meta: IMeta}> => {
	try {
		const objQuery: Record<string, string> = {};
		if (queryValues) {
			queryValues.forEach((value, index) => (objQuery[`populate[${index}]`] = value));
		}
		if (filters) {
			filters.forEach(
				(filter) => (objQuery[`filters[${filter.field}][${filter.filter}]`] = filter.value)
			);
		}
		if (pagination) {
			pagination.forEach((paginationOne) => {
				objQuery[`pagination[${paginationOne.params}]`] = paginationOne.value.toString();
			});
		}
		const queryParams = new URLSearchParams(objQuery);

		const res = await makeRequest(endPoint, queryParams);

		const data: {data: T[]; meta: IMeta} = await res.json();

		return {data: data.data, meta: data.meta};
	} catch (error) {
		console.error("Error fetch data for screen " + error);
		return {data: [] as T[], meta: {} as IMeta};
	}
};

async function makeRequest(
	endPoint: typeEndPointObjects | typeEndPointScreen,
	queryParams: URLSearchParams,
	isPrivate: boolean = false
) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/${endPoint}?${queryParams.toString()}`,
		{
			headers: {
				Authorization: isPrivate ? `Bearer ${process.env.NEXT_PUBLIC_APITOKEN}` : "",
			},
		}
	);
	if (!res.ok) {
		throw new Error("Error fetch, " + res.status);
	}
	return res;
}
