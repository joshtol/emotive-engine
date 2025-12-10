/**
 * Local Development Server
 * Serves the site directory on localhost:5000 with proper headers for ES modules
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { gzipSync } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_DIR = join(__dirname, '../site');

const PORT = 3000;

// Cache duration in seconds for different file types
const getCacheHeaders = ext => {
    const cacheHeaders = {};
    
    // Static assets - long cache
    if (['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.wav', '.mp3'].includes(ext)) {
        cacheHeaders['Cache-Control'] = 'public, max-age=31536000, immutable'; // 1 year
        cacheHeaders['Expires'] = new Date(Date.now() + 31536000000).toUTCString(); // 1 year
    }
    // HTML files - short cache
    else if (ext === '.html') {
        cacheHeaders['Cache-Control'] = 'public, max-age=300'; // 5 minutes
        cacheHeaders['Expires'] = new Date(Date.now() + 300000).toUTCString(); // 5 minutes
    }
    // JSON files - medium cache
    else if (ext === '.json') {
        cacheHeaders['Cache-Control'] = 'public, max-age=3600'; // 1 hour
        cacheHeaders['Expires'] = new Date(Date.now() + 3600000).toUTCString(); // 1 hour
    }
    // Default - no cache
    else {
        cacheHeaders['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        cacheHeaders['Pragma'] = 'no-cache';
        cacheHeaders['Expires'] = '0';
    }
    
    return cacheHeaders;
};

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = createServer((req, res) => {
    // Remove query parameters from URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const {pathname} = url;
    
    let filePath = join(SITE_DIR, pathname === '/' ? '/index.html' : pathname);

    // Security: prevent directory traversal
    if (!filePath.startsWith(SITE_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    // Check if file exists, or try public/ directory (matches Next.js behavior)
    if (!existsSync(filePath)) {
        // Try public/ directory for static assets
        const publicPath = join(SITE_DIR, 'public', pathname);
        if (existsSync(publicPath)) {
            filePath = publicPath;
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }
    }
    
    try {
        const ext = extname(filePath);
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        
        // Get cache headers based on file type
        const cacheHeaders = getCacheHeaders(ext);
        
        // Set headers for ES modules, Firebase auth, and caching
        const headers = {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Frame-Options': 'SAMEORIGIN',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            ...cacheHeaders
        };
        
        // Special headers for JavaScript files to support ES modules
        if (ext === '.js') {
            headers['Content-Type'] = 'text/javascript; charset=utf-8';
        }
        
        // Read file content
        let fileContent = readFileSync(filePath);
        
        // Apply gzip compression for text-based files
        const shouldCompress = ['text/html', 'text/css', 'text/javascript', 'application/json'].includes(contentType);
        if (shouldCompress && fileContent.length > 1024) { // Only compress files > 1KB
            const compressed = gzipSync(fileContent);
            if (compressed.length < fileContent.length) {
                fileContent = compressed;
                headers['Content-Encoding'] = 'gzip';
                headers['Content-Length'] = compressed.length;
            }
        }
        
        res.writeHead(200, headers);
        res.end(fileContent);
        
    } catch (error) {
        console.error('Error serving file:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
});

server.listen(PORT, () => {
    console.log('🚀 Local development server running at:');
    console.log(`   http://localhost:${PORT}`);
    console.log(`   http://127.0.0.1:${PORT}`);
    console.log(`\n📁 Serving files from: ${SITE_DIR}`);
    console.log('\n🔥 Firebase integration ready');
    console.log('\nPress Ctrl+C to stop the server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down local server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});
