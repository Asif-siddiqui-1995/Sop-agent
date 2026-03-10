import {useState} from "react";
import HeroImage from "../assets/hero.png";
import ChatModal from "./ChatModal";

export default function Hero() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <section
                className="hero"
                style={{
                    backgroundImage: `url(${HeroImage})`,
                }}
            >
                <div className="hero-overlay">
                    <div className="hero-inner">
                        <div className="hero-text">
                            <h1>
                                Smart Employee <br />
                                <span>SOP Q&A Chatbot</span>
                            </h1>

                            <p>
                                Instant answers to all your company’s policies
                                and procedures. Empower your employees with an
                                AI-powered assistant.
                            </p>

                            <button
                                className="primary-btn"
                                onClick={() => setOpen(true)}
                            >
                                Ask a Question
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <ChatModal isOpen={open} onClose={() => setOpen(false)} />
        </>
    );
}
