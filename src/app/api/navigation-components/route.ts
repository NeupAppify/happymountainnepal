import { NextRequest, NextResponse } from 'next/server';
import { readBaseFile, writeBaseFile } from '@/lib/base';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Validate the data structure
        if (!data.header || !data.footer) {
            return NextResponse.json(
                { error: 'Invalid data structure' },
                { status: 400 }
            );
        }

        // Write to navigation-components.json in @base storage
        await writeBaseFile('navigation-components.json', data);

        return NextResponse.json({
            success: true,
            message: 'Navigation data saved successfully'
        });
    } catch (error) {
        console.error('Error saving navigation data:', error);
        return NextResponse.json(
            { error: 'Failed to save navigation data' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const data = await readBaseFile('navigation-components.json');
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading navigation data:', error);
        return NextResponse.json(
            { error: 'Failed to read navigation data' },
            { status: 500 }
        );
    }
}
