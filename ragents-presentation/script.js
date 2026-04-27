let currentSlide = 1;
const totalSlides = 8;

function changeSlide(direction) {
    const prevSlide = document.getElementById(`slide-${currentSlide}`);
    prevSlide.classList.remove('active');

    // Set exit direction
    if (direction > 0) {
        prevSlide.style.transform = 'translateX(-60px) scale(0.98)';
    } else {
        prevSlide.style.transform = 'translateX(60px) scale(0.98)';
    }

    currentSlide += direction;
    if (currentSlide > totalSlides) currentSlide = 1;
    if (currentSlide < 1) currentSlide = totalSlides;

    const nextSlide = document.getElementById(`slide-${currentSlide}`);

    // Set entry position
    if (direction > 0) {
        nextSlide.style.transform = 'translateX(60px) scale(0.98)';
    } else {
        nextSlide.style.transform = 'translateX(-60px) scale(0.98)';
    }

    // Force reflow
    nextSlide.offsetHeight;

    nextSlide.classList.add('active');
    nextSlide.scrollTop = 0;

    // Update counter
    updateCounter();
}

function updateCounter() {
    const counter = document.getElementById('slideCounter');
    if (counter) {
        counter.textContent = `${String(currentSlide).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
    }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        changeSlide(1);
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        changeSlide(-1);
    }
});

// Chart Initialization
document.addEventListener('DOMContentLoaded', function () {
    updateCounter();

    // Stacked Bar: Custom vs Public breakdown
    const stackedCtx = document.getElementById('assetsStackedChart');
    if (!stackedCtx) return;

    const ctx = stackedCtx.getContext('2d');

    const stackedData = {
        labels: ['Agents', 'Instructions', 'Prompts', 'Skills'],
        datasets: [
            {
                label: 'Custom',
                data: [30, 1, 5, 1],
                backgroundColor: 'rgba(161, 0, 255, 0.65)',
                borderColor: 'rgba(161, 0, 255, 1)',
                borderWidth: 1,
                borderRadius: 4,
            },
            {
                label: 'Public',
                data: [53, 38, 21, 28],
                backgroundColor: 'rgba(0, 112, 173, 0.55)',
                borderColor: 'rgba(0, 112, 173, 1)',
                borderWidth: 1,
                borderRadius: 4,
            }
        ]
    };

    const stackedConfig = {
        type: 'bar',
        data: stackedData,
        options: {
            responsive: true,
            animation: {
                duration: 1200,
                easing: 'easeOutQuart',
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#4A4A5A',
                        font: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            weight: 600,
                            size: 12,
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#4A4A5A',
                        font: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            weight: 600,
                        }
                    },
                    grid: { color: 'rgba(161, 0, 255, 0.06)' },
                    border: { color: 'rgba(0, 0, 0, 0.08)' }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: '#4A4A5A',
                        font: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            weight: 600,
                        }
                    },
                    grid: { color: 'rgba(161, 0, 255, 0.06)' },
                    border: { color: 'rgba(0, 0, 0, 0.08)' }
                }
            }
        }
    };

    new Chart(ctx, stackedConfig);
});
