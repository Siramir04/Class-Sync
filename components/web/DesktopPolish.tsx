// components/web/DesktopPolish.tsx
// Injects web-only CSS for desktop polish: scrollbars, cursors, focus, smooth scroll
import React from 'react';
import { Platform } from 'react-native';

/**
 * Injects a <style> tag with desktop-specific CSS polish.
 * Only renders on web — returns null on native.
 */
export default function DesktopPolish() {
    if (Platform.OS !== 'web') return null;

    const css = `
        /* === ClassSync Desktop Polish === */

        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }

        /* Custom scrollbar — slim & themed */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.15);
            border-radius: 4px;
            border: 2px solid transparent;
            background-clip: content-box;
        }
        ::-webkit-scrollbar-thumb:hover {
            background-color: rgba(0, 0, 0, 0.25);
        }

        /* Dark mode scrollbar */
        @media (prefers-color-scheme: dark) {
            ::-webkit-scrollbar-thumb {
                background-color: rgba(255, 255, 255, 0.12);
            }
            ::-webkit-scrollbar-thumb:hover {
                background-color: rgba(255, 255, 255, 0.22);
            }
        }

        /* Firefox scrollbar */
        * {
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
        }
        @media (prefers-color-scheme: dark) {
            * {
                scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
            }
        }

        /* Pointer cursor on interactive elements */
        [role="button"],
        [data-focusable="true"],
        button,
        a,
        [tabindex="0"] {
            cursor: pointer !important;
        }

        /* Keyboard focus rings for accessibility */
        *:focus-visible {
            outline: 2px solid #007AFF;
            outline-offset: 2px;
            border-radius: 4px;
        }

        /* Remove default focus outline for mouse users */
        *:focus:not(:focus-visible) {
            outline: none;
        }

        /* Selection styling */
        ::selection {
            background-color: rgba(0, 122, 255, 0.2);
        }

        /* Disable user-select on nav labels for native feel */
        nav, [data-sidebar] {
            user-select: none;
            -webkit-user-select: none;
        }

        /* Transition for hover effects */
        [role="button"],
        button {
            transition: background-color 0.15s ease, opacity 0.15s ease, transform 0.1s ease;
        }
    `;

    return (
        <style
            dangerouslySetInnerHTML={{ __html: css }}
        />
    );
}
