import Head from "next/head";
import Carousel from "./components/Carousel";
import Sidebar from "./components/Siderbar";

export default function Home() {
  const slides = ["/1.jpg", "/2.jpg", "/3.jpg"];

  return (
    <div className="relative min-h-screen flex flex-row bg-gray-50 dark:bg-[#17171a] dark:text-red-50">
      <Head>
        <title>TonyChat - Your Personal and Business Chatbot</title>
        <meta
          name="description"
          content="TonyChat is an open-source, multifunctional Chatbot suitable for both personal and business purposes. It allows for customized chatbot deployment, easy model fine-tuning, and ensures safety and privacy."
        />
        <meta
          property="og:title"
          content="TonyChat - Your Personal and Business Chatbot"
        />
        <meta
          property="og:description"
          content="TonyChat is an open-source, multifunctional Chatbot suitable for both personal and business purposes. It allows for customized chatbot deployment, easy model fine-tuning, and ensures safety and privacy."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/T_icon.png" />
        <meta property="og:url" content="https://www.tonychat.com" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Sidebar />

      <div>
        <section className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">
              Your Open-Source AI Companion
            </h1>
            <p className="text-xl mb-8">
              Customizable, secure, and easy to deploy for personal and business
              use.
            </p>
            <div className="space-x-4">
              <a
                href="/chat"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
              >
                Chat Now
              </a>
              <a
                href="#"
                className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800"
              >
                Bot Store
              </a>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-8">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-700">
                <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">
                  Customizable Chatbots
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Deploy AI chatbots tailored to your specific needs.Tailor your
                  chatbot to your specific needs with ease.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-700">
                <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">
                  Easy Fine-Tuning
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Effortlessly train and improve your models.Refine your models
                  for optimal performance and accuracy.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-700">
                <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">
                  Safety & Privacy
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Your data is protected and secure with our platform.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md dark:shadow-gray-700">
                <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">
                  Open-Source
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Find, share, and use prompts to accelerate your AI
                  development.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="bg-purple-600 text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to get started with TonyChat?
            </h2>
            <p className="text-xl mb-8">
              Join our community and start building powerful AI applications
              today.
            </p>
            <a
              href="#"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Get Started for Free
            </a>
          </div>
        </section>
        <div className="relative m-auto p-4 ">
            <Carousel autoPlay={true}>{slides}</Carousel>
        </div>
        <footer className="bg-gray-800 text-white py-10">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap justify-between">
              <div className="w-full md:w-1/4 mb-6 md:mb-0">
                <h3 className="text-lg font-semibold mb-2">TonyChat</h3>
                <p className="text-gray-400">
                  Open-source multifunctional chatbot platform
                </p>
              </div>
              <div className="w-full md:w-1/4 mb-6 md:mb-0">
                <h3 className="text-lg font-semibold mb-2">Links</h3>
                <ul className="text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Documentation
                    </a>
                  </li>
                </ul>
              </div>
              <div className="w-full md:w-1/4 mb-6 md:mb-0">
                <h3 className="text-lg font-semibold mb-2">Community</h3>
                <ul className="text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white">
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Forum
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Discord
                    </a>
                  </li>
                </ul>
              </div>
              <div className="w-full md:w-1/4">
                <h3 className="text-lg font-semibold mb-2">Subscribe</h3>
                <form>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full mb-2"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg w-full hover:bg-purple-700"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-400 text-center">
              &copy; 2024 TonyChat. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
