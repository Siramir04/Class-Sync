// components/web/DesktopPolish.tsx
// Web-only CSS for desktop polish: teal design system
import React from 'react';
import { Platform } from 'react-native';

/**
 * Injects a <style> tag with desktop-specific CSS polish.
 * Only renders on web — returns null on native.
 */
export default function DesktopPolish() {
    if (Platform.OS !== 'web') return null;

    const css = `
        /* === ClassSync Desktop Polish — Teal Design System === */

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
            background-color: rgba(15, 76, 92, 0.15);
            border-radius: 4px;
            border: 2px solid transparent;
            background-clip: content-box;
        }
        ::-webkit-scrollbar-thumb:hover {
            background-color: rgba(15, 76, 92, 0.30);
        }

        /* Dark mode scrollbar */
        @media (prefers-color-scheme: dark) {
            ::-webkit-scrollbar-thumb {
                background-color: rgba(56, 178, 172, 0.15);
            }
            ::-webkit-scrollbar-thumb:hover {
                background-color: rgba(56, 178, 172, 0.25);
            }
        }

        /* Firefox scrollbar */
        * {
            scrollbar-width: thin;
            scrollbar-color: rgba(15, 76, 92, 0.15) transparent;
        }
        @media (prefers-color-scheme: dark) {
            * {
                scrollbar-color: rgba(56, 178, 172, 0.15) transparent;
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

        /* Keyboard focus rings for accessibility — teal */
        *:focus-visible {
            outline: 2px solid #38B2AC;
            outline-offset: 2px;
            border-radius: 4px;
        }

        /* Remove default focus outline for mouse users */
        *:focus:not(:focus-visible) {
            outline: none;
        }

        /* Selection styling — teal */
        ::selection {
            background-color: rgba(56, 178, 172, 0.2);
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

        /* Card hover micro-interaction */
        [data-card="true"] {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        [data-card="true"]:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px -5px rgba(0,0,0,0.08);
        }

        /* Progress bar fill animation */
        [data-progress] {
            transition: width 0.5s ease-out;
        }

        /* Page content fade-in */
        [data-page-content] {
            animation: fadeIn 0.15s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* Toast / notification slide */
        [data-toast] {
            animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;

    return (
        <style
            dangerouslySetInnerHTML={{ __html: css }}
        />
    );
}
