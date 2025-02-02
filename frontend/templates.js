document.addEventListener('DOMContentLoaded', function() {
    // Template video configurations
    const templates = [
        {
            id: 'template1',
            videoSrc: 'template1.mp4',
            name: 'Mincreaft Parkour'
        },
        {
            id: 'template2',
            videoSrc: 'video/template2.mp4',
            name: 'Subway Surfers'
        },
        {
            id: 'template3',
            videoSrc: 'video/template3.mp4',
            name: 'Car Stunts'
        }
    ];

    // Create and insert template cards
    const templateGrid = document.querySelector('#templates .grid');
    templates.forEach(template => {
        const card = createTemplateCard(template);
        templateGrid.appendChild(card);
    });

    // Set up hover interactions for all cards
    setupVideoInteractions();
});

function createTemplateCard(template) {
    const card = document.createElement('div');
    card.className = 'video-template-card bg-neutral-900 rounded-xl overflow-hidden';
    card.innerHTML = `
        <div class="relative" style="aspect-ratio: 9/16;">
            <div class="w-full h-full flex items-center justify-center">
                <video 
                    class="w-full h-full object-cover" 
                    src="./video/${template.videoSrc}"
                    muted 
                    loop 
                    preload="metadata"
                ></video>
                <div class="preview-overlay absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span class="text-white">Hover to preview</span>
                </div>
            </div>
        </div>
        <div class="p-4">
            <h3 class="text-xl font-bold text-white mb-2">${template.name}</h3>
            <button class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                Use Template
            </button>
        </div>
    `;
    return card;
}

function setupVideoInteractions() {
    const cards = document.querySelectorAll('.video-template-card');
    
    cards.forEach(card => {
        const video = card.querySelector('video');
        const overlay = card.querySelector('.preview-overlay');

        // Play video on hover
        card.addEventListener('mouseenter', () => {
            overlay.style.opacity = '0';
            video.play().catch(err => {
                console.log('Video play failed:', err);
            });
        });

        // Pause and show overlay when mouse leaves
        card.addEventListener('mouseleave', () => {
            overlay.style.opacity = '1';
            video.pause();
            video.currentTime = 0;
        });

        // Handle video loading errors
        video.addEventListener('error', () => {
            overlay.innerHTML = '<span class="text-white">Video unavailable</span>';
        });
    });
}