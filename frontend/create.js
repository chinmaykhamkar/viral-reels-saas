document.addEventListener('DOMContentLoaded', function() {
    // Get template ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    
    // Template video configuration
    const templates = {
        'template1': {
            videoSrc: './video/template1.mp4',
            name: 'Minecraft Parkour'
        },
        'template2': {
            videoSrc: './video/template2.mp4',
            name: 'Subway Surfers'
        },
        'template3': {
            videoSrc: './video/template3.mp4',
            name: 'Car Stunts'
        }
    };

    // Setup template video
    const templateVideo = document.getElementById('templateVideo');
    const templateName = document.getElementById('templateName');
    
    if (templateId && templates[templateId]) {
        templateVideo.src = templates[templateId].videoSrc;
        templateName.textContent = templates[templateId].name;
    } else {
        window.location.href = 'index.html'; // Redirect if no valid template
    }

    // Setup video hover interaction
    const previewContainer = templateVideo.parentElement;
    const overlay = previewContainer.querySelector('.preview-overlay');

    previewContainer.addEventListener('mouseenter', () => {
        overlay.style.opacity = '0';
        templateVideo.play().catch(console.error);
    });

    previewContainer.addEventListener('mouseleave', () => {
        overlay.style.opacity = '1';
        templateVideo.pause();
        templateVideo.currentTime = 0;
    });

    // Form handling
    const generateButton = document.getElementById('generateButton');
    const contentInput = document.getElementById('contentInput');
    const isRedditPost = document.getElementById('isRedditPost');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const outputSection = document.getElementById('outputSection');
    const outputVideoContainer = document.getElementById('videoContainer');
    const outputVideo = document.getElementById('outputVideo');

    generateButton.addEventListener('click', async () => {
        const content = contentInput.value.trim();
        if (!content) {
            alert('Please enter some content first');
            return;
        }

        // Show loading state
        generateButton.disabled = true;
        outputSection.classList.remove('hidden');
        loadingIndicator.classList.remove('hidden');
        outputVideoContainer.classList.add('hidden');

        try {
            // Call the process-video API
            const response = await fetch('/process-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoId: templateId,
                    text: content,
                    isRedditPost: isRedditPost.checked
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Show the processed video
                outputVideo.src = `/video/${templateId}`;
                loadingIndicator.classList.add('hidden');
                outputVideoContainer.classList.remove('hidden');
            } else {
                throw new Error(data.error || 'Failed to generate video');
            }
        } catch (error) {
            alert('Error generating video: ' + error.message);
            loadingIndicator.classList.add('hidden');
        } finally {
            generateButton.disabled = false;
        }
    });
});