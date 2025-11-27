// Supabase Edge Function: Generate content in Justin's voice
// Combines Founder OS context with Justin's Voice API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { taskId, relationshipName, messageType } = await req.json()

    // 1. Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 2. Fetch context from Founder OS
    let context = ''

    if (taskId) {
      const { data: task } = await supabase
        .from('founder_tasks')
        .select('title, description, status')
        .eq('id', taskId)
        .single()

      context += `Task: ${task.title} (${task.status})\n`
    }

    if (relationshipName) {
      const { data: relationship } = await supabase
        .from('founder_relationships')
        .select('name, relationship, notes, sentiment')
        .ilike('name', `%${relationshipName}%`)
        .single()

      context += `To: ${relationship.name} (${relationship.relationship})\n`
      context += `Context: ${relationship.notes}\n`
      context += `Sentiment: ${relationship.sentiment}\n`
    }

    // 3. Call Justin's Voice MCP Server
    // NOTE: You'd need to expose Justin's Voice as an HTTP endpoint
    // OR run this as a local MCP client (not Edge Function)

    const justinVoiceUrl = Deno.env.get('JUSTIN_VOICE_API_URL')

    const response = await fetch(`${justinVoiceUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageType,
        context,
        recipientName: relationshipName
      })
    })

    const generatedContent = await response.json()

    return new Response(
      JSON.stringify({
        success: true,
        content: generatedContent,
        context
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
