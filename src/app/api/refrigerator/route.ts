import { getLastRefrigerator } from '@/service/db';

export async function GET() {
    const refrigeratorState = await getLastRefrigerator();
    return Response.json(refrigeratorState);
}