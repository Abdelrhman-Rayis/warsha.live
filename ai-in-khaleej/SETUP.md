# AI in the Khaleej Classroom: launch checklist

The strategy in one paragraph: Issue #001 ships free this Sunday and announces the paywall. Replies and reservations come back during the week. If at least 3 people raise their hand to pay, you spend ~$400 to register the UK Ltd, open Wise Business, and connect Stripe to Substack. Issue #002 ships paid the following Sunday at $48/month, with founding subscribers locking in $48 for life. If fewer than 3 raise their hand, you do not spend anything and you either drop the paid plan or run Issue #002 free to widen the funnel.

This is built around the constraint that you are not registering a company until intent is validated, and that one annual founding subscriber roughly covers year-one administrative costs.

## Phase A: Issue #001 this Sunday (zero spend)

### Step 1. Create the Substack (10 minutes)

1. Go to [substack.com](https://substack.com) and sign up.
2. Publication name: **AI in the Khaleej Classroom**.
3. URL slug suggestions: `aikhaleejclassroom`, `khaleejclassroom`, or `aiclassroomkhaleej`.
4. Skip the welcome content for now.

### Step 2. Keep payments off for now (2 minutes)

1. Do not connect Stripe. You cannot from Kenya, and the paywall does not need to be active for Issue #001.
2. Leave the paid tier disabled. Free subscription is the only signup path on Substack itself this week.
3. The landing page (`index.html`) already names the $48/month price, the founding-rate lock-in, and the Issue #002 paywall date. That price discipline is what prevents the zero-price anchor.

### Step 3. Plug your Substack URL into the landing page (2 minutes)

1. Open `index.html` in any text editor.
2. Find both instances of `SUBSTACK_URL_HERE` and replace with your Substack subscribe link, e.g. `https://aikhaleejclassroom.substack.com/subscribe`.
3. Save.

### Step 4. Deploy the landing page (5 minutes, free)

* **Netlify Drop**: drag `index.html` onto [app.netlify.com/drop](https://app.netlify.com/drop). Free URL instantly. Custom domain optional later.
* **Vercel** or **Cloudflare Pages**: same drag-and-drop pattern.
* **GitHub Pages**: if you already use GitHub, push to a repo and enable Pages.

### Step 5. Publish Issue #001 on Substack

Use the draft in `issue-001.md`. Paste into Substack's editor, preserve the section structure, publish as a regular (free) post. The closing section explicitly tells readers the paywall starts Issue #002 and invites them to reply with "subscribe" to reserve a founding spot.

### Step 6. Distribute hard for 7 days

You need 200 to 500 Gulf faculty to see this page in the week between Issue #001 and Issue #002. Channels, in order of expected conversion:

* **WhatsApp**: Gulf faculty groups (departmental, alumni, professional associations) are the highest-converting channel in the region. Send the landing page link directly to 5 to 10 trusted contacts and ask them to share if useful.
* **LinkedIn**: post about the newsletter and tag Gulf university accounts. LinkedIn is huge in MENA for academic professionals.
* **Direct email**: pull a list of 30 to 50 deans, CTL directors, and AI-focused faculty at GCC universities. Send a personal note with the landing page link. 5 to 10% reply rate is realistic.
* **One LinkedIn article**: post a free version of Issue #001 as a LinkedIn article, with the landing page link in the intro and outro.

## Phase B: gap week (between Issue #001 and Issue #002)

You are measuring three signals during the seven days after Issue #001 ships:

1. **Founding-member intent**: how many people reply "subscribe" or fill out a reservation form. This is the load-bearing number.
2. **Substack free signups**: secondary signal. These are warm leads who can convert once the paywall is live.
3. **Reply quality**: who is replying. A reply from a CTL director at NYU Abu Dhabi is worth more than 10 replies from anonymous Gmail addresses.

### Decision gate at day 5

| Founding-member intents | Action |
|---|---|
| 3 or more | Register UK Ltd. Set up Stripe. Issue #002 ships paid on Sunday. |
| 1 to 2 | Judgment call. If the replies are from named Gulf faculty at credible institutions, register the UK Ltd anyway (your "one subscriber covers it" math holds). If the replies are weak or anonymous, run Issue #002 free, push distribution harder, decide at the Issue #003 gate. |
| 0 | Do not register. Run Issue #002 free. If Issue #003 also produces 0 intents from a wider audience, end the experiment. |

### If you pass the gate, the infrastructure steps (about 5 days, ~$400 total)

1. **Register a UK Private Limited Company** via [1st Formations](https://www.1stformations.co.uk) or [Hoxton Mix](https://www.hoxtonmix.com). Package including a registered London address: roughly £100 to £200. Live in 24 to 48 hours.
2. **Open a Wise Business account** for the UK Ltd. ~£50 one-time setup. Receives USD globally. 3 to 5 days for verification.
3. **Connect Stripe to Substack** in payment settings. Set monthly price to $48. Set annual founding rate to $450. Disable annual non-founding tier until you have evidence subscribers want it.
4. **Email everyone who reserved a founding spot** with the checkout link. Substack supports Stripe promo codes; create a permanent-founder code that holds the $48 price for life even when you raise standard pricing later.

## Phase C: Issue #002 (paid)

* Send Issue #002 paywalled on Substack. Free subscribers see the first ~30%, then the paywall.
* Email founding reservers the direct checkout link separately, so they do not have to dig through the paywall page.
* Track domain clusters from the first 30 paid subscribers. If 3+ subscriptions come from the same university email domain, that's a future site-license conversation (Phase D below, not now).

## What "validated" looks like at Issue #004 (week 4)

| Paid subscribers | Read |
|---|---|
| 20+ | Strong product-market fit. Continue weekly. Start tracking domain clusters for site-license outreach in 3 months. |
| 5 to 19 | Real audience, sharper hook or distribution needed. Keep running. Re-evaluate at Issue #008. |
| 1 to 4 | Tight but not zero. Cover costs by year-end with 3 retained subscribers. Run Issue #008 and decide whether to invest more time. |
| 0 | Audience does not exist at $48 at this scale. Either drop to free permanently and pivot to ads/sponsorship, or end. |

## Phase D (months 3 to 6): institutional site licenses, eventually

Once you have 30+ paid subscribers with email-domain clusters from 2 or 3 universities, you have the data to pitch the CTL or Provost's office at those institutions. The pitch: "X of your faculty are already paying $48/month out of pocket. Convert that into a site license at $3,500/year for the department or $8,500/year for the campus, and we'll fold them in." This is real revenue, but premature before you have the cluster data. Do not optimize the landing page for it yet.

## Operating principles

* **The price stays at $48** for founding subscribers, for life. If you raise standard pricing later, found rate holders are grandfathered. This is the founding promise and it must be honored.
* **The 100-subscriber founding cap is real.** When the 100th founding subscriber joins, the founding tier closes and the standard rate becomes the only public option. This creates real scarcity. Do not reopen the founding tier later because growth stalled; that breaks trust with the first 100.
* **Voice consistency**: no em-dashes anywhere (already swept across landing page and Issue #001). Same rule for Issue #002 onward.
* **Kill date**: 60 days from publishing Issue #001. If by then you have not crossed the validation thresholds above, end it cleanly rather than continuing to invest your time. The discipline of the kill date is what makes this an experiment, not a hobby.
