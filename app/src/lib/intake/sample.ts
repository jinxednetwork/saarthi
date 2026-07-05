import "server-only";
import type { RawPost } from "./types";

/**
 * Sample raw posts — used ONLY when the real sources return nothing (no Reddit
 * creds / no Apify token), so the Gemini enrichment pipeline and the dashboard
 * surface are demoable before credentials land. Clearly flagged as sample in the
 * API response; real posts supersede them the moment creds are added.
 */
const minsAgo = (n: number) => new Date(Date.now() - n * 60_000).toISOString();

export function samplePosts(): RawPost[] {
  return [
    {
      id: "sample_r1",
      source: "reddit",
      author: "u/dilliwala_92",
      title: "Sewage overflowing near Kalkaji market for 4 days, nobody is doing anything",
      text: "The drain outside the main market has been overflowing since the weekend. The stench is unbearable and kids walk through it to school. MCD complaint number gave no response.",
      url: "https://www.reddit.com/r/delhi",
      createdAt: minsAgo(23),
      handle: "r/delhi",
    },
    {
      id: "sample_r2",
      source: "reddit",
      author: "u/sarai_resident",
      title: "AQI 380 in Sarai Kale Khan again, construction dust everywhere",
      text: "Third day above 350. The metro construction site isn't sprinkling water and the dust is choking. My daughter has been coughing all week.",
      url: "https://www.reddit.com/r/delhi",
      createdAt: minsAgo(51),
      handle: "r/delhi",
    },
    {
      id: "sample_r3",
      source: "reddit",
      author: "u/karolbagh_rwa",
      title: "Massive pothole on Karol Bagh main road caused two accidents this week",
      text: "After the rain the whole stretch is broken. A two-wheeler fell yesterday. This is urgent, someone will get seriously hurt.",
      url: "https://www.reddit.com/r/DelhiNCR",
      createdAt: minsAgo(88),
      handle: "r/DelhiNCR",
    },
    {
      id: "sample_x1",
      source: "twitter",
      author: "@rk_puram_voice",
      title: "No water supply in RK Puram sector 4 for 3 days",
      text: "No water supply in RK Puram sector 4 for 3 days now. DJB helpline not responding. Families buying tankers at 1500 rupees. @MPoffice please help #Delhi",
      url: "https://x.com",
      createdAt: minsAgo(35),
      handle: "@rk_puram_voice",
    },
    {
      id: "sample_x2",
      source: "twitter",
      author: "@patelnagar_daily",
      title: "Street lights out on Patel Nagar stretch, unsafe for women at night",
      text: "Half the street lights on the Patel Nagar–Rajinder Nagar road are dead. Pitch dark after 8pm, unsafe for women commuters. Been like this for weeks. #Delhi",
      url: "https://x.com",
      createdAt: minsAgo(67),
      handle: "@patelnagar_daily",
    },
    {
      id: "sample_x3",
      source: "twitter",
      author: "@green_delhi",
      title: "Loved the new sapling drive in Green Park, great initiative",
      text: "Great to see the tree plantation drive in Green Park this weekend. More of this please! #Delhi",
      url: "https://x.com",
      createdAt: minsAgo(120),
      handle: "@green_delhi",
    },
  ];
}
