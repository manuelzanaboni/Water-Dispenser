// https://nextjs.org/docs/pages/building-your-application/routing/api-routes
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers

import { get_items } from "@/service/db";

export async function GET(request: Request) {
    return Response.json(await get_items());
}
