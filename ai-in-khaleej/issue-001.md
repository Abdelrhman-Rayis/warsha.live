# Issue #001: The agent moment has arrived. Here's what Gulf faculty should do this semester.

*A weekly briefing for faculty in Gulf universities on how to teach, research, and lead with AI. ~8 minutes to read.*

*Issue #001 is open access. From Issue #002 onward, full editions are for paid subscribers at $48/month. The first 100 subscribers lock in $48 as their permanent founding rate, even after the standard rate rises.*

---

## Cold open

Two weeks ago OpenAI quietly published three pieces of guidance aimed at higher education: an introduction to "Workspace Agents," a manifesto called *Hello Education, Meet Agents*, and a builder's guide. Anthropic's education team has been moving in the same direction for months. Google has launched NotebookLM Plus for institutions. Microsoft's Copilot is now bundled into the Office licenses most of our universities already pay for.

If you read all of this end-to-end (as I did so you don't have to), the message is the same: **the era of "AI as a chatbot you visit" is ending. The era of "AI as a workflow tied to your real work" has begun.**

This is not a vendor pitch. This is a structural change in what AI does. And it lands on Gulf faculty at an awkward moment: most of our institutions still have not finalized policy for the *previous* phase. Custom GPTs and AI tutors are still being debated in many curriculum committees. Now agents are arriving.

For faculty treating this as one more vendor cycle, the next two years will be turbulent. For those treating it as a structural change in how universities operate, it is the largest professional opportunity of the decade. This newsletter is built for the second group.

Three things this week.

---

## 01. A pedagogy pattern, broken down: the course-specific GPT

**What it is.** A Custom GPT (or Claude Project, or Gemini Gem; same idea) that holds your course readings, your rubric, and a persona that responds the way you would. Students get a 24/7 study partner that is tethered to *your* course rather than to the open internet.

**Why it works.** It solves three problems at once: (1) office-hour scarcity, (2) student over-reliance on generic ChatGPT for homework help that bypasses your learning objectives, and (3) the "but my professor said it differently" gap between course material and outside sources.

**Where this comes from.** Harvard's CS50 program has run [CS50.ai (the Duck)](https://cs50.ai) as an institutional AI tutor for two years. The OpenAI Forum's *Harvard's AI-Enhanced Classroom* video documents how this scaled to other Harvard courses. The University of Maryland faculty stories (also on the OpenAI Forum) show the same pattern adapted for writing and engineering classes by individual professors, not central IT.

**The five-step recipe (build it this week).**

1. **Pick one course.** Ideally one you teach again next semester so the work compounds.
2. **Decide the GPT's job.** Pick *one*: explain hard concepts on demand, give feedback on draft writing, generate practice problems, or be an exam study tutor. Don't try to do all four at once.
3. **Feed it your materials.** Upload syllabus, slides, readings (where copyright permits), and 3–5 examples of *good* student work and *bad* student work with your written feedback. The good/bad pair is what teaches the GPT your standards.
4. **Write the system prompt** (template below; paste it into Custom GPT instructions or Claude Project instructions and edit).
5. **Pilot with 5 students before you release it broadly.** Ask them to break it. Fix what breaks.

**Starter system prompt.** Copy, paste, edit the bracketed parts:

> You are a study partner for [COURSE NAME], taught by [INSTRUCTOR NAME] at [UNIVERSITY]. Your job is to help students [PICK ONE: understand difficult concepts / improve their writing / practice problem-solving / prepare for exams]. You speak in a [warm but rigorous / formal / Socratic] register.
>
> **Hard rules:**
> - Never write a complete assignment for a student. If asked, redirect them to think through the next step.
> - Always cite which course material your answer is grounded in. If the answer is not in the course material, say so explicitly.
> - When a student is wrong, do not just give the right answer. Ask them what reasoning led them there, then guide them toward the correct frame.
> - If a student asks something outside the scope of this course, suggest they raise it in office hours.
>
> **Voice:** match the teaching style in the uploaded materials. When uncertain, lean toward the questioning style modeled in the example feedback you have been trained on.
>
> **Language:** respond in the language the student writes to you in. For Arabic-language responses, use Modern Standard Arabic unless the student writes in dialect, in which case match their register.

**Honest caveats for Gulf classrooms.**

- Arabic-language pedagogy: Custom GPTs respond in Arabic, but their reasoning quality on Arabic-language sources is meaningfully behind English. If your course materials are primarily Arabic, expect to spend more time correcting subtle errors during the pilot phase.
- Academic integrity policy: this pattern works best when you tell students the GPT exists and is sanctioned. The grey-market version (where students use ChatGPT off the side of the desk) is the version that erodes integrity. A sanctioned course GPT, with logged use, actually *strengthens* your hand in integrity conversations.
- Branch campuses with strict IT policies: check whether Custom GPTs require a paid OpenAI account your students may not have. Claude Projects (free tier) and Google's Gemini Gems (bundled with Google Workspace for Education) are the workarounds.

---

## 02. A tool worth your time: NotebookLM

**What it is.** Google's research notebook tool. You upload sources (PDFs, articles, slides, your own notes) and ask questions. It answers only from those sources, with citations to the exact passage. There is also an "audio overview" feature that turns your sources into a podcast-style discussion between two synthetic voices.

**Why it earns its place.** NotebookLM is the first AI tool I have tested that is built for the *researcher's* workflow rather than the writer's. It refuses to invent. It cites. It is faster than re-reading. For literature reviews, dissertation supervision, and grant prep, the ROI is high.

**Three concrete uses I tested this month.**

1. **Literature review acceleration.** Upload 20 PDFs from your reading list, ask "What are the disagreements between these authors on [topic]?" The answer comes back grounded with passage-level citations you can click into.
2. **Lecture prep.** Upload your slides plus three good papers. Ask "What is one strong question I could ask students at the end of this lecture to expose the trickiest concept?" Useful even when the answer needs editing.
3. **Student source-evaluation exercises.** Upload one weak source and one strong source. Ask the notebook to compare their argument quality. Then have students do the same exercise unaided and compare. A genuinely good seminar activity.

**Where it falls short for Arabic-language work.** I will not soft-pedal this. As of this writing:

- **Audio overviews do not support Arabic.** English only. So the most viral feature is unavailable to Arabic-language scholarship.
- **OCR on Arabic-script PDFs is inconsistent.** Scanned books from Gulf publishers, especially older ones, are frequently mis-OCR'd before NotebookLM can index them. Run the PDFs through a dedicated Arabic OCR pass first (ABBYY FineReader, Adobe Acrobat Pro, or Tesseract with Arabic language packs) before uploading.
- **Citation accuracy is lower** on Arabic sources than English sources in my testing: about 80% vs 95%. Verify citations before quoting.

**The bottom line.** Use NotebookLM for English-language research workflows where it is excellent. For Arabic, treat it as a draft assistant that needs verification, not a finished-answer machine. If you need an Arabic-first alternative, Claude's file-upload feature handles Arabic PDFs slightly better in my testing, though without the citation-snapping precision of NotebookLM.

---

## 03. A regional signal: agents are coming, but no Gulf accreditor has guidance for them yet

The most important thing happening in our region right now is not a launch. It is a silence.

OpenAI, Anthropic, and Google have all moved aggressively into "agent" territory in the last two months. An agent is fundamentally different from a chatbot: it can take actions on your behalf across systems, hold context across multiple steps, and execute multi-stage workflows. OpenAI's *Workspace Agents* document spells out concrete higher-ed use cases: course change request triage, faculty AI support intake, weekly student services trends, grant readiness, accreditation evidence collection.

Each of these touches data and decisions that are subject to ministerial, accreditation, and data-residency rules in the Gulf:

- **UAE**: PDPL (Federal Decree-Law 45 of 2021) governs personal data; the CAA (Commission for Academic Accreditation) sets standards for licensed programs; ADEK and DubaiNow have their own AI strategies referenced in official documents.
- **Saudi Arabia**: PDPL (effective September 2024 with full enforcement now in force), MoE accreditation through the ETEC, and SDAIA's national AI strategy framing things like the Saudi Charter for AI Ethics.
- **Qatar**: data-protection rules under Law No. 13 of 2016 and its updates; QNRF and Education City institutions each have their own evolving guidance.
- **Bahrain, Kuwait, Oman**: each with growing privacy frameworks and ministry-level digital strategies.

**The structural problem.** None of these frameworks were written with agents in mind. They were written for "AI" understood as a model that returns an output. An agent that *takes actions* (files a course change request, sends an email on behalf of the registrar, edits a record in your SIS) is not what those frameworks contemplated. The ambiguity is real, and the personal liability sits on the faculty member who deploys an unsanctioned agent inside an institutional system, not on the vendor that built it.

**What this means for you this semester.**

- **If you are a faculty member**: do not deploy an agent that takes actions in institutional systems without IT and your dean's office signing off in writing. The personal liability surface is genuinely unclear.
- **If you are a department chair or program director**: this is the time to put a one-page "AI agent use" addendum in front of your university's governance committee. Don't wait for the ministry. Lead.
- **If you sit on an accreditation self-study committee**: ask now whether your standards explicitly cover AI tools that *act*, not just AI tools that *answer*. They almost certainly don't.

**Watch for, in the next 90 days.** I expect at least one Gulf ministry to issue interim agent guidance before September 2026. Saudi's SDAIA and the UAE's MoE have both been most active on AI policy generally; my bet is on one of them moving first. When that happens, this newsletter will translate it into faculty-actionable language within 48 hours.

From Issue #002 onward, that translation work (along with proprietary policy addenda, safe-harbor deployment templates, and tested rubrics that curriculum committees can adopt directly) sits behind a paid subscription. Issue #001 is the open invitation. Issue #002 is where the operational work begins.

---

## What's next, and what changes

**Issue #001 closes the open-access phase of this newsletter.** From Issue #002 onward, full editions are for paid subscribers at $48 per month. The first 100 subscribers become founding members and lock in $48 as their permanent rate. The standard rate will rise as the publication grows, but founding members keep $48 for life. The annual founding rate is $450, equivalent to ten months paid for twelve months of access.

**Issue #002 (next Sunday)** breaks down the "minus AI / plus AI / times AI" framework pioneered by Greg Niemeyer at UC Berkeley and now spreading through Gulf classrooms. You get the complete grading rubric, ready to adapt to your discipline this semester, plus a tested workflow for Arabic-language academic translation that beats Google Translate on technical terminology.

**Issue #003**: a side-by-side comparison of ChatGPT Edu, Claude for Education, and Google's Gemini for Education. Pricing, data residency, what each does well, and the exact questions to ask in a procurement conversation.

**To subscribe before Issue #002 ships**, reply to this email with the word "subscribe" and I will send you the founding-member checkout link the moment it goes live. Or wait for the public broadcast on Sunday.

**To shape what this becomes**, reply with one question you want answered in a future issue. Your questions are the editorial backbone.

Mazin

---

## ملخص العدد بالعربية (Arabic key points)

**For institutional reimbursement.** If you need departmental approval to expense the subscription, forward the following Arabic executive summary to your Department Chair, Dean, or Center for Teaching and Learning director. It frames the operational risks of ignoring AI agent policy this semester and positions the newsletter as a low-cost professional development resource. At $48 per month (roughly AED 176), the subscription falls under standard petty-cash and routine-expense thresholds at most GCC institutions, which means it typically does not require formal procurement review.

**العنوان:** لحظة الوكلاء الأذكياء (Agents) قد وصلت. ما الذي يجب على أعضاء هيئة التدريس في الخليج فعله هذا الفصل.

**الفكرة الرئيسية:** انتقلنا من "الذكاء الاصطناعي كمحادثة" إلى "الذكاء الاصطناعي كسير عمل مرتبط بمهامك الفعلية". هذا تحوّل هيكلي، لا حملة تسويقية.

**01. نمط تعليمي: GPT مخصص لمقررك الدراسي.** أنشئ مساعداً ذكياً مرتبطاً بمحتوى مقررك ومعاييرك في التقييم. خمس خطوات للتطبيق هذا الأسبوع، مع نموذج جاهز للنسخ في النص الإنجليزي أعلاه. ملاحظة مهمة: جودة الذكاء الاصطناعي بالعربية لا تزال متأخرة عن الإنجليزية، لذا يحتاج الإطلاق التجريبي إلى تدقيق إضافي.

**02. أداة تستحق وقتك: NotebookLM من Google.** ممتازة للأبحاث باللغة الإنجليزية: تحميل مصادر، أسئلة مع استشهادات دقيقة. تحفظات صريحة للعربية: الملخصات الصوتية لا تدعم العربية، ودقة الـ OCR على المصادر العربية القديمة ضعيفة، ودقة الاستشهاد أقل بحوالي 15% مقارنة بالإنجليزية. للعمل بالعربية: Claude مع رفع الملفات أفضل قليلاً.

**03. إشارة إقليمية: لا توجد حتى الآن إرشادات من أي جهة اعتماد خليجية بشأن الوكلاء الأذكياء.** الأطر التنظيمية الحالية في الإمارات والسعودية وقطر والبحرين والكويت وعُمان كُتبت قبل ظهور الوكلاء، ولا تغطي الحالة التي يتخذ فيها الذكاء الاصطناعي إجراءات نيابة عن المستخدم. التوصية: لا تنشر وكيلاً يتخذ إجراءات في أنظمة الجامعة دون موافقة خطية من تقنية المعلومات وإدارة الكلية. أتوقع صدور إرشادات أولية من إحدى الوزارات الخليجية قبل سبتمبر 2026.

**ما يتغيّر من العدد القادم:** العدد الأول هو آخر إصدار مفتوح. اعتباراً من العدد الثاني، الإصدارات الكاملة مخصّصة للمشتركين المدفوعين بسعر 48 دولار شهرياً. أول 100 مشترك يحتفظون بسعر 48 دولار مدى الحياة كمشتركين مؤسسين. السعر السنوي للمؤسسين 450 دولار.

**العدد القادم:** يحلّل إطار "بدون ذكاء اصطناعي / مع ذكاء اصطناعي / مضاعَف بالذكاء الاصطناعي" الذي طوّره غريغ نيماير من جامعة بيركلي وانتشر في الفصول الخليجية. تحصلون على نموذج التقييم الكامل، جاهز للتكييف مع تخصّصكم هذا الفصل، إضافة إلى سير عمل مُختبَر للترجمة الأكاديمية بالعربية يتفوّق على Google Translate في المصطلحات التقنية.

**للاشتراك قبل صدور العدد الثاني**، ردّوا على هذا البريد بكلمة "اشتراك" وسأرسل لكم رابط الدفع للمشتركين المؤسسين فور تفعيله.

شكراً للقراءة. ردّوا على هذا البريد بسؤال تودّون الإجابة عليه في عدد قادم. أسئلتكم تشكّل النشرة.

مازن

---

*AI in the Khaleej Classroom is a weekly briefing for faculty in Gulf universities. Issue #001 is open access. From Issue #002 onward, full editions are for paid subscribers at $48/month. The first 100 subscribers lock in $48 as their permanent founding rate, even after the standard rate rises.*
