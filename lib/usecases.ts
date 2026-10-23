import type { UseCase, UseCaseCategory } from "@/lib/types";

export const USE_CASE_CATEGORIES: { id: "featured" | UseCaseCategory; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "games", label: "Games" },
  { id: "websites", label: "Websites & apps" },
  { id: "coding", label: "Coding" },
  { id: "writing", label: "Writing" },
  { id: "learning", label: "Learning" },
  { id: "business", label: "Business & data" },
  { id: "life", label: "Life" },
];

const SAMPLE_SALES_CSV = `month,product,region,units,revenue
2026-01,Aurora Lamp,North,120,7200
2026-01,Aurora Lamp,South,95,5700
2026-01,Nimbus Speaker,North,80,9600
2026-01,Nimbus Speaker,South,60,7200
2026-02,Aurora Lamp,North,135,8100
2026-02,Aurora Lamp,South,110,6600
2026-02,Nimbus Speaker,North,92,11040
2026-02,Nimbus Speaker,South,75,9000
2026-03,Aurora Lamp,North,140,8400
2026-03,Aurora Lamp,South,70,4200
2026-03,Nimbus Speaker,North,118,14160
2026-03,Nimbus Speaker,South,96,11520
2026-04,Aurora Lamp,North,150,9000
2026-04,Aurora Lamp,South,82,4920
2026-04,Nimbus Speaker,North,131,15720
2026-04,Nimbus Speaker,South,110,13200`;

/**
 * Use case gallery (home page and /usecases). Items with a `demo` ship a
 * hand-built example in /public/examples that can be played without an API key,
 * then remixed with the agent.
 */
export const USE_CASES: UseCase[] = [
  // ---- Games -----------------------------------------------------------------
  {
    id: "neon-snake",
    title: "Neon Snake",
    description: "Classic Snake with speed-ups, golden apples, wrap-around walls and swipe controls.",
    category: "games",
    featured: true,
    emoji: "🐍",
    agentId: "game-builder",
    prompt:
      "Build a neon Snake game: the snake speeds up as it grows, golden apples are worth bonus points, walls wrap around, " +
      "and the best score is remembered. Support arrow keys, WASD and swipe gestures.",
    demo: {
      src: "/examples/games/snake.html",
      cover: "/examples/covers/snake.jpg",
      remixPrompt: "Add two power-ups to this Snake game: one that slows time for 5 seconds and one that shrinks the snake. Keep everything else working.",
    },
  },
  {
    id: "block-stacker",
    title: "Block Stacker",
    description: "A falling-blocks puzzle with a ghost piece, next preview, levels and line-clear effects.",
    category: "games",
    featured: true,
    emoji: "🧱",
    agentId: "game-builder",
    prompt:
      "Make a falling-blocks puzzle game in the style of Tetris with a ghost piece, next-piece preview, levels that speed up, " +
      "and line-clear effects. Arrow keys to play, plus on-screen buttons for phones.",
    demo: {
      src: "/examples/games/tetris.html",
      cover: "/examples/covers/tetris.jpg",
      remixPrompt: "Add a hold-piece slot and a combo counter to this game, and make line clears even more satisfying.",
    },
  },
  {
    id: "game-2048",
    title: "2048",
    description: "Slide and merge numbered tiles to reach 2048. Keyboard and swipe, with best score.",
    category: "games",
    emoji: "🔢",
    agentId: "game-builder",
    prompt:
      "Build the 2048 puzzle game with smooth tile animations, current and best score, one undo per move, and swipe support on phones.",
    demo: {
      src: "/examples/games/2048.html",
      cover: "/examples/covers/2048.jpg",
      remixPrompt: "Turn this 2048 game into a 5×5 version and add a 'Zen mode' toggle where the game never ends.",
    },
  },
  {
    id: "brick-breaker",
    title: "Brick Breaker",
    description: "Breakout with colorful bricks, particles, lives and mouse, touch or keyboard paddle control.",
    category: "games",
    featured: true,
    emoji: "🧨",
    agentId: "game-builder",
    prompt:
      "Create a Breakout game with colorful bricks, particle bursts when bricks break, 3 lives, a ball that speeds up, " +
      "and paddle control by mouse, touch or arrow keys.",
    demo: {
      src: "/examples/games/breakout.html",
      cover: "/examples/covers/breakout.jpg",
      remixPrompt: "Add power-ups to this Breakout game that drop from broken bricks: multi-ball, a wider paddle and a laser.",
    },
  },
  {
    id: "flappy",
    title: "Flappy Flyer",
    description: "One-button arcade flying through pipes, with parallax hills and a best score.",
    category: "games",
    emoji: "🐤",
    agentId: "game-builder",
    prompt:
      "Make a Flappy Bird style game with a cute bird drawn on canvas, scrolling pipes, a parallax background, score and best score. " +
      "Tap, click or press Space to flap.",
    demo: {
      src: "/examples/games/flappy.html",
      cover: "/examples/covers/flappy.jpg",
      remixPrompt: "Add a day/night cycle and collectible coins to this game, and show coins on the game-over screen.",
    },
  },
  {
    id: "memory-match",
    title: "Memory Match",
    description: "An emoji pairs game for kids with three difficulty levels, moves and a timer.",
    category: "games",
    emoji: "🃏",
    agentId: "game-builder",
    prompt:
      "Build an emoji memory matching game for kids with 3 difficulty levels, a move counter, a timer, and a celebration when all pairs are found.",
    demo: {
      src: "/examples/games/memory.html",
      cover: "/examples/covers/memory.jpg",
      remixPrompt: "Add a two-player mode to this memory game with turns, a score for each player and a winner screen.",
    },
  },
  {
    id: "space-shooter",
    title: "Space shooter",
    description: "Waves of enemies, power-ups and a boss fight, playable on phones.",
    category: "games",
    emoji: "🚀",
    agentId: "game-builder",
    prompt:
      "Create a vertical space shooter with waves of enemies, power-ups (spread shot and shield), a boss every 5 waves, " +
      "a starfield background and touch controls for phones.",
  },
  {
    id: "typing-rain",
    title: "Typing rain",
    description: "Destroy falling words by typing them, then see your WPM and accuracy.",
    category: "games",
    emoji: "⌨️",
    agentId: "game-builder",
    prompt:
      "Build a typing game where words fall from the sky and you destroy them by typing them. Speed up over time and show WPM and accuracy at the end.",
  },

  // ---- Websites & apps ---------------------------------------------------------
  {
    id: "coffee-landing",
    title: "Coffee roastery landing page",
    description: "A warm, modern landing page with beans, subscription plans and a newsletter form.",
    category: "websites",
    featured: true,
    emoji: "☕",
    agentId: "web-builder",
    prompt:
      "Build a landing page for 'Ember & Oak', a specialty coffee roastery: hero section, featured beans with tasting notes, " +
      "subscription plans, testimonials and a newsletter form. Warm, modern design.",
    demo: {
      src: "/examples/sites/coffee.html",
      cover: "/examples/covers/coffee.jpg",
      remixPrompt: "Give this landing page a dark, moody theme and add a 'Visit our cafés' section with opening hours.",
    },
  },
  {
    id: "pomodoro",
    title: "Pomodoro focus timer",
    description: "A focus timer with a progress ring, task list and daily summary.",
    category: "websites",
    featured: true,
    emoji: "🍅",
    agentId: "web-builder",
    prompt:
      "Make a Pomodoro timer app with 25/5 minute cycles, a circular progress ring, a task list where I can pick the active task, " +
      "and a summary of today's focus sessions.",
    demo: {
      src: "/examples/sites/pomodoro.html",
      cover: "/examples/covers/pomodoro.jpg",
      remixPrompt: "Add customizable durations, a long break every 4 sessions and a small weekly focus chart to this app.",
    },
  },
  {
    id: "portfolio",
    title: "Photographer portfolio",
    description: "A minimalist gallery site with a masonry grid, lightbox and contact form.",
    category: "websites",
    emoji: "📷",
    agentId: "web-builder",
    prompt: "Create a minimalist portfolio page for a photographer with a masonry gallery, a lightbox and a contact form.",
  },
  {
    id: "mortgage-calculator",
    title: "Mortgage calculator",
    description: "An interactive calculator with an amortization chart drawn in SVG.",
    category: "websites",
    emoji: "🏠",
    agentId: "web-builder",
    prompt:
      "Build a mortgage calculator with sliders for price, down payment, rate and term, a monthly payment breakdown, " +
      "and an amortization chart drawn with inline SVG.",
  },

  // ---- Coding ----------------------------------------------------------------
  {
    id: "code-review",
    title: "Find the bug",
    description: "Code Mentor reviews a function, explains the edge cases and fixes them.",
    category: "coding",
    featured: true,
    emoji: "🐞",
    agentId: "code-mentor",
    prompt:
      "Review this JavaScript function for bugs and edge cases, then show a corrected version:\n\n" +
      "```js\nfunction average(nums) {\n  let total = 0;\n  for (let i = 0; i <= nums.length; i++) total += nums[i];\n  return total / nums.length;\n}\n```",
  },
  {
    id: "system-design",
    title: "Design a URL shortener",
    description: "Architecture, data model and scaling plan for 100M links a month.",
    category: "coding",
    emoji: "🏗️",
    agentId: "software-architect",
    prompt:
      "Design a URL shortener that creates 100M new links per month with a 100:1 read/write ratio. Cover the API, ID generation, " +
      "storage, caching, analytics and how it scales.",
  },
  {
    id: "regex-explained",
    title: "Explain a regex",
    description: "Break down a tricky regular expression piece by piece, with test cases.",
    category: "coding",
    emoji: "🔍",
    agentId: "code-mentor",
    prompt: "Explain this regex piece by piece and give 5 strings it matches and 5 it rejects: ^(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,}$",
  },

  // ---- Writing ---------------------------------------------------------------
  {
    id: "launch-email",
    title: "Product launch email",
    description: "Subject lines plus a launch email for a new habit-tracking app.",
    category: "writing",
    emoji: "📣",
    agentId: "content-writer",
    prompt:
      "Write a product launch email for 'Streaks', a habit-tracking app for busy parents. Give 5 subject line options, " +
      "then the email (under 200 words) with one clear call to action.",
  },
  {
    id: "meeting-prompt",
    title: "Prompt for meeting notes",
    description: "Build a reusable prompt that turns messy notes into action items.",
    category: "writing",
    emoji: "🪄",
    agentId: "prompt-builder",
    prompt: "I want a reusable prompt that turns messy meeting notes into a summary, decisions and action items with owners.",
  },

  // ---- Learning --------------------------------------------------------------
  {
    id: "spanish-cafe",
    title: "Spanish at the café",
    description: "Practice ordering food in Spanish with gentle corrections.",
    category: "learning",
    featured: true,
    emoji: "🇪🇸",
    agentId: "language-tutor",
    prompt: "Let's practice Spanish at a beginner level. Start a role-play where I'm ordering breakfast at a café in Madrid.",
  },
  {
    id: "explain-neural-nets",
    title: "Neural networks for a 12-year-old",
    description: "An analogy plus a tiny worked example of how a network learns.",
    category: "learning",
    emoji: "🧠",
    agentId: "tonychat-assistant",
    prompt: "Explain how a neural network learns, like I'm 12, with an analogy and a tiny worked example with real numbers.",
  },

  // ---- Business & data -------------------------------------------------------
  {
    id: "sales-csv",
    title: "Analyze a sales CSV",
    description: "Find the fastest-growing product and explain a dip, from an attached CSV.",
    category: "business",
    featured: true,
    emoji: "📈",
    agentId: "data-analyst",
    prompt: "Here's our sales data for January to April. Which product is growing fastest, and what explains the dip in March? Suggest one action.",
    attachments: [{ name: "sales-2026.csv", language: "csv", content: SAMPLE_SALES_CSV }],
  },
  {
    id: "angry-customer",
    title: "Calm an angry customer",
    description: "Draft an empathetic reply with clear next steps.",
    category: "business",
    emoji: "🎧",
    agentId: "customer-support",
    prompt:
      "A customer wrote: \"My order #4821 arrived broken and nobody answers my emails. This is ridiculous.\" " +
      "Draft a reply. We can offer a replacement or a refund, and we ship replacements within 2 business days.",
  },

  // ---- Life ------------------------------------------------------------------
  {
    id: "kyoto-trip",
    title: "3 days in Kyoto",
    description: "A relaxed autumn itinerary for food, gardens and photography.",
    category: "life",
    featured: true,
    emoji: "⛩️",
    agentId: "travel-planner",
    prompt:
      "Plan 3 relaxed days in Kyoto in mid-November for two people who love food, gardens and photography. Mid-range budget, we use public transport.",
  },
  {
    id: "meal-plan",
    title: "Weeknight meal plan",
    description: "Five vegetarian dinners under 30 minutes with one grocery list.",
    category: "life",
    emoji: "🥗",
    agentId: "tonychat-assistant",
    prompt: "Make a 5-day vegetarian dinner plan for two, each under 30 minutes, with one combined grocery list and prep tips.",
  },
];

export function getUseCase(id: string): UseCase | undefined {
  return USE_CASES.find(u => u.id === id);
}

export function getUseCasesFor(category: "featured" | UseCaseCategory): UseCase[] {
  return category === "featured" ? USE_CASES.filter(u => u.featured) : USE_CASES.filter(u => u.category === category);
}
