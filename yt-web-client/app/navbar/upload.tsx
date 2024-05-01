'use client'

import { Fragment, useState, CSSProperties } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { uploadVideo } from "../firebase/functions";

import styles from "./upload.module.css";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "black",
};

interface SpinnerProps {
    color: string;
    loading: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ color, loading }) => {
    return (
        <ClipLoader
            color={color}
            loading={loading}
            cssOverride={override}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
        />
    );
};

export default function Upload() {
    let [isLoading, setLoading] = useState(false);
    let [color, setColor] = useState("#ffffff");

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.item(0)
        if (file) {
            setLoading(true);
            await handleUpload(file);
            setLoading(false);
        }
    }
    
    const handleUpload = async (file: File) => {
        try {
            const response = await uploadVideo(file);
            alert(`Video uploaded successfully! Response: ${JSON.stringify(response)}`);
        } catch (error) {
            alert(`Error uploading video: ${error}`);
            console.error(error);
        }
    }

    return (
        <Fragment>
            <input id="upload" className={styles.uploadInput} type="file" accept="video/*" 
                onChange={handleFileChange}
            />
            {isLoading && <Spinner color={color} loading={isLoading} />}
            {
            !isLoading &&<label htmlFor="upload" className={styles.uploadButton}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
            </label>
            }
        </Fragment>
    );
}