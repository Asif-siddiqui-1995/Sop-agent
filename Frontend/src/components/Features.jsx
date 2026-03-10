import {useRef, useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Icon from "../assets/icon1.png";
import Icon2 from "../assets/icon2.png";
import Icon3 from "../assets/icon3.png";

export default function Features() {
    const fileInputRef = useRef(null);

    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    const handleUploadClick = () => {
        if (!uploading) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        setUploadProgress(1);

        const toastId = toast.loading("Uploading SOP...");

        try {
            await axios.post("http://localhost:5000/api/sop/upload", formData, {
                onUploadProgress: (progressEvent) => {
                    if (!progressEvent.total) return;

                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total,
                    );

                    setUploadProgress(percent);
                },
            });

            // Ensure progress completes visually
            setUploadProgress(100);

            toast.success("SOP uploaded successfully", {id: toastId});

            // Reset progress bar after animation completes
            setTimeout(() => {
                setUploadProgress(0);
                setUploading(false);
            }, 1000);
        } catch (error) {
            console.error(error);

            toast.error("Upload failed", {id: toastId});

            setUploadProgress(0);
            setUploading(false);
        } finally {
            e.target.value = "";
        }
    };

    return (
        <section className="features">
            {/* Card 1 */}
            <div className="card">
                <img src={Icon} alt="Upload SOPs" />
                <h3>Upload SOPs</h3>
                <p>Upload and manage your company’s SOP documents</p>

                <button onClick={handleUploadClick} disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload Now"}
                </button>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{display: "none"}}
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                />

                {uploadProgress > 0 && (
                    <div className="progress-bar">
                        <div
                            className="progress"
                            style={{
                                width: `${uploadProgress}%`,
                                transition: "width 0.3s ease",
                            }}
                        />
                        <span>{uploadProgress}%</span>
                    </div>
                )}
            </div>

            {/* Card 2 */}
            <div className="card">
                <img src={Icon2} alt="Semantic Search" />
                <h3>Semantic Search</h3>
                <p>
                    Quickly find relevant SOP information using AI-powered
                    search
                </p>
                <button>Start Searching</button>
            </div>

            {/* Card 3 */}
            <div className="card">
                <img src={Icon3} alt="Admin Dashboard" />
                <h3>Admin Dashboard</h3>
                <p>Manage chatbot activity and SOP documents</p>
                <button>View Dashboard</button>
            </div>
        </section>
    );
}
