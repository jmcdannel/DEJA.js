import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - DEJA.js',
  description:
    'Frequently asked questions about DEJA.js, the modern DCC-EX throttle and layout management ecosystem.',
  openGraph: {
    title: 'FAQ - DEJA.js',
    description:
      'Frequently asked questions about DEJA.js, the modern DCC-EX throttle and layout management ecosystem.',
    url: 'https://dejajs.com/faq',
  },
};

// Hardcoded fallback sections
const defaultSections = [
  {
    heading: 'General Overview',
    entries: [
      { question: 'What is DEJA.js?', answer: 'DEJA.js (DCC-EX JavaScript API) is a modern, comprehensive suite of applications designed to transform your model railroad into a connected, intelligent system. It provides all the tools you need to control, monitor, and interact with your DCC-EX CommandStation.' },
      { question: 'How does DEJA.js compare to older software like JMRI?', answer: 'DEJA.js is built as a modern alternative, utilizing newer technology than JMRI to provide a seamless, real-time, cloud-synced experience across all devices. It features modern web technologies like Vue 3, TypeScript, MQTT, and WebSocket communication.' },
      { question: 'Where do I start?', answer: 'First, create an account on DEJA Cloud. Next, install the DEJA.js Server on your computer and connect it to your DCC-EX CommandStation via USB. Once you add a locomotive to your roster in the Cloud app, you can open the Throttle app in any browser on your network and start driving.' },
    ],
  },
  {
    heading: 'Hardware & Technical Requirements',
    entries: [
      { question: 'What hardware do I need to run the DEJA.js Server?', answer: 'You need a computer or laptop. The DEJA.js Server is highly versatile and can run on Windows, Mac, Linux, or a Raspberry Pi.' },
      { question: 'Are there specific software prerequisites for the Server?', answer: 'Yes, to run the server locally, you will need Node.js (v22 or higher), pnpm (v9 or higher), and Git installed on your machine.' },
      { question: 'What devices can I use as a throttle?', answer: 'The DEJA.js Throttle app can be run on an iPhone, iPad, Android device, or directly through a Web browser.' },
      { question: 'What microcontrollers are supported for expanding my layout?', answer: 'DEJA.js IO provides ready-to-use, plug-and-play code for Arduino devices (like the Arduino Mega) and CircuitPython devices (like the Raspberry Pi Pico W).' },
    ],
  },
  {
    heading: 'Connections & Setup',
    entries: [
      { question: 'How does the system physically connect to my layout?', answer: 'The DEJA.js Server acts as the central bridge for your setup. It connects directly to your DCC-EX CommandStation using a standard USB connection. From there, all your apps (Throttle, Cloud, Monitor) sync instantly in real-time through the DEJA Cloud.' },
      { question: 'What communication protocols do external devices use to connect?', answer: 'While your CommandStation connects via USB, additional devices on your layout (like Arduinos or Raspberry Pis) can connect to the DEJA Cloud via Websocket or MQTT.' },
      { question: 'How difficult is it to configure new hardware like an Arduino for lights or sensors?', answer: 'It is designed to be user-friendly. When you add an Arduino Mega to your layout to control lights, sensors, servos, or relays, each pin can be designated as an input or output, and the DEJA.js Server will automatically detect the devices and configure them for you.' },
    ],
  },
  {
    heading: 'DEJA.js Cloud App Features & Usage',
    entries: [
      { question: 'What is the DEJA.js Cloud App and where do I access it?', answer: 'The DEJA.js Cloud App is a web-based application accessible at https://cloud.dejajs.com. It serves as the central hub for layout management, device monitoring, and multi-user coordination.' },
      { question: 'How do I create an account and start using DEJA Cloud?', answer: 'You can sign up on the DEJA Cloud website using an email/password, Google, or GitHub account. Once you sign up, your account will temporarily be placed in a "Pending Approval" status. After an admin approves your account, you will be automatically redirected to an onboarding wizard to finish your setup.' },
      { question: 'How do I create and configure my layout in the Cloud App?', answer: 'During the onboarding wizard, you will be prompted to create your layout by giving it a name and a unique Layout ID (which must contain only lowercase letters, numbers, and hyphens). The app will then generate your specific LAYOUT_ID and VITE_FIREBASE_* credentials. You must copy these values and paste them into your local server\'s .env.local configuration file so your local setup can communicate with the Cloud.' },
      { question: 'How do I register my DCC-EX CommandStation in the Cloud App?', answer: 'To let the Cloud know your CommandStation exists, open your layout in the DEJA Cloud, navigate to the Devices tab, and click Add. Select "DCC-EX CommandStation", choose "USB" as the connection type, and click Submit. It will show as "disconnected" until you start your local DEJA.js Server and connect it via the Monitor app.' },
      { question: 'How do I add locomotives so I can drive them?', answer: 'To add trains to your system, navigate to the Roster section in the Cloud App and click "Add Loco". Enter the locomotive\'s DCC address and a name. Once added, the locomotive will instantly be available to drive in the DEJA.js Throttle app.' },
      { question: 'What other layout features can I manage through the Cloud App?', answer: 'Beyond locomotives, the Cloud App allows you to manage external microcontrollers like Arduinos and Raspberry Pis, or anything else that can connect via Websocket or MQTT. Through the app, you can configure these devices to manage layout inputs and outputs, including lights, sound effects, relays, sensors, servos, signals, and track turnouts.' },
      { question: 'Can the system handle multiple operators at once?', answer: 'Yes, DEJA.js features multi-throttle support for multiple simultaneous operators, making it an ideal solution for club layouts or exhibition setups where multiple people need to coordinate and operate trains at the same time.' },
    ],
  },
  {
    heading: 'Using the Apps & Troubleshooting',
    entries: [
      { question: "I'm having connectivity or command issues on my layout. How can I debug them?", answer: 'If you run into issues, you can use the DEJA.js Monitor app. It provides live dashboards and logs for telemetry, events, and command traces, making it much easier to debug and optimize your layout.' },
      { question: 'Is the mobile Throttle app easy to use on small touch screens?', answer: 'Yes, the app was designed with accessibility in mind and features "EZ-touch chonky buttons" to make controlling your trains on a mobile screen easy and precise.' },
      { question: 'Can I automate trains or set up automated demonstrations?', answer: 'Yes! The DEJA.js Tour app allows you to set up guided tours, presets, and automated sequences to showcase specific routes or demonstrations on your layout.' },
      { question: 'How do I keep track of all my different devices, locos, and turnouts?', answer: 'DEJA.js features a custom color-coding system to help you stay organized. You can assign swatches, tag colors, or custom colors to your devices, locomotives, turnouts, and effects in the DEJA Cloud. Whenever that item appears across any of the DEJA apps, your custom color will be applied for quick identification.' },
    ],
  },
];

type FAQEntry = { _key?: string; question: string; answer: string };
type FAQSection = { _key?: string; heading: string; entries: FAQEntry[] };

export default function FAQPage() {
  const pageTitle = 'Frequently Asked Questions';
  const sections: FAQSection[] = defaultSections;

  return (
    <div className="space-y-16 max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <section className="text-center space-y-6 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          {pageTitle}
        </h1>
        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400">
          Everything you need to know about setting up and running DEJA.js.
        </p>
      </section>

      <div className="space-y-12">
        {sections.map((section, sIdx) => (
          <section key={section._key || sIdx}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-b border-gray-200 dark:border-slate-800 pb-2">
              {section.heading}
            </h2>
            <div className="space-y-6">
              {section.entries?.map((entry, eIdx) => (
                <div key={entry._key || eIdx} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{entry.question}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {entry.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
