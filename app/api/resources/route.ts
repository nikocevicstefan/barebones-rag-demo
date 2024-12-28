import { createResource } from '@/lib/actions/resources';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { content, filename, path } = await req.json();
    // Add metadata to the content
    const contentWithMeta = `File: ${path}\n\n${content}`;
    const result = await createResource({ content: contentWithMeta });
    return NextResponse.json({ message: result });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
} 