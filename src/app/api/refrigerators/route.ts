import { type NextRequest } from "next/server";

import { getRefrigerators } from "@/service/db";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    try {
        const refrigerators = await getRefrigerators(limit ? +limit : 1);
        return Response.json(refrigerators);
    } catch {
        return Response.json(null);
    }
}