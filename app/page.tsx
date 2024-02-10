import Head from "@/node_modules/next/head";
import Carousel from "./components/Carousel";
import Siderbar from "./components/Siderbar";

export default function Home() {
  const slides = ["/1.jpg", "/2.jpg", "/3.jpg"];

  return (
    <div className="relative min-h-screen flex flex-row  bg-gray-50 dark:bg-[#17171a] dark:text-red-50  ">
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
        <meta property="og:image" content="/T_icon.png" />{" "}
        {/* Replace "/path/to/tonychat-image.png" with the actual path to your image */}
        <meta property="og:url" content="https://www.tonychat.com" />{" "}
        {/* Update this URL to the actual URL of your project */}
        <link rel="icon" href="/favicon.ico" />
        {/* Add any additional tags that are relevant to your project */}
      </Head>
      <Siderbar></Siderbar> 
      <div className="relative m-auto p-4">
        <Carousel autoPlay={true}>
          {slides}
        </Carousel>
      </div>

      
    </div>
  );
}
