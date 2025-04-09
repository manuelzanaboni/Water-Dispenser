import { getRefrigerator } from '@/service/db';

export async function GET() {
    const refrigeratorState = await getRefrigerator();
    return Response.json(refrigeratorState);
}