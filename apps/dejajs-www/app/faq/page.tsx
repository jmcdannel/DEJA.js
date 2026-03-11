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

export default function FAQPage() {
  return (
    <div className="space-y-16 max-w-4xl mx-auto">
      <section className="text-center space-y-6 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400">
          Everything you need to know about setting up and running DEJA.js.
        </p>
      </section>

      <div className="space-y-12">
        {/* General Overview */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-b border-gray-200 dark:border-slate-800 pb-2">
            General Overview
          </h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">What is DEJA.js?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                DEJA.js (DCC-EX JavaScript API) is a modern, comprehensive suite of applications designed to transform your model railroad into a connected, intelligent system. It provides all the tools you need to control, monitor, and interact with your DCC-EX CommandStation.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">How does DEJA.js compare to older software like JMRI?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                DEJA.js is built as a modern alternative, utilizing newer technology than JMRI to provide a seamless, real-time, cloud-synced experience across all devices. It features modern web technologies like Vue 3, TypeScript, MQTT, and WebSocket communication.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Where do I start?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                First, create an account on DEJA Cloud. Next, install the DEJA.js Server on your computer and connect it to your DCC-EX CommandStation via USB. Once you add a locomotive to your roster in the Cloud app, you can open the Throttle app in any browser on your network and start driving.
              </p>
            </div>
          </div>
        </section>

        {/* Hardware & Technical Requirements */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-b border-gray-200 dark:border-slate-800 pb-2">
            Hardware & Technical Requirements
          </h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">What hardware do I need to run the DEJA.js Server?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You need a computer or laptop. The DEJA.js Server is highly versatile and can run on Windows, Mac, Linux, or a Raspberry Pi.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Are there specific software prerequisites for the Server?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, to run the server locally, you will need Node.js (v22 or higher), pnpm (v9 or higher), and Git installed on your machine.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">What devices can I use as a throttle?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                The DEJA.js Throttle app can be run on an iPhone, iPad, Android device, or directly through a Web browser.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">What microcontrollers are supported for expanding my layout?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                DEJA.js IO provides ready-to-use, plug-and-play code for Arduino devices (like the Arduino Mega) and CircuitPython devices (like the Raspberry Pi Pico W).
              </p>
            </div>
          </div>
        </section>

        {/* Connections & Setup */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-b border-gray-200 dark:border-slate-800 pb-2">
            Connections & Setup
          </h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">How does the system physically connect to my layout?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                The DEJA.js Server acts as the central bridge for your setup. It connects directly to your DCC-EX CommandStation using a standard USB connection. From there, all your apps (Throttle, Cloud, Monitor) sync instantly in real-time through the DEJA Cloud.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">What communication protocols do external devices use to connect?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                While your CommandStation connects via USB, additional devices on your layout (like Arduinos or Raspberry Pis) can connect to the DEJA Cloud via Websocket or MQTT.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">How difficult is it to configure new hardware like an Arduino for lights or sensors?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                It is designed to be user-friendly. When you add an Arduino Mega to your layout to control lights, sensors, servos, or relays, each pin can be designated as an input or output, and the DEJA.js Server will automatically detect the devices and configure them for you.
              </p>
            </div>
          </div>
        </section>

        {/* DEJA.js Cloud App Features & Usage */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-b border-gray-200 dark:border-slate-800 pb-2">
            DEJA.js Cloud App Features & Usage
          </h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">What is the DEJA.js Cloud App and where do I access it?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                The DEJA.js Cloud App is a web-based application accessible at https://cloud.dejajs.com. It serves as the central hub for layout management, device monitoring, and multi-user coordination.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">How do I create an account and start using DEJA Cloud?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You can sign up on the DEJA Cloud website using an email/password, Google, or GitHub account. Once you sign up, your account will temporarily be placed in a "Pending Approval" status. After an admin approves your account, you will be automatically redirected to an onboarding wizard to finish your setup.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">How do I create and configure my layout in the Cloud App?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                During the onboarding wizard, you will be prompted to create your layout by giving it a name and a unique Layout ID (which must contain only lowercase letters, numbers, and hyphens). The app will then generate your specific LAYOUT_ID and VITE_FIREBASE_* credentials. You must copy these values and paste them into your local server's .env.local configuration file so your local setup can communicate with the Cloud.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">How do I register my DCC-EX CommandStation in the Cloud App?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                To let the Cloud know your CommandStation exists, open your layout in the DEJA Cloud, navigate to the Devices tab, and click Add. Select "DCC-EX CommandStation", choose "USB" as the connection type, and click Submit. It will show as "disconnected" until you start your local DEJA.js Server and connect it via the Monitor app.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">How do I add locomotives so I can drive them?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                To add trains to your system, navigate to the Roster section in the Cloud App and click "Add Loco". Enter the locomotive's DCC address and a name. Once added, the locomotive will instantly be available to drive in the DEJA.js Throttle app.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">What other layout features can I manage through the Cloud App?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Beyond locomotives, the Cloud App allows you to manage external microcontrollers like Arduinos and Raspberry Pis, or anything else that can connect via Websocket or MQTT. Through the app, you can configure these devices to manage layout inputs and outputs, including lights, sound effects, relays, sensors, servos, signals, and track turnouts.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Can the system handle multiple operators at once?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, DEJA.js features multi-throttle support for multiple simultaneous operators, making it an ideal solution for club layouts or exhibition setups where multiple people need to coordinate and operate trains at the same time.
              </p>
            </div>
          </div>
        </section>

        {/* Using the Apps & Troubleshooting */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-b border-gray-200 dark:border-slate-800 pb-2">
            Using the Apps & Troubleshooting
          </h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">I'm having connectivity or command issues on my layout. How can I debug them?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                If you run into issues, you can use the DEJA.js Monitor app. It provides live dashboards and logs for telemetry, events, and command traces, making it much easier to debug and optimize your layout.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Is the mobile Throttle app easy to use on small touch screens?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, the app was designed with accessibility in mind and features "EZ-touch chonky buttons" to make controlling your trains on a mobile screen easy and precise.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Can I automate trains or set up automated demonstrations?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! The DEJA.js Tour app allows you to set up guided tours, presets, and automated sequences to showcase specific routes or demonstrations on your layout.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">How do I keep track of all my different devices, locos, and turnouts?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                DEJA.js features a custom color-coding system to help you stay organized. You can assign swatches, tag colors, or custom colors to your devices, locomotives, turnouts, and effects in the DEJA Cloud. Whenever that item appears across any of the DEJA apps, your custom color will be applied for quick identification.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
