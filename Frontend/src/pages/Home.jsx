import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Brands from "../components/Brands";
import Footer from "../components/Footer";
// import Chat from "../components/Chat";

export default function Home() {
    return (
        <>
            <Navbar />
            <Hero />
            <Features />
            <Brands />
            <Footer />
            {/* <Chat /> */}
        </>
    );
}
