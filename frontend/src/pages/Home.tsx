import { useState } from "react";
import axios from "axios";

import "./Home.css"
import type { TestRequestType, TestResponseType } from "@shared/DTOs";

const Home = () => {
    const [stringg, setStringg] = useState<string>("");
    const [numberr, setNumberr] = useState<number>(0);
    const [response, setResponse] = useState<string | null>(null);
   
    // here data (the body) is typed, which reflects the schema of the fetched endpoint, type = DTO
    // if passed object doesn't match the DTO (the type) it will error, but only at compile time
    // i.e. no runtime validation unless zod.parse() is called, which does runtime validation
    const handleSend = async (body: TestRequestType) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/test`, body);
            const data: TestResponseType = res.data;
            setResponse(data.message);
        }
        catch (e: any) {
            setResponse(e.response?.status + e.message);
        }
    }

    return (
        <div className="template-form">
            <h2 className="bg-decorated-rounded">Send data to backend following the defined schema</h2>
            <input value={stringg}
            type="text"
            onChange={(e) => setStringg(e.target.value)}
            />
            <input value={numberr}
            type="number"
            onChange={(e) => setNumberr(parseInt(e.target.value))}
            />
            <button
            onClick={() => handleSend({stringg: stringg, numberr: numberr})}> 
            Send
            </button>
            {response && (
            <div className="bg-decorated-rounded">
                <p>{response}</p>
            </div>
            )}
        </div>
    )
}

export default Home;
