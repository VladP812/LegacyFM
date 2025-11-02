
export const TestAudioPage = () => {
    return (<div>
            <audio
            controls
            autoPlay
            src={`${import.meta.env.VITE_BACKEND_URL}/radio?id=1`}
            />
            </div>
    );
};

export default TestAudioPage;
