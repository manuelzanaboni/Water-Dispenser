import { type NextRequest } from "next/server";

import { getRefrigerators } from "@/service/db";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    const refrigerators = await getRefrigerators(limit ? +limit : 1);
    return Response.json(refrigerators);
}