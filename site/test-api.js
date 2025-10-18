const testProcessingAPI = async () => {
    try {
        console.warn('🧪 Testing dual-path recording API...');
    
        const testData = {
            frameData: [
                {
                    timestamp: Date.now(),
                    recordingTime: 0.1,
                    canvasWidth: 800,
                    canvasHeight: 800,
                    mascotState: null,
                    emotion: 'happy',
                    undertone: null,
                    audioTime: 0.1,
                    audioPlaying: true,
                    particleCount: 12,
                    canvasSnapshot: 'data:image/png;base64,test'
                },
                {
                    timestamp: Date.now() + 100,
                    recordingTime: 0.2,
                    canvasWidth: 800,
                    canvasHeight: 800,
                    mascotState: null,
                    emotion: 'happy',
                    undertone: null,
                    audioTime: 0.2,
                    audioPlaying: true,
                    particleCount: 15,
                    canvasSnapshot: 'data:image/png;base64,test'
                }
            ],
            trackInfo: {
                path: '/assets/tracks/music/electric-glow-f.wav',
                name: 'Electric Glow (Female)'
            },
            canvasResolution: {
                width: 800,
                height: 800
            },
            duration: 2.0,
            timestamp: Date.now()
        };
    
        const response = await fetch('http://localhost:3000/api/process-recording', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
    
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
    
        const result = await response.json();
        console.warn('✅ Processing API test successful:', result);
    
        // Wait a bit and check job status
        if (result.jobId) {
            setTimeout(async () => {
                const statusResponse = await fetch(`http://localhost:3000/api/process-recording?jobId=${result.jobId}`);
                const statusResult = await statusResponse.json();
                console.warn('📊 Job status:', statusResult);
            }, 2000);
        }
    
    } catch (error) {
        console.error('❌ API test failed:', error);
    }
};

// Check if development server is running
fetch('http://localhost:3000')
    .then(() => {
        console.warn('🚀 Development server is running, testing API...');
        testProcessingAPI();
    })
    .catch(() => {
        console.warn('⚠️  Development server not running. Please run "npm run dev" first.');
    });

