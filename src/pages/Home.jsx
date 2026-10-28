import Hero from '../components/Hero.jsx';
import MovieBrowser from '../components/MovieBrowser.jsx';


function Home(){
     return(
          <section id="home">
               <Hero />
               <MovieBrowser />
          </section>
     );
}


export default Home;