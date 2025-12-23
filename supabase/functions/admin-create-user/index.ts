import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  role: 'admin' | 'leader' | 'teacher';
  displayName?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to verify the calling user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with the user's token to verify they're authorized
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify the calling user is an admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user: callingUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !callingUser) {
      console.error('Failed to get calling user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if caller is the main admin
    const MAIN_ADMIN_EMAIL = 'info@impactink.de';
    if (callingUser.email !== MAIN_ADMIN_EMAIL) {
      // Also check if they have admin role
      const { data: roleData } = await userClient
        .from('user_roles')
        .select('role')
        .eq('user_id', callingUser.id)
        .single();

      if (!roleData || roleData.role !== 'admin') {
        console.error('User is not an admin:', callingUser.email);
        return new Response(
          JSON.stringify({ error: 'Only admins can create users' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Parse request body
    const { email, role, displayName }: CreateUserRequest = await req.json();

    if (!email || !role) {
      return new Response(
        JSON.stringify({ error: 'Email and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating user: ${email} with role: ${role}`);

    // Use service role client to create user with invite
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create user with invite (sends magic link email)
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${req.headers.get('origin') || 'https://vsgjjvwliynuxtqxmxdp.lovable.app'}/app`,
      data: {
        display_name: displayName || email.split('@')[0],
      }
    });

    if (inviteError) {
      console.error('Error inviting user:', inviteError);
      return new Response(
        JSON.stringify({ error: inviteError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!inviteData.user) {
      console.error('No user returned from invite');
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newUserId = inviteData.user.id;
    console.log(`User created with ID: ${newUserId}`);

    // Assign role using service role client
    const { error: roleError } = await adminClient
      .from('user_roles')
      .insert({ user_id: newUserId, role });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      // User was created but role assignment failed - try to clean up
      return new Response(
        JSON.stringify({ error: `User created but role assignment failed: ${roleError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Role ${role} assigned to user ${newUserId}`);

    // Create profile entry
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        user_id: newUserId,
        email: email,
        display_name: displayName || email.split('@')[0],
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Non-fatal - profile might be created by trigger
    } else {
      console.log(`Profile created for user ${newUserId}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUserId,
        message: `Einladung an ${email} gesendet`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
