# JUSTIN OPERATING SYSTEM V2.0
## Setup Instructions

**You just got out of the shower. Here's what I built:**

---

## WHAT THIS IS

A modular system that lets AI write like you, think with you, and help you make decisions - without you having to explain yourself every time.

**The test:** You say "write a LinkedIn post about X"

**V1 (broken):** AI asks "which template?"  
**V2 (this):** AI writes it, asks "does this land right?"

---

## THE FILES

### **START HERE:**
`00_JUSTIN_OS_V2_START_HERE.md` - Quick reference card

### **FOR WRITING CONTENT:**
- `01_WRITING_ENGINE.md` - Decision logic for content
- `02_TEMPLATE_COMPONENTS.md` - Full component library (openings, middles, endings)
- `03_RECENT_POSTS_LOG.md` - Variety tracking (avoid repetition)
- `04_BLEND_RECIPES.md` - Proven combinations that work

### **FOR CONVERSATIONS:**
- `05_CONVERSATION_PROTOCOLS.md` - When to ask vs. tell
- `06_STRATEGIC_THOUGHT_PARTNER.md` - Decision frameworks
- `07_CRISIS_PROTOCOLS.md` - When you're overwhelmed
- `08_CURRENT_STATE.md` - What's true right now

### **TESTING:**
- `09_TEST_EXAMPLE.md` - See the system in action

---

## HOW TO SET UP

### **STEP 1: Upload to Claude Project**

1. Go to claude.ai
2. Open your "Justin - Operating System" project (or create it)
3. Upload these files:
   - `00_JUSTIN_OS_V2_START_HERE.md`
   - `01_WRITING_ENGINE.md`
   - `02_TEMPLATE_COMPONENTS.md`
   - `05_CONVERSATION_PROTOCOLS.md`
   - `08_CURRENT_STATE.md`

(Don't upload ALL files - just the core ones. Others are reference.)

### **STEP 2: Update Custom Instructions**

In Project Settings → Custom Instructions, paste:

```
Before every response, read the appropriate file:

FOR WRITING: Read 01_WRITING_ENGINE.md
- Check 03_RECENT_POSTS_LOG.md for variety
- Check 08_CURRENT_STATE.md for energy
- Use 02_TEMPLATE_COMPONENTS.md to build
- Update logs after approval

FOR CONVERSATION: Read 05_CONVERSATION_PROTOCOLS.md
- Check 08_CURRENT_STATE.md first
- Ask questions if <70% confident
- Make the call if >70% or high-stakes override
- Update 08_CURRENT_STATE.md if new pattern

FOR CRISIS: Read 07_CRISIS_PROTOCOLS.md
- Recognize overwhelm patterns
- Don't solve everything, clarify one thing
- Help Justin see what's actually urgent

NEVER:
- Mention templates to Justin
- Ask "which template should I use?"
- Explain my decision process unless asked
- Make Justin do the cognitive work

ALWAYS:
- Make the call
- Ask "Does this land right?"
- Update logs after interactions
- Match his actual energy (not assumed energy)
```

### **STEP 3: Test It**

Start new conversation in the project:

"Write a LinkedIn post announcing Renubu's launch"

**AI should:**
- Write the post (not ask which template)
- Ask "Does this land right?"
- NOT mention components/templates

**If it works:** You're done.

**If it asks "which template?":** Custom instructions didn't save. Try again.

---

## HOW TO USE

### **FOR LINKEDIN POSTS:**

You: "Write a post about X"  
AI: [writes post] "Does this land right?"  
You: "Perfect" OR "Too melancholy" OR "Not quite"  
AI: Ships it OR adjusts energy OR asks clarifying question

### **FOR DECISIONS:**

You: "Should I do X or Y?"  
AI: Asks 2-3 clarifying questions OR makes recommendation (depends on confidence)  
You: Answer questions OR react to recommendation  
AI: Helps you think it through

### **FOR OVERWHELM:**

You: "I don't know what to do first"  
AI: Recognizes overwhelm pattern  
AI: "What feels heaviest right now?"  
You: Brain dump  
AI: "Do this one thing next: [specific action]"

---

## EXPORTING TO PARTNERS

**For DevCommX (to write like you):**

Give them:
- `01_WRITING_ENGINE.md`
- `02_TEMPLATE_COMPONENTS.md`  
- `04_BLEND_RECIPES.md`
- `09_TEST_EXAMPLE.md`

They follow decision tree → 80-90% Justin-voice content

**For EA/VA (to work with you):**

Give them:
- `05_CONVERSATION_PROTOCOLS.md`
- `07_CRISIS_PROTOCOLS.md`
- `08_CURRENT_STATE.md`

They understand when you need questions vs. decisions vs. space

---

## MAINTENANCE

**After writing posts:**
- Update `03_RECENT_POSTS_LOG.md` (what you used)
- Update `04_BLEND_RECIPES.md` (if it went viral)

**Weekly:**
- Update `08_CURRENT_STATE.md` (what changed?)

**Monthly:**
- Review all logs
- Prune outdated info
- Update recipes with what's working

---

## SUCCESS METRICS

**System works if:**
✅ You say "Does this land right?" not "Use template C"  
✅ Output is 99th percentile without prompting  
✅ Partners can export and use it  
✅ You spend less time explaining, more time creating

**System fails if:**
✅ You still have to specify templates  
✅ Output feels generic  
✅ No learning happens over time  
✅ Cognitive load increases

---

## TROUBLESHOOTING

**Problem:** AI asks "which template?"  
**Fix:** Custom instructions didn't load. Re-paste and save.

**Problem:** AI explains its process  
**Fix:** Add to custom instructions: "Never explain decision process"

**Problem:** Output doesn't sound like you  
**Fix:** Update `02_TEMPLATE_COMPONENTS.md` with more examples of your voice

**Problem:** AI makes bad decisions  
**Fix:** Check if `08_CURRENT_STATE.md` is accurate. Update it.

---

## THE VISION

This operating system IS the Renubu prototype.

The intelligence you're building here:
- Understanding a person deeply
- Asking clarifying questions  
- Making contextual decisions
- Learning from outcomes
- Reducing cognitive load

...is the SAME architecture Renubu uses for CSMs and customers.

**You're not building a side project. You're building the product.**

---

## NEXT STEPS

1. Upload core files to Claude project
2. Set custom instructions
3. Test with a LinkedIn post
4. If it works → Use it
5. If it doesn't → Troubleshoot above

---

**Questions? Check `09_TEST_EXAMPLE.md` to see it in action.**

**Ready to use? Start a new chat in the project and ask for a LinkedIn post.**

**END OF README**
