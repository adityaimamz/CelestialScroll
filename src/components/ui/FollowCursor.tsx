'use client';

import React, { useEffect } from 'react';

interface FollowCursorProps {
    color?: string;
    zIndex?: number;
}

const FollowCursor: React.FC<FollowCursorProps> = ({
    color = '#323232a6',
    zIndex,
}) => {
    useEffect(() => {
        let canvas: HTMLCanvasElement;
        let context: CanvasRenderingContext2D | null;
        let animationFrame: number;
        let width = window.innerWidth;
        let height = window.innerHeight;
        let cursor = { x: width / 2, y: height / 2 };
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        );

        class Dot {
            position: { x: number; y: number };
            width: number;
            lag: number;

            constructor(x: number, y: number, width: number, lag: number) {
                this.position = { x, y };
                this.width = width;
                this.lag = lag;
            }

            moveTowards(x: number, y: number, context: CanvasRenderingContext2D) {
                this.position.x += (x - this.position.x) / this.lag;
                this.position.y += (y - this.position.y) / this.lag;
                context.fillStyle = color;
                context.beginPath();
                context.arc(
                    this.position.x,
                    this.position.y,
                    this.width,
                    0,
                    2 * Math.PI
                );
                context.fill();
                context.closePath();
            }
        }

        const dot = new Dot(width / 2, height / 2, 10, 10);

        const onMouseMove = (e: MouseEvent) => {
            cursor.x = e.clientX;
            cursor.y = e.clientY;
        };

        const onWindowResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            if (canvas) {
                canvas.width = width;
                canvas.height = height;
            }
        };

        const updateDot = () => {
            if (context) {
                context.clearRect(0, 0, width, height);
                dot.moveTowards(cursor.x, cursor.y, context);
            }
        };

        const loop = () => {
            updateDot();
            animationFrame = requestAnimationFrame(loop);
        };

        const init = () => {
            if (prefersReducedMotion.matches) {
                console.log('Reduced motion enabled, cursor effect skipped.');
                return;
            }


            const isDesktop = window.matchMedia("(min-width: 768px)").matches &&
                window.matchMedia("(hover: hover) and (pointer: fine)").matches;

            if (!isDesktop) {
                return;
            }

            canvas = document.createElement('canvas');
            context = canvas.getContext('2d');
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.pointerEvents = 'none';
            canvas.width = width;
            canvas.height = height;
            canvas.style.zIndex = zIndex ? zIndex.toString() : '9999'; // Default z-index if not provided
            document.body.appendChild(canvas);

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('resize', onWindowResize);
            loop();
        };

        const destroy = () => {
            if (canvas) canvas.remove();
            cancelAnimationFrame(animationFrame);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onWindowResize);
        };

        prefersReducedMotion.onchange = () => {
            if (prefersReducedMotion.matches) {
                destroy();
            } else {
                init();
            }
        };

        // Re-init on resize to handle orientation changes or desktop window resizing
        const handleResizeCheck = () => {
            const isDesktop = window.matchMedia("(min-width: 768px)").matches &&
                window.matchMedia("(hover: hover) and (pointer: fine)").matches;

            if (isDesktop && !canvas) {
                init();
            } else if (!isDesktop && canvas) {
                destroy();
            } else if (canvas) {
                onWindowResize(); // Standard resize if canvas exists
            }
        };

        init();
        window.addEventListener('resize', handleResizeCheck);

        return () => {
            destroy();
            window.removeEventListener('resize', handleResizeCheck);
        };


    }, [color, zIndex]);

    return null; // This component doesn't render any visible JSX
};

export default FollowCursor;
