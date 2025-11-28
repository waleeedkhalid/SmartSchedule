/**
 * Collaboration Document API
 * GET: Retrieve collaboration document state
 * POST: Update collaboration document state
 * DELETE: Delete collaboration document
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is committee member
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!userProfile || !['scheduling_committee', 'teaching_load_committee', 'registrar'].includes(userProfile.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Committee members only' },
        { status: 403 }
      );
    }
    
    const { documentId } = params;
    
    // Get document state
    const { data, error } = await supabase
      .from('collaboration_documents')
      .select('*')
      .eq('id', documentId)
      .maybeSingle();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch document' },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { 
          success: true,
          message: 'Document not found',
          data: null
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      data
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is committee member
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!userProfile || !['scheduling_committee', 'teaching_load_committee', 'registrar'].includes(userProfile.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Committee members only' },
        { status: 403 }
      );
    }
    
    const { documentId } = params;
    const body = await request.json();
    
    // Validate state is provided
    if (!body.state) {
      return NextResponse.json(
        { error: 'State is required' },
        { status: 400 }
      );
    }
    
    // Upsert document state
    const { data, error } = await supabase
      .from('collaboration_documents')
      .upsert({
        id: documentId,
        state: body.state,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save document' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Document saved successfully',
      data
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is committee member (registrar only for delete)
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!userProfile || userProfile.role !== 'registrar') {
      return NextResponse.json(
        { error: 'Forbidden: Registrar only' },
        { status: 403 }
      );
    }
    
    const { documentId } = params;
    
    // Delete document
    const { error } = await supabase
      .from('collaboration_documents')
      .delete()
      .eq('id', documentId);
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Document deleted successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


