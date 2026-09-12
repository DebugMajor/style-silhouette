import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Avatar3D from '../components/Avatar3D'

/* ==========================================================================
   FASHION CLOTHING LIBRARY (39 ITEMS WITH BODY-AWARE ANCHOR METADATA)
   ========================================================================== */
const FASHION_LIBRARY = [
    // ── TOPS ──
    {
        id: 'top-1',
        name: 'White T-Shirt',
        category: 'Tops',
        color: 'White',
        style: 'Casual',
        anchor: 'torso',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.28 },
        defaultW: 220, defaultH: 220,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M80,30 Q150,55 220,30 L280,90 L240,130 L220,105 L220,280 L80,280 L80,105 L60,130 L20,90 Z" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="4"/><path d="M110,30 Q150,70 190,30" fill="none" stroke="%2394a3b8" stroke-width="3"/></svg>`,
    },
    {
        id: 'top-2',
        name: 'Black T-Shirt',
        category: 'Tops',
        color: 'Black',
        style: 'Streetwear',
        anchor: 'torso',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.28 },
        defaultW: 220, defaultH: 220,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M80,30 Q150,55 220,30 L280,90 L240,130 L220,105 L220,280 L80,280 L80,105 L60,130 L20,90 Z" fill="%230f172a" stroke="%23334155" stroke-width="4"/><path d="M110,30 Q150,70 190,30" fill="none" stroke="%23475569" stroke-width="3"/></svg>`,
    },
    {
        id: 'top-3',
        name: 'Oversized T-Shirt',
        category: 'Tops',
        color: 'Sage Green',
        style: 'Oversized',
        anchor: 'torso',
        defaultScale: 0.9,
        defaultPosition: { x: 0.5, y: 0.28 },
        defaultW: 240, defaultH: 240,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M70,30 Q150,55 230,30 L290,105 L245,145 L225,115 L225,285 L75,285 L75,115 L55,145 L10,105 Z" fill="%23334e44" stroke="%231e2e28" stroke-width="4"/><path d="M105,30 Q150,70 195,30" fill="none" stroke="%234f7365" stroke-width="3"/></svg>`,
    },
    {
        id: 'top-4',
        name: 'Polo Shirt',
        category: 'Tops',
        color: 'Navy Blue',
        style: 'Smart Casual',
        anchor: 'torso',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.28 },
        defaultW: 220, defaultH: 220,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M80,30 Q150,50 220,30 L275,90 L235,130 L215,105 L215,280 L85,280 L85,105 L65,130 L25,90 Z" fill="%231e3a8a" stroke="%231e293b" stroke-width="4"/><polygon points="120,30 150,85 180,30" fill="%23172554"/><circle cx="150" cy="95" r="3" fill="%23ffffff"/><circle cx="150" cy="115" r="3" fill="%23ffffff"/></svg>`,
    },
    {
        id: 'top-5',
        name: 'Casual Shirt',
        category: 'Tops',
        color: 'Light Blue',
        style: 'Casual',
        anchor: 'torso',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.28 },
        defaultW: 230, defaultH: 240,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M75,30 Q150,50 225,30 L280,95 L235,135 L215,110 L215,285 L85,285 L85,110 L65,135 L20,95 Z" fill="%2338bdf8" stroke="%230284c7" stroke-width="4"/><path d="M150,50 L150,285" stroke="%230284c7" stroke-width="3"/><polygon points="120,30 150,80 180,30" fill="%230284c7"/></svg>`,
    },
    {
        id: 'top-6',
        name: 'Formal Shirt',
        category: 'Tops',
        color: 'Pure White',
        style: 'Formal',
        anchor: 'torso',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.28 },
        defaultW: 230, defaultH: 240,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M75,30 Q150,45 225,30 L280,95 L235,135 L215,110 L215,285 L85,285 L85,110 L65,135 L20,95 Z" fill="%23f8fafc" stroke="%2394a3b8" stroke-width="4"/><polygon points="115,25 150,75 185,25" fill="%23e2e8f0" stroke="%2394a3b8" stroke-width="2"/><path d="M150,75 L150,285" stroke="%23cbd5e1" stroke-width="2"/></svg>`,
    },
    {
        id: 'top-7',
        name: 'Denim Shirt',
        category: 'Tops',
        color: 'Indigo Blue',
        style: 'Rugged',
        anchor: 'torso',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.28 },
        defaultW: 230, defaultH: 240,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M75,30 Q150,50 225,30 L280,95 L235,135 L215,110 L215,285 L85,285 L85,110 L65,135 L20,95 Z" fill="%232563eb" stroke="%231d4ed8" stroke-width="4"/><rect x="100" y="110" width="30" height="35" rx="3" fill="%231d4ed8"/><rect x="170" y="110" width="30" height="35" rx="3" fill="%231d4ed8"/></svg>`,
    },
    {
        id: 'top-8',
        name: 'Flannel Shirt',
        category: 'Tops',
        color: 'Red Plaid',
        style: 'Casual',
        anchor: 'torso',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.28 },
        defaultW: 230, defaultH: 240,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M75,30 Q150,50 225,30 L280,95 L235,135 L215,110 L215,285 L85,285 L85,110 L65,135 L20,95 Z" fill="%23dc2626" stroke="%23991b1b" stroke-width="4"/><path d="M75,100 L225,100 M75,170 L225,170 M75,240 L225,240" stroke="%231e293b" stroke-width="4"/><path d="M120,30 L120,285 M180,30 L180,285" stroke="%231e293b" stroke-width="4"/></svg>`,
    },

    // ── OUTERWEAR ──
    {
        id: 'out-1',
        name: 'Beige Hoodie',
        category: 'Outerwear',
        color: 'Beige',
        style: 'Cozy Streetwear',
        anchor: 'torso',
        defaultScale: 0.9,
        defaultPosition: { x: 0.5, y: 0.26 },
        defaultW: 240, defaultH: 250,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320"><path d="M90,50 Q150,15 210,50 Q240,25 210,10 Q150,-10 90,10 Q60,25 90,50 Z" fill="%23e2e8f0" stroke="%23cbd5e1" stroke-width="3"/><path d="M70,50 Q150,25 230,50 L285,120 L240,160 L220,130 L220,295 L80,295 L80,130 L60,160 L15,120 Z" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="4"/><path d="M110,210 L190,210 L200,270 L100,270 Z" fill="%23e2e8f0" stroke="%23cbd5e1" stroke-width="3"/></svg>`,
    },
    {
        id: 'out-2',
        name: 'Black Hoodie',
        category: 'Outerwear',
        color: 'Jet Black',
        style: 'Minimalist',
        anchor: 'torso',
        defaultScale: 0.9,
        defaultPosition: { x: 0.5, y: 0.26 },
        defaultW: 240, defaultH: 250,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320"><path d="M90,50 Q150,15 210,50 Q240,25 210,10 Q150,-10 90,10 Q60,25 90,50 Z" fill="%231e293b" stroke="%230f172a" stroke-width="3"/><path d="M70,50 Q150,25 230,50 L285,120 L240,160 L220,130 L220,295 L80,295 L80,130 L60,160 L15,120 Z" fill="%230f172a" stroke="%23334155" stroke-width="4"/><path d="M110,210 L190,210 L200,270 L100,270 Z" fill="%231e293b" stroke="%23334155" stroke-width="3"/></svg>`,
    },
    {
        id: 'out-3',
        name: 'Oversized Hoodie',
        category: 'Outerwear',
        color: 'Charcoal',
        style: 'Oversized',
        anchor: 'torso',
        defaultScale: 0.95,
        defaultPosition: { x: 0.5, y: 0.26 },
        defaultW: 250, defaultH: 260,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320"><path d="M60,50 Q150,25 240,50 L295,130 L245,170 L225,135 L225,300 L75,300 L75,135 L55,170 L5,130 Z" fill="%23334155" stroke="%231e293b" stroke-width="4"/><path d="M100,210 L200,210 L210,280 L90,280 Z" fill="%231e293b" stroke="%23475569" stroke-width="3"/></svg>`,
    },
    {
        id: 'out-4',
        name: 'Denim Jacket',
        category: 'Outerwear',
        color: 'Classic Denim',
        style: 'Vintage',
        anchor: 'torso',
        defaultScale: 0.9,
        defaultPosition: { x: 0.5, y: 0.26 },
        defaultW: 240, defaultH: 250,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320"><path d="M70,40 Q150,20 230,40 L285,115 L245,290 L185,290 L150,150 L115,290 L55,290 L15,115 Z" fill="%233b82f6" stroke="%231d4ed8" stroke-width="5"/><path d="M110,40 L150,130 L190,40" fill="none" stroke="%23ffffff" stroke-width="3"/></svg>`,
    },
    {
        id: 'out-5',
        name: 'Bomber Jacket',
        category: 'Outerwear',
        color: 'Olive Green',
        style: 'Military',
        anchor: 'torso',
        defaultScale: 0.9,
        defaultPosition: { x: 0.5, y: 0.26 },
        defaultW: 245, defaultH: 250,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320"><path d="M70,40 Q150,20 230,40 L285,120 L240,290 L60,290 L15,120 Z" fill="%233f6212" stroke="%231a2e05" stroke-width="5"/><path d="M150,40 L150,290" stroke="%2384cc16" stroke-width="4"/><rect x="80" y="140" width="35" height="40" rx="4" fill="%231a2e05"/></svg>`,
    },
    {
        id: 'out-6',
        name: 'Leather Jacket',
        category: 'Outerwear',
        color: 'Black Leather',
        style: 'Biker',
        anchor: 'torso',
        defaultScale: 0.9,
        defaultPosition: { x: 0.5, y: 0.26 },
        defaultW: 240, defaultH: 250,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 320"><path d="M75,40 Q150,15 225,40 L275,110 L240,290 L60,290 L25,110 Z" fill="%2309090b" stroke="%2327272a" stroke-width="5"/><path d="M125,40 L180,290" stroke="%2394a3b8" stroke-width="4"/><circle cx="150" cy="160" r="6" fill="%23e2e8f0"/></svg>`,
    },
    {
        id: 'out-7',
        name: 'Blazer',
        category: 'Outerwear',
        color: 'Camel Brown',
        style: 'Tailored',
        anchor: 'torso',
        defaultScale: 0.9,
        defaultPosition: { x: 0.5, y: 0.26 },
        defaultW: 240, defaultH: 260,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 340"><path d="M70,30 Q150,10 230,30 L285,115 L245,310 L55,310 L15,115 Z" fill="%239a3412" stroke="%237c2d12" stroke-width="5"/><path d="M70,30 L135,170 L150,150 L165,170 L230,30" fill="%237c2d12" stroke="%23ffffff" stroke-width="2"/><circle cx="150" cy="220" r="5" fill="%23ffffff"/></svg>`,
    },
    {
        id: 'out-8',
        name: 'Trench Coat',
        category: 'Outerwear',
        color: 'Khaki Tan',
        style: 'Classic Formal',
        anchor: 'torso',
        defaultScale: 0.95,
        defaultPosition: { x: 0.5, y: 0.28 },
        defaultW: 240, defaultH: 300,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><path d="M70,30 Q150,10 230,30 L285,115 L250,380 L50,380 L15,115 Z" fill="%23d97706" stroke="%23b45309" stroke-width="5"/><rect x="70" y="220" width="160" height="20" fill="%2392400e"/></svg>`,
    },

    // ── BOTTOMS ──
    {
        id: 'bot-1',
        name: 'Blue Jeans',
        category: 'Bottoms',
        color: 'Wash Blue',
        style: 'Denim',
        anchor: 'legs',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.56 },
        defaultW: 180, defaultH: 260,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320"><path d="M30,10 L170,10 L190,300 L115,300 L100,100 L85,300 L10,300 Z" fill="%232563eb" stroke="%231d4ed8" stroke-width="4"/><path d="M30,10 L170,10" stroke="%23f59e0b" stroke-width="4"/></svg>`,
    },
    {
        id: 'bot-2',
        name: 'Black Jeans',
        category: 'Bottoms',
        color: 'Black',
        style: 'Slim Fit',
        anchor: 'legs',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.56 },
        defaultW: 175, defaultH: 260,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320"><path d="M30,10 L170,10 L185,300 L112,300 L100,100 L88,300 L15,300 Z" fill="%230f172a" stroke="%23334155" stroke-width="4"/></svg>`,
    },
    {
        id: 'bot-3',
        name: 'Straight Jeans',
        category: 'Bottoms',
        color: 'Dark Indigo',
        style: 'Classic',
        anchor: 'legs',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.56 },
        defaultW: 180, defaultH: 260,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320"><path d="M30,10 L170,10 L188,300 L115,300 L100,95 L85,300 L12,300 Z" fill="%231d4ed8" stroke="%231e40af" stroke-width="4"/></svg>`,
    },
    {
        id: 'bot-4',
        name: 'Baggy Jeans',
        category: 'Bottoms',
        color: 'Light Wash',
        style: 'Streetwear',
        anchor: 'legs',
        defaultScale: 0.9,
        defaultPosition: { x: 0.5, y: 0.56 },
        defaultW: 195, defaultH: 260,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320"><path d="M20,10 L180,10 L195,300 L118,300 L100,90 L82,300 L5,300 Z" fill="%2360a5fa" stroke="%233b82f6" stroke-width="4"/></svg>`,
    },
    {
        id: 'bot-5',
        name: 'Formal Trousers',
        category: 'Bottoms',
        color: 'Charcoal Grey',
        style: 'Formal',
        anchor: 'legs',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.56 },
        defaultW: 180, defaultH: 260,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320"><path d="M30,10 L170,10 L185,300 L115,300 L100,95 L85,300 L15,300 Z" fill="%23334155" stroke="%231e293b" stroke-width="4"/><path d="M60,10 L60,300 M140,10 L140,300" stroke="%23475569" stroke-dasharray="4,4"/></svg>`,
    },
    {
        id: 'bot-6',
        name: 'Cargo Pants',
        category: 'Bottoms',
        color: 'Olive Green',
        style: 'Utility',
        anchor: 'legs',
        defaultScale: 0.88,
        defaultPosition: { x: 0.5, y: 0.56 },
        defaultW: 188, defaultH: 260,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320"><path d="M25,10 L175,10 L190,300 L115,300 L100,95 L85,300 L10,300 Z" fill="%233f6212" stroke="%231a2e05" stroke-width="4"/><rect x="25" y="120" width="30" height="40" rx="3" fill="%231a2e05"/><rect x="145" y="120" width="30" height="40" rx="3" fill="%231a2e05"/></svg>`,
    },
    {
        id: 'bot-7',
        name: 'Chinos',
        category: 'Bottoms',
        color: 'Beige Khaki',
        style: 'Smart Casual',
        anchor: 'legs',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.56 },
        defaultW: 180, defaultH: 260,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320"><path d="M30,10 L170,10 L185,300 L115,300 L100,95 L85,300 L15,300 Z" fill="%23d97706" stroke="%23b45309" stroke-width="4"/></svg>`,
    },
    {
        id: 'bot-8',
        name: 'Shorts',
        category: 'Bottoms',
        color: 'Navy Blue',
        style: 'Summer',
        anchor: 'legs',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.52 },
        defaultW: 180, defaultH: 140,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160"><path d="M25,10 L175,10 L185,150 L115,150 L100,70 L85,150 L15,150 Z" fill="%231e3a8a" stroke="%23172554" stroke-width="4"/></svg>`,
    },

    // ── TRADITIONAL ──
    {
        id: 'trad-1',
        name: 'Kurta',
        category: 'Traditional',
        color: 'Royal White',
        style: 'Ethnic',
        anchor: 'torso',
        defaultScale: 0.9,
        defaultPosition: { x: 0.5, y: 0.30 },
        defaultW: 230, defaultH: 290,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360"><path d="M80,30 Q150,50 220,30 L275,95 L235,135 L215,110 L215,340 L85,340 L85,110 L65,135 L25,95 Z" fill="%23f8fafc" stroke="%2394a3b8" stroke-width="4"/><path d="M150,45 L150,180" stroke="%2338bdf8" stroke-width="3"/></svg>`,
    },
    {
        id: 'trad-2',
        name: 'Nehru Jacket',
        category: 'Traditional',
        color: 'Maroon Gold',
        style: 'Festive',
        anchor: 'torso',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.28 },
        defaultW: 220, defaultH: 220,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M85,30 Q150,15 215,30 L255,100 L225,275 L75,275 L45,100 Z" fill="%23881337" stroke="%234c0519" stroke-width="5"/><rect x="120" y="20" width="60" height="15" fill="%23eab308"/><path d="M150,35 L150,275" stroke="%23eab308" stroke-width="3"/></svg>`,
    },
    {
        id: 'trad-3',
        name: 'Ethnic Jacket',
        category: 'Traditional',
        color: 'Navy Gold',
        style: 'Wedding Wear',
        anchor: 'torso',
        defaultScale: 0.85,
        defaultPosition: { x: 0.5, y: 0.28 },
        defaultW: 220, defaultH: 220,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="M85,30 Q150,15 215,30 L255,100 L225,275 L75,275 L45,100 Z" fill="%231e3a8a" stroke="%23172554" stroke-width="5"/><path d="M150,30 L150,275" stroke="%23eab308" stroke-width="3"/><circle cx="150" cy="80" r="4" fill="%23eab308"/><circle cx="150" cy="130" r="4" fill="%23eab308"/></svg>`,
    },
    {
        id: 'trad-4',
        name: 'Traditional Wear',
        category: 'Traditional',
        color: 'Emerald Green',
        style: 'Royal Ethnic',
        anchor: 'fullbody',
        defaultScale: 0.9,
        defaultPosition: { x: 0.5, y: 0.32 },
        defaultW: 240, defaultH: 320,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380"><path d="M75,30 Q150,10 225,30 L280,100 L240,360 L60,360 L20,100 Z" fill="%23064e3b" stroke="%23022c22" stroke-width="5"/><path d="M150,30 L150,360" stroke="%23eab308" stroke-width="4"/></svg>`,
    },

    // ── DRESSES ──
    {
        id: 'dres-1',
        name: 'Casual Dress',
        category: 'Dresses',
        color: 'Crimson Red',
        style: 'Summer Chic',
        anchor: 'fullbody',
        defaultScale: 0.9,
        defaultPosition: { x: 0.5, y: 0.32 },
        defaultW: 230, defaultH: 310,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380"><path d="M90,30 Q150,50 210,30 L230,120 L270,360 L30,360 L70,120 Z" fill="%23dc2626" stroke="%23991b1b" stroke-width="4"/><path d="M110,30 Q150,70 190,30" fill="none" stroke="%23ffffff" stroke-width="3"/></svg>`,
    },
    {
        id: 'dres-2',
        name: 'Long Dress',
        category: 'Dresses',
        color: 'Midnight Black',
        style: 'Evening Formal',
        anchor: 'fullbody',
        defaultScale: 0.95,
        defaultPosition: { x: 0.5, y: 0.35 },
        defaultW: 240, defaultH: 360,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420"><path d="M95,30 Q150,45 205,30 L225,110 L285,410 L15,410 L75,110 Z" fill="%230f172a" stroke="%23334155" stroke-width="4"/></svg>`,
    },

    // ── SHOES ──
    {
        id: 'shoe-1',
        name: 'White Sneakers',
        category: 'Shoes',
        color: 'White',
        style: 'Minimal',
        anchor: 'feet',
        defaultScale: 0.7,
        defaultPosition: { x: 0.5, y: 0.84 },
        defaultW: 160, defaultH: 80,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120"><path d="M20,70 Q40,30 110,30 Q180,20 220,70 L220,95 Q130,105 20,95 Z" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="4"/><rect x="20" y="90" width="200" height="15" rx="4" fill="%23e2e8f0"/></svg>`,
    },
    {
        id: 'shoe-2',
        name: 'Black Sneakers',
        category: 'Shoes',
        color: 'All Black',
        style: 'Streetwear',
        anchor: 'feet',
        defaultScale: 0.7,
        defaultPosition: { x: 0.5, y: 0.84 },
        defaultW: 160, defaultH: 80,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120"><path d="M20,70 Q40,30 110,30 Q180,20 220,70 L220,95 Q130,105 20,95 Z" fill="%230f172a" stroke="%23334155" stroke-width="4"/><rect x="20" y="90" width="200" height="15" rx="4" fill="%231e293b"/></svg>`,
    },
    {
        id: 'shoe-3',
        name: 'Formal Shoes',
        category: 'Shoes',
        color: 'Brown Leather',
        style: 'Formal',
        anchor: 'feet',
        defaultScale: 0.7,
        defaultPosition: { x: 0.5, y: 0.84 },
        defaultW: 160, defaultH: 80,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120"><path d="M20,75 Q50,35 120,35 Q190,25 225,75 L225,95 Q130,100 20,95 Z" fill="%2378350f" stroke="%23451a03" stroke-width="4"/><rect x="20" y="90" width="205" height="12" rx="3" fill="%23451a03"/></svg>`,
    },
    {
        id: 'shoe-4',
        name: 'Loafers',
        category: 'Shoes',
        color: 'Tan Leather',
        style: 'Smart Casual',
        anchor: 'feet',
        defaultScale: 0.7,
        defaultPosition: { x: 0.5, y: 0.84 },
        defaultW: 160, defaultH: 75,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120"><path d="M20,75 Q60,40 120,40 Q190,30 225,75 L225,95 Q130,100 20,95 Z" fill="%23b45309" stroke="%2378350f" stroke-width="4"/></svg>`,
    },
    {
        id: 'shoe-5',
        name: 'Boots',
        category: 'Shoes',
        color: 'Dark Brown',
        style: 'Rugged',
        anchor: 'feet',
        defaultScale: 0.75,
        defaultPosition: { x: 0.5, y: 0.82 },
        defaultW: 160, defaultH: 100,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 150"><path d="M50,20 L130,20 Q180,30 225,100 L225,125 Q130,130 20,125 L20,70 Z" fill="%23451a03" stroke="%23270d02" stroke-width="4"/></svg>`,
    },

    // ── ACCESSORIES ──
    {
        id: 'acc-1',
        name: 'Cap',
        category: 'Accessories',
        color: 'Navy Blue',
        style: 'Casual',
        anchor: 'head',
        defaultScale: 0.65,
        defaultPosition: { x: 0.5, y: 0.10 },
        defaultW: 140, defaultH: 80,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120"><path d="M50,70 Q120,10 190,70 Z" fill="%231e3a8a" stroke="%23172554" stroke-width="4"/><path d="M190,70 Q240,65 240,85 L180,85 Z" fill="%231e3a8a" stroke="%23172554" stroke-width="3"/></svg>`,
    },
    {
        id: 'acc-2',
        name: 'Sunglasses',
        category: 'Accessories',
        color: 'Black Gold',
        style: 'Luxury',
        anchor: 'head',
        defaultScale: 0.6,
        defaultPosition: { x: 0.5, y: 0.14 },
        defaultW: 130, defaultH: 50,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120"><path d="M20,35 Q75,15 130,35 L135,65 Q85,105 20,80 Z" fill="%230a0a0a" stroke="%233b82f6" stroke-width="5"/><path d="M170,35 Q225,15 280,35 L280,80 Q215,105 165,65 Z" fill="%230a0a0a" stroke="%233b82f6" stroke-width="5"/><rect x="130" y="40" width="35" height="8" rx="4" fill="%233b82f6"/></svg>`,
    },
    {
        id: 'acc-3',
        name: 'Watch',
        category: 'Accessories',
        color: 'Silver Gold',
        style: 'Executive',
        anchor: 'wrist',
        defaultScale: 0.5,
        defaultPosition: { x: 0.3, y: 0.45 },
        defaultW: 80, defaultH: 80,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect x="65" y="10" width="30" height="140" fill="%2394a3b8"/><circle cx="80" cy="80" r="45" fill="%230f172a" stroke="%23e2e8f0" stroke-width="6"/><circle cx="80" cy="80" r="4" fill="%2338bdf8"/></svg>`,
    },
    {
        id: 'acc-4',
        name: 'Backpack',
        category: 'Accessories',
        color: 'Matte Black',
        style: 'Travel',
        anchor: 'back',
        defaultScale: 0.8,
        defaultPosition: { x: 0.5, y: 0.3 },
        defaultW: 160, defaultH: 200,
        imageSrc: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250"><rect x="30" y="40" width="140" height="190" rx="20" fill="%231e293b" stroke="%230f172a" stroke-width="5"/><path d="M70,40 Q100,10 130,40" fill="none" stroke="%23334155" stroke-width="6"/></svg>`,
    },
]

/* Optional Demo Model Option */
const DEMO_MODEL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 620"><rect width="440" height="620" fill="%230f172a"/><circle cx="220" cy="100" r="50" fill="%23334155"/><path d="M195,150 L245,150 L265,200 L175,200 Z" fill="%231e293b"/><path d="M130,200 Q220,185 310,200 L325,380 Q220,410 115,380 Z" fill="%231e293b" stroke="%23334155" stroke-width="4"/><rect x="160" y="380" width="50" height="190" rx="10" fill="%23111827"/><rect x="230" y="380" width="50" height="190" rx="10" fill="%23111827"/><circle cx="220" cy="100" r="40" fill="none" stroke="%232563eb" stroke-width="2" stroke-dasharray="4,4"/><text x="220" y="600" text-anchor="middle" fill="%2338bdf8" font-family="sans-serif" font-size="11" letter-spacing="3">DEMO MODEL PREVIEW</text></svg>`

const CATEGORY_FILTERS = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Traditional', 'Dresses', 'Shoes', 'Accessories']

export default function VirtualTryOn() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    // ── Primary State ──
    const [mode, setMode] = useState('2D')
    const [threeView, setThreeView] = useState('Front')
    const [show3DNotice, setShow3DNotice] = useState(false)
    const [userPhoto, setUserPhoto] = useState(null) // User's real photo Data URL (null until uploaded/captured)
    const [isDemoMode, setIsDemoMode] = useState(false)

    const [overlays, setOverlays] = useState([])
    const [selectedOverlayId, setSelectedOverlayId] = useState(null)
    const [savedHistory, setSavedHistory] = useState([])

    // Left Panel Tabs & Filters
    const [leftTab, setLeftTab] = useState('wardrobe')
    const [leftSearch, setLeftSearch] = useState('')
    const [leftCat, setLeftCat] = useState('All')

    // Right Panel Fashion Library Filters
    const [rightSearch, setRightSearch] = useState('')
    const [rightCat, setRightCat] = useState('All')

    // Feedback & Camera Modal
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' })
    const [saving, setSaving] = useState(false)
    const [showCameraModal, setShowCameraModal] = useState(false)
    const [cameraStream, setCameraStream] = useState(null)
    const videoRef = useRef(null)

    // Canvas references
    const canvasRef = useRef(null)
    const isDraggingRef = useRef(false)
    const dragStartRef = useRef({ x: 0, y: 0 })
    const imageCacheRef = useRef({})

    const selectedOverlay = overlays.find((o) => o.id === selectedOverlayId)

    // Active Base Image calculation: User's real photo takes 100% priority over demo model
    const activeBaseImage = userPhoto || (isDemoMode ? DEMO_MODEL : null)

    // ── Pre-select item from query params ──
    useEffect(() => {
        const itemParam = searchParams.get('item')
        if (itemParam) {
            try {
                const decoded = JSON.parse(decodeURIComponent(itemParam))
                if (decoded && decoded.imageSrc) {
                    addOverlay(decoded)
                }
            } catch (err) {
                console.error('Failed to parse query item parameter:', err)
            }
        }
    }, [searchParams])

    // ── Fetch saved history ──
    const fetchHistory = useCallback(async () => {
        try {
            const res = await axios.get('/api/virtual-tryon/history')
            if (res.data && res.data.data) {
                setSavedHistory(res.data.data)
            }
        } catch {
            // Silently handled if backend offline
        }
    }, [])

    useEffect(() => {
        fetchHistory()
    }, [fetchHistory])

    // Image loader helper
    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            if (imageCacheRef.current[src]) return resolve(imageCacheRef.current[src])
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
                imageCacheRef.current[src] = img
                resolve(img)
            }
            img.onerror = (err) => reject(err)
            img.src = src
        })
    }

    // ── Draw 2D Composition Canvas ──
    const drawCanvas = useCallback(async () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // 1. Render Base Image (User's Real Photo or Demo Model)
        if (activeBaseImage) {
            try {
                const baseImg = await loadImage(activeBaseImage)
                
                // Fit image nicely into canvas preserving aspect ratio
                const hRatio = canvas.width / baseImg.width
                const vRatio = canvas.height / baseImg.height
                const ratio = Math.min(hRatio, vRatio)
                const centerShiftX = (canvas.width - baseImg.width * ratio) / 2
                const centerShiftY = (canvas.height - baseImg.height * ratio) / 2

                ctx.drawImage(
                    baseImg,
                    0, 0, baseImg.width, baseImg.height,
                    centerShiftX, centerShiftY, baseImg.width * ratio, baseImg.height * ratio
                )
            } catch {
                ctx.fillStyle = '#0f172a'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            }
        } else {
            // Draw clean dark workspace background when no photo is active yet
            ctx.fillStyle = '#090e17'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        // Sort clothing overlays by zIndex
        const sortedOverlays = [...overlays].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

        // 2. Render each clothing overlay with soft 2.5D ambient drop-shadow
        for (const item of sortedOverlays) {
            try {
                const img = await loadImage(item.imageSrc)
                ctx.save()
                ctx.globalAlpha = item.opacity !== undefined ? item.opacity : 1.0

                // 2.5D Soft Clothing Drop Shadow over person's body
                ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
                ctx.shadowBlur = 12
                ctx.shadowOffsetY = 6

                const centerX = item.x + item.width / 2
                const centerY = item.y + item.height / 2

                ctx.translate(centerX, centerY)
                ctx.rotate(((item.rotation || 0) * Math.PI) / 180)

                const drawW = item.width * (item.scale || 1)
                const drawH = item.height * (item.scale || 1)

                ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)

                // Remove shadow for bounding box & controls
                ctx.shadowColor = 'transparent'

                // 3. Visual bounding box & control handles for selected overlay
                if (item.id === selectedOverlayId) {
                    ctx.strokeStyle = '#38bdf8'
                    ctx.lineWidth = 2
                    ctx.setLineDash([5, 5])
                    ctx.strokeRect(-drawW / 2 - 4, -drawH / 2 - 4, drawW + 8, drawH + 8)

                    // Corner Control Handles
                    ctx.setLineDash([])
                    ctx.fillStyle = '#2563eb'
                    const s = 8
                    ctx.fillRect(-drawW / 2 - 8, -drawH / 2 - 8, s, s)
                    ctx.fillRect(drawW / 2, -drawH / 2 - 8, s, s)
                    ctx.fillRect(-drawW / 2 - 8, drawH / 2, s, s)
                    ctx.fillRect(drawW / 2, drawH / 2, s, s)

                    // Top Rotation Handle
                    ctx.beginPath()
                    ctx.moveTo(0, -drawH / 2 - 4)
                    ctx.lineTo(0, -drawH / 2 - 20)
                    ctx.strokeStyle = '#38bdf8'
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.arc(0, -drawH / 2 - 20, 6, 0, 2 * Math.PI)
                    ctx.fillStyle = '#38bdf8'
                    ctx.fill()
                }

                ctx.restore()
            } catch (err) {
                console.error('Canvas overlay render error:', item.name, err)
            }
        }
    }, [activeBaseImage, overlays, selectedOverlayId])

    useEffect(() => {
        drawCanvas()
    }, [drawCanvas])

    // ── Add Clothing Item Overlay with Body-Aware Positioning ──
    const addOverlay = (item) => {
        const canvas = canvasRef.current
        const canvasW = canvas ? canvas.width : 440
        const canvasH = canvas ? canvas.height : 560

        // Body-aware positioning based on normalized metadata anchor coordinates
        const itemW = item.defaultW || 220
        const itemH = item.defaultH || 220
        const posNorm = item.defaultPosition || { x: 0.5, y: 0.28 }
        const initialScale = item.defaultScale || 0.85

        const initialX = (canvasW * posNorm.x) - ((itemW * initialScale) / 2)
        const initialY = (canvasH * posNorm.y) - ((itemH * initialScale) / 3)

        const newOverlay = {
            id: 'ov-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            name: item.name,
            category: item.category,
            imageSrc: item.imageSrc,
            x: initialX,
            y: initialY,
            width: itemW,
            height: itemH,
            scale: initialScale,
            rotation: 0,
            opacity: 1,
            zIndex: overlays.length + 1,
        }
        setOverlays((prev) => [...prev, newOverlay])
        setSelectedOverlayId(newOverlay.id)
        showStatus(`Added ${item.name} to your outfit!`, 'success')
    }

    // ── Canvas Drag & Touch Handlers ──
    const getCanvasCoordinates = (e) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY

        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        }
    }

    const handleCanvasMouseDown = (e) => {
        const { x, y } = getCanvasCoordinates(e)
        const sortedOverlays = [...overlays].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
        const clicked = sortedOverlays.find((item) => {
            const drawW = item.width * (item.scale || 1)
            const drawH = item.height * (item.scale || 1)
            return (
                x >= item.x &&
                x <= item.x + drawW &&
                y >= item.y &&
                y <= item.y + drawH
            )
        })

        if (clicked) {
            setSelectedOverlayId(clicked.id)
            isDraggingRef.current = true
            dragStartRef.current = { x: x - clicked.x, y: y - clicked.y }
        } else {
            setSelectedOverlayId(null)
        }
    }

    const handleCanvasMouseMove = (e) => {
        if (!isDraggingRef.current || !selectedOverlayId) return
        const { x, y } = getCanvasCoordinates(e)
        const newX = x - dragStartRef.current.x
        const newY = y - dragStartRef.current.y

        setOverlays((prev) =>
            prev.map((item) =>
                item.id === selectedOverlayId ? { ...item, x: newX, y: newY } : item
            )
        )
    }

    const handleCanvasMouseUp = () => {
        isDraggingRef.current = false
    }

    // Transform Updates
    const updateSelectedOverlay = (key, value) => {
        if (!selectedOverlayId) return
        setOverlays((prev) =>
            prev.map((item) =>
                item.id === selectedOverlayId ? { ...item, [key]: value } : item
            )
        )
    }

    const resetSelectedOverlay = () => {
        if (!selectedOverlayId) return
        setOverlays((prev) =>
            prev.map((item) =>
                item.id === selectedOverlayId
                    ? { ...item, scale: 0.85, rotation: 0, opacity: 1 }
                    : item
            )
        )
    }

    const deleteSelectedOverlay = () => {
        if (!selectedOverlayId) return
        setOverlays((prev) => prev.filter((item) => item.id !== selectedOverlayId))
        setSelectedOverlayId(null)
        showStatus('Removed item from try-on outfit.', 'info')
    }

    // ── Photo Upload & Camera Handlers ──
    const handlePersonPhotoUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (evt) => {
            setUserPhoto(evt.target.result)
            setIsDemoMode(false)
            showStatus('Your photo has been set as the main try-on model!', 'success')
        }
        reader.readAsDataURL(file)
    }

    const startCamera = async () => {
        try {
            setShowCameraModal(true)
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 720 }, height: { ideal: 960 }, facingMode: 'user' },
            })
            setCameraStream(stream)
            if (videoRef.current) videoRef.current.srcObject = stream
        } catch {
            showStatus('Camera permission denied or camera unequipped.', 'error')
            setShowCameraModal(false)
        }
    }

    const captureCameraPhoto = () => {
        if (!videoRef.current) return
        const video = videoRef.current
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = video.videoWidth || 640
        tempCanvas.height = video.videoHeight || 800
        const ctx = tempCanvas.getContext('2d')
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height)
        const capturedSrc = tempCanvas.toDataURL('image/png')
        setUserPhoto(capturedSrc)
        setIsDemoMode(false)
        stopCamera()
        showStatus('Captured camera photo set as your main model!', 'success')
    }

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((t) => t.stop())
            setCameraStream(null)
        }
        setShowCameraModal(false)
    }

    // ── Upload Custom Clothing ──
    const handleClothingUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (evt) => {
            const rawSrc = evt.target.result
            const img = new Image()
            img.onload = () => {
                const tempCanvas = document.createElement('canvas')
                tempCanvas.width = img.width
                tempCanvas.height = img.height
                const tCtx = tempCanvas.getContext('2d')
                tCtx.drawImage(img, 0, 0)
                const imgData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
                const data = imgData.data

                // Transparentize bright white pixels
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i] > 238 && data[i + 1] > 238 && data[i + 2] > 238) {
                        data[i + 3] = 0
                    }
                }
                tCtx.putImageData(imgData, 0, 0)
                const customItem = {
                    id: 'custom-' + Date.now(),
                    name: file.name.replace(/\.[^/.]+$/, ''),
                    category: 'Custom Upload',
                    imageSrc: tempCanvas.toDataURL('image/png'),
                    defaultW: 220, defaultH: 220,
                    defaultPosition: { x: 0.5, y: 0.3 },
                    defaultScale: 0.85,
                }
                addOverlay(customItem)
            }
            img.src = rawSrc
        }
        reader.readAsDataURL(file)
    }

    // ── Export & Save Handlers ──
    const handleDownloadPNG = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        setSelectedOverlayId(null)
        setTimeout(() => {
            drawCanvas().then(() => {
                const dataUrl = canvas.toDataURL('image/png')
                const link = document.createElement('a')
                link.download = `Style-A-Silhouette-TryOn-${Date.now()}.png`
                link.href = dataUrl
                link.click()
                showStatus('Exported Try-On outfit PNG!', 'success')
            })
        }, 50)
    }

    const handleSaveTryOn = async () => {
        const canvas = canvasRef.current
        if (!canvas) return
        setSaving(true)
        try {
            setSelectedOverlayId(null)
            await drawCanvas()
            const resultImage = canvas.toDataURL('image/png')
            const payload = {
                title: `Try-On Look ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                baseImage: activeBaseImage,
                clothingItems: overlays,
                resultImage,
            }
            const res = await axios.post('/api/virtual-tryon/save', payload)
            if (res.data && res.data.success) {
                showStatus('Saved Try-On look to your studio history!', 'success')
                fetchHistory()
            }
        } catch (err) {
            showStatus(err?.response?.data?.message || 'Failed to save look.', 'error')
        } finally {
            setSaving(false)
        }
    }

    const showStatus = (text, type = 'info') => {
        setStatusMsg({ text, type })
        setTimeout(() => setStatusMsg({ text: '', type: '' }), 4000)
    }

    // Filtered lists
    const filteredWardrobe = FASHION_LIBRARY.filter((item) => {
        const matchCat = leftCat === 'All' || item.category === leftCat
        const matchSearch = item.name.toLowerCase().includes(leftSearch.toLowerCase())
        return matchCat && matchSearch
    })

    const filteredLibrary = FASHION_LIBRARY.filter((item) => {
        const matchCat = rightCat === 'All' || item.category === rightCat
        const matchSearch = item.name.toLowerCase().includes(rightSearch.toLowerCase())
        return matchCat && matchSearch
    })

    return (
        <div style={{ padding: '28px 36px', background: '#0b1320', minHeight: '100vh', color: '#f8fafc', position: 'relative', zIndex: 1 }}>
            
            {/* ── HEADER & MODE SWITCHER ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                        Virtual Try-On
                    </h1>
                    <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                        Try on your favorite outfits with our 2D / 2.5D & 3D styling technology.
                    </p>
                </div>

                {/* Mode Switcher Toggle */}
                <div style={{ display: 'flex', background: '#1e293b', padding: '4px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <button
                        onClick={() => setMode('2D')}
                        style={{
                            padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                            background: mode === '2D' ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'transparent',
                            color: mode === '2D' ? '#ffffff' : '#94a3b8', transition: 'all 0.2s',
                        }}
                    >
                        2D Try-On
                    </button>
                    <button
                        onClick={() => setMode('3D')}
                        style={{
                            padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                            background: mode === '3D' ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'transparent',
                            color: mode === '3D' ? '#ffffff' : '#94a3b8', transition: 'all 0.2s',
                        }}
                    >
                        3D Try-On
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            {statusMsg.text && (
                <div style={{
                    padding: '12px 20px', marginBottom: '20px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                    background: statusMsg.type === 'error' ? '#7f1d1d' : statusMsg.type === 'success' ? '#14532d' : '#1e293b',
                    color: '#ffffff', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <span>{statusMsg.text}</span>
                </div>
            )}

            {/* ── 3-COLUMN MAIN LAYOUT ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '310px 1fr 340px', gap: '20px', alignItems: 'start' }}>
                
                {/* ════════════════════════════════════════════════════════════
                   LEFT COLUMN: 1. Your Photo & 2. Choose Clothing
                ════════════════════════════════════════════════════════════ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* SECTION 1: YOUR PHOTO */}
                    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>1. Your Photo</span>
                            {userPhoto && (
                                <span style={{ fontSize: '10px', color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                                    ✓ Active Model
                                </span>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                            <label style={{
                                padding: '10px', background: '#2563eb', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                                color: '#ffffff', textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}>
                                <span>↑ Upload Photo</span>
                                <input type="file" accept="image/*" onChange={handlePersonPhotoUpload} style={{ display: 'none' }} />
                            </label>
                            <button onClick={startCamera} style={{
                                padding: '10px', background: '#334155', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                                color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}>
                                📷 Use Camera
                            </button>
                        </div>

                        {/* Photo Display Card */}
                        {userPhoto ? (
                            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '220px', background: '#0f172a', border: '2px solid #2563eb' }}>
                                <img src={userPhoto} alt="User Base" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <button
                                    onClick={() => setUserPhoto(null)}
                                    title="Remove Photo"
                                    style={{
                                        position: 'absolute', top: '8px', right: '8px', width: '26px', height: '26px', borderRadius: '50%',
                                        background: 'rgba(15,23,42,0.85)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                    }}
                                >
                                    ✕
                                </button>
                                <button
                                    onClick={() => {
                                        const input = document.createElement('input')
                                        input.type = 'file'
                                        input.accept = 'image/*'
                                        input.onchange = handlePersonPhotoUpload
                                        input.click()
                                    }}
                                    style={{
                                        position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
                                        padding: '6px 14px', background: 'rgba(15,23,42,0.9)', border: '1px solid #475569',
                                        borderRadius: '20px', color: '#cbd5e1', fontSize: '10px', fontWeight: 500, cursor: 'pointer'
                                    }}
                                >
                                    ↺ Change Photo
                                </button>
                            </div>
                        ) : (
                            <div style={{
                                padding: '24px 16px', borderRadius: '8px', background: '#0f172a', border: '1px dashed #475569',
                                textAlign: 'center', color: '#94a3b8', fontSize: '12px'
                            }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
                                <div style={{ marginBottom: '10px' }}>Upload or capture your photo to start your personalized virtual try-on</div>
                                <button
                                    onClick={() => setIsDemoMode(!isDemoMode)}
                                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    {isDemoMode ? 'Hide Demo Model' : 'Or view Demo Model'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: CHOOSE CLOTHING */}
                    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginBottom: '12px' }}>
                            2. Choose Clothing
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <button
                                onClick={() => setLeftTab('wardrobe')}
                                style={{
                                    flex: 1, padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
                                    background: leftTab === 'wardrobe' ? '#2563eb' : '#0f172a', color: '#ffffff'
                                }}
                            >
                                ◫ My Wardrobe
                            </button>
                            <label style={{
                                flex: 1, padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
                                background: leftTab === 'upload' ? '#2563eb' : '#0f172a', color: '#ffffff', textAlign: 'center'
                            }}>
                                ↑ Upload
                                <input type="file" accept="image/*" onChange={handleClothingUpload} style={{ display: 'none' }} />
                            </label>
                        </div>

                        {/* Search Input */}
                        <div style={{ marginBottom: '12px' }}>
                            <input
                                type="text"
                                placeholder="Search clothes..."
                                value={leftSearch}
                                onChange={(e) => setLeftSearch(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155',
                                    borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none'
                                }}
                            />
                        </div>

                        {/* Category Filters */}
                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '12px' }}>
                            {['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setLeftCat(cat)}
                                    style={{
                                        padding: '4px 10px', borderRadius: '14px', fontSize: '10px', fontWeight: 500, border: 'none', cursor: 'pointer',
                                        whiteSpace: 'nowrap', background: leftCat === cat ? '#2563eb' : '#0f172a', color: leftCat === cat ? '#ffffff' : '#94a3b8'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Wardrobe Items Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                            {filteredWardrobe.map((item) => {
                                const isSelected = overlays.some((o) => o.name === item.name)
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => addOverlay(item)}
                                        style={{
                                            padding: '8px', background: '#0f172a', border: isSelected ? '2px solid #3b82f6' : '1px solid #334155',
                                            borderRadius: '8px', cursor: 'pointer', position: 'relative', textAlign: 'center', transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                            <img src={item.imageSrc} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <div style={{ fontSize: '9px', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.name}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════
                   CENTER WORKSPACE: USER PHOTO TRY-ON PREVIEW WORKSPACE
                ════════════════════════════════════════════════════════════ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Central Workspace Container */}
                    <div style={{
                        background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '16px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative'
                    }}>
                        {/* Top Canvas Header Bar */}
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {mode === '3D' ? 'REALISTIC 3D HUMAN AVATAR' : userPhoto ? 'YOUR PHOTO TRY-ON' : isDemoMode ? 'DEMO MODEL PREVIEW' : 'TRY-ON WORKSPACE'}
                                </span>
                                {mode === '3D' ? (
                                    <span style={{ fontSize: '9px', background: '#2563eb', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                                        3D MODEL ACTIVE
                                    </span>
                                ) : userPhoto ? (
                                    <span style={{ fontSize: '9px', background: '#2563eb', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                                        REAL PHOTO ACTIVE
                                    </span>
                                ) : null}
                            </div>

                            {mode === '3D' ? (
                                /* 3D Camera Preset View Controls */
                                <div style={{ display: 'flex', gap: '4px', background: '#1e293b', padding: '2px', borderRadius: '6px', border: '1px solid #334155' }}>
                                    {['Front', 'Back', 'Left', 'Right', 'Reset'].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setThreeView(v)}
                                            style={{
                                                padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, border: 'none', cursor: 'pointer',
                                                background: threeView === v ? '#2563eb' : 'transparent',
                                                color: threeView === v ? '#ffffff' : '#94a3b8', transition: 'all 0.15s'
                                            }}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        setOverlays([])
                                        setSelectedOverlayId(null)
                                        showStatus('Cleared outfit canvas.', 'info')
                                    }}
                                    style={{
                                        padding: '6px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px',
                                        color: '#cbd5e1', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                                    }}
                                >
                                    ↺ Reset Canvas
                                </button>
                            )}
                        </div>

                        {/* Central Viewing Area: 3D Model vs 2D Canvas */}
                        {mode === '3D' ? (
                            <div style={{ position: 'relative', width: '100%', maxWidth: '440px', height: '560px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e293b' }}>
                                <Avatar3D activeView={threeView} selectedClothing={selectedOverlay} />
                            </div>
                        ) : (
                            <div style={{ position: 'relative', width: '100%', maxWidth: '440px', background: '#020617', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e293b' }}>
                                
                                {/* Empty Canvas Overlay Prompt if no photo uploaded */}
                                {!activeBaseImage && (
                                    <div style={{
                                        position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center',
                                        background: 'rgba(2,6,23,0.92)'
                                    }}>
                                        <div style={{ fontSize: '42px', marginBottom: '12px' }}>📸</div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                                            Upload Your Photo to Start
                                        </h3>
                                        <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px', maxWidth: '300px' }}>
                                            Upload a full-body photo or capture one using your camera to preview clothing on your actual body!
                                        </p>

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <label style={{ padding: '10px 18px', background: '#2563eb', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                                Upload Photo
                                                <input type="file" accept="image/*" onChange={handlePersonPhotoUpload} style={{ display: 'none' }} />
                                            </label>
                                            <button onClick={startCamera} style={{ padding: '10px 18px', background: '#334155', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                                📷 Use Camera
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <canvas
                                    ref={canvasRef}
                                    width={440}
                                    height={560}
                                    onMouseDown={handleCanvasMouseDown}
                                    onMouseMove={handleCanvasMouseMove}
                                    onMouseUp={handleCanvasMouseUp}
                                    onTouchStart={handleCanvasMouseDown}
                                    onTouchMove={handleCanvasMouseMove}
                                    onTouchEnd={handleCanvasMouseUp}
                                    style={{ display: 'block', width: '100%', height: 'auto', cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
                                />

                                {/* Floating Vertical Right Toolbar */}
                                <div style={{
                                    position: 'absolute', top: '16px', right: '16px', background: 'rgba(15,23,42,0.9)',
                                    backdropFilter: 'blur(8px)', border: '1px solid #334155', borderRadius: '8px',
                                    display: 'flex', flexDirection: 'column', padding: '6px', gap: '10px', zIndex: 12
                                }}>
                                    <button
                                        onClick={() => updateSelectedOverlay('scale', Math.min(3.0, (selectedOverlay?.scale || 1) + 0.1))}
                                        title="Move / Scale Up"
                                        style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
                                    >
                                        <span style={{ fontSize: '16px' }}>⤢</span>
                                        <span style={{ fontSize: '8px' }}>Move</span>
                                    </button>
                                    <button
                                        onClick={() => updateSelectedOverlay('scale', Math.min(3.0, (selectedOverlay?.scale || 1) + 0.1))}
                                        title="Scale Up"
                                        style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
                                    >
                                        <span style={{ fontSize: '16px' }}>⛶</span>
                                        <span style={{ fontSize: '8px' }}>Scale</span>
                                    </button>
                                    <button
                                        onClick={() => updateSelectedOverlay('rotation', ((selectedOverlay?.rotation || 0) + 15) % 360)}
                                        title="Rotate"
                                        style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
                                    >
                                        <span style={{ fontSize: '16px' }}>↺</span>
                                        <span style={{ fontSize: '8px' }}>Rotate</span>
                                    </button>
                                    <button
                                        onClick={deleteSelectedOverlay}
                                        title="Delete Layer"
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
                                    >
                                        <span style={{ fontSize: '16px' }}>🗑</span>
                                        <span style={{ fontSize: '8px' }}>Delete</span>
                                    </button>
                                    <button
                                        onClick={resetSelectedOverlay}
                                        title="Reset Layer"
                                        style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
                                    >
                                        <span style={{ fontSize: '16px' }}>↺</span>
                                        <span style={{ fontSize: '8px' }}>Reset</span>
                                    </button>
                                </div>

                                {/* Floating bottom opacity slider if item selected */}
                                {selectedOverlay && (
                                    <div style={{
                                        position: 'absolute', bottom: '12px', left: '16px', right: '16px', background: 'rgba(15,23,42,0.9)',
                                        backdropFilter: 'blur(8px)', border: '1px solid #334155', borderRadius: '6px', padding: '8px 12px',
                                        display: 'flex', alignItems: 'center', gap: '10px', zIndex: 12
                                    }}>
                                        <span style={{ fontSize: '10px', color: '#94a3b8', whiteSpace: 'nowrap' }}>Opacity:</span>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1.0"
                                            step="0.05"
                                            value={selectedOverlay.opacity ?? 1}
                                            onChange={(e) => updateSelectedOverlay('opacity', parseFloat(e.target.value))}
                                            style={{ flex: 1, accentColor: '#2563eb' }}
                                        />
                                        <span style={{ fontSize: '10px', color: '#38bdf8', minWidth: '30px' }}>
                                            {Math.round((selectedOverlay.opacity ?? 1) * 100)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bottom Thumbnail Carousel */}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '6px', border: '1px solid #334155', background: '#020617',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }} onClick={() => setOverlays([])}>
                                {userPhoto ? (
                                    <img src={userPhoto} alt="Original" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>Original</span>
                                )}
                            </div>
                            {savedHistory.slice(0, 3).map((hist, i) => (
                                <div key={hist._id} style={{
                                    width: '60px', height: '60px', borderRadius: '6px', border: '1px solid #2563eb', background: '#020617',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden'
                                }}>
                                    <img src={hist.resultImage} alt={`TryOn ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Tips Banner */}
                    <div style={{
                        background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px 16px',
                        display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#94a3b8'
                    }}>
                        <span style={{ fontSize: '16px', color: '#38bdf8' }}>💡</span>
                        <div>
                            <strong style={{ color: '#f8fafc' }}>Quick Tips:</strong> Upload a clear front-facing photo • Selected clothing automatically aligns to your body • Fine-tune size & position for a perfect fit.
                        </div>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════
                   RIGHT COLUMN: EXPLORE MORE STYLES & SAVE/DOWNLOAD
                ════════════════════════════════════════════════════════════ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* EXPLORE MORE STYLES FASHION LIBRARY */}
                    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginBottom: '12px' }}>
                            Explore More Styles
                        </div>

                        {/* Search Bar */}
                        <div style={{ marginBottom: '12px' }}>
                            <input
                                type="text"
                                placeholder="Search fashion library..."
                                value={rightSearch}
                                onChange={(e) => setRightSearch(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155',
                                    borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none'
                                }}
                            />
                        </div>

                        {/* Category Pills */}
                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '14px' }}>
                            {CATEGORY_FILTERS.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setRightCat(cat)}
                                    style={{
                                        padding: '4px 10px', borderRadius: '14px', fontSize: '10px', fontWeight: 500, border: 'none', cursor: 'pointer',
                                        whiteSpace: 'nowrap', background: rightCat === cat ? '#2563eb' : '#0f172a', color: rightCat === cat ? '#ffffff' : '#94a3b8'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* 4-Column Fashion Items Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                            {filteredLibrary.map((item) => {
                                const isSelected = overlays.some((o) => o.name === item.name)
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => addOverlay(item)}
                                        style={{
                                            padding: '8px', background: '#0f172a', border: isSelected ? '2px solid #2563eb' : '1px solid #334155',
                                            borderRadius: '8px', cursor: 'pointer', position: 'relative', textAlign: 'center', transition: 'all 0.2s'
                                        }}
                                    >
                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%',
                                                background: '#2563eb', color: '#ffffff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                ✓
                                            </div>
                                        )}

                                        <div style={{ height: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                            <img src={item.imageSrc} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* BOTTOM ACTION BUTTONS */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <button
                            onClick={handleSaveTryOn}
                            disabled={saving}
                            style={{
                                padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
                                color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <span>💾</span>
                            <span>{saving ? 'Saving...' : 'Save Try-On'}</span>
                        </button>
                        <button
                            onClick={handleDownloadPNG}
                            style={{
                                padding: '12px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', border: 'none',
                                borderRadius: '8px', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
                            }}
                        >
                            <span>📥</span>
                            <span>Download</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* ── LIVE CAMERA MODAL ── */}
            {showCameraModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>Camera Capture</h3>
                        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>Position yourself in the frame for optimal try-on preview.</p>

                        <div style={{ width: '100%', height: '320px', background: '#020617', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={captureCameraPhoto} style={{ padding: '10px 24px', background: '#2563eb', border: 'none', borderRadius: '6px', color: '#ffffff', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                                📸 Capture Photo
                            </button>
                            <button onClick={stopCamera} style={{ padding: '10px 20px', background: '#334155', border: 'none', borderRadius: '6px', color: '#ffffff', fontWeight: 500, fontSize: '12px', cursor: 'pointer' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 3D TRY-ON INFORMATIONAL MODAL ── */}
            {show3DNotice && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '28px', borderRadius: '12px', width: '90%', maxWidth: '440px', textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📐</div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>2D / 2.5D Cutout Mode Active</h3>
                        <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '20px' }}>
                            Full 3D body mesh modeling is reserved for future hardware extension. Style-A-Silhouette provides high-speed, instant 2D / 2.5D cutout-based multi-layer try-on composition.
                        </p>
                        <button
                            onClick={() => {
                                setMode('2D')
                                setShow3DNotice(false)
                            }}
                            style={{ padding: '10px 28px', background: '#2563eb', border: 'none', borderRadius: '6px', color: '#ffffff', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                        >
                            Continue in 2D / 2.5D Mode
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
