#!/bin/bash
# Simplified Founder OS Seed - Single Line Commands
# Run after enabling RLS policies

BASE="https://dokaliwfnptcwhywjltp.supabase.co/rest/v1"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRva2FsaXdmbnB0Y3doeXdqbHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjY3NjgsImV4cCI6MjA3OTQwMjc2OH0.MOrXt4Te6LYyoFbg_32qXmlTLsuWYkXTl8SbbVQpqMk"

echo "🚀 Seeding Founder OS Database..."

# Contexts
curl -s -X POST "$BASE/founder_contexts" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"name":"Renubu","description":"B2B SaaS for CS teams - workflow automation","color":"#3B82F6","icon":"🚀"}'
curl -s -X POST "$BASE/founder_contexts" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"name":"PowerPak","description":"MCP Universe demo - Scott demo Dec 4","color":"#8B5CF6","icon":"⚡"}'
curl -s -X POST "$BASE/founder_contexts" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"name":"Good Hang","description":"Tech social club - D&D networking","color":"#10B981","icon":"🎲"}'
curl -s -X POST "$BASE/founder_contexts" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"name":"Marriage","description":"Weekly planning with Ruth","color":"#EC4899","icon":"❤️"}'
curl -s -X POST "$BASE/founder_contexts" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"name":"Health","description":"ADHD management, EMDR therapy","color":"#06B6D4","icon":"🧠"}'

echo "✅ Contexts created"

# Goals
curl -s -X POST "$BASE/founder_goals" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"title":"Land 3-5 Renubu design partners","type":"objective","timeframe":"quarterly","target_value":5,"current_value":1,"unit":"partners","start_date":"2025-10-01","end_date":"2025-12-31"}'
curl -s -X POST "$BASE/founder_goals" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"title":"Scott Leese demo preparation","type":"key_result","timeframe":"monthly","target_value":1,"current_value":0.7,"unit":"complete","start_date":"2025-11-01","end_date":"2025-12-04"}'
curl -s -X POST "$BASE/founder_goals" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"title":"50 warm outreach per day","type":"key_result","timeframe":"weekly","target_value":250,"current_value":0,"unit":"messages","start_date":"2025-11-25","end_date":"2025-11-29"}'

echo "✅ Goals created"

# Relationships
curl -s -X POST "$BASE/founder_relationships" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"name":"Scott Leese","relationship":"investor_prospect","last_contact":"2025-11-15","contact_frequency_days":14,"notes":"Dec 4 demo - CRITICAL","sentiment":"positive"}'
curl -s -X POST "$BASE/founder_relationships" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"name":"Grace (InHerSight)","relationship":"design_partner","last_contact":"2025-11-20","contact_frequency_days":7,"notes":"First Renubu partner testing 0.1.9","sentiment":"positive"}'
curl -s -X POST "$BASE/founder_relationships" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"name":"Soraya","relationship":"prospect","last_contact":"2025-11-18","contact_frequency_days":7,"notes":"Healthcare CSM with board meeting","sentiment":"neutral"}'
curl -s -X POST "$BASE/founder_relationships" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"name":"Ryan (DevCommX)","relationship":"partner","last_contact":"2025-11-22","contact_frequency_days":3,"notes":"Cold outreach - 100 opportunities","sentiment":"positive"}'
curl -s -X POST "$BASE/founder_relationships" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"name":"Ruth","relationship":"spouse","last_contact":"2025-11-22","contact_frequency_days":1,"notes":"Weekly planning sessions","sentiment":"positive"}'

echo "✅ Relationships created"

# Tasks
curl -s -X POST "$BASE/founder_tasks" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"title":"Finalize PowerPak demo for Scott","description":"Dec 4 demo - THE critical milestone","status":"in_progress","priority":"critical","context_tags":["PowerPak","Renubu"],"energy_level":"high","estimated_minutes":240,"due_date":"2025-12-04"}'
curl -s -X POST "$BASE/founder_tasks" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"title":"Test Renubu 0.1.9 from Grace perspective","description":"Validate InHerSight workflows","status":"todo","priority":"high","context_tags":["Renubu"],"energy_level":"medium","estimated_minutes":90,"due_date":"2025-11-26"}'
curl -s -X POST "$BASE/founder_tasks" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"title":"Follow up with Soraya","description":"Healthcare CSM board meeting timeline","status":"todo","priority":"high","context_tags":["Renubu"],"energy_level":"high","estimated_minutes":30,"due_date":"2025-11-25"}'
curl -s -X POST "$BASE/founder_tasks" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"title":"Weekly planning with Ruth","description":"Maintain connection and priorities","status":"todo","priority":"high","context_tags":["Marriage"],"energy_level":"medium","estimated_minutes":45,"due_date":"2025-11-24"}'
curl -s -X POST "$BASE/founder_tasks" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"title":"50 warm outreach - Pavilion network","description":"Target VPs of Customer Success","status":"todo","priority":"medium","context_tags":["Renubu"],"energy_level":"high","estimated_minutes":120,"due_date":"2025-11-25"}'

echo "✅ Tasks created"

# Check-in
curl -s -X POST "$BASE/founder_check_ins" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"mood":"focused","energy_level":7,"gratitude":"Progress on Renubu, PowerPak demo, Ruth support","challenges":"Need revenue conversion, Scott demo pressure","wins":"Shipped 0.1.9, Personal OS complete, Good Hang ready","needs_support":false}'

echo "✅ Check-in created"

# Daily plan
curl -s -X POST "$BASE/founder_daily_plans" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"plan_date":"2025-11-25","morning_intention":"Weekly planning setup. Prepare for first revenue push.","energy_level":7,"stress_level":4}'

echo "✅ Daily plan created"
echo ""
echo "════════════════════════════════════════"
echo "✅ SEED COMPLETE"
echo "════════════════════════════════════════"
echo "Database now has:"
echo "  • 5 Contexts"
echo "  • 3 Goals"  
echo "  • 5 Relationships"
echo "  • 5 Tasks"
echo "  • 1 Check-in"
echo "  • 1 Daily Plan"
echo ""
echo "Test with: 'Check my OS'"