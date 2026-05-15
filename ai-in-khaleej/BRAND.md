# AI in the Khaleej Classroom: brand spec

## Where to apply it

This document covers the Substack profile. The same palette and type system already drive the landing page (`index.html`) and Issue #001 (`issue-001.md`), so applying these settings to Substack closes the brand loop.

## Visual system

### Color palette

| Role | Hex | Notes |
|---|---|---|
| Surface (cream) | `#faf8f3` | Dominant background. Warm, paper-like. |
| Ink | `#1a1f2e` | All body text and the wordmark. |
| Muted | `#5b6478` | Secondary text, taglines, metadata. |
| Gold accent | `#b08d3c` | Subscribe buttons, rules, founding-rate emphasis. Use sparingly. |
| Gold dark | `#8b6e2c` | Hover state for gold; section eyebrows. |
| Border | `#e6e1d4` | Hairline dividers, card edges. |

In Substack settings, set the publication's brand color to **`#b08d3c`**. This propagates to the Subscribe button, link hovers, and the email send-from styling.

### Typography

- **Wordmark and headlines**: Fraunces, serif. Weight 500 or 600. Letter-spacing slightly tightened (`-0.01em`).
- **English body**: Inter, sans. Weight 400 body, 500 emphasis.
- **Arabic**: IBM Plex Sans Arabic. Weight 400 body, 700 emphasis.
- **Fallback stack**: Georgia / system-ui (Substack's email rendering does not load Google Fonts in all clients; the fallback should look acceptable).

## Logo and assets

### Avatar (`avatar.svg`)

A serif "K." monogram. Cream background, dark ink letter, thin gold border ring. The period after the K is intentional: it reads as editorial confidence, not as an abbreviation.

- Source file: `avatar.svg` (512×512 vector)
- Substack uploads: convert to PNG before upload. Quick options:
  1. Open `avatar.svg` in any browser, right-click, choose "Save image as," save as PNG.
  2. Or use [cloudconvert.com/svg-to-png](https://cloudconvert.com/svg-to-png), [svgtopng.com](https://svgtopng.com), or any free converter. No account required.
  3. Or open in Figma / Sketch / Inkscape and export to PNG.

Recommended export: 512×512 px, white or transparent background.

### Cover banner (`cover.svg`)

Wordmark-led. Cream background, serif title, thin gold horizontal rule, Arabic subtitle in IBM Plex Sans Arabic, English subtitle line below. No imagery — restraint signals seriousness to a faculty audience.

- Source file: `cover.svg` (1546×423 vector, Substack's recommended banner size)
- Convert to PNG using the same methods above. Recommended export: 1546×423 PNG.

### Where to upload in Substack

- **Settings → Publication details → Logo**: upload the avatar PNG.
- **Settings → Publication details → Cover image**: upload the cover PNG.
- **Settings → Publication details → Color**: paste `#b08d3c`.
- **Settings → Publication details → About**: paste the bio copy below.

## Copy elements

### Publication name
**AI in the Khaleej Classroom**

### Short tagline (one line, shown under the name)
A weekly briefing on AI for faculty in Gulf universities.

### About / bio (English)

> AI in the Khaleej Classroom is a weekly briefing for faculty in Gulf universities on how to teach, research, and lead with AI. Each issue: one pedagogy pattern broken down with the actual prompt or assignment, one tool worth your time with honest Arabic-language caveats, and one curated video with takeaways pre-extracted. Bilingual editions (English plus Arabic key points). 8 minutes to read, Sunday morning Gulf time. Issue #001 is free; from Issue #002 onward, full editions are for paid subscribers at $48/month. The first 100 subscribers lock in $48 as their permanent founding rate.

### About / bio (Arabic)

> "الذكاء الاصطناعي في الفصل الخليجي" نشرة أسبوعية لأعضاء هيئة التدريس في جامعات الخليج حول كيفية التدريس والبحث والقيادة بالذكاء الاصطناعي. في كل عدد: نمط تعليمي مُحلَّل مع النص أو الواجب المستخدم، أداة ذكاء اصطناعي مُختبَرة مع تحفظات صريحة للعربية، وفيديو مختار مع أهم الخلاصات. إصدارات ثنائية اللغة (إنجليزي مع ملخصات عربية للنقاط الرئيسية). 8 دقائق للقراءة، صباح الأحد بتوقيت الخليج. العدد الأول مجاناً؛ من العدد الثاني، الإصدارات الكاملة للمشتركين المدفوعين بسعر 48 دولار شهرياً. أول 100 مشترك يثبّتون سعر 48 دولار كسعر مؤسسين مدى الحياة.

### Welcome email (sent automatically to new subscribers)

**Subject**: Welcome to AI in the Khaleej Classroom.

**Body**:

> Thank you for subscribing.
>
> Here is the deal in three sentences. Issue #001 will land in your inbox this Sunday morning, Gulf time. From Issue #002 onward, full editions are for paid subscribers at $48/month. If you reply to Issue #001 with the word "subscribe," I will send you the founding-rate checkout link the moment it goes live, and you will lock in $48 for life as one of the first 100 founding subscribers.
>
> If you are not sure yet, read Issue #001 first. That is the point of making it free.
>
> Mazin

(Arabic version of the welcome email can be sent as a follow-up if you choose to enable bilingual auto-responses, or simply include both languages in the same email body.)

## Tone rules (shared with all other materials)

- No em-dashes (—). Use colons, parentheses, periods, or semicolons depending on the function. This is enforced across the landing page, Issue #001, and Issue #002 onward.
- No "AI tells" phrasing: avoid "delve into," "navigate the complexities of," "in today's fast-paced world."
- Sentence case for headings.
- Bilingual integrity: when both languages appear, Arabic is not a translation afterthought. It carries the same information density and tonal register as the English.
- Signatures are just "Mazin" / "مازن." No dashes, no fancy sign-off lines.

## Custom domain (later, optional)

When you cross 100 paid subscribers and validation is clear, point a custom domain at Substack:

- Suggested: `aikhaleejclassroom.com` or `khaleejclassroom.com`.
- Cost: roughly $12-15/year via Namecheap or Cloudflare Registrar.
- Substack supports custom domains on paid publications; setup is documented at substack.com/support.
- Until then, `aikhaleejclassroom.substack.com` is the canonical URL.
