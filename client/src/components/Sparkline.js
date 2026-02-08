import React from 'react';

const Sparkline = ({ data, colorClass, width = 120, height = 50 }) => {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Add some padding to the top/bottom so points aren't cut off
    const padding = 8;
    const effectiveHeight = height - (padding * 2);

    // Calculate points
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = padding + effectiveHeight - ((val - min) / range) * effectiveHeight;
        return { x, y };
    });

    // Create path string for the line
    const linePath = points.map(p => `${p.x},${p.y}`).join('L');
    const pathD = `M${linePath}`;

    // Create area path (closes the loop at the bottom)
    const areaD = `${pathD} L${width},${height} L0,${height} Z`;

    // Define colors based on class - NEON / HIGH VISIBILITY
    const isIncome = colorClass === 'income';
    const strokeColor = isIncome ? '#4ade80' : '#f43f5e'; // Green-400 (Neon-ish) or Rose-500 (Bright Red/Pink)
    const gradientId = `gradient-${colorClass}-${Math.random().toString(36).substr(2, 9)}`;
    const filterId = `glow-${colorClass}-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="sparkline-wrapper" style={{ width: `${width}px`, height: `${height}px` }}>
            <svg
                className="sparkline-svg"
                viewBox={`0 0 ${width} ${height}`}
                style={{ overflow: 'visible' }}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={strokeColor} stopOpacity="0.1" />
                    </linearGradient>
                    <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Area Fill */}
                <path
                    d={areaD}
                    fill={`url(#${gradientId})`}
                    stroke="none"
                />

                {/* Line Ends - Zig Zag Stroke with GLOW */}
                <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={`url(#${filterId})`}
                />

                {/* Data Points (Dots) with GLOW */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill="#fff"
                        stroke={strokeColor}
                        strokeWidth="2"
                        filter={`url(#${filterId})`}
                    />
                ))}
            </svg>
        </div>
    );
};

export default Sparkline;
