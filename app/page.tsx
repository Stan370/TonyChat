import Siderbar from './components/Siderbar'


export default function Home() {
  return (
    <div className="relative flex min-h-screen  overflow-hidden bg-gray-50 py-6 ">
      <Siderbar></Siderbar>
      <article>
        <h2>Article Title</h2>
        <p>This is the main content of the article.</p>
      </article>

      <section>
        <h2>Another Section</h2>
        <p>Some more content in another section.</p>
      </section>

      <footer>
        <p>&copy; 2024 TonyChat</p>
      </footer>
    </div>
  );
}
