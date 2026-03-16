/**
 * Seed script for Sanity Content Lake.
 *
 * Populates the Sanity dataset with all existing hardcoded content from the
 * dejajs-www pages. Uses `createOrReplace` so it is idempotent (safe to run
 * multiple times).
 *
 * Usage:
 *   SANITY_API_TOKEN=<write-token> npx tsx scripts/seed-sanity.ts
 *
 * Required env vars:
 *   SANITY_API_TOKEN          - Sanity API token with write access
 *   NEXT_PUBLIC_SANITY_PROJECT_ID  - Sanity project ID  (defaults to 'c6pxffpo')
 *   NEXT_PUBLIC_SANITY_DATASET     - Sanity dataset      (defaults to 'production')
 */

import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'c6pxffpo'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!token) {
  console.error('ERROR: SANITY_API_TOKEN environment variable is required.')
  console.error('Create a token at https://www.sanity.io/manage → API → Tokens')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-03-01',
  useCdn: false,
  token,
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a deterministic _key from a label string. */
function toKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings' as const,
  siteName: 'DEJA.js',
  productNavItems: [
    { _key: 'server', label: 'Server', href: '/server', description: 'Connect to your DCC-EX CommandStation via USB.', icon: '/icon-512.png' },
    { _key: 'throttle', label: 'Throttle', href: '/throttle', description: 'Precise speed control, consists, and function mapping.', icon: '/throttle/icon-512.png' },
    { _key: 'cloud', label: 'Cloud', href: '/cloud', description: 'Manage roster, devices, turnouts, and effects.', icon: '/cloud/icon-512.png' },
    { _key: 'io', label: 'IO', href: '/tour', description: 'Arduino and Pico W code for layout expansion.', icon: '/icon-512.png' },
    { _key: 'monitor', label: 'Monitor', href: '/monitor', description: 'Live telemetry, events, and command traces.', icon: '/monitor/icon-512.png' },
    { _key: 'tour', label: 'Tour', href: '/tour', description: 'Guided presets to automate layout sequences.', icon: '/tour/icon-512.png' },
  ],
  docsNavItems: [
    { _key: 'getting-started', label: 'Getting Started', href: '/docs' },
    { _key: 'server', label: 'Server', href: '/docs/server' },
    { _key: 'throttle', label: 'Throttle', href: '/docs/throttle' },
    { _key: 'cloud', label: 'Cloud', href: '/docs/cloud' },
    { _key: 'io', label: 'IO', href: '/docs/io' },
    { _key: 'monitor', label: 'Monitor', href: '/docs/monitor' },
    { _key: 'tour', label: 'Tour', href: '/docs/tour' },
    { _key: 'program', label: 'Program', href: '#', comingSoon: true },
    { _key: 'aiops', label: 'AI Ops', href: '#', comingSoon: true },
    { _key: 'dispatcher', label: 'Dispatcher', href: '#', comingSoon: true },
  ],
  footerLinks: [
    { _key: 'docs', label: 'Docs', href: '/docs' },
    { _key: 'faq', label: 'FAQ', href: '/faq' },
    { _key: 'pricing', label: 'Pricing', href: '/pricing' },
    { _key: 'github', label: 'GitHub', href: 'https://github.com/jmcdannel/DEJA.js' },
  ],
  socialLinks: [
    { _key: 'github', label: 'GitHub', href: 'https://github.com/jmcdannel/DEJA.js' },
  ],
  loginUrl: 'https://cloud.dejajs.com/',
  signupUrl: 'https://cloud.dejajs.com/signup',
}

const homepageDoc = {
  _id: 'homepage',
  _type: 'homepage' as const,
  hero: {
    title: 'The modern throttle for DCC-EX \u2014 and much more.',
    subtitle:
      'DEJA.js delivers a precise, organized control experience. Replace cluttered legacy interfaces with smooth interactions and an expandable hardware platform.',
    cta: { _type: 'cta', label: 'Get Started', href: '/docs/quick-start', style: 'primary' },
  },
  quickStartSection: {
    title: 'Quick Start',
    description: 'Ditch the manual. Get running in minutes.',
  },
  secondaryCta: {
    _type: 'cta',
    label: 'Read Docs',
    href: '/docs',
    style: 'secondary',
  },
}

// Product pages -----------------------------------------------------------------

interface ProductPageData {
  _id: string
  _type: 'productPage'
  title: string
  slug: { _type: 'slug'; current: string }
  tagline: string
  color: string
  description: string
  features: Array<{ _key: string; _type: 'feature'; icon: string; title: string; description: string }>
  cta: { _type: 'cta'; label: string; href: string; style: string }
}

const productPages: ProductPageData[] = [
  {
    _id: 'productPage-server',
    _type: 'productPage',
    title: 'DEJA.js Server',
    slug: { _type: 'slug', current: 'server' },
    tagline:
      'The essential bridge. Connect your DCC-EX CommandStation to the DEJA software ecosystem safely and securely.',
    color: 'cyan',
    description:
      'Connect your DCC-EX CommandStation to the DEJA software ecosystem securely via USB or Network. Real-time telemetry, WebSocket API, and hardware expansion.',
    features: [
      {
        _key: 'usb-connectivity',
        _type: 'feature',
        icon: '\uD83D\uDD0C',
        title: 'USB Connectivity',
        description:
          'Maintains a stable, high-speed serial connection to your DCC-EX CommandStation. Handles rapid command dispatch without dropping packets.',
      },
      {
        _key: 'real-time-telemetry',
        _type: 'feature',
        icon: '\uD83D\uDD04',
        title: 'Real-time Telemetry',
        description:
          'Parses raw DCC-EX responses instantly. Broadcasts layout state changes (turnouts, sensors, current draw) to connected apps with minimal latency.',
      },
      {
        _key: 'network-gateway',
        _type: 'feature',
        icon: '\uD83D\uDCE1',
        title: 'Network Gateway',
        description:
          'Exposes a robust WebSocket API. Allows Throttle, Monitor, and Cloud applications to interface securely from any device on your local network.',
      },
      {
        _key: 'hardware-expansion',
        _type: 'feature',
        icon: '\u26A1',
        title: 'Hardware Expansion',
        description:
          'Automatically detects and manages secondary Arduino and Pico W devices connected via USB for expanded IO control.',
      },
    ],
    cta: { _type: 'cta', label: 'Install Server', href: '/docs/server', style: 'primary' },
  },
  {
    _id: 'productPage-throttle',
    _type: 'productPage',
    title: 'DEJA.js Throttle',
    slug: { _type: 'slug', current: 'throttle' },
    tagline:
      'Tactile, responsive, clear. The modern driver experience designed primarily for touch interfaces and mobile devices.',
    color: 'green',
    description:
      'Tactile, responsive, clear. The modern driver experience designed for touch and mobile controls of DCC-EX layouts. Speed control, consists, function mapping, and CV programming.',
    features: [
      {
        _key: 'precision-speed-control',
        _type: 'feature',
        icon: '\uD83D\uDE82',
        title: 'Precision Speed Control',
        description:
          'Smooth slider interfaces combined with exact step modifiers (+1 / -1). Visual feedback confirms speed step changes instantly.',
      },
      {
        _key: 'ez-consist',
        _type: 'feature',
        icon: '\uD83D\uDD17',
        title: 'EZ Consist',
        description:
          'Build functional consists in seconds visually. Select lead, adjust orientations, and drive multiple locomotives as a single unit without complex programming.',
      },
      {
        _key: 'function-mapping',
        _type: 'feature',
        icon: '\uD83C\uDF9B\uFE0F',
        title: 'Function Mapping',
        description:
          'Customizable function buttons mapped dynamically from your roster. Color-code lights, horns, and bells for quick visual identification.',
      },
      {
        _key: 'turnout-route-access',
        _type: 'feature',
        icon: '\uD83D\uDD00',
        title: 'Turnout & Route Access',
        description:
          'Access your designated turnouts directly from the throttle context. Throw switches without switching apps or physical controllers.',
      },
    ],
    cta: { _type: 'cta', label: 'Launch Throttle Web App', href: '/docs/throttle', style: 'primary' },
  },
  {
    _id: 'productPage-cloud',
    _type: 'productPage',
    title: 'DEJA.js Cloud',
    slug: { _type: 'slug', current: 'cloud' },
    tagline:
      'The centralized catalog and configuration hub for your model railroad. Manage devices, locos, turnouts, and effects securely from anywhere.',
    color: 'purple',
    description:
      'The centralized catalog and configuration hub for your model railroad. Manage devices, locos, turnouts, and effects securely from anywhere.',
    features: [
      {
        _key: 'roster-management',
        _type: 'feature',
        icon: '\uD83D\uDCCB',
        title: 'Roster Management',
        description:
          'Store your locomotive addresses, descriptions, and custom function definitions in the cloud. Changes sync instantly across all devices accessing the layout.',
      },
      {
        _key: 'global-color-coding',
        _type: 'feature',
        icon: '\uD83C\uDFA8',
        title: 'Global Color Coding',
        description:
          'Assign distinct colors to specific locomotives, turnouts, or sensors within the Cloud App. Those colors follow the element into the Throttle and Monitor tools for instant visual recognition.',
      },
      {
        _key: 'secure-device-identity',
        _type: 'feature',
        icon: '\uD83D\uDD10',
        title: 'Secure Device Identity',
        description:
          'Manage your connected hardware securely. Issue session tokens to throttle clients to prevent unauthorized access to your DCC-EX CommandStation.',
      },
      {
        _key: 'layout-spaces',
        _type: 'feature',
        icon: '\uD83C\uDF10',
        title: 'Layout Spaces',
        description:
          'Create separate \u201Cspaces\u201D or layouts on a single account. Easily switch between controlling your home setup, a club layout, or a test bench.',
      },
    ],
    cta: { _type: 'cta', label: 'Access DEJA Cloud', href: '/docs/cloud', style: 'primary' },
  },
  {
    _id: 'productPage-monitor',
    _type: 'productPage',
    title: 'DEJA.js Monitor',
    slug: { _type: 'slug', current: 'monitor' },
    tagline:
      'Deep diagnostic visibility. Built for technical operators and layout builders who need to see the data flowing across their network.',
    color: 'red',
    description:
      'Deep diagnostic visibility. Built for technical operators who need to trace DCC-EX commands and telemetry in real-time. Command traces, live telemetry, and event filtering.',
    features: [
      {
        _key: 'command-traces',
        _type: 'feature',
        icon: '\uD83D\uDCDC',
        title: 'Command Traces',
        description:
          'View raw and parsed DCC-EX API commands in real-time. Understand exactly what bytes are being transmitted between the server and the CommandStation.',
      },
      {
        _key: 'live-telemetry',
        _type: 'feature',
        icon: '\uD83D\uDCCA',
        title: 'Live Telemetry',
        description:
          'Monitor track power draw, main/prog track statuses, and server uptime metrics from a unified dashboard.',
      },
      {
        _key: 'sensor-activity',
        _type: 'feature',
        icon: '\uD83D\uDCE1',
        title: 'Sensor Activity',
        description:
          'Watch layout events flow in as trains pass sensors. Ideal for verifying automation hardware installations and routing logic.',
      },
      {
        _key: 'event-filtering',
        _type: 'feature',
        icon: '\uD83D\uDD0D',
        title: 'Event Filtering',
        description:
          'Cut through the noise. Filter the event stream strictly by turnouts, locos, errors, or custom IO devices to debug specific layout zones.',
      },
    ],
    cta: { _type: 'cta', label: 'Launch Monitor Web App', href: '/docs/monitor', style: 'primary' },
  },
  {
    _id: 'productPage-tour',
    _type: 'productPage',
    title: 'DEJA.js Tour & IO',
    slug: { _type: 'slug', current: 'tour' },
    tagline:
      'Automate and expand. Leverage structured presets and plug-and-play code to push your layout beyond basic throttle control.',
    color: 'cyan',
    description:
      'Automate and expand your layout. Leverage structured presets and plug-and-play Arduino and Pico W code for DCC-EX layout automation.',
    features: [
      {
        _key: 'guided-presets',
        _type: 'feature',
        icon: '\uD83D\uDDFA\uFE0F',
        title: 'Guided Presets',
        description:
          'Create and execute sequential commands (Tours). Showcase routes, execute demonstrations, and automate complex yard movements with a single tap.',
      },
      {
        _key: 'plug-and-play-io',
        _type: 'feature',
        icon: '\uD83D\uDD0C',
        title: 'Plug-and-Play IO',
        description:
          'Download provided sketch code for Arduino and Pico W. Expand your layout with hundreds of pins for signals, sensors, and servos without writing backend logic.',
      },
      {
        _key: 'dynamic-effects',
        _type: 'feature',
        icon: '\uD83D\uDCA1',
        title: 'Dynamic Effects',
        description:
          'Control physical lighting arrays, addressable LEDs, and relay modules directly from the Throttle interface. DEJA handles the protocol translation.',
      },
      {
        _key: 'protocol-agnostic',
        _type: 'feature',
        icon: '\uD83D\uDD04',
        title: 'Protocol Agnostic',
        description:
          'Communicate over direct serial USB, local WebSocket, or remote MQTT. Connect microcontrollers exactly how your specific layout geometry demands.',
      },
    ],
    cta: { _type: 'cta', label: 'View Tour Docs', href: '/docs/tour', style: 'primary' },
  },
]

// FAQ page -------------------------------------------------------------------

const faqPageDoc = {
  _id: 'faqPage',
  _type: 'faqPage' as const,
  title: 'Frequently Asked Questions',
  sections: [
    {
      _key: 'general-overview',
      _type: 'faqSection',
      heading: 'General Overview',
      entries: [
        {
          _key: 'what-is-dejajs',
          _type: 'faqEntry',
          question: 'What is DEJA.js?',
          answer:
            'DEJA.js (DCC-EX JavaScript API) is a modern, comprehensive suite of applications designed to transform your model railroad into a connected, intelligent system. It provides all the tools you need to control, monitor, and interact with your DCC-EX CommandStation.',
        },
        {
          _key: 'compare-to-jmri',
          _type: 'faqEntry',
          question: 'How does DEJA.js compare to older software like JMRI?',
          answer:
            'DEJA.js is built as a modern alternative, utilizing newer technology than JMRI to provide a seamless, real-time, cloud-synced experience across all devices. It features modern web technologies like Vue 3, TypeScript, MQTT, and WebSocket communication.',
        },
        {
          _key: 'where-to-start',
          _type: 'faqEntry',
          question: 'Where do I start?',
          answer:
            'First, create an account on DEJA Cloud. Next, install the DEJA.js Server on your computer and connect it to your DCC-EX CommandStation via USB. Once you add a locomotive to your roster in the Cloud app, you can open the Throttle app in any browser on your network and start driving.',
        },
      ],
    },
    {
      _key: 'hardware-technical',
      _type: 'faqSection',
      heading: 'Hardware & Technical Requirements',
      entries: [
        {
          _key: 'server-hardware',
          _type: 'faqEntry',
          question: 'What hardware do I need to run the DEJA.js Server?',
          answer:
            'You need a computer or laptop. The DEJA.js Server is highly versatile and can run on Windows, Mac, Linux, or a Raspberry Pi.',
        },
        {
          _key: 'software-prerequisites',
          _type: 'faqEntry',
          question: 'Are there specific software prerequisites for the Server?',
          answer:
            'Yes, to run the server locally, you will need Node.js (v22 or higher), pnpm (v9 or higher), and Git installed on your machine.',
        },
        {
          _key: 'throttle-devices',
          _type: 'faqEntry',
          question: 'What devices can I use as a throttle?',
          answer:
            'The DEJA.js Throttle app can be run on an iPhone, iPad, Android device, or directly through a Web browser.',
        },
        {
          _key: 'supported-microcontrollers',
          _type: 'faqEntry',
          question: 'What microcontrollers are supported for expanding my layout?',
          answer:
            'DEJA.js IO provides ready-to-use, plug-and-play code for Arduino devices (like the Arduino Mega) and CircuitPython devices (like the Raspberry Pi Pico W).',
        },
      ],
    },
    {
      _key: 'connections-setup',
      _type: 'faqSection',
      heading: 'Connections & Setup',
      entries: [
        {
          _key: 'physical-connection',
          _type: 'faqEntry',
          question: 'How does the system physically connect to my layout?',
          answer:
            'The DEJA.js Server acts as the central bridge for your setup. It connects directly to your DCC-EX CommandStation using a standard USB connection. From there, all your apps (Throttle, Cloud, Monitor) sync instantly in real-time through the DEJA Cloud.',
        },
        {
          _key: 'communication-protocols',
          _type: 'faqEntry',
          question: 'What communication protocols do external devices use to connect?',
          answer:
            'While your CommandStation connects via USB, additional devices on your layout (like Arduinos or Raspberry Pis) can connect to the DEJA Cloud via Websocket or MQTT.',
        },
        {
          _key: 'configure-hardware',
          _type: 'faqEntry',
          question: 'How difficult is it to configure new hardware like an Arduino for lights or sensors?',
          answer:
            'It is designed to be user-friendly. When you add an Arduino Mega to your layout to control lights, sensors, servos, or relays, each pin can be designated as an input or output, and the DEJA.js Server will automatically detect the devices and configure them for you.',
        },
      ],
    },
    {
      _key: 'cloud-app-features',
      _type: 'faqSection',
      heading: 'DEJA.js Cloud App Features & Usage',
      entries: [
        {
          _key: 'what-is-cloud-app',
          _type: 'faqEntry',
          question: 'What is the DEJA.js Cloud App and where do I access it?',
          answer:
            'The DEJA.js Cloud App is a web-based application accessible at https://cloud.dejajs.com. It serves as the central hub for layout management, device monitoring, and multi-user coordination.',
        },
        {
          _key: 'create-account',
          _type: 'faqEntry',
          question: 'How do I create an account and start using DEJA Cloud?',
          answer:
            'You can sign up on the DEJA Cloud website using an email/password, Google, or GitHub account. Once you sign up, your account will temporarily be placed in a "Pending Approval" status. After an admin approves your account, you will be automatically redirected to an onboarding wizard to finish your setup.',
        },
        {
          _key: 'configure-layout',
          _type: 'faqEntry',
          question: 'How do I create and configure my layout in the Cloud App?',
          answer:
            'During the onboarding wizard, you will be prompted to create your layout by giving it a name and a unique Layout ID (which must contain only lowercase letters, numbers, and hyphens). The app will then generate your specific LAYOUT_ID and VITE_FIREBASE_* credentials. You must copy these values and paste them into your local server\'s .env.local configuration file so your local setup can communicate with the Cloud.',
        },
        {
          _key: 'register-commandstation',
          _type: 'faqEntry',
          question: 'How do I register my DCC-EX CommandStation in the Cloud App?',
          answer:
            'To let the Cloud know your CommandStation exists, open your layout in the DEJA Cloud, navigate to the Devices tab, and click Add. Select "DCC-EX CommandStation", choose "USB" as the connection type, and click Submit. It will show as "disconnected" until you start your local DEJA.js Server and connect it via the Monitor app.',
        },
        {
          _key: 'add-locomotives',
          _type: 'faqEntry',
          question: 'How do I add locomotives so I can drive them?',
          answer:
            'To add trains to your system, navigate to the Roster section in the Cloud App and click "Add Loco". Enter the locomotive\'s DCC address and a name. Once added, the locomotive will instantly be available to drive in the DEJA.js Throttle app.',
        },
        {
          _key: 'other-layout-features',
          _type: 'faqEntry',
          question: 'What other layout features can I manage through the Cloud App?',
          answer:
            'Beyond locomotives, the Cloud App allows you to manage external microcontrollers like Arduinos and Raspberry Pis, or anything else that can connect via Websocket or MQTT. Through the app, you can configure these devices to manage layout inputs and outputs, including lights, sound effects, relays, sensors, servos, signals, and track turnouts.',
        },
        {
          _key: 'multiple-operators',
          _type: 'faqEntry',
          question: 'Can the system handle multiple operators at once?',
          answer:
            'Yes, DEJA.js features multi-throttle support for multiple simultaneous operators, making it an ideal solution for club layouts or exhibition setups where multiple people need to coordinate and operate trains at the same time.',
        },
      ],
    },
    {
      _key: 'using-apps-troubleshooting',
      _type: 'faqSection',
      heading: 'Using the Apps & Troubleshooting',
      entries: [
        {
          _key: 'debug-connectivity',
          _type: 'faqEntry',
          question: "I'm having connectivity or command issues on my layout. How can I debug them?",
          answer:
            'If you run into issues, you can use the DEJA.js Monitor app. It provides live dashboards and logs for telemetry, events, and command traces, making it much easier to debug and optimize your layout.',
        },
        {
          _key: 'mobile-throttle-usability',
          _type: 'faqEntry',
          question: 'Is the mobile Throttle app easy to use on small touch screens?',
          answer:
            'Yes, the app was designed with accessibility in mind and features "EZ-touch chonky buttons" to make controlling your trains on a mobile screen easy and precise.',
        },
        {
          _key: 'automate-trains',
          _type: 'faqEntry',
          question: 'Can I automate trains or set up automated demonstrations?',
          answer:
            'Yes! The DEJA.js Tour app allows you to set up guided tours, presets, and automated sequences to showcase specific routes or demonstrations on your layout.',
        },
        {
          _key: 'track-devices',
          _type: 'faqEntry',
          question: 'How do I keep track of all my different devices, locos, and turnouts?',
          answer:
            'DEJA.js features a custom color-coding system to help you stay organized. You can assign swatches, tag colors, or custom colors to your devices, locomotives, turnouts, and effects in the DEJA Cloud. Whenever that item appears across any of the DEJA apps, your custom color will be applied for quick identification.',
        },
      ],
    },
  ],
}

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

async function seed() {
  console.log(`Seeding Sanity (project: ${projectId}, dataset: ${dataset})...\n`)

  // 1. Site Settings
  await client.createOrReplace(siteSettings)
  console.log('[ok] Site Settings')

  // 2. Product Pages (must exist before homepage references them)
  for (const page of productPages) {
    await client.createOrReplace(page)
    console.log(`[ok] Product Page: ${page.title}`)
  }

  // 3. Homepage (without productShowcase references first)
  await client.createOrReplace(homepageDoc)
  console.log('[ok] Homepage (base)')

  // 4. Patch homepage to add productShowcase references
  await client
    .patch('homepage')
    .set({
      productShowcase: productPages.map((p) => ({
        _type: 'reference',
        _ref: p._id,
        _key: `ref-${p.slug.current}`,
      })),
    })
    .commit()
  console.log('[ok] Homepage productShowcase references')

  // 5. FAQ Page
  await client.createOrReplace(faqPageDoc)
  console.log('[ok] FAQ Page')

  console.log('\nSeeding complete!')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
