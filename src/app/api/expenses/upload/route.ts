import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only images and PDFs are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size exceeds 10MB limit' },
                { status: 400 }
            );
        }

        // Create unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const filename = `${timestamp}-${randomString}-${file.name}`;
        const filepath = `expenses/${user.id}/${filename}`;

        // Upload to Supabase Storage
        const arrayBuffer = await file.arrayBuffer();
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('expense-bills')
            .upload(filepath, Buffer.from(arrayBuffer), {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 400 }
            );
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('expense-bills')
            .getPublicUrl(filepath);

        return NextResponse.json(
            {
                url: publicUrlData.publicUrl,
                path: filepath,
                filename: file.name,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('POST /api/expenses/upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { filePath } = await req.json();

        if (!filePath) {
            return NextResponse.json(
                { error: 'File path is required' },
                { status: 400 }
            );
        }

        const { error } = await supabase.storage
            .from('expense-bills')
            .remove([filePath]);

        if (error) {
            console.error('Delete error:', error);
            return NextResponse.json(
                { error: 'Failed to delete file' },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/expenses/upload error:', error);
        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        );
    }
}
